// ===== STONKS 9800 - Stage 03 - Events & News =====

// Debug flag - set to true to trace tier filtering
const DEBUG_TIER_FILTERING = false;

// Helper: Check if an event type is enabled based on tier settings
// Uses gameSettings.enabledEvents which is populated from EVENT_TIERS defaults
function isEventTypeEnabled(eventType) {
  let result = true;
  let source = 'default (fallback)';
  
  // Check gameSettings first (populated in app.js from tier defaults)
  if (typeof gameSettings !== 'undefined' && gameSettings.enabledEvents) {
    result = gameSettings.enabledEvents[eventType] !== false;
    source = `gameSettings.enabledEvents[${eventType}] = ${gameSettings.enabledEvents[eventType]}`;
  }
  // Fallback: use isEventEnabled from tutorial.js if available
  else if (typeof isEventEnabled === 'function') {
    result = isEventEnabled(eventType);
    source = `isEventEnabled() function returned ${result}`;
  }
  
  if (DEBUG_TIER_FILTERING) {
    // Log Tier 3-4 events that are being checked
    const tier34Events = ['analyst', 'capitulation', 'tax_loss_harvesting', 'basic_news', 
      'sector_rotation', 'dividend_trap', 'gap_up', 'gap_down', 'circuit_breaker', 
      'unusual_volume', 'correlation_breakdown', 'liquidity_crisis', 'window_dressing', 
      'earnings_whisper', 'wash_trading', 'options_gamma'];
    
    if (tier34Events.includes(eventType)) {
      console.log(`[TIER DEBUG] isEventTypeEnabled('${eventType}'): ${result} | Source: ${source}`);
      if (result) {
        console.warn(`[TIER WARNING] Tier 3-4 event '${eventType}' is ENABLED - should be disabled by default!`);
        if (typeof gameSettings !== 'undefined') {
          console.log(`[TIER DEBUG] gameSettings.enabledEvents:`, JSON.stringify(gameSettings.enabledEvents, null, 2));
        } else {
          console.warn(`[TIER DEBUG] gameSettings is undefined!`);
        }
      }
    }
  }
  
  return result;
}

