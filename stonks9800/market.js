// ===== STONKS 9800 - Stage 03 - Market & Trading =====

function updateStockPrices() {
  // Process all market phenomena
  processInstitutionalManipulation();
  processShortSqueeze();
  processShortSellerReports();
  processDeadCatBounce();
  processFOMO();
  processMeanReversion();
  processInsiderTrading();
  processStockSplits();
  processAnalystRatings();
  processIndexRebalancing();
  
  // New phenomena
  processSectorRotation();
  processDividendTraps();
  processGaps();
  processCorrelationBreakdown();
  processLiquidityCrisis();
  processWindowDressing();
  processTaxLossHarvesting();
  processJanuaryEffect();
  processCircuitBreakers();
  updateYTDReturns();
  
  // Options processing
  processOptionExpirations();
  updateOptionValues();
  
  stocks = stocks.map(stock => {
    // Calculate current fair value based on EPS modifier
    stock.fairValue = stock.basePrice * (1 + stock.epsModifier);
    
    // CAP sentimentOffset to prevent runaway prices
    // Max +300% (4x price) or -80% (0.2x price) from fair value due to sentiment
    const MAX_SENTIMENT_POSITIVE = 3.0;
    const MAX_SENTIMENT_NEGATIVE = -0.8;
    stock.sentimentOffset = Math.max(MAX_SENTIMENT_NEGATIVE, Math.min(MAX_SENTIMENT_POSITIVE, stock.sentimentOffset));
    
    // Natural decay of sentiment toward 0 (markets normalize over time)
    // Decay 2% of sentiment per day toward equilibrium
    if (Math.abs(stock.sentimentOffset) > 0.01) {
      stock.sentimentOffset *= 0.98;
    }
    
    // Institutional accumulation adds hidden buying pressure
    // This pushes price above fair value without fundamental reason
    const manipulationPressure = stock.institutionalAccumulation * 0.15;
    
    // Price gravitates toward fair value + sentiment offset + manipulation
    const targetPrice = stock.fairValue * (1 + stock.sentimentOffset + manipulationPressure);
    
    // Base volatility + any temporary boost
    const effectiveVolatility = stock.volatility * (1 + stock.volatilityBoost);
    
    // Random market noise - reduced during crash phases to let the pattern show clearly
    const noiseMultiplier = stock.crashPhase ? 0.3 : 1.0; // 70% less noise during crash/bounce
    const noise = (Math.random() - 0.5) * 2 * effectiveVolatility * noiseMultiplier;
    
    // Price discovery: move toward target with noise
    // Speed of convergence depends on how far off we are
    // Reduced during crash phases to let sentiment drive the pattern
    const currentDeviation = (stock.price - targetPrice) / targetPrice;
    const baseConvergenceSpeed = stock.crashPhase ? 0.05 : 0.15; // Slower correction during crash
    const correction = -currentDeviation * baseConvergenceSpeed;
    
    // Base trend still applies (company growth/decline)
    // But reduced during crash phases
    const trendMultiplier = stock.crashPhase ? 0.3 : 1.0;
    const trendEffect = stock.trend * 0.05 * trendMultiplier;
    
    // DIRECT PRICE SHOCK on event transition days
    // Ensures news matches price action (e.g., "bounce begins" = price UP same day)
    // Used by: dead cat bounce, manipulation, FOMO, short squeeze, insider, splits, etc.
    const transitionEffect = stock.crashTransitionEffect || 0;
    stock.crashTransitionEffect = 0; // Reset after use
    
    // Calculate new price
    let newPrice = stock.price * (1 + trendEffect + correction + noise + transitionEffect);
    
    // Price sanity checks
    // Floor at 5% of base price (allows deep crashes) or $1 minimum (penny stock territory)
    const priceFloor = Math.max(1, stock.basePrice * 0.05);
    const priceCeiling = stock.basePrice * 20; // Ceiling at 20x base price (even GME didn't go higher)
    newPrice = Math.max(priceFloor, Math.min(priceCeiling, newPrice));
    
    // Update history
    const newHistory = [...stock.history, { day: gameState.day, price: newPrice }];
    if (newHistory.length > MAX_HISTORY_POINTS) newHistory.shift();
    
    return { 
      ...stock, 
      previousPrice: stock.price, 
      price: Math.round(newPrice), 
      history: newHistory 
    };
  });
}

// Institutional manipulation: Multi-wave pump & dump
// Pattern: [accumulation → catalyst → distribution]* → final_crash
// Can have 1-3 pump cycles before the final dump
// REALISTIC: ~40% success rate - most schemes fail (SEC, fizzle, false positive)
function processInstitutionalManipulation() {
  stocks.forEach(stock => {
    if (!stock.manipulationPhase) return;
    
    // Cancel manipulation if event type was disabled (e.g., loaded save with active manipulation)
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('institutional_manipulation')) {
      stock.manipulationPhase = null;
      stock.manipulationWave = null;
      stock.institutionalAccumulation = 0;
      return;
    }
    
    stock.manipulationDaysLeft--;
    
    if (stock.manipulationPhase === 'accumulation') {
      // Quiet accumulation - slowly build position, minimal price impact
      stock.institutionalAccumulation += 0.08 + Math.random() * 0.05;
      stock.institutionalAccumulation = Math.min(1, stock.institutionalAccumulation);
      
      // Small unexplained upticks (smart money buying)
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset += 0.01 * memeMultiplier; // Subtle but visible
      
      if (stock.manipulationDaysLeft <= 0) {
        // Determine outcome - manipulation often fails in real life
        // ~40% success (pump happens), ~60% failure
        const roll = Math.random();
        
        if (roll < 0.20) {
          // SEC intervention (20%) - trading halted, investigation
          stock.manipulationPhase = 'sec_intervention';
          stock.manipulationDaysLeft = 2;
          generateManipulationSECNews(stock);
        } else if (roll < 0.40) {
          // Scheme fizzles (20%) - no catalyst materializes
          stock.manipulationPhase = 'fizzle';
          stock.manipulationDaysLeft = 3;
          generateManipulationFizzleNews(stock);
        } else {
          // Success (60% after accumulation, but only ~40% overall)
          // Ready for catalyst
          stock.manipulationPhase = 'catalyst';
          stock.manipulationDaysLeft = 1;
        }
      }
    }
    else if (stock.manipulationPhase === 'sec_intervention') {
      // SEC halted trading - bad for anyone holding
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.15 * memeMultiplier;
      
      if (stock.manipulationDaysLeft <= 0) {
        // Trading resumes at lower price, manipulation over
        stock.sentimentOffset -= 0.10 * memeMultiplier;
        stock.manipulationPhase = null;
        stock.manipulationWave = null;
      }
    }
    else if (stock.manipulationPhase === 'fizzle') {
      // Scheme collapsed - price drifts back down
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.03 * memeMultiplier;
      stock.institutionalAccumulation -= 0.2; // Quiet selling
      
      if (stock.manipulationDaysLeft <= 0) {
        stock.manipulationPhase = null;
        stock.manipulationWave = null;
        stock.institutionalAccumulation = 0;
      }
    }
    else if (stock.manipulationPhase === 'catalyst') {
      // The big news drops - price spikes
      // DIRECT PRICE IMPACT: Pump catalyst = price spikes UP (8-15%)
      const memeMultiplier = getMemeMultiplier(stock);
      stock.crashTransitionEffect = (0.08 + Math.random() * 0.07) * memeMultiplier;
      stock.sentimentOffset += 0.15 * memeMultiplier;
      
      // (News is generated separately in events.js)
      stock.manipulationPhase = 'distribution';
      stock.manipulationDaysLeft = 3 + Math.floor(Math.random() * 3); // 3-5 days to distribute
    }
    else if (stock.manipulationPhase === 'distribution') {
      // Institutions selling into the rally
      // Price stays elevated while retail buys the hype
      stock.institutionalAccumulation -= 0.25; // Rapid selling
      
      if (stock.manipulationDaysLeft <= 0 || stock.institutionalAccumulation <= 0) {
        // Initialize wave tracking if not present
        if (!stock.manipulationWave) stock.manipulationWave = 1;
        
        // Decide: another pump cycle or final crash?
        // Wave 1: 60% chance of another cycle
        // Wave 2: 40% chance of another cycle  
        // Wave 3+: Always crash (max 3 cycles)
        const continueChance = stock.manipulationWave === 1 ? 0.60 : 
                               stock.manipulationWave === 2 ? 0.40 : 0;
        
        if (Math.random() < continueChance) {
          // Another pump cycle! Back to accumulation
          stock.manipulationWave++;
          stock.manipulationPhase = 're_accumulation';
          stock.manipulationDaysLeft = 3 + Math.floor(Math.random() * 3); // 3-5 days re-accumulation
          stock.institutionalAccumulation = 0.3; // Start with some position from previous cycle
          
          // Generate "consolidation" news - disguises the re-accumulation
          generateManipulationReaccumulationNews(stock);
        } else {
          // Final dump incoming
          stock.manipulationPhase = 'crash';
          stock.manipulationDaysLeft = 2 + Math.floor(Math.random() * 2); // 2-3 days crash
          stock.institutionalAccumulation = 0;
          // DIRECT PRICE IMPACT: Manipulation crash begins = price dumps (12-20%)
          const memeMultiplier = getMemeMultiplier(stock);
          const waveMultiplier = 1 + (stock.manipulationWave - 1) * 0.3; // +30% crash per wave
          stock.crashTransitionEffect = -(0.12 + Math.random() * 0.08) * memeMultiplier * waveMultiplier;
          
          // Generate "smart money exits" news
          generateManipulationCrashNews(stock);
        }
      }
    }
    else if (stock.manipulationPhase === 're_accumulation') {
      // Quieter accumulation between pump cycles
      // Price drifts sideways/slightly down - "healthy consolidation"
      stock.institutionalAccumulation += 0.10 + Math.random() * 0.08;
      stock.institutionalAccumulation = Math.min(1, stock.institutionalAccumulation);
      
      // Slight negative drift to shake out weak hands
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.02 * memeMultiplier;
      
      if (stock.manipulationDaysLeft <= 0) {
        // Ready for next pump catalyst
        stock.manipulationPhase = 'catalyst';
        stock.manipulationDaysLeft = 1;
      }
    }
    else if (stock.manipulationPhase === 'crash') {
      // Retail bag holders - solid stocks recover faster
      const memeMultiplier = getMemeMultiplier(stock);
      // Multi-wave schemes crash HARDER - more retail trapped
      const waveMultiplier = 1 + (stock.manipulationWave - 1) * 0.3; // +30% crash per wave
      
      // Continued selling pressure during crash
      stock.sentimentOffset -= 0.18 * memeMultiplier * waveMultiplier;

      if (stock.manipulationDaysLeft <= 0) {
        // Overshoot below fair value (panic selling)
        stock.sentimentOffset = (-0.15 - Math.random() * 0.10) * memeMultiplier * waveMultiplier;
        
        // Clean up
        stock.manipulationPhase = null;
        stock.manipulationWave = null;
      }
    }
  });
}

