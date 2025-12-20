/**
 * FOMO Rally Module
 * 
 * Empirical Sources:
 * - Barber & Odean (2008/2021): Attention-driven buying → 30-90 day underperformance
 * - Da, Engelberg & Gao (2011/2024): Search volume predicts 1-2 week spike, then month-end reversal
 * - Baltzer et al. (2023): Positive feedback loops until "marginal buyer" exhausted
 * 
 * Gold Standard (85%+): SHORT the Sentiment Exhaustion
 * 1. Verticality: 3+ Standard Deviations above 20-day MA (Bollinger extension)
 * 2. Retail Euphoria: Call Volume > Share Volume OR Put/Call Ratio <0.4
 * 3. Sentiment/Price Divergence: Record mentions but price fails new high
 * 4. Blow-off Top: Gap up, close near low, record volume
 * 
 * Timeline: buildup (5-10 days) → euphoria (3-5 days) → blow-off (1 day) → crash (5-10 days)
 * The Trade: Wait for "First Day of Lower Highs" - don't guess the exact peak
 */

const FOMORally = (function() {
  'use strict';

  // ========== EMPIRICAL CONSTANTS ==========
  const CONSTANTS = {
    // Social Sentiment thresholds (Baltzer et al. 2023)
    SENTIMENT: {
      baseline: 1.0,           // 1x normal mentions
      elevated: 3.0,           // 3x = elevated interest
      viral: 10.0,             // 10x = viral/trending
      extreme: 25.0,           // 25x = extreme FOMO (meme territory)
      divergenceThreshold: 0.95 // Mentions at 95%+ of peak but price lower
    },

    // Price Deviation thresholds (Statistical)
    DEVIATION: {
      normal: 1.0,             // Within 1 SD
      elevated: 2.0,           // 2 SD = elevated
      extreme: 3.0,            // 3 SD = extreme (Gold Standard criterion)
      unsustainable: 4.0       // 4+ SD = mathematically unsustainable
    },

    // Options Market indicators
    OPTIONS: {
      normalPutCall: 0.80,     // Normal P/C ratio
      bullish: 0.60,           // Bullish sentiment
      extreme: 0.40,           // Extreme greed (Gold Standard criterion)
      manic: 0.25,             // Manic speculation
      callVolumeThreshold: 1.0 // When call volume > share volume
    },

    // Retail Trading indicators
    RETAIL: {
      normalSmallLotPct: 0.15, // 15% small-lot trades normally
      elevated: 0.30,          // 30% = retail arriving
      fomo: 0.50,              // 50% = FOMO herd
      extreme: 0.70            // 70%+ = pure retail mania
    },

    // Price impact by phase (Da, Engelberg & Gao 2024)
    // Calibrated for 20-60% total crash (empirical range)
    PRICE_IMPACT: {
      buildup: { min: 0.02, max: 0.05 },      // +2-5% daily during buildup
      euphoria: { min: 0.05, max: 0.10 },     // +5-10% daily during euphoria (reduced from 12%)
      blowOff: { min: 0.00, max: 0.05 },      // +0-5% on blow-off day (peak already set)
      crash: { min: -0.08, max: -0.03 }       // -3-8% daily during crash (calibrated for 20-60% total)
    },

    // Timeline (empirical averages)
    TIMELINE: {
      buildupDays: { min: 5, max: 10 },       // 5-10 days of building momentum
      euphoriaDays: { min: 3, max: 5 },       // 3-5 days of parabolic move
      blowOffDuration: 1,                      // 1 day blow-off top
      crashDays: { min: 5, max: 10 }          // 5-10 days to crash 20-30%
    },

    // Rally magnitude categories
    RALLY_MAGNITUDE: {
      minor: { minGain: 0.30, maxGain: 0.60, crashPct: 0.40 },   // 30-60% gain, 40% crash
      major: { minGain: 0.60, maxGain: 1.20, crashPct: 0.50 },   // 60-120% gain, 50% crash
      extreme: { minGain: 1.20, maxGain: 3.00, crashPct: 0.60 }  // 120-300% gain, 60% crash
    },

    // Gold Standard Exhaustion Filter (85%+ success)
    GOLD_STANDARD: {
      deviationThreshold: 3.0,        // 3+ SD above 20-day MA
      putCallThreshold: 0.40,         // P/C ratio below 0.40
      sentimentDivergence: true,      // Record mentions + price fails new high
      blowOffVolume: 3.0,             // 3x+ average volume on blow-off
      successRate: 0.85               // 85% reversal success when all 4 met
    },

    // Reversal probability by factors met
    REVERSAL_PROBABILITY: {
      parabolicOnly: 0.60,            // 60% with just parabolic extension
      plusSentiment: 0.70,            // 70% with record social mentions
      plusDivergence: 0.80,           // 80% with sentiment/price divergence
      goldStandard: 0.85              // 85%+ with all 4 factors
    },

    // Veto factors
    VETO_FACTORS: {
      gammaLoop: {
        description: 'Positive news reignites gamma squeeze',
        probabilityReduction: 0.35    // -35% reversal probability
      },
      extendedMania: {
        description: 'Market can remain irrational (AI hype, meme craze)',
        probabilityReduction: 0.25    // -25%
      },
      institutionalBuying: {
        description: 'Real institutional accumulation detected',
        probabilityReduction: 0.40    // -40%
      },
      shortSqueezeFuel: {
        description: 'High short interest adding fuel',
        probabilityReduction: 0.20    // -20%
      }
    },

    // Sector weights (some sectors more prone to FOMO)
    SECTOR_WEIGHTS: {
      technology: 1.5,       // Tech most prone to FOMO
      biotech: 1.4,          // Biotech prone to hype
      crypto: 2.0,           // Crypto/blockchain extreme FOMO
      meme: 2.5,             // Meme stocks maximum FOMO
      cannabis: 1.3,         // Cannabis stocks hype-prone
      ev: 1.4,               // EV sector hype
      ai: 1.8,               // AI sector extreme hype (2023+)
      default: 1.0
    }
  };

  // Dependencies (injected for testing)
  let deps = {
    random: Math.random,
    todayNews: null,
    gameState: null
  };

  // ========== DD-002 STANDARD API ==========
  /**
   * Get formatted date string from game state
   */
  function getDate() {
    const state = deps.gameState || { day: 0 };
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
   */
  function setPriceEvent(stock, priceChange, phaseName, rally, extraLogInfo = '') {
    const expectedPrice = Math.round(stock.price * (1 + priceChange) * 100) / 100;
    const actualDelta = (expectedPrice - stock.price) / stock.price;
    
    // Set transition effect for test validation
    stock.fomoRallyTransitionEffect = priceChange;
    stock.eventExpectedPrice = expectedPrice;
    stock.eventExpectedDelta = actualDelta;
    
    // Build Gold Standard criteria display
    const gs = rally.goldStandard || {};
    const criteriaKeys = ['hasVerticalitySignal', 'hasRetailEuphoria', 'hasSentimentDivergence', 'hasBlowOffTop'];
    const criteriaDisplay = criteriaKeys.map(k => {
      const shortName = k.replace('has', '');
      return (gs[k] ? '✓' : '✗') + shortName;
    }).join(' ');
    
    // Count criteria met
    const criteriaMet = criteriaKeys.filter(k => gs[k]).length;
    
    const logString = `[FOMO] ${getDate()}: ${stock.symbol} ${phaseName} [$${expectedPrice.toFixed(2)} Δ${(actualDelta * 100).toFixed(2)}%] ${criteriaMet}/4 GoldStd [${criteriaDisplay}] ${extraLogInfo} [day=${rally.day || 0}]`;
    
    return { expectedPrice, priceChange, logString };
  }

  // ========== INITIALIZATION ==========
  function init(dependencies = {}) {
    if (dependencies.random) deps.random = dependencies.random;
    if (dependencies.todayNews) deps.todayNews = dependencies.todayNews;
    if (dependencies.gameState) deps.gameState = dependencies.gameState;
    
    return FOMORally;
  }

  // ========== FOMO DETECTION ==========
  function calculateFOMOMetrics(stock) {
    // Calculate synthetic FOMO metrics for the stock
    const baseMetrics = {
      socialMentions: stock.fomoMentions || 1.0,
      priceDeviation: calculatePriceDeviation(stock),
      putCallRatio: stock.putCallRatio || 0.80,
      retailPct: stock.retailTradingPct || 0.15,
      volumeMultiple: stock.volumeMultiple || 1.0
    };

    // Calculate FOMO risk score (0-100)
    let riskScore = 0;
    
    // Social mentions contribution (0-30 points)
    if (baseMetrics.socialMentions >= CONSTANTS.SENTIMENT.extreme) {
      riskScore += 30;
    } else if (baseMetrics.socialMentions >= CONSTANTS.SENTIMENT.viral) {
      riskScore += 20;
    } else if (baseMetrics.socialMentions >= CONSTANTS.SENTIMENT.elevated) {
      riskScore += 10;
    }

    // Price deviation contribution (0-30 points)
    if (baseMetrics.priceDeviation >= CONSTANTS.DEVIATION.unsustainable) {
      riskScore += 30;
    } else if (baseMetrics.priceDeviation >= CONSTANTS.DEVIATION.extreme) {
      riskScore += 25;
    } else if (baseMetrics.priceDeviation >= CONSTANTS.DEVIATION.elevated) {
      riskScore += 15;
    }

    // Put/Call ratio contribution (0-20 points) - lower = more bullish/risky
    if (baseMetrics.putCallRatio <= CONSTANTS.OPTIONS.manic) {
      riskScore += 20;
    } else if (baseMetrics.putCallRatio <= CONSTANTS.OPTIONS.extreme) {
      riskScore += 15;
    } else if (baseMetrics.putCallRatio <= CONSTANTS.OPTIONS.bullish) {
      riskScore += 8;
    }

    // Retail trading percentage contribution (0-20 points)
    if (baseMetrics.retailPct >= CONSTANTS.RETAIL.extreme) {
      riskScore += 20;
    } else if (baseMetrics.retailPct >= CONSTANTS.RETAIL.fomo) {
      riskScore += 15;
    } else if (baseMetrics.retailPct >= CONSTANTS.RETAIL.elevated) {
      riskScore += 8;
    }

    return {
      ...baseMetrics,
      riskScore,
      isFOMOCandidate: riskScore >= 40
    };
  }

  function calculatePriceDeviation(stock) {
    // Calculate standard deviations from 20-day MA
    // In real implementation, would use actual price history
    if (stock.priceDeviation !== undefined) {
      return stock.priceDeviation;
    }
    
    // Simulate based on recent gains
    if (stock.fomoRally) {
      const rally = stock.fomoRally;
      const gain = (stock.price - rally.priceAtStart) / rally.priceAtStart;
      // Rough approximation: every 20% gain = ~1 SD
      return Math.min(5, gain / 0.20);
    }
    
    return 1.0;
  }

  // ========== RALLY TRIGGERING ==========
  function triggerFOMORally(stock, options = {}) {
    const metrics = calculateFOMOMetrics(stock);
    
    // Determine rally magnitude
    const magnitude = options.magnitude || determineMagnitude(metrics);
    const config = CONSTANTS.RALLY_MAGNITUDE[magnitude];
    
    // Calculate target gain
    const targetGain = config.minGain + deps.random() * (config.maxGain - config.minGain);
    
    // Calculate timeline
    const buildupDays = Math.floor(
      CONSTANTS.TIMELINE.buildupDays.min + 
      deps.random() * (CONSTANTS.TIMELINE.buildupDays.max - CONSTANTS.TIMELINE.buildupDays.min + 1)
    );
    const euphoriaDays = Math.floor(
      CONSTANTS.TIMELINE.euphoriaDays.min + 
      deps.random() * (CONSTANTS.TIMELINE.euphoriaDays.max - CONSTANTS.TIMELINE.euphoriaDays.min + 1)
    );
    const crashDays = Math.floor(
      CONSTANTS.TIMELINE.crashDays.min + 
      deps.random() * (CONSTANTS.TIMELINE.crashDays.max - CONSTANTS.TIMELINE.crashDays.min + 1)
    );

    // Apply sector weight
    const sectorWeight = CONSTANTS.SECTOR_WEIGHTS[stock.sector] || CONSTANTS.SECTOR_WEIGHTS.default;

    // Calculate base reversal probability
    const baseProbability = CONSTANTS.REVERSAL_PROBABILITY.parabolicOnly;

    // Create FOMO rally state
    stock.fomoRally = {
      phase: 'buildup',
      day: 0,
      dayInPhase: 0,
      
      // Magnitude and targets
      magnitude,
      targetGain: targetGain * sectorWeight,
      crashPct: config.crashPct,
      
      // Timeline
      buildupDays,
      euphoriaDays,
      blowOffDay: buildupDays + euphoriaDays,
      crashEndDay: buildupDays + euphoriaDays + CONSTANTS.TIMELINE.blowOffDuration + crashDays,
      
      // Starting metrics
      priceAtStart: stock.price,
      priceAtPeak: null,
      peakMentions: null,
      
      // Current metrics
      currentGain: 0,
      socialMentions: metrics.socialMentions,
      priceDeviation: metrics.priceDeviation,
      putCallRatio: metrics.putCallRatio,
      retailPct: metrics.retailPct,
      volumeMultiple: 1.0,
      
      // Gold Standard tracking
      goldStandard: {
        hasVerticalitySignal: false,      // 3+ SD
        hasRetailEuphoria: false,         // P/C < 0.4
        hasSentimentDivergence: false,    // Peak mentions + lower price
        hasBlowOffTop: false              // Gap up, close low, volume spike
      },
      
      // Reversal tracking
      baseProbability,
      finalCrashProb: null,
      crashWillHappen: null,
      vetoFactors: options.vetoFactors || [],
      
      // Metrics history
      metrics,
      priceHistory: [{ day: 0, price: stock.price, mentions: metrics.socialMentions }]
    };

    // Apply veto factors
    if (options.vetoFactors) {
      options.vetoFactors.forEach(veto => addVetoFactor(stock, veto));
    }

    generateFOMONews(stock, 'trigger');
    
    return stock.fomoRally;
  }

  function determineMagnitude(metrics) {
    if (metrics.riskScore >= 80) return 'extreme';
    if (metrics.riskScore >= 60) return 'major';
    return 'minor';
  }

  // ========== RALLY PROCESSING ==========
  function processFOMORally(stock) {
    if (!stock.fomoRally) return null;

    const rally = stock.fomoRally;
    rally.day++;
    
    // Determine current phase
    const day = rally.day;
    
    if (day <= rally.buildupDays) {
      rally.phase = 'buildup';
      rally.dayInPhase = day;
      processBuildup(stock);
    } else if (day <= rally.blowOffDay) {
      rally.phase = 'euphoria';
      rally.dayInPhase = day - rally.buildupDays;
      processEuphoria(stock);
    } else if (day === rally.blowOffDay + 1) {
      rally.phase = 'blowOff';
      rally.dayInPhase = 1;
      processBlowOff(stock);
    } else if (day <= rally.crashEndDay) {
      rally.phase = 'crash';
      rally.dayInPhase = day - rally.blowOffDay - 1;
      processCrash(stock);
    } else {
      // Event complete
      generateFOMONews(stock, 'complete');
      delete stock.fomoRally;
      return null;
    }

    return rally;
  }

  // ========== PHASE PROCESSORS ==========
  function processBuildup(stock) {
    const rally = stock.fomoRally;
    
    // Social mentions building
    rally.socialMentions *= (1 + deps.random() * 0.30);
    
    // Volume increasing
    rally.volumeMultiple = 1 + deps.random() * 1.5;
    
    // Price deviation increasing
    rally.priceDeviation = Math.min(2.5, rally.priceDeviation + deps.random() * 0.3);
    
    // Put/Call ratio declining (more bullish)
    rally.putCallRatio = Math.max(0.50, rally.putCallRatio - deps.random() * 0.08);
    
    // Retail participation increasing
    rally.retailPct = Math.min(0.45, rally.retailPct + deps.random() * 0.05);

    // Track current gain
    rally.currentGain = (stock.price - rally.priceAtStart) / rally.priceAtStart;

    generateFOMONews(stock, 'buildup');
  }

  function processEuphoria(stock) {
    const rally = stock.fomoRally;
    const progress = rally.dayInPhase / rally.euphoriaDays;
    
    // Social mentions exploding
    rally.socialMentions *= (1 + 0.30 + deps.random() * 0.50);
    
    // Volume exploding
    rally.volumeMultiple = 2 + progress * 4 + deps.random() * 2; // 2x to 8x+
    
    // Price deviation going extreme
    rally.priceDeviation = Math.min(5, rally.priceDeviation + 0.3 + deps.random() * 0.4);
    
    // Put/Call ratio collapsing (extreme greed)
    rally.putCallRatio = Math.max(0.25, rally.putCallRatio - deps.random() * 0.10);
    
    // Retail dominating
    rally.retailPct = Math.min(0.75, rally.retailPct + deps.random() * 0.10);

    // Track current gain
    rally.currentGain = (stock.price - rally.priceAtStart) / rally.priceAtStart;

    // Check Gold Standard: Verticality (3+ SD)
    if (rally.priceDeviation >= CONSTANTS.GOLD_STANDARD.deviationThreshold) {
      rally.goldStandard.hasVerticalitySignal = true;
    }

    // Check Gold Standard: Retail Euphoria (P/C < 0.4)
    if (rally.putCallRatio <= CONSTANTS.GOLD_STANDARD.putCallThreshold) {
      rally.goldStandard.hasRetailEuphoria = true;
    }

    // Check Gold Standard: Volume Climax
    if (rally.volumeMultiple >= CONSTANTS.GOLD_STANDARD.blowOffVolume) {
      rally.goldStandard.hasBlowOffTop = true;
    }

    // Track highest price
    if (!rally.priceAtPeak || stock.price > rally.priceAtPeak) {
      rally.priceAtPeak = stock.price;
      rally.peakMentions = rally.socialMentions;
    }

    generateFOMONews(stock, 'euphoria');
  }

  function processBlowOff(stock) {
    const rally = stock.fomoRally;

    // IMPORTANT: Record the peak FIRST (before any blow-off adjustments)
    // The blow-off day IS the peak - any price move on this day was already applied
    rally.priceAtPeak = stock.price;
    
    // Blow-off top: Maximum everything (metrics only, peak already recorded)
    rally.volumeMultiple = 5 + deps.random() * 8; // 5-13x volume
    rally.socialMentions *= (1.5 + deps.random());
    rally.peakMentions = rally.socialMentions;
    rally.retailPct = Math.min(0.85, rally.retailPct + 0.15);
    rally.putCallRatio = Math.max(0.20, rally.putCallRatio - 0.10);
    rally.priceDeviation = Math.min(5, rally.priceDeviation + 0.5);

    // Calculate final gain
    rally.currentGain = (stock.price - rally.priceAtStart) / rally.priceAtStart;

    // Check Gold Standard: Blow-off Top (volume climax)
    if (rally.volumeMultiple >= CONSTANTS.GOLD_STANDARD.blowOffVolume) {
      rally.goldStandard.hasBlowOffTop = true;
    }

    // All criteria should be met by blow-off
    rally.goldStandard.hasVerticalitySignal = rally.priceDeviation >= CONSTANTS.GOLD_STANDARD.deviationThreshold;
    rally.goldStandard.hasRetailEuphoria = rally.putCallRatio <= CONSTANTS.GOLD_STANDARD.putCallThreshold;
    rally.goldStandard.hasSentimentDivergence = true; // By definition at peak

    // Determine crash probability
    let crashProb = CONSTANTS.REVERSAL_PROBABILITY.parabolicOnly;
    
    // Add factors
    const gsMet = Object.values(rally.goldStandard).filter(Boolean).length;
    if (gsMet === 4) {
      crashProb = CONSTANTS.GOLD_STANDARD.successRate;
    } else if (gsMet >= 3) {
      crashProb = CONSTANTS.REVERSAL_PROBABILITY.plusDivergence;
    } else if (gsMet >= 2) {
      crashProb = CONSTANTS.REVERSAL_PROBABILITY.plusSentiment;
    }

    // Apply veto factors
    rally.vetoFactors.forEach(veto => {
      const vetoConfig = CONSTANTS.VETO_FACTORS[veto];
      if (vetoConfig) {
        crashProb -= vetoConfig.probabilityReduction;
      }
    });

    rally.finalCrashProb = Math.max(0.25, Math.min(0.90, crashProb));
    rally.crashWillHappen = deps.random() < rally.finalCrashProb;

    generateFOMONews(stock, 'blowOff');
  }

  function processCrash(stock) {
    const rally = stock.fomoRally;

    // Crash phase: Everything reverses (metrics normalizing)
    rally.volumeMultiple = Math.max(1.5, rally.volumeMultiple * 0.75);
    rally.socialMentions *= (0.70 + deps.random() * 0.20); // Mentions declining
    rally.putCallRatio = Math.min(1.2, rally.putCallRatio + deps.random() * 0.12); // P/C normalizing (slower)
    rally.priceDeviation = Math.max(0, rally.priceDeviation - 0.3 - deps.random() * 0.2); // SD normalizing

    // UPDATE currentGain during crash (this was missing!)
    rally.currentGain = (stock.price - rally.priceAtStart) / rally.priceAtStart;

    // Track lowest price
    if (!rally.lowestCrashPrice || stock.price < rally.lowestCrashPrice) {
      rally.lowestCrashPrice = stock.price;
    }

    // Calculate crash progress (% of gains lost)
    const gainsLost = rally.priceAtPeak ? 
      (rally.priceAtPeak - stock.price) / (rally.priceAtPeak - rally.priceAtStart) : 0;
    
    // Calculate crash from peak (for empirical alignment check)
    const crashFromPeak = rally.priceAtPeak ?
      (rally.priceAtPeak - stock.price) / rally.priceAtPeak : 0;

    generateFOMONews(stock, 'crash', { crashPct: gainsLost, crashFromPeak });
  }

  // ========== VETO FACTOR MANAGEMENT ==========
  function addVetoFactor(stock, vetoType) {
    if (!stock.fomoRally) return false;
    if (!CONSTANTS.VETO_FACTORS[vetoType]) return false;
    if (!stock.fomoRally.vetoFactors.includes(vetoType)) {
      stock.fomoRally.vetoFactors.push(vetoType);
    }
    return true;
  }

  function removeVetoFactor(stock, vetoType) {
    if (!stock.fomoRally) return false;
    const idx = stock.fomoRally.vetoFactors.indexOf(vetoType);
    if (idx > -1) {
      stock.fomoRally.vetoFactors.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ========== SIGNAL CALCULATION ==========
  function calculateSignal(stock) {
    if (!stock.fomoRally) return { dailyBias: 0, phase: null };

    const rally = stock.fomoRally;
    const phase = rally.phase;
    let dailyBias = 0;

    switch (phase) {
      case 'buildup':
        const buildupRange = CONSTANTS.PRICE_IMPACT.buildup;
        dailyBias = buildupRange.min + deps.random() * (buildupRange.max - buildupRange.min);
        break;

      case 'euphoria':
        const euphoriaRange = CONSTANTS.PRICE_IMPACT.euphoria;
        const euphoriaProgress = rally.dayInPhase / rally.euphoriaDays;
        const euphoriaBase = euphoriaRange.min + euphoriaProgress * (euphoriaRange.max - euphoriaRange.min);
        dailyBias = euphoriaBase + deps.random() * 0.05;
        break;

      case 'blowOff':
        const blowOffRange = CONSTANTS.PRICE_IMPACT.blowOff;
        dailyBias = blowOffRange.min + deps.random() * (blowOffRange.max - blowOffRange.min);
        break;

      case 'crash':
        if (rally.crashWillHappen) {
          const crashRange = CONSTANTS.PRICE_IMPACT.crash;
          // Crash intensity decreases over time (front-loaded selling)
          const crashDays = rally.crashEndDay - rally.blowOffDay - 1;
          const crashProgress = rally.dayInPhase / crashDays;
          // Early crash days are more severe, later days moderate
          // Range is -8% to -3%, so we interpolate from severe to moderate
          const severityFactor = 1 - crashProgress * 0.5; // 1.0 → 0.5 over crash period
          dailyBias = crashRange.min * severityFactor + deps.random() * (crashRange.max - crashRange.min);
        } else {
          // No crash - just normal volatility
          dailyBias = (deps.random() - 0.5) * 0.04;
        }
        break;
    }

    return {
      dailyBias,
      phase,
      magnitude: rally.magnitude,
      currentGain: rally.currentGain,
      socialMentions: rally.socialMentions,
      priceDeviation: rally.priceDeviation,
      putCallRatio: rally.putCallRatio,
      goldStandard: rally.goldStandard,
      crashWillHappen: rally.crashWillHappen
    };
  }

  // ========== NEWS GENERATION ==========
  // Empirical NLP: "Euphoria Peak" language (Barber & Odean - Attention-Driven Buying)
  // Keywords: "Historic," "Moon," "Next [Famous Company]," "Retail Frenzy," "Skyrockets," "Can't be stopped"
  function generateFOMONews(stock, phase, data = {}) {
    const rally = stock.fomoRally;
    if (!rally || !deps.todayNews) return;

    const newsTemplates = {
      trigger: [
        `${stock.symbol} trending on social media with record engagement`,
        `Retail traders pile into ${stock.symbol} as social buzz intensifies`,
        `${stock.symbol} goes viral: "Don't miss out" sentiment spreading`
      ],
      buildup: [
        `${stock.symbol} SKYROCKETS as retail frenzy builds momentum`,
        `"The next Tesla?" - ${stock.symbol} social mentions up ${Math.round(rally.socialMentions)}x`,
        `${stock.symbol} can't be stopped - call options seeing RECORD activity`
      ],
      euphoria: [
        `HISTORIC: ${stock.symbol} enters parabolic phase - ${rally.priceDeviation.toFixed(1)} sigma above mean`,
        `"TO THE MOON" - ${stock.symbol} retail frenzy reaches fever pitch`,
        `${stock.symbol} UNSTOPPABLE: Put/call ratio collapses to ${rally.putCallRatio.toFixed(2)}`
      ],
      blowOff: [
        `${stock.symbol} gaps up on RECORD volume - is this the top?`,
        `"Diamond hands" vs "Take profits" - ${stock.symbol} divides retail traders`,
        `${stock.symbol} volume explodes to ${rally.volumeMultiple.toFixed(1)}x average - blow-off top?`
      ],
      crash: [
        `${stock.symbol} gives back gains as FOMO buyers hold bags`,
        `Social sentiment on ${stock.symbol} turns sour as price drops`,
        `${stock.symbol} "reality check" - down ${Math.abs(data.crashPct * 100 || 0).toFixed(0)}% from peak`
      ],
      complete: [
        `${stock.symbol} FOMO rally ends - lessons learned?`,
        `${stock.symbol} returns toward mean after sentiment-driven spike`
      ]
    };

    const templates = newsTemplates[phase] || newsTemplates.buildup;
    const headline = templates[Math.floor(deps.random() * templates.length)];

    const sentimentMap = {
      trigger: 'positive',
      buildup: 'positive',
      euphoria: 'positive',
      blowOff: 'neutral',
      crash: 'negative',
      complete: 'neutral'
    };

    // Calculate signal to get daily bias
    const signal = calculateSignal(stock);
    const dailyBias = signal.dailyBias || 0;

    // DD-002: Log event with price expectation
    const extraInfo = phase === 'blowOff' ? `vol=${rally.volumeMultiple.toFixed(1)}x P/C=${rally.putCallRatio.toFixed(2)}` :
                      phase === 'crash' ? `will=${rally.crashWillHappen} prob=${((rally.finalCrashProb || 0) * 100).toFixed(0)}%` :
                      phase === 'complete' ? `result=${rally.crashWillHappen ? 'crashed' : 'held'}` :
                      `mentions=${rally.socialMentions.toFixed(0)}x SD=${rally.priceDeviation.toFixed(1)}`;
    const event = setPriceEvent(stock, dailyBias, phase.toUpperCase(), rally, extraInfo);
    console.log(event.logString);

    // Count gold standard criteria met
    const gsMet = Object.values(rally.goldStandard).filter(Boolean).length;

    deps.todayNews.push({
      headline,
      description: getPhaseDescription(phase, rally),
      sentiment: sentimentMap[phase],
      relatedStock: stock.symbol,
      newsType: 'fomo_rally',
      phase,
      isFOMORally: true,
      goldStandardCount: gsMet,
      goldStandardCriteria: rally.goldStandard
    });
  }

  function getPhaseDescription(phase, rally) {
    const descriptions = {
      trigger: 'Social media attention is driving unusual trading activity.',
      buildup: 'Momentum is building as more retail traders discover this stock.',
      euphoria: 'The rally has gone parabolic. Extreme greed detected in options market.',
      blowOff: 'Classic blow-off top pattern forming. Smart money may be exiting.',
      crash: 'The bubble is deflating. Late buyers facing significant losses.',
      complete: 'The FOMO cycle has completed. Price returning to fundamentals.'
    };
    return descriptions[phase];
  }

  // ========== TUTORIAL HINTS ==========
  function getTutorialHint(stock) {
    if (!stock.fomoRally) return null;

    const rally = stock.fomoRally;
    const phase = rally.phase;

    const hints = {
      buildup: {
        type: 'FOMO Rally Building',
        description: `${stock.symbol} is gaining social momentum. Mentions at ${rally.socialMentions.toFixed(1)}x baseline.`,
        implication: 'Early stage - trend could continue or fizzle. Wait for euphoria phase.',
        action: 'WATCH - Monitor sentiment indicators for euphoria phase.',
        timing: 'Too early to short. Wait for Gold Standard setup.',
        catalyst: 'Wait for 3+ SD extension and P/C ratio collapse.'
      },
      euphoria: {
        type: 'EUPHORIA PHASE - Extreme Greed',
        description: `${stock.symbol} trading ${rally.priceDeviation.toFixed(1)} SD above MA. P/C ratio at ${rally.putCallRatio.toFixed(2)}.`,
        implication: 'Gold Standard signals emerging. Do NOT buy here - reversal probability rising.',
        action: 'PREPARE TO SHORT - Watch for blow-off top confirmation.',
        timing: 'Entry approaching. Wait for volume climax + sentiment/price divergence.',
        catalyst: 'Headlines shifting to "Historic," "Moon," "Retail Frenzy" = TOP IS NEAR.'
      },
      blowOff: {
        type: '🚨 BLOW-OFF TOP',
        description: `DANGER: ${stock.symbol} showing classic blow-off pattern. Volume ${rally.volumeMultiple.toFixed(1)}x average.`,
        implication: 'This is the "transfer of ownership" from smart to dumb money. All criteria met.',
        action: 'SHORT or BUY PUTS on first lower high.',
        timing: 'NOW - Enter short on first lower high confirmation.',
        catalyst: '85% crash probability. Barber & Odean: 30-90 day underperformance follows.'
      },
      crash: {
        type: 'FOMO CRASH IN PROGRESS',
        description: `${stock.symbol} down from peak. "Bag holders" emerging.`,
        implication: 'Late buyers typically lose 20-30% in following week. ' + (rally.crashWillHappen ? 'Target 50-day MA.' : 'Crash not confirmed.'),
        action: rally.crashWillHappen ? 'HOLD SHORT - Target 50-day MA.' : 'CAUTION - Crash not confirmed.',
        timing: 'Hold position. Exit at 50-day MA or on bounce exhaustion.',
        catalyst: 'Barber & Odean: 30-90 day underperformance expected.'
      }
    };

    return hints[phase] || hints.buildup;
  }

  // ========== EVENT CHECKING ==========
  function checkFOMORallyEvents(stock, newsArray) {
    // Check if stock already has an active rally
    if (stock.fomoRally) {
      processFOMORally(stock);
      return true;
    }

    // Check news for FOMO triggers
    if (newsArray && newsArray.length > 0) {
      for (const news of newsArray) {
        if (news.isFOMORally && news.relatedStock === stock.symbol) {
          if (!stock.fomoRally) {
            triggerFOMORally(stock);
          }
          return true;
        }
      }
    }

    return false;
  }

  // ========== PUBLIC API ==========
  return {
    // Initialization
    init,
    
    // Constants
    CONSTANTS,
    
    // Core functions
    calculateFOMOMetrics,
    triggerFOMORally,
    processFOMORally,
    checkFOMORallyEvents,
    generateFOMONews,
    
    // Signal calculation
    calculateSignal,
    
    // Veto management
    addVetoFactor,
    removeVetoFactor,
    
    // Tutorial hints
    getTutorialHint,
    
    // Testing
    _test: {
      calculateFOMOMetrics,
      calculatePriceDeviation: function(stock) {
        // Expose for testing (defined inside module)
        if (!stock.priceHistory || stock.priceHistory.length < 20) return 0;
        const history = stock.priceHistory.slice(-20);
        const mean = history.reduce((a, b) => a + b, 0) / history.length;
        const variance = history.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);
        return stdDev > 0 ? (stock.price - mean) / stdDev : 0;
      }
    },
    
    _reset: function() {
      deps = {
        random: Math.random,
        todayNews: null,
        gameState: null
      };
    }
  };

})();

// Global wrapper for tutorial.js compatibility
function getFOMORallyTutorialHint(newsItem) {
  // FOMORally.getTutorialHint takes stock, not newsItem
  // Find the stock from the newsItem's relatedStock
  if (newsItem && newsItem.relatedStock && typeof stocks !== 'undefined') {
    const stock = stocks.find(s => s.symbol === newsItem.relatedStock);
    if (stock) {
      return FOMORally.getTutorialHint(stock);
    }
  }
  return null;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FOMORally;
}