// Weighted random selection
function weightedRandomChoice(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight || 1;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

// Check if a new event conflicts with existing today's news
// Returns true if can add (no conflict), false if conflicts
function canAddNews(newEvent, targetStock = null) {
  if (!newEvent || !newEvent.id) return true; // No ID = no conflict checking
  
  for (const existing of todayNews) {
    if (!existing.eventId) continue; // Skip news without event IDs
    
    // Check if new event conflicts with existing
    if (newEvent.conflictsWith && newEvent.conflictsWith.includes(existing.eventId)) {
      // For stock-specific events: only conflict if same stock or market-wide
      if (targetStock && existing.relatedStock && targetStock !== existing.relatedStock) {
        continue; // Different stocks, no conflict
      }
      return false; // Conflict found
    }
    
    // Check reverse: does existing event's conflicts include this new event?
    // We need to look up the original event definition
    const existingEvent = findEventById(existing.eventId);
    if (existingEvent && existingEvent.conflictsWith && existingEvent.conflictsWith.includes(newEvent.id)) {
      if (targetStock && existing.relatedStock && targetStock !== existing.relatedStock) {
        continue;
      }
      return false; // Conflict found
    }
  }
  return true; // No conflicts
}

// Helper to find event definition by ID across all event categories
function findEventById(eventId) {
  // Check market events
  for (const event of NEWS_EVENTS.market.positive) {
    if (event.id === eventId) return event;
  }
  for (const event of NEWS_EVENTS.market.negative) {
    if (event.id === eventId) return event;
  }
  // Check eps_driven events
  for (const event of NEWS_EVENTS.eps_driven.positive) {
    if (event.id === eventId) return event;
  }
  for (const event of NEWS_EVENTS.eps_driven.negative) {
    if (event.id === eventId) return event;
  }
  // Check sentiment events
  for (const event of NEWS_EVENTS.sentiment.positive) {
    if (event.id === eventId) return event;
  }
  for (const event of NEWS_EVENTS.sentiment.negative) {
    if (event.id === eventId) return event;
  }
  for (const event of NEWS_EVENTS.sentiment.neutral) {
    if (event.id === eventId) return event;
  }
  // Check hybrid events
  for (const event of NEWS_EVENTS.hybrid.positive) {
    if (event.id === eventId) return event;
  }
  for (const event of NEWS_EVENTS.hybrid.negative) {
    if (event.id === eventId) return event;
  }
  return null;
}

function generateDailyNews() {
  todayNews = [];
  
  // ========== DEBUG: Log tier filtering state at start of day ==========
  if (DEBUG_TIER_FILTERING) {
    console.log('========== generateDailyNews() START ==========');
    console.log('[TIER DEBUG] Day:', typeof gameState !== 'undefined' ? gameState.day : 'gameState undefined');
    console.log('[TIER DEBUG] gameSettings defined:', typeof gameSettings !== 'undefined');
    if (typeof gameSettings !== 'undefined') {
      console.log('[TIER DEBUG] gameSettings.enabledEvents defined:', typeof gameSettings.enabledEvents !== 'undefined');
      if (gameSettings.enabledEvents) {
        console.log('[TIER DEBUG] basic_news enabled:', gameSettings.enabledEvents.basic_news);
        console.log('[TIER DEBUG] sector_rotation enabled:', gameSettings.enabledEvents.sector_rotation);
        console.log('[TIER DEBUG] analyst enabled:', gameSettings.enabledEvents.analyst);
      }
    }
  }
  
  // ========== TIER-FILTERED EVENT CHECKS ==========
  // Events are only generated if their tier is enabled in gameSettings.enabledEvents
  // Tier 1-2: Enabled by default (educational, clear signals)
  // Tier 3-4: Disabled by default (harder to trade, less educational)
  
  // TIER 1: Highly Educational Events
  // Check for short seller report events (short_seller_report) - Tier 1
  if (isEventTypeEnabled('short_seller_report')) {
    checkShortSellerReportEvents();
  }
  
  // Check for insider trading events (insider_buying) - Tier 1
  if (isEventTypeEnabled('insider_buying')) {
    checkInsiderTradingEvents();
  }
  
  // Check for index rebalancing events (index_rebalancing) - Tier 1
  if (isEventTypeEnabled('index_rebalancing')) {
    checkIndexRebalancingEvents();
  }
  
  // TIER 2: Good Educational Events
  // Check for short squeeze triggers and news (short_squeeze) - Tier 2
  if (isEventTypeEnabled('short_squeeze')) {
    checkShortSqueezeEvents();
  }
  
  // Check for dead cat bounce / crash events (dead_cat_bounce) - Tier 2
  if (isEventTypeEnabled('dead_cat_bounce')) {
    checkCrashEvents();
  }
  
  // Check for executive replacement events (executive_change) - Tier 2
  // Different from CEO departure crash - this has successor announced = bounce pattern
  if (isEventTypeEnabled('executive_change')) {
    checkExecutiveChangeEvents();
  }
  
  // Check for strategic pivot/restructuring events (strategic_pivot) - Tier 2
  // "Unfavorable" announcements (layoffs, pivots, etc.) that recover in 2-3 weeks
  if (isEventTypeEnabled('strategic_pivot')) {
    checkStrategicPivotEvents();
  }
  
  // Check for FOMO rally news (fomo_rally) - Tier 2
  if (isEventTypeEnabled('fomo_rally')) {
    checkFOMOEvents();
  }
  
  // Check for stock split events (stock_split) - Tier 2
  if (isEventTypeEnabled('stock_split')) {
    checkStockSplitEvents();
  }
  
  // TIER 3: Moderate Educational Events
  // Check for manipulation catalyst events (institutional_manipulation) - Tier 3
  // Moved from Tier 1: Hard to detect in real life, ~40% success rate
  if (isEventTypeEnabled('institutional_manipulation')) {
    checkManipulationCatalysts();
  }
  
  // Check for analyst rating changes (analyst) - Tier 3
  if (isEventTypeEnabled('analyst')) {
    checkAnalystRatingEvents();
  }
  
  // Check for capitulation events (capitulation) - Tier 3
  if (isEventTypeEnabled('capitulation')) {
    checkCapitulationEvents();
  }
  
  // Check for tax loss harvesting (tax_loss_harvesting) - Tier 3
  if (isEventTypeEnabled('tax_loss_harvesting')) {
    checkTaxLossHarvestingEvents();
  }
  
  // TIER 4: Advanced/Random Events
  // Check for sector rotation (sector_rotation) - Tier 4
  if (isEventTypeEnabled('sector_rotation')) {
    checkSectorRotationEvents();
  }
  
  // Check for dividend trap (dividend_trap) - Tier 4
  if (isEventTypeEnabled('dividend_trap')) {
    checkDividendTrapEvents();
  }
  
  // Check for gap events (gap_up, gap_down) - Tier 4
  if (isEventTypeEnabled('gap_up') || isEventTypeEnabled('gap_down')) {
    checkGapEvents();
  }
  
  // Check for circuit breaker (circuit_breaker) - Tier 4
  if (isEventTypeEnabled('circuit_breaker')) {
    checkCircuitBreakerEvents();
  }
  
  // Check for unusual volume (unusual_volume) - Tier 4
  if (isEventTypeEnabled('unusual_volume')) {
    // Unusual volume is generated in manipulation/short squeeze sections
  }
  
  // Advanced phenomena - Tier 4 (disabled by default, lack clear telltales)
  if (isEventTypeEnabled('correlation_breakdown')) {
    checkCorrelationEvents();
  }
  if (isEventTypeEnabled('liquidity_crisis')) {
    checkLiquidityCrisisEvents();
  }
  if (isEventTypeEnabled('window_dressing')) {
    checkWindowDressingEvents();
  }
  if (isEventTypeEnabled('earnings_whisper')) {
    checkEarningsWhisperEvents();
  }
  
  // OPTIONS: Check for trading opportunities
  if (gameState.optionsUnlocked) {
    checkOptionOpportunities();
  }
  
  // Small chance to start a new manipulation scheme (5% daily) - Tier 3
  // Note: ~60% of schemes fail (SEC, fizzle, false positive) - teaches skepticism
  if (isEventTypeEnabled('institutional_manipulation') && Math.random() < 0.05) {
    const target = startInstitutionalScheme();
    if (target && isEventTypeEnabled('unusual_volume')) {
      // Generate manipulation accumulation news (looks like other unusual volume)
      generateUnusualVolumeNews(target, 'manipulation');
    }
  }
  
  // Chance to build short interest on a stock (3% daily) - Tier 2
  if (isEventTypeEnabled('short_squeeze') && Math.random() < 0.03) {
    const stock = randomChoice(stocks.filter(s => !s.shortSqueezePhase && s.shortInterest < 0.25));
    if (stock && startShortBuild(stock)) {
      generateShortInterestNews(stock, 'building');
    }
  }
  
  // Additional chance for LEGITIMATE unusual volume (10% daily) - red herrings - Tier 4
  if (isEventTypeEnabled('unusual_volume') && Math.random() < 0.10) {
    const stock = randomChoice(stocks.filter(s => !s.manipulationPhase));
    if (stock) {
      generateUnusualVolumeNews(stock, 'legitimate');
    }
  }
  
  const numNews = 1 + Math.floor(Math.random() * 3); // 1-3 news items
  
  // ========== BASIC DAILY NEWS ==========
  // These are eps_driven, sentiment, and hybrid news from NEWS_EVENTS
  // They lack educational telltales and are disabled by default (Tier 3-4 level complexity)
  // Only generate if 'basic_news' is explicitly enabled
  const basicNewsEnabled = isEventTypeEnabled('basic_news');
  
  for (let i = 0; i < numNews; i++) {
    // Skip basic news if disabled (default for educational mode)
    if (!basicNewsEnabled) continue;
    
    const roll = Math.random();
    
    if (roll < 0.15) {
      // 15% chance: Market-wide news
      generateMarketNews();
    } else if (roll < 0.40) {
      // 25% chance: EPS-driven news (fundamentals)
      generateEPSNews();
    } else if (roll < 0.70) {
      // 30% chance: Sentiment-only news
      generateSentimentNews();
    } else {
      // 30% chance: Hybrid news
      generateHybridNews();
    }
  }
  
  // Educational "quiet day" news when no Tier 1-2 events generated
  // Teaches players that not every day has actionable setups - patience is key
  if (todayNews.length === 0) {
    const quietDayNews = [
      {
        headline: "📚 Quiet day - no clear setups. Smart traders wait for opportunities.",
        description: "Not every day has actionable news. Patience is a trading edge. Review your watchlist and wait for Tier 1-2 signals.",
        sentiment: 'neutral'
      },
      {
        headline: "📚 Markets calm - no major catalysts today.",
        description: "Days without clear signals = days to stay on sidelines. Overtrading destroys returns. Wait for high-probability setups.",
        sentiment: 'neutral'
      },
      {
        headline: "📚 Light news day - good traders do nothing when there's nothing to do.",
        description: "Warren Buffett: 'The stock market transfers money from the active to the patient.' Wait for insider buying, squeezes, or bounces.",
        sentiment: 'neutral'
      },
      {
        headline: "📚 No actionable signals today. Time to review, not trade.",
        description: "Use quiet days to: 1) Review past trades, 2) Study patterns you missed, 3) Prepare watchlist for next catalyst.",
        sentiment: 'neutral'
      }
    ];
    
    const quietNews = randomChoice(quietDayNews);
    todayNews.push({
      headline: quietNews.headline,
      description: quietNews.description,
      sentiment: quietNews.sentiment,
      relatedStock: null,
      isMarketWide: true,
      newsType: 'quiet_day',
      isQuietDay: true,
      isEducational: true
    });
  }
  
  // Add timestamps and IDs
  todayNews.forEach(item => {
    item.timestamp = `Day ${gameState.day}`;
    item.id = Math.random().toString(36).substr(2, 9);
  });
  
  // NOTE: News archive update moved to app.js processNewDay() AFTER updateStockPrices()
  // This ensures bounce news generated in market.js is included
}

// Generate unusual volume news - some are manipulation, some are legitimate
function generateUnusualVolumeNews(stock, reason) {
  // Different types of unusual volume events
  const unusualVolumeTypes = {
    // === MANIPULATION (dangerous - pump incoming) ===
    manipulation: [
      {
        headline: `Unusual volume spike in ${stock.symbol}`,
        description: "Large block trades detected in dark pools.",
        clue: 'dark_pool', // Institutional hiding activity
        sentiment: 'neutral'
      },
      {
        headline: `${stock.symbol} seeing abnormal order flow`,
        description: "Concentrated buying from offshore accounts.",
        clue: 'offshore', // Suspicious origin
        sentiment: 'neutral'
      },
      {
        headline: `Options activity surges for ${stock.symbol}`,
        description: "Unusual call buying ahead of no scheduled events.",
        clue: 'no_catalyst', // No reason = suspicious
        sentiment: 'neutral'
      },
      {
        headline: `${stock.symbol} volume 3x average with no news`,
        description: "Source of buying pressure unknown.",
        clue: 'no_news', // No explanation = red flag
        sentiment: 'neutral'
      }
    ],
    
    // === LEGITIMATE (safe - normal institutional activity) ===
    legitimate: [
      {
        headline: `Index rebalancing drives ${stock.symbol} volume`,
        description: "Quarterly index reconstitution in progress.",
        clue: 'index_rebalance', // Known, scheduled event
        sentiment: 'neutral',
        effect: { sentimentShock: 0.01, snapbackDays: 2 }
      },
      {
        headline: `${stock.symbol} added to pension fund portfolio`,
        description: "Major retirement fund disclosed new position.",
        clue: 'disclosed', // Transparent = legitimate
        sentiment: 'positive',
        effect: { sentimentShock: 0.02, snapbackDays: 0 } // Slight permanent boost
      },
      {
        headline: `ETF inflows boost ${stock.symbol} volume`,
        description: "Passive fund buying matches sector allocation.",
        clue: 'etf_flow', // Mechanical, not speculative
        sentiment: 'neutral',
        effect: { sentimentShock: 0.01, snapbackDays: 1 }
      },
      {
        headline: `${stock.symbol} block trade at market close`,
        description: "Institutional cross reported to exchange.",
        clue: 'reported', // Officially reported = transparent
        sentiment: 'neutral',
        effect: { sentimentShock: 0, snapbackDays: 0 }
      },
      {
        headline: `Vanguard increases ${stock.symbol} stake to 5.1%`,
        description: "13F filing shows gradual accumulation over quarter.",
        clue: '13f_filing', // Legal disclosure = legitimate
        sentiment: 'positive',
        effect: { sentimentShock: 0.02, snapbackDays: 3 }
      },
      {
        headline: `${stock.symbol} volume surges on earnings date approach`,
        description: "Pre-earnings positioning by institutions.",
        clue: 'earnings_hedge', // Known catalyst = explainable
        sentiment: 'neutral',
        effect: { volatilityBoost: 0.2, duration: 3 }
      }
    ]
  };
  
  const pool = unusualVolumeTypes[reason];
  const event = randomChoice(pool);
  
  todayNews.push({
    headline: event.headline,
    description: event.description,
    sentiment: event.sentiment,
    relatedStock: stock.symbol,
    newsType: 'unusual_volume',
    volumeClue: event.clue,
    isManipulation: reason === 'manipulation',
    isAccumulation: reason === 'manipulation'
  });
  
  // Apply effect for legitimate volume (small, predictable impact)
  if (event.effect) {
    const memeMultiplier = getMemeMultiplier(stock);
    if (event.effect.sentimentShock) {
      stock.sentimentOffset += event.effect.sentimentShock * memeMultiplier;
    }
    if (event.effect.volatilityBoost) {
      stock.volatilityBoost += event.effect.volatilityBoost;
    }
  }
}

// Check if any stocks are ready for manipulation catalyst
function checkManipulationCatalysts() {
  stocks.forEach(stock => {
    if (stock.manipulationPhase === 'catalyst') {
      // Generate the big pump news
      const catalystNews = generateManipulationCatalystNews(stock);
      todayNews.push(catalystNews);
    }
  });
}

// ========== SHORT SQUEEZE NEWS ==========

function checkShortSqueezeEvents() {
  stocks.forEach(stock => {
    // Generate short interest news when building
    if (stock.shortSqueezePhase === 'building' && stock.shortSqueezeDaysLeft === 3) {
      generateShortInterestNews(stock, 'high');
    }
    
    // Check if heavily shorted stock gets positive catalyst → trigger squeeze
    if (stock.shortSqueezePhase === 'ready' && stock.shortInterest >= 0.25) {
      // Wait for any positive news to trigger
      const hasPositiveCatalyst = todayNews.some(n => 
        n.relatedStock === stock.symbol && n.sentiment === 'positive'
      );
      
      if (hasPositiveCatalyst || Math.random() < 0.10) {
        if (triggerShortSqueeze(stock)) {
          generateShortSqueezeNews(stock, 'squeeze');
        }
      }
    }
    
    // Generate squeeze in progress news
    if (stock.shortSqueezePhase === 'squeeze' && stock.shortSqueezeDaysLeft === 1) {
      generateShortSqueezeNews(stock, 'covering');
    }
    
    // Generate unwind news
    if (stock.shortSqueezePhase === 'unwind' && stock.shortSqueezeDaysLeft === 2) {
      generateShortSqueezeNews(stock, 'unwind');
    }
  });
}

function generateShortInterestNews(stock, phase) {
  const shortPercent = Math.round(stock.shortInterest * 100);
  
  const headlines = {
    building: [
      `Short interest in ${stock.symbol} rises to ${shortPercent}%`,
      `Bearish bets increase on ${stock.symbol}`,
      `${stock.symbol} becomes popular short target`
    ],
    high: [
      `WARNING: ${stock.symbol} short interest hits ${shortPercent}%`,
      `${stock.symbol} among most shorted stocks at ${shortPercent}%`,
      `Analysts warn of potential ${stock.symbol} short squeeze`
    ]
  };
  
  todayNews.push({
    headline: randomChoice(headlines[phase]),
    description: phase === 'high' 
      ? "High short interest can lead to violent squeezes if price rises."
      : "Short sellers betting against this stock.",
    sentiment: 'negative',
    relatedStock: stock.symbol,
    newsType: 'short_interest',
    shortInterest: shortPercent,
    isShortInterest: true
  });
}

function generateShortSqueezeNews(stock, phase) {
  const headlines = {
    squeeze: [
      `🚀 ${stock.symbol} EXPLODES as shorts scramble to cover!`,
      `SHORT SQUEEZE: ${stock.symbol} rockets higher on massive covering`,
      `${stock.symbol} surges as short sellers capitulate`
    ],
    covering: [
      `${stock.symbol} squeeze continues, shorts bleeding`,
      `Estimated $XXM in short losses on ${stock.symbol}`,
      `${stock.symbol} short interest plummets as covering accelerates`
    ],
    unwind: [
      `${stock.symbol} rally fades as squeeze pressure eases`,
      `Analysts: ${stock.symbol} squeeze likely exhausted`,
      `${stock.symbol} gives back gains, late buyers trapped`
    ]
  };
  
  todayNews.push({
    headline: randomChoice(headlines[phase]),
    description: phase === 'squeeze' 
      ? "Short sellers forced to buy back shares at any price!"
      : phase === 'covering'
      ? "Covering momentum may continue or stall."
      : "Post-squeeze correction often gives back 30-50% of gains.",
    sentiment: phase === 'unwind' ? 'negative' : 'positive',
    relatedStock: stock.symbol,
    newsType: 'short_squeeze',
    squeezePhase: phase,
    isShortSqueeze: true
  });
}

// ========== SHORT SELLER REPORT NEWS ==========

function checkShortSellerReportEvents() {
  // Random chance to trigger a short seller report (1.5% daily)
  if (Math.random() < 0.015) {
    const eligibleStocks = stocks.filter(s => !s.shortReportPhase && !s.crashPhase);
    if (eligibleStocks.length > 0) {
      const target = randomChoice(eligibleStocks);
      triggerShortSellerReport(target);
      generateShortReportNews(target, 'initial');
    }
  }
  
  // Generate phase-specific news
  stocks.forEach(stock => {
    if (stock.shortReportPhase === 'denial' && stock.shortReportDaysLeft === stock.shortReportDaysLeft) {
      // Only generate denial news once per denial phase
      if (!stock.denialNewsGenerated) {
        generateShortReportNews(stock, 'denial');
        stock.denialNewsGenerated = true;
      }
    } else {
      stock.denialNewsGenerated = false;
    }
    
    // Follow-up attack news
    if (stock.shortReportPhase === 'followup_attack' && stock.shortReportDaysLeft === 1) {
      generateShortReportNews(stock, 'followup');
    }
    
    // Investigation news
    if (stock.shortReportPhase === 'investigation' && stock.shortReportDaysLeft === Math.floor(stock.shortReportDaysLeft / 2)) {
      generateShortReportNews(stock, 'investigation');
    }
    
    // Resolution news
    if (stock.shortReportPhase === 'resolution' && stock.shortReportDaysLeft === 1) {
      generateShortReportNews(stock, 'resolution');
    }
  });
  
  // Pre-report subtle hint (put buying) - 2% chance on any stock
  // Tier 4: This is noise/red herring - no clear actionable signal for players
  if (isEventTypeEnabled('unusual_volume') && Math.random() < 0.02) {
    const stock = randomChoice(stocks.filter(s => !s.shortReportPhase));
    if (stock) {
      todayNews.push({
        headline: `Unusual put activity detected on ${stock.symbol}`,
        description: "Someone betting on price decline. Reason unknown.",
        sentiment: 'neutral',
        relatedStock: stock.symbol,
        newsType: 'unusual_volume',
        volumeClue: 'put_activity',
        isPutActivity: true
      });
    }
  }
}

function generateShortReportNews(stock, phase) {
  const reporterNames = ['Iceberg Research', 'Shadowfall Capital', 'Viceroy Research', 'Muddy Waters', 'Hindenburg Research'];
  const reporter = stock.shortReportReporter || randomChoice(reporterNames);
  stock.shortReportReporter = reporter; // Remember for consistency
  
  const waveNum = stock.shortReportWave || 1;
  
  const phaseNews = {
    initial: {
      headlines: [
        `💣 BOMBSHELL: ${reporter} accuses ${stock.symbol} of massive fraud`,
        `🔥 ${reporter} releases damning report on ${stock.symbol}`,
        `⚠️ Short seller ${reporter} targets ${stock.symbol} with fraud allegations`,
        `📉 ${stock.symbol} CRATERS as ${reporter} alleges accounting fraud`
      ],
      descriptions: [
        "50-page report details alleged misrepresentation to investors.",
        "Evidence includes internal documents and whistleblower testimony.",
        "Report claims revenues inflated by 40% through channel stuffing.",
        "Alleges executives enriched themselves through related-party transactions."
      ],
      tag: 'report'
    },
    followup: {
      headlines: [
        `${reporter} releases Part ${waveNum}: MORE evidence against ${stock.symbol}`,
        `${reporter} doubles down on ${stock.symbol} with new allegations`,
        `${stock.symbol} hit AGAIN as ${reporter} publishes follow-up report`,
        `"We're not done" - ${reporter} drops Part ${waveNum} on ${stock.symbol}`
      ],
      descriptions: [
        "New documents reveal additional questionable transactions.",
        "Former employees come forward to corroborate original claims.",
        "Follow-up report times release ahead of earnings for maximum impact.",
        "Short seller increases position, confident in eventual vindication."
      ],
      tag: 'report'
    },
    denial: {
      headlines: [
        `${stock.symbol} "categorically denies" short seller allegations`,
        `${stock.symbol} CEO: "${reporter} report is fiction"`,
        `${stock.symbol} threatens lawsuit against ${reporter}`,
        `${stock.symbol} board stands behind management amid allegations`
      ],
      descriptions: [
        "Company schedules investor call to address claims.",
        "Bulls buying the dip, confident in company's response.",
        "Legal team preparing defamation suit against short seller.",
        "Supporters claim report is manipulation for short profit."
      ],
      tag: 'denial'
    },
    investigation: {
      headlines: [
        `Analysts divided on ${stock.symbol} short report validity`,
        `${stock.symbol}: forensic accountants reviewing claims`,
        `${stock.symbol} short report: what we know so far`,
        `Investors await clarity on ${stock.symbol} allegations`
      ],
      descriptions: [
        "Independent analysis finds some claims credible, others weak.",
        "Company provides partial rebuttal, questions remain.",
        "Trading remains volatile as uncertainty persists.",
        `${waveNum > 1 ? `${waveNum} waves of accusations weigh heavily.` : 'Outcome could take weeks to determine.'}`
      ],
      tag: 'investigation'
    },
    resolution: {
      headlines: stock.shortReportVindicated ? [
        `${stock.symbol} admits "accounting errors" - ${reporter} vindicated`,
        `SEC opens investigation into ${stock.symbol} after report`,
        `${reporter} vindicated: ${stock.symbol} restates earnings`,
        `${stock.symbol} CFO resigns amid fraud probe`
      ] : [
        `${stock.symbol} cleared: ${reporter} report debunked`,
        `Independent audit clears ${stock.symbol} of fraud claims`,
        `${reporter} faces backlash over flawed ${stock.symbol} report`,
        `${stock.symbol} rebounds as allegations proven false`
      ],
      descriptions: stock.shortReportVindicated ? [
        `After ${waveNum} waves of evidence, material misstatements confirmed.`,
        "Regulatory scrutiny expected to continue.",
        "Long-term investors face significant losses.",
        "Trust in management severely damaged."
      ] : [
        "Company emerges stronger, shorts burned.",
        "Recovery rally expected as uncertainty clears.",
        "Short seller credibility questioned.",
        "Dip buyers rewarded for conviction."
      ],
      tag: stock.shortReportVindicated ? 'vindicated' : 'debunked'
    }
  };
  
  const newsData = phaseNews[phase];
  if (!newsData) return;
  
  const sentiment = (phase === 'denial') ? 'positive' 
    : (phase === 'resolution' && !stock.shortReportVindicated) ? 'positive' 
    : 'negative';
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: randomChoice(newsData.descriptions),
    sentiment,
    relatedStock: stock.symbol,
    newsType: 'short_report',
    shortReportPhase: newsData.tag,
    isShortReport: true,
    isVindicated: phase === 'resolution' ? stock.shortReportVindicated : null,
    reporter: reporter,
    waveNumber: waveNum
  });
}