// Generate news for re-accumulation phase (disguised as consolidation)
function generateManipulationReaccumulationNews(stock) {
  const waveNum = stock.manipulationWave || 2;
  const headlines = [
    `${stock.symbol} pulls back after recent gains - "healthy consolidation"`,
    `Analysts: ${stock.symbol} dip is buying opportunity`,
    `${stock.symbol} forming base for next leg higher?`,
    `${stock.symbol} volume dries up - bulls taking a breather`
  ];
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: `Wave ${waveNum} accumulation underway. Smart money reloading positions.`,
    sentiment: 'neutral',
    relatedStock: stock.symbol,
    newsType: 'manipulation',
    manipulationPhase: 're_accumulation',
    manipulationWave: waveNum,
    isManipulation: true,
    isReaccumulation: true
  });
}

// Generate SEC intervention news (manipulation caught)
function generateManipulationSECNews(stock) {
  const headlines = [
    `⚠️ SEC halts trading in ${stock.symbol} pending investigation`,
    `BREAKING: ${stock.symbol} trading suspended amid manipulation probe`,
    `${stock.symbol} HALTED: SEC investigating suspicious trading activity`,
    `Regulators freeze ${stock.symbol} shares - market manipulation suspected`
  ];
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: "⚠️ TEACHING MOMENT: Most manipulation schemes get caught. SEC monitors unusual volume patterns. Don't chase suspicious moves.",
    sentiment: 'negative',
    relatedStock: stock.symbol,
    newsType: 'manipulation',
    manipulationPhase: 'sec_intervention',
    isManipulation: true,
    isSECIntervention: true,
    isManipulationFailed: true
  });
}

// Generate fizzle news (manipulation scheme collapsed)
function generateManipulationFizzleNews(stock) {
  const headlines = [
    `${stock.symbol} volume spike fades - no catalyst materializes`,
    `${stock.symbol}: Suspicious activity leads to nothing`,
    `${stock.symbol} buying pressure disappears without catalyst`,
    `${stock.symbol} drifts lower after unexplained buying pressure`
  ];
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: "⚠️ TEACHING MOMENT: Not every 'suspicious volume' is manipulation. Many schemes fail before completion. Don't assume every pattern plays out.",
    sentiment: 'neutral',
    relatedStock: stock.symbol,
    newsType: 'manipulation',
    manipulationPhase: 'fizzle',
    isManipulation: true,
    isManipulationFizzle: true,
    isManipulationFailed: true
  });
}

// Start a new manipulation scheme on a random stock
function startInstitutionalScheme() {
  // Find stocks not currently being manipulated
  const eligibleStocks = stocks.filter(s => !s.manipulationPhase);
  if (eligibleStocks.length === 0) return null;
  
  const target = randomChoice(eligibleStocks);
  
  target.manipulationPhase = 'accumulation';
  target.manipulationDaysLeft = 5 + Math.floor(Math.random() * 5); // 5-10 days accumulation
  target.institutionalAccumulation = 0;
  target.manipulationWave = 1; // Track pump cycle number
  
  // Generate subtle accumulation news
  return target;
}

// Generate the catalyst news for manipulation (wave-aware)
function generateManipulationCatalystNews(stock) {
  const waveNum = stock.manipulationWave || 1;
  
  // Different catalysts for different waves
  const wave1Catalysts = [
    { headline: `BREAKING: ${stock.symbol} in talks for major acquisition`, type: 'merger' },
    { headline: `Insider sources: ${stock.symbol} partnership with tech giant imminent`, type: 'partnership' },
    { headline: `EXCLUSIVE: ${stock.symbol} sitting on breakthrough technology`, type: 'tech' },
    { headline: `Rumor: Private equity circling ${stock.symbol} for buyout`, type: 'buyout' },
    { headline: `${stock.symbol} to announce "transformative" deal says source`, type: 'deal' }
  ];
  
  const wave2Catalysts = [
    { headline: `UPDATE: ${stock.symbol} deal "moving forward" despite skeptics`, type: 'deal_update' },
    { headline: `${stock.symbol} CFO: "Transformational changes coming soon"`, type: 'executive' },
    { headline: `Analyst raises ${stock.symbol} target amid deal speculation`, type: 'upgrade' },
    { headline: `${stock.symbol} "significantly undervalued" says investment bank`, type: 'valuation' }
  ];
  
  const wave3Catalysts = [
    { headline: `${stock.symbol} board meeting "imminent" - sources`, type: 'board' },
    { headline: `Multiple bidders reportedly interested in ${stock.symbol}`, type: 'bidding' },
    { headline: `${stock.symbol}: "Final negotiations" underway per insider`, type: 'final' }
  ];
  
  const catalystPool = waveNum === 1 ? wave1Catalysts : 
                       waveNum === 2 ? wave2Catalysts : wave3Catalysts;
  const catalyst = randomChoice(catalystPool);
  
  // Big sentiment spike - scaled by meme factor (solid stocks resist manipulation)
  // Each successive wave has slightly smaller impact (skepticism building)
  const memeMultiplier = getMemeMultiplier(stock);
  const waveDecay = 1 - (waveNum - 1) * 0.15; // 15% less effective each wave
  stock.sentimentOffset += (0.25 + Math.random() * 0.25) * memeMultiplier * waveDecay;
  stock.volatilityBoost += 1.0 * memeMultiplier * waveDecay;
  
  return {
    headline: catalyst.headline,
    description: waveNum > 1 
      ? `Wave ${waveNum} of positive rumors. Each new catalyst attracts more retail buyers.`
      : "Unverified reports driving intense speculation.",
    sentiment: 'positive',
    relatedStock: stock.symbol,
    newsType: 'manipulation',
    isManipulation: true,
    manipulationType: catalyst.type,
    manipulationWave: waveNum
  };
}

// Generate crash news after distribution (final dump - wave-aware)
function generateManipulationCrashNews(stock) {
  const waveNum = stock.manipulationWave || 1;
  
  const crashNews = waveNum > 1 ? [
    `${stock.symbol}: After ${waveNum} waves of hype, reality sets in`,
    `${stock.symbol} crashes as "deal" evaporates - retail left holding bags`,
    `SEC opens inquiry into ${stock.symbol} trading patterns`,
    `${stock.symbol}: All ${waveNum} rumored catalysts prove baseless`,
    `Analysts: ${stock.symbol} was classic multi-pump scheme`
  ] : [
    `${stock.symbol} acquisition talks "never existed" says company`,
    `${stock.symbol} denies partnership rumors, shares tumble`,
    `Sources: ${stock.symbol} deal fell through, insiders already sold`,
    `SEC reviewing unusual trading activity in ${stock.symbol}`,
    `Analysts: ${stock.symbol} rally was "disconnected from fundamentals"`
  ];
  
  todayNews.push({
    headline: randomChoice(crashNews),
    description: waveNum > 1 
      ? `After ${waveNum} pump cycles, smart money has fully exited. Damage is severe.`
      : "Smart money appears to have exited positions.",
    sentiment: 'negative',
    relatedStock: stock.symbol,
    newsType: 'manipulation',
    isManipulation: true,
    isCrash: true,
    manipulationWave: waveNum
  });
}

// ========== SHORT SQUEEZE MECHANICS ==========

function processShortSqueeze() {
  stocks.forEach(stock => {
    // Update short interest based on price movement
    if (stock.previousPrice && stock.price > stock.previousPrice) {
      // Price rising makes shorts nervous, some cover
      stock.shortInterest *= 0.98;
    } else if (stock.previousPrice && stock.price < stock.previousPrice) {
      // Price falling attracts more shorts
      stock.shortInterest *= 1.01;
    }
    stock.shortInterest = Math.max(0.02, Math.min(0.50, stock.shortInterest));
    
    if (!stock.shortSqueezePhase) return;
    
    // Cancel squeeze if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('short_squeeze')) {
      stock.shortSqueezePhase = null;
      return;
    }
    
    stock.shortSqueezeDaysLeft--;
    
    if (stock.shortSqueezePhase === 'building') {
      // Shorts are piling in, price being suppressed - meme stocks get hammered harder
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.02 * memeMultiplier;
      stock.shortInterest += 0.03;
      
      if (stock.shortSqueezeDaysLeft <= 0) {
        // Ready to squeeze - need a catalyst
        stock.shortSqueezePhase = 'ready';
      }
    }
    else if (stock.shortSqueezePhase === 'squeeze') {
      // SQUEEZE IN PROGRESS - GME-style for meme stocks, modest for blue chips
      const memeMultiplier = getMemeMultiplier(stock);
      const squeezeIntensity = stock.shortInterest * 3; // Higher short interest = bigger squeeze
      stock.sentimentOffset += (0.20 + squeezeIntensity * 0.40) * memeMultiplier; // 6-18% solid, 20-60% meme
      stock.shortInterest -= 0.10; // Shorts panic covering
      stock.volatilityBoost = Math.max(stock.volatilityBoost, 1.5 * memeMultiplier);
      
      if (stock.shortSqueezeDaysLeft <= 0 || stock.shortInterest < 0.10) {
        stock.shortSqueezePhase = 'unwind';
        stock.shortSqueezeDaysLeft = 3 + Math.floor(Math.random() * 3);
        // DIRECT PRICE IMPACT: Unwind begins = price drops (8-14%)
        stock.crashTransitionEffect = -(0.08 + Math.random() * 0.06) * memeMultiplier;
      }
    }
    else if (stock.shortSqueezePhase === 'unwind') {
      // Post-squeeze correction - brutal for meme, modest for solid
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset -= 0.12 * memeMultiplier;
      
      if (stock.shortSqueezeDaysLeft <= 0) {
        stock.shortSqueezePhase = null;
        // Some permanent gain if fundamentals support it, otherwise full reversal
        if (stock.epsModifier > 0) {
          stock.sentimentOffset = 0.05; // Keep some gains
        } else {
          stock.sentimentOffset = -0.03; // Overshoot down
        }
      }
    }
  });
}

// Start building short interest on a stock
function startShortBuild(stock) {
  if (stock.shortSqueezePhase) return false;
  
  stock.shortSqueezePhase = 'building';
  stock.shortSqueezeDaysLeft = 5 + Math.floor(Math.random() * 5);
  return true;
}

// Trigger a short squeeze (called when catalyst hits heavily shorted stock)
function triggerShortSqueeze(stock) {
  if (stock.shortInterest < 0.20) return false; // Need at least 20% short interest
  
  stock.shortSqueezePhase = 'squeeze';
  stock.shortSqueezeDaysLeft = 2 + Math.floor(Math.random() * 3); // 2-4 days of squeeze
  
  // DIRECT PRICE IMPACT: Squeeze starts = massive spike UP (10-20%)
  const memeMultiplier = getMemeMultiplier(stock);
  stock.crashTransitionEffect = (0.10 + Math.random() * 0.10) * memeMultiplier;
  
  return true;
}

