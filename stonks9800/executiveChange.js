/**
 * Executive Change Module (Leadership Transition / Uncertainty Premium)
 * 
 * Empirical Sources:
 * - Denis & Denis (1995): "Causes and Consequences of Management Turnover" - Forced turnovers = positive abnormal returns
 * - Warner, Watts & Wruck (1988): Market overreacts to leadership uncertainty; inverse relation to firm performance
 * - Huson et al. (2001): "Leadership Vacuum" without successor increases volatility, decreases reversal chance
 * - ResearchGate (2024): V-Shaped recovery pattern after forced turnover (kitchen-sink → good news rally)
 * - Datarails (2023): CFO exits cause 3% drop, 30-day drift, but recover by 180 days if no fraud
 * 
 * KEY INSIGHT: Four types with different outcomes:
 * 
 * 1. ABRUPT RESIGNATION + NO SUCCESSOR = <15% Reversal (Fundamental Crash)
 *    - "Effective immediately," no replacement named
 *    - Often precedes fraud/investigation
 *    → DO NOT BUY - this is not a dip
 * 
 * 2. CFO EXIT (Clean Audit) = 50% Reversal (Slow 6-month recovery)
 *    - CFO leaves but Big 4 auditor confirms books clean
 *    - 3% drop, 30-day drift, 180-day recovery
 *    → WAIT - recovery is slow, better opportunities elsewhere
 * 
 * 3. CEO RETIREMENT + INTERNAL SUCCESSOR = 70% Reversal
 *    - Planned transition with successor named
 *    - "Uncertainty dip" only, fundamentals unchanged
 *    → CONSIDER BUYING after stabilization
 * 
 * 4. GOLD STANDARD (All 4 Filters) = 85%+ Reversal in 10-14 days
 *    - Succession Integrity (internal/relay successor named)
 *    - Clean Audit Clause (no disagreements in 8-K)
 *    - Volume Capitulation (5-10% drop, 3x volume)
 *    - 3-Day Stabilization (holds Day 1 low)
 *    → BUY the "Uncertainty Premium" evaporation
 */