// ========== DEAD CAT BOUNCE / CRASH NEWS ==========
// Multi-bounce system: News is now generated in market.js processDeadCatBounce()
// This function only triggers initial crashes

function checkCrashEvents() {
  stocks.forEach(stock => {
    // Random chance of crash for any stock (2% daily)
    if (!stock.crashPhase && !stock.shortReportPhase && Math.random() < 0.02) {
      const crashCatalysts = [
        { headline: `BREAKING: ${stock.symbol} accounting irregularities discovered`, severity: 0.30 },
        { headline: `${stock.symbol} loses major client, revenue at risk`, severity: 0.25 },
        { headline: `Whistleblower exposes ${stock.symbol} fraud`, severity: 0.40 },
        { headline: `${stock.symbol} product causes injuries, lawsuits filed`, severity: 0.28 },
        { headline: `${stock.symbol} CEO sudden departure raises red flags`, severity: 0.22 }
      ];
      
      const catalyst = randomChoice(crashCatalysts);
      triggerCrash(stock, catalyst.severity);
      
      todayNews.push({
        headline: catalyst.headline,
        description: "Shares in freefall. Multiple dead cat bounces are common - don't catch falling knives.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'crash',
        isCrash: true,
        crashSeverity: catalyst.severity
      });
    }
    
    // Note: Bounce and decline news now generated in market.js
    // via generateBounceFailedNews(), generateAnotherBounceNews(), etc.
  });
}

// ========== EXECUTIVE CHANGE NEWS ==========
// Different from "CEO sudden departure" crash - this is PLANNED REPLACEMENT (successor already named)
// Real-world pattern: Planned transitions typically cause a SMALL DIP initially because:
// - Uncertainty about new direction (even with successor named)
// - Loss of familiar leadership ("better the devil you know")
// - Institutional caution / wait-and-see
// EXCEPTION: If outgoing CEO had bad reputation → positive pop ("finally!")
// Pattern: Small dip (-2% to -5%) → Sideways (digesting) → "Honeymoon" recovery in 1-2 weeks
// This is Tier 2: Clear signal (planned replacement), predictable recovery pattern

function checkExecutiveChangeEvents() {
  // 1.5% daily chance of executive replacement announcement
  if (Math.random() < 0.015) {
    const stock = randomChoice(stocks.filter(s => !s.executiveChangePhase && !s.crashPhase));
    if (stock) {
      startExecutiveChange(stock);
    }
  }
  
  // Generate phase-specific news
  stocks.forEach(stock => {
    if (!stock.executiveChangePhase) return;
    
    // Cancel if event type was disabled
    if (!isEventTypeEnabled('executive_change')) {
      stock.executiveChangePhase = null;
      return;
    }
    
    stock.executiveChangeDaysLeft--;
    
    if (stock.executiveChangePhase === 'announced') {
      // Announced phase: continued mild pressure as market digests
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.005 * memeMultiplier; // Slight continued drift down
      
      if (stock.executiveChangeDaysLeft <= 0) {
        stock.executiveChangePhase = 'transition';
        stock.executiveChangeDaysLeft = 3 + Math.floor(Math.random() * 3); // 3-5 days
        generateExecutiveChangeNews(stock, 'transition');
      }
    }
    else if (stock.executiveChangePhase === 'transition') {
      // Transition phase: stabilizing, preparing for honeymoon
      const memeMultiplier = getMemeMultiplier(stock);
      
      if (stock.executiveChangeDaysLeft <= 0) {
        stock.executiveChangePhase = 'honeymoon';
        stock.executiveChangeDaysLeft = 5 + Math.floor(Math.random() * 5); // 5-9 days
        // DIRECT PRICE IMPACT: Honeymoon begins = price goes UP (2-5%)
        stock.crashTransitionEffect = 0.02 + Math.random() * 0.03;
        stock.sentimentOffset += 0.04 * memeMultiplier; // Recovery boost
        generateExecutiveChangeNews(stock, 'honeymoon');
      } else {
        // Still in transition - flat to slight positive as "fresh start" narrative emerges
        stock.sentimentOffset += 0.01 * memeMultiplier; // Beginning recovery
      }
    }
    else if (stock.executiveChangePhase === 'honeymoon') {
      // Honeymoon phase: market gives new leader benefit of doubt, recovery rally
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset += 0.015 * memeMultiplier; // Stronger recovery
      
      if (stock.executiveChangeDaysLeft <= 0) {
        // Clean up
        stock.executiveChangePhase = null;
        generateExecutiveChangeNews(stock, 'complete');
      }
    }
  });
}

function startExecutiveChange(stock) {
  // For PLANNED transitions with named successors:
  // Usually causes initial dip due to uncertainty, even if orderly
  // Exception: Bad reputation CEO leaving = positive
  const executives = [
    { role: 'CEO', impact: 0.04 },   // -4% initial dip (CEO change = biggest uncertainty)
    { role: 'CFO', impact: 0.025 },  // -2.5% (financial leadership matters)
    { role: 'COO', impact: 0.02 },   // -2%
    { role: 'CTO', impact: 0.015 }   // -1.5%
  ];
  
  const exec = randomChoice(executives);
  stock.executiveChangePhase = 'announced';
  stock.executiveChangeDaysLeft = 2 + Math.floor(Math.random() * 2); // 2-3 days initial
  stock.executiveChangeRole = exec.role;
  stock.executiveChangeImpact = exec.impact;
  
  // Initial dip on announcement (uncertainty about new direction)
  // Even planned transitions cause temporary uncertainty
  const memeMultiplier = getMemeMultiplier(stock);
  stock.sentimentOffset -= exec.impact * memeMultiplier;
  
  generateExecutiveChangeNews(stock, 'announced');
  return true;
}