// ========== DEAD CAT BOUNCE MECHANICS ==========
// Multi-bounce pattern: crash → [bounce → decline]* → resolution
// Can have 1-4 false bounces before true bottom (or continued decline)

function processDeadCatBounce() {
  stocks.forEach(stock => {
    // Track recent performance
    if (stock.price > stock.recentHigh) stock.recentHigh = stock.price;
    if (stock.price < stock.recentLow) stock.recentLow = stock.price;
    
    // Track consecutive days
    if (stock.price > stock.previousPrice) {
      stock.consecutiveUpDays++;
      stock.consecutiveDownDays = 0;
    } else if (stock.price < stock.previousPrice) {
      stock.consecutiveDownDays++;
      stock.consecutiveUpDays = 0;
    }
    
    if (!stock.crashPhase) return;
    
    // Cancel crash/bounce if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('dead_cat_bounce')) {
      stock.crashPhase = null;
      stock.bounceNumber = 0;
      return;
    }
    
    stock.crashDaysLeft--;
    
    if (stock.crashPhase === 'crash') {
      // Initial crash phase - meme stocks crash harder
      const memeMultiplier = getMemeMultiplier(stock);
      
      if (stock.crashDaysLeft <= 0) {
        // Initialize bounce tracking
        if (!stock.bounceNumber) stock.bounceNumber = 0;
        stock.bounceNumber++;
        
        // Set up the bounce (the trap!)
        stock.crashPhase = 'bounce';
        // Each successive bounce is shorter (less conviction)
        const bounceDuration = Math.max(1, 3 - Math.floor(stock.bounceNumber / 2));
        stock.crashDaysLeft = bounceDuration + Math.floor(Math.random() * 2);
        
        // DIRECT PRICE IMPACT: Bounce day = price goes UP (3-8%)
        const bounceStrength = Math.max(0.03, 0.08 - (stock.bounceNumber - 1) * 0.015);
        stock.crashTransitionEffect = bounceStrength + Math.random() * 0.03; // +3% to +11%
        stock.sentimentOffset += (bounceStrength + Math.random() * 0.05) * memeMultiplier;
        
        // Generate news for bounce starting (only once per bounce)
        if (!stock.bounceNewsGenerated) {
          generateAnotherBounceNews(stock);
          stock.bounceNewsGenerated = true;
        }
      } else {
        // Still crashing
        stock.sentimentOffset -= (0.12 + Math.random() * 0.08) * memeMultiplier;
      }
    }
    else if (stock.crashPhase === 'bounce') {
      // The deceptive bounce - each bounce is weaker than the last
      const memeMultiplier = getMemeMultiplier(stock);
      
      if (stock.crashDaysLeft <= 0) {
        // Trap sprung - continued decline
        // DIRECT PRICE IMPACT: Bounce fail day = price goes DOWN (5-10%)
        const failDrop = 0.05 + Math.random() * 0.05;
        stock.crashTransitionEffect = -failDrop; // -5% to -10%
        stock.sentimentOffset -= failDrop * memeMultiplier;
        
        stock.crashPhase = 'continued_decline';
        stock.crashDaysLeft = 2 + Math.floor(Math.random() * 2);
        
        // Generate "bounce failed" news (only once per bounce)
        if (stock.bounceNewsGenerated) {
          generateBounceFailedNews(stock);
          stock.bounceNewsGenerated = false; // Reset for next bounce
        }
      } else {
        // Still bouncing - price rises (the trap)
        const bounceStrength = Math.max(0.03, 0.12 - (stock.bounceNumber - 1) * 0.025); // Weaker each time
        stock.sentimentOffset += (bounceStrength + Math.random() * 0.05) * memeMultiplier;
      }
    }
    else if (stock.crashPhase === 'continued_decline') {
      // The next leg down - meme stocks fall harder
      const memeMultiplier = getMemeMultiplier(stock);
      
      if (stock.crashDaysLeft <= 0) {
        // Decide: another bounce or resolution?
        // Bounce 1: 70% another bounce
        // Bounce 2: 50% another bounce
        // Bounce 3: 30% another bounce
        // Bounce 4+: Always resolve (max 4 bounces)
        const anotherBounceChance = stock.bounceNumber === 1 ? 0.70 :
                                    stock.bounceNumber === 2 ? 0.50 :
                                    stock.bounceNumber === 3 ? 0.30 : 0;
        
        if (Math.random() < anotherBounceChance) {
          // Another dead cat bounce incoming
          stock.bounceNumber++;
          stock.crashPhase = 'bounce';
          const bounceDuration = Math.max(1, 3 - Math.floor(stock.bounceNumber / 2));
          stock.crashDaysLeft = bounceDuration + Math.floor(Math.random() * 2);
          
          // DIRECT PRICE IMPACT: Bounce day = price goes UP (weaker each time)
          const bounceStrength = Math.max(0.03, 0.08 - (stock.bounceNumber - 1) * 0.015);
          stock.crashTransitionEffect = bounceStrength + Math.random() * 0.03; // +3% to +11%, weaker each bounce
          stock.sentimentOffset += (bounceStrength + Math.random() * 0.05) * memeMultiplier;
          
          // Generate "finding support" news (another trap) - only once per bounce
          if (!stock.bounceNewsGenerated) {
            generateAnotherBounceNews(stock);
            stock.bounceNewsGenerated = true;
          }
        } else {
          // Resolution - did we find the bottom?
          stock.crashPhase = 'resolution';
          stock.crashDaysLeft = 1;
        }
      } else {
        // Still declining - apply daily drop
        const declineSeverity = Math.max(0.05, 0.12 - (stock.bounceNumber - 1) * 0.02);
        stock.sentimentOffset -= (declineSeverity + Math.random() * 0.06) * memeMultiplier;
      }
    }
    else if (stock.crashPhase === 'resolution') {
      const memeMultiplier = getMemeMultiplier(stock);
      // More bounces = more likely this is finally the bottom (capitulation)
      // Bounce 1: 30% real bottom
      // Bounce 2: 45% real bottom  
      // Bounce 3: 60% real bottom
      // Bounce 4: 80% real bottom
      const bottomChance = 0.30 + (stock.bounceNumber - 1) * 0.15;
      
      if (Math.random() < bottomChance) {
        // This was the real bottom - recovery begins
        stock.sentimentOffset = -0.03 * memeMultiplier;
        stock.recentLow = stock.price;
        generateRealBottomNews(stock);
      } else {
        // Secular decline continues (long-term downtrend)
        stock.sentimentOffset = -0.12 * memeMultiplier;
        generateSecularDeclineNews(stock);
      }
      
      // Clean up
      stock.crashPhase = null;
      stock.bounceNumber = null;
    }
  });
}

// Generate news for failed bounce - uses technical indicators for education
function generateBounceFailedNews(stock) {
  const bounceNum = stock.bounceNumber || 1;
  const ordinal = bounceNum === 1 ? '1st' : bounceNum === 2 ? '2nd' : bounceNum === 3 ? '3rd' : `${bounceNum}th`;
  
  // Simulate RSI values (lower on later bounces as oversold deepens)
  const rsiValue = Math.max(12, 32 - (bounceNum * 5) + Math.floor(Math.random() * 6));
  
  const headlines = [
    `📉 ${stock.symbol} BOUNCE #${bounceNum} FAILS - back to decline`,
    `${stock.symbol} bounce #${bounceNum} REJECTED - rally fades`,
    `Bulls trapped: ${stock.symbol} bounce #${bounceNum} reverses`,
    `${stock.symbol}: Bounce #${bounceNum} OVER - sellers return`
  ];
  
  // Educational descriptions with different indicators per bounce
  let description;
  if (bounceNum === 1) {
    description = `⚠️ BOUNCE #1 FAILED despite RSI(14)=${rsiValue} oversold signal. Single indicator not reliable. 70% fail rate on first bounce. WAIT for bounce #3+.`;
  } else if (bounceNum === 2) {
    description = `⚠️ BOUNCE #2 FAILED. RSI(14)=${rsiValue} and volume declining but not enough. 50% fail rate. Need more confirmation - WAIT for bounce #3+.`;
  } else if (bounceNum === 3) {
    description = `📊 BOUNCE #3 FAILED. RSI(14)=${rsiValue} deeply oversold, selling volume exhausting. 30% fail rate now. Next bounce has 60%+ real bottom probability.`;
  } else {
    const bottomChance = Math.min(90, 60 + (bounceNum-3)*15);
    description = `📈 BOUNCE #${bounceNum} FAILED. RSI(14)=${rsiValue} extreme oversold + volume dried up. Sellers exhausted. ${bottomChance}% chance next move is REAL bottom.`;
  }
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: description,
    sentiment: 'negative',
    relatedStock: stock.symbol,
    newsType: 'dead_cat_bounce',
    isDeadCatBounce: true,
    bounceNumber: bounceNum,
    bounceRSI: rsiValue,
    isTrap: true
  });
}

// Generate news for another bounce attempt - uses technical indicators for education
function generateAnotherBounceNews(stock) {
  const bounceNum = stock.bounceNumber || 2;
  
  // Simulate technical indicator values
  const rsiValue = Math.max(10, 28 - (bounceNum * 4) + Math.floor(Math.random() * 5));
  const prevRsi = rsiValue - 3 - Math.floor(Math.random() * 4); // Previous RSI was lower
  const bollingerTouch = bounceNum >= 2; // Price at lower Bollinger band
  const volumeDrying = bounceNum >= 2; // Selling volume decreasing
  
  // Headlines vary by bounce number with technical details
  let headlines;
  if (bounceNum === 1) {
    headlines = [
      `📊 ${stock.symbol} BOUNCE #1 STARTS - RSI(14) oversold at ${rsiValue}`,
      `${stock.symbol} attempting recovery - bounce #1 begins`,
      `Bargain hunters lift ${stock.symbol} - bounce #1 underway`,
      `${stock.symbol} bounce #1 begins on RSI(14)=${rsiValue} oversold`
    ];
  } else if (bounceNum === 2) {
    headlines = [
      `📊 ${stock.symbol} BOUNCE #2 STARTS - RSI(14)=${rsiValue}`,
      `${stock.symbol} trying again - bounce #2 begins`,
      `${stock.symbol} bounce #2 underway - volume declining`,
      `Second bounce attempt for ${stock.symbol} - RSI(14)=${rsiValue}`
    ];
  } else if (bounceNum === 3) {
    headlines = [
      `📈 ${stock.symbol} BOUNCE #3 STARTS - RSI DIVERGENCE forming!`,
      `${stock.symbol} bounce #3 begins - bullish divergence detected`,
      `${stock.symbol} bounce #3 underway - RSI divergence + exhaustion`,
      `WATCH: ${stock.symbol} bounce #3 starts with bullish signals`
    ];
  } else {
    headlines = [
      `📈 ${stock.symbol} BOUNCE #${bounceNum} STARTS - Multiple signals!`,
      `${stock.symbol} bounce #${bounceNum} begins with confluence`,
      `${stock.symbol} bounce #${bounceNum} underway - strong setup`,
      `POTENTIAL BOTTOM: ${stock.symbol} bounce #${bounceNum} starts`
    ];
  }
  
  // Educational descriptions explaining what to look for
  const bottomChance = bounceNum === 1 ? 30 : bounceNum === 2 ? 45 : bounceNum === 3 ? 65 : Math.min(90, 65 + (bounceNum-3)*12);
  let description;
  
  if (bounceNum === 1) {
    description = `⚠️ BOUNCE #1: RSI(14)=${rsiValue} triggered buying. Single indicator = UNRELIABLE. 70% of first bounces FAIL. DO NOT BUY - wait for bounce #3+.`;
  } else if (bounceNum === 2) {
    description = `⚠️ BOUNCE #2: RSI(14)=${rsiValue} oversold + selling volume declining. Two signals but still only ${bottomChance}% success rate. RISKY - wait for bounce #3+.`;
  } else if (bounceNum === 3) {
    description = `📊 BOUNCE #3: RSI DIVERGENCE detected (price made new low, RSI(14) made higher low: ${prevRsi}→${rsiValue}). This is a bullish signal! ${bottomChance}% real bottom probability. CONSIDER BUYING.`;
  } else {
    description = `📈 BOUNCE #${bounceNum}: MULTIPLE CONFIRMATIONS - RSI divergence + price at lower Bollinger Band + volume exhaustion + support level. ${bottomChance}% real bottom probability. STRONG BUY SIGNAL.`;
  }
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: description,
    sentiment: 'positive',
    relatedStock: stock.symbol,
    newsType: 'dead_cat_bounce',
    isDeadCatBounce: true,
    bounceNumber: bounceNum,
    bounceRSI: rsiValue,
    hasRSIDivergence: bounceNum >= 3,
    hasBollingerTouch: bollingerTouch,
    hasVolumeExhaustion: volumeDrying,
    isTrap: bounceNum < 3 // Only a trap if bounce 1-2
  });
}

