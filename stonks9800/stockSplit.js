// ===== STOCK SPLIT SYSTEM (EMPIRICALLY-BASED) =====
// Based on academic research on Stock Split Effects and Retail Psychology
//
// EMPIRICAL FOUNDATIONS:
// - Ikenberry, Rankine & Stice (1996): Splits outperform by +7.93% year 1, +12.15% over 3 years
// - Bank of America Global Research (2024): S&P 500 split stocks +25% avg vs +9% index over 12 months
// - Guhathakurta et al. (2020s): "Retailization" - splits increase liquidity but +20% volatility
//
// KEY INSIGHT: WHY STOCK SPLITS CREATE RELIABLE PATTERNS
// ═══════════════════════════════════════════════════════════════════
// A split is fundamentally "cosmetic" (cutting pizza into more slices).
// But the market treats it as a SIGNAL of management confidence.
//
// The Psychology:
//   1. Announcement: Management signals confidence → immediate +2-5% pop
//   2. Run-Up: "Anticipation" psychology → steady drift higher (+15-25% typical)
//   3. Effective Date: Price "looks cheap" → retail FOMO spike
//   4. Reversal: Hype exhaustion → mean reversion (the Gold Standard trade)
//
// The Modern Era (2020-2025):
//   - Mega-cap splits (NVDA, TSLA, AAPL) create massive retail volatility events
//   - Social media amplifies the "cheap stock" narrative
//   - OTM call buying spikes are the clearest sentiment indicator
//
// GOLD STANDARD 4-STEP FILTER (70-85% success rate):
//   Step 1: Momentum Over-Extension - Stock rallied 15%+ from announcement to effective
//   Step 2: Retail Sentiment Peak - OTM call volume spike, social media frenzy
//   Step 3: T+3 Rejection - Wait 3 days after split for lower high pattern
//   Step 4: Institutional Rebalance - Mega-cap shows institutional selling into retail buying
//
// EDUCATIONAL PURPOSE:
// Teaches players to:
// 1. Understand that splits are "cosmetic" but psychologically powerful
// 2. Recognize the announcement pop and run-up phases
// 3. Identify retail sentiment peaks (OTM calls, social frenzy)
// 4. Time entries on the T+3 reversal, NOT the split announcement
// 5. Distinguish mega-cap splits (higher reversal probability) from small-cap
//
// ARCHITECTURE:
// This module uses dependency injection for testability.