function generateExecutiveChangeNews(stock, phase) {
  const role = stock.executiveChangeRole || 'CEO';
  const successorTypes = ['industry veteran', 'internal promotion', 'turnaround specialist', 'former competitor exec'];
  const successor = randomChoice(successorTypes);
  
  const phaseNews = {
    announced: {
      headlines: [
        `${stock.symbol} ${role} to step down, ${successor} named as successor`,
        `${stock.symbol} announces ${role} transition - ${successor} to take helm`,
        `Leadership change at ${stock.symbol}: New ${role} (${successor}) appointed`,
        `${stock.symbol} ${role} retiring, board names ${successor} as replacement`
      ],
      descriptions: [
        `Even PLANNED transitions cause initial dips - uncertainty about new direction. But watch for 'honeymoon' recovery in 1-2 weeks.`,
        `Market's initial reaction: caution. "Better the devil you know." Recovery typically follows as new leader gains confidence.`,
        `Initial dip is normal for leadership changes. Pattern: Dip → Digest → 'Fresh start' narrative → Recovery rally.`
      ],
      sentiment: 'negative'  // Initial reaction is typically negative (uncertainty)
    },
    transition: {
      headlines: [
        `${stock.symbol} new ${role} outlines strategic vision`,
        `Analysts cautiously optimistic on ${stock.symbol} leadership change`,
        `${stock.symbol} transition: New ${role} meets with major investors`,
        `${stock.symbol} new ${role} announces 90-day review`
      ],
      descriptions: [
        `Transition proceeding smoothly. 'Fresh start' narrative emerging. Watch for honeymoon rally.`,
        `New leadership typically gets 6-12 months before tough questions. Sentiment stabilizing.`
      ],
      sentiment: 'neutral'
    },
    honeymoon: {
      headlines: [
        `${stock.symbol} recovers as new ${role} gains market confidence`,
        `'Fresh start' at ${stock.symbol} - shares recover from transition dip`,
        `${stock.symbol} new ${role} honeymoon: Analysts upgrade outlook`,
        `${stock.symbol} rebounds - market embraces new leadership`
      ],
      descriptions: [
        `Classic 'honeymoon period' rally. New leaders get benefit of doubt for first few quarters.`,
        `Leadership transition pattern completing: Initial dip → Acceptance → Optimism → Recovery.`
      ],
      sentiment: 'positive'
    },
    complete: {
      headlines: [
        `${stock.symbol} leadership transition complete - back to fundamentals`,
        `${stock.symbol} new ${role} settles in, focus returns to earnings`,
        `Analysts: ${stock.symbol} transition premium fully priced in`
      ],
      descriptions: [
        `Honeymoon period ending. Stock will now trade on fundamentals, not leadership narrative.`,
        `Transition trade complete. Future moves depend on actual performance under new leadership.`
      ],
      sentiment: 'neutral'
    }
  };
  
  const newsData = phaseNews[phase];
  if (!newsData) return;
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: randomChoice(newsData.descriptions),
    sentiment: newsData.sentiment,
    relatedStock: stock.symbol,
    newsType: 'executive_change',
    executiveChangePhase: phase,
    isExecutiveChange: true,
    executiveRole: role
  });
}

// ========== STRATEGIC PIVOT / RESTRUCTURING NEWS ==========
// "Unfavorable strategy announcement" that actually recovers
// Pattern: Initial drop (disappointment/uncertainty) → Recovery in 2-3 weeks ("bold move" narrative)
// Examples: Layoffs, market exit, product kills, major pivots
// This is Tier 2: Clear signal (announcement), predictable recovery pattern

function checkStrategicPivotEvents() {
  // 1.5% daily chance of strategic pivot announcement
  if (Math.random() < 0.015) {
    const stock = randomChoice(stocks.filter(s => !s.strategicPivotPhase && !s.crashPhase && !s.executiveChangePhase));
    if (stock) {
      startStrategicPivot(stock);
    }
  }
  
  // Generate phase-specific news
  stocks.forEach(stock => {
    if (!stock.strategicPivotPhase) return;
    
    // Cancel if event type was disabled
    if (!isEventTypeEnabled('strategic_pivot')) {
      stock.strategicPivotPhase = null;
      return;
    }
    
    stock.strategicPivotDaysLeft--;
    
    if (stock.strategicPivotPhase === 'announced') {
      // Initial disappointment/uncertainty - dip continues
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.015 * memeMultiplier;
      
      if (stock.strategicPivotDaysLeft <= 0) {
        stock.strategicPivotPhase = 'digesting';
        stock.strategicPivotDaysLeft = 2 + Math.floor(Math.random() * 2); // 2-3 days (shorter)
        generateStrategicPivotNews(stock, 'digesting');
      }
    }
    else if (stock.strategicPivotPhase === 'digesting') {
      // Market processing the news - stabilizing with visible recovery starting
      const memeMultiplier = getMemeMultiplier(stock);
      
      if (stock.strategicPivotDaysLeft <= 0) {
        stock.strategicPivotPhase = 'rerating';
        stock.strategicPivotDaysLeft = 4 + Math.floor(Math.random() * 4); // 4-7 days
        // DIRECT PRICE IMPACT: Rerating begins = price goes UP (3-6%)
        stock.crashTransitionEffect = 0.03 + Math.random() * 0.03;
        stock.sentimentOffset += 0.05 * memeMultiplier; // Recovery boost
        generateStrategicPivotNews(stock, 'rerating');
      } else {
        // Still digesting - stabilizing
        stock.sentimentOffset += 0.02 * memeMultiplier; // ~2% sentiment boost/day
      }
    }
    else if (stock.strategicPivotPhase === 'rerating') {
      // "Bold move" narrative takes hold - visible daily recovery
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset += 0.04 * memeMultiplier; // ~4% sentiment boost/day for visible movement
      
      if (stock.strategicPivotDaysLeft <= 0) {
        // Clean up
        stock.strategicPivotPhase = null;
        generateStrategicPivotNews(stock, 'complete');
      }
    }
  });
}

function startStrategicPivot(stock) {
  const pivotTypes = [
    { type: 'layoffs', headline: `${stock.symbol} announces major layoffs, cutting XX% of workforce`, impact: 0.10, narrative: 'cost efficiency' },
    { type: 'restructuring', headline: `${stock.symbol} announces major restructuring plan`, impact: 0.08, narrative: 'operational efficiency' },
    { type: 'market_exit', headline: `${stock.symbol} exits ${randomChoice(['European', 'Asian', 'Latin American', 'emerging'])} market`, impact: 0.07, narrative: 'focus on core markets' },
    { type: 'product_kill', headline: `${stock.symbol} discontinues ${randomChoice(['flagship', 'legacy', 'underperforming'])} product line`, impact: 0.09, narrative: 'portfolio optimization' },
    { type: 'pivot', headline: `${stock.symbol} pivots strategy away from ${randomChoice(['hardware', 'consumer', 'enterprise', 'legacy'])} business`, impact: 0.12, narrative: 'strategic transformation' },
    { type: 'divestiture', headline: `${stock.symbol} to sell off ${randomChoice(['non-core', 'struggling', 'mature'])} division`, impact: 0.06, narrative: 'unlocking value' },
    { type: 'cost_cutting', headline: `${stock.symbol} announces aggressive cost-cutting measures`, impact: 0.08, narrative: 'margin improvement' }
  ];
  
  const pivot = randomChoice(pivotTypes);
  stock.strategicPivotPhase = 'announced';
  stock.strategicPivotDaysLeft = 3 + Math.floor(Math.random() * 2); // 3-4 days initial drop
  stock.strategicPivotType = pivot.type;
  stock.strategicPivotNarrative = pivot.narrative;
  stock.strategicPivotImpact = pivot.impact;
  
  // Initial drop on announcement
  const memeMultiplier = getMemeMultiplier(stock);
  stock.sentimentOffset -= pivot.impact * memeMultiplier;
  
  generateStrategicPivotNews(stock, 'announced');
  return true;
}

function generateStrategicPivotNews(stock, phase) {
  const pivotType = stock.strategicPivotType || 'restructuring';
  const narrative = stock.strategicPivotNarrative || 'efficiency';
  
  const phaseNews = {
    announced: {
      headlines: {
        layoffs: [
          `${stock.symbol} announces major layoffs, cutting workforce`,
          `${stock.symbol} to eliminate thousands of positions in restructuring`,
          `Job cuts at ${stock.symbol} signal tough times ahead`
        ],
        restructuring: [
          `${stock.symbol} announces sweeping restructuring plan`,
          `${stock.symbol} shakes up operations with major reorganization`,
          `${stock.symbol} restructuring raises questions about direction`
        ],
        market_exit: [
          `${stock.symbol} exits key market, admits defeat`,
          `${stock.symbol} pulls out of international expansion`,
          `${stock.symbol} retreats from competitive market`
        ],
        product_kill: [
          `${stock.symbol} kills flagship product line`,
          `${stock.symbol} discontinues popular product amid strategic shift`,
          `End of an era: ${stock.symbol} axes legacy product`
        ],
        pivot: [
          `${stock.symbol} announces dramatic strategic pivot`,
          `${stock.symbol} abandons core business in major shift`,
          `${stock.symbol} pivots strategy, investors question move`
        ],
        divestiture: [
          `${stock.symbol} to divest major business unit`,
          `${stock.symbol} selling off division in strategic retreat`,
          `${stock.symbol} announces sale of struggling segment`
        ],
        cost_cutting: [
          `${stock.symbol} announces aggressive cost-cutting plan`,
          `${stock.symbol} slashes spending amid margin pressure`,
          `${stock.symbol} cuts to the bone with efficiency program`
        ]
      },
      descriptions: [
        `Initial reaction negative - but watch for recovery. "Unfavorable" announcements often lead to rallies as "${narrative}" narrative takes hold.`,
        `Market disappointed today, but historically these moves lead to recovery in 2-3 weeks. Pattern: Drop → Digest → "Bold move" rerating.`,
        `Short-term pain, potentially long-term gain. Initial -5% to -12% drop often followed by recovery as analysts reframe as "${narrative}".`
      ],
      sentiment: 'negative'
    },
    digesting: {
      headlines: [
        `Analysts divided on ${stock.symbol} strategic move`,
        `${stock.symbol}: Was the market reaction overdone?`,
        `${stock.symbol} finds support as sellers exhaust`,
        `${stock.symbol} stabilizes after initial selloff`
      ],
      descriptions: [
        `Selling pressure easing. Watch for narrative shift from "bad news" to "${narrative}" story.`,
        `Market digesting the news. Recovery pattern typically starts within 1-2 weeks of announcement.`
      ],
      sentiment: 'neutral'
    },
    rerating: {
      headlines: [
        `${stock.symbol} rebounds as analysts embrace "${narrative}" story`,
        `"Bold move": ${stock.symbol} rally as Street rethinks strategy`,
        `${stock.symbol} higher as "${narrative}" narrative gains traction`,
        `${stock.symbol} recovery: Investors buy the strategic shift`,
        `${stock.symbol} rerated higher on ${narrative} potential`
      ],
      descriptions: [
        `Classic pattern playing out: Initial disappointment → "Actually this is smart" → Recovery rally.`,
        `Narrative shift complete: What was "bad news" is now "bold strategic move." Stock recovering.`,
        `Wall Street loves a good ${narrative} story. Stock rebounding toward pre-announcement levels.`
      ],
      sentiment: 'positive'
    },
    complete: {
      headlines: [
        `${stock.symbol} strategic pivot fully priced in`,
        `${stock.symbol} returns to trading on fundamentals`,
        `Analysts: ${stock.symbol} restructuring rally complete`
      ],
      descriptions: [
        `Recovery trade over. Stock now trading on execution of the plan, not the announcement.`,
        `Pivot premium priced in. Future moves depend on actual results from ${narrative} initiatives.`
      ],
      sentiment: 'neutral'
    }
  };
  
  const newsData = phaseNews[phase];
  if (!newsData) return;
  
  // Get appropriate headline
  let headline;
  if (phase === 'announced' && newsData.headlines[pivotType]) {
    headline = randomChoice(newsData.headlines[pivotType]);
  } else if (Array.isArray(newsData.headlines)) {
    headline = randomChoice(newsData.headlines);
  } else {
    headline = `${stock.symbol} strategic update`;
  }
  
  todayNews.push({
    headline: headline,
    description: randomChoice(newsData.descriptions),
    sentiment: newsData.sentiment,
    relatedStock: stock.symbol,
    newsType: 'strategic_pivot',
    strategicPivotPhase: phase,
    isStrategicPivot: true,
    pivotType: pivotType,
    pivotNarrative: narrative
  });
}