// Generate news for real bottom confirmation - summarizes all indicators
function generateRealBottomNews(stock) {
  const bounceNum = stock.bounceNumber || 1;
  const rsiValue = 18 + Math.floor(Math.random() * 8); // RSI recovering from extreme lows
  
  const headlines = [
    `✅ ${stock.symbol} BOTTOM CONFIRMED after ${bounceNum} bounce${bounceNum > 1 ? 'es' : ''}!`,
    `${stock.symbol} crash OVER - bounce #${bounceNum} held, recovery begins`,
    `📈 ${stock.symbol} finding real support after ${bounceNum} failed bounce${bounceNum > 1 ? 'es' : ''}`,
    `${stock.symbol}: Bounce #${bounceNum} SUCCESS - sellers exhausted, buyers stepping in`
  ];
  
  // Educational summary of what confirmed the bottom
  let confirmationText;
  if (bounceNum <= 2) {
    confirmationText = `Rare early bottom. RSI(14)=${rsiValue} recovering. Volume confirmation needed.`;
  } else if (bounceNum === 3) {
    confirmationText = `RSI(14) bullish divergence confirmed. Selling volume exhausted. Classic 3-bounce bottom pattern.`;
  } else {
    confirmationText = `MULTIPLE CONFIRMATIONS: ${bounceNum} bounces + RSI divergence + Bollinger Band support + volume capitulation. High conviction bottom.`;
  }
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: `✅ CONFIRMED BOTTOM after ${bounceNum} bounces. ${confirmationText} Recovery rally expected +15% to +25%.`,
    sentiment: 'positive',
    relatedStock: stock.symbol,
    newsType: 'crash_resolution',
    isCrashResolution: true,
    isRealBottom: true,
    bounceNumber: bounceNum,
    bounceRSI: rsiValue
  });
}

// Generate news for continued secular decline
function generateSecularDeclineNews(stock) {
  const headlines = [
    `${stock.symbol} enters secular decline - no bottom in sight`,
    `Analysts downgrade ${stock.symbol} price targets again`,
    `${stock.symbol}: Structural problems suggest more downside`,
    `${stock.symbol} trapped in downtrend - avoid catching knives`
  ];
  
  todayNews.push({
    headline: randomChoice(headlines),
    description: "Sometimes stocks don't recover. Not every dip should be bought.",
    sentiment: 'negative',
    relatedStock: stock.symbol,
    newsType: 'crash_resolution',
    isCrashResolution: true,
    isSecularDecline: true
  });
}

// Trigger a crash with potential dead cat bounce(s)
function triggerCrash(stock, severity) {
  if (stock.crashPhase) return false;
  
  const memeMultiplier = getMemeMultiplier(stock);
  stock.crashPhase = 'crash';
  stock.crashDaysLeft = 2 + Math.floor(Math.random() * 2);
  stock.preCrashPrice = stock.price;
  stock.sentimentOffset = -severity * memeMultiplier; // Meme stocks crash harder
  stock.volatilityBoost += 0.5 * memeMultiplier;
  stock.bounceNumber = 0; // Track number of bounces
  
  // DIRECT price impact on crash day - news says crash, price should crash TODAY
  // Severity is typically 0.22-0.40, so this gives -15% to -30% immediate drop
  stock.crashTransitionEffect = -(severity * 0.6 + Math.random() * severity * 0.2);
  
  return true;
}

// ========== FOMO RALLY MECHANICS ==========

function processFOMO() {
  stocks.forEach(stock => {
    // Skip stocks in active crash/bounce phases - they follow their own pattern
    if (stock.crashPhase) return;
    
    // Cancel FOMO if event type was disabled
    if (stock.fomoPhase && typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('fomo_rally')) {
      stock.fomoPhase = null;
      return;
    }
    
    // Decrement FOMO cooldown if active
    if (stock.fomoCooldown > 0) {
      stock.fomoCooldown--;
    }
    
    // Check for FOMO conditions
    const gainFromLow = stock.recentLow > 0 ? (stock.price - stock.recentLow) / stock.recentLow : 0;
    
    // If stock up >30% from recent low with multiple up days, FOMO may trigger
    // BUT only if not on cooldown from recent FOMO (prevents infinite FOMO loops)
    const canTriggerFomo = !stock.fomoPhase && !stock.fomoCooldown;
    // Only trigger new FOMO if event is enabled
    if (gainFromLow > 0.30 && stock.consecutiveUpDays >= 3 && canTriggerFomo) {
      if (Math.random() < 0.15 && (typeof isEventTypeEnabled !== 'function' || isEventTypeEnabled('fomo_rally'))) {
        stock.fomoPhase = 'building';
        stock.fomoDaysLeft = 3 + Math.floor(Math.random() * 4);
        stock.fomoStartSentiment = stock.sentimentOffset; // Track where we started
      }
    }
    
    if (!stock.fomoPhase) return;
    
    stock.fomoDaysLeft--;
    
    if (stock.fomoPhase === 'building') {
      // Retail piling in - meme stocks move more but capped to be realistic
      // Real FOMO rallies: ~5-10% daily gains for hot stocks, 10-20% for meme stocks
      const memeMultiplier = getMemeMultiplier(stock);
      const dailyGain = (0.03 + Math.random() * 0.04); // 3-7% base
      stock.sentimentOffset += dailyGain * Math.min(memeMultiplier, 2); // Cap meme effect
      stock.volatilityBoost += 0.2 * memeMultiplier;
      
      if (stock.fomoDaysLeft <= 0) {
        stock.fomoPhase = 'blowoff';
        stock.fomoDaysLeft = 1 + Math.floor(Math.random() * 2);
      }
    }
    else if (stock.fomoPhase === 'blowoff') {
      // Final surge - bigger move but still realistic (10-20% for regular, 20-40% for meme)
      const memeMultiplier = getMemeMultiplier(stock);
      const blowoffGain = (0.08 + Math.random() * 0.07); // 8-15% base
      // DIRECT PRICE IMPACT: Blowoff day = big spike UP
      stock.crashTransitionEffect = blowoffGain * Math.min(memeMultiplier, 2);
      stock.sentimentOffset += blowoffGain * Math.min(memeMultiplier, 2.5); // Slightly higher cap
      
      if (stock.fomoDaysLeft <= 0) {
        // DIRECT PRICE IMPACT: Collapse begins = price drops
        stock.crashTransitionEffect = -(0.08 + Math.random() * 0.05);
        stock.fomoPhase = 'collapse';
        stock.fomoDaysLeft = 3 + Math.floor(Math.random() * 3);
      }
    }
    else if (stock.fomoPhase === 'collapse') {
      // Late buyers get crushed - give back 50-70% of gains
      const memeMultiplier = getMemeMultiplier(stock);
      const collapseRate = (0.08 + Math.random() * 0.06); // 8-14% base daily drop
      stock.sentimentOffset -= collapseRate * Math.min(memeMultiplier, 2);
      
      if (stock.fomoDaysLeft <= 0) {
        stock.fomoPhase = null;
        stock.recentHigh = stock.price; // Reset tracking
        stock.consecutiveUpDays = 0;
        // Reset sentiment to slightly above where we started (some gains stick)
        const startSentiment = stock.fomoStartSentiment || 0;
        stock.sentimentOffset = startSentiment + 0.05; // Keep ~5% of the move
        stock.fomoStartSentiment = null;
        // 30-day cooldown before FOMO can trigger again on this stock
        stock.fomoCooldown = 30;
      }
    }
  });
}

// ========== MEAN REVERSION MECHANICS ==========

function processMeanReversion() {
  stocks.forEach(stock => {
    // Skip stocks in active crash/bounce phases - they follow their own pattern
    if (stock.crashPhase) return;
    
    // Calculate how far price is from fair value
    const deviation = (stock.price - stock.fairValue) / stock.fairValue;
    
    // Strong mean reversion pressure when >15% deviation
    if (Math.abs(deviation) > 0.15) {
      const reversionForce = -deviation * 0.08; // 8% of deviation pulls back
      stock.sentimentOffset += reversionForce;
    }
  });
}

// ========== SHORT SELLER REPORT MECHANICS ==========
// Reality: Short reports come in waves. Initial report causes 20-40% drop.
// Follow-up attacks (1-3 more) timed 1-2 weeks apart, often around earnings.
// Company responds with denial, partial recovery, then next wave hits.
// Resolution: Either vindicated (permanent damage) or debunked (recovery).