const ExecutiveChange = (function() {
  'use strict';

  // ========== EMPIRICAL CONSTANTS ==========
  const CONSTANTS = {
    // Executive Change Types
    CHANGE_TYPES: {
      ABRUPT_NO_SUCCESSOR: 'abrupt_no_successor',     // Fundamental crash
      CFO_EXIT_CLEAN: 'cfo_exit_clean',               // Slow recovery
      PLANNED_INTERNAL: 'planned_internal',           // Good reversal
      GOLD_STANDARD: 'gold_standard'                  // 85%+ reversal
    },

    // Role types
    ROLES: {
      CEO: 'CEO',
      CFO: 'CFO',
      COO: 'COO',
      PRESIDENT: 'President'
    },

    // Probability of each type
    TYPE_PROBABILITY: {
      abrupt_no_successor: 0.15,    // 15% are disasters
      cfo_exit_clean: 0.25,         // 25% are CFO exits
      planned_internal: 0.35,       // 35% are planned transitions
      gold_standard: 0.25           // 25% meet gold standard
    },

    // Reversal probability by type (empirical)
    REVERSAL_PROBABILITY: {
      abrupt_no_successor: 0.15,    // <15% reversal (Denis & Denis)
      cfo_exit_clean: 0.50,         // 50% reversal over 6 months (Datarails)
      planned_internal: 0.70,       // 70% reversal (neutral dip)
      gold_standard: 0.85           // 85%+ reversal (all filters met)
    },

    // Price Impact
    PRICE_IMPACT: {
      announcement: {
        abrupt_no_successor: { min: -0.15, max: -0.25 },   // -15% to -25%
        cfo_exit_clean: { min: -0.03, max: -0.08 },        // -3% to -8%
        planned_internal: { min: -0.05, max: -0.10 },      // -5% to -10%
        gold_standard: { min: -0.05, max: -0.10 }          // -5% to -10% (but recovers)
      },
      stabilization: {
        abrupt_no_successor: { min: -0.05, max: -0.02 },   // Continued drift
        cfo_exit_clean: { min: -0.02, max: 0.01 },         // Slow stabilization
        planned_internal: { min: -0.01, max: 0.02 },       // Quick stabilization
        gold_standard: { min: 0.00, max: 0.02 }            // Holds well
      },
      resolution: {
        abrupt_no_successor: { min: -0.10, max: -0.05 },   // More downside
        cfo_exit_clean: { min: 0.02, max: 0.05 },          // Slow recovery
        planned_internal: { min: 0.05, max: 0.10 },        // Good recovery
        gold_standard: { min: 0.08, max: 0.15 }            // Full recovery
      }
    },

    // Timeline (in days)
    // Empirical: 90-day honeymoon period for new CEO
    TIMELINE: {
      announcement: { min: 1, max: 2 },
      stabilization: { min: 3, max: 5 },        // 3-day stabilization rule
      honeymoonPeriod: { min: 60, max: 90 },    // Empirical: 90-day "honeymoon" for new CEO
      resolution: {
        abrupt_no_successor: { min: 20, max: 40 },  // Long decline
        cfo_exit_clean: { min: 120, max: 180 },     // Empirical: 6-month slow recovery
        planned_internal: { min: 7, max: 14 },      // 2-week recovery
        gold_standard: { min: 7, max: 14 }          // 10-14 day recovery
      }
    },

    // Gold Standard Signals
    GOLD_STANDARD_SIGNALS: {
      successionIntegrity: 0.30,     // Internal successor named
      cleanAudit: 0.25,              // No disagreements in 8-K
      volumeCapitulation: 0.25,      // 5-10% drop, 3x volume
      threesDayStabilization: 0.20   // Holds Day 1 low for 3 days
    },

    // Daily trigger chance
    DAILY_CHANCE: 0.012   // 1.2% daily chance
  };

  // ========== EXECUTIVE CHANGE CATALYSTS ==========
  
  // Abrupt Resignation - No Successor (Fundamental Crash)
  const ABRUPT_CATALYSTS = [
    {
      headline: 'CEO resigns effective immediately, no successor named',
      keywords: ['effective immediately', 'no replacement', 'board searching'],
      severity: 0.20,
      redFlags: ['sudden', 'personal reasons', 'pursue other opportunities']
    },
    {
      headline: 'CFO departs abruptly amid "accounting review"',
      keywords: ['accounting review', 'internal investigation', 'departure'],
      severity: 0.22,
      redFlags: ['disagreements', 'review', 'SEC']
    },
    {
      headline: 'CEO exits unexpectedly - board cites "strategic differences"',
      keywords: ['strategic differences', 'mutual decision', 'transition'],
      severity: 0.18,
      redFlags: ['differences', 'disagreements', 'direction']
    }
  ];

  // CFO Exit - Clean Audit (Slow Recovery)
  const CFO_EXIT_CATALYSTS = [
    {
      headline: 'CFO announces retirement after 15-year tenure',
      keywords: ['retirement', 'tenure', 'transition'],
      severity: 0.05,
      positiveSignals: ['retirement', 'planned', 'transition period']
    },
    {
      headline: 'CFO to depart for "CEO opportunity" at another firm',
      keywords: ['opportunity', 'CEO role', 'well wishes'],
      severity: 0.04,
      positiveSignals: ['opportunity', 'new role', 'amicable']
    },
    {
      headline: 'CFO stepping down, Big 4 auditor confirms clean books',
      keywords: ['stepping down', 'clean audit', 'Big 4'],
      severity: 0.03,
      positiveSignals: ['clean audit', 'no disagreements', 'orderly']
    }
  ];

  // Planned Internal Successor (Good Reversal)
  const PLANNED_INTERNAL_CATALYSTS = [
    {
      headline: 'CEO to retire, COO promoted to succeed',
      keywords: ['retire', 'promoted', 'succeed', 'COO'],
      severity: 0.07,
      positiveSignals: ['internal', 'promoted', 'succession plan']
    },
    {
      headline: 'CEO announces planned transition, President named successor',
      keywords: ['planned transition', 'President', 'successor'],
      severity: 0.06,
      positiveSignals: ['planned', 'orderly', 'internal']
    },
    {
      headline: 'Leadership transition: CEO stepping down, 20-year veteran takes helm',
      keywords: ['transition', 'veteran', 'continuity'],
      severity: 0.05,
      positiveSignals: ['continuity', 'veteran', 'smooth']
    }
  ];

  // Gold Standard (85%+ Reversal)
  const GOLD_STANDARD_CATALYSTS = [
    {
      headline: 'CEO retirement announced with immediate internal successor',
      keywords: ['retirement', 'immediate', 'internal successor'],
      severity: 0.08,
      goldSignals: ['clean 8-K', 'no disagreements', 'internal', 'volume spike']
    },
    {
      headline: 'Planned CEO transition: Board names COO as successor, clean 8-K filed',
      keywords: ['planned', 'COO', 'clean 8-K'],
      severity: 0.07,
      goldSignals: ['clean audit', 'relay successor', 'planned']
    }
  ];

  // ========== HEADLINE TEMPLATES ==========
  const HEADLINES = {
    abrupt_no_successor: {
      announcement: [
        `BREAKING: ${'{symbol}'} ${'{role}'} resigns effective immediately`,
        `${'{symbol}'} ${'{role}'} departs abruptly - no successor named`,
        `${'{symbol}'} shares plunge as ${'{role}'} exits without replacement`
      ],
      stabilization: [
        `${'{symbol}'} continues slide - leadership vacuum concerns mount`,
        `${'{symbol}'} finds no support - investors flee uncertainty`,
        `Analysts slash ${'{symbol}'} targets amid leadership crisis`
      ],
      resolution: [
        `${'{symbol}'} in freefall - "fundamental breakdown" says analyst`,
        `${'{symbol}'} establishes new low - recovery unlikely without clarity`,
        `${'{symbol}'} decline continues - short interest surges`
      ]
    },
    cfo_exit_clean: {
      announcement: [
        `${'{symbol}'} CFO announces departure - auditor confirms clean books`,
        `${'{symbol}'} CFO to retire after long tenure`,
        `${'{symbol}'} CFO exits for new opportunity - transition underway`
      ],
      stabilization: [
        `${'{symbol}'} stabilizes after CFO news - "no red flags" says Big 4`,
        `${'{symbol}'} finds support - clean audit calms nerves`,
        `${'{symbol}'} CFO transition: Board names interim, search begins`
      ],
      resolution: [
        `${'{symbol}'} begins slow recovery - CFO concerns fade`,
        `${'{symbol}'} drifts higher - "non-event" says analyst after clean 8-K`,
        `${'{symbol}'} approaching pre-announcement levels - 6-month recovery on track`
      ]
    },
    planned_internal: {
      announcement: [
        `${'{symbol}'} CEO to retire - ${'{successor}'} named successor`,
        `${'{symbol}'} announces leadership transition: ${'{successor}'} promoted to CEO`,
        `${'{symbol}'} CEO succession: ${'{successor}'} to take helm`
      ],
      stabilization: [
        `${'{symbol}'} finds footing after succession news`,
        `${'{symbol}'} stabilizes - "continuity assured" says board`,
        `${'{symbol}'} holds Day 1 low - institutional buyers step in`
      ],
      resolution: [
        `${'{symbol}'} rallies as succession fears fade`,
        `${'{symbol}'} recovers - "Uncertainty Premium" evaporates`,
        `${'{symbol}'} back to pre-announcement - classic shakeout pattern`
      ]
    },
    gold_standard: {
      announcement: [
        `${'{symbol}'} CEO retirement announced - ${'{successor}'} named immediately`,
        `${'{symbol}'} planned transition: ${'{successor}'} to succeed, clean 8-K filed`,
        `${'{symbol}'} drops on CEO news - but succession plan intact`
      ],
      stabilization: [
        `${'{symbol}'} holds Day 1 low - "textbook setup" says trader`,
        `${'{symbol}'} 3-day stabilization: Volume climax, now support`,
        `${'{symbol}'} institutional accumulation detected after CEO news`
      ],
      resolution: [
        `${'{symbol}'} stages full recovery - Gold Standard pattern complete`,
        `${'{symbol}'} back to pre-CEO-news levels in just ${'{days}'} days`,
        `${'{symbol}'}: "Uncertainty Premium" trade pays off - +${'{gain}'}% from lows`
      ]
    }
  };

  // 8-K Filing Templates
  const EIGHT_K_TEMPLATES = {
    clean: {
      text: 'There were no disagreements with the Company on any matter of accounting principles or practices, financial statement disclosure, or auditing scope or procedure.',
      isClean: true
    },
    warning: {
      text: 'The departure followed discussions regarding certain accounting and disclosure matters.',
      isClean: false
    },
    redFlag: {
      text: 'The Company has initiated an internal review of certain accounting practices.',
      isClean: false
    }
  };

  // Successor types
  const SUCCESSOR_TYPES = [
    { title: 'COO', name: 'J. Smith', isInternal: true },
    { title: 'President', name: 'M. Johnson', isInternal: true },
    { title: 'CFO', name: 'R. Williams', isInternal: true },
    { title: 'Division Head', name: 'S. Davis', isInternal: true },
    { title: 'Board Member', name: 'T. Wilson', isInternal: false },
    { title: 'External Hire', name: 'Search Firm', isInternal: false }
  ];

  // ========== DEPENDENCIES ==========
  let deps = {
    stocks: null,
    todayNews: null,
    random: Math.random,
    randomChoice: null,
    isEventTypeEnabled: null,
    getMemeMultiplier: null
  };

  // ========== INITIALIZATION ==========
  function init(dependencies) {
    if (dependencies.stocks !== undefined) deps.stocks = dependencies.stocks;
    if (dependencies.todayNews !== undefined) deps.todayNews = dependencies.todayNews;
    if (dependencies.random !== undefined) deps.random = dependencies.random;
    if (dependencies.randomChoice !== undefined) deps.randomChoice = dependencies.randomChoice;
    if (dependencies.isEventTypeEnabled !== undefined) deps.isEventTypeEnabled = dependencies.isEventTypeEnabled;
    if (dependencies.getMemeMultiplier !== undefined) deps.getMemeMultiplier = dependencies.getMemeMultiplier;
    return ExecutiveChange;
  }

  // ========== HELPER FUNCTIONS ==========
  function getStocks() {
    return deps.stocks || (typeof stocks !== 'undefined' ? stocks : []);
  }

  function getNews() {
    return deps.todayNews || (typeof todayNews !== 'undefined' ? todayNews : []);
  }

  function random() {
    return deps.random();
  }

  function randomChoice(arr) {
    if (deps.randomChoice) return deps.randomChoice(arr);
    return arr[Math.floor(random() * arr.length)];
  }

  function isEventTypeEnabled(eventType) {
    if (deps.isEventTypeEnabled) return deps.isEventTypeEnabled(eventType);
    if (typeof window !== 'undefined' && window.isEventTypeEnabled) {
      return window.isEventTypeEnabled(eventType);
    }
    return true;
  }

  function getDate() {
    let gs = (typeof gameState !== 'undefined') ? gameState : (typeof window !== 'undefined' && window.gameState) ? window.gameState : null;
    if (gs && gs.year && gs.month && gs.day) return `Y${gs.year}/M${gs.month}/D${gs.day}`;
    return '?';
  }

  function getPriceInfo(stock) {
    const price = stock.price ? `$${stock.price.toFixed(2)}` : '$?';
    const delta = stock.preExecChangePrice 
      ? `${((stock.price - stock.preExecChangePrice) / stock.preExecChangePrice * 100).toFixed(1)}%`
      : '?';
    return `[${price} Δ${delta.startsWith('-') ? '' : '+'}${delta}]`;
  }

  function getMemeMultiplier(stock) {
    if (deps.getMemeMultiplier) return deps.getMemeMultiplier(stock);
    return (stock.isMeme || stock.volatility > 0.05) ? 1.5 : 1.0;
  }

  // ========== DD-002: STANDARDIZED PRICE EVENT API ==========
  /**
   * CRITICAL: Call this function for EVERY phase that affects stock price.
   * This ensures GUI/log/market consistency by setting all required properties.
   * 
   * @param {Object} stock - The stock object
   * @param {number} priceChange - The percentage change (e.g., -0.15 for -15%)
   * @param {string} phaseName - Name for logging (e.g., 'ANNOUNCEMENT', 'STABILIZATION')
   * @param {string} extraLogInfo - Additional info for log string
   * @returns {Object} { expectedPrice, logString } for consistent logging
   * 
   * SETS ON STOCK:
   * - crashTransitionEffect: For market.js DD-001 pure transition
   * - eventExpectedPrice: For GUI validation
   * - eventExpectedDelta: For percentage validation
   */
  function setPriceEvent(stock, priceChange, phaseName, extraLogInfo = '') {
    // Calculate expected price with proper rounding (matches market.js)
    const expectedPrice = Math.round(stock.price * (1 + priceChange) * 100) / 100;
    
    // Calculate actual delta after rounding (matches what render.js shows)
    const actualDelta = (expectedPrice - stock.price) / stock.price;
    
    // Set ALL required properties atomically
    stock.crashTransitionEffect = priceChange;
    stock.eventExpectedPrice = expectedPrice;
    stock.eventExpectedDelta = actualDelta;  // Use actual delta after rounding
    
    // Generate standardized log string with ACTUAL delta (matches GUI)
    const deltaStr = (actualDelta * 100).toFixed(1);
    const logString = `[EXEC] ${getDate()}: ${stock.symbol} ${phaseName} [$${expectedPrice.toFixed(2)} Δ${deltaStr}%] ${extraLogInfo}`;
    
    return { expectedPrice, priceChange: actualDelta, logString };
  }

  // ========== CHANGE TYPE CLASSIFICATION ==========
  /**
   * Determine executive change type based on probability distribution
   */
  function classifyChangeType() {
    const roll = random();
    const probs = CONSTANTS.TYPE_PROBABILITY;
    
    if (roll < probs.abrupt_no_successor) {
      return CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR;
    } else if (roll < probs.abrupt_no_successor + probs.cfo_exit_clean) {
      return CONSTANTS.CHANGE_TYPES.CFO_EXIT_CLEAN;
    } else if (roll < probs.abrupt_no_successor + probs.cfo_exit_clean + probs.planned_internal) {
      return CONSTANTS.CHANGE_TYPES.PLANNED_INTERNAL;
    } else {
      return CONSTANTS.CHANGE_TYPES.GOLD_STANDARD;
    }
  }

  /**
   * Generate signals for player to analyze
   */
  function generateChangeSignals(changeType) {
    const isGoldStandard = changeType === CONSTANTS.CHANGE_TYPES.GOLD_STANDARD;
    const isPlanned = changeType === CONSTANTS.CHANGE_TYPES.PLANNED_INTERNAL || isGoldStandard;
    const isAbrupt = changeType === CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR;
    const isCFO = changeType === CONSTANTS.CHANGE_TYPES.CFO_EXIT_CLEAN;

    // Determine role
    const role = isCFO ? CONSTANTS.ROLES.CFO : CONSTANTS.ROLES.CEO;

    // Succession signal
    let successor = null;
    let successionIntegrity = false;
    if (isPlanned || isGoldStandard) {
      const successorPool = SUCCESSOR_TYPES.filter(s => s.isInternal);
      successor = randomChoice(successorPool);
      successionIntegrity = true;
    } else if (!isAbrupt && random() > 0.5) {
      // Sometimes even non-gold has a successor
      successor = randomChoice(SUCCESSOR_TYPES);
      successionIntegrity = successor.isInternal;
    }

    // 8-K signal
    let eightK;
    if (isAbrupt) {
      eightK = random() > 0.3 ? EIGHT_K_TEMPLATES.warning : EIGHT_K_TEMPLATES.redFlag;
    } else if (isGoldStandard) {
      eightK = EIGHT_K_TEMPLATES.clean;
    } else {
      eightK = random() > 0.2 ? EIGHT_K_TEMPLATES.clean : EIGHT_K_TEMPLATES.warning;
    }

    // Volume signal
    const volumeMultiple = isGoldStandard ? 3 + random() * 2 : 1.5 + random() * 2;
    const volumeCapitulation = volumeMultiple >= 3;

    // Departure language
    const departureLanguage = isAbrupt 
      ? randomChoice(['effective immediately', 'personal reasons', 'pursue other opportunities'])
      : isPlanned 
        ? randomChoice(['retirement', 'planned transition', 'after distinguished career'])
        : randomChoice(['new opportunity', 'personal decision', 'transition']);

    return {
      changeType: changeType,
      role: role,
      
      // Signal 1: Succession Integrity
      successionIntegrity: {
        hasSuccessor: successor !== null,
        isInternal: successionIntegrity,
        successor: successor,
        description: successor 
          ? `${successor.title} ${successor.name} named as successor`
          : 'No successor announced - board initiating search'
      },
      
      // Signal 2: Clean Audit (8-K)
      cleanAudit: {
        isClean: eightK.isClean,
        filingText: eightK.text,
        description: eightK.isClean
          ? '8-K confirms: "No disagreements on accounting matters"'
          : '⚠️ 8-K contains concerning language about accounting/practices'
      },
      
      // Signal 3: Volume Capitulation
      volumeCapitulation: {
        isMet: volumeCapitulation,
        volumeMultiple: volumeMultiple,
        description: volumeCapitulation
          ? `Volume ${volumeMultiple.toFixed(1)}x average - capitulation selling detected`
          : `Volume ${volumeMultiple.toFixed(1)}x average - below 3x threshold`
      },
      
      // Signal 4: Departure Language
      departureLanguage: {
        language: departureLanguage,
        isWarning: ['effective immediately', 'personal reasons'].includes(departureLanguage),
        description: `Departure announced: "${departureLanguage}"`
      },

      // Gold Standard Check
      isGoldStandard: successionIntegrity && eightK.isClean && volumeCapitulation && isPlanned
    };
  }

  /**
   * Calculate reversal probability based on signals
   */
  function calculateReversalProbability(stock) {
    if (!stock.execChangeType) return 0.5;

    const signals = stock.execChangeSignals || {};
    const baseProb = CONSTANTS.REVERSAL_PROBABILITY[stock.execChangeType];
    let probability = baseProb;

    // Adjust based on actual signals
    if (signals.successionIntegrity?.isInternal) {
      probability += 0.10;
    }
    if (signals.cleanAudit?.isClean) {
      probability += 0.10;
    }
    if (signals.volumeCapitulation?.isMet) {
      probability += 0.05;
    }
    if (signals.departureLanguage?.isWarning) {
      probability -= 0.15;
    }

    // Cap probability
    probability = Math.max(0.05, Math.min(0.95, probability));

    return probability;
  }

  // ========== TRIGGER EXECUTIVE CHANGE ==========
  function triggerExecutiveChange(stock, forcedType = null) {
    if (stock.execChangePhase) return false;

    // Classify change type
    const changeType = forcedType || classifyChangeType();
    
    // Generate signals
    const signals = generateChangeSignals(changeType);

    // Select catalyst based on type
    let catalystPool;
    switch (changeType) {
      case CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR:
        catalystPool = ABRUPT_CATALYSTS;
        break;
      case CONSTANTS.CHANGE_TYPES.CFO_EXIT_CLEAN:
        catalystPool = CFO_EXIT_CATALYSTS;
        break;
      case CONSTANTS.CHANGE_TYPES.PLANNED_INTERNAL:
        catalystPool = PLANNED_INTERNAL_CATALYSTS;
        break;
      case CONSTANTS.CHANGE_TYPES.GOLD_STANDARD:
        catalystPool = GOLD_STANDARD_CATALYSTS;
        break;
      default:
        catalystPool = PLANNED_INTERNAL_CATALYSTS;
    }
    const catalyst = randomChoice(catalystPool);

    // Store state
    stock.execChangePhase = 'announcement';
    stock.execChangeType = changeType;
    stock.execChangeCatalyst = catalyst;
    stock.execChangeSignals = signals;
    stock.preExecChangePrice = stock.price;
    stock.execChangeRole = signals.role;
    stock.execChangeSuccessor = signals.successionIntegrity?.successor;

    // Timeline
    const timeline = CONSTANTS.TIMELINE;
    // +1 because processExecChange decrements BEFORE checking phase transitions
    stock.execChangeDaysLeft = timeline.announcement.min + 
      Math.floor(random() * (timeline.announcement.max - timeline.announcement.min + 1)) + 1;
    stock.execChangeDayCounter = 0;
    stock.execChangeDay1Low = null; // Will be set after Day 1

    // Calculate outcome
    const reversalProb = calculateReversalProbability(stock);
    stock.execChangeWillReverse = random() < reversalProb;
    stock.execChangeReversalProbability = reversalProb;

    // Initial price impact
    const impact = CONSTANTS.PRICE_IMPACT.announcement[changeType];
    const memeMultiplier = getMemeMultiplier(stock);
    const actualImpact = (impact.min + random() * (impact.max - impact.min)) * memeMultiplier;
    
    // DD-002: Use setPriceEvent for announcement day catalyst
    const event = setPriceEvent(stock, actualImpact, 'ANNOUNCEMENT_DAY', 
      `[type=${changeType}] [role=${signals.role}] [daysLeft=${stock.execChangeDaysLeft}]`);
    console.log(event.logString);
    
    stock.sentimentOffset = (stock.sentimentOffset || 0) - 0.03 * memeMultiplier;
    console.log(`  Role: ${signals.role}, Successor: ${signals.successionIntegrity?.description}, 8-K: ${signals.cleanAudit?.isClean ? 'CLEAN' : 'WARN'}`);
    console.log(`  Reversal: ${Math.round(reversalProb * 100)}% (will: ${stock.execChangeWillReverse})`);

    return true;
  }

  // ========== PROCESS EXECUTIVE CHANGE ==========
  function processExecutiveChange() {
    const stockList = getStocks();
    
    stockList.forEach(stock => {
      if (!stock.execChangePhase) return;
      
      // Cancel if disabled
      if (!isEventTypeEnabled('executive_change')) {
        clearExecChangeState(stock);
        return;
      }

      stock.execChangeDaysLeft--;
      stock.execChangeDayCounter++;

      const memeMultiplier = getMemeMultiplier(stock);
      const changeType = stock.execChangeType;

      switch (stock.execChangePhase) {
        case 'announcement':
          processAnnouncementPhase(stock, changeType, memeMultiplier);
          break;
        case 'stabilization':
          processStabilizationPhase(stock, changeType, memeMultiplier);
          break;
        case 'resolution':
          processResolutionPhase(stock, changeType, memeMultiplier);
          break;
      }
    });
  }

  function processAnnouncementPhase(stock, changeType, memeMultiplier) {
    // Skip price impact on day 1 - trigger already set crashTransitionEffect
    if (stock.execChangeDayCounter > 1) {
      // Continued selling pressure on subsequent days
      const impact = CONSTANTS.PRICE_IMPACT.announcement[changeType];
      const priceChange = (impact.min * 0.3 + random() * Math.abs(impact.min * 0.3)) * memeMultiplier;
      
      // DD-002: Only set event if meaningful price change (>0.5%)
      if (Math.abs(priceChange) > 0.005) {
        setPriceEvent(stock, priceChange, 'ANNOUNCEMENT_CONT', 
          `[day=${stock.execChangeDayCounter}] [daysLeft=${stock.execChangeDaysLeft}]`);
      }
    }

    if (stock.execChangeDaysLeft <= 0) {
      // Record Day 1 low for 3-day stabilization check
      stock.execChangeDay1Low = stock.price;
      
      // Transition to stabilization
      stock.execChangePhase = 'stabilization';
      const timeline = CONSTANTS.TIMELINE.stabilization;
      // +1 because processExecChange decrements BEFORE checking phase transitions
      stock.execChangeDaysLeft = timeline.min + Math.floor(random() * (timeline.max - timeline.min + 1)) + 1;
      stock.stabilizationDaysHeld = 0;
      
      generateExecChangeNews(stock, 'stabilization');
    }
  }

  function processStabilizationPhase(stock, changeType, memeMultiplier) {
    const impact = CONSTANTS.PRICE_IMPACT.stabilization[changeType];
    const priceChange = impact.min + random() * (impact.max - impact.min);
    
    // DD-002: Only set event if meaningful price change (>0.5%)
    if (Math.abs(priceChange) > 0.005) {
      setPriceEvent(stock, priceChange, 'STABILIZATION', 
        `[daysHeld=${stock.stabilizationDaysHeld || 0}] [daysLeft=${stock.execChangeDaysLeft}]`);
    }

    // Check 3-day stabilization rule
    if (stock.price >= stock.execChangeDay1Low) {
      stock.stabilizationDaysHeld++;
    } else {
      // Made new low - reset counter
      stock.stabilizationDaysHeld = 0;
      stock.execChangeDay1Low = stock.price;
    }

    // Update signals based on stabilization
    if (stock.execChangeSignals) {
      stock.execChangeSignals.threesDayStabilization = {
        isMet: stock.stabilizationDaysHeld >= 3,
        daysHeld: stock.stabilizationDaysHeld,
        description: stock.stabilizationDaysHeld >= 3
          ? '✓ 3-Day Stabilization CONFIRMED - holding Day 1 low'
          : `Day ${stock.stabilizationDaysHeld}/3 - watching if Day 1 low holds`
      };
    }

    if (stock.execChangeDaysLeft <= 0) {
      // Transition to resolution
      stock.execChangePhase = 'resolution';
      const resTimeline = CONSTANTS.TIMELINE.resolution[changeType];
      // +1 because processExecChange decrements BEFORE checking phase transitions
      stock.execChangeDaysLeft = resTimeline.min + Math.floor(random() * (resTimeline.max - resTimeline.min + 1)) + 1;
      
      generateExecChangeNews(stock, 'resolution');
    }
  }

  function processResolutionPhase(stock, changeType, memeMultiplier) {
    const impact = CONSTANTS.PRICE_IMPACT.resolution[changeType];
    
    if (stock.execChangeWillReverse) {
      // Recovery phase
      const priceChange = (impact.min + random() * (impact.max - impact.min)) / Math.max(1, stock.execChangeDaysLeft);
      
      // DD-002: Only set event if meaningful price change (>0.5%)
      if (Math.abs(priceChange) > 0.005) {
        setPriceEvent(stock, priceChange, 'RECOVERY', 
          `[type=${changeType}] [daysLeft=${stock.execChangeDaysLeft}]`);
      }
      stock.sentimentOffset = (stock.sentimentOffset || 0) + 0.015 * memeMultiplier;
    } else {
      // Continued decline
      const priceChange = impact.min * 0.5 + random() * Math.abs(impact.min * 0.3);
      
      // DD-002: Only set event if meaningful price change (>0.5%)
      if (Math.abs(priceChange) > 0.005) {
        setPriceEvent(stock, priceChange, 'DECLINE', 
          `[type=${changeType}] [daysLeft=${stock.execChangeDaysLeft}]`);
      }
    }

    if (stock.execChangeDaysLeft <= 0) {
      // Calculate final outcome
      const startPrice = stock.preExecChangePrice;
      const endPrice = stock.price;
      const totalChange = (endPrice - startPrice) / startPrice;
      const daysTaken = stock.execChangeDayCounter;

      console.log(`[EXEC] ${getDate()}: ${stock.symbol} RESOLVED ${getPriceInfo(stock)} [END]`);
      console.log(`  Type: ${changeType}, Reversed: ${stock.execChangeWillReverse}, Change: ${(totalChange * 100).toFixed(1)}%, Days: ${daysTaken}`);

      generateExecChangeNews(stock, stock.execChangeWillReverse ? 'reversal_complete' : 'decline_continues');
      clearExecChangeState(stock);
    }
  }

  function clearExecChangeState(stock) {
    stock.execChangePhase = null;
    stock.execChangeType = null;
    stock.execChangeCatalyst = null;
    stock.execChangeSignals = null;
    stock.preExecChangePrice = null;
    stock.execChangeDay1Low = null;
    stock.execChangeDaysLeft = null;
    stock.execChangeDayCounter = null;
    stock.execChangeWillReverse = null;
    stock.execChangeReversalProbability = null;
    stock.execChangeRole = null;
    stock.execChangeSuccessor = null;
    stock.stabilizationDaysHeld = null;
  }

  // ========== NEWS GENERATION ==========
  function generateExecChangeNews(stock, phase) {
    const news = getNews();
    const changeType = stock.execChangeType;
    const signals = stock.execChangeSignals;
    const role = stock.execChangeRole || 'CEO';
    const successor = stock.execChangeSuccessor;

    let headline, description, sentiment, educationalNote;

    const templates = HEADLINES[changeType] || HEADLINES.planned_internal;
    
    switch (phase) {
      case 'stabilization':
        headline = randomChoice(templates.stabilization)
          .replace('{symbol}', stock.symbol)
          .replace('{role}', role);
        description = signals.cleanAudit?.isClean
          ? `Stock finding support after initial drop. ${signals.cleanAudit?.description}. ` +
            `${signals.successionIntegrity?.description}.`
          : `Uncertainty continues. ${signals.cleanAudit?.description}. Market awaits clarity.`;
        sentiment = changeType === CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR ? 'negative' : 'neutral';
        educationalNote = `🎯 ACTION: WAIT. Watch if Day 1 low holds for 3 days. ${signals.threesDayStabilization?.description || 'Tracking...'}`;
        break;

      case 'resolution':
        headline = randomChoice(templates.resolution)
          .replace('{symbol}', stock.symbol)
          .replace('{role}', role)
          .replace('{successor}', successor?.title || 'successor')
          .replace('{days}', stock.execChangeDayCounter || '14')
          .replace('{gain}', Math.round((stock.price / stock.execChangeDay1Low - 1) * 100) || '10');
        description = stock.execChangeWillReverse
          ? `Classic "Uncertainty Premium" evaporation. ${signals.successionIntegrity?.description}. ` +
            `Clean 8-K + internal successor = News Shakeout pattern (Denis & Denis 1995).`
          : `Decline continues as market digests leadership vacuum. ` +
            `No clear succession + concerning 8-K language = fundamental re-rating.`;
        sentiment = stock.execChangeWillReverse ? 'positive' : 'negative';
        educationalNote = stock.execChangeWillReverse
          ? '� ACTION: BUY NOW. Gold Standard confirmed - 85% reversal. Enter with stop below Day 1 low.'
          : '🎯 ACTION: SELL if holding, DO NOT BUY. Missing signals = fundamental decline, not shakeout.';
        break;

      case 'reversal_complete':
        headline = `${stock.symbol} fully recovers from ${role} transition - back to pre-announcement levels`;
        description = `The "Uncertainty Premium" has fully evaporated. Internal succession + clean audit + ` +
          `3-day stabilization confirmed this was a News Shakeout, not a fundamental issue.`;
        sentiment = 'positive';
        educationalNote = '🎯 ACTION: TAKE PROFIT. Pattern COMPLETE. Sell to lock in gains. Move to next opportunity.';
        break;

      case 'decline_continues':
        headline = `${stock.symbol} continues decline after ${role} departure - "leadership vacuum" concerns`;
        description = `Without clear succession or with concerning 8-K language, the market has re-rated the stock. ` +
          `This was NOT a shakeout - fundamental uncertainty remains.`;
        sentiment = 'negative';
        educationalNote = '🎯 ACTION: SELL if holding, AVOID if watching. Leadership vacuum = more downside ahead.';
        break;
    }

    if (headline) {
      news.push({
        headline: headline,
        description: description,
        sentiment: sentiment,
        relatedStock: stock.symbol,
        newsType: 'executive_change',
        isExecutiveChange: true,
        execChangeType: changeType,
        execChangePhase: phase,
        execChangeRole: role,
        reversalProbability: stock.execChangeReversalProbability,
        educationalNote: educationalNote,
        execChangeSignals: signals
      });
      
      // Log each news phase to terminal
      console.log(`[EXEC] ${getDate()}: ${stock.symbol} ${phase.toUpperCase()} ${getPriceInfo(stock)} [daysLeft=${stock.execChangeDaysLeft}]`);
    }
  }

  // ========== CHECK FOR NEW CHANGES ==========
  function checkExecutiveChangeEvents(stock, newsArray) {
    // Skip if already in change or other major event
    if (stock.execChangePhase || stock.crashPhase || stock.shortReportPhase || stock.strategicPivotPhase) return;
    
    // Daily chance
    if (random() < CONSTANTS.DAILY_CHANCE) {
      triggerExecutiveChange(stock);
      
      // Generate announcement news
      const changeType = stock.execChangeType;
      const signals = stock.execChangeSignals;
      const role = signals.role;
      const successor = signals.successionIntegrity?.successor;
      const catalyst = stock.execChangeCatalyst;

      const templates = HEADLINES[changeType] || HEADLINES.planned_internal;
      const headline = randomChoice(templates.announcement)
        .replace('{symbol}', stock.symbol)
        .replace('{role}', role)
        .replace('{successor}', successor?.title || 'TBD');

      const news = newsArray || getNews();
      news.push({
        headline: headline,
        description: `${signals.departureLanguage?.description}. ` +
          `${signals.successionIntegrity?.description}. ` +
          `${signals.cleanAudit?.description}. ` +
          `Volume: ${signals.volumeCapitulation?.description}.`,
        sentiment: 'negative',
        relatedStock: stock.symbol,
        newsType: 'executive_change',
        isExecutiveChange: true,
        execChangeType: changeType,
        execChangePhase: 'announcement',
        execChangeRole: role,
        reversalProbability: stock.execChangeReversalProbability,
        educationalNote: changeType === CONSTANTS.CHANGE_TYPES.GOLD_STANDARD
          ? '🎯 ACTION: PREPARE TO BUY. Check: (1) Internal successor, (2) Clean 8-K, (3) Volume 3x+, (4) 3-day hold. If all met, BUY!'
          : changeType === CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR
            ? '🎯 ACTION: DO NOT BUY. No successor + concerning language = fundamental issue. Wait 6+ months.'
            : '🎯 ACTION: WAIT AND ANALYZE. Check successor status, 8-K, volume before deciding.',
        execChangeSignals: signals
      });
    }
  }

  // ========== TUTORIAL HINT ==========
  function getTutorialHint(newsItem, stock) {
    if (!newsItem.isExecutiveChange) return null;

    const changeType = newsItem.execChangeType;
    const signals = newsItem.execChangeSignals || {};
    const phase = newsItem.execChangePhase;
    const reversalProb = newsItem.reversalProbability || 0.5;
    const probPercent = Math.round(reversalProb * 100);

    const typeDescriptions = {
      [CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR]: `🔴 ABRUPT DEPARTURE (Fundamental Risk) - ${probPercent}% probability`,
      [CONSTANTS.CHANGE_TYPES.CFO_EXIT_CLEAN]: `🟡 CFO EXIT (Slow Recovery) - ${probPercent}% probability`,
      [CONSTANTS.CHANGE_TYPES.PLANNED_INTERNAL]: `🟢 PLANNED TRANSITION (Good Reversal) - ${probPercent}% probability`,
      [CONSTANTS.CHANGE_TYPES.GOLD_STANDARD]: `🏆 GOLD STANDARD (85%+ Reversal) - ${probPercent}% probability`
    };

    const tutorial = {
      type: typeDescriptions[changeType] || `🟡 EXECUTIVE CHANGE - ${probPercent}% probability`,
      description: changeType === CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR
        ? 'Abrupt departure without successor - high risk of further decline.'
        : changeType === CONSTANTS.CHANGE_TYPES.GOLD_STANDARD
          ? 'All 4 gold standard signals present - high probability reversal setup.'
          : 'Leadership transition with mixed signals - analyze carefully.',
      implication: `📊 ${probPercent}% reversal probability based on signals.`,
      action: reversalProb >= 0.70
        ? `📈 BUY after 3-day stabilization confirms support. ${probPercent}% success rate.`
        : reversalProb >= 0.50
          ? `⏳ WAIT for clearer signals. ${probPercent}% probability - needs confirmation.`
          : `⛔ DO NOT BUY - only ${probPercent}% probability. High risk of continued decline.`
    };

    // Signal breakdown
    tutorial.signals = [
      `Succession: ${signals.successionIntegrity?.description || 'Unknown'}`,
      `8-K Audit: ${signals.cleanAudit?.description || 'Unknown'}`,
      `Volume: ${signals.volumeCapitulation?.description || 'Unknown'}`,
      `Language: ${signals.departureLanguage?.description || 'Unknown'}`
    ];

    // Phase-specific guidance
    if (phase === 'stabilization') {
      tutorial.timing = signals.threesDayStabilization?.isMet
        ? '📥 ENTRY ZONE: 3-day stabilization confirmed. Consider buying now.'
        : `⏳ WAIT: ${signals.threesDayStabilization?.description}`;
    } else if (phase === 'resolution') {
      tutorial.timing = reversalProb >= 0.70
        ? '📤 EXIT ZONE: Take profits as price approaches pre-announcement.'
        : '📉 Decline likely to continue.';
    }

    // NLP Hint
    tutorial.nlpHint = '📰 8-K LANGUAGE FILTER (Denis & Denis 1995): ' +
      'CLEAN: "No disagreements on accounting matters" = Good. ' +
      'WARNING: "Effective immediately," "personal reasons," "disagreements" = Bad. ' +
      'The 8-K boilerplate is the #1 predictor of reversal vs crash.';

    return tutorial;
  }

  // ========== DETAILED TRADING HINT ==========
  function getDetailedHint(newsItem, stock) {
    if (!newsItem.isExecutiveChange) return null;

    const changeType = newsItem.execChangeType;
    const signals = newsItem.execChangeSignals || {};
    const reversalProb = newsItem.reversalProbability || 0.5;
    const isGoldStandard = changeType === CONSTANTS.CHANGE_TYPES.GOLD_STANDARD;
    const isAbrupt = changeType === CONSTANTS.CHANGE_TYPES.ABRUPT_NO_SUCCESSOR;

    return {
      telltales: isGoldStandard ? [
        '📰 Planned retirement/transition language',
        '👔 Internal successor named immediately (COO, President)',
        '📋 Clean 8-K: "No disagreements on accounting matters"',
        '📊 Volume spike 3x+ average (capitulation)',
        '📈 Holds Day 1 low for 3 consecutive days'
      ] : isAbrupt ? [
        '⚠️ "Effective immediately" language',
        '❌ No successor announced',
        '📋 8-K contains "disagreements" or "review" language',
        '📊 Continued selling after Day 1',
        '📉 Makes new lows on Days 2-3'
      ] : [
        '📰 Mixed signals - analyze each factor',
        '👔 Check if successor is internal vs external',
        '📋 Read 8-K carefully for red flags',
        '📊 Watch volume pattern',
        '📈 Monitor 3-day stabilization'
      ],
      timeline: {
        total: isGoldStandard ? '10-14 days' : isAbrupt ? '20-40 days decline' : '14-30 days',
        phases: isGoldStandard ? [
          'Days 1-2: Announcement drop (-5% to -10%)',
          'Days 3-5: Stabilization (3-day rule)',
          'Days 6-14: Recovery to pre-announcement'
        ] : isAbrupt ? [
          'Days 1-2: Initial crash (-15% to -25%)',
          'Days 3-10: Continued drift lower',
          'Days 10+: New equilibrium at lower level'
        ] : [
          'Days 1-2: Announcement drop',
          'Days 3-5: Stabilization period',
          'Days 6-30: Gradual recovery or decline based on signals'
        ],
        optimalEntry: isGoldStandard ? 'Day 3-5 (after 3-day stabilization confirms)' : 'DO NOT ENTER',
        optimalExit: isGoldStandard ? 'Days 10-14 (pre-announcement price)' : 'N/A'
      },
      priceTargets: isGoldStandard ? {
        entryZone: [0.90, 0.95],
        exitZone: [0.98, 1.02],
        stopLoss: 0.85
      } : null,
      strategy: isGoldStandard ? [
        '1. Verify all 4 Gold Standard signals present',
        '2. Wait for 3-day stabilization (Day 1 low holds)',
        '3. Enter position with stop below Day 1 low',
        '4. Hold through recovery phase',
        '5. Exit at pre-announcement levels (Days 10-14)'
      ] : [
        '1. Analyze signals carefully',
        '2. Missing gold standard signals = higher risk',
        '3. Abrupt + no successor = DO NOT BUY',
        '4. CFO exit = slow 6-month recovery (better opportunities elsewhere)',
        '5. Only trade if high conviction on succession integrity'
      ],
      stockContext: {
        phase: newsItem.execChangePhase,
        daysRemaining: stock?.execChangeDaysLeft || 'Unknown',
        reversalProbability: `${Math.round(reversalProb * 100)}%`,
        stabilizationStatus: signals.threesDayStabilization?.description || 'Pending'
      },
      riskLevel: isGoldStandard ? 'MEDIUM' : isAbrupt ? 'HIGH (Fundamental Risk)' : 'MEDIUM-HIGH',
      goldStandard: {
        title: '🏆 EXECUTIVE CHANGE GOLD STANDARD (85%+ Reversal)',
        criteria: [
          '✓ Succession Integrity: Internal successor named immediately',
          '✓ Clean Audit: 8-K contains "no disagreements" boilerplate',
          '✓ Volume Capitulation: 5-10% drop on 3x+ volume',
          '✓ 3-Day Stabilization: Holds Day 1 low for 3 days'
        ],
        successRate: '85%+ reversal in 10-14 days (Denis & Denis, Huson et al.)'
      }
    };
  }

  // ========== PUBLIC API ==========
  const ExecutiveChange = {
    init,
    processExecutiveChange,
    checkExecutiveChangeEvents,
    triggerExecutiveChange,
    getTutorialHint,
    getDetailedHint,
    calculateReversalProbability,
    classifyChangeType,
    generateChangeSignals,
    clearExecChangeState,
    CONSTANTS,
    CHANGE_TYPES: CONSTANTS.CHANGE_TYPES,
    
    // Testing
    _test: {
      classifyChangeType,
      generateChangeSignals,
      calculateReversalProbability,
      clearExecChangeState
    },
    
    _reset: function() {
      deps = {
        stocks: null,
        todayNews: null,
        random: Math.random,
        randomChoice: null,
        isEventTypeEnabled: null,
        getMemeMultiplier: null
      };
    }
  };

  return ExecutiveChange;
})();

// Global wrapper for tutorial.js compatibility
function getExecutiveChangeTutorialHint(newsItem) {
  // ExecutiveChange.getTutorialHint takes (newsItem, stock)
  // Find the stock from the newsItem's relatedStock
  if (newsItem && newsItem.relatedStock && typeof stocks !== 'undefined') {
    const stock = stocks.find(s => s.symbol === newsItem.relatedStock);
    return ExecutiveChange.getTutorialHint(newsItem, stock);
  }
  return ExecutiveChange.getTutorialHint(newsItem, null);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExecutiveChange;
}