// ========== FOMO RALLY NEWS ==========

function checkFOMOEvents() {
  stocks.forEach(stock => {
    if (stock.fomoPhase === 'building' && stock.fomoDaysLeft === 2) {
      todayNews.push({
        headline: `${stock.symbol} rally attracts retail investors`,
        description: "Social media buzzing about recent gains.",
        sentiment: 'positive',
        relatedStock: stock.symbol,
        newsType: 'fomo',
        isFOMO: true,
        fomoPhase: 'building'
      });
    }
    
    if (stock.fomoPhase === 'blowoff') {
      todayNews.push({
        headline: `🔥 ${stock.symbol} MANIA: "Don't miss out!" say traders`,
        description: "Everyone's buying. This can't possibly go wrong... right?",
        sentiment: 'positive',
        relatedStock: stock.symbol,
        newsType: 'fomo',
        isFOMO: true,
        fomoPhase: 'blowoff',
        isWarning: true // Smart players recognize this
      });
    }
    
    if (stock.fomoPhase === 'collapse' && stock.fomoDaysLeft === 2) {
      // DIRECT PRICE IMPACT: "Bags" news = price drops (5-8%)
      stock.crashTransitionEffect = -(0.05 + Math.random() * 0.03);
      todayNews.push({
        headline: `${stock.symbol} crashes - "FOMO buyers" left holding bags`,
        description: "Late buyers suffering massive losses.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'fomo',
        isFOMO: true,
        fomoPhase: 'collapse'
      });
    }
  });
}

// ========== CAPITULATION NEWS ==========

function checkCapitulationEvents() {
  stocks.forEach(stock => {
    if (checkCapitulation(stock)) {
      todayNews.push({
        headline: `${stock.symbol} in CAPITULATION - investors throw in towel`,
        description: "Extreme selling. Blood in the streets.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'capitulation',
        isCapitulation: true
      });
    }
    
    // Check for capitulation reversal
    if (stock.capitulationDay) {
      stock.capitulationDay = false;
    }
  });
  
  // Process capitulation reversals
  gameState.activeEffects = gameState.activeEffects.filter(effect => {
    if (effect.type !== 'capitulation_reversal') return true;
    
    effect.daysActive++;
    
    if (effect.daysActive >= effect.reversalDay) {
      const stock = stocks.find(s => s.symbol === effect.symbol);
      if (stock) {
        const memeMultiplier = getMemeMultiplier(stock);
        stock.sentimentOffset += 0.25 * memeMultiplier; // Sharp V-shaped reversal
        // DIRECT PRICE IMPACT: Capitulation reversal = strong bounce (8-15%)
        stock.crashTransitionEffect = (0.08 + Math.random() * 0.07) * memeMultiplier;
        todayNews.push({
          headline: `${stock.symbol} REVERSING - was that capitulation the bottom?`,
          description: "Contrarian buyers stepping in after extreme selling.",
          sentiment: 'positive',
          relatedStock: stock.symbol,
          newsType: 'capitulation',
          isCapitulation: true,
          isReversal: true
        });
      }
      return false; // Remove effect
    }
    return true;
  });
}

// ========== INSIDER TRADING NEWS ==========

function checkInsiderTradingEvents() {
  // Random chance to start insider buying (3% daily)
  if (Math.random() < 0.03) {
    const eligibleStocks = stocks.filter(s => !s.insiderPhase && !s.crashPhase);
    if (eligibleStocks.length > 0) {
      const target = randomChoice(eligibleStocks);
      if (startInsiderBuying(target)) {
        generateInsiderNews(target, 'buy_start');
      }
    }
  }
  
  // Generate news for ongoing insider activity
  stocks.forEach(stock => {
    // Mid-accumulation update
    if (stock.insiderPhase === 'accumulating' && stock.insiderDaysLeft === 2) {
      generateInsiderNews(stock, 'buy_more');
    }
    
    // Catalyst arrives - the good news!
    if (stock.insiderPhase === 'catalyst') {
      generateInsiderCatalystNews(stock);
    }
    
    // Fizzle - insider buying was a false signal (teaches: not all insider buying works)
    if (stock.insiderPhase === 'fizzle') {
      generateInsiderFizzleNews(stock);
    }
  });
  
  // NOTE: Insider SELLING news removed - low educational value
  // Per tutorial: "Insider SELLING is less meaningful (diversification, taxes, etc.)"
  // Selling doesn't give actionable signal like buying does
}

function generateInsiderNews(stock, type) {
  const executives = ['CEO', 'CFO', 'COO', 'CTO', 'Chairman', 'Director'];
  const exec = randomChoice(executives);
  const amount = Math.floor(1 + Math.random() * 9) * 100000; // $100k - $900k
  
  const newsTypes = {
    buy_start: {
      headlines: [
        `${stock.symbol} ${exec} purchases $${(amount/1000).toFixed(0)}K in shares`,
        `Insider buying: ${stock.symbol} ${exec} adds to stake`,
        `${exec} of ${stock.symbol} buys shares on open market`
      ],
      description: "Insiders buying often precedes good news.",
      sentiment: 'positive',
      tag: 'insider_buy'
    },
    buy_more: {
      headlines: [
        `More insider buying at ${stock.symbol} - ${exec} increases stake`,
        `${stock.symbol}: Multiple executives purchasing shares`,
        `Insider accumulation continues at ${stock.symbol}`
      ],
      description: "Cluster buying by insiders is a strong bullish signal.",
      sentiment: 'positive',
      tag: 'insider_buy'
    }
    // NOTE: 'sell' type removed - insider selling has low educational value
  };
  
  const newsData = newsTypes[type];
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: newsData.description,
    sentiment: newsData.sentiment,
    relatedStock: stock.symbol,
    newsType: 'insider',
    insiderTag: newsData.tag,
    isInsider: true,
    insiderAmount: amount
  });
}

function generateInsiderCatalystNews(stock) {
  const catalysts = [
    { headline: `${stock.symbol} announces better-than-expected guidance`, effect: 0.15 },
    { headline: `${stock.symbol} wins major contract worth billions`, effect: 0.20 },
    { headline: `${stock.symbol} receives regulatory approval for key product`, effect: 0.25 },
    { headline: `${stock.symbol} announces strategic acquisition`, effect: 0.12 },
    { headline: `${stock.symbol} reports record quarterly bookings`, effect: 0.18 }
  ];
  
  const catalyst = randomChoice(catalysts);
  const memeMultiplier = getMemeMultiplier(stock);
  stock.sentimentOffset += catalyst.effect * memeMultiplier;
  stock.epsModifier += 0.05; // Permanent improvement (same for all)
  
  todayNews.push({
    headline: catalyst.headline,
    description: "Those insiders knew something! Smart money wins again.",
    sentiment: 'positive',
    relatedStock: stock.symbol,
    newsType: 'insider',
    insiderTag: 'catalyst',
    isInsider: true,
    isInsiderCatalyst: true
  });
}

// Generate news when insider buying doesn't lead to catalyst (teaching moment)
function generateInsiderFizzleNews(stock) {
  // 50/50 split between "routine purchase" vs "bad timing"
  const isRoutine = Math.random() < 0.5;
  
  const executives = ['CEO', 'CFO', 'COO', 'CTO', 'Director'];
  const exec = randomChoice(executives);
  
  if (isRoutine) {
    // 10b5-1 plan or compensation - insider wasn't signaling anything
    const routineHeadlines = [
      `${stock.symbol} ${exec}'s purchase was scheduled 10b5-1 plan`,
      `SEC filing shows ${stock.symbol} insider buy was pre-planned compensation`,
      `${stock.symbol}: ${exec} purchase tied to equity compensation schedule`,
      `Analysts note ${stock.symbol} insider buying was routine vesting exercise`
    ];
    
    todayNews.push({
      headline: randomChoice(routineHeadlines),
      description: "Not all insider buying signals conviction. Pre-planned purchases under 10b5-1 plans are routine.",
      sentiment: 'neutral',
      relatedStock: stock.symbol,
      newsType: 'insider',
      insiderTag: 'fizzle_routine',
      isInsider: true,
      isInsiderFizzle: true
    });
  } else {
    // Insider was wrong or had bad timing
    const badTimingHeadlines = [
      `${stock.symbol} faces unexpected headwinds despite insider confidence`,
      `${stock.symbol} disappoints despite recent insider buying`,
      `Macro concerns overshadow ${stock.symbol} insider accumulation`,
      `${stock.symbol}: Insider buying couldn't stop sector rotation out`,
      `${stock.symbol} drifts lower - insiders aren't always right`
    ];
    
    todayNews.push({
      headline: randomChoice(badTimingHeadlines),
      description: "Insiders can be wrong too. Even CEOs can't predict macro events or market sentiment shifts.",
      sentiment: 'negative',
      relatedStock: stock.symbol,
      newsType: 'insider',
      insiderTag: 'fizzle_wrong',
      isInsider: true,
      isInsiderFizzle: true
    });
  }
}

// ========== STOCK SPLIT NEWS ==========

function checkStockSplitEvents() {
  // Random chance to announce split (1.5% daily for high-priced stocks)
  const highPricedStocks = stocks.filter(s => s.price > 5000 && !s.splitPhase);
  if (highPricedStocks.length > 0 && Math.random() < 0.015) {
    const target = randomChoice(highPricedStocks);
    const ratio = randomChoice([2, 3, 4]); // 2:1, 3:1, or 4:1 split
    if (announceStockSplit(target, ratio)) {
      generateStockSplitNews(target, 'announced', ratio);
    }
  }
  
  // Generate news for split phases
  stocks.forEach(stock => {
    if (stock.splitPhase === 'announced' && stock.splitDaysLeft === 1) {
      generateStockSplitNews(stock, 'tomorrow', stock.splitRatio);
    }
    if (stock.splitPhase === 'effective') {
      generateStockSplitNews(stock, 'effective', stock.splitRatio);
    }
  });
}

