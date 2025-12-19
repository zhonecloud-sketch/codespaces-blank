/**
 * News Shakeout Module (Overreaction Hypothesis / Event-Driven Mean Reversion)
 * 
 * Empirical Sources:
 * - De Bondt & Thaler (1985): "Does the Stock Market Overreact?" - Foundational behavioral finance study
 * - Tetlock (2007): "Giving Content to Investor Sentiment" - Media sentiment → reversal within 5-10 days
 * - Atkins & Dyl (1990): 10%+ drops reverse within 2-5 days if news doesn't impair long-term cash flow
 * - Chan (2003): "Stock Price Reaction to News and No-news" - Sensationalist news reverses swiftly
 * 
 * Gold Standard (85%+): BUY the Overreaction
 * 1. Transient News: News does NOT change 12-month earnings outlook
 * 2. Volume Climax: Highest volume day (5x+ average) = selling exhaustion
 * 3. Three-Day Stabilization: Day 3 close > Day 2, holds above Day 1 low
 * 4. RSI Rubber Band: RSI < 25 (oversold) → target gap fill within 10-14 days
 * 
 * The Trade: Don't panic sell. Wait for stabilization, then buy the V-bottom.
 * "If news doesn't change the 5-year outlook, it's a shakeout, not a breakdown."
 */