function processShortSellerReports() {
  stocks.forEach(stock => {
    if (!stock.shortReportPhase) return;
    
    // Cancel short report if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('short_seller_report')) {
      stock.shortReportPhase = null;
      return;
    }
    
    stock.shortReportDaysLeft--;
    const memeMultiplier = getMemeMultiplier(stock);
    
    if (stock.shortReportPhase === 'initial_crash') {
      // Wave 1: Initial report - MASSIVE immediate drop (20-35%)
      // Most of the damage happens on day 1
      stock.volatilityBoost = Math.max(stock.volatilityBoost, 1.5 * memeMultiplier);
      
      if (stock.shortReportDaysLeft <= 0) {
        stock.shortReportPhase = 'denial';
        stock.shortReportDaysLeft = 2 + Math.floor(Math.random() * 2); // 2-3 days
      }
    }
    else if (stock.shortReportPhase === 'denial') {
      // Company denial - partial recovery as bulls buy the dip
      stock.sentimentOffset += 0.06 * memeMultiplier; // Bounce attempt
      
      if (stock.shortReportDaysLeft <= 0) {
        // Determine if more waves coming
        stock.shortReportWave = (stock.shortReportWave || 1);
        const maxWaves = 2 + Math.floor(Math.random() * 3); // 2-4 total waves
        
        if (stock.shortReportWave < maxWaves && Math.random() < 0.75) {
          // Schedule next wave attack
          stock.shortReportPhase = 'waiting';
          stock.shortReportDaysLeft = 5 + Math.floor(Math.random() * 10); // 5-14 days until next wave
          stock.shortReportNextWave = stock.shortReportWave + 1;
        } else {
          // Move to final investigation phase
          stock.shortReportPhase = 'investigation';
          stock.shortReportDaysLeft = 5 + Math.floor(Math.random() * 5); // 5-10 days
          // Determine outcome now (but don't reveal yet)
          // More waves = more likely vindicated (they kept finding dirt)
          const vindicationChance = 0.50 + (stock.shortReportWave * 0.15); // 65-95%
          stock.shortReportVindicated = Math.random() < vindicationChance;
        }
      }
    }
    else if (stock.shortReportPhase === 'waiting') {
      // Between waves - stock drifts, uncertainty lingers
      stock.volatilityBoost = Math.max(stock.volatilityBoost, 0.3 * memeMultiplier);
      stock.sentimentOffset += (Math.random() - 0.45) * 0.02 * memeMultiplier; // Slight negative drift
      
      if (stock.shortReportDaysLeft <= 0) {
        // NEXT WAVE HITS!
        stock.shortReportPhase = 'followup_attack';
        stock.shortReportWave = stock.shortReportNextWave;
        stock.shortReportDaysLeft = 1; // Single day attack
      }
    }
    else if (stock.shortReportPhase === 'followup_attack') {
      // Wave 2/3/4: Follow-up attack with new evidence
      // Each wave does 10-20% additional damage
      const waveDamage = (0.10 + Math.random() * 0.10) * memeMultiplier;
      stock.sentimentOffset -= waveDamage;
      stock.price = Math.max(100, Math.round(stock.price * (1 - waveDamage * 0.7))); // Immediate impact
      stock.volatilityBoost = Math.max(stock.volatilityBoost, 1.2 * memeMultiplier);
      
      if (stock.shortReportDaysLeft <= 0) {
        stock.shortReportPhase = 'denial';
        stock.shortReportDaysLeft = 2 + Math.floor(Math.random() * 2);
      }
    }
    else if (stock.shortReportPhase === 'investigation') {
      // Final investigation phase - high volatility, uncertain direction
      stock.volatilityBoost = Math.max(stock.volatilityBoost, 0.4 * memeMultiplier);
      stock.sentimentOffset += (Math.random() - 0.5) * 0.03 * memeMultiplier;
      
      if (stock.shortReportDaysLeft <= 0) {
        stock.shortReportPhase = 'resolution';
        stock.shortReportDaysLeft = 1;
      }
    }
    else if (stock.shortReportPhase === 'resolution') {
      if (stock.shortReportVindicated) {
        // Report was correct - permanent destruction
        // Total damage scales with number of waves (they found real problems)
        const permanentDamage = 0.15 + (stock.shortReportWave || 1) * 0.05;
        stock.epsModifier -= permanentDamage * memeMultiplier;
        stock.sentimentOffset = -0.15 * memeMultiplier; // Final crash
        stock.basePrice *= (1 - permanentDamage); // Permanent fair value reduction
        // DIRECT PRICE IMPACT: Vindicated = final drop (8-12%)
        stock.crashTransitionEffect = -(0.08 + Math.random() * 0.04) * memeMultiplier;
      } else {
        // Report debunked - violent recovery (but not to original price)
        // Recovery is partial - mud sticks somewhat
        const recoveryAmount = 0.15 + Math.random() * 0.10; // 15-25% bounce
        stock.sentimentOffset = recoveryAmount * memeMultiplier;
        // DIRECT PRICE IMPACT: Debunked = strong recovery (10-18%)
        stock.crashTransitionEffect = (0.10 + Math.random() * 0.08) * memeMultiplier;
      }
      
      stock.shortReportPhase = null;
      stock.shortReportWave = 0;
      stock.volatilityBoost *= 0.5;
    }
  });
}

// Trigger a short seller report attack
// Reality: Initial report causes 20-40% drop, often in a single day
function triggerShortSellerReport(stock) {
  if (stock.shortReportPhase) return false;
  
  const memeMultiplier = getMemeMultiplier(stock);
  stock.shortReportPhase = 'initial_crash';
  stock.shortReportDaysLeft = 1; // Initial crash is immediate (1 day)
  stock.shortReportWave = 1;
  stock.preReportPrice = stock.price;
  
  // IMMEDIATE massive drop: 25-40% for solid stocks, up to 60% for meme stocks
  const initialDrop = (0.25 + Math.random() * 0.15) * memeMultiplier;
  stock.sentimentOffset = -initialDrop;
  
  // Apply immediate price impact (don't wait for gradual convergence)
  stock.price = Math.max(100, Math.round(stock.price * (1 - initialDrop * 0.8)));
  
  stock.volatilityBoost += 1.5 * memeMultiplier;
  
  return true;
}

// ========== INSIDER TRADING SIGNALS MECHANICS ==========

function processInsiderTrading() {
  stocks.forEach(stock => {
    if (!stock.insiderPhase) return;
    
    // Cancel insider activity if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('insider_buying')) {
      stock.insiderPhase = null;
      return;
    }
    
    stock.insiderDaysLeft--;
    
    if (stock.insiderPhase === 'accumulating') {
      // Insiders buying - visible price support that players can act on
      // Daily accumulation should show clear positive trend
      const memeMultiplier = getMemeMultiplier(stock);
      stock.insiderBuyAmount += 0.02 + Math.random() * 0.02;
      stock.sentimentOffset += 0.025 * memeMultiplier; // +2.5% daily boost (scaled by stability)
      
      if (stock.insiderDaysLeft <= 0) {
        // Determine outcome - insider buying doesn't ALWAYS lead to good news
        // Real-world: ~70% of significant insider buying precedes positive catalysts
        // But 30% of time: routine purchase, bad timing, or insiders were wrong
        const successRate = 0.70;
        
        if (Math.random() < successRate) {
          // Good news incoming!
          stock.insiderPhase = 'catalyst';
          stock.insiderDaysLeft = 1;
        } else {
          // Insider buying was a false signal
          stock.insiderPhase = 'fizzle';
          stock.insiderDaysLeft = 1;
        }
      }
    }
    else if (stock.insiderPhase === 'catalyst') {
      // The good news drops (generated in events.js)
      // DIRECT PRICE IMPACT: Insider catalyst = price jumps UP (5-10%)
      const memeMultiplier = getMemeMultiplier(stock);
      stock.crashTransitionEffect = (0.05 + Math.random() * 0.05) * memeMultiplier;
      stock.sentimentOffset += 0.08 * memeMultiplier;
      
      stock.insiderPhase = null;
      stock.insiderBuyAmount = 0;
    }
    else if (stock.insiderPhase === 'fizzle') {
      // Insider buying led to nothing - price drifts back
      // Teaches: insider buying is a SIGNAL, not a guarantee
      // DIRECT PRICE IMPACT: Fizzle = disappointment drop (3-6%)
      stock.crashTransitionEffect = -(0.03 + Math.random() * 0.03);
      stock.sentimentOffset -= stock.insiderBuyAmount * 0.3; // Give back some gains
      stock.insiderPhase = null;
      stock.insiderBuyAmount = 0;
    }
  });
}

// Start insider buying on a stock
function startInsiderBuying(stock) {
  if (stock.insiderPhase) return false;
  
  stock.insiderPhase = 'accumulating';
  stock.insiderDaysLeft = 3 + Math.floor(Math.random() * 5); // 3-7 days of buying
  stock.insiderBuyAmount = 0;
  
  // Initial sentiment boost on first insider buying announcement
  // Insider buying is a bullish signal - should cause immediate small price uptick
  const memeMultiplier = getMemeMultiplier(stock);
  stock.sentimentOffset += 0.03 * memeMultiplier; // +3% initial boost (scaled by stability)
  
  return true;
}

// ========== STOCK SPLIT MECHANICS ==========

function processStockSplits() {
  stocks.forEach(stock => {
    if (!stock.splitPhase) return;
    
    // Cancel split if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('stock_split')) {
      stock.splitPhase = null;
      return;
    }
    
    stock.splitDaysLeft--;
    
    if (stock.splitPhase === 'announced') {
      // Rally into split - psychological boost
      const memeMultiplier = getMemeMultiplier(stock);
      stock.sentimentOffset += (0.02 + Math.random() * 0.01) * memeMultiplier;
      
      if (stock.splitDaysLeft <= 0) {
        // Split effective - adjust price
        stock.splitPhase = 'effective';
        stock.splitDaysLeft = 1;
      }
    }
    else if (stock.splitPhase === 'effective') {
      // Apply the split (but don't change total value for holders)
      // In a real game, we'd multiply shares held by splitRatio
      // For simulation, we just adjust the price display
      stock.basePrice = stock.basePrice / stock.splitRatio;
      stock.fairValue = stock.fairValue / stock.splitRatio;
      stock.price = Math.round(stock.price / stock.splitRatio);
      stock.previousPrice = Math.round(stock.previousPrice / stock.splitRatio);
      
      // Post-split often sees continued momentum
      // DIRECT PRICE IMPACT: Post-split enthusiasm (3-6% above split-adjusted price)
      const postSplitMemeMultiplier = getMemeMultiplier(stock);
      stock.crashTransitionEffect = 0.03 + Math.random() * 0.03;
      stock.sentimentOffset += 0.02 * postSplitMemeMultiplier;
      stock.splitPhase = null;
      stock.splitRatio = 0;
    }
  });
}

// Announce a stock split
function announceStockSplit(stock, ratio) {
  if (stock.splitPhase) return false;
  
  stock.splitPhase = 'announced';
  stock.splitDaysLeft = 5 + Math.floor(Math.random() * 5); // 5-10 days until effective
  stock.splitRatio = ratio;
  const memeMultiplier = getMemeMultiplier(stock);
  stock.sentimentOffset += 0.05 * memeMultiplier; // Initial pop on announcement
  
  return true;
}

// ========== ANALYST RATING MECHANICS ==========