function generateStockSplitNews(stock, phase, ratio) {
  const phaseNews = {
    announced: {
      headlines: [
        `${stock.symbol} announces ${ratio}:1 stock split`,
        `BREAKING: ${stock.symbol} to split shares ${ratio}-for-1`,
        `${stock.symbol} board approves ${ratio}:1 stock split`
      ],
      description: "Stock splits signal management confidence and improve accessibility.",
      tag: 'announced'
    },
    tomorrow: {
      headlines: [
        `${stock.symbol} ${ratio}:1 split effective tomorrow`,
        `Reminder: ${stock.symbol} shares split ${ratio}:1 after close`,
        `${stock.symbol} split: Last day to buy pre-split shares`
      ],
      description: "Price will adjust but holdings value unchanged.",
      tag: 'pending'
    },
    effective: {
      headlines: [
        `${stock.symbol} opens post-split at $${Math.round(stock.price / ratio)}`,
        `${stock.symbol} ${ratio}:1 split now effective`,
        `${stock.symbol} shares more accessible after split`
      ],
      description: "Lower price often attracts new retail investors.",
      tag: 'effective'
    }
  };
  
  const newsData = phaseNews[phase];
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: newsData.description,
    sentiment: 'positive',
    relatedStock: stock.symbol,
    newsType: 'stock_split',
    splitPhase: newsData.tag,
    splitRatio: ratio,
    isSplit: true
  });
}

// ========== ANALYST RATING NEWS ==========

function checkAnalystRatingEvents() {
  // Random chance for rating change (5% daily)
  if (Math.random() < 0.05) {
    const stock = randomChoice(stocks.filter(s => !s.pendingRatingChange));
    if (stock) {
      // Determine direction based on current rating and price vs target
      const priceVsTarget = stock.price / stock.targetPrice;
      let direction;
      
      if (priceVsTarget < 0.85 && stock.analystRating < 3) {
        direction = 'upgrade'; // Price below target, upgrade
      } else if (priceVsTarget > 1.10 && stock.analystRating > 0) {
        direction = 'downgrade'; // Price above target, downgrade
      } else {
        direction = Math.random() > 0.5 ? 'upgrade' : 'downgrade';
      }
      
      // Can't upgrade past Strong Buy or downgrade past Strong Sell
      if (direction === 'upgrade' && stock.analystRating >= 3) return;
      if (direction === 'downgrade' && stock.analystRating <= 0) return;
      
      if (scheduleRatingChange(stock, direction)) {
        generateAnalystNews(stock, direction);
      }
    }
  }
  
  // Generate news when rating change takes effect
  stocks.forEach(stock => {
    if (stock.pendingRatingChange && stock.ratingChangeDaysLeft === 0) {
      generateAnalystNews(stock, stock.pendingRatingChange + '_effective');
    }
  });
}

function generateAnalystNews(stock, type) {
  const firms = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Nomura', 'Daiwa Securities', 'SMBC Nikko'];
  const firm = randomChoice(firms);
  
  const ratingNames = ['Strong Sell', 'Sell', 'Hold', 'Buy', 'Strong Buy'];
  const currentRating = ratingNames[stock.analystRating + 1] || 'Hold';
  const newRating = type.includes('upgrade') 
    ? ratingNames[Math.min(4, stock.analystRating + 2)]
    : ratingNames[Math.max(0, stock.analystRating)];
  
  const newsTypes = {
    upgrade: {
      headlines: [
        `${firm} upgrades ${stock.symbol} to ${newRating}`,
        `UPGRADE: ${stock.symbol} raised to ${newRating} by ${firm}`,
        `${firm} turns bullish on ${stock.symbol}, upgrades to ${newRating}`
      ],
      description: `Target price raised to $${Math.round(stock.price * 1.20).toLocaleString()}.`,
      sentiment: 'positive',
      tag: 'upgrade'
    },
    downgrade: {
      headlines: [
        `${firm} downgrades ${stock.symbol} to ${newRating}`,
        `DOWNGRADE: ${stock.symbol} cut to ${newRating} by ${firm}`,
        `${firm} turns cautious on ${stock.symbol}, downgrades to ${newRating}`
      ],
      description: `Target price lowered to $${Math.round(stock.price * 0.85).toLocaleString()}.`,
      sentiment: 'negative',
      tag: 'downgrade'
    },
    upgrade_effective: {
      headlines: [
        `${stock.symbol} rallies on ${firm} upgrade`,
        `${stock.symbol} higher after analyst upgrade`,
        `Buyers respond to ${stock.symbol} rating boost`
      ],
      description: "Analyst calls often drive short-term momentum.",
      sentiment: 'positive',
      tag: 'upgrade'
    },
    downgrade_effective: {
      headlines: [
        `${stock.symbol} slides on ${firm} downgrade`,
        `${stock.symbol} lower after analyst cut`,
        `Sellers respond to ${stock.symbol} rating reduction`
      ],
      description: "Downgrades can trigger institutional selling.",
      sentiment: 'negative',
      tag: 'downgrade'
    }
  };
  
  const newsData = newsTypes[type];
  if (!newsData) return;
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: newsData.description,
    sentiment: newsData.sentiment,
    relatedStock: stock.symbol,
    newsType: 'analyst',
    analystTag: newsData.tag,
    isAnalyst: true,
    analystFirm: firm,
    targetPrice: type.includes('upgrade') ? stock.price * 1.20 : stock.price * 0.85
  });
}

// ========== INDEX REBALANCING NEWS ==========

function checkIndexRebalancingEvents() {
  // Random chance for index changes (2% daily)
  if (Math.random() < 0.02) {
    const stock = randomChoice(stocks.filter(s => !s.indexPhase));
    if (stock) {
      // High performers more likely to be added, poor performers removed
      const performance = stock.price / stock.basePrice;
      const action = performance > 1.2 ? 'add' : performance < 0.8 ? 'remove' : (Math.random() > 0.5 ? 'add' : 'remove');
      
      if (announceIndexChange(stock, action)) {
        generateIndexNews(stock, action, 'announced');
      }
    }
  }
  
  // Generate news for index phases
  stocks.forEach(stock => {
    if ((stock.indexPhase === 'addition_announced' || stock.indexPhase === 'removal_announced') && stock.indexDaysLeft === 1) {
      generateIndexNews(stock, stock.indexAction, 'tomorrow');
    }
    if (stock.indexPhase === 'effective') {
      generateIndexNews(stock, stock.indexAction, 'effective');
    }
  });
}

function generateIndexNews(stock, action, phase) {
  const indices = ['S&P 500', 'Nasdaq 100', 'Russell 2000', 'Dow Jones Industrial'];
  const index = randomChoice(indices);
  
  const newsTypes = {
    add_announced: {
      headlines: [
        `${stock.symbol} to be ADDED to ${index}`,
        `BREAKING: ${stock.symbol} joins ${index} next week`,
        `${stock.symbol} inclusion in ${index} announced`
      ],
      description: "Index funds MUST buy shares on effective date. Some front-running already priced in, but forced buying continues until inclusion.",
      sentiment: 'positive',
      tag: 'index_add'
    },
    add_tomorrow: {
      headlines: [
        `⚠️ ${stock.symbol} joins ${index} TOMORROW - last day to exit!`,
        `📢 Final day before ${stock.symbol} ${index} inclusion`,
        `${stock.symbol} index addition tomorrow - smart money exits TODAY`
      ],
      description: "🎯 SELL SIGNAL: Peak is TODAY. Tomorrow's 'effective date' = forced buying done = profit-taking begins.",
      sentiment: 'positive',
      tag: 'index_add'
    },
    add_effective: {
      headlines: [
        `${stock.symbol} officially added to ${index}`,
        `${stock.symbol} ${index} inclusion now effective`,
        `${stock.symbol} index inclusion complete - trade over`
      ],
      description: "⚠️ TOO LATE: Forced buying complete. Smart money already exited. Expect profit-taking and pullback.",
      sentiment: 'neutral',
      tag: 'index_add'
    },
    remove_announced: {
      headlines: [
        `${stock.symbol} to be REMOVED from ${index}`,
        `BREAKING: ${stock.symbol} dropped from ${index}`,
        `${stock.symbol} exclusion from ${index} announced`
      ],
      description: "Index funds will be forced to sell shares regardless of price.",
      sentiment: 'negative',
      tag: 'index_remove'
    },
    remove_tomorrow: {
      headlines: [
        `${stock.symbol} exits ${index} tomorrow - selling expected`,
        `Final day of ${stock.symbol} in ${index}`,
        `Index funds liquidating ${stock.symbol} positions`
      ],
      description: "Massive selling expected at close.",
      sentiment: 'negative',
      tag: 'index_remove'
    },
    remove_effective: {
      headlines: [
        `${stock.symbol} officially removed from ${index}`,
        `${stock.symbol} ${index} removal now effective`,
        `Forced selling complete as ${stock.symbol} exits ${index}`
      ],
      description: "Selling pressure may ease. Watch for bounce.",
      sentiment: 'negative',
      tag: 'index_remove'
    }
  };
  
  const key = `${action}_${phase}`;
  const newsData = newsTypes[key];
  if (!newsData) return;
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: newsData.description,
    sentiment: newsData.sentiment,
    relatedStock: stock.symbol,
    newsType: 'index_rebalance',
    indexTag: newsData.tag,
    isIndexRebalance: true,
    indexName: index,
    indexAction: action
  });
}

// ========== SECTOR ROTATION NEWS ==========

function checkSectorRotationEvents() {
  // 3% daily chance of sector rotation starting
  if (!gameState.sectorRotationTarget && Math.random() < 0.03) {
    const sectors = ['tech', 'finance', 'industrial', 'consumer', 'energy', 'healthcare'];
    const sentiment = Math.random() > 0.5 ? 'risk_on' : 'risk_off';
    
    // Risk-on favors tech/consumer, risk-off favors energy/healthcare
    let targetSector;
    if (sentiment === 'risk_on') {
      targetSector = randomChoice(['tech', 'consumer', 'finance']);
    } else {
      targetSector = randomChoice(['energy', 'healthcare', 'industrial']);
    }
    
    startSectorRotation(targetSector, sentiment);
    generateSectorRotationNews(targetSector, sentiment, 'start');
  }
  
  // Check for rotation ending
  gameState.activeEffects = gameState.activeEffects.filter(effect => {
    if (effect.type !== 'sector_rotation') return true;
    
    effect.daysActive++;
    if (effect.daysActive >= effect.duration) {
      gameState.sectorRotationTarget = null;
      gameState.marketSentiment = 'neutral';
      generateSectorRotationNews(effect.sector, null, 'end');
      return false;
    }
    return true;
  });
}

function generateSectorRotationNews(sector, sentiment, phase) {
  const sectorNames = {
    tech: 'Technology',
    finance: 'Financial',
    industrial: 'Industrial',
    consumer: 'Consumer',
    energy: 'Energy',
    healthcare: 'Healthcare'
  };
  
  const sectorName = sectorNames[sector];
  
  const newsTypes = {
    start: {
      headlines: [
        `Money rotating into ${sectorName} stocks`,
        `Investors favor ${sectorName} sector in shift`,
        `${sectorName} stocks see inflows as rotation begins`,
        `Fund managers overweight ${sectorName} sector`
      ],
      description: sentiment === 'risk_on' 
        ? "Risk appetite increasing, growth sectors favored."
        : "Defensive positioning, stable sectors favored.",
      tag: 'rotation_start'
    },
    end: {
      headlines: [
        `${sectorName} rotation appears complete`,
        `Sector flows normalizing after ${sectorName} surge`,
        `${sectorName} rally losing steam`
      ],
      description: "Rotation trade may be exhausted.",
      tag: 'rotation_end'
    }
  };
  
  const newsData = newsTypes[phase];
  
  todayNews.push({
    headline: randomChoice(newsData.headlines),
    description: newsData.description,
    sentiment: phase === 'start' ? 'positive' : 'neutral',
    relatedStock: null,
    newsType: 'sector_rotation',
    sectorTag: newsData.tag,
    isSectorRotation: true,
    targetSector: sector,
    isMarketWide: true
  });
}

