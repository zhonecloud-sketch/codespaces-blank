// ===== INDEX REBALANCING SYSTEM (EMPIRICALLY-BASED) =====
// Based on academic research on Index Effects and Forced Liquidity Events
//
// EMPIRICAL FOUNDATIONS:
// - Petajisto (2011): S&P 500 additions gain +8.8% from announcement to effective date
// - BPP (2021): Russell Reconstitution shows predictable mean-reversion post-inclusion
// - Cai (2007) / Kappou (2010): Post-inclusion reversal of 2-4% in 10-20 days
//
// KEY INSIGHT: WHY INDEX REBALANCING IS SO PREDICTABLE
// ═══════════════════════════════════════════════════════════════════
// This is a FORCED TRADE - passive funds MUST buy/sell regardless of price.
//
// The Mechanics:
//   1. Announcement Date: Index provider publishes additions/deletions
//   2. Front-Running: Speculators buy ahead of passive funds
//   3. Effective Date: Massive MOC (Market on Close) orders execute
//   4. Reversal: "Marginal buyer" is gone → mean reversion
//
// The Calendar is PUBLIC:
//   - S&P 500: Quarterly (March, June, Sept, Dec)
//   - Russell 2000: Annual reconstitution (last Friday of June)
//   - MSCI: Semi-annual (May, November)
//
// GOLD STANDARD 4-STEP FILTER (75-80% success rate):
//   Step 1: Size Matters - S&P 500 addition OR Russell 2000 deletion
//   Step 2: Run-up - Stock gained 5-10%+ from announcement to effective
//   Step 3: MOC Spike - 20-50x normal volume at close on effective date
//   Step 4: T+2 Reversal - First lower high Monday/Tuesday after effective
//
// EDUCATIONAL PURPOSE:
// Teaches players to:
// 1. Understand forced liquidity events (passive fund mechanics)
// 2. Read index rebalance calendars (publicly available)
// 3. Recognize the run-up pattern before effective date
// 4. Time entries on the reversal, NOT the addition announcement
// 5. Distinguish high-AUM indices (S&P 500) from low-AUM indices
//
// ARCHITECTURE:
// This module uses dependency injection for testability.

