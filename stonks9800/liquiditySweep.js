/**
 * Liquidity Sweep Module (Wyckoff Spring / Stop-Run Reversal)
 * 
 * Empirical Sources:
 * - Aggarwal & Wu (2006): "Stock Market Manipulations" - SEC enforcement analysis
 * - Comerton-Forde & Putniņš (2014): "Closing Price Manipulation" - Mark the close patterns
 * - Lee, Li, & Wang (2024): "Deep Learning for Spoofing Detection" - Order flow toxicity
 * - Market Microstructure: Stop-loss hunting and liquidity attraction
 * 
 * Gold Standard (85%+): BUY the Failed Breakdown
 * 1. Obvious Liquidity: Clear double bottom or long-term support (weeks)
 * 2. False Breakout: Aggressive break below support, long wick, immediate recovery
 * 3. Absorption Volume: 20-day high volume spike, but price fails to close lower
 * 4. Re-entry: Price moves back above support, buy the retest
 * 
 * The Trade: Stop buying breakouts, start buying "failed breakdowns"
 * When price "crashes" through obvious floor on massive volume but refuses to stay down,
 * institutions are absorbing retail stops to fill large buy orders.
 */

const LiquiditySweep = (function() {
  'use strict';

  // ========== EMPIRICAL CONSTANTS ==========
  const CONSTANTS = {
    // Support Level Detection
    SUPPORT: {
      minTouchCount: 2,           // At least 2 touches to be "obvious"
      lookbackDays: 20,           // Look back 20 days for support
      tolerancePct: 0.02,         // 2% tolerance for "same level"
      strengthMultiplier: 1.5     // Stronger support = higher success
    },

    // False Breakout (Sweep) Detection
    SWEEP: {
      minPenetration: 0.02,       // Must break at least 2% below support
      maxPenetration: 0.10,       // But not more than 10% (that's real breakdown)
      maxDuration: 3,             // Must recover within 3 days (ideally same day)
      wickRatio: 0.7              // Wick should be >70% of candle range
    },

    // Absorption Volume
    VOLUME: {
      spikeThreshold: 2.0,        // 2x average volume minimum
      goldStandardSpike: 3.0,     // 3x for Gold Standard
      absorptionSignal: 1.5       // Volume high but price doesn't stay down
    },

    // Price Impact by Phase
    PRICE_IMPACT: {
      sweep: { min: -0.08, max: -0.02 },      // -2% to -8% during sweep
      recovery: { min: 0.02, max: 0.05 },     // +2-5% immediate recovery
      continuation: { min: 0.01, max: 0.03 }, // +1-3% daily after entry
      target: { min: 0.08, max: 0.15 }        // 8-15% total move expected
    },

    // Timeline (in days)
    TIMELINE: {
      setupDays: { min: 10, max: 30 },        // Support must form over 10-30 days
      sweepDuration: { min: 1, max: 3 },      // Sweep lasts 1-3 days max
      recoveryDays: { min: 1, max: 2 },       // Recovery within 1-2 days
      continuationDays: { min: 5, max: 15 }   // Move continues 5-15 days
    },

    // Gold Standard Filter (85%+ success)
    GOLD_STANDARD: {
      obviousSupport: true,       // Step 1: Clear double bottom / long-term support
      falseBreakout: true,        // Step 2: Aggressive break + immediate recovery
      absorptionVolume: true,     // Step 3: 3x+ volume, price fails to close lower
      reEntry: true,              // Step 4: Price reclaims support
      successRate: 0.85           // 85% reversal success when all 4 met
    },

    // Reversal probability by factors met
    REVERSAL_PROBABILITY: {
      supportOnly: 0.45,          // 45% with just support test
      plusSweep: 0.60,            // 60% with false breakout
      plusVolume: 0.75,           // 75% with absorption volume
      goldStandard: 0.85          // 85%+ with all 4 factors
    },

    // Veto factors that reduce probability
    VETO_FACTORS: {
      bearMarket: -0.20,          // Overall market downtrend
      sectorWeakness: -0.15,      // Sector in decline
      fundamentalIssue: -0.25,    // Real bad news (not just stop hunting)
      multipleFailures: -0.30    // Support failed multiple times before
    }
  };

  // ========== STATE TRACKING ==========
  
  // Track active sweeps per stock
  // Key: stock.symbol, Value: sweep state object
  const activeSweeps = new Map();

  // ========== CORE FUNCTIONS ==========

  /**
   * Check if a stock has an obvious support level
   * Returns support level info or null
   */
  function detectSupportLevel(stock) {
    if (!stock.priceHistory || stock.priceHistory.length < CONSTANTS.SUPPORT.lookbackDays) {
      return null;
    }

    const history = stock.priceHistory.slice(-CONSTANTS.SUPPORT.lookbackDays);
    const currentPrice = stock.price;
    
    // Find local minimums (potential support touches)
    const touches = [];
    for (let i = 2; i < history.length - 2; i++) {
      const prev2 = history[i - 2];
      const prev1 = history[i - 1];
      const curr = history[i];
      const next1 = history[i + 1];
      const next2 = history[i + 2];
      
      // Local minimum: lower than neighbors
      if (curr <= prev1 && curr <= prev2 && curr <= next1 && curr <= next2) {
        touches.push({ day: i, price: curr });
      }
    }

    if (touches.length < CONSTANTS.SUPPORT.minTouchCount) {
      return null;
    }

    // Find clusters of touches at similar levels
    const tolerance = currentPrice * CONSTANTS.SUPPORT.tolerancePct;
    const clusters = [];
    
    touches.forEach(touch => {
      let foundCluster = false;
      for (const cluster of clusters) {
        if (Math.abs(touch.price - cluster.avgPrice) <= tolerance) {
          cluster.touches.push(touch);
          cluster.avgPrice = cluster.touches.reduce((sum, t) => sum + t.price, 0) / cluster.touches.length;
          foundCluster = true;
          break;
        }
      }
      if (!foundCluster) {
        clusters.push({ avgPrice: touch.price, touches: [touch] });
      }
    });

    // Find strongest support (most touches, closest to current price)
    const validClusters = clusters.filter(c => 
      c.touches.length >= CONSTANTS.SUPPORT.minTouchCount &&
      c.avgPrice < currentPrice &&
      c.avgPrice > currentPrice * 0.85 // Support within 15% of current price
    );

    if (validClusters.length === 0) {
      return null;
    }

    // Score clusters by touch count and proximity
    validClusters.forEach(c => {
      const proximity = 1 - (currentPrice - c.avgPrice) / currentPrice;
      c.score = c.touches.length * proximity;
    });

    validClusters.sort((a, b) => b.score - a.score);
    const bestSupport = validClusters[0];

    return {
      level: bestSupport.avgPrice,
      touchCount: bestSupport.touches.length,
      strength: Math.min(bestSupport.touches.length / 2, CONSTANTS.SUPPORT.strengthMultiplier),
      distanceFromCurrent: (currentPrice - bestSupport.avgPrice) / bestSupport.avgPrice,
      isObvious: bestSupport.touches.length >= 3 // "Obvious" = 3+ touches
    };
  }

  /**
   * Check if current price action represents a sweep (false breakout)
   */
  function detectSweep(stock, supportLevel) {
    if (!supportLevel) return null;
    
    const currentPrice = stock.price;
    const support = supportLevel.level;
    
    // Check if price is below support (potential sweep in progress)
    const penetrationPct = (support - currentPrice) / support;
    
    if (penetrationPct < CONSTANTS.SWEEP.minPenetration) {
      return null; // Not deep enough to be a sweep
    }
    
    if (penetrationPct > CONSTANTS.SWEEP.maxPenetration) {
      return null; // Too deep - likely real breakdown
    }

    // Calculate wick ratio if we have intraday-like data
    // For game purposes, we use daily close vs support
    const wickRatio = penetrationPct / CONSTANTS.SWEEP.maxPenetration;

    return {
      inProgress: true,
      penetrationPct: penetrationPct,
      supportLevel: support,
      wickRatio: Math.min(wickRatio, 1.0),
      daysBelowSupport: 1 // Will be tracked in active sweeps
    };
  }

  /**
   * Check for absorption volume (high volume but price doesn't stay down)
   */
  function detectAbsorptionVolume(stock) {
    // Calculate average volume
    const avgVolume = stock.avgVolume || 1000000;
    const currentVolume = stock.volume || avgVolume;
    
    const volumeMultiple = currentVolume / avgVolume;
    
    return {
      volumeMultiple: volumeMultiple,
      isSpike: volumeMultiple >= CONSTANTS.VOLUME.spikeThreshold,
      isGoldStandard: volumeMultiple >= CONSTANTS.VOLUME.goldStandardSpike,
      absorption: volumeMultiple >= CONSTANTS.VOLUME.absorptionSignal
    };
  }

  /**
   * Trigger a liquidity sweep event
   */
  function triggerLiquiditySweep(stock, options = {}) {
    const supportInfo = options.supportInfo || detectSupportLevel(stock);
    
    if (!supportInfo) {
      console.warn(`[LiquiditySweep] No support level found for ${stock.symbol}`);
      return null;
    }

    // Determine magnitude
    const magnitude = options.magnitude || 
      (supportInfo.touchCount >= 4 ? 'strong' : 
       supportInfo.touchCount >= 3 ? 'moderate' : 'weak');

    // Calculate target gain based on magnitude
    const targetGain = magnitude === 'strong' ? 
      CONSTANTS.PRICE_IMPACT.target.max :
      magnitude === 'moderate' ? 
        (CONSTANTS.PRICE_IMPACT.target.min + CONSTANTS.PRICE_IMPACT.target.max) / 2 :
        CONSTANTS.PRICE_IMPACT.target.min;

    // Timeline
    const sweepDays = Math.floor(
      CONSTANTS.TIMELINE.sweepDuration.min + 
      Math.random() * (CONSTANTS.TIMELINE.sweepDuration.max - CONSTANTS.TIMELINE.sweepDuration.min)
    );
    const recoveryDays = Math.floor(
      CONSTANTS.TIMELINE.recoveryDays.min +
      Math.random() * (CONSTANTS.TIMELINE.recoveryDays.max - CONSTANTS.TIMELINE.recoveryDays.min)
    );
    const continuationDays = Math.floor(
      CONSTANTS.TIMELINE.continuationDays.min +
      Math.random() * (CONSTANTS.TIMELINE.continuationDays.max - CONSTANTS.TIMELINE.continuationDays.min)
    );

    const sweep = {
      symbol: stock.symbol,
      phase: 'sweep',
      day: 0,
      magnitude: magnitude,
      
      // Support info
      supportLevel: supportInfo.level,
      supportStrength: supportInfo.strength,
      touchCount: supportInfo.touchCount,
      isObviousSupport: supportInfo.isObvious,
      
      // Price tracking
      priceAtStart: stock.price,
      priceAtSweepLow: null,
      sweepPenetration: 0,
      
      // Volume tracking
      volumeAtSweep: null,
      absorptionDetected: false,
      
      // Gold Standard tracking
      goldStandardCriteria: {
        obviousSupport: supportInfo.isObvious,
        falseBreakout: false,
        absorptionVolume: false,
        reEntry: false
      },
      goldStandardCount: supportInfo.isObvious ? 1 : 0,
      
      // Timeline
      sweepDays: sweepDays,
      recoveryDays: recoveryDays,
      continuationDays: continuationDays,
      totalDays: sweepDays + recoveryDays + continuationDays,
      
      // Target
      targetGain: targetGain,
      
      // Probability
      baseProbability: CONSTANTS.REVERSAL_PROBABILITY.supportOnly,
      currentProbability: supportInfo.isObvious ? 
        CONSTANTS.REVERSAL_PROBABILITY.plusSweep : 
        CONSTANTS.REVERSAL_PROBABILITY.supportOnly,
      
      // Veto factors
      vetoFactors: options.vetoFactors || [],
      
      // Entry tracking
      entrySignaled: false,
      entryPrice: null,
      
      // Outcome
      willSucceed: null // Determined at entry point
    };

    activeSweeps.set(stock.symbol, sweep);
    stock.liquiditySweep = sweep;
    
    return sweep;
  }

  /**
   * Process daily update for a liquidity sweep
   */
  function processLiquiditySweep(stock) {
    if (!stock.liquiditySweep) return null;
    
    const sweep = stock.liquiditySweep;
    sweep.day++;

    const result = {
      symbol: stock.symbol,
      day: sweep.day,
      phase: sweep.phase,
      priceChange: 0,
      news: null,
      goldStandardUpdate: false
    };

    // Phase processing
    switch (sweep.phase) {
      case 'sweep':
        processSweepPhase(stock, sweep, result);
        break;
      case 'recovery':
        processRecoveryPhase(stock, sweep, result);
        break;
      case 'continuation':
        processContinuationPhase(stock, sweep, result);
        break;
      case 'complete':
        // Clean up
        delete stock.liquiditySweep;
        activeSweeps.delete(stock.symbol);
        return result;
    }

    return result;
  }

  /**
   * Process sweep phase - price breaks below support
   */
  function processSweepPhase(stock, sweep, result) {
    const dayInPhase = sweep.day;
    
    if (dayInPhase <= sweep.sweepDays) {
      // Sweep in progress - price drops below support
      const sweepImpact = CONSTANTS.PRICE_IMPACT.sweep;
      const dailyDrop = sweepImpact.min + Math.random() * (sweepImpact.max - sweepImpact.min);
      
      result.priceChange = dailyDrop;
      
      // Track sweep low
      const newPrice = stock.price * (1 + dailyDrop);
      if (!sweep.priceAtSweepLow || newPrice < sweep.priceAtSweepLow) {
        sweep.priceAtSweepLow = newPrice;
        sweep.sweepPenetration = (sweep.supportLevel - newPrice) / sweep.supportLevel;
      }

      // Check for absorption volume on sweep day
      const volumeInfo = detectAbsorptionVolume(stock);
      if (volumeInfo.isGoldStandard && !sweep.goldStandardCriteria.absorptionVolume) {
        sweep.volumeAtSweep = volumeInfo.volumeMultiple;
        sweep.absorptionDetected = true;
        sweep.goldStandardCriteria.absorptionVolume = true;
        sweep.goldStandardCount = Math.min(sweep.goldStandardCount + 1, 4);
        sweep.currentProbability = CONSTANTS.REVERSAL_PROBABILITY.plusVolume;
        result.goldStandardUpdate = true;
      }

      // Generate sweep news
      if (dayInPhase === 1) {
        result.news = {
          type: 'liquidity_sweep',
          phase: 'sweep',
          headline: `${stock.symbol} CRASHES through key support on massive volume`,
          body: `Stock plunges ${Math.abs(dailyDrop * 100).toFixed(1)}% as stop-losses trigger. ` +
                `Key $${sweep.supportLevel.toFixed(2)} support breached on ${volumeInfo.volumeMultiple.toFixed(1)}x normal volume.`,
          sentiment: -0.8,
          telltale: '💥 SWEEP: Stop-loss hunting in progress - watch for reversal'
        };
      }
    }
    
    // Transition to recovery
    if (dayInPhase >= sweep.sweepDays) {
      sweep.phase = 'recovery';
      // Only increment if not already counted
      const wasFalseBreakout = sweep.goldStandardCriteria.falseBreakout;
      sweep.goldStandardCriteria.falseBreakout = sweep.sweepPenetration >= CONSTANTS.SWEEP.minPenetration;
      if (sweep.goldStandardCriteria.falseBreakout && !wasFalseBreakout) {
        sweep.goldStandardCount = Math.min(sweep.goldStandardCount + 1, 4);
        sweep.currentProbability = CONSTANTS.REVERSAL_PROBABILITY.plusSweep;
      }
    }
  }

  /**
   * Process recovery phase - price snaps back above support
   */
  function processRecoveryPhase(stock, sweep, result) {
    const dayInPhase = sweep.day - sweep.sweepDays;
    
    if (dayInPhase <= sweep.recoveryDays) {
      // Recovery - sharp bounce back
      const recoveryImpact = CONSTANTS.PRICE_IMPACT.recovery;
      const dailyGain = recoveryImpact.min + Math.random() * (recoveryImpact.max - recoveryImpact.min);
      
      result.priceChange = dailyGain;
      
      // Check for re-entry signal (price back above support)
      const newPrice = stock.price * (1 + dailyGain);
      if (newPrice >= sweep.supportLevel && !sweep.entrySignaled) {
        sweep.entrySignaled = true;
        sweep.entryPrice = newPrice;
        // Only increment if not already counted
        if (!sweep.goldStandardCriteria.reEntry) {
          sweep.goldStandardCriteria.reEntry = true;
          sweep.goldStandardCount = Math.min(sweep.goldStandardCount + 1, 4);
        }
        
        // Determine outcome based on Gold Standard criteria
        sweep.currentProbability = sweep.goldStandardCount >= 4 ?
          CONSTANTS.GOLD_STANDARD.successRate :
          sweep.currentProbability;
        
        // Apply veto factors
        sweep.vetoFactors.forEach(veto => {
          if (CONSTANTS.VETO_FACTORS[veto]) {
            sweep.currentProbability += CONSTANTS.VETO_FACTORS[veto];
          }
        });
        sweep.currentProbability = Math.max(0.20, Math.min(0.90, sweep.currentProbability));
        
        // Roll for success (only if not already determined, e.g., by test forcing)
        if (sweep.willSucceed === null) {
          sweep.willSucceed = Math.random() < sweep.currentProbability;
        }
        
        result.goldStandardUpdate = true;
        result.news = {
          type: 'liquidity_sweep',
          phase: 'recovery',
          headline: `${stock.symbol} RECLAIMS support - "Failed breakdown" confirmed`,
          body: `Stock surges back above $${sweep.supportLevel.toFixed(2)} support. ` +
                `Classic "Wyckoff Spring" pattern: ${sweep.goldStandardCount}/4 Gold Standard criteria met.`,
          sentiment: 0.7,
          telltale: sweep.goldStandardCount >= 4 ?
            '🏆 GOLD STANDARD: All 4 criteria met - 85% success rate, BUY signal' :
            `📊 ${sweep.goldStandardCount}/4 criteria - ${(sweep.currentProbability * 100).toFixed(0)}% probability`
        };
      }
    }
    
    // Transition to continuation
    if (dayInPhase >= sweep.recoveryDays) {
      sweep.phase = 'continuation';
    }
  }

  /**
   * Process continuation phase - trend continues (or fails)
   */
  function processContinuationPhase(stock, sweep, result) {
    const dayInPhase = sweep.day - sweep.sweepDays - sweep.recoveryDays;
    
    if (dayInPhase <= sweep.continuationDays) {
      if (sweep.willSucceed) {
        // Successful sweep - price continues higher
        const contImpact = CONSTANTS.PRICE_IMPACT.continuation;
        // Gains taper off over time
        const dayFactor = 1 - (dayInPhase / sweep.continuationDays) * 0.5;
        const dailyGain = (contImpact.min + Math.random() * (contImpact.max - contImpact.min)) * dayFactor;
        
        result.priceChange = dailyGain;
        
        // Milestone news
        const totalGain = (stock.price - sweep.priceAtStart) / sweep.priceAtStart;
        if (totalGain >= sweep.targetGain * 0.75 && dayInPhase === Math.floor(sweep.continuationDays / 2)) {
          result.news = {
            type: 'liquidity_sweep',
            phase: 'continuation',
            headline: `${stock.symbol} continues rally after successful sweep reversal`,
            body: `Stock up ${(totalGain * 100).toFixed(1)}% from sweep low. ` +
                  `Institutional accumulation confirmed as "liquidity vacuum" propels price higher.`,
            sentiment: 0.6,
            telltale: '📈 CONTINUATION: "No seller" vacuum in effect'
          };
        }
      } else {
        // Failed sweep - price drifts or falls
        const failImpact = { min: -0.02, max: 0.01 };
        const dailyChange = failImpact.min + Math.random() * (failImpact.max - failImpact.min);
        result.priceChange = dailyChange;
        
        if (dayInPhase === 1) {
          result.news = {
            type: 'liquidity_sweep',
            phase: 'failed',
            headline: `${stock.symbol} sweep reversal FAILS - support becomes resistance`,
            body: `Stock unable to hold above reclaimed support. ` +
                  `Only ${sweep.goldStandardCount}/4 criteria met - probability was ${(sweep.currentProbability * 100).toFixed(0)}%.`,
            sentiment: -0.5,
            telltale: '⚠️ FAILED SWEEP: Not all criteria met, reversal failed'
          };
        }
      }
    }
    
    // Complete
    if (dayInPhase >= sweep.continuationDays) {
      sweep.phase = 'complete';
      
      const finalGain = (stock.price - sweep.priceAtStart) / sweep.priceAtStart;
      result.news = {
        type: 'liquidity_sweep',
        phase: 'complete',
        headline: `${stock.symbol} liquidity sweep event complete`,
        body: sweep.willSucceed ?
          `Successful reversal: +${(finalGain * 100).toFixed(1)}% gain. Gold Standard (${sweep.goldStandardCount}/4) delivered.` :
          `Failed reversal: ${(finalGain * 100).toFixed(1)}% result. Only ${sweep.goldStandardCount}/4 criteria met.`,
        sentiment: sweep.willSucceed ? 0.5 : -0.3,
        telltale: sweep.willSucceed ?
          '✅ COMPLETE: Liquidity sweep played out as expected' :
          '❌ COMPLETE: Sweep setup failed - criteria filter works'
      };
    }
  }

  /**
   * Calculate signal strength for current sweep state
   */
  function calculateSignal(stock) {
    if (!stock.liquiditySweep) return { dailyBias: 0, phase: null };
    
    const sweep = stock.liquiditySweep;
    let dailyBias = 0;

    switch (sweep.phase) {
      case 'sweep':
        const sweepImpact = CONSTANTS.PRICE_IMPACT.sweep;
        dailyBias = sweepImpact.min + Math.random() * (sweepImpact.max - sweepImpact.min);
        break;
        
      case 'recovery':
        const recoveryImpact = CONSTANTS.PRICE_IMPACT.recovery;
        dailyBias = recoveryImpact.min + Math.random() * (recoveryImpact.max - recoveryImpact.min);
        break;
        
      case 'continuation':
        if (sweep.willSucceed) {
          const contImpact = CONSTANTS.PRICE_IMPACT.continuation;
          const dayInPhase = sweep.day - sweep.sweepDays - sweep.recoveryDays;
          const dayFactor = 1 - (dayInPhase / sweep.continuationDays) * 0.5;
          dailyBias = (contImpact.min + Math.random() * (contImpact.max - contImpact.min)) * dayFactor;
        } else {
          dailyBias = -0.01 + Math.random() * 0.02; // Drift
        }
        break;
    }

    return {
      dailyBias: dailyBias,
      phase: sweep.phase,
      goldStandardCount: sweep.goldStandardCount,
      probability: sweep.currentProbability,
      entrySignaled: sweep.entrySignaled
    };
  }

  /**
   * Check for potential liquidity sweep events in the market
   */
  function checkLiquiditySweepEvents(stock, newsArray) {
    // Skip if already in a sweep
    if (stock.liquiditySweep) {
      const result = processLiquiditySweep(stock);
      if (result && result.news) {
        newsArray.push(result.news);
      }
      return;
    }

    // Check for setup conditions
    const supportInfo = detectSupportLevel(stock);
    if (!supportInfo || !supportInfo.isObvious) {
      return; // No obvious support level
    }

    // Check if price is approaching support
    const distanceToSupport = (stock.price - supportInfo.level) / supportInfo.level;
    if (distanceToSupport > 0.05) {
      return; // Too far from support
    }

    // Random trigger with probability based on setup quality
    const triggerProbability = supportInfo.touchCount >= 4 ? 0.15 :
                              supportInfo.touchCount >= 3 ? 0.10 : 0.05;
    
    if (Math.random() < triggerProbability) {
      const sweep = triggerLiquiditySweep(stock, { supportInfo: supportInfo });
      if (sweep) {
        newsArray.push({
          type: 'liquidity_sweep',
          phase: 'setup',
          headline: `${stock.symbol} tests critical support at $${supportInfo.level.toFixed(2)}`,
          body: `Stock approaching ${supportInfo.touchCount}-touch support level. ` +
                `Watch for potential "stop-run" reversal pattern.`,
          sentiment: -0.3,
          telltale: '👀 SETUP: Obvious support level being tested - watch for sweep'
        });
      }
    }
  }

  /**
   * Get current sweep state for a stock
   */
  function getSweepState(stock) {
    return stock.liquiditySweep || null;
  }

  /**
   * Check if stock is in active sweep
   */
  function isInSweep(stock) {
    return !!stock.liquiditySweep;
  }

  // ========== PUBLIC API ==========
  return {
    // Core functions
    triggerLiquiditySweep,
    processLiquiditySweep,
    checkLiquiditySweepEvents,
    
    // Detection functions
    detectSupportLevel,
    detectSweep,
    detectAbsorptionVolume,
    
    // Signal calculation
    calculateSignal,
    
    // State queries
    getSweepState,
    isInSweep,
    
    // Constants (for testing/debugging)
    CONSTANTS,
    
    // For test harness
    _activeSweeps: activeSweeps
  };
})();

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiquiditySweep;
}