function processAnalystRatings() {
  stocks.forEach(stock => {
    if (!stock.pendingRatingChange) return;
    
    // Cancel pending rating if event type was disabled
    if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('analyst')) {
      stock.pendingRatingChange = null;
      return;
    }
    
    stock.ratingChangeDaysLeft--;
    
    if (stock.ratingChangeDaysLeft <= 0) {
      // Rating change takes effect
      const memeMultiplier = getMemeMultiplier(stock);
      if (stock.pendingRatingChange === 'upgrade') {
        stock.analystRating = Math.min(3, stock.analystRating + 1);
        stock.sentimentOffset += (0.04 + Math.random() * 0.03) * memeMultiplier; // 4-7% pop (scaled)
        // Raise target price
        stock.targetPrice = stock.price * (1.15 + Math.random() * 0.10);
      } else if (stock.pendingRatingChange === 'downgrade') {
        stock.analystRating = Math.max(0, stock.analystRating - 1);
        stock.sentimentOffset -= (0.04 + Math.random() * 0.03) * memeMultiplier; // 4-7% drop (scaled)
        // Lower target price
        stock.targetPrice = stock.price * (0.85 + Math.random() * 0.10);
      }
      
      stock.pendingRatingChange = null;
    }
  });
}

// Schedule analyst rating change
function scheduleRatingChange(stock, direction) {
  if (stock.pendingRatingChange) return false;
  
  stock.pendingRatingChange = direction;
  stock.ratingChangeDaysLeft = 1; // Takes effect next day
  
  return true;
}

// ========== INDEX REBALANCING MECHANICS ==========

function processIndexRebalancing() {
  stocks.forEach(stock => {
    if (!stock.indexPhase) return;
    
    stock.indexDaysLeft--;
    const memeMultiplier = getMemeMultiplier(stock);
    
    if (stock.indexPhase === 'addition_announced' || stock.indexPhase === 'removal_announced') {
      // Rally/decline into effective date as funds front-run
      // Modern studies (2010s+): Total move ~5-7%, player captures ~3-5%
      // Markets are more efficient now - less alpha available
      if (stock.indexAction === 'add') {
        stock.sentimentOffset += (0.005 + Math.random() * 0.007) * memeMultiplier; // 0.5-1.2% daily (scaled)
      } else {
        stock.sentimentOffset -= (0.005 + Math.random() * 0.007) * memeMultiplier; // 0.5-1.2% daily selling (scaled)
      }
      
      if (stock.indexDaysLeft <= 0) {
        stock.indexPhase = 'effective';
        stock.indexDaysLeft = 1;
      }
    }
    else if (stock.indexPhase === 'effective') {
      // Massive volume on effective date, then often reverses slightly
      if (stock.indexAction === 'add') {
        stock.sentimentOffset += 0.03 * memeMultiplier; // Final push, but...
        // Set up slight reversal as front-running unwinds
        setTimeout(() => {
          stock.sentimentOffset -= 0.02 * memeMultiplier;
        }, 0);
      } else {
        stock.sentimentOffset -= 0.03 * memeMultiplier;
        setTimeout(() => {
          stock.sentimentOffset += 0.02 * memeMultiplier;
        }, 0);
      }
      
      stock.indexPhase = null;
      stock.indexAction = null;
    }
  });
}

// Announce index inclusion/removal
function announceIndexChange(stock, action) {
  if (stock.indexPhase) return false;
  
  stock.indexPhase = action === 'add' ? 'addition_announced' : 'removal_announced';
  stock.indexDaysLeft = 5 + Math.floor(Math.random() * 3); // 5-7 days until effective
  stock.indexAction = action;
  
  // Initial reaction - this happens BEFORE player sees news
  // Real-world: ~2-3% instant move on announcement, rest comes from front-running
  const memeMultiplier = getMemeMultiplier(stock);
  if (action === 'add') {
    stock.sentimentOffset += (0.02 + Math.random() * 0.01) * memeMultiplier; // 2-3% initial pop (scaled)
  } else {
    stock.sentimentOffset -= (0.02 + Math.random() * 0.01) * memeMultiplier; // 2-3% initial drop (scaled)
  }
  
  return true;
}

// ========== SECTOR ROTATION MECHANICS ==========

function processSectorRotation() {
  if (!gameState.sectorRotationTarget) return;
  
  // Cancel sector rotation if event type was disabled
  if (typeof isEventTypeEnabled === 'function' && !isEventTypeEnabled('sector_rotation')) {
    gameState.sectorRotationTarget = null;
    return;
  }
  
  // Money flows into target sector, out of others
  stocks.forEach(stock => {
    const memeMultiplier = getMemeMultiplier(stock);
    if (stock.sector === gameState.sectorRotationTarget) {
      stock.sentimentOffset += (0.01 + Math.random() * 0.01) * memeMultiplier; // Inflow (scaled)
    } else {
      stock.sentimentOffset -= 0.005 * memeMultiplier; // Outflow from other sectors (scaled)
    }
  });
}

// Start sector rotation
function startSectorRotation(targetSector, sentiment) {
  gameState.sectorRotationTarget = targetSector;
  gameState.marketSentiment = sentiment;
  
  // Rotation lasts 5-15 days
  gameState.activeEffects.push({
    type: 'sector_rotation',
    sector: targetSector,
    daysActive: 0,
    duration: 5 + Math.floor(Math.random() * 10)
  });
}

// ========== DIVIDEND TRAP MECHANICS ==========

function processDividendTraps() {
  stocks.forEach(stock => {
    // Calculate effective yield based on current price vs base
    const priceDropFromBase = (stock.basePrice - stock.price) / stock.basePrice;
    
    // If price dropped significantly, yield looks artificially high
    if (priceDropFromBase > 0.30) {
      stock.dividendAtRisk = true;
      // High chance of dividend cut if EPS is negative
      if (stock.epsModifier < -0.10 && Math.random() < 0.02) {
        // Dividend cut! Meme stocks react worse
        const memeMultiplier = getMemeMultiplier(stock);
        stock.dividendYield *= 0.5; // Cut dividend in half
        stock.sentimentOffset -= 0.10 * memeMultiplier; // Price drops further
        return { stock, cut: true };
      }
    } else {
      stock.dividendAtRisk = false;
    }
  });
}

// ========== GAP UP/DOWN MECHANICS ==========

function processGaps() {
  stocks.forEach(stock => {
    if (stock.pendingGap !== 0) {
      // Apply the gap
      stock.sentimentOffset += stock.pendingGap;
      stock.pendingGap = 0;
    }
  });
}

// Schedule a gap for overnight
function scheduleGap(stock, magnitude) {
  stock.pendingGap = magnitude;
}

// ========== CORRELATION BREAKDOWN MECHANICS ==========

function processCorrelationBreakdown() {
  if (!gameState.correlationStable) {
    // When correlation breaks, similar stocks diverge randomly
    const sectors = {};
    stocks.forEach(stock => {
      if (!sectors[stock.sector]) sectors[stock.sector] = [];
      sectors[stock.sector].push(stock);
    });
    
    Object.values(sectors).forEach(sectorStocks => {
      if (sectorStocks.length < 2) return;
      // Random divergence within sector
      sectorStocks.forEach(stock => {
        const memeMultiplier = getMemeMultiplier(stock);
        stock.sentimentOffset += (Math.random() - 0.5) * 0.08 * memeMultiplier;
      });
    });
  }
}

// ========== LIQUIDITY CRISIS MECHANICS ==========

function processLiquidityCrisis() {
  if (!gameState.liquidityCrisis) return;
  
  // All stocks drift down, high volatility
  stocks.forEach(stock => {
    const memeMultiplier = getMemeMultiplier(stock);
    stock.sentimentOffset -= (0.02 + Math.random() * 0.03) * memeMultiplier;
    stock.volatilityBoost = Math.max(stock.volatilityBoost, 0.5 * memeMultiplier);
  });
}

// ========== WINDOW DRESSING MECHANICS ==========

function processWindowDressing() {
  // Check if it's last week of quarter (days 22-30 of months 3,6,9,12)
  const isQuarterEnd = [3, 6, 9, 12].includes(gameState.month) && gameState.day >= 22;
  
  if (!isQuarterEnd) return;
  
  stocks.forEach(stock => {
    const memeMultiplier = getMemeMultiplier(stock);
    // Fund managers buy winners, sell losers
    if (stock.ytdReturn > 0.20) {
      stock.sentimentOffset += 0.01 * memeMultiplier; // Buying winners (scaled)
    } else if (stock.ytdReturn < -0.20) {
      stock.sentimentOffset -= 0.01 * memeMultiplier; // Selling losers (scaled)
    }
  });
}

// ========== TAX LOSS HARVESTING MECHANICS ==========

function processTaxLossHarvesting() {
  // Only in December
  if (gameState.month !== 12) return;
  
  stocks.forEach(stock => {
    // Heavy selling in year's biggest losers
    if (stock.ytdReturn < -0.25) {
      stock.sentimentOffset -= 0.015; // Tax selling pressure
    }
  });
}

// Check for January Effect (reversal)
function processJanuaryEffect() {
  // First week of January - beaten down stocks bounce
  if (gameState.month === 1 && gameState.day <= 7) {
    stocks.forEach(stock => {
      if (stock.ytdReturn < -0.25) {
        stock.sentimentOffset += 0.02; // January bounce
      }
    });
  }
}

// ========== CIRCUIT BREAKER MECHANICS ==========

function processCircuitBreakers() {
  stocks.forEach(stock => {
    if (stock.tradingHalted) {
      stock.haltDaysLeft--;
      if (stock.haltDaysLeft <= 0) {
        stock.tradingHalted = false;
      }
      return;
    }
    
    // Check for circuit breaker trigger
    const dailyChange = stock.previousPrice > 0 
      ? (stock.price - stock.previousPrice) / stock.previousPrice 
      : 0;
    
    if (Math.abs(dailyChange) >= 0.10) { // 10% move triggers halt
      stock.tradingHalted = true;
      stock.haltDaysLeft = 1;
    }
  });
}

// Trigger circuit breaker
function triggerCircuitBreaker(stock) {
  stock.tradingHalted = true;
  stock.haltDaysLeft = 1;
}

// ========== EARNINGS WHISPER MECHANICS ==========

function processEarningsWhisper() {
  // Whisper numbers are hidden expectations that differ from official
  // This is handled in events.js when earnings news is generated
}

// ========== YTD RETURN TRACKING ==========

function updateYTDReturns() {
  // Reset at year start
  if (gameState.month === 1 && gameState.day === 1) {
    stocks.forEach(stock => {
      stock.ytdReturn = 0;
      stock.basePrice = stock.price; // Reset base for YTD calc
    });
    return;
  }
  
  // Update YTD returns
  stocks.forEach(stock => {
    if (stock.basePrice > 0) {
      stock.ytdReturn = (stock.price - stock.basePrice) / stock.basePrice;
    }
  });
}

// ========== CAPITULATION MECHANICS ==========