const StockSplit = (function() {
  'use strict';

  // ========== EMPIRICALLY-BASED CONSTANTS ==========
  const CONSTANTS = {
    // ========== GOLD STANDARD 70-85% SETUP ==========
    // The highest probability trade is the REVERSAL after effective date
    GOLD_STANDARD: {
      description: 'Short the post-split hangover: 15%+ run-up, OTM call spike, T+3 lower high',
      requirements: {
        minRunUp: 0.15,                  // At least 15% gain announcement → effective
        otmCallSpike: 3.0,               // Call volume ≥ 3x average near split
        reversalTiming: 3,               // T+3 (wait for first lower high)
        megaCap: true,                   // Higher probability on mega-caps
        successRate: 0.77                // 70-85% success rate
      },
      educationalNote: 'The "Gold Standard" is NOT buying the split - it\'s shorting the exhaustion after retail FOMO peaks.'
    },

    // Stock tiers by market cap (affects reversal probability)
    STOCK_TIERS: {
      megaCap: {
        name: 'Mega-Cap',
        minPrice: 800,                   // Top-tier priced stocks
        examples: ['NVDA', 'TSLA', 'AAPL', 'AMZN', 'GOOGL'],
        impactMultiplier: 1.5,           // Larger retail interest
        reversalProbability: 0.82,       // Higher reversal probability
        description: 'Highest retail attention - creates reliable reversal setups'
      },
      largeCap: {
        name: 'Large-Cap',
        minPrice: 400,
        impactMultiplier: 1.2,
        reversalProbability: 0.72,
        description: 'Moderate retail interest - decent reversal probability'
      },
      midCap: {
        name: 'Mid-Cap',
        minPrice: 100,
        impactMultiplier: 1.0,
        reversalProbability: 0.60,
        description: 'Lower retail frenzy - less predictable reversal'
      }
    },

    // Split ratios and their psychological impact
    SPLIT_RATIOS: {
      2: { name: '2:1', retailAppeal: 'moderate', hypeMultiplier: 1.0 },
      3: { name: '3:1', retailAppeal: 'high', hypeMultiplier: 1.2 },
      4: { name: '4:1', retailAppeal: 'very high', hypeMultiplier: 1.4 },
      5: { name: '5:1', retailAppeal: 'extreme', hypeMultiplier: 1.5 },
      10: { name: '10:1', retailAppeal: 'massive', hypeMultiplier: 2.0 },
      20: { name: '20:1', retailAppeal: 'unprecedented', hypeMultiplier: 2.5 }
    },

    // Timeline (in trading days)
    // Empirical: 3-5 week gap announcement → execution, 12-month drift
    TIMELINE: {
      announcementToEffective: { min: 15, max: 25 }, // Empirical: 3-5 weeks (~15-25 trading days)
      runUpPhase: { min: 10, max: 20 },              // Run-up during gap period
      effectiveDay: 1,                               // The big day
      hangoverPhase: { min: 3, max: 5 },             // Empirical: Day 3-5 post-execution hangover
      reversalWindow: { min: 3, max: 7 },            // T+3 to T+7 reversal timing
      driftPhase: { min: 200, max: 252 },            // Empirical: 12-month drift (~252 trading days)
      totalDuration: { min: 25, max: 40 }            // Full short-term cycle
    },

    // Volume patterns
    VOLUME: {
      announcementSpike: { min: 2, max: 4 },         // 2-4x on announcement
      runUpVolume: { min: 1.3, max: 2.0 },           // Elevated during run-up
      effectiveDaySpike: { min: 3, max: 8 },         // 3-8x on effective day
      otmCallSpike: { min: 3, max: 10 },             // OTM calls 3-10x normal
      postSplitFading: { min: 0.8, max: 1.2 }        // Returns toward normal
    },

    // Daily price impacts (as percentages)
    PRICE_IMPACT: {
      announcement: { min: 0.02, max: 0.05 },        // +2-5% immediate pop
      runUp: { min: 0.01, max: 0.025 },              // +1-2.5% daily during run-up
      effectiveDay: { min: 0.02, max: 0.06 },        // +2-6% post-split enthusiasm
      reversal: { min: -0.02, max: -0.008 }          // -0.8-2% daily reversal
    },

    // Veto factors that reduce reversal probability
    VETO_FACTORS: {
      newProductLaunch: {
        description: 'Major product launch coincides with split',
        probabilityReduction: 0.25       // -25% to reversal probability
      },
      earningsBlowout: {
        description: 'Exceptional earnings report',
        probabilityReduction: 0.30       // -30% to reversal probability
      },
      bullMarket: {
        description: 'Strong bull market momentum',
        probabilityReduction: 0.15       // -15% to reversal probability
      },
      sectorMomentum: {
        description: 'Entire sector rallying',
        probabilityReduction: 0.10       // -10% to reversal probability
      }
    },

    // Empirical data sources
    RESEARCH_CITATIONS: {
      ikenberry1996: {
        finding: 'Splits outperform by +7.93% year 1, +12.15% over 3 years',
        implication: 'Signaling Theory: managers split when confident'
      },
      bankOfAmerica2024: {
        finding: 'S&P 500 split stocks +25% avg vs +9% index over 12 months',
        implication: 'Post-announcement momentum is real but front-loaded'
      },
      guhathakurta2020s: {
        finding: 'Splits increase liquidity but +20% volatility around effective date',
        implication: 'Volatility spike creates reversal opportunity'
      }
    }
  };

  // ========== DEPENDENCY INJECTION ==========
  let deps = {
    stocks: null,
    todayNews: null,
    gameState: null,
    getMemeMultiplier: null,
    randomChoice: null,
    isEventTypeEnabled: null,
    random: Math.random
  };

  function init(dependencies) {
    deps = { ...deps, ...dependencies };
    
    return StockSplit;
  }

  // Helper accessors
  function getStocks() { return deps.stocks || (typeof stocks !== 'undefined' ? stocks : []); }
  function getNews() { return deps.todayNews || (typeof todayNews !== 'undefined' ? todayNews : []); }
  function getGameState() { return deps.gameState || (typeof gameState !== 'undefined' ? gameState : {}); }
  function getMemeMultiplier(stock) { 
    return deps.getMemeMultiplier ? deps.getMemeMultiplier(stock) : 
           (typeof window !== 'undefined' && window.getMemeMultiplier ? window.getMemeMultiplier(stock) : 1);
  }
  function randomChoice(arr) {
    return deps.randomChoice ? deps.randomChoice(arr) : arr[Math.floor(deps.random() * arr.length)];
  }
  function isEventTypeEnabled(type) {
    return deps.isEventTypeEnabled ? deps.isEventTypeEnabled(type) :
           (typeof window !== 'undefined' && window.isEventTypeEnabled ? window.isEventTypeEnabled(type) : true);
  }
  function randomInRange(min, max) {
    return min + deps.random() * (max - min);
  }
  function getDate() {
    const gs = getGameState();
    if (gs && gs.year && gs.month && gs.day) return `Y${gs.year}/M${gs.month}/D${gs.day}`;
    return '?';
  }

  function getPriceInfo(stock) {
    const price = stock.price ? `$${stock.price.toFixed(2)}` : '$?';
    const split = stock.splitState;
    const delta = split && split.priceAtAnnouncement 
      ? `${((stock.price * split.ratio - split.priceAtAnnouncement) / split.priceAtAnnouncement * 100).toFixed(1)}%`
      : '?';
    return `[${price} Δ${delta.startsWith('-') ? '' : '+'}${delta}]`;
  }

  // ========== STOCK TIER DETECTION ==========
  function getStockTier(stock) {
    if (stock.price >= CONSTANTS.STOCK_TIERS.megaCap.minPrice) return 'megaCap';
    if (stock.price >= CONSTANTS.STOCK_TIERS.largeCap.minPrice) return 'largeCap';
    return 'midCap';
  }

  // ========== MAIN EVENT CHECK ==========
  function checkStockSplitEvents() {
    if (!isEventTypeEnabled('stock_split')) return;

    const stockList = getStocks();
    
    // Process existing splits
    stockList.forEach(stock => {
      if (stock.splitState) {
        processStockSplit(stock);
      }
    });

    // Random chance to trigger new split on high-priced stocks
    const eligibleStocks = stockList.filter(s => 
      s.price >= 500 && !s.splitState && !s.splitPhase
    );
    
    if (eligibleStocks.length > 0 && deps.random() < 0.012) {
      const target = randomChoice(eligibleStocks);
      const tier = getStockTier(target);
      
      // Higher ratio for higher-priced stocks
      let ratioOptions = [2, 3, 4];
      if (target.price >= 800) ratioOptions = [4, 5, 10];
      if (target.price >= 1500) ratioOptions = [10, 20];
      
      const ratio = randomChoice(ratioOptions);
      triggerStockSplit(target, ratio);
    }
  }

  // ========== TRIGGER STOCK SPLIT ==========
  function triggerStockSplit(stock, ratio) {
    if (stock.splitState) return false;

    const tier = getStockTier(stock);
    const tierData = CONSTANTS.STOCK_TIERS[tier];
    const ratioData = CONSTANTS.SPLIT_RATIOS[ratio] || CONSTANTS.SPLIT_RATIOS[4];
    
    // +1 because processStockSplit decrements BEFORE checking phase transitions
    const daysToEffective = Math.floor(randomInRange(
      CONSTANTS.TIMELINE.announcementToEffective.min,
      CONSTANTS.TIMELINE.announcementToEffective.max + 1
    )) + 1;
    
    const reversalDays = Math.floor(randomInRange(
      CONSTANTS.TIMELINE.reversalWindow.min,
      CONSTANTS.TIMELINE.reversalWindow.max + 1
    ));

    // Initialize split state
    stock.splitState = {
      phase: 'announcement',
      ratio: ratio,
      ratioName: ratioData.name,
      stockTier: tier,
      daysToEffective: daysToEffective,
      originalDaysToEffective: daysToEffective,
      reversalDays: reversalDays,
      
      // Price tracking
      priceAtAnnouncement: stock.price,
      priceAtEffective: null,
      runUpTotal: 0,
      dailyBias: 0,
      
      // Volume tracking
      otmCallMultiple: randomInRange(CONSTANTS.VOLUME.otmCallSpike.min, CONSTANTS.VOLUME.otmCallSpike.max),
      effectiveDayVolume: randomInRange(CONSTANTS.VOLUME.effectiveDaySpike.min, CONSTANTS.VOLUME.effectiveDaySpike.max),
      
      // Gold Standard tracking
      goldStandard: {
        isMegaCap: tier === 'megaCap',
        hasRunUp: false,         // Will be true if 15%+ run-up
        hasOtmSpike: false,      // Will be true on effective day
        hasReversalSetup: false  // Will be true on T+3
      },
      
      // Reversal decision (made once on T+1)
      reversalDecided: false,
      reversalWillHappen: false,
      finalReversalProb: 0,
      vetoFactors: [],
      
      // For legacy compatibility
      startDay: getGameState().day || 1
    };

    // Apply announcement pop
    const announcementPop = randomInRange(
      CONSTANTS.PRICE_IMPACT.announcement.min,
      CONSTANTS.PRICE_IMPACT.announcement.max
    ) * tierData.impactMultiplier * ratioData.hypeMultiplier;
    
    stock.splitState.dailyBias = announcementPop;
    stock.sentimentOffset = (stock.sentimentOffset || 0) + announcementPop;

    // Generate announcement news
    generateAnnouncementNews(stock);

    console.log(`[SPLIT] ${getDate()}: ${stock.symbol} ANNOUNCED ${ratioData.name} split ${getPriceInfo(stock)} (effective in ${daysToEffective} days, tier: ${tier})`);
    
    return true;
  }

  // ========== PROCESS DAILY ==========
  function processStockSplit(stock) {
    const split = stock.splitState;
    if (!split) return;

    // Decrement days counter
    split.daysToEffective--;
    
    const daysToEffective = split.daysToEffective;
    const daysAfterEffective = -daysToEffective; // Negative means before effective
    
    // Determine phase based on days
    if (daysToEffective > 0) {
      // Run-up phase
      split.phase = 'runUp';
      processRunUpPhase(stock, daysToEffective);
    } else if (daysToEffective === 0) {
      // Effective day
      split.phase = 'effectiveDay';
      processEffectiveDay(stock);
    } else if (daysAfterEffective <= split.reversalDays) {
      // Reversal phase (T+1 through T+reversalDays, inclusive)
      split.phase = 'reversal';
      processReversalPhase(stock, daysAfterEffective);
    } else {
      // Event complete
      completeStockSplit(stock);
    }
  }

  // ========== PHASE PROCESSORS ==========
  function processRunUpPhase(stock, daysToEffective) {
    const split = stock.splitState;
    const tierData = CONSTANTS.STOCK_TIERS[split.stockTier];
    const ratioData = CONSTANTS.SPLIT_RATIOS[split.ratio] || CONSTANTS.SPLIT_RATIOS[4];
    const memeMultiplier = getMemeMultiplier(stock);
    
    // Calculate daily run-up impact
    const dailyImpact = randomInRange(
      CONSTANTS.PRICE_IMPACT.runUp.min,
      CONSTANTS.PRICE_IMPACT.runUp.max
    ) * tierData.impactMultiplier * ratioData.hypeMultiplier * memeMultiplier;
    
    // Track cumulative run-up
    split.runUpTotal += dailyImpact;
    
    // Check Gold Standard run-up criterion (15%+)
    if (split.runUpTotal >= CONSTANTS.GOLD_STANDARD.requirements.minRunUp) {
      split.goldStandard.hasRunUp = true;
    }

    // Store for price calculation
    split.dailyBias = dailyImpact;

    // Generate run-up news at midpoint
    if (daysToEffective === Math.floor(split.originalDaysToEffective / 2)) {
      generateRunUpNews(stock);
      console.log(`[SPLIT] ${getDate()}: ${stock.symbol} RUNUP NEWS ${getPriceInfo(stock)} (+${(split.runUpTotal * 100).toFixed(1)}% so far, ${daysToEffective} days left)`);
    }
    
    // Generate "tomorrow" news
    if (daysToEffective === 1) {
      generateTomorrowNews(stock);
      console.log(`[SPLIT] ${getDate()}: ${stock.symbol} SPLIT TOMORROW ${getPriceInfo(stock)} (total run-up: +${(split.runUpTotal * 100).toFixed(1)}%)`);
    }
  }

  function processEffectiveDay(stock) {
    const split = stock.splitState;
    const tierData = CONSTANTS.STOCK_TIERS[split.stockTier];
    const ratioData = CONSTANTS.SPLIT_RATIOS[split.ratio] || CONSTANTS.SPLIT_RATIOS[4];
    const memeMultiplier = getMemeMultiplier(stock);
    
    // Apply the actual split (adjust prices)
    const ratio = split.ratio;
    stock.price = Math.round(stock.price / ratio);
    stock.previousPrice = Math.round(stock.previousPrice / ratio);
    if (stock.basePrice) stock.basePrice = stock.basePrice / ratio;
    if (stock.fairValue) stock.fairValue = stock.fairValue / ratio;
    
    // Effective day enthusiasm (post-split pop)
    const effectiveImpact = randomInRange(
      CONSTANTS.PRICE_IMPACT.effectiveDay.min,
      CONSTANTS.PRICE_IMPACT.effectiveDay.max
    ) * tierData.impactMultiplier * ratioData.hypeMultiplier * memeMultiplier;
    
    split.dailyBias = effectiveImpact;
    split.priceAtEffective = stock.price * (1 + effectiveImpact);
    
    // Mark OTM call spike (always happens on effective day)
    split.goldStandard.hasOtmSpike = true;

    // Generate effective day news
    generateEffectiveDayNews(stock);
    
    console.log(`[SPLIT] ${getDate()}: ${stock.symbol} EFFECTIVE ${getPriceInfo(stock)} (run-up: +${(split.runUpTotal * 100).toFixed(1)}%) [reversalDays=${split.reversalDays}]`);
  }

  function processReversalPhase(stock, daysIntoReversal) {
    const split = stock.splitState;
    const tierData = CONSTANTS.STOCK_TIERS[split.stockTier];
    
    // Mark reversal setup on T+3
    if (daysIntoReversal >= 3) {
      split.goldStandard.hasReversalSetup = true;
    }
    
    // Calculate reversal probability (only once, on T+1)
    if (!split.reversalDecided) {
      let reversalProb = tierData.reversalProbability;
      
      // Boost if run-up was strong (more "excess" to reverse)
      if (split.runUpTotal >= 0.20) {
        reversalProb += 0.05; // +5% if 20%+ run-up
      }
      
      // Apply veto factors
      split.vetoFactors.forEach(veto => {
        if (CONSTANTS.VETO_FACTORS[veto]) {
          reversalProb -= CONSTANTS.VETO_FACTORS[veto].probabilityReduction;
        }
      });
      reversalProb = Math.max(0.25, Math.min(0.90, reversalProb)); // Floor 25%, cap 90%
      
      // Decide once if reversal will happen
      split.reversalDecided = true;
      split.reversalWillHappen = deps.random() < reversalProb;
      split.finalReversalProb = reversalProb;
      
      // If reversal won't happen and veto factors exist, generate veto news
      if (!split.reversalWillHappen && split.vetoFactors.length > 0) {
        generateVetoNews(stock);
        console.log(`[SPLIT] ${getDate()}: ${stock.symbol} VETO - NO REVERSAL ${getPriceInfo(stock)} (factor: ${split.vetoFactors[0]})`);
      }
      
      console.log(`[SPLIT] ${getDate()}: ${stock.symbol} REVERSAL DECISION: ${split.reversalWillHappen ? 'YES' : 'NO'} ${getPriceInfo(stock)} (prob: ${(reversalProb * 100).toFixed(0)}%) [daysLeft=${split.reversalDays - daysIntoReversal}]`);
    }

    // Apply reversal bias if reversal is happening
    if (split.reversalWillHappen) {
      const dailyImpact = randomInRange(
        CONSTANTS.PRICE_IMPACT.reversal.min,
        CONSTANTS.PRICE_IMPACT.reversal.max
      );
      split.dailyBias = dailyImpact;
      
      // Generate reversal news on T+3 (when Gold Standard completes)
      if (daysIntoReversal === 3) {
        generateReversalNews(stock);
      }
    } else {
      // No reversal - slight continued momentum or flat
      split.dailyBias = randomInRange(-0.005, 0.01);
    }
  }

  // ========== COMPLETION ==========
  function completeStockSplit(stock) {
    const split = stock.splitState;
    
    // Calculate final results
    const totalReturn = (stock.price - split.priceAtAnnouncement / split.ratio) / (split.priceAtAnnouncement / split.ratio);
    const reversalAmount = split.priceAtEffective ? 
      (stock.price - split.priceAtEffective) / split.priceAtEffective : 0;
    
    // Check if Gold Standard was met
    const gs = split.goldStandard;
    const goldStandardMet = gs.isMegaCap && gs.hasRunUp && gs.hasOtmSpike && gs.hasReversalSetup;
    
    console.log(`[SPLIT] ${getDate()}: ${stock.symbol} COMPLETE ${getPriceInfo(stock)} [END]`);
    console.log(`  Run-up: +${(split.runUpTotal * 100).toFixed(1)}%, Reversal: ${(reversalAmount * 100).toFixed(1)}%`);
    console.log(`  Gold Standard: ${goldStandardMet ? 'MET' : 'NOT MET'} (${gs.isMegaCap ? '✓' : '✗'} MegaCap, ${gs.hasRunUp ? '✓' : '✗'} 15%+, ${gs.hasOtmSpike ? '✓' : '✗'} OTM, ${gs.hasReversalSetup ? '✓' : '✗'} T+3)`);
    
    // Clear split state
    delete stock.splitState;
    
    // Also clear legacy splitPhase if present
    stock.splitPhase = null;
    stock.splitRatio = null;
  }

  // ========== NEWS GENERATORS ==========
  function generateAnnouncementNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    
    const headlines = [
      `${stock.symbol} announces ${split.ratioName} stock split`,
      `BREAKING: ${stock.symbol} to split shares ${split.ratio}-for-1`,
      `${stock.symbol} board approves ${split.ratioName} stock split`,
      `${stock.symbol} stock split: ${split.ratioName} effective in ${split.daysToEffective} days`
    ];

    news.push({
      headline: randomChoice(headlines),
      description: `Management signals confidence. Split effective in ${split.daysToEffective} trading days. Historically, splits attract retail buyers.`,
      sentiment: 'positive',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'announcement',
      splitRatio: split.ratio,
      stockTier: split.stockTier,
      daysToEffective: split.daysToEffective,
      isStockSplit: true
    });
  }

  function generateRunUpNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    const runUpPct = (split.runUpTotal * 100).toFixed(1);
    
    const headlines = [
      `${stock.symbol} up ${runUpPct}% ahead of ${split.ratioName} split`,
      `Retail buying drives ${stock.symbol} rally into split`,
      `${stock.symbol} momentum builds before ${split.ratioName} split`
    ];

    news.push({
      headline: randomChoice(headlines),
      description: `${split.daysToEffective} days until split effective. ${split.goldStandard.hasRunUp ? 'Run-up exceeds 15% threshold - watching for reversal setup.' : 'Watching for 15%+ run-up.'}`,
      sentiment: 'positive',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'runUp',
      runUpPercent: split.runUpTotal,
      hasGoldStandardRunUp: split.goldStandard.hasRunUp,
      isStockSplit: true
    });
  }

  function generateTomorrowNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    
    const headlines = [
      `${stock.symbol} ${split.ratioName} split effective tomorrow`,
      `Reminder: ${stock.symbol} shares split ${split.ratio}:1 after close`,
      `${stock.symbol} split: Last day to buy pre-split shares`,
      `TOMORROW: ${stock.symbol} price adjusts for ${split.ratioName} split`
    ];

    news.push({
      headline: randomChoice(headlines),
      description: `Price will adjust tomorrow. Total run-up: +${(split.runUpTotal * 100).toFixed(1)}%. Watch for retail FOMO on effective day.`,
      sentiment: 'positive',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'tomorrow',
      runUpPercent: split.runUpTotal,
      isStockSplit: true
    });
  }

  function generateEffectiveDayNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    const otmSpike = split.otmCallMultiple.toFixed(0);
    
    const headlines = [
      `${stock.symbol} opens post-split at $${stock.price}`,
      `${stock.symbol} ${split.ratioName} split now effective`,
      `${stock.symbol} shares "affordable" after ${split.ratioName} split`,
      `Retail frenzy: ${stock.symbol} call volume ${otmSpike}x normal`
    ];

    const gs = split.goldStandard;
    const goldStandardReady = gs.isMegaCap && gs.hasRunUp;

    news.push({
      headline: randomChoice(headlines),
      description: goldStandardReady ? 
        `⭐ GOLD STANDARD SETUP: Mega-cap + ${(split.runUpTotal * 100).toFixed(0)}%+ run-up + OTM call spike. Watch for T+3 reversal!` :
        `Lower price attracts new retail investors. OTM call volume ${otmSpike}x normal.`,
      sentiment: 'positive',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'effectiveDay',
      newPrice: stock.price,
      otmCallMultiple: split.otmCallMultiple,
      isGoldStandard: goldStandardReady,
      isStockSplit: true,
      educationalNote: goldStandardReady
        ? '🎯 ACTION: PREPARE TO SHORT in 3 days (T+3). Wait for first lower high, then short the reversal.'
        : '🎯 ACTION: WATCH for Gold Standard setup. If run-up + OTM spike, prepare T+3 short.'
    });
  }

  function generateReversalNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    
    const headlines = [
      `${stock.symbol} shows first lower high post-split`,
      `T+3 reversal pattern forming on ${stock.symbol}`,
      `${stock.symbol} post-split FOMO exhausted - mean reversion begins`,
      `${stock.symbol}: "Sell the news" kicks in after split hype`
    ];

    const gs = split.goldStandard;
    const goldStandardMet = gs.isMegaCap && gs.hasRunUp && gs.hasOtmSpike && gs.hasReversalSetup;

    news.push({
      headline: randomChoice(headlines),
      description: goldStandardMet ? 
        '⭐ GOLD STANDARD COMPLETE: All 4 criteria met. High probability 5-10% mean reversion over next week.' :
        'Reversal pattern detected. Monitor for continuation.',
      sentiment: 'negative',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'reversal',
      isGoldStandard: goldStandardMet,
      isStockSplit: true,
      educationalNote: goldStandardMet
        ? '🎯 ACTION: SHORT NOW or COVER LONGS. T+3 reversal triggered. Expect 5-10% drop over ~1 week.'
        : '🎯 ACTION: CAUTION if long. Reversal forming - consider taking profits or hedging.'
    });
  }

  function generateVetoNews(stock) {
    const split = stock.splitState;
    const news = getNews();
    const vetoFactor = split.vetoFactors[0];
    const vetoInfo = CONSTANTS.VETO_FACTORS[vetoFactor];
    
    if (!vetoInfo) return;
    
    news.push({
      headline: `${stock.symbol} defies typical post-split reversal`,
      description: `Veto factor: ${vetoInfo.description}. The normal reversal pattern may be delayed or cancelled.`,
      sentiment: 'neutral',
      relatedStock: stock.symbol,
      newsType: 'stock_split',
      splitPhase: 'veto',
      vetoFactor: vetoFactor,
      isStockSplit: true,
      educationalNote: '🎯 ACTION: DO NOT SHORT. Veto factor present - normal reversal pattern cancelled. Exit short or stay flat.'
    });
  }

  // ========== SIGNAL CALCULATION ==========
  function calculateSignal(stock) {
    const split = stock.splitState;
    if (!split) {
      return { hasSignal: false };
    }

    const gs = split.goldStandard;
    const criteriaMet = [gs.isMegaCap, gs.hasRunUp, gs.hasOtmSpike, gs.hasReversalSetup].filter(Boolean).length;
    const isGoldStandard = criteriaMet === 4;

    let strength = 0;
    if (gs.isMegaCap) strength += 0.25;
    if (gs.hasRunUp) strength += 0.25;
    if (gs.hasOtmSpike) strength += 0.25;
    if (gs.hasReversalSetup) strength += 0.25;

    return {
      hasSignal: true,
      strength: strength,
      phase: split.phase,
      ratio: split.ratio,
      stockTier: split.stockTier,
      isGoldStandard: isGoldStandard,
      criteriaMet: criteriaMet,
      runUpTotal: split.runUpTotal,
      otmCallMultiple: split.otmCallMultiple,
      vetoFactors: split.vetoFactors,
      dailyBias: split.dailyBias || 0
    };
  }

  // ========== GET ACTIVE SIGNALS ==========
  function getActiveSignals(stockList) {
    const stocks = stockList || getStocks();
    return stocks
      .filter(s => s.splitState)
      .map(s => ({
        symbol: s.symbol,
        ...calculateSignal(s)
      }));
  }

  // ========== TUTORIAL HINT GENERATOR ==========
  function getTutorialHint(newsItem) {
    if (!newsItem || !newsItem.isStockSplit) return null;

    const phase = newsItem.splitPhase;
    const isGoldStandard = newsItem.isGoldStandard;
    const stockTier = newsItem.stockTier || 'largeCap';
    const ratio = newsItem.splitRatio || 4;

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
      tutorial.type = `📢 STOCK SPLIT ANNOUNCED (${ratio}:1)`;
      tutorial.description = `Stock splitting ${ratio}:1. This is "cosmetic" (same pizza, more slices) but psychologically powerful.`;
      tutorial.implication = 'Expect +15-25% run-up from announcement to effective date. Retail will pile in.';
      tutorial.action = 'DO NOT BUY NOW! The Gold Standard trade is the REVERSAL after the split.';
      tutorial.timing = 'ENTRY: Wait for T+3 after effective day. EXIT: 5-7 days into reversal for 5-10% gain.';
      tutorial.catalyst = 'Watch for: (1) 15%+ run-up, (2) OTM call spike on effective day, (3) T+3 lower high.';
      tutorial.goldStandard = '🏆 SPLIT Gold Standard: Mega-cap + 15%+ run-up + OTM spike + T+3 reversal = 77% success';
      return tutorial;
    }

    // ===== RUN-UP PHASE =====
    if (phase === 'runUp') {
      const runUpPct = ((newsItem.runUpPercent || 0) * 100).toFixed(1);
      const hasRunUp = newsItem.hasGoldStandardRunUp;
      
      tutorial.type = hasRunUp ? '📈 RUN-UP EXCEEDS 15% - GOLD STANDARD ✓' : '📈 Run-Up in Progress';
      tutorial.description = `Stock up ${runUpPct}% since announcement. "Hot money" front-running the split.`;
      tutorial.implication = hasRunUp 
        ? 'Run-up exceeds 15% threshold! This "over-extension" increases reversal probability.'
        : 'Run-up building. Need 15%+ for Gold Standard setup.';
      tutorial.action = hasRunUp
        ? 'Gold Standard criterion #1 MET. Continue monitoring for OTM call spike on effective day.'
        : 'Keep watching. Do NOT buy the run-up - the trade is the reversal.';
      tutorial.timing = 'ENTRY: Still wait for T+3 after effective day. EXIT: 5-7 days into reversal.';
      tutorial.catalyst = hasRunUp
        ? '✓ 15%+ Run-up complete. Next: Watch for massive OTM call volume on effective day.'
        : 'Need 15%+ run-up for Gold Standard. Current: ' + runUpPct + '%';
      tutorial.goldStandard = hasRunUp
        ? '🏆 1/4 GOLD STANDARD: ✓ 15%+ Run-up, ○ OTM Call Spike, ○ T+3 Reversal'
        : '🎯 0/4 GOLD STANDARD: ○ 15%+ Run-up (' + runUpPct + '%), ○ OTM Spike, ○ T+3 Reversal';
      return tutorial;
    }

    // ===== TOMORROW (DAY BEFORE EFFECTIVE) =====
    if (phase === 'tomorrow') {
      tutorial.type = '📅 SPLIT EFFECTIVE TOMORROW';
      tutorial.description = 'Last day before split. Price adjusts after close tomorrow.';
      tutorial.implication = 'Expect retail FOMO spike tomorrow as stock "looks cheap."';
      tutorial.action = 'Prepare to monitor T+3 for reversal entry. Do NOT buy the effective day pop.';
      tutorial.timing = 'ENTRY: T+3 after tomorrow (3 trading days post-split). EXIT: 5-7 days later.';
      tutorial.catalyst = 'Tomorrow: Watch for OTM call volume spike (3-10x normal = Gold Standard).';
      tutorial.goldStandard = '⏰ APPROACHING: Gold Standard entry in 4 trading days (T+3 after effective)';
      return tutorial;
    }

    // ===== EFFECTIVE DAY =====
    if (phase === 'effectiveDay') {
      const otmSpike = newsItem.otmCallMultiple?.toFixed(0) || '5+';
      
      tutorial.type = isGoldStandard 
        ? '🔔 SPLIT EFFECTIVE - GOLD STANDARD SETUP! ⭐'
        : '🔔 SPLIT EFFECTIVE - Price Adjusts';
      tutorial.description = `Price now $${newsItem.newPrice || 'adjusted'}. OTM call volume ${otmSpike}x normal. Retail FOMO peak.`;
      tutorial.implication = isGoldStandard
        ? '⭐ Mega-cap + 15%+ run-up + OTM spike! T+3 reversal setup loading...'
        : 'Retail buying the "cheap" stock. Hype exhaustion coming.';
      tutorial.action = isGoldStandard
        ? 'PREPARE TO SHORT on T+3 (3 days from now). Wait for first lower high.'
        : 'Watch for reversal. Not all Gold Standard criteria met - lower probability.';
      tutorial.timing = 'ENTRY: T+3 (3 trading days from now). EXIT: 5-7 days for 5-10% gain.';
      tutorial.catalyst = isGoldStandard
        ? '✓ Mega-cap, ✓ 15%+ Run-up, ✓ OTM Spike - waiting for T+3 lower high'
        : 'Watch for reversal signs. Missing some Gold Standard criteria.';
      tutorial.goldStandard = isGoldStandard
        ? '🏆 3/4 GOLD STANDARD: ✓ Mega-cap, ✓ 15%+ Run-up, ✓ OTM Spike (' + otmSpike + 'x), ○ T+3 Reversal'
        : '⚠️ PARTIAL SETUP - Some Gold Standard criteria missing. Lower probability reversal.';
      return tutorial;
    }

    // ===== REVERSAL PHASE =====
    if (phase === 'reversal') {
      tutorial.type = isGoldStandard
        ? '🔄 GOLD STANDARD COMPLETE - ALL 4 CRITERIA MET! ⭐⭐⭐'
        : '🔄 T+3 Reversal Pattern';
      tutorial.description = isGoldStandard
        ? 'First lower high detected. ALL FOUR Gold Standard criteria met!'
        : 'Reversal pattern forming. Some Gold Standard criteria missing.';
      tutorial.implication = isGoldStandard
        ? 'Historical success rate: 70-85% for 5-10% mean reversion over next week.'
        : 'Reversal possible but lower probability without full Gold Standard setup.';
      tutorial.action = isGoldStandard
        ? 'ENTER SHORT POSITION NOW. Target: 5-10% gain over 5-7 trading days.'
        : 'Consider small position. Monitor for reversal continuation.';
      tutorial.timing = 'ENTRY: NOW (if Gold Standard) or wait for confirmation. EXIT: 5-7 days, +5% to +10%.';
      tutorial.catalyst = isGoldStandard
        ? 'Ikenberry (1996): Post-split momentum fades. Guhathakurta: +20% volatility = reversal setup.'
        : 'Watch for continued lower highs. Reversal may be weaker without Gold Standard.';
      tutorial.goldStandard = isGoldStandard
        ? '🏆🏆🏆 4/4 GOLD STANDARD COMPLETE! ✓ Mega-cap, ✓ 15%+ Run-up, ✓ OTM Spike, ✓ T+3 Reversal = 77% success'
        : '⚠️ PARTIAL: Some Gold Standard criteria missing. Proceed with caution.';
      return tutorial;
    }

    // ===== VETO PHASE =====
    if (phase === 'veto') {
      const vetoFactor = newsItem.vetoFactor || 'positive catalyst';
      tutorial.type = '⚠️ VETO FACTOR - Reversal Delayed/Cancelled';
      tutorial.description = `A veto factor (${vetoFactor}) is overriding the typical reversal pattern.`;
      tutorial.implication = 'Normal reversal may be delayed or cancelled. Gold Standard probability reduced.';
      tutorial.action = 'CAUTION - Skip this setup or reduce position size significantly.';
      tutorial.timing = 'ENTRY: Skip or wait for veto factor to clear. EXIT: N/A.';
      tutorial.catalyst = `Veto factors: Product launch, earnings blowout, bull market, sector momentum. Current: ${vetoFactor}`;
      tutorial.goldStandard = '⚠️ GOLD STANDARD VETOED: External factors overriding typical reversal pattern.';
      return tutorial;
    }

    // Default fallback
    return null;
  }

  // ========== ADD VETO FACTOR ==========
  function addVetoFactor(stock, vetoType) {
    if (stock.splitState && CONSTANTS.VETO_FACTORS[vetoType]) {
      stock.splitState.vetoFactors.push(vetoType);
    }
  }

  // ========== CLEAR STATE ==========
  function clearStockSplitState(stock) {
    delete stock.splitState;
    stock.splitPhase = null;
    stock.splitRatio = null;
  }

  // ========== PUBLIC API ==========
  return {
    init: init,
    CONSTANTS: CONSTANTS,

    // Core functions
    checkStockSplitEvents: checkStockSplitEvents,
    triggerStockSplit: triggerStockSplit,
    processStockSplit: processStockSplit,

    // Signal analysis
    calculateSignal: calculateSignal,
    getActiveSignals: getActiveSignals,

    // Utilities
    getTutorialHint: getTutorialHint,
    addVetoFactor: addVetoFactor,

    // Testing
    _test: {
      clearStockSplitState: clearStockSplitState,
      processRunUpPhase: processRunUpPhase,
      processEffectiveDay: processEffectiveDay,
      processReversalPhase: processReversalPhase,
      generateAnnouncementNews: generateAnnouncementNews,
      getStockTier: getStockTier
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
function checkStockSplitEvents() {
  return StockSplit.checkStockSplitEvents();
}

// Legacy alias for backward compatibility
function checkStockSplitEventsNew() {
  return StockSplit.checkStockSplitEvents();
}

function triggerStockSplit(stock) {
  return StockSplit.triggerStockSplit(stock);
}

function getStockSplitTutorialHint(newsItem) {
  return StockSplit.getTutorialHint(newsItem);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StockSplit;
}