// ========== DIVIDEND TRAP NEWS ==========

function checkDividendTrapEvents() {
  stocks.forEach(stock => {
    // Check for dividend at risk
    const priceDropFromBase = (stock.basePrice - stock.price) / stock.basePrice;
    const effectiveYield = stock.dividendYield / (1 - priceDropFromBase);
    
    // Warn about high yield traps
    if (effectiveYield > 0.08 && stock.dividendAtRisk && Math.random() < 0.02) {
      todayNews.push({
        headline: `Warning: ${stock.symbol} yield at ${Math.round(effectiveYield * 100)}% - dividend cut risk`,
        description: "High yield may indicate falling price, not generous payout.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'dividend_trap',
        isDividendTrap: true,
        yieldPercent: Math.round(effectiveYield * 100)
      });
    }
    
    // Check for actual dividend cut
    if (stock.epsModifier < -0.15 && stock.dividendAtRisk && Math.random() < 0.01) {
      const oldYield = stock.dividendYield;
      stock.dividendYield *= 0.5;
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.25 * memeMultiplier; // Dividend cut devastates income investors
      
      todayNews.push({
        headline: `${stock.symbol} SLASHES dividend by 50%`,
        description: "Income investors flee as yield trap snaps shut.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'dividend_cut',
        isDividendCut: true
      });
    }
  });
}

// ========== GAP UP/DOWN NEWS ==========

function checkGapEvents() {
  // 2% daily chance of overnight gap event
  if (Math.random() < 0.02) {
    const stock = randomChoice(stocks.filter(s => !s.tradingHalted));
    if (!stock) return;
    
    const isUp = Math.random() > 0.5;
    const magnitude = (0.08 + Math.random() * 0.17) * (isUp ? 1 : -1); // 8-25% gap
    
    scheduleGap(stock, magnitude);
    
    const gapPercent = Math.round(Math.abs(magnitude) * 100);
    
    todayNews.push({
      headline: isUp 
        ? `${stock.symbol} gaps UP ${gapPercent}% on overnight news`
        : `${stock.symbol} gaps DOWN ${gapPercent}% on overnight development`,
      description: isUp
        ? "Pre-market trading indicates strong open."
        : "Sellers overwhelm before market open.",
      sentiment: isUp ? 'positive' : 'negative',
      relatedStock: stock.symbol,
      newsType: 'gap',
      isGap: true,
      gapDirection: isUp ? 'up' : 'down',
      gapPercent: gapPercent
    });
  }
}

// ========== CORRELATION BREAKDOWN NEWS ==========

function checkCorrelationEvents() {
  // 1% daily chance of correlation breakdown
  if (gameState.correlationStable && Math.random() < 0.01) {
    gameState.correlationStable = false;
    
    // Schedule recovery in 3-7 days
    gameState.activeEffects.push({
      type: 'correlation_breakdown',
      daysActive: 0,
      duration: 3 + Math.floor(Math.random() * 5)
    });
    
    todayNews.push({
      headline: "Market correlations breaking down - diversification failing",
      description: "Normally stable relationships between stocks diverging. Historical patterns unreliable.",
      sentiment: 'negative',
      relatedStock: null,
      newsType: 'correlation',
      isCorrelationBreakdown: true,
      isMarketWide: true
    });
  }
  
  // Check for recovery
  gameState.activeEffects = gameState.activeEffects.filter(effect => {
    if (effect.type !== 'correlation_breakdown') return true;
    
    effect.daysActive++;
    if (effect.daysActive >= effect.duration) {
      gameState.correlationStable = true;
      todayNews.push({
        headline: "Market correlations normalizing",
        description: "Relationships between assets returning to historical patterns.",
        sentiment: 'positive',
        relatedStock: null,
        newsType: 'correlation',
        isCorrelationBreakdown: false,
        isMarketWide: true
      });
      return false;
    }
    return true;
  });
}

// ========== LIQUIDITY CRISIS NEWS ==========

function checkLiquidityCrisisEvents() {
  // 0.5% daily chance of liquidity crisis
  if (!gameState.liquidityCrisis && Math.random() < 0.005) {
    gameState.liquidityCrisis = true;
    
    // Schedule recovery in 2-5 days
    gameState.activeEffects.push({
      type: 'liquidity_crisis',
      daysActive: 0,
      duration: 2 + Math.floor(Math.random() * 4)
    });
    
    todayNews.push({
      headline: "⚠️ LIQUIDITY CRISIS: Markets seizing up",
      description: "Bid-ask spreads widening dramatically. Selling into weakness will incur penalties.",
      sentiment: 'negative',
      relatedStock: null,
      newsType: 'liquidity',
      isLiquidityCrisis: true,
      isMarketWide: true
    });
  }
  
  // Check for recovery
  gameState.activeEffects = gameState.activeEffects.filter(effect => {
    if (effect.type !== 'liquidity_crisis') return true;
    
    effect.daysActive++;
    if (effect.daysActive >= effect.duration) {
      gameState.liquidityCrisis = false;
      todayNews.push({
        headline: "Liquidity returning to markets",
        description: "Trading conditions normalizing. Spreads tightening.",
        sentiment: 'positive',
        relatedStock: null,
        newsType: 'liquidity',
        isLiquidityCrisis: false,
        isMarketWide: true
      });
      return false;
    }
    return true;
  });
}

// ========== WINDOW DRESSING NEWS ==========

function checkWindowDressingEvents() {
  // Last week of quarter
  const isQuarterEnd = [3, 6, 9, 12].includes(gameState.month) && gameState.day >= 22;
  
  if (isQuarterEnd && gameState.day === 22) {
    todayNews.push({
      headline: "Quarter-end window dressing begins",
      description: "Fund managers buying winners, selling losers to beautify portfolios.",
      sentiment: 'neutral',
      relatedStock: null,
      newsType: 'window_dressing',
      isWindowDressing: true,
      isMarketWide: true
    });
  }
  
  // Generate stock-specific window dressing news
  if (isQuarterEnd && Math.random() < 0.10) {
    const winners = stocks.filter(s => s.ytdReturn > 0.20);
    const losers = stocks.filter(s => s.ytdReturn < -0.20);
    
    if (winners.length > 0 && Math.random() > 0.5) {
      const stock = randomChoice(winners);
      todayNews.push({
        headline: `${stock.symbol} lifted by quarter-end buying`,
        description: "Funds adding to winners for quarterly reports.",
        sentiment: 'positive',
        relatedStock: stock.symbol,
        newsType: 'window_dressing',
        isWindowDressing: true
      });
    } else if (losers.length > 0) {
      const stock = randomChoice(losers);
      todayNews.push({
        headline: `${stock.symbol} pressured by quarter-end selling`,
        description: "Funds dumping losers before reporting period ends.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'window_dressing',
        isWindowDressing: true
      });
    }
  }
}

// ========== TAX LOSS HARVESTING NEWS ==========

function checkTaxLossHarvestingEvents() {
  // Only in December
  if (gameState.month !== 12) return;
  
  // First day of December - warn about tax selling
  if (gameState.day === 1) {
    todayNews.push({
      headline: "December tax loss selling season begins",
      description: "Year's biggest losers may face additional pressure. January bounce often follows.",
      sentiment: 'neutral',
      relatedStock: null,
      newsType: 'tax_selling',
      isTaxSelling: true,
      isMarketWide: true
    });
  }
  
  // Generate stock-specific tax selling news
  if (Math.random() < 0.08) {
    const losers = stocks.filter(s => s.ytdReturn < -0.25);
    if (losers.length > 0) {
      const stock = randomChoice(losers);
      todayNews.push({
        headline: `${stock.symbol} hit by tax loss selling`,
        description: "Investors harvesting losses for tax benefits. Watch for January bounce.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'tax_selling',
        isTaxSelling: true,
        taxSellingTag: 'selling'
      });
    }
  }
  
  // January effect preview
  if (gameState.day >= 28) {
    todayNews.push({
      headline: "Analysts eye January Effect for beaten-down stocks",
      description: "Tax selling exhausted - oversold stocks may bounce in new year.",
      sentiment: 'neutral',
      relatedStock: null,
      newsType: 'tax_selling',
      isTaxSelling: true,
      isMarketWide: true
    });
  }
}

// ========== EARNINGS WHISPER NEWS ==========

function checkEarningsWhisperEvents() {
  // 3% chance to reveal whisper number before earnings
  if (Math.random() < 0.03) {
    const stock = randomChoice(stocks);
    if (!stock) return;
    
    // Generate whisper that differs from official expectation
    const officialExpectation = stock.expectedEPS;
    const whisperDiff = (Math.random() - 0.3) * 0.15; // Usually higher than official
    stock.whisperExpectation = officialExpectation * (1 + whisperDiff);
    
    const whisperVsOfficial = whisperDiff > 0 ? 'higher' : 'lower';
    const diffPercent = Math.round(Math.abs(whisperDiff) * 100);
    
    todayNews.push({
      headline: `${stock.symbol} whisper number ${diffPercent}% ${whisperVsOfficial} than Street`,
      description: whisperDiff > 0 
        ? "Street expectations may be too low. Beat official but miss whisper = drop."
        : "Lowered expectations could set up positive surprise.",
      sentiment: 'neutral',
      relatedStock: stock.symbol,
      newsType: 'whisper',
      isWhisper: true,
      whisperDirection: whisperVsOfficial
    });
  }
}

// ========== CIRCUIT BREAKER NEWS ==========

function checkCircuitBreakerEvents() {
  stocks.forEach(stock => {
    // Check for halts
    if (stock.tradingHalted && stock.haltDaysLeft === 1) {
      todayNews.push({
        headline: `⛔ TRADING HALTED: ${stock.symbol} circuit breaker triggered`,
        description: "Extreme price movement triggered automatic halt. Trading will resume tomorrow.",
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'circuit_breaker',
        isCircuitBreaker: true,
        isHalted: true
      });
    }
    
    // Check for resumption
    if (stock.tradingHalted && stock.haltDaysLeft === 0) {
      stock.tradingHalted = false;
      todayNews.push({
        headline: `${stock.symbol} trading resumes after halt`,
        description: "Circuit breaker lifted. Expect continued volatility.",
        sentiment: 'neutral',
        relatedStock: stock.symbol,
        newsType: 'circuit_breaker',
        isCircuitBreaker: true,
        isHalted: false
      });
    }
  });
}

function generateMarketNews() {
  const isPositive = Math.random() > 0.5;
  const pool = isPositive ? NEWS_EVENTS.market.positive : NEWS_EVENTS.market.negative;
  
  // Try to find a non-conflicting event (max 5 attempts)
  for (let attempt = 0; attempt < 5; attempt++) {
    const event = randomChoice(pool);
    
    // Check for conflicts
    if (!canAddNews(event, null)) {
      continue; // Try another event
    }
    
    // Check if we already have this exact headline today
    if (todayNews.some(n => n.headline === event.headline)) {
      continue; // Try another event
    }
    
    todayNews.push({
      headline: event.headline,
      sentiment: isPositive ? 'positive' : 'negative',
      relatedStock: null,
      isMarketWide: true,
      newsType: 'market',
      eventId: event.id
    });
    
    // Apply market-wide effect
    applyMarketShock(event.marketShock, event.duration);
    return; // Successfully added
  }
  // If all attempts failed, skip this news generation
}

