/**
 * Short Squeeze Module
 * 
 * Empirical Sources:
 * - CFA Institute (2023): 1,000+ strict squeezes (1972-2022), 50-500% rise then reversal
 * - ResearchGate (2024/2025): 15% of short attacks → squeeze, market-driven reverse more
 * - LUT University (2025): SI % of Float = #1 predictor
 * 
 * Gold Standard (85%+): SHORT the exhaustion after climax
 * 1. Parabolic Extension: 100%+ above 20-day MA, 3σ Bollinger
 * 2. Volume Climax: 5-10x average, Shooting Star candle
 * 3. Borrow Fee Plateau: CTB flattens while price peaks
 * 4. RSI Divergence: Price Higher High, RSI Lower High
 * 
 * Timeline: buildup → squeeze → climax → reversal
 * Veto: Gamma Squeeze (OTM call volume still rising)
 */

const ShortSqueeze = (function() {
  'use strict';

  // ========== EMPIRICAL CONSTANTS ==========
  const CONSTANTS = {
    // Short Interest thresholds (LUT University 2025)
    SHORT_INTEREST: {
      baseline: 0.20,      // 20% SI = baseline risk
      dangerZone: 0.30,    // 30% SI = "danger zone" for shorts
      extreme: 0.50,       // 50%+ SI = extreme squeeze potential
      squeezeThreshold: 0.25 // Minimum to trigger squeeze event
    },

    // Days to Cover thresholds
    DAYS_TO_COVER: {
      moderate: 3,         // 3 days = moderate risk
      high: 5,             // 5 days = high risk (door too small)
      extreme: 10          // 10+ days = extreme squeeze potential
    },

    // Cost to Borrow dynamics
    COST_TO_BORROW: {
      normal: 0.05,        // 5% = normal
      elevated: 0.20,      // 20% = elevated
      critical: 0.50,      // 50% = critical
      extreme: 1.00        // 100%+ = extreme (final spark)
    },

    // Utilization levels
    UTILIZATION: {
      moderate: 0.80,      // 80% = moderate
      high: 0.95,          // 95% = high
      maxed: 1.00          // 100% = no shares left to borrow
    },

    // Price impact by phase (CFA Institute 2023)
    PRICE_IMPACT: {
      buildup: { min: 0.02, max: 0.05 },        // +2-5% daily during buildup
      squeeze: { min: 0.10, max: 0.25 },        // +10-25% daily during squeeze
      climax: { min: 0.15, max: 0.50 },         // +15-50% on climax day
      reversal: { min: -0.15, max: -0.08 }      // -8-15% daily reversal
    },

    // Timeline (empirical averages)
    TIMELINE: {
      buildupDays: { min: 3, max: 7 },          // 3-7 days of pressure building
      squeezeDays: { min: 2, max: 5 },          // 2-5 days of parabolic move
      climaxDuration: 1,                         // 1 day climax
      reversalDays: { min: 3, max: 5 }          // 3-5 days to lose 50% of gains
    },

    // Squeeze magnitude categories (CFA Institute)
    SQUEEZE_MAGNITUDE: {
      minor: { minGain: 0.50, maxGain: 1.00, reversalPct: 0.40 },   // 50-100% gain, 40% reversal
      major: { minGain: 1.00, maxGain: 2.00, reversalPct: 0.50 },   // 100-200% gain, 50% reversal
      extreme: { minGain: 2.00, maxGain: 5.00, reversalPct: 0.60 }  // 200-500% gain, 60% reversal
    },

    // Gold Standard exhaustion filter (85%+ success)
    GOLD_STANDARD: {
      parabolicExtension: 1.00,    // 100%+ above 20-day MA
      bollingerDeviation: 3,       // Outside 3σ Bollinger
      volumeClimax: 5,             // 5x+ average volume
      rsiThreshold: 85,            // RSI > 85 at peak
      successRate: 0.85            // 85% reversal success
    },

    // Veto factors
    VETO_FACTORS: {
      gammaSqueeze: {
        description: 'OTM call volume still rising aggressively',
        probabilityReduction: 0.40  // -40% reversal probability
      },
      shortInterestRising: {
        description: 'New shorts entering despite squeeze',
        probabilityReduction: 0.20  // -20%
      },
      fundamentalCatalyst: {
        description: 'Real positive news (FDA approval, earnings beat)',
        probabilityReduction: 0.50  // -50%
      },
      retailMomentum: {
        description: 'Social media frenzy still building (WSB, Twitter)',
        probabilityReduction: 0.25  // -25%
      }
    },

    // Sector susceptibility (CFA Institute 2023)
    SECTOR_WEIGHTS: {
      biotech: 1.5,        // 50% more likely
      software: 1.3,       // 30% more likely
      retail: 1.2,         // 20% more likely (meme stocks)
      energy: 1.0,         // baseline
      financial: 0.8,      // 20% less likely
      utility: 0.5         // 50% less likely
    }
  };

  // ========== MODULE STATE ==========
  let deps = {
    stocks: [],
    todayNews: [],
    gameState: { day: 0 },
    getMemeMultiplier: () => 1.0,
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],
    isEventTypeEnabled: () => true,
    random: Math.random
  };

  // ========== DD-002 STANDARD API ==========
  /**
   * Get formatted date string from game state
   */
  function getDate() {
    const day = deps.gameState.day || 0;
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
  function setPriceEvent(stock, priceChange, phaseName, squeeze, extraLogInfo = '') {
    const expectedPrice = Math.round(stock.price * (1 + priceChange) * 100) / 100;
    const actualDelta = (expectedPrice - stock.price) / stock.price;
    
    // Set transition effect for test validation
    stock.shortSqueezeTransitionEffect = priceChange;
    stock.eventExpectedPrice = expectedPrice;
    stock.eventExpectedDelta = actualDelta;
    
    // Build Gold Standard criteria display
    const gs = squeeze.goldStandard || {};
    const criteriaKeys = ['hasParabolicExtension', 'hasVolumeClimax', 'hasBorrowPlateau', 'hasRsiDivergence'];
    const criteriaDisplay = criteriaKeys.map(k => {
      const shortName = k.replace('has', '');
      return (gs[k] ? '✓' : '✗') + shortName;
    }).join(' ');
    
    // Count criteria met
    const criteriaMet = criteriaKeys.filter(k => gs[k]).length;
    
    const logString = `[SQUEEZE] ${getDate()}: ${stock.symbol} ${phaseName} [$${expectedPrice.toFixed(2)} Δ${(actualDelta * 100).toFixed(2)}%] ${criteriaMet}/4 GoldStd [${criteriaDisplay}] ${extraLogInfo} [day=${squeeze.dayInPhase || 0}]`;
    
    return { expectedPrice, priceChange, logString };
  }

  // ========== INITIALIZATION ==========
  function init(dependencies) {
    if (dependencies) {
      deps = { ...deps, ...dependencies };
    }
    return ShortSqueeze;
  }

  // ========== SQUEEZE CANDIDATE DETECTION ==========
  function calculateSqueezeRisk(stock) {
    // Generate squeeze metrics for a stock
    const shortInterest = stock.shortInterest || (deps.random() * 0.40 + 0.10);
    const daysTocover = stock.daysToCover || Math.floor(deps.random() * 12 + 2);
    const utilization = stock.utilization || (deps.random() * 0.30 + 0.70);
    const costToBorrow = stock.costToBorrow || (deps.random() * 0.50 + 0.05);

    let riskScore = 0;

    // Short Interest scoring
    if (shortInterest >= CONSTANTS.SHORT_INTEREST.extreme) riskScore += 40;
    else if (shortInterest >= CONSTANTS.SHORT_INTEREST.dangerZone) riskScore += 30;
    else if (shortInterest >= CONSTANTS.SHORT_INTEREST.baseline) riskScore += 15;

    // Days to Cover scoring
    if (daysTocover >= CONSTANTS.DAYS_TO_COVER.extreme) riskScore += 30;
    else if (daysTocover >= CONSTANTS.DAYS_TO_COVER.high) riskScore += 20;
    else if (daysTocover >= CONSTANTS.DAYS_TO_COVER.moderate) riskScore += 10;

    // Utilization scoring
    if (utilization >= CONSTANTS.UTILIZATION.maxed) riskScore += 20;
    else if (utilization >= CONSTANTS.UTILIZATION.high) riskScore += 15;
    else if (utilization >= CONSTANTS.UTILIZATION.moderate) riskScore += 5;

    // Cost to Borrow scoring
    if (costToBorrow >= CONSTANTS.COST_TO_BORROW.extreme) riskScore += 10;
    else if (costToBorrow >= CONSTANTS.COST_TO_BORROW.critical) riskScore += 7;
    else if (costToBorrow >= CONSTANTS.COST_TO_BORROW.elevated) riskScore += 3;

    return {
      shortInterest,
      daysToCover: daysTocover,
      utilization,
      costToBorrow,
      riskScore,
      isCandidate: riskScore >= 50
    };
  }

  // ========== TRIGGER SHORT SQUEEZE ==========
  function triggerShortSqueeze(stock, options = {}) {
    const day = deps.gameState.day;
    
    // Calculate squeeze metrics
    const metrics = options.metrics || calculateSqueezeRisk(stock);
    
    // Determine squeeze magnitude based on metrics
    let magnitude = 'minor';
    if (metrics.riskScore >= 80) magnitude = 'extreme';
    else if (metrics.riskScore >= 65) magnitude = 'major';

    const magConfig = CONSTANTS.SQUEEZE_MAGNITUDE[magnitude];

    // Calculate timeline
    const buildupDays = options.buildupDays || 
      Math.floor(deps.random() * (CONSTANTS.TIMELINE.buildupDays.max - CONSTANTS.TIMELINE.buildupDays.min + 1)) + 
      CONSTANTS.TIMELINE.buildupDays.min;
    
    const squeezeDays = options.squeezeDays ||
      Math.floor(deps.random() * (CONSTANTS.TIMELINE.squeezeDays.max - CONSTANTS.TIMELINE.squeezeDays.min + 1)) + 
      CONSTANTS.TIMELINE.squeezeDays.min;

    const reversalDays = options.reversalDays ||
      Math.floor(deps.random() * (CONSTANTS.TIMELINE.reversalDays.max - CONSTANTS.TIMELINE.reversalDays.min + 1)) + 
      CONSTANTS.TIMELINE.reversalDays.min;

    // Calculate target gain
    const targetGain = magConfig.minGain + deps.random() * (magConfig.maxGain - magConfig.minGain);

    // Determine sector weight
    const sectorWeight = options.sectorWeight || CONSTANTS.SECTOR_WEIGHTS.retail;

    // Base reversal probability
    let baseProbability = CONSTANTS.GOLD_STANDARD.successRate * sectorWeight;
    baseProbability = Math.min(0.90, Math.max(0.50, baseProbability));

    // Store squeeze state
    stock.shortSqueeze = {
      // Timeline
      startDay: day,
      buildupEndDay: day + buildupDays,
      climaxDay: day + buildupDays + squeezeDays,
      reversalEndDay: day + buildupDays + squeezeDays + reversalDays,
      buildupDays,
      squeezeDays,
      reversalDays,

      // Current state
      phase: 'buildup',
      dayInPhase: 0,

      // Metrics
      metrics: metrics,
      magnitude,
      targetGain,
      currentGain: 0,
      priceAtStart: stock.price,
      priceAtClimax: null,

      // Tracking
      volumeMultiple: 1,
      rsiValue: 50,
      shortInterestCurrent: metrics.shortInterest,
      ctbCurrent: metrics.costToBorrow,
      utilizationCurrent: metrics.utilization,

      // Gold Standard tracking
      goldStandard: {
        hasParabolicExtension: false,
        hasVolumeClimax: false,
        hasBorrowPlateau: false,
        hasRsiDivergence: false
      },

      // Reversal mechanics
      baseProbability,
      finalReversalProb: baseProbability,
      reversalWillHappen: null,  // Determined at climax
      vetoFactors: [],

      // Price at key points
      highestPrice: stock.price,
      lowestReversalPrice: null
    };

    // Generate announcement news
    generateSqueezeNews(stock, 'buildup');

    return stock.shortSqueeze;
  }

  // ========== PROCESS SHORT SQUEEZE ==========
  function processShortSqueeze(stock) {
    if (!stock.shortSqueeze) return null;

    const squeeze = stock.shortSqueeze;
    const day = deps.gameState.day;

    // Determine current phase
    if (day <= squeeze.buildupEndDay) {
      squeeze.phase = 'buildup';
      squeeze.dayInPhase = day - squeeze.startDay;
      processBuildup(stock);
    } else if (day < squeeze.climaxDay) {
      squeeze.phase = 'squeeze';
      squeeze.dayInPhase = day - squeeze.buildupEndDay;
      processSqueeze(stock);
    } else if (day === squeeze.climaxDay) {
      squeeze.phase = 'climax';
      squeeze.dayInPhase = 0;
      processClimax(stock);
    } else if (day <= squeeze.reversalEndDay) {
      squeeze.phase = 'reversal';
      squeeze.dayInPhase = day - squeeze.climaxDay;
      processReversal(stock);
    } else {
      // Event complete
      generateSqueezeNews(stock, 'complete');
      delete stock.shortSqueeze;
      return null;
    }

    return squeeze;
  }

  // ========== PHASE PROCESSORS ==========
  function processBuildup(stock) {
    const squeeze = stock.shortSqueeze;
    
    // During buildup: SI rising, CTB increasing, price creeping up
    squeeze.shortInterestCurrent *= (1 + deps.random() * 0.05);
    squeeze.ctbCurrent *= (1 + deps.random() * 0.10);
    squeeze.volumeMultiple = 1 + deps.random() * 1.5;

    // Track current gain
    squeeze.currentGain = (stock.price - squeeze.priceAtStart) / squeeze.priceAtStart;

    // Update RSI (building toward overbought)
    squeeze.rsiValue = Math.min(75, 50 + squeeze.dayInPhase * 5 + deps.random() * 5);

    generateSqueezeNews(stock, 'buildup');
  }

  function processSqueeze(stock) {
    const squeeze = stock.shortSqueeze;

    // During squeeze: Parabolic price action
    const progress = squeeze.dayInPhase / squeeze.squeezeDays;
    
    // Volume explodes
    squeeze.volumeMultiple = 3 + progress * 7 + deps.random() * 3; // 3x to 10x+

    // SI starts dropping (shorts covering)
    squeeze.shortInterestCurrent *= (1 - 0.10 - deps.random() * 0.15);

    // CTB may spike then plateau
    if (progress < 0.5) {
      squeeze.ctbCurrent *= (1 + deps.random() * 0.20);
    } else {
      squeeze.ctbCurrent *= (1 - deps.random() * 0.05);
    }

    // RSI goes extreme
    squeeze.rsiValue = Math.min(95, 75 + progress * 20 + deps.random() * 5);

    // Track current gain
    squeeze.currentGain = (stock.price - squeeze.priceAtStart) / squeeze.priceAtStart;

    // Check Gold Standard: Parabolic Extension
    if (squeeze.currentGain >= CONSTANTS.GOLD_STANDARD.parabolicExtension) {
      squeeze.goldStandard.hasParabolicExtension = true;
    }

    // Check Gold Standard: Volume Climax
    if (squeeze.volumeMultiple >= CONSTANTS.GOLD_STANDARD.volumeClimax) {
      squeeze.goldStandard.hasVolumeClimax = true;
    }

    // Track highest price
    if (stock.price > squeeze.highestPrice) {
      squeeze.highestPrice = stock.price;
    }

    generateSqueezeNews(stock, 'squeeze');
  }

  function processClimax(stock) {
    const squeeze = stock.shortSqueeze;

    // Climax day: Maximum volume, shooting star potential
    squeeze.volumeMultiple = 8 + deps.random() * 7; // 8-15x volume
    squeeze.rsiValue = 90 + deps.random() * 10; // RSI 90-100

    // Final SI drop
    squeeze.shortInterestCurrent *= (1 - 0.20 - deps.random() * 0.20);

    // CTB plateaus/drops (shorts covered)
    squeeze.ctbCurrent *= (1 - deps.random() * 0.30);
    squeeze.goldStandard.hasBorrowPlateau = true;

    // Record climax price
    squeeze.priceAtClimax = stock.price;
    squeeze.highestPrice = Math.max(squeeze.highestPrice, stock.price);

    // Calculate final gain
    squeeze.currentGain = (stock.price - squeeze.priceAtStart) / squeeze.priceAtStart;

    // Check Gold Standard: Parabolic Extension (also check here in case it crossed 100% late)
    if (squeeze.currentGain >= CONSTANTS.GOLD_STANDARD.parabolicExtension) {
      squeeze.goldStandard.hasParabolicExtension = true;
    }

    // Check RSI divergence (simulated)
    if (squeeze.rsiValue >= CONSTANTS.GOLD_STANDARD.rsiThreshold) {
      squeeze.goldStandard.hasRsiDivergence = true;
    }

    // Determine if reversal will happen
    let reversalProb = squeeze.baseProbability;
    
    // Adjust for Gold Standard criteria met
    const gsMet = Object.values(squeeze.goldStandard).filter(Boolean).length;
    if (gsMet === 4) {
      reversalProb = CONSTANTS.GOLD_STANDARD.successRate;
    } else if (gsMet >= 3) {
      reversalProb = Math.min(reversalProb + 0.10, 0.85);
    }

    // Apply veto factors
    squeeze.vetoFactors.forEach(veto => {
      const vetoConfig = CONSTANTS.VETO_FACTORS[veto];
      if (vetoConfig) {
        reversalProb -= vetoConfig.probabilityReduction;
      }
    });

    squeeze.finalReversalProb = Math.max(0.20, Math.min(0.90, reversalProb));
    squeeze.reversalWillHappen = deps.random() < squeeze.finalReversalProb;

    generateSqueezeNews(stock, 'climax');
  }

  function processReversal(stock) {
    const squeeze = stock.shortSqueeze;

    // Reversal phase: Price collapses
    squeeze.volumeMultiple = Math.max(2, squeeze.volumeMultiple * 0.7);
    squeeze.rsiValue = Math.max(20, squeeze.rsiValue - 15 - deps.random() * 10);

    // SI may start rising again (new shorts)
    squeeze.shortInterestCurrent *= (1 + deps.random() * 0.05);

    // Track lowest price
    if (!squeeze.lowestReversalPrice || stock.price < squeeze.lowestReversalPrice) {
      squeeze.lowestReversalPrice = stock.price;
    }

    // Calculate reversal progress
    const reversalPct = squeeze.priceAtClimax ? 
      (squeeze.priceAtClimax - stock.price) / (squeeze.priceAtClimax - squeeze.priceAtStart) : 0;

    generateSqueezeNews(stock, 'reversal', { reversalPct });
  }

  // ========== VETO FACTOR MANAGEMENT ==========
  function addVetoFactor(stock, vetoType) {
    if (!stock.shortSqueeze) return false;
    if (!CONSTANTS.VETO_FACTORS[vetoType]) return false;
    if (!stock.shortSqueeze.vetoFactors.includes(vetoType)) {
      stock.shortSqueeze.vetoFactors.push(vetoType);
    }
    return true;
  }

  function removeVetoFactor(stock, vetoType) {
    if (!stock.shortSqueeze) return false;
    const idx = stock.shortSqueeze.vetoFactors.indexOf(vetoType);
    if (idx > -1) {
      stock.shortSqueeze.vetoFactors.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ========== SIGNAL CALCULATION ==========
  function calculateSignal(stock) {
    if (!stock.shortSqueeze) return { shouldTrade: false };

    const squeeze = stock.shortSqueeze;
    const phase = squeeze.phase;

    let dailyBias = 0;
    let signal = 'HOLD';
    let confidence = 0.5;
    let positionSize = 0.5;

    switch (phase) {
      case 'buildup':
        // Small upward bias during buildup
        dailyBias = CONSTANTS.PRICE_IMPACT.buildup.min + 
          deps.random() * (CONSTANTS.PRICE_IMPACT.buildup.max - CONSTANTS.PRICE_IMPACT.buildup.min);
        signal = 'WATCH';
        confidence = 0.4;
        positionSize = 0.3;
        break;

      case 'squeeze':
        // Large upward bias during squeeze
        dailyBias = CONSTANTS.PRICE_IMPACT.squeeze.min + 
          deps.random() * (CONSTANTS.PRICE_IMPACT.squeeze.max - CONSTANTS.PRICE_IMPACT.squeeze.min);
        signal = 'MOMENTUM_LONG';
        confidence = 0.6;
        positionSize = 0.5;
        break;

      case 'climax':
        // Climax day: big move but uncertain direction
        if (deps.random() < 0.7) {
          dailyBias = CONSTANTS.PRICE_IMPACT.climax.min + 
            deps.random() * (CONSTANTS.PRICE_IMPACT.climax.max - CONSTANTS.PRICE_IMPACT.climax.min);
        } else {
          // Shooting star: gap up then reversal intraday
          dailyBias = deps.random() * 0.10 - 0.05;
        }
        signal = 'PREPARE_SHORT';
        confidence = 0.75;
        positionSize = 0.7;
        break;

      case 'reversal':
        if (squeeze.reversalWillHappen) {
          dailyBias = CONSTANTS.PRICE_IMPACT.reversal.min + 
            deps.random() * (CONSTANTS.PRICE_IMPACT.reversal.max - CONSTANTS.PRICE_IMPACT.reversal.min);
          
          // Gold Standard: stronger reversal
          const gsMet = Object.values(squeeze.goldStandard).filter(Boolean).length;
          if (gsMet === 4) {
            dailyBias *= 1.3;
            confidence = 0.85;
            positionSize = 1.0;
          } else {
            confidence = 0.65;
            positionSize = 0.6;
          }
          signal = 'SHORT';
        } else {
          // Veto active: muted reversal or continued rally
          dailyBias = (deps.random() - 0.4) * 0.08;
          signal = 'AVOID';
          confidence = 0.40;
          positionSize = 0.2;
        }
        break;
    }

    return {
      shouldTrade: phase === 'reversal' && squeeze.reversalWillHappen,
      signal,
      dailyBias,
      confidence,
      positionSize,
      phase,
      goldStandardMet: Object.values(squeeze.goldStandard).filter(Boolean).length,
      reason: getSignalReason(squeeze)
    };
  }

  function getSignalReason(squeeze) {
    const gs = squeeze.goldStandard;
    const gsMet = Object.values(gs).filter(Boolean).length;

    if (squeeze.phase === 'reversal' && gsMet === 4) {
      return 'GOLD STANDARD: All 4 exhaustion filters met. 85% reversal probability.';
    }
    if (squeeze.phase === 'climax') {
      return 'CLIMAX DAY: Volume blow-off top. Prepare to short the first red day.';
    }
    if (squeeze.phase === 'squeeze') {
      return `PARABOLIC PHASE: ${(squeeze.currentGain * 100).toFixed(0)}% gain. Wait for exhaustion signals.`;
    }
    if (squeeze.phase === 'buildup') {
      return `BUILDUP: SI ${(squeeze.shortInterestCurrent * 100).toFixed(0)}%, DTC ${squeeze.metrics.daysToCover}. Monitoring.`;
    }
    return 'Short squeeze in progress.';
  }

  // ========== NEWS GENERATION ==========
  function generateSqueezeNews(stock, phase, extra = {}) {
    const squeeze = stock.shortSqueeze;
    if (!squeeze) return;

    const headlines = {
      buildup: [
        `${stock.symbol} Short Interest Climbs to ${(squeeze.shortInterestCurrent * 100).toFixed(0)}%`,
        `Borrow Fees Spike on ${stock.symbol} as Shorts Pile In`,
        `${stock.symbol} Utilization Hits ${(squeeze.utilizationCurrent * 100).toFixed(0)}% - Squeeze Setup?`
      ],
      squeeze: [
        `🚀 ${stock.symbol} EXPLODES ${(squeeze.currentGain * 100).toFixed(0)}% - Short Squeeze Underway!`,
        `${stock.symbol} Volume ${squeeze.volumeMultiple.toFixed(0)}x Average as Shorts Cover`,
        `BREAKING: ${stock.symbol} Goes Parabolic, SI Plummets`
      ],
      climax: [
        `⚠️ ${stock.symbol} Volume CLIMAX: ${squeeze.volumeMultiple.toFixed(0)}x Normal - Blow-Off Top?`,
        `${stock.symbol} RSI Hits ${squeeze.rsiValue.toFixed(0)} - Extreme Overbought`,
        `Shorts Nearly Fully Covered on ${stock.symbol} - Who's Left to Buy?`
      ],
      reversal: [
        `📉 ${stock.symbol} REVERSAL: First Red Day After ${(squeeze.currentGain * 100).toFixed(0)}% Squeeze`,
        `${stock.symbol} Gives Back Gains - Down ${((squeeze.priceAtClimax - stock.price) / squeeze.priceAtClimax * 100).toFixed(0)}% From Peak`,
        `Profit Taking Accelerates on ${stock.symbol}`
      ],
      complete: [
        `${stock.symbol} Squeeze Complete: ${((stock.price - squeeze.priceAtStart) / squeeze.priceAtStart * 100).toFixed(0)}% Net Change`,
        `${stock.symbol} Returns to Earth After Wild Ride`
      ]
    };

    const descriptions = {
      buildup: `Short interest at ${(squeeze.shortInterestCurrent * 100).toFixed(1)}% with ${squeeze.metrics.daysToCover} days to cover. Cost to borrow: ${(squeeze.ctbCurrent * 100).toFixed(0)}%.`,
      squeeze: `Stock up ${(squeeze.currentGain * 100).toFixed(0)}% as shorts scramble to cover. Volume ${squeeze.volumeMultiple.toFixed(1)}x average.`,
      climax: `Maximum volume exhaustion. RSI at ${squeeze.rsiValue.toFixed(0)}. This is often the peak before reversal.`,
      reversal: squeeze.reversalWillHappen ? 
        `Forced buying exhausted. Professional traders shorting the backside. 50% of gains typically lost in 72 hours.` :
        `Gamma squeeze or catalyst preventing typical reversal pattern.`,
      complete: `Squeeze cycle complete. Final price: $${stock.price.toFixed(2)}.`
    };

    // Calculate signal to get daily bias
    const signal = calculateSignal(stock);
    const dailyBias = signal.dailyBias || 0;

    // DD-002: Log event with price expectation
    const extraInfo = phase === 'climax' ? `RSI=${squeeze.rsiValue.toFixed(0)} vol=${squeeze.volumeMultiple.toFixed(1)}x` :
                      phase === 'reversal' ? `will=${squeeze.reversalWillHappen} prob=${((squeeze.finalReversalProb || 0) * 100).toFixed(0)}%` :
                      phase === 'complete' ? `result=${squeeze.reversalWillHappen ? 'reversed' : 'held'}` :
                      `SI=${(squeeze.shortInterestCurrent * 100).toFixed(0)}% gain=${(squeeze.currentGain * 100).toFixed(0)}%`;
    const event = setPriceEvent(stock, dailyBias, phase.toUpperCase(), squeeze, extraInfo);
    console.log(event.logString);

    // Count gold standard criteria met
    const gsMet = Object.values(squeeze.goldStandard).filter(Boolean).length;

    const news = {
      headline: deps.randomChoice(headlines[phase] || headlines.buildup),
      description: descriptions[phase],
      sentiment: phase === 'reversal' ? 'negative' : (phase === 'climax' ? 'neutral' : 'positive'),
      isShortSqueeze: true,
      shortSqueezePhase: phase,
      relatedStock: stock.symbol,
      stockName: stock.name,
      // Metrics for tutorial
      shortInterest: squeeze.shortInterestCurrent,
      daysToCover: squeeze.metrics.daysToCover,
      volumeMultiple: squeeze.volumeMultiple,
      rsiValue: squeeze.rsiValue,
      currentGain: squeeze.currentGain,
      goldStandard: squeeze.goldStandard,
      goldStandardCount: gsMet,
      goldStandardCriteria: squeeze.goldStandard,
      reversalProb: squeeze.finalReversalProb
    };

    deps.todayNews.push(news);
    return news;
  }

  // ========== TUTORIAL HINTS ==========
  function getTutorialHint(newsItem) {
    if (!newsItem || !newsItem.isShortSqueeze) return null;

    const phase = newsItem.shortSqueezePhase;
    const gs = newsItem.goldStandard || {};
    const gsMet = Object.values(gs).filter(Boolean).length;

    const hints = {
      buildup: {
        type: '📊 Short Squeeze Setup (Buildup Phase)',
        description: `SI at ${(newsItem.shortInterest * 100).toFixed(0)}% (>${(CONSTANTS.SHORT_INTEREST.dangerZone * 100)}% = danger zone). DTC: ${newsItem.daysToCover} days.`,
        implication: 'High short interest + high days to cover = "the door is too small" for all shorts to exit.',
        action: 'WATCH. Do NOT buy yet. Wait for squeeze confirmation.',
        timing: 'Buildup can last 3-7 days before ignition.',
        goldStandard: 'Gold Standard trade is SHORTING the reversal, not buying the squeeze.'
      },
      squeeze: {
        type: '🚀 Short Squeeze Active (Parabolic Phase)',
        description: `Stock up ${(newsItem.currentGain * 100).toFixed(0)}%. Volume ${newsItem.volumeMultiple.toFixed(1)}x average.`,
        implication: 'Shorts are covering (forced buying). This is NOT sustainable.',
        action: 'If long, trail stops tight. If flat, DO NOT CHASE. Prepare for reversal.',
        timing: `Parabolic phase typically lasts 2-5 days.`,
        catalyst: `SI dropping rapidly = shorts capitulating. Watch for volume climax.`,
        goldStandard: gsMet >= 2 ? `⭐ ${gsMet}/4 Gold Standard criteria met. Reversal setup building.` : null
      },
      climax: {
        type: '⚠️ CLIMAX DAY (Blow-Off Top)',
        description: `Volume ${newsItem.volumeMultiple.toFixed(0)}x normal. RSI: ${newsItem.rsiValue.toFixed(0)}. This is often THE TOP.`,
        implication: 'Maximum volume = last short has covered. No more forced buyers.',
        action: 'EXIT LONGS. Prepare to SHORT on first red day (tomorrow).',
        timing: 'The "First Red Day" after climax volume is the professional entry for shorts.',
        catalyst: 'Look for: Shooting Star candle, RSI divergence, CTB dropping.',
        goldStandard: gsMet >= 3 ? `⭐ ${gsMet}/4 Gold Standard criteria met. 85%+ reversal probability.` : 
          `${gsMet}/4 criteria met. Wait for confirmation.`
      },
      reversal: {
        type: '📉 REVERSAL PHASE (The Trade)',
        description: 'Forced buying exhausted. This is where professionals make money.',
        implication: 'Empirical data: stocks lose 50% of squeeze gains within 72 hours of climax.',
        action: newsItem.reversalProb >= 0.75 ? 
          'SHORT with conviction. Gold Standard setup confirmed.' :
          'SHORT with caution. Watch for gamma squeeze veto.',
        timing: `T+${newsItem.dayInPhase || 1} of reversal. Target: 50% retracement of gains.`,
        goldStandard: gsMet === 4 ? 
          '⭐⭐ GOLD STANDARD COMPLETE: 85%+ success rate. This is the trade.' :
          `${gsMet}/4 criteria. Reversal probability: ${(newsItem.reversalProb * 100).toFixed(0)}%`
      },
      complete: {
        type: '✅ Squeeze Cycle Complete',
        description: 'Short squeeze event has concluded.',
        implication: 'Review: Did the reversal follow the Gold Standard pattern?',
        action: 'Document lessons. Wait for next setup.',
        goldStandard: 'The best trades are SHORTING exhaustion, not buying the squeeze.'
      }
    };

    return hints[phase] || hints.buildup;
  }

  // ========== EVENT CHECKING ==========
  function checkShortSqueezeEvents(stock, newsArray) {
    // Check if stock already has an active squeeze
    if (stock.shortSqueeze) {
      processShortSqueeze(stock);
      return true;
    }

    // Check news for squeeze triggers
    if (newsArray && newsArray.length > 0) {
      for (const news of newsArray) {
        if (news.isShortSqueeze && news.symbol === stock.symbol) {
          if (!stock.shortSqueeze) {
            triggerShortSqueeze(stock);
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
    calculateSqueezeRisk,
    triggerShortSqueeze,
    processShortSqueeze,
    checkShortSqueezeEvents,
    generateSqueezeNews,
    
    // Signal calculation
    calculateSignal,
    
    // Veto management
    addVetoFactor,
    removeVetoFactor,
    
    // Tutorial hints
    getTutorialHint,
    
    // Testing
    _test: {
      calculateSqueezeRisk
    },
    
    _reset: function() {
      deps = {
        stocks: [],
        todayNews: [],
        gameState: { day: 0 },
        getMemeMultiplier: () => 1.0,
        randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],
        isEventTypeEnabled: () => true,
        random: Math.random
      };
    }
  };

})();

// Global wrapper for tutorial.js compatibility
function getShortSqueezeTutorialHint(newsItem) {
  return ShortSqueeze.getTutorialHint(newsItem);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortSqueeze;
}