const NewsShakeout = (function() {
  'use strict';

  // ========== EMPIRICAL CONSTANTS ==========
  const CONSTANTS = {
    // News Classification
    NEWS: {
      transientTypes: ['litigation_rumor', 'ceo_departure', 'metric_miss', 'macro_scare', 'sector_rotation', 'analyst_downgrade', 'guidance_miss'],
      terminalTypes: ['fraud', 'bankruptcy', 'product_recall', 'major_contract_loss', 'regulatory_ban', 'accounting_restatement'],
      transientProbability: 0.85,   // 85% reversal for transient
      terminalProbability: 0.15    // Only 15% reversal for terminal (value trap)
    },

    // Panic Drop Thresholds
    PANIC: {
      minDrop: 0.08,              // At least 8% drop to qualify
      typicalDrop: { min: 0.10, max: 0.25 },  // 10-25% typical panic drop
      maxRecoverable: 0.35,       // >35% drop often structural
      atrMultiple: 3.0            // ATR should be 3x+ normal
    },

    // Volume Climax (Selling Exhaustion)
    VOLUME: {
      climaxThreshold: 3.0,       // 3x average volume minimum
      goldStandardClimax: 5.0,    // 5x for Gold Standard
      exhaustionSignal: 4.0       // 4x+ = clear exhaustion
    },

    // Three-Day Stabilization
    STABILIZATION: {
      minDays: 2,                 // Wait at least 2 days (48 hours)
      targetDays: 3,              // Ideal entry on Day 3
      maxDays: 5,                 // If no stabilization by Day 5, likely not a shakeout
      holdAboveLow: true          // Price must hold above Day 1 low
    },

    // RSI Rubber Band
    RSI: {
      oversoldThreshold: 30,      // Standard oversold
      extremeOversold: 25,        // Extreme oversold
      goldStandardOversold: 20,   // Gold Standard entry
      recoveryTarget: 50          // Target RSI for exit
    },

    // Price Impact by Phase
    PRICE_IMPACT: {
      panic: { min: -0.15, max: -0.08 },      // -8% to -15% on panic day
      stabilization: { min: -0.03, max: 0.02 }, // Choppy stabilization
      recovery: { min: 0.02, max: 0.05 },     // +2-5% daily during recovery
      gapFill: { min: 0.08, max: 0.20 }       // 8-20% total recovery (gap fill)
    },

    // Timeline (in days)
    TIMELINE: {
      panicDay: 1,                            // Day 1 = the panic
      stabilizationDays: { min: 2, max: 3 },  // Days 2-3 = stabilization
      recoveryDays: { min: 7, max: 14 },      // 7-14 days to gap fill
      maxRecoveryDays: 20                     // Give up after 20 days
    },

    // Gold Standard Filter (85%+ success)
    GOLD_STANDARD: {
      transientNews: true,        // Step 1: News is transient, not terminal
      volumeClimax: true,         // Step 2: Highest volume, 5x+ average
      stabilization: true,        // Step 3: Day 3 close > Day 2, above Day 1 low
      rsiOversold: true,          // Step 4: RSI < 25
      successRate: 0.85           // 85% gap fill when all 4 met
    },

    // Reversal probability by factors met
    REVERSAL_PROBABILITY: {
      transientOnly: 0.50,        // 50% with just transient news
      plusVolume: 0.65,           // 65% with volume climax
      plusStabilization: 0.75,    // 75% with 3-day stabilization
      goldStandard: 0.85          // 85%+ with all 4 factors
    },

    // Veto factors (Value Trap indicators)
    VETO_FACTORS: {
      terminalNews: -0.40,        // Terminal news = likely value trap
      noVolumeClimax: -0.15,      // No exhaustion = more sellers to come
      failedStabilization: -0.20, // Price keeps making new lows
      sectorCollapse: -0.25,      // Whole sector falling (not just this stock)
      priorDowntrend: -0.10       // Already in downtrend before news
    }
  };

  // ========== STATE TRACKING ==========
  
  // Track active shakeouts per stock
  const activeShakeouts = new Map();

  // ========== CORE FUNCTIONS ==========

  /**
   * Classify news as Transient or Terminal
   * Returns classification info
   */
  function classifyNews(newsType, newsContent = '') {
    const isTransient = CONSTANTS.NEWS.transientTypes.includes(newsType) ||
      /rumor|temporary|personal|miss|rotation|downgrade|guidance/i.test(newsContent);
    
    const isTerminal = CONSTANTS.NEWS.terminalTypes.includes(newsType) ||
      /fraud|bankrupt|recall|loss of|regulatory|restatement/i.test(newsContent);

    return {
      type: isTerminal ? 'terminal' : (isTransient ? 'transient' : 'uncertain'),
      isTransient: isTransient && !isTerminal,
      isTerminal: isTerminal,
      reversalProbability: isTerminal ? CONSTANTS.NEWS.terminalProbability : 
                          isTransient ? CONSTANTS.NEWS.transientProbability : 0.40
    };
  }

  /**
   * Check for Volume Climax (selling exhaustion)
   */
  function detectVolumeClimax(stock) {
    const avgVolume = stock.avgVolume || 1000000;
    const currentVolume = stock.volume || avgVolume;
    const volumeMultiple = currentVolume / avgVolume;
    
    // Check if this is highest volume in recent history
    let isHighestVolume = true;
    if (stock.volumeHistory && stock.volumeHistory.length > 0) {
      const maxHistoricalVolume = Math.max(...stock.volumeHistory.slice(-60));
      isHighestVolume = currentVolume >= maxHistoricalVolume * 0.9;
    }

    return {
      volumeMultiple: volumeMultiple,
      isClimax: volumeMultiple >= CONSTANTS.VOLUME.climaxThreshold,
      isGoldStandard: volumeMultiple >= CONSTANTS.VOLUME.goldStandardClimax,
      isExhaustion: volumeMultiple >= CONSTANTS.VOLUME.exhaustionSignal && isHighestVolume,
      isHighestVolume: isHighestVolume
    };
  }

  /**
   * Calculate ATR (Average True Range) spike
   */
  function calculateATRSpike(stock, todayRange) {
    // Simplified ATR calculation
    const avgRange = stock.avgRange || (stock.price * 0.02); // Default 2% daily range
    const atrMultiple = todayRange / avgRange;
    
    return {
      atrMultiple: atrMultiple,
      isSpike: atrMultiple >= CONSTANTS.PANIC.atrMultiple,
      isExtreme: atrMultiple >= CONSTANTS.PANIC.atrMultiple * 1.5
    };
  }

  /**
   * Calculate simplified RSI
   */
  function calculateRSI(priceHistory, period = 14) {
    if (!priceHistory || priceHistory.length < period + 1) {
      return 50; // Default neutral
    }

    let gains = 0;
    let losses = 0;
    const recent = priceHistory.slice(-period - 1);

    for (let i = 1; i < recent.length; i++) {
      const change = recent[i] - recent[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  }

  /**
   * Trigger a news shakeout event
   */
  function triggerNewsShakeout(stock, options = {}) {
    const newsClassification = options.newsClassification || classifyNews(options.newsType || 'macro_scare');
    const volumeInfo = options.volumeInfo || detectVolumeClimax(stock);
    
    // Calculate panic drop
    const panicDrop = options.panicDrop || 
      (CONSTANTS.PRICE_IMPACT.panic.min + Math.random() * (CONSTANTS.PRICE_IMPACT.panic.max - CONSTANTS.PRICE_IMPACT.panic.min));

    // Determine magnitude based on drop size
    const magnitude = Math.abs(panicDrop) >= 0.20 ? 'severe' :
                     Math.abs(panicDrop) >= 0.12 ? 'strong' : 'moderate';

    // Timeline
    const stabilizationDays = Math.floor(
      CONSTANTS.TIMELINE.stabilizationDays.min +
      Math.random() * (CONSTANTS.TIMELINE.stabilizationDays.max - CONSTANTS.TIMELINE.stabilizationDays.min + 1)
    );
    const recoveryDays = Math.floor(
      CONSTANTS.TIMELINE.recoveryDays.min +
      Math.random() * (CONSTANTS.TIMELINE.recoveryDays.max - CONSTANTS.TIMELINE.recoveryDays.min)
    );

    // Calculate gap fill target (price before panic)
    const gapFillTarget = options.prePanicPrice || stock.price / (1 + panicDrop);
    const gapFillGain = (gapFillTarget - stock.price * (1 + panicDrop)) / (stock.price * (1 + panicDrop));

    const shakeout = {
      symbol: stock.symbol,
      phase: 'panic',
      day: 0,
      magnitude: magnitude,
      
      // News classification
      newsType: options.newsType || 'macro_scare',
      newsClassification: newsClassification,
      isTransient: newsClassification.isTransient,
      
      // Price tracking
      prePanicPrice: gapFillTarget,
      panicPrice: null,
      panicDrop: panicDrop,
      day1Low: null,
      day2Close: null,
      day3Close: null,
      
      // Volume tracking
      panicVolume: volumeInfo.volumeMultiple,
      isVolumeClimax: volumeInfo.isClimax,
      
      // RSI tracking
      rsiAtPanic: null,
      currentRSI: null,
      
      // Gold Standard tracking
      goldStandardCriteria: {
        transientNews: newsClassification.isTransient,
        volumeClimax: volumeInfo.isGoldStandard,
        stabilization: false,
        rsiOversold: false
      },
      goldStandardCount: (newsClassification.isTransient ? 1 : 0) + (volumeInfo.isGoldStandard ? 1 : 0),
      
      // Timeline
      stabilizationDays: stabilizationDays,
      recoveryDays: recoveryDays,
      totalDays: 1 + stabilizationDays + recoveryDays,
      
      // Targets
      gapFillTarget: gapFillTarget,
      gapFillGain: gapFillGain,
      
      // Probability
      baseProbability: newsClassification.reversalProbability,
      currentProbability: newsClassification.isTransient ? 
        CONSTANTS.REVERSAL_PROBABILITY.transientOnly :
        CONSTANTS.REVERSAL_PROBABILITY.transientOnly * 0.5,
      
      // Veto factors
      vetoFactors: options.vetoFactors || [],
      
      // Entry tracking
      entrySignaled: false,
      entryPrice: null,
      entryDay: null,
      
      // Outcome
      willSucceed: null // Determined after stabilization
    };

    // Apply veto factors
    shakeout.vetoFactors.forEach(veto => {
      if (CONSTANTS.VETO_FACTORS[veto]) {
        shakeout.currentProbability += CONSTANTS.VETO_FACTORS[veto];
      }
    });
    shakeout.currentProbability = Math.max(0.10, Math.min(0.90, shakeout.currentProbability));

    activeShakeouts.set(stock.symbol, shakeout);
    stock.newsShakeout = shakeout;
    
    return shakeout;
  }

  /**
   * Process daily update for a news shakeout
   */
  function processNewsShakeout(stock) {
    if (!stock.newsShakeout) return null;
    
    const shakeout = stock.newsShakeout;
    shakeout.day++;

    const result = {
      symbol: stock.symbol,
      day: shakeout.day,
      phase: shakeout.phase,
      priceChange: 0,
      news: null,
      goldStandardUpdate: false
    };

    // Phase processing
    switch (shakeout.phase) {
      case 'panic':
        processPanicPhase(stock, shakeout, result);
        break;
      case 'stabilization':
        processStabilizationPhase(stock, shakeout, result);
        break;
      case 'entry':
        processEntryPhase(stock, shakeout, result);
        break;
      case 'recovery':
        processRecoveryPhase(stock, shakeout, result);
        break;
      case 'complete':
        // Clean up and set cooldown
        stock.newsShakeoutCooldown = EVENT_CONFIG.cooldownDays;
        delete stock.newsShakeout;
        activeShakeouts.delete(stock.symbol);
        return result;
    }

    return result;
  }

  /**
   * Process panic phase - Day 1, the news drop
   */
  function processPanicPhase(stock, shakeout, result) {
    // Day 1 - the panic drop
    result.priceChange = shakeout.panicDrop;
    
    // Record panic metrics
    shakeout.panicPrice = stock.price * (1 + shakeout.panicDrop);
    shakeout.day1Low = shakeout.panicPrice;
    
    // Calculate RSI after panic
    const mockPriceHistory = generateMockPriceHistory(stock.price, 20, shakeout.panicDrop);
    shakeout.rsiAtPanic = calculateRSI(mockPriceHistory);
    shakeout.currentRSI = shakeout.rsiAtPanic;
    
    // Check RSI criterion
    if (shakeout.rsiAtPanic <= CONSTANTS.RSI.goldStandardOversold) {
      shakeout.goldStandardCriteria.rsiOversold = true;
      shakeout.goldStandardCount = Math.min(shakeout.goldStandardCount + 1, 4);
      result.goldStandardUpdate = true;
    }

    // Generate panic news
    // Empirical NLP: "Sentiment Ghost" - Fear without new fact (Tetlock 2007)
    // Keywords: "Fears," "Concerns," "Worries," "Uncertainty," "Plunges," "Shadows," "Rumors"
    const softInfoHeadlines = [
      `${stock.symbol} PLUNGES ${Math.abs(shakeout.panicDrop * 100).toFixed(0)}% amid ${formatNewsType(shakeout.newsType)} FEARS`,
      `${stock.symbol} shares tumble as CONCERNS over ${formatNewsType(shakeout.newsType)} mount`,
      `UNCERTAINTY: ${stock.symbol} plunges ${Math.abs(shakeout.panicDrop * 100).toFixed(0)}% on ${formatNewsType(shakeout.newsType)} WORRIES`
    ];
    const panicHeadline = softInfoHeadlines[Math.floor(Math.random() * softInfoHeadlines.length)];
    
    result.news = {
      type: 'news_shakeout',
      phase: 'panic',
      headline: panicHeadline,
      body: `Stock crashes on ${shakeout.panicVolume.toFixed(1)}x normal volume. ` +
            `RSI drops to ${shakeout.rsiAtPanic.toFixed(0)}. Is this a shakeout or the start of something worse?`,
      sentiment: -0.9,
      telltale: shakeout.isTransient ? 
        '🔍 NEWS CHECK: Transient news - monitor for stabilization' :
        '⚠️ WARNING: News may be terminal - wait for confirmation',
      nlpHint: '📰 LINGUISTIC FILTER (Tetlock 2007): ' +
        'SOFT INFO = Reverses: "Fears," "Concerns," "Worries," "Uncertainty," "Rumors" (Subjective verbs). ' +
        'HARD INFO = Permanent: "Files," "Reports," "Sues," "SEC Investigation," "Fraud" (Objective facts). ' +
        'This headline uses: ' + (shakeout.isTransient ? 'SOFT INFO → 85% reversal in 5-10 days!' : 'Potential HARD INFO → Wait for confirmation!')
    };

    // Transition to stabilization
    shakeout.phase = 'stabilization';
  }

  /**
   * Process stabilization phase - Days 2-3, waiting for forced selling to clear
   */
  function processStabilizationPhase(stock, shakeout, result) {
    const dayInPhase = shakeout.day - 1; // Day 2 = dayInPhase 1
    
    // Choppy price action during stabilization
    const stabImpact = CONSTANTS.PRICE_IMPACT.stabilization;
    const dailyChange = stabImpact.min + Math.random() * (stabImpact.max - stabImpact.min);
    result.priceChange = dailyChange;
    
    // Track closes
    if (dayInPhase === 1) {
      shakeout.day2Close = stock.price * (1 + dailyChange);
    } else if (dayInPhase === 2) {
      shakeout.day3Close = stock.price * (1 + dailyChange);
    }
    
    // Update RSI
    shakeout.currentRSI = Math.min(50, shakeout.rsiAtPanic + dayInPhase * 5 + Math.random() * 5);
    
    // Check for new low (failed stabilization)
    const newPrice = stock.price * (1 + dailyChange);
    if (newPrice < shakeout.day1Low) {
      shakeout.day1Low = newPrice; // New low - bad sign
    }

    // Day 2 news
    if (dayInPhase === 1) {
      result.news = {
        type: 'news_shakeout',
        phase: 'stabilization',
        headline: `${stock.symbol} volatile as traders assess damage`,
        body: `Day 2: Stock stabilizing after yesterday's panic. Watching for continuation or reversal.`,
        sentiment: -0.3,
        telltale: '⏳ WAIT: Three-Day Rule - forced selling takes 48-72 hours to clear',
        nlpHint: '📰 INSTITUTIONAL TRAP WATCH: If an analyst DOWNGRADE appears NOW (after stock already dropped 20%+), ' +
          'this is the "Liquidity Hunt" pattern. Late downgrades = institutions buying shares retail dumps. ' +
          'If stock RISES on a Sell rating = 85% reversal CONFIRMED!'
      };
    }

    // Check stabilization criteria on Day 3
    if (dayInPhase >= 2 && shakeout.day2Close && shakeout.day3Close) {
      const stabilized = shakeout.day3Close > shakeout.day2Close && 
                        shakeout.day3Close > shakeout.day1Low;
      
      if (stabilized && !shakeout.goldStandardCriteria.stabilization) {
        shakeout.goldStandardCriteria.stabilization = true;
        shakeout.goldStandardCount = Math.min(shakeout.goldStandardCount + 1, 4);
        result.goldStandardUpdate = true;
        
        // Determine success based on gold standard
        shakeout.currentProbability = shakeout.goldStandardCount >= 4 ?
          CONSTANTS.GOLD_STANDARD.successRate :
          shakeout.goldStandardCount >= 3 ?
            CONSTANTS.REVERSAL_PROBABILITY.plusStabilization :
            shakeout.goldStandardCount >= 2 ?
              CONSTANTS.REVERSAL_PROBABILITY.plusVolume :
              CONSTANTS.REVERSAL_PROBABILITY.transientOnly;
        
        // Apply veto factors
        shakeout.vetoFactors.forEach(veto => {
          if (CONSTANTS.VETO_FACTORS[veto]) {
            shakeout.currentProbability += CONSTANTS.VETO_FACTORS[veto];
          }
        });
        shakeout.currentProbability = Math.max(0.10, Math.min(0.90, shakeout.currentProbability));
        
        // Roll for success (only if not already determined)
        if (shakeout.willSucceed === null) {
          shakeout.willSucceed = Math.random() < shakeout.currentProbability;
        }
        
        result.news = {
          type: 'news_shakeout',
          phase: 'stabilization',
          headline: `${stock.symbol} shows signs of stabilization`,
          body: `Day 3: Stock closes higher than Day 2 and holds above panic low. ` +
                `${shakeout.goldStandardCount}/4 Gold Standard criteria met. ` +
                `RSI at ${shakeout.currentRSI.toFixed(0)}.`,
          sentiment: 0.3,
          telltale: shakeout.goldStandardCount >= 4 ?
            '🏆 GOLD STANDARD: All 4 criteria met - 85% gap fill probability, BUY signal' :
            `📊 ${shakeout.goldStandardCount}/4 criteria - ${(shakeout.currentProbability * 100).toFixed(0)}% probability`
        };
        
        // INSTITUTIONAL MANIPULATION TRAP DETECTION (Analyst Herd Behavior)
        // Empirical: Late downgrades AFTER 20%+ drop = liquidity hunt, NOT bearish signal
        if (shakeout.newsType === 'analyst_downgrade' && Math.abs(shakeout.panicDrop) >= 0.20) {
          result.news.institutionalTrap = {
            detected: true,
            headline: `📉 LATE DOWNGRADE TRAP: Analyst cuts ${stock.symbol} AFTER ${Math.abs(shakeout.panicDrop * 100).toFixed(0)}% drop`,
            lesson: 'Empirical: Late downgrades flush final retail sellers. If stock RISES on Sell rating = 85% reversal confirmed.'
          };
        }
      }
      
      // Transition to entry phase
      shakeout.phase = 'entry';
      shakeout.entrySignaled = true;
      shakeout.entryPrice = newPrice;
      shakeout.entryDay = shakeout.day;
    }
    
    // Failed stabilization - transition anyway but mark as failed
    if (dayInPhase >= shakeout.stabilizationDays + 2 && !shakeout.goldStandardCriteria.stabilization) {
      shakeout.phase = 'entry';
      result.news = {
        type: 'news_shakeout',
        phase: 'stabilization',
        headline: `${stock.symbol} fails to stabilize - caution warranted`,
        body: `Stock making new lows, stabilization pattern NOT confirmed. High risk of value trap.`,
        sentiment: -0.5,
        telltale: '⚠️ FAILED STABILIZATION: Price keeps falling - this may be terminal'
      };
    }
  }

  /**
   * Process entry phase - Entry signal given
   */
  function processEntryPhase(stock, shakeout, result) {
    // Transition immediately to recovery
    shakeout.phase = 'recovery';
    
    // Small bounce on entry confirmation
    const entryBounce = 0.01 + Math.random() * 0.02;
    result.priceChange = entryBounce;
    
    result.news = {
      type: 'news_shakeout',
      phase: 'entry',
      headline: `${stock.symbol} confirms reversal pattern`,
      body: `Entry signal triggered. Target: Gap fill to $${shakeout.gapFillTarget.toFixed(2)} (+${(shakeout.gapFillGain * 100).toFixed(0)}%)`,
      sentiment: 0.5,
      telltale: shakeout.willSucceed ?
        '✅ ENTRY: V-bottom forming - gap fill in progress' :
        '⚠️ ENTRY: Pattern triggered but may fail - use stops'
    };
  }

  /**
   * Process recovery phase - Gap fill in progress
   */
  function processRecoveryPhase(stock, shakeout, result) {
    const dayInPhase = shakeout.day - 1 - shakeout.stabilizationDays - 1;
    
    if (dayInPhase <= shakeout.recoveryDays) {
      if (shakeout.willSucceed) {
        // Successful recovery - V-bottom forming
        const recoveryImpact = CONSTANTS.PRICE_IMPACT.recovery;
        // Gains strongest early, taper off
        const dayFactor = 1 - (dayInPhase / shakeout.recoveryDays) * 0.6;
        const dailyGain = (recoveryImpact.min + Math.random() * (recoveryImpact.max - recoveryImpact.min)) * dayFactor;
        
        result.priceChange = dailyGain;
        
        // Update RSI
        shakeout.currentRSI = Math.min(70, shakeout.currentRSI + 3 + Math.random() * 5);
        
        // Check for gap fill
        const projectedPrice = stock.price * (1 + dailyGain);
        const gapFillProgress = (projectedPrice - shakeout.panicPrice) / (shakeout.gapFillTarget - shakeout.panicPrice);
        
        // Milestone news
        if (gapFillProgress >= 0.5 && dayInPhase === Math.floor(shakeout.recoveryDays / 2)) {
          result.news = {
            type: 'news_shakeout',
            phase: 'recovery',
            headline: `${stock.symbol} recovery gaining momentum - 50% gap fill`,
            body: `V-bottom playing out. Stock has recovered half the panic drop. RSI now ${shakeout.currentRSI.toFixed(0)}.`,
            sentiment: 0.6,
            telltale: '📈 HOLD: Gap fill on track - De Bondt & Thaler overreaction reversal confirmed'
          };
        }
        
        // Gap fill complete
        if (projectedPrice >= shakeout.gapFillTarget * 0.98) {
          result.news = {
            type: 'news_shakeout',
            phase: 'recovery',
            headline: `${stock.symbol} completes GAP FILL - overreaction fully reversed`,
            body: `Stock returns to pre-panic level. Classic News Shakeout pattern complete. Tetlock (2007): Reversal within ${shakeout.day} days.`,
            sentiment: 0.8,
            telltale: '🎯 TARGET HIT: Gap filled - take profits or trail stop'
          };
          shakeout.phase = 'complete';
        }
      } else {
        // Failed recovery - dead cat bounce / value trap
        const failedChange = -0.02 + Math.random() * 0.03; // Mostly down, some chop
        result.priceChange = failedChange;
        
        // First day of failed recovery
        if (dayInPhase === 1) {
          result.news = {
            type: 'news_shakeout',
            phase: 'recovery',
            headline: `${stock.symbol} recovery stalls - value trap risk`,
            body: `Bounce failing to gain traction. News may be more terminal than initially thought.`,
            sentiment: -0.4,
            telltale: '⚠️ VALUE TRAP: Recovery failing - not a true shakeout'
          };
        }
      }
    }
    
    // Time limit reached
    if (dayInPhase >= shakeout.recoveryDays) {
      shakeout.phase = 'complete';
      
      const totalGain = (stock.price - shakeout.panicPrice) / shakeout.panicPrice;
      const gapFillPercent = (stock.price - shakeout.panicPrice) / (shakeout.gapFillTarget - shakeout.panicPrice);
      
      result.news = {
        type: 'news_shakeout',
        phase: 'complete',
        headline: `${stock.symbol} news shakeout event complete`,
        body: shakeout.willSucceed ?
          `Successful reversal: +${(totalGain * 100).toFixed(1)}% from panic low. ${(gapFillPercent * 100).toFixed(0)}% gap fill achieved.` :
          `Failed reversal: Only ${(gapFillPercent * 100).toFixed(0)}% gap fill. News was more impactful than expected.`,
        sentiment: shakeout.willSucceed ? 0.7 : -0.3,
        telltale: shakeout.willSucceed ?
          '✅ COMPLETE: Overreaction hypothesis confirmed - De Bondt & Thaler' :
          '❌ COMPLETE: Value trap - news was terminal, not transient'
      };
    }
  }

  /**
   * Helper: Format news type for display
   * Empirical NLP: Distinguishes "Soft Information" (REVERSES) from "Hard Information" (CONTINUES)
   * - Loughran & McDonald (2011): Soft words = temporary, Hard words = permanent
   */
  function formatNewsType(newsType) {
    const formats = {
      // SOFT INFORMATION - Subjective, reverses (Tetlock 2007: "Sentiment Ghost")
      'litigation_rumor': 'litigation RUMORS',        // Soft: "Rumors" = no new fact
      'ceo_departure': 'CEO departure CONCERNS',      // Soft: "Concerns" = fear
      'metric_miss': 'metric MISS',                   // Soft: Miss is relative
      'macro_scare': 'macro FEARS',                   // Soft: "Fears" = emotion
      'sector_rotation': 'sector rotation WORRIES',   // Soft: "Worries" = uncertainty
      'analyst_downgrade': 'analyst DOWNGRADE',       // Soft: Opinion, not fact
      'guidance_miss': 'guidance UNCERTAINTY',        // Soft: "Uncertainty" = speculation
      
      // HARD INFORMATION - Objective, continues (Loughran & McDonald 2011)
      'fraud': 'FRAUD ALLEGATIONS - SEC Investigation',      // Hard: Legal action
      'bankruptcy': 'BANKRUPTCY FILING',                      // Hard: Court filing
      'product_recall': 'PRODUCT RECALL - FDA Action',       // Hard: Regulatory
      'major_contract_loss': 'MAJOR CONTRACT CANCELLED'      // Hard: Revenue loss
    };
    return formats[newsType] || newsType;
  }

  /**
   * Helper: Generate mock price history for RSI calculation
   */
  function generateMockPriceHistory(currentPrice, length, recentDrop) {
    const history = [];
    let price = currentPrice / (1 + recentDrop); // Pre-drop price
    
    for (let i = 0; i < length - 1; i++) {
      history.push(price);
      price *= (1 + (Math.random() * 0.02 - 0.01)); // Small random changes
    }
    
    // Add the panic drop
    history.push(currentPrice);
    
    return history;
  }

  /**
   * Get price signal for stock
   */
  function getSignal(stock) {
    if (!stock.newsShakeout) return { dailyBias: 0, phase: null };

    const shakeout = stock.newsShakeout;
    
    let dailyBias = 0;
    
    switch (shakeout.phase) {
      case 'panic':
        dailyBias = shakeout.panicDrop;
        break;
      case 'stabilization':
        dailyBias = -0.005 + Math.random() * 0.01;
        break;
      case 'entry':
        dailyBias = 0.01;
        break;
      case 'recovery':
        dailyBias = shakeout.willSucceed ? 0.02 : -0.01;
        break;
    }

    return {
      dailyBias: dailyBias,
      phase: shakeout.phase,
      probability: shakeout.currentProbability,
      goldStandardCount: shakeout.goldStandardCount
    };
  }

  // ========== EVENT GENERATION CONSTANTS ==========
  const EVENT_CONFIG = {
    // Daily probability of a news shakeout event occurring per stock
    // Set to achieve ~1-2 events per month across 10 stocks
    dailyProbability: 0.008,  // ~0.8% per stock per day = ~2.4 events/month across 10 stocks
    
    // Maximum concurrent shakeouts
    maxConcurrent: 2,
    
    // Cooldown after a shakeout completes (days)
    cooldownDays: 10,
    
    // Transient news types for random selection
    newsTypes: ['litigation_rumor', 'macro_scare', 'sector_rotation', 'analyst_downgrade', 'guidance_miss', 'metric_miss']
  };

  /**
   * Check for news shakeout events
   * Can trigger proactively (based on probability) or reactively (based on price drop)
   */
  function checkNewsShakeoutEvents(stock, newsArray) {
    // Process existing shakeout
    if (stock.newsShakeout) {
      const result = processNewsShakeout(stock);
      if (result && result.news) {
        newsArray.push(result.news);
      }
      return result;
    }

    // Skip if on cooldown
    if (stock.newsShakeoutCooldown && stock.newsShakeoutCooldown > 0) {
      stock.newsShakeoutCooldown--;
      return null;
    }

    // Count active shakeouts globally
    let activeCount = 0;
    if (typeof activeShakeouts !== 'undefined') {
      activeCount = activeShakeouts.size;
    }
    if (activeCount >= EVENT_CONFIG.maxConcurrent) {
      return null;
    }

    // REACTIVE TRIGGER: Check for existing significant price drop
    if (stock.dailyChange && stock.dailyChange <= -0.08) {
      // Check for volume spike
      const volumeInfo = detectVolumeClimax(stock);
      if (volumeInfo.isClimax) {
        // Trigger shakeout from existing conditions
        const shakeout = triggerNewsShakeout(stock, {
          panicDrop: stock.dailyChange,
          volumeInfo: volumeInfo,
          newsType: EVENT_CONFIG.newsTypes[Math.floor(Math.random() * EVENT_CONFIG.newsTypes.length)]
        });
        
        if (shakeout) {
          const result = processNewsShakeout(stock);
          if (result && result.news) {
            newsArray.push(result.news);
          }
          return result;
        }
      }
    }

    // PROACTIVE TRIGGER: Random event generation (based on probability)
    // This allows news_shakeout to work independently when enabled alone
    if (Math.random() < EVENT_CONFIG.dailyProbability) {
      // Generate a news shakeout event proactively
      const newsType = EVENT_CONFIG.newsTypes[Math.floor(Math.random() * EVENT_CONFIG.newsTypes.length)];
      const newsClassification = classifyNews(newsType);
      
      // Generate panic drop (8-20%)
      const panicDrop = -(0.08 + Math.random() * 0.12);
      
      // Generate volume spike (3x-6x)
      const volumeMultiple = 3 + Math.random() * 3;
      const volumeInfo = {
        volumeMultiple: volumeMultiple,
        isClimax: true,
        isGoldStandard: volumeMultiple >= 5.0,
        isExhaustion: volumeMultiple >= 4.0,
        isHighestVolume: true
      };
      
      console.log(`[NEWS SHAKEOUT] Proactive trigger for ${stock.symbol || stock.symbol}: ${newsType}, drop ${(panicDrop * 100).toFixed(1)}%, volume ${volumeMultiple.toFixed(1)}x`);
      
      // Trigger the shakeout
      const shakeout = triggerNewsShakeout(stock, {
        panicDrop: panicDrop,
        volumeInfo: volumeInfo,
        newsType: newsType,
        newsClassification: newsClassification,
        prePanicPrice: stock.price
      });
      
      if (shakeout) {
        // Apply the panic drop to the stock price
        stock.previousPrice = stock.price;
        stock.price = stock.price * (1 + panicDrop);
        stock.dailyChange = panicDrop;
        
        // Set cooldown after event completes
        stock.newsShakeoutCooldown = 0; // Will be set when event completes
        
        const result = processNewsShakeout(stock);
        if (result && result.news) {
          newsArray.push(result.news);
        }
        return result;
      }
    }

    return null;
  }

  /**
   * Check if stock has active shakeout
   */
  function hasActiveShakeout(stock) {
    return !!stock.newsShakeout;
  }

  /**
   * Get shakeout state for stock
   */
  function getShakeoutState(stock) {
    return stock.newsShakeout || null;
  }

  // ========== PUBLIC API ==========
  return {
    CONSTANTS,
    triggerNewsShakeout,
    processNewsShakeout,
    checkNewsShakeoutEvents,
    classifyNews,
    detectVolumeClimax,
    calculateRSI,
    calculateATRSpike,
    getSignal,
    hasActiveShakeout,
    getShakeoutState
  };

})();

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsShakeout;
}