function checkCapitulation(stock) {
  // Capitulation = extreme selling, often marks bottom
  // Conditions: Down >25% from recent high, 5+ consecutive down days, high volume
  const dropFromHigh = stock.recentHigh > 0 ? (stock.recentHigh - stock.price) / stock.recentHigh : 0;
  
  if (dropFromHigh > 0.25 && stock.consecutiveDownDays >= 5) {
    if (Math.random() < 0.20) { // 20% chance when conditions met
      // Capitulation event - could be bottom
      stock.sentimentOffset = -0.10; // One more big drop
      stock.capitulationDay = true;
      
      // Schedule potential reversal
      gameState.activeEffects.push({
        type: 'capitulation_reversal',
        symbol: stock.symbol,
        daysActive: 0,
        reversalDay: 2 + Math.floor(Math.random() * 2)
      });
      
      return true;
    }
  }
  return false;
}

function applyNewsEffects() {
  // Process active effects (EPS recovery, sentiment snapback, volatility decay)
  gameState.activeEffects = gameState.activeEffects.filter(effect => {
    effect.daysActive = (effect.daysActive || 0) + 1;
    
    const stock = stocks.find(s => s.symbol === effect.symbol);
    if (!stock) return false;
    
    // EPS Recovery Phase
    if (effect.type === 'eps' && effect.recoveryDays > 0) {
      if (effect.daysActive > effect.phase1Days) {
        // In recovery phase - gradually recover
        const recoveryPerDay = effect.recoveryAmount / effect.recoveryDays;
        stock.epsModifier += recoveryPerDay;
      }
    }
    
    // Sentiment Snapback
    if (effect.type === 'sentiment' || effect.type === 'hybrid') {
      if (effect.snapbackDays > 0 && effect.daysActive <= effect.snapbackDays) {
        // Gradually reduce sentiment offset back toward 0
        const snapbackPerDay = Math.abs(effect.sentimentAmount) / effect.snapbackDays;
        // Move toward 0: if negative shock, add; if positive shock, subtract
        if (effect.sentimentAmount < 0) {
          stock.sentimentOffset += snapbackPerDay;
          if (stock.sentimentOffset > 0) stock.sentimentOffset = 0; // Don't overshoot
        } else {
          stock.sentimentOffset -= snapbackPerDay;
          if (stock.sentimentOffset < 0) stock.sentimentOffset = 0; // Don't overshoot
        }
      }
    }
    
    // Volatility decay
    if (effect.volatilityBoost && effect.volatilityDuration) {
      if (effect.daysActive >= effect.volatilityDuration) {
        stock.volatilityBoost = Math.max(0, stock.volatilityBoost - effect.volatilityBoost);
      }
    }
    
    // Remove effect when fully processed
    const totalDuration = Math.max(
      (effect.phase1Days || 0) + (effect.recoveryDays || 0),
      effect.snapbackDays || 0,
      effect.volatilityDuration || 0,
      effect.duration || 0
    );
    
    return effect.daysActive < totalDuration;
  });
  
  // Also decay any orphaned sentiment offsets slowly
  stocks.forEach(stock => {
    if (Math.abs(stock.sentimentOffset) > 0.001) {
      stock.sentimentOffset *= 0.95; // 5% decay per day
    } else {
      stock.sentimentOffset = 0;
    }
    
    // Decay volatility boost
    if (stock.volatilityBoost > 0) {
      stock.volatilityBoost *= 0.9; // 10% decay per day
      if (stock.volatilityBoost < 0.01) stock.volatilityBoost = 0;
    }
  });
}

// Apply immediate news effect to a stock
function applyNewsToStock(stock, newsEvent, newsType) {
  if (newsType === 'eps_driven') {
    const impact = newsEvent.epsImpact;
    
    // Calculate the SURPRISE factor (actual vs expected)
    // newsEvent carries the "reported" change to actual EPS
    const epsChange = impact.immediate;
    const newActualEPS = stock.actualEPS * (1 + epsChange);
    
    // The surprise is: how much did actual differ from expected?
    const surprise = (newActualEPS - stock.expectedEPS) / stock.expectedEPS;
    
    // Update actual EPS
    stock.actualEPS = newActualEPS;
    stock.epsModifier += epsChange;
    
    // Price reaction based on SURPRISE, not raw EPS change
    // Even good EPS can cause drops if it was already expected
    let priceReaction;
    
    if (surprise > 0.02) {
      // Beat expectations - but check if already priced in
      const pricedInFactor = Math.max(0, stock.priceInExpectation);
      priceReaction = surprise * (1 - pricedInFactor * 0.8);
      
      // If heavily priced in, can still drop ("sell the news")
      if (pricedInFactor > 0.7 && surprise < 0.10) {
        priceReaction = -0.02 - Math.random() * 0.03; // Profit taking
        newsEvent.sellTheNews = true;
      }
    } else if (surprise < -0.02) {
      // Missed expectations - always bad
      priceReaction = surprise * 1.5; // Misses hurt more than beats help
      newsEvent.missedExpectations = true;
    } else {
      // In-line with expectations - muted reaction
      priceReaction = surprise * 0.3;
      newsEvent.inLine = true;
    }
    
    // Apply sentiment (immediate price reaction)
    stock.sentimentOffset = priceReaction;
    
    // After earnings, expectations reset toward actual
    stock.expectedEPS = stock.actualEPS * (0.95 + Math.random() * 0.10);
    stock.priceInExpectation = 0; // Reset after reveal
    
    // Schedule recovery effect
    if (impact.recovery !== 0 && newsEvent.recoveryDays > 0) {
      gameState.activeEffects.push({
        type: 'eps',
        symbol: stock.symbol,
        phase1Days: 3,
        recoveryDays: newsEvent.recoveryDays,
        recoveryAmount: impact.recovery,
        permanentImpact: impact.permanent,
        daysActive: 0
      });
    }
    
  } else if (newsType === 'sentiment') {
    // Sentiment news affects EXPECTATIONS, not actual EPS
    // This is how "priced in" builds up before earnings
    
    if (newsEvent.expectationShift !== undefined) {
      // Analyst upgrades/downgrades shift expectations
      stock.expectedEPS *= (1 + newsEvent.expectationShift);
      
      // Price moves to reflect new expectations (gets "priced in")
      stock.priceInExpectation += newsEvent.expectationShift > 0 ? 0.3 : -0.2;
      stock.priceInExpectation = Math.max(-1, Math.min(1, stock.priceInExpectation));
    }
    
    // Immediate sentiment reaction (temporary)
    if (newsEvent.sentimentShock !== undefined) {
      stock.sentimentOffset += newsEvent.sentimentShock;
      
      // Apply immediate price impact (50% of sentiment shock happens today)
      // This makes news feel impactful rather than waiting for gradual convergence
      const immediateImpact = newsEvent.sentimentShock * 0.5;
      stock.price = Math.max(100, Math.round(stock.price * (1 + immediateImpact)));
      
      // Schedule snapback
      if (newsEvent.snapbackDays > 0) {
        gameState.activeEffects.push({
          type: 'sentiment',
          symbol: stock.symbol,
          sentimentAmount: newsEvent.sentimentShock,
          snapbackDays: newsEvent.snapbackDays,
          daysActive: 0
        });
      }
    }
    
    // Volatility boost for uncertain news
    if (newsEvent.volatilityBoost) {
      stock.volatilityBoost += newsEvent.volatilityBoost;
      gameState.activeEffects.push({
        type: 'volatility',
        symbol: stock.symbol,
        volatilityBoost: newsEvent.volatilityBoost,
        volatilityDuration: newsEvent.duration || 3,
        daysActive: 0
      });
    }
    
  } else if (newsType === 'hybrid') {
    // Both EPS impact AND sentiment overreaction
    const impact = newsEvent.epsImpact;
    const uncertainty = (Math.random() - 0.5) * 2 * impact.uncertainty;
    
    // EPS change
    stock.epsModifier += impact.immediate + uncertainty;
    
    // Sentiment overreaction (on top of fair value change)
    stock.sentimentOffset += newsEvent.sentimentOverreaction;
    
    // Schedule effects
    if (impact.recovery !== 0 && newsEvent.recoveryDays > 0) {
      gameState.activeEffects.push({
        type: 'eps',
        symbol: stock.symbol,
        phase1Days: 3,
        recoveryDays: newsEvent.recoveryDays,
        recoveryAmount: impact.recovery,
        daysActive: 0
      });
    }
    
    if (newsEvent.snapbackDays > 0) {
      gameState.activeEffects.push({
        type: 'hybrid',
        symbol: stock.symbol,
        sentimentAmount: newsEvent.sentimentOverreaction,
        snapbackDays: newsEvent.snapbackDays,
        daysActive: 0
      });
    }
  }
}

// Apply market-wide shock
function applyMarketShock(shock, duration) {
  stocks.forEach(stock => {
    stock.sentimentOffset += shock;
  });
  
  gameState.activeEffects.push({
    type: 'market',
    symbol: 'ALL',
    marketShock: shock,
    duration: duration,
    daysActive: 0
  });
}

// ========== TRANSACTION FEE CALCULATION ==========