const IndexRebalance = (function() {
  'use strict';

  // ========== EMPIRICALLY-BASED CONSTANTS ==========
  const CONSTANTS = {
    // ========== GOLD STANDARD 75-80% SETUP ==========
    // The highest probability trade is the REVERSAL after effective date
    GOLD_STANDARD: {
      description: 'Short the exhaustion: S&P 500 addition with 5%+ run-up, MOC spike, T+2 lower high',
      requirements: {
        indexTier: 'tier1',              // S&P 500 or Russell 2000 (high passive AUM)
        minRunUp: 0.05,                  // At least 5% gain announcement → effective
        mocVolumeMultiple: 20,           // MOC volume ≥ 20x average
        reversalTiming: 2,               // T+2 (wait for first lower high)
        successRate: 0.78                // 75-80% success rate
      },
      educationalNote: 'The "Gold Standard" is NOT buying the addition - it\'s shorting the exhaustion after passive funds finish.'
    },

    // Index tiers by Passive AUM (Assets Under Management)
    INDEX_TIERS: {
      tier1: {
        name: 'Mega Indices',
        indices: ['S&P 500', 'Russell 2000', 'Russell 1000'],
        passiveAUM: '5+ trillion',
        impactMultiplier: 1.5,           // Larger forced buying impact
        reversalProbability: 0.78,       // Higher reversal probability
        description: 'Highest passive AUM - forced buying creates reliable price kinks'
      },
      tier2: {
        name: 'Major Indices',
        indices: ['MSCI World', 'FTSE 100', 'Nasdaq 100'],
        passiveAUM: '1-5 trillion',
        impactMultiplier: 1.2,
        reversalProbability: 0.65,
        description: 'Significant passive tracking - moderate forced buying effect'
      },
      tier3: {
        name: 'Sector/Thematic Indices',
        indices: ['S&P MidCap 400', 'S&P SmallCap 600', 'Sector ETFs'],
        passiveAUM: '100B-1T',
        impactMultiplier: 1.0,
        reversalProbability: 0.50,
        description: 'Lower passive AUM - less predictable forced buying'
      }
    },

    // Event types
    EVENT_TYPES: {
      addition: {
        probability: 0.60,               // 60% of events are additions
        runUpRange: { min: 0.05, max: 0.15 }, // 5-15% run-up
        reversalRange: { min: 0.02, max: 0.05 }, // 2-5% reversal
        description: 'Stock being added to index'
      },
      deletion: {
        probability: 0.40,               // 40% of events are deletions
        sellOffRange: { min: 0.08, max: 0.15 }, // 8-15% sell-off
        bounceRange: { min: 0.02, max: 0.04 }, // 2-4% bounce after
        description: 'Stock being removed from index'
      }
    },

    // Timeline (in trading days)
    // Empirical: 48-hour front-running window before effective date
    TIMELINE: {
      announcementToEffective: { min: 5, max: 10 }, // 5-10 days gap
      runUpPhase: { min: 3, max: 7 },               // Days of run-up
      frontRunWindow: 2,                            // Empirical: 48-hour (2-day) front-running window
      effectiveDay: 1,                              // The big day (MOC orders execute)
      reversalWindow: { min: 3, max: 5 },           // T+1 to T+5 reversal (need enough days for 2-5% reversal)
      totalDuration: { min: 10, max: 20 }           // Full cycle
    },

    // Volume patterns
    VOLUME: {
      announcementSpike: { min: 3, max: 5 },        // 3-5x on announcement
      runUpVolume: { min: 1.5, max: 2.5 },          // Elevated during run-up
      mocSpike: { min: 20, max: 50 },               // 20-50x at MOC
      postEffectiveNormal: { min: 1.0, max: 1.5 }   // Returns to normal
    },

    // Daily price impacts (as percentages)
    PRICE_IMPACT: {
      announcement: {
        addition: { min: 0.02, max: 0.04 },    // +2-4% on announcement
        deletion: { min: -0.04, max: -0.02 }   // -2-4% on announcement
      },
      runUp: {
        addition: { min: 0.005, max: 0.015 },  // +0.5-1.5% daily during run-up
        deletion: { min: -0.015, max: -0.005 } // -0.5-1.5% daily during sell-off
      },
      effectiveDay: {
        addition: { min: 0.01, max: 0.03 },    // +1-3% final push
        deletion: { min: -0.03, max: -0.01 }   // -1-3% final drop
      },
      reversal: {
        addition: { min: -0.015, max: -0.005 }, // -0.5-1.5% daily reversal
        deletion: { min: 0.005, max: 0.015 }    // +0.5-1.5% daily bounce
      }
    },

    // Veto factors that reduce reversal probability
    VETO_FACTORS: {
      fundamentalNews: {
        description: 'Earnings beat or major positive news',
        probabilityReduction: 0.30       // -30% to reversal probability
      },
      bullMarket: {
        description: 'Strong bull market momentum',
        probabilityReduction: 0.15       // -15% to reversal probability
      },
      institutionalOverhang: {
        description: 'Large institutional sellers waiting',
        probabilityReduction: 0.20       // -20% to reversal probability
      }
    },

    // Rebalance calendars (for educational display)
    CALENDARS: {
      sp500: {
        name: 'S&P 500',
        frequency: 'Quarterly',
        months: ['March', 'June', 'September', 'December'],
        announcementLead: '5-7 trading days before effective'
      },
      russell: {
        name: 'Russell 2000/1000',
        frequency: 'Annual (June)',
        months: ['June'],
        announcementLead: 'Preliminary list in May, final June',
        effectiveDate: 'Last Friday of June'
      },
      msci: {
        name: 'MSCI Indices',
        frequency: 'Semi-annual',
        months: ['May', 'November'],
        announcementLead: '2 weeks before effective'
      }
    }
  };

  // ========== DEPENDENCIES (injected for testing) ==========
  let deps = {
    stocks: null,
    todayNews: null,
    gameState: null,
    getMemeMultiplier: null,
    randomChoice: null,
    isEventTypeEnabled: null,
    random: Math.random
  };

  // ========== INITIALIZATION ==========
  function init(dependencies) {
    if (dependencies.stocks !== undefined) deps.stocks = dependencies.stocks;
    if (dependencies.todayNews !== undefined) deps.todayNews = dependencies.todayNews;
    if (dependencies.gameState !== undefined) deps.gameState = dependencies.gameState;
    if (dependencies.getMemeMultiplier !== undefined) deps.getMemeMultiplier = dependencies.getMemeMultiplier;
    if (dependencies.randomChoice !== undefined) deps.randomChoice = dependencies.randomChoice;
    if (dependencies.isEventTypeEnabled !== undefined) deps.isEventTypeEnabled = dependencies.isEventTypeEnabled;
    if (dependencies.random !== undefined) deps.random = dependencies.random;

    return IndexRebalance;
  }

  // ========== HELPER FUNCTIONS ==========
  function getStocks() {
    return deps.stocks || (typeof stocks !== 'undefined' ? stocks : []);
  }

  function getNews() {
    return deps.todayNews || (typeof todayNews !== 'undefined' ? todayNews : []);
  }

  function getGameState() {
    return deps.gameState || (typeof gameState !== 'undefined' ? gameState : { day: 0 });
  }

  function getMemeMultiplier(stock) {
    if (deps.getMemeMultiplier) return deps.getMemeMultiplier(stock);
    if (typeof window !== 'undefined' && typeof window.getMemeMultiplier === 'function') {
      return window.getMemeMultiplier(stock);
    }
    return (stock.isMeme || stock.volatility > 0.05) ? 1.5 : 1.0;
  }

  function randomChoice(arr) {
    if (deps.randomChoice) return deps.randomChoice(arr);
    if (typeof window !== 'undefined' && typeof window.randomChoice === 'function') {
      return window.randomChoice(arr);
    }
    return arr[Math.floor(deps.random() * arr.length)];
  }

  function isEventTypeEnabled(eventType) {
    if (deps.isEventTypeEnabled) return deps.isEventTypeEnabled(eventType);
    if (typeof window !== 'undefined' && typeof window.isEventTypeEnabled === 'function') {
      return window.isEventTypeEnabled(eventType);
    }
    return true;
  }

  function randomInRange(min, max) {
    return min + deps.random() * (max - min);
  }

  function randomIntInRange(min, max) {
    return Math.floor(randomInRange(min, max + 1));
  }

  // ========== DD-002 STANDARD API ==========
  /**
   * Get formatted date string from game state
   */
  function getDate() {
    const state = getGameState();
    const day = state.day || 0;
    const year = Math.floor(day / 252) + 1;
    const dayOfYear = day % 252;
    const month = Math.floor(dayOfYear / 21) + 1;
    const dayOfMonth = (dayOfYear % 21) + 1;
    return `${year}/${month}/${dayOfMonth}`;
  }

  /**
   * DD-002 Standard Price Event API
   * Sets stock.eventExpectedPrice and stock.eventExpectedDelta for GUI/log parity testing
   * @param {Object} stock - Stock object
   * @param {number} priceChange - Expected price change as decimal (e.g., 0.05 for 5%)
   * @param {string} phaseName - Current phase name for logging
   * @param {Object} rebal - Index rebalance state object
   * @param {string} extraLogInfo - Additional info to append to log
   * @returns {Object} { expectedPrice, priceChange, logString }
   */
  function setPriceEvent(stock, priceChange, phaseName, rebal, extraLogInfo = '') {
    const expectedPrice = Math.round(stock.price * (1 + priceChange) * 100) / 100;
    const actualDelta = (expectedPrice - stock.price) / stock.price;
    
    // Set transition effect for test validation
    stock.indexRebalanceTransitionEffect = priceChange;
    stock.eventExpectedPrice = expectedPrice;
    stock.eventExpectedDelta = actualDelta;
    
    // Build Gold Standard criteria display
    const gs = rebal.goldStandard || {};
    const criteriaKeys = ['isTier1', 'hasRunUp', 'hasMocSpike', 'hasReversalSetup'];
    const criteriaDisplay = criteriaKeys.map(k => (gs[k] ? '✓' : '✗') + k.replace('has', '').replace('is', '')).join(' ');
    
    // Count criteria met
    const criteriaMet = criteriaKeys.filter(k => gs[k]).length;
    
    const logString = `[INDEX] ${getDate()}: ${stock.symbol} ${phaseName} [$${expectedPrice.toFixed(2)} Δ${(actualDelta * 100).toFixed(2)}%] ${criteriaMet}/4 GoldStd [${criteriaDisplay}] ${extraLogInfo} [day=${rebal.day || getGameState().day}]`;
    
    return { expectedPrice, priceChange, logString };
  }

  // ========== CORE: CHECK FOR INDEX REBALANCE EVENTS ==========
  function checkIndexRebalanceEvents() {
    const stockList = getStocks();
    const news = getNews();
    const state = getGameState();

    // Process existing rebalance events
    stockList.forEach(stock => {
      if (stock.indexRebalance) {
        processIndexRebalance(stock);
      }
    });

    // Random chance to trigger new index rebalance (1% daily per stock)
    // In real game, this could be tied to calendar
    if (deps.random() < 0.01) {
      const eligibleStocks = stockList.filter(s => 
        !s.indexRebalance && 
        !s.crashPhase && 
        !s.shortReportPhase
      );
      
      if (eligibleStocks.length > 0) {
        const target = randomChoice(eligibleStocks);
        triggerIndexRebalance(target);
      }
    }
  }

  // ========== TRIGGER INDEX REBALANCE EVENT ==========
  function triggerIndexRebalance(stock, options = {}) {
    const eventType = options.eventType || (deps.random() < CONSTANTS.EVENT_TYPES.addition.probability ? 'addition' : 'deletion');
    const indexTier = options.indexTier || randomChoice(['tier1', 'tier2', 'tier3']);
    const indexInfo = CONSTANTS.INDEX_TIERS[indexTier];
    const indexName = options.indexName || randomChoice(indexInfo.indices);

    // Calculate timeline
    const announcementToEffective = randomIntInRange(
      CONSTANTS.TIMELINE.announcementToEffective.min,
      CONSTANTS.TIMELINE.announcementToEffective.max
    );
    const reversalDays = randomIntInRange(
      CONSTANTS.TIMELINE.reversalWindow.min,
      CONSTANTS.TIMELINE.reversalWindow.max
    );

    // Store state on stock
    stock.indexRebalance = {
      phase: 'announcement',
      eventType: eventType,
      indexTier: indexTier,
      indexName: indexName,
      announcementDay: getGameState().day,
      effectiveDay: getGameState().day + announcementToEffective,
      daysToEffective: announcementToEffective,
      reversalDays: reversalDays,
      priceAtAnnouncement: stock.price,
      runUpTotal: 0,
      mocVolumeMultiple: randomInRange(CONSTANTS.VOLUME.mocSpike.min, CONSTANTS.VOLUME.mocSpike.max),
      
      // Gold Standard tracking
      goldStandard: {
        isTier1: indexTier === 'tier1',
        hasRunUp: false,
        hasMocSpike: false,
        hasReversalSetup: false
      },

      // Veto factors
      vetoFactors: [],
      
      // For tutorial hints
      isAddition: eventType === 'addition'
    };

    // Generate announcement news
    generateAnnouncementNews(stock);

    return stock.indexRebalance;
  }

  // ========== PROCESS INDEX REBALANCE (called each day) ==========
  function processIndexRebalance(stock) {
    if (!stock.indexRebalance) return;

    const rebal = stock.indexRebalance;
    const state = getGameState();
    const currentDay = state.day;
    const daysFromAnnouncement = currentDay - rebal.announcementDay;
    const daysToEffective = rebal.effectiveDay - currentDay;
    const daysAfterEffective = currentDay - rebal.effectiveDay;

    // Update phase based on timeline
    if (daysToEffective > 0) {
      // Run-up phase (between announcement and effective)
      rebal.phase = 'runUp';
      processRunUpPhase(stock, daysToEffective);
    } else if (daysToEffective === 0) {
      // Effective date
      rebal.phase = 'effectiveDay';
      processEffectiveDay(stock);
    } else if (daysAfterEffective <= rebal.reversalDays) {
      // Reversal phase (T+1 through T+reversalDays, inclusive)
      rebal.phase = 'reversal';
      processReversalPhase(stock, daysAfterEffective);
    } else {
      // Event complete
      completeIndexRebalance(stock);
    }
  }

  // ========== PHASE PROCESSORS ==========
  function processRunUpPhase(stock, daysToEffective) {
    const rebal = stock.indexRebalance;
    const impactRange = rebal.isAddition ? 
      CONSTANTS.PRICE_IMPACT.runUp.addition : 
      CONSTANTS.PRICE_IMPACT.runUp.deletion;
    
    const tierMultiplier = CONSTANTS.INDEX_TIERS[rebal.indexTier].impactMultiplier;
    const memeMultiplier = getMemeMultiplier(stock);
    
    // Calculate daily impact
    const dailyImpact = randomInRange(impactRange.min, impactRange.max) * tierMultiplier * memeMultiplier;
    
    // Track cumulative run-up
    rebal.runUpTotal += dailyImpact;
    
    // Check Gold Standard run-up criterion (5%+)
    if (Math.abs(rebal.runUpTotal) >= CONSTANTS.GOLD_STANDARD.requirements.minRunUp) {
      rebal.goldStandard.hasRunUp = true;
    }

    // Store for price calculation
    rebal.dailyBias = dailyImpact;

    // Generate run-up news periodically
    if (daysToEffective === Math.floor(rebal.daysToEffective / 2)) {
      generateRunUpNews(stock);
    }
  }

  function processEffectiveDay(stock) {
    const rebal = stock.indexRebalance;
    const impactRange = rebal.isAddition ?
      CONSTANTS.PRICE_IMPACT.effectiveDay.addition :
      CONSTANTS.PRICE_IMPACT.effectiveDay.deletion;
    
    const tierMultiplier = CONSTANTS.INDEX_TIERS[rebal.indexTier].impactMultiplier;
    const memeMultiplier = getMemeMultiplier(stock);
    
    // Large effective day impact
    const effectiveImpact = randomInRange(impactRange.min, impactRange.max) * tierMultiplier * memeMultiplier;
    
    rebal.dailyBias = effectiveImpact;
    rebal.priceAtEffective = stock.price * (1 + effectiveImpact);
    
    // Mark MOC spike (always happens on effective day)
    rebal.goldStandard.hasMocSpike = true;

    // Generate effective day news
    generateEffectiveDayNews(stock);
  }

  function processReversalPhase(stock, daysIntoReversal) {
    const rebal = stock.indexRebalance;
    const impactRange = rebal.isAddition ?
      CONSTANTS.PRICE_IMPACT.reversal.addition :
      CONSTANTS.PRICE_IMPACT.reversal.deletion;
    
    // Mark reversal setup on T+2 (daysIntoReversal >= 2)
    // This is about the SETUP being present, not whether reversal succeeds
    if (daysIntoReversal >= 2) {
      rebal.goldStandard.hasReversalSetup = true;
    }
    
    // Calculate reversal probability (only once, on T+1)
    if (!rebal.reversalDecided) {
      let reversalProb = CONSTANTS.INDEX_TIERS[rebal.indexTier].reversalProbability;
      
      // Apply veto factors
      rebal.vetoFactors.forEach(veto => {
        reversalProb -= CONSTANTS.VETO_FACTORS[veto].probabilityReduction;
      });
      reversalProb = Math.max(0.20, reversalProb); // Floor at 20%
      
      // Decide once if reversal will happen for this event
      rebal.reversalDecided = true;
      rebal.reversalWillHappen = deps.random() < reversalProb;
      rebal.finalReversalProb = reversalProb;
      
      // If reversal won't happen and veto factors exist, generate veto news
      if (!rebal.reversalWillHappen && rebal.vetoFactors.length > 0) {
        generateVetoNews(stock);
      }
    }

    // Apply reversal bias if reversal is happening (on ALL reversal days)
    if (rebal.reversalWillHappen) {
      const dailyImpact = randomInRange(impactRange.min, impactRange.max);
      rebal.dailyBias = dailyImpact;
      
      // Generate reversal news on T+2
      if (daysIntoReversal === 2 && !rebal.reversalNewsGenerated) {
        rebal.reversalNewsGenerated = true;
        generateReversalNews(stock);
      }
    } else {
      // No reversal - veto factor won or bad luck
      rebal.dailyBias = 0;
    }
  }

  function completeIndexRebalance(stock) {
    const rebal = stock.indexRebalance;
    
    // Generate completion news
    generateCompletionNews(stock);
    
    // Clear state
    delete stock.indexRebalance;
  }

  // ========== NEWS GENERATORS ==========
  function generateAnnouncementNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    const indexName = rebal.indexName;
    
    const headlines = rebal.isAddition ? [
      `${stock.symbol} to be added to ${indexName}`,
      `Index change: ${stock.symbol} joining ${indexName}`,
      `${indexName} announces ${stock.symbol} addition`
    ] : [
      `${stock.symbol} to be removed from ${indexName}`,
      `Index change: ${stock.symbol} leaving ${indexName}`,
      `${indexName} announces ${stock.symbol} deletion`
    ];

    const descriptions = rebal.isAddition ? [
      `Passive funds tracking ${indexName} will be forced to buy shares. Effective date in ${rebal.daysToEffective} trading days.`,
      `Index funds must purchase ${stock.symbol} by the effective date. Watch for front-running by speculators.`
    ] : [
      `Passive funds tracking ${indexName} will be forced to sell shares. Effective date in ${rebal.daysToEffective} trading days.`,
      `Index funds must liquidate ${stock.symbol} positions by the effective date.`
    ];

    // DD-002: Log announcement event (no price change yet)
    const event = setPriceEvent(stock, 0, 'ANNOUNCEMENT', rebal, 
      `type=${rebal.eventType} index=${indexName} tier=${rebal.indexTier}`);
    console.log(event.logString);

    news.push({
      headline: randomChoice(headlines),
      description: randomChoice(descriptions),
      sentiment: rebal.isAddition ? 'positive' : 'negative',
      relatedStock: stock.symbol,
      newsType: 'index_rebalance',
      indexRebalancePhase: 'announcement',
      indexName: indexName,
      indexTier: rebal.indexTier,
      isAddition: rebal.isAddition,
      daysToEffective: rebal.daysToEffective,
      goldStandardCount: [rebal.goldStandard.isTier1, rebal.goldStandard.hasRunUp, rebal.goldStandard.hasMocSpike, rebal.goldStandard.hasReversalSetup].filter(Boolean).length,
      goldStandardCriteria: rebal.goldStandard,
      isIndexRebalance: true
    });
  }

  function generateRunUpNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    const runUpPct = (rebal.runUpTotal * 100).toFixed(1);
    
    const headlines = rebal.isAddition ? [
      `${stock.symbol} up ${runUpPct}% ahead of ${rebal.indexName} inclusion`,
      `Speculators front-running ${stock.symbol} index addition`,
      `${stock.symbol} rallies as index inclusion approaches`
    ] : [
      `${stock.symbol} down ${Math.abs(runUpPct)}% ahead of ${rebal.indexName} removal`,
      `Selling pressure mounts on ${stock.symbol} before index deletion`,
      `${stock.symbol} slides as removal from ${rebal.indexName} nears`
    ];

    // DD-002: Log run-up event
    const event = setPriceEvent(stock, rebal.dailyBias || 0, 'RUNUP', rebal, 
      `runUpTotal=${runUpPct}% daysToEff=${rebal.daysToEffective}`);
    console.log(event.logString);

    news.push({
      headline: randomChoice(headlines),
      description: `${rebal.daysToEffective} days until effective date. ${rebal.goldStandard.hasRunUp ? 'Run-up exceeds 5% threshold.' : 'Watching for 5%+ run-up.'}`,
      sentiment: rebal.isAddition ? 'positive' : 'negative',
      relatedStock: stock.symbol,
      newsType: 'index_rebalance',
      indexRebalancePhase: 'runUp',
      runUpPercent: rebal.runUpTotal,
      hasGoldStandardRunUp: rebal.goldStandard.hasRunUp,
      goldStandardCount: [rebal.goldStandard.isTier1, rebal.goldStandard.hasRunUp, rebal.goldStandard.hasMocSpike, rebal.goldStandard.hasReversalSetup].filter(Boolean).length,
      goldStandardCriteria: rebal.goldStandard,
      isIndexRebalance: true
    });
  }

  function generateEffectiveDayNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    const mocMultiple = rebal.mocVolumeMultiple.toFixed(0);
    
    const headlines = rebal.isAddition ? [
      `EFFECTIVE DATE: ${stock.symbol} officially joins ${rebal.indexName}`,
      `Massive MOC volume as ${stock.symbol} enters ${rebal.indexName}`,
      `${stock.symbol} index inclusion complete - ${mocMultiple}x volume at close`
    ] : [
      `EFFECTIVE DATE: ${stock.symbol} officially removed from ${rebal.indexName}`,
      `Heavy MOC selling as ${stock.symbol} exits ${rebal.indexName}`,
      `${stock.symbol} index deletion complete - ${mocMultiple}x volume at close`
    ];

    const goldStandardMet = rebal.goldStandard.isTier1 && 
                           rebal.goldStandard.hasRunUp && 
                           rebal.goldStandard.hasMocSpike;

    // DD-002: Log effective day event
    const event = setPriceEvent(stock, rebal.dailyBias || 0, 'EFFECTIVE', rebal, 
      `MOC=${mocMultiple}x isGoldStd=${goldStandardMet}`);
    console.log(event.logString);

    news.push({
      headline: randomChoice(headlines),
      description: `MOC volume ${mocMultiple}x normal. ${goldStandardMet ? '⭐ GOLD STANDARD: Watch for T+2 reversal setup!' : 'Marginal buyer exhausted.'}`,
      sentiment: 'neutral',
      relatedStock: stock.symbol,
      newsType: 'index_rebalance',
      indexRebalancePhase: 'effectiveDay',
      mocVolumeMultiple: rebal.mocVolumeMultiple,
      isGoldStandard: goldStandardMet,
      goldStandardCount: [rebal.goldStandard.isTier1, rebal.goldStandard.hasRunUp, rebal.goldStandard.hasMocSpike, rebal.goldStandard.hasReversalSetup].filter(Boolean).length,
      goldStandardCriteria: rebal.goldStandard,
      isIndexRebalance: true
    });
  }

  function generateReversalNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    
    const headlines = rebal.isAddition ? [
      `${stock.symbol} shows first lower high post-inclusion`,
      `T+2 reversal pattern forming on ${stock.symbol}`,
      `${stock.symbol} mean-reversion begins after index buying exhausted`
    ] : [
      `${stock.symbol} bounces after index selling exhausted`,
      `T+2 bounce pattern forming on ${stock.symbol}`,
      `${stock.symbol} finds floor after ${rebal.indexName} deletion`
    ];

    const goldStandardMet = rebal.goldStandard.isTier1 && 
                           rebal.goldStandard.hasRunUp && 
                           rebal.goldStandard.hasMocSpike &&
                           rebal.goldStandard.hasReversalSetup;

    // DD-002: Log reversal event
    const event = setPriceEvent(stock, rebal.dailyBias || 0, 'REVERSAL', rebal, 
      `will=${rebal.reversalWillHappen} prob=${((rebal.finalReversalProb || 0) * 100).toFixed(0)}%`);
    console.log(event.logString);

    news.push({
      headline: randomChoice(headlines),
      description: goldStandardMet ? 
        '⭐ GOLD STANDARD COMPLETE: All 4 criteria met. High probability reversal.' :
        'Reversal pattern detected. Monitor for continuation.',
      sentiment: rebal.isAddition ? 'negative' : 'positive',
      relatedStock: stock.symbol,
      newsType: 'index_rebalance',
      indexRebalancePhase: 'reversal',
      isGoldStandard: goldStandardMet,
      goldStandardCount: [rebal.goldStandard.isTier1, rebal.goldStandard.hasRunUp, rebal.goldStandard.hasMocSpike, rebal.goldStandard.hasReversalSetup].filter(Boolean).length,
      goldStandardCriteria: rebal.goldStandard,
      isIndexRebalance: true
    });
  }

  function generateVetoNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    const vetoFactor = rebal.vetoFactors[0];
    const vetoInfo = CONSTANTS.VETO_FACTORS[vetoFactor];
    
    // DD-002: Log veto event
    const event = setPriceEvent(stock, 0, 'VETO', rebal, 
      `factor=${vetoFactor}`);
    console.log(event.logString);

    news.push({
      headline: `${stock.symbol} defies typical post-inclusion reversal`,
      description: `Veto factor: ${vetoInfo.description}. The normal reversal pattern may be delayed or cancelled.`,
      sentiment: 'neutral',
      relatedStock: stock.symbol,
      newsType: 'index_rebalance',
      indexRebalancePhase: 'veto',
      vetoFactor: vetoFactor,
      goldStandardCount: [rebal.goldStandard.isTier1, rebal.goldStandard.hasRunUp, rebal.goldStandard.hasMocSpike, rebal.goldStandard.hasReversalSetup].filter(Boolean).length,
      goldStandardCriteria: rebal.goldStandard,
      isIndexRebalance: true
    });
  }

  function generateCompletionNews(stock) {
    const rebal = stock.indexRebalance;
    const news = getNews();
    
    // DD-002: Log completion event
    if (rebal) {
      const event = setPriceEvent(stock, 0, 'COMPLETE', rebal, 
        `result=${rebal.reversalWillHappen ? 'reversed' : 'no-reversal'}`);
      console.log(event.logString);
    }
    
    // No specific completion news needed - event just ends
  }

  // ========== SIGNAL CALCULATION (for other modules) ==========
  function calculateSignal(stock) {
    if (!stock.indexRebalance) {
      return {
        hasSignal: false,
        strength: 0,
        phase: null,
        isGoldStandard: false
      };
    }

    const rebal = stock.indexRebalance;
    const gs = rebal.goldStandard;
    
    // Count Gold Standard criteria met
    const criteriaMet = [gs.isTier1, gs.hasRunUp, gs.hasMocSpike, gs.hasReversalSetup]
      .filter(Boolean).length;
    
    const isGoldStandard = criteriaMet === 4;
    
    // Signal strength based on criteria
    let strength = 0;
    if (gs.isTier1) strength += 0.25;
    if (gs.hasRunUp) strength += 0.25;
    if (gs.hasMocSpike) strength += 0.25;
    if (gs.hasReversalSetup) strength += 0.25;

    return {
      hasSignal: true,
      strength: strength,
      phase: rebal.phase,
      eventType: rebal.eventType,
      indexTier: rebal.indexTier,
      indexName: rebal.indexName,
      isGoldStandard: isGoldStandard,
      criteriaMet: criteriaMet,
      runUpTotal: rebal.runUpTotal,
      mocVolumeMultiple: rebal.mocVolumeMultiple,
      vetoFactors: rebal.vetoFactors,
      dailyBias: rebal.dailyBias || 0
    };
  }

  // ========== GET ACTIVE SIGNALS ==========
  function getActiveSignals(stockList) {
    const stocks = stockList || getStocks();
    return stocks
      .filter(s => s.indexRebalance)
      .map(s => ({
        symbol: s.symbol,
        ...calculateSignal(s)
      }));
  }

  // ========== TUTORIAL HINT GENERATOR ==========
  // Returns standard tutorial format: type, description, implication, action, timing, catalyst, goldStandard
  function getTutorialHint(newsItem) {
    if (!newsItem || !newsItem.isIndexRebalance) return null;

    const phase = newsItem.indexRebalancePhase;
    const isAddition = newsItem.isAddition !== false; // default to addition
    const isGoldStandard = newsItem.isGoldStandard;
    const indexTier = newsItem.indexTier || 'tier1';
    const indexName = newsItem.indexName || 'Index';

    const tutorial = {
      type: '',
      description: '',
      implication: '',
      action: '',
      timing: '',
      catalyst: '',
      goldStandard: ''
    };

    // ===== ANNOUNCEMENT PHASE =====
    if (phase === 'announcement') {
      if (isAddition) {
        tutorial.type = `📅 INDEX ADDITION ANNOUNCED (${indexName})`;
        tutorial.description = `Stock being ADDED to ${indexName}. Passive funds MUST buy - this is a FORCED TRADE.`;
        tutorial.implication = 'Expect +5% to +15% run-up from announcement to effective date as speculators front-run.';
        tutorial.action = 'DO NOT BUY NOW! The Gold Standard trade is the REVERSAL after effective date.';
        tutorial.timing = 'ENTRY: Wait for T+2 after effective day. EXIT: 3-5 days into reversal for 2-5% gain.';
        tutorial.catalyst = 'Watch for: (1) 5%+ run-up, (2) MOC volume spike, (3) T+2 lower high.';
        tutorial.goldStandard = '🏆 INDEX REBALANCE Gold Standard: Tier 1 index + 5%+ run-up + MOC spike + T+2 reversal = 78% success';
      } else {
        tutorial.type = `📅 INDEX DELETION ANNOUNCED (${indexName})`;
        tutorial.description = `Stock being REMOVED from ${indexName}. Passive funds MUST sell - forced liquidation incoming.`;
        tutorial.implication = 'Expect -8% to -15% sell-off from announcement to effective date.';
        tutorial.action = 'Wait for BOUNCE after forced selling exhausts. Deletions often recover 2-4%.';
        tutorial.timing = 'ENTRY: After effective day selling exhausts (T+1 or T+2). EXIT: +2% to +4% bounce.';
        tutorial.catalyst = 'Forced selling creates overshoot. Watch for volume exhaustion on effective day.';
        tutorial.goldStandard = '🎯 Deletion Trade: Wait for selling exhaustion, buy the bounce for 2-4% gain';
      }
      return tutorial;
    }

    // ===== RUN-UP PHASE =====
    if (phase === 'runUp') {
      const runUpPct = (newsItem.runUpPercent * 100 || 0).toFixed(1);
      const hasRunUp = newsItem.hasGoldStandardRunUp;
      
      if (isAddition) {
        tutorial.type = hasRunUp ? '📈 RUN-UP EXCEEDS 5% - GOLD STANDARD ✓' : '📈 Run-Up in Progress';
        tutorial.description = `Stock up ${runUpPct}% since announcement. Speculators front-running passive funds.`;
        tutorial.implication = hasRunUp 
          ? 'Run-up exceeds 5% threshold! This "stretched" price increases reversal probability.'
          : 'Run-up building. Need 5%+ for Gold Standard setup.';
        tutorial.action = hasRunUp
          ? 'Gold Standard criterion #2 MET. Continue monitoring for effective day MOC spike.'
          : 'Keep watching. Do NOT buy the run-up - the trade is the reversal.';
        tutorial.timing = 'ENTRY: Still wait for T+2 after effective day. EXIT: 3-5 days into reversal.';
        tutorial.catalyst = hasRunUp
          ? '✓ 5%+ Run-up complete. Next: Watch for massive MOC volume on effective day.'
          : 'Need 5%+ run-up for Gold Standard. Current: ' + runUpPct + '%';
        tutorial.goldStandard = hasRunUp
          ? '🏆 2/4 GOLD STANDARD: ✓ Tier 1 Index, ✓ 5%+ Run-up, ○ MOC Spike, ○ T+2 Reversal'
          : '🎯 1/4 GOLD STANDARD: ✓ Tier 1 Index, ○ 5%+ Run-up (' + runUpPct + '%), ○ MOC Spike, ○ T+2 Reversal';
      } else {
        tutorial.type = '📉 Sell-Off in Progress';
        tutorial.description = `Stock down ${Math.abs(runUpPct)}% since deletion announcement. Forced selling pressure.`;
        tutorial.implication = 'Selling continues until effective day. Do not try to catch the falling knife.';
        tutorial.action = 'WAIT - Let selling exhaust. Bounce opportunity after effective day.';
        tutorial.timing = 'ENTRY: After effective day (T+1 or T+2). EXIT: +2% to +4% bounce.';
        tutorial.catalyst = 'Watch for volume exhaustion and stabilization after effective day.';
        tutorial.goldStandard = '🎯 Deletion Trade: Wait for selling exhaustion, then buy bounce';
      }
      return tutorial;
    }

    // ===== EFFECTIVE DAY =====
    if (phase === 'effectiveDay') {
      const mocMultiple = newsItem.mocVolumeMultiple?.toFixed(0) || '20+';
      
      if (isAddition) {
        tutorial.type = isGoldStandard 
          ? '🔔 EFFECTIVE DAY - GOLD STANDARD SETUP! ⭐'
          : '🔔 EFFECTIVE DAY - Maximum Volume';
        tutorial.description = `Massive MOC (Market on Close) volume: ${mocMultiple}x normal. Passive funds completing forced buying.`;
        tutorial.implication = isGoldStandard
          ? '⭐ THREE Gold Standard criteria met! T+2 reversal setup loading...'
          : 'Heavy volume as index funds execute. Marginal buyer now exhausted.';
        tutorial.action = isGoldStandard
          ? `PREPARE TO ${isAddition ? 'SHORT' : 'BUY'} on T+2 (Monday/Tuesday). Wait for first lower high.`
          : 'Watch for reversal. Not all Gold Standard criteria met - lower probability.';
        tutorial.timing = 'ENTRY: T+2 (2 trading days after effective). EXIT: 3-5 days for 2-5% gain.';
        tutorial.catalyst = isGoldStandard
          ? '✓ Tier 1 Index, ✓ 5%+ Run-up, ✓ MOC Spike - waiting for T+2 lower high'
          : 'Watch for reversal signs. Missing some Gold Standard criteria.';
        tutorial.goldStandard = isGoldStandard
          ? '🏆 3/4 GOLD STANDARD: ✓ Tier 1 Index, ✓ 5%+ Run-up, ✓ MOC Spike (' + mocMultiple + 'x), ○ T+2 Reversal'
          : '⚠️ PARTIAL SETUP - Some Gold Standard criteria missing. Lower probability reversal.';
      } else {
        tutorial.type = '🔔 EFFECTIVE DAY - Deletion Complete';
        tutorial.description = `Massive MOC selling: ${mocMultiple}x normal volume. Forced selling completing.`;
        tutorial.implication = 'Selling pressure should exhaust. Bounce opportunity forming.';
        tutorial.action = 'Prepare to BUY tomorrow (T+1) or T+2 for bounce trade.';
        tutorial.timing = 'ENTRY: Tomorrow (T+1) or T+2. EXIT: +2% to +4% bounce over 3-5 days.';
        tutorial.catalyst = 'Volume exhaustion signals selling complete. Watch for stabilization.';
        tutorial.goldStandard = '🎯 Deletion Trade: Selling exhausted. Bounce probability high.';
      }
      return tutorial;
    }

    // ===== REVERSAL PHASE =====
    if (phase === 'reversal') {
      if (isAddition) {
        tutorial.type = isGoldStandard
          ? '🔄 GOLD STANDARD COMPLETE - ALL 4 CRITERIA MET! ⭐⭐⭐'
          : '🔄 T+2 Reversal Pattern';
        tutorial.description = isGoldStandard
          ? 'First lower high detected. ALL FOUR Gold Standard criteria met!'
          : 'Reversal pattern forming. Some Gold Standard criteria missing.';
        tutorial.implication = isGoldStandard
          ? 'Historical success rate: 75-80% for 2-5% mean reversion (Petajisto 2011).'
          : 'Reversal possible but lower probability without full Gold Standard setup.';
        tutorial.action = isGoldStandard
          ? 'ENTER SHORT POSITION NOW. Target: 2-5% gain over 3-5 trading days.'
          : 'Consider small position. Monitor for reversal continuation.';
        tutorial.timing = 'ENTRY: NOW (if Gold Standard) or wait for confirmation. EXIT: 3-5 days, +2% to +5%.';
        tutorial.catalyst = isGoldStandard
          ? 'Petajisto (2011): S&P 500 additions reverse ~4% post-inclusion. Kappou (2010): 2-4% reversal in 10-20 days.'
          : 'Watch for continued lower highs. Reversal may be weaker without Gold Standard.';
        tutorial.goldStandard = isGoldStandard
          ? '🏆🏆🏆 4/4 GOLD STANDARD COMPLETE! ✓ Tier 1, ✓ 5%+ Run-up, ✓ MOC Spike, ✓ T+2 Reversal = 78% success'
          : '⚠️ PARTIAL: Some Gold Standard criteria missing. Proceed with caution.';
      } else {
        tutorial.type = '🔄 Post-Deletion Bounce';
        tutorial.description = 'Forced selling exhausted. Bounce pattern forming as oversold condition corrects.';
        tutorial.implication = 'Typical bounce: +2% to +4% over 3-5 days after deletion.';
        tutorial.action = 'BUY for bounce trade. This is the deletion reversal opportunity.';
        tutorial.timing = 'ENTRY: NOW (T+1 or T+2). EXIT: +2% to +4% over 3-5 days.';
        tutorial.catalyst = 'Selling exhaustion complete. Technical bounce underway.';
        tutorial.goldStandard = '🎯 DELETION BOUNCE: Forced selling → overshoot → recovery. Target +2-4%.';
      }
      return tutorial;
    }

    // ===== VETO PHASE =====
    if (phase === 'veto') {
      const vetoFactor = newsItem.vetoFactor || 'fundamental news';
      tutorial.type = '⚠️ VETO FACTOR - Reversal Delayed/Cancelled';
      tutorial.description = `A veto factor (${vetoFactor}) is overriding the typical reversal pattern.`;
      tutorial.implication = 'Normal reversal may be delayed or cancelled. Gold Standard probability reduced.';
      tutorial.action = 'CAUTION - Skip this setup or reduce position size significantly.';
      tutorial.timing = 'ENTRY: Skip or wait for veto factor to clear. EXIT: N/A.';
      tutorial.catalyst = `Veto factors: Earnings beat, bull market momentum, institutional overhang. Current: ${vetoFactor}`;
      tutorial.goldStandard = '⚠️ GOLD STANDARD VETOED: External factors overriding typical reversal pattern.';
      return tutorial;
    }

    // Default fallback
    return null;
  }


  // ========== ADD VETO FACTOR ==========
  function addVetoFactor(stock, vetoType) {
    if (stock.indexRebalance && CONSTANTS.VETO_FACTORS[vetoType]) {
      stock.indexRebalance.vetoFactors.push(vetoType);
    }
  }

  // ========== CLEAR STATE ==========
  function clearIndexRebalanceState(stock) {
    delete stock.indexRebalance;
  }

  // ========== PUBLIC API ==========
  return {
    init: init,
    CONSTANTS: CONSTANTS,

    // Core functions
    checkIndexRebalanceEvents: checkIndexRebalanceEvents,
    triggerIndexRebalance: triggerIndexRebalance,
    processIndexRebalance: processIndexRebalance,

    // Signal analysis
    calculateSignal: calculateSignal,
    getActiveSignals: getActiveSignals,

    // Utilities
    getTutorialHint: getTutorialHint,
    addVetoFactor: addVetoFactor,

    // Testing
    _test: {
      clearIndexRebalanceState: clearIndexRebalanceState,
      processRunUpPhase: processRunUpPhase,
      processEffectiveDay: processEffectiveDay,
      processReversalPhase: processReversalPhase,
      generateAnnouncementNews: generateAnnouncementNews
    },

    _reset: function() {
      deps = {
        stocks: null,
        todayNews: null,
        gameState: null,
        getMemeMultiplier: null,
        randomChoice: null,
        isEventTypeEnabled: null,
        random: Math.random
      };
    }
  };
})();

// ========== BACKWARDS COMPATIBILITY ==========
function checkIndexRebalanceEvents() {
  return IndexRebalance.checkIndexRebalanceEvents();
}

function getIndexRebalanceTutorialHint(newsItem) {
  return IndexRebalance.getTutorialHint(newsItem);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndexRebalance;
}