function generateEPSNews() {
  const isPositive = Math.random() > 0.45; // Slightly more negative news (realistic)
  const pool = isPositive ? NEWS_EVENTS.eps_driven.positive : NEWS_EVENTS.eps_driven.negative;
  // Exclude stocks in active event phases to avoid conflicting news
  const eligibleStocks = stocks.filter(s => !s.crashPhase && !s.shortReportPhase && !s.executiveChangePhase && !s.strategicPivotPhase);
  if (eligibleStocks.length === 0) return;
  const stock = randomChoice(eligibleStocks);
  
  // Try to find a non-conflicting event (max 5 attempts)
  for (let attempt = 0; attempt < 5; attempt++) {
    const event = weightedRandomChoice(pool);
    
    // Check for conflicts with this stock
    if (!canAddNews(event, stock.symbol)) {
      continue; // Try another event
    }
    
    const headline = event.headline.replace('{STOCK}', stock.symbol);
    
    todayNews.push({
      headline,
      description: event.description,
      sentiment: isPositive ? 'positive' : 'negative',
      relatedStock: stock.symbol,
      newsType: 'eps_driven',
      eventId: event.id
    });
    
    // Apply EPS effect to stock
    applyNewsToStock(stock, event, 'eps_driven');
    return; // Successfully added
  }
  // If all attempts failed, skip this news generation
}

function generateSentimentNews() {
  const roll = Math.random();
  let pool, sentiment;
  
  if (roll < 0.35) {
    pool = NEWS_EVENTS.sentiment.positive;
    sentiment = 'positive';
  } else if (roll < 0.70) {
    pool = NEWS_EVENTS.sentiment.negative;
    sentiment = 'negative';
  } else {
    pool = NEWS_EVENTS.sentiment.neutral;
    sentiment = 'neutral';
  }
  
  // Exclude stocks in active event phases to avoid conflicting news
  const eligibleStocks = stocks.filter(s => !s.crashPhase && !s.shortReportPhase && !s.executiveChangePhase && !s.strategicPivotPhase);
  if (eligibleStocks.length === 0) return;
  const stock = randomChoice(eligibleStocks);
  
  // Try to find a non-conflicting event (max 5 attempts)
  for (let attempt = 0; attempt < 5; attempt++) {
    const event = weightedRandomChoice(pool);
    
    // Check for conflicts with this stock
    if (!canAddNews(event, stock.symbol)) {
      continue; // Try another event
    }
    
    const headline = event.headline.replace('{STOCK}', stock.symbol);
    
    todayNews.push({
      headline,
      description: event.description,
      sentiment,
      relatedStock: stock.symbol,
      newsType: 'sentiment',
      eventId: event.id
    });
    
    // Apply sentiment effect to stock
    applyNewsToStock(stock, event, 'sentiment');
    return; // Successfully added
  }
  // If all attempts failed, skip this news generation
}

function generateHybridNews() {
  const isPositive = Math.random() > 0.5;
  const pool = isPositive ? NEWS_EVENTS.hybrid.positive : NEWS_EVENTS.hybrid.negative;
  // Exclude stocks in active event phases to avoid conflicting news
  const eligibleStocks = stocks.filter(s => !s.crashPhase && !s.shortReportPhase && !s.executiveChangePhase && !s.strategicPivotPhase);
  if (eligibleStocks.length === 0) return;
  const stock = randomChoice(eligibleStocks);
  
  // Try to find a non-conflicting event (max 5 attempts)
  for (let attempt = 0; attempt < 5; attempt++) {
    const event = weightedRandomChoice(pool);
    
    // Check for conflicts with this stock
    if (!canAddNews(event, stock.symbol)) {
      continue; // Try another event
    }
    
    const headline = event.headline.replace('{STOCK}', stock.symbol);
    
    todayNews.push({
      headline,
      description: event.description,
      sentiment: isPositive ? 'positive' : 'negative',
      relatedStock: stock.symbol,
      newsType: 'hybrid',
      eventId: event.id,
      hasOverreaction: true
    });
    
    // Apply hybrid effect to stock
    applyNewsToStock(stock, event, 'hybrid');
    return; // Successfully added
  }
  // If all attempts failed, skip this news generation
}

function addNews(headline, sentiment, relatedStock) {
  const item = {
    headline,
    sentiment,
    relatedStock,
    timestamp: `Day ${gameState.day}`,
    id: Math.random().toString(36).substr(2, 9)
  };
  news = [item, ...news].slice(0, 20);
}

function checkRandomLifeEvent() {
  // Simple events
  for (const event of LIFE_EVENTS) {
    if (Math.random() < event.chance) {
      processSimpleEvent(event);
      return true;
    }
  }
  
  // Choice events
  const netWorth = calculateNetWorth();
  for (const event of CHOICE_EVENTS) {
    if (Math.random() < event.chance && netWorth >= (event.minNetWorth || 0)) {
      showChoiceEvent(event);
      return true;
    }
  }
  
  return false;
}

function processSimpleEvent(event) {
  let message = event.message;
  let amount = 0;
  
  // Calculate amount based on event type
  if (event.scaledToIncome) {
    // Scale to player's estimated annual income (net worth growth potential)
    // Use portfolio value as proxy for earning capability
    const portfolioValue = calculateNetWorth();
    const minPercent = event.incomePercent[0];
    const maxPercent = event.incomePercent[1];
    const percent = minPercent + Math.random() * (maxPercent - minPercent);
    amount = Math.round(portfolioValue * percent);
    // Minimum floor to prevent trivial amounts early game
    amount = Math.max(amount, 5000);
    message = message.replace('${AMOUNT}', formatNumber(amount));
  } else if (event.amountRange) {
    amount = randomInRange(event.amountRange[0], event.amountRange[1]);
    message = message.replace('{AMOUNT}', formatNumber(amount));
  }
  
  if (event.effect === 'cash_gain') {
    gameState.cash += amount;
  } else if (event.effect === 'cash_loss') {
    gameState.cash = Math.max(0, gameState.cash - amount);
  } else if (event.effect === 'skip_days') {
    gameState.skipDays = event.value;
  } else if (event.effect === 'energy_boost') {
    gameState.maxEnergy += event.value;
    gameState.tempEffects.push({ type: 'energy_boost', value: event.value, duration: event.duration });
  } else if (event.effect === 'reputation_gain') {
    gameState.reputation += event.value;
  } else if (event.effect === 'stock_tip') {
    const stock = randomChoice(stocks);
    message = message.replace('{STOCK}', stock.symbol);
    if (Math.random() < event.accuracy) {
      stock.trend = Math.abs(stock.trend) + 0.05;
    }
  }
  
  if (event.stressGain) gameState.stress = Math.min(100, gameState.stress + event.stressGain);
  
  addNews(message, 'life', null);
  showEvent(event.name, message);
}

function showChoiceEvent(event) {
  elements.randomEventTitle.textContent = event.name;
  elements.randomEventBody.textContent = event.message;
  
  elements.randomEventChoices.innerHTML = event.choices.map((choice, idx) => `
    <button class="event-choice" data-event-id="${event.id}" data-choice-idx="${idx}">
      <span class="event-choice-text">${choice.text}</span>
      ${choice.cost > 0 ? `<span class="event-choice-effect">Cost: $${formatNumber(choice.cost)}</span>` : ''}
    </button>
  `).join('');
  
  elements.randomEventChoices.querySelectorAll('.event-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const choiceIdx = parseInt(btn.dataset.choiceIdx);
      processChoiceEvent(event, choiceIdx);
    });
  });
  
  elements.randomEventOverlay.classList.add('active');
}

function processChoiceEvent(event, choiceIdx) {
  const choice = event.choices[choiceIdx];
  
  if (choice.cost > gameState.cash) {
    showEvent("Insufficient Funds", "You can't afford this option.");
    return;
  }
  
  gameState.cash -= choice.cost;
  
  if (choice.effect.reputation) gameState.reputation += choice.effect.reputation;
  if (choice.effect.stress) gameState.stress = clamp(gameState.stress + choice.effect.stress, 0, 100);
  if (choice.effect.gamble) {
    const result = randomInRange(choice.effect.gamble.min, choice.effect.gamble.max);
    gameState.cash += result;
    const msg = result >= 0 ? `Investment paid off! Gained $${formatNumber(result)}` : `Investment failed. Lost $${formatNumber(Math.abs(result))}`;
    addNews(msg, result >= 0 ? 'positive' : 'negative', null);
  }
  
  elements.randomEventOverlay.classList.remove('active');
  render();
}

function showMorningBriefing() {
  elements.morningDate.textContent = `Day ${gameState.day} | ${DAY_NAMES[gameState.dayOfWeek]}`;
  
  if (todayNews.length === 0) {
    elements.morningNews.innerHTML = '<div class="empty-state">No significant news today.</div>';
  } else {
    elements.morningNews.innerHTML = todayNews.map(item => {
      // Type indicator for attentive players
      let typeHint = '';
      if (item.newsType === 'eps_driven') {
        typeHint = '<span class="news-tag type-eps">FUNDAMENTAL</span>';
      } else if (item.newsType === 'hybrid') {
        typeHint = '<span class="news-tag type-hybrid">DEVELOPING</span>';
      } else if (item.newsType === 'sentiment') {
        typeHint = '<span class="news-tag type-sentiment">OPINION</span>';
      }
      
      return `
        <div class="news-item ${item.sentiment}">
          <div class="news-headline">${item.headline}</div>
          ${item.description ? `<div class="news-desc">${item.description}</div>` : ''}
          <div class="news-tags">
            ${item.relatedStock ? `<span class="news-tag">REF: ${item.relatedStock}</span>` : ''}
            ${item.isMarketWide ? `<span class="news-tag">MARKET-WIDE</span>` : ''}
            ${typeHint}
          </div>
        </div>
      `;
    }).join('');
  }
  
  elements.morningOverlay.classList.add('active');
}

function closeMorningBriefing() {
  elements.morningOverlay.classList.remove('active');
}

function showEvent(title, message) {
  elements.eventTitle.textContent = title;
  elements.eventBody.textContent = message;
  elements.eventOverlay.classList.add('active');
}

function closeEventOverlay() {
  elements.eventOverlay.classList.remove('active');
}

// ========== OPTIONS OPPORTUNITY DETECTION ==========

function checkOptionOpportunities() {
  // Get all opportunities from options.js
  const opportunities = getAllOptionOpportunities();
  
  // Store for UI to access
  gameState.currentOptionOpportunities = opportunities;
  
  // Generate news for high-confidence opportunities
  opportunities.forEach(opp => {
    if (opp.confidence >= 50) {
      const type = opp.type === 'call' ? '📈' : '📉';
      const action = opp.type === 'call' ? 'CALL' : 'PUT';
      
      todayNews.push({
        headline: `${type} ${action} opportunity: ${opp.stock.symbol}`,
        description: opp.reasoning[0],
        sentiment: opp.type === 'call' ? 'positive' : 'negative',
        newsType: 'options_opportunity',
        relatedStock: opp.stock.symbol,
        optionData: opp
      });
    }
  });
}