function calculateTransactionFees(type, qty, price) {
  // US regulatory fees (commission-free era - only regulatory fees apply)
  // BUY: No fees (commission-free)
  // SELL: SEC fee + FINRA TAF
  
  if (type === 'buy') {
    return { secFee: 0, finraFee: 0, total: 0 };
  }
  
  const proceeds = qty * price;
  
  // SEC fee: $0.0000278 per dollar of sale proceeds
  const secFee = proceeds * TRANSACTION_FEES.SEC_FEE_RATE;
  
  // FINRA TAF: $0.000166 per share sold, max $8.30
  const finraFee = Math.min(qty * TRANSACTION_FEES.FINRA_TAF_RATE, TRANSACTION_FEES.FINRA_TAF_MAX);
  
  // Round up to minimum displayable amount
  const total = Math.max(secFee + finraFee, TRANSACTION_FEES.MIN_FEE);
  
  return {
    secFee: Math.round(secFee * 100) / 100,
    finraFee: Math.round(finraFee * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

function executeTrade(type) {
  if (!selectedStock || !gameState.canTrade) return false;
  
  const stock = stocks.find(s => s.symbol === selectedStock.symbol);
  if (!stock) return false;
  
  const qty = tradeQuantity;
  const fees = calculateTransactionFees(type, qty, stock.price);
  
  if (type === 'buy') {
    const totalCost = stock.price * qty;
    if (gameState.cash < totalCost) {
      showEvent("Insufficient Funds", `Need $${formatNumber(totalCost)} but only have $${formatNumber(gameState.cash)}`);
      return false;
    }
    
    gameState.cash -= totalCost;
    if (!gameState.holdings[stock.symbol]) {
      gameState.holdings[stock.symbol] = { qty: 0, totalCost: 0 };
    }
    gameState.holdings[stock.symbol].qty += qty;
    gameState.holdings[stock.symbol].totalCost += totalCost;
    
    // Log trade to journal
    if (typeof logTrade === 'function') {
      logTrade('BUY', stock, qty, stock.price, null);
    }
    
  } else if (type === 'sell') {
    const holding = gameState.holdings[stock.symbol];
    if (!holding || holding.qty < qty) {
      showEvent("Insufficient Holdings", `You only have ${holding?.qty || 0} shares`);
      return false;
    }
    
    const grossProceeds = stock.price * qty;
    const netProceeds = grossProceeds - fees.total;
    const avgCost = holding.totalCost / holding.qty;
    const gain = netProceeds - (avgCost * qty);
    
    gameState.cash += netProceeds;
    gameState.realizedGains += Math.max(0, gain);
    
    // Track total fees paid
    if (!gameState.totalFeesPaid) gameState.totalFeesPaid = 0;
    gameState.totalFeesPaid += fees.total;
    
    holding.qty -= qty;
    holding.totalCost -= avgCost * qty;
    if (holding.qty <= 0) delete gameState.holdings[stock.symbol];
    
    // Log trade to journal with P&L result and fees
    if (typeof logTrade === 'function') {
      logTrade('SELL', stock, qty, stock.price, { pnl: gain, avgCost: avgCost, fees: fees.total });
    }
    
    // Show fee deduction if significant
    if (fees.total >= 0.10) {
      console.log(`[FEES] ${stock.symbol} SELL: SEC $${fees.secFee.toFixed(2)} + FINRA $${fees.finraFee.toFixed(2)} = $${fees.total.toFixed(2)}`);
    }
  }
  
  gameState.totalTrades++;
  gameState.reputation += 0.1;
  
  render();
  updateDetailView();
  return true;
}

// ========== SHORT SELLING MECHANICS ==========

function executeShortSell(stock, qty) {
  // Requires reputation to short sell
  if (gameState.reputation < SHORT_SELL_REP_REQUIRED) {
    showEvent("Not Enough Reputation", `Need ${SHORT_SELL_REP_REQUIRED} reputation to short sell. Current: ${Math.floor(gameState.reputation)}`);
    return false;
  }
  
  if (stock.tradingHalted) {
    showEvent("Trading Halted", `${stock.symbol} is currently halted. Cannot short.`);
    return false;
  }
  
  // Margin requirement: 150% of position value
  const positionValue = stock.price * qty;
  const marginRequired = positionValue * 1.5;
  
  if (gameState.cash < marginRequired) {
    showEvent("Insufficient Margin", `Short selling requires $${formatNumber(marginRequired)} margin (150% of position)`);
    return false;
  }
  
  // Calculate fees (short selling = selling shares, so fees apply)
  const fees = calculateTransactionFees('sell', qty, stock.price);
  
  // Execute short: receive proceeds minus fees immediately, owe shares later
  const netProceeds = positionValue - fees.total;
  gameState.cash += netProceeds;
  
  // Track fees
  if (!gameState.totalFeesPaid) gameState.totalFeesPaid = 0;
  gameState.totalFeesPaid += fees.total;
  
  if (!gameState.shortPositions[stock.symbol]) {
    gameState.shortPositions[stock.symbol] = { qty: 0, entryPrice: 0, totalValue: 0 };
  }
  
  const pos = gameState.shortPositions[stock.symbol];
  const newTotalValue = pos.totalValue + positionValue;
  const newQty = pos.qty + qty;
  pos.entryPrice = newTotalValue / newQty; // Weighted average entry
  pos.qty = newQty;
  pos.totalValue = newTotalValue;
  
  gameState.totalTrades++;
  
  // Log short trade to journal with fees
  if (typeof logTrade === 'function') {
    logTrade('SHORT', stock, qty, stock.price, { fees: fees.total });
  }
  
  if (fees.total >= 0.10) {
    console.log(`[FEES] ${stock.symbol} SHORT: SEC $${fees.secFee.toFixed(2)} + FINRA $${fees.finraFee.toFixed(2)} = $${fees.total.toFixed(2)}`);
  }
  
  render();
  return true;
}

function coverShort(stock, qty) {
  const pos = gameState.shortPositions[stock.symbol];
  
  if (!pos || pos.qty < qty) {
    showEvent("No Short Position", `You only have ${pos?.qty || 0} shares shorted`);
    return false;
  }
  
  if (stock.tradingHalted) {
    showEvent("Trading Halted", `${stock.symbol} is currently halted. Cannot cover.`);
    return false;
  }
  
  // Cover: buy back shares at current price
  const coverCost = stock.price * qty;
  
  if (gameState.cash < coverCost) {
    showEvent("Insufficient Funds", `Need $${formatNumber(coverCost)} to cover short`);
    return false;
  }
  
  // Calculate P&L
  const entryValue = pos.entryPrice * qty;
  const profit = entryValue - coverCost; // Profit if price dropped
  
  gameState.cash -= coverCost;
  gameState.realizedGains += Math.max(0, profit);
  
  pos.qty -= qty;
  pos.totalValue -= pos.entryPrice * qty;
  if (pos.qty <= 0) delete gameState.shortPositions[stock.symbol];
  
  gameState.totalTrades++;
  
  // Log cover trade to journal with P&L
  if (typeof logTrade === 'function') {
    logTrade('COVER', stock, qty, stock.price, { pnl: profit, avgCost: pos.entryPrice });
  }
  
  render();
  return true;
}

// Calculate unrealized P&L on short positions
function calculateShortPnL() {
  let totalPnL = 0;
  
  Object.entries(gameState.shortPositions).forEach(([symbol, pos]) => {
    if (pos.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) {
        const currentValue = stock.price * pos.qty;
        const entryValue = pos.entryPrice * pos.qty;
        totalPnL += entryValue - currentValue; // Positive if price dropped
      }
    }
  });
  
  return totalPnL;
}

// Process daily borrowing cost for short positions
function processShortBorrowingCosts() {
  let totalCost = 0;
  
  Object.entries(gameState.shortPositions).forEach(([symbol, pos]) => {
    if (pos.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) {
        // Daily borrowing fee (0.1% of current position value)
        const dailyFee = Math.round(stock.price * pos.qty * SHORT_BORROW_RATE);
        totalCost += dailyFee;
      }
    }
  });
  
  if (totalCost > 0) {
    gameState.cash -= totalCost;
    // Don't generate news for small daily costs - only for large ones
    if (totalCost > 10000) {
      addNews(`Short borrow fees today: $${formatNumber(totalCost)}`, 'neutral', null);
    }
  }
  
  return totalCost;
}

// Constant for short selling reputation requirement is in constants.js

function processDividends() {
  let totalDividends = 0;
  
  Object.entries(gameState.holdings).forEach(([symbol, holding]) => {
    if (holding.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) {
        const dividend = Math.round(stock.price * (stock.dividendYield / 4) * holding.qty);
        const afterTax = Math.round(dividend * (1 - TAX.DIVIDEND));
        totalDividends += afterTax;
      }
    }
  });
  
  if (totalDividends > 0) {
    gameState.cash += totalDividends;
    gameState.stress = Math.max(0, gameState.stress - 5);
    addNews(`Quarterly dividends received: $${formatNumber(totalDividends)} (after tax)`, 'positive', null);
  }
}

function calculateEstimatedDividend() {
  let total = 0;
  Object.entries(gameState.holdings).forEach(([symbol, holding]) => {
    if (holding.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) {
        total += Math.round(stock.price * (stock.dividendYield / 4) * holding.qty * (1 - TAX.DIVIDEND));
      }
    }
  });
  return total;
}

function analyzeStock() {
  if (!selectedStock) return;
  
  const stock = stocks.find(s => s.symbol === selectedStock.symbol);
  if (!stock) return;
  
  const insights = [];
  
  // Price vs fair value analysis
  const priceToFairValue = stock.price / stock.fairValue;
  if (priceToFairValue > 1.3) {
    insights.push(`OVERVALUED: Trading ${((priceToFairValue - 1) * 100).toFixed(0)}% above fair value ($${formatNumber(stock.fairValue)})`);
  } else if (priceToFairValue < 0.7) {
    insights.push(`UNDERVALUED: Trading ${((1 - priceToFairValue) * 100).toFixed(0)}% below fair value ($${formatNumber(stock.fairValue)})`);
  } else {
    insights.push(`FAIR: Trading near fair value ($${formatNumber(stock.fairValue)})`);
  }
  
  // Sentiment analysis
  if (stock.sentimentOffset > 0.2) {
    insights.push(`BULLISH SENTIMENT: Market is ${(stock.sentimentOffset * 100).toFixed(0)}% optimistic`);
  } else if (stock.sentimentOffset < -0.2) {
    insights.push(`BEARISH SENTIMENT: Market is ${(Math.abs(stock.sentimentOffset) * 100).toFixed(0)}% pessimistic`);
  }
  
  // Active event detection
  if (stock.crashPhase) {
    if (stock.crashPhase === 'freefall') {
      insights.push(`⚠️ CRASH IN PROGRESS: Freefall phase, ${stock.crashDaysLeft} days left`);
    } else if (stock.crashPhase === 'deadcat') {
      insights.push(`⚠️ DEAD CAT BOUNCE #${stock.crashBounceNumber}: Temporary rebound in progress`);
    } else if (stock.crashPhase === 'recovery') {
      insights.push(`📈 RECOVERY: Post-crash stabilization`);
    }
  }
  
  if (stock.shortSqueezePhase) {
    insights.push(`🚀 SHORT SQUEEZE: ${stock.shortSqueezePhase} phase, ${stock.squeezeDaysLeft || '?'} days left`);
  }
  
  if (stock.manipulationPhase) {
    const phaseNames = {
      accumulation: '🔍 ACCUMULATION: Institutions quietly buying',
      pump: '📢 PUMP: Coordinated buying pressure',
      distribution: '💨 DISTRIBUTION: Smart money exiting',
      dump: '📉 DUMP: Price collapse imminent',
      sec_intervention: '🚨 SEC INTERVENTION: Investigation announced'
    };
    insights.push(phaseNames[stock.manipulationPhase] || `Manipulation: ${stock.manipulationPhase}`);
  }
  
  if (stock.fomoPhase) {
    insights.push(`🔥 FOMO RALLY: ${stock.fomoDaysLeft} days remaining before exhaustion`);
  }
  
  if (stock.shortSellerReport) {
    insights.push(`📋 SHORT SELLER REPORT: Under attack, ${stock.shortSellerReportDays} days left`);
  }
  
  // Short interest warning
  if (stock.shortInterest > 0.3) {
    insights.push(`⚡ HIGH SHORT INTEREST: ${(stock.shortInterest * 100).toFixed(0)}% - squeeze risk elevated`);
  } else if (stock.shortInterest > 0.2) {
    insights.push(`Short interest: ${(stock.shortInterest * 100).toFixed(0)}%`);
  }
  
  // Trading halted
  if (stock.tradingHalted) {
    insights.unshift(`⛔ TRADING HALTED: Circuit breaker active`);
  }
  
  // If no special events, give general advice
  if (insights.length <= 2) {
    const volatility = stock.volatility || 0.02;
    if (volatility > 0.04) {
      insights.push(`HIGH VOLATILITY: ${(volatility * 100).toFixed(1)}% daily swings`);
    }
  }
  
  elements.analysisContent.textContent = insights.join('\n');
}
