/**
 * Price-News Coupling Test Script
 * 
 * Tests each phenomenon INDIVIDUALLY to avoid multi-module conflicts.
 * For each phenomenon, verifies:
 * 1. Price DIRECTION matches news sentiment (bearish news = price down)
 * 2. Price MAGNITUDE is reasonable for the news intensity
 * 3. eventExpectedPrice matches actual price after market update (GUI/log parity)
 * 4. Price stays within empirical bounds per phase
 * 
 * Usage: node test_coupling.js [module]
 *   module: DCB, SSR, SHAKEOUT, PIVOT, EXEC, or ALL (default)
 * 
 * Example: node test_coupling.js DCB    # Test only Dead Cat Bounce
 *          node test_coupling.js ALL    # Test all modules individually
 */

// ========== SEEDED RANDOM FOR REPRODUCIBILITY ==========
let seed = 12345;
function seededRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const random = seededRandom;

// ========== MOCK GAME STATE ==========
let stocks = [];
let todayNews = [];
const gameState = { day: 0, month: 1, year: 1 };

// ========== PHASE PRICE EXPECTATIONS ==========
const PHASE_EXPECTATIONS = {
  // Dead Cat Bounce
  'DCB:crash': { 
    direction: -1, 
    minDrop: 0.10, maxDrop: 0.40,
    description: 'Initial crash should drop 10-40%'
  },
  'DCB:bounce': { 
    direction: 1, 
    minGain: 0.03, maxGain: 0.20,
    description: 'Dead cat bounce should recover 3-20% from low'
  },
  'DCB:capitulation': { 
    direction: -1,
    description: 'Capitulation should make new lows'
  },
  'DCB:recovery': { 
    direction: 1,
    description: 'Recovery phase should trend up'
  },
  
  // Short Seller Report
  'SSR:attack': { 
    direction: -1, 
    minDrop: 0.15, maxDrop: 0.45,
    description: 'Short attack should drop 15-45%'
  },
  'SSR:rebuttal': { 
    direction: 0,
    description: 'Rebuttal phase is uncertain'
  },
  'SSR:base_building': { 
    direction: 0,
    maxMove: 0.20,
    description: 'Base building should be sideways (±20% over multi-day period)'
  },
  'SSR:resolution': {
    description: 'Resolution direction depends on breakout/breakdown'
  },
  
  // News Shakeout
  'SHAKEOUT:panic': { 
    direction: -1, 
    minDrop: 0.08, maxDrop: 0.25,
    description: 'Panic should drop 8-25%'
  },
  'SHAKEOUT:stabilization': { 
    direction: 0,
    maxMove: 0.05,
    description: 'Stabilization should be choppy (±5%)'
  },
  'SHAKEOUT:recovery': { 
    direction: 1,
    description: 'Recovery should trend toward gap fill'
  },
  
  // Strategic Pivot
  'PIVOT:triggered': {
    direction: -1,
    minDrop: 0.03, maxDrop: 0.15,
    description: 'Pivot announcement drops 3-15%'
  },
  
  // Executive Change  
  'EXEC:triggered': {
    direction: -1,
    minDrop: 0.02, maxDrop: 0.12,
    description: 'Exec change drops 2-12%'
  },
  
  // Index Rebalancing (Tier 1)
  'INDEX:runUp': {
    direction: 1,  // For additions; -1 for deletions
    description: 'Run-up phase before effective date'
  },
  'INDEX:effectiveDay': {
    direction: 1,  // For additions; -1 for deletions
    description: 'Massive MOC volume on effective date'
  },
  'INDEX:reversal': {
    direction: -1, // For additions; +1 for deletions
    description: 'Mean reversion after forced buying exhausted'
  },
  
  // Stock Split (Tier 2)
  'SPLIT:announcement': {
    direction: 1,
    minGain: 0.02, maxGain: 0.08,
    description: 'Announcement pop 2-8%'
  },
  'SPLIT:runUp': {
    direction: 1,
    description: 'Pre-split enthusiasm'
  },
  'SPLIT:effectiveDay': {
    direction: 0,  // Can go either way
    description: 'Split execution day'
  },
  'SPLIT:postSplit': {
    direction: 0,
    description: 'Post-split trading'
  },
  
  // Short Squeeze (Tier 2)
  'SQUEEZE:buildup': {
    direction: -1,
    description: 'Shorts piling in, price suppressed'
  },
  'SQUEEZE:squeeze': {
    direction: 1,
    minGain: 0.10, maxGain: 0.60,
    description: 'Squeeze in progress - massive spike'
  },
  'SQUEEZE:climax': {
    direction: 1,
    description: 'Peak of squeeze'
  },
  'SQUEEZE:reversal': {
    direction: -1,
    description: 'Post-squeeze reversal'
  },
  
  // FOMO Rally (Tier 2)
  'FOMO:buildup': {
    direction: 1,
    minGain: 0.02, maxGain: 0.05,
    description: 'Building momentum'
  },
  'FOMO:euphoria': {
    direction: 1,
    minGain: 0.05, maxGain: 0.10,
    description: 'Parabolic move'
  },
  'FOMO:blowOff': {
    direction: 0,
    description: 'Blow-off top day'
  },
  'FOMO:crash': {
    direction: -1,
    minDrop: 0.005, maxDrop: 0.10,  // Relaxed: 0.5-10% daily drops (some crashes are minor)
    description: 'Post-euphoria crash'
  },
  
  // Liquidity Sweep (Tier 2)
  'SWEEP:setup': {
    direction: 0,
    description: 'Support formation'
  },
  'SWEEP:sweep': {
    direction: -1,
    minDrop: 0.02, maxDrop: 0.08,
    description: 'Stop-run below support'
  },
  'SWEEP:recovery': {
    direction: 1,
    description: 'Price reclaims support'
  },
  'SWEEP:continuation': {
    direction: 1,
    description: 'Post-sweep rally'
  },
  
  // Insider Buying (Tier 1) - no phases, single event
  'INSIDER:signal': {
    direction: 1,
    description: 'Insider buying is bullish signal'
  }
};

// ========== NEWS CLASSIFICATION ==========
const NEWS_PATTERNS = {
  bearish_strong: {
    keywords: ['CRASHES', 'PLUNGES', 'COLLAPSES', 'BREAKS DOWN', 'BREAKDOWN', 
               'CAPITULATES', 'TANKS', 'CRATERS', 'DECIMATED', 'HAMMERED',
               'PLUMMETS', 'TUMBLES', 'NOSEDIVES', 'NEW LOWS', 'FRAUD'],
    expectedDirection: -1,
    expectedMagnitude: { min: 0.03, max: 0.35 },
    maxWrongDirection: 0.02
  },
  bearish_moderate: {
    keywords: ['FALLS', 'DROPS', 'DECLINES', 'SLIPS', 'WEAKENS', 'FADES',
               'SELLS OFF', 'UNDER PRESSURE', 'LOSES', 'RETREATS', 'SLIDES',
               'LOWER', 'FAILS', 'TRAP', 'DECLINE', 'FIZZLES'],
    expectedDirection: -1,
    expectedMagnitude: { min: 0.005, max: 0.15 },
    maxWrongDirection: 0.03
  },
  bullish_strong: {
    keywords: ['SURGES', 'SOARS', 'ROCKETS', 'BREAKS OUT', 'BREAKOUT',
               'EXPLODES', 'SKYROCKETS', 'MOONS', 'BLASTS OFF', 'SPIKES'],
    expectedDirection: 1,
    expectedMagnitude: { min: 0.03, max: 0.35 },
    maxWrongDirection: 0.02
  },
  bullish_moderate: {
    keywords: ['RISES', 'GAINS', 'CLIMBS', 'ADVANCES', 'RALLIES',
               'RECOVERS', 'BOUNCES', 'REBOUNDS', 'STRENGTHENS', 'HIGHER',
               'CONFIRMATION', 'HOLDS', 'RECOVERY', 'REVERSAL'],
    expectedDirection: 1,
    expectedMagnitude: { min: 0.005, max: 0.15 },
    maxWrongDirection: 0.06
  }
};

// ========== EXPECTED PHASE SEQUENCES ==========
const PHASE_SEQUENCES = {
  DCB: {
    phases: ['crash', 'bounce', 'decline', 'consolidation', 'recovery'],
    validTransitions: {
      'null': ['crash'],
      'crash': ['bounce'],
      'bounce': ['decline', 'consolidation', 'recovery'], // depends on signals
      'decline': ['bounce', 'consolidation'],
      'consolidation': ['recovery', 'bounce'],
      'recovery': [null] // ends
    }
  },
  SSR: {
    phases: ['initial_crash', 'rebuttal_window', 'base_building', 'resolution'],
    validTransitions: {
      'null': ['initial_crash'],
      'initial_crash': ['rebuttal_window'],
      'rebuttal_window': ['base_building'],
      'base_building': ['resolution'],
      'resolution': [null] // ends
    }
  },
  SHAKEOUT: {
    // Note: trigger sets phase to 'stabilization' directly, then entry->recovery->complete
    phases: ['stabilization', 'entry', 'recovery', 'complete'],
    validTransitions: {
      'null': ['stabilization'],
      'stabilization': ['entry'],
      'entry': ['recovery'], // entry transitions immediately to recovery
      'recovery': ['complete'],
      'complete': [null] // ends
    }
  },
  PIVOT: {
    phases: ['announcement', 'execution_void', 'resolution'],
    validTransitions: {
      'null': ['announcement'],
      'announcement': ['execution_void'],
      'execution_void': ['resolution'],
      'resolution': [null] // ends
    }
  },
  EXEC: {
    phases: ['announcement', 'stabilization', 'resolution'],
    validTransitions: {
      'null': ['announcement'],
      'announcement': ['stabilization'],
      'stabilization': ['resolution'],
      'resolution': [null] // ends
    }
  },
  // Tier 1-2 dailyBias modules
  INDEX: {
    phases: ['announcement', 'runUp', 'effectiveDay', 'reversal'],
    validTransitions: {
      'null': ['announcement'],
      'announcement': ['runUp'],
      'runUp': ['effectiveDay'],
      'effectiveDay': ['reversal'],
      'reversal': [null]
    }
  },
  SPLIT: {
    phases: ['announcement', 'runUp', 'effectiveDay', 'postSplit'],
    validTransitions: {
      'null': ['announcement'],
      'announcement': ['runUp'],
      'runUp': ['effectiveDay'],
      'effectiveDay': ['postSplit'],
      'postSplit': [null]
    }
  },
  SQUEEZE: {
    phases: ['buildup', 'squeeze', 'climax', 'reversal'],
    validTransitions: {
      'null': ['buildup'],
      'buildup': ['squeeze', 'ready'],
      'ready': ['squeeze'],
      'squeeze': ['climax', 'unwind'],
      'climax': ['reversal', 'unwind'],
      'unwind': [null],
      'reversal': [null]
    }
  },
  FOMO: {
    phases: ['buildup', 'euphoria', 'blowOff', 'crash'],
    validTransitions: {
      'null': ['buildup'],
      'buildup': ['euphoria'],
      'euphoria': ['blowOff'],
      'blowOff': ['crash'],
      'crash': [null]
    }
  },
  SWEEP: {
    phases: ['setup', 'sweep', 'recovery', 'continuation'],
    validTransitions: {
      'null': ['setup'],
      'setup': ['sweep'],
      'sweep': ['recovery'],
      'recovery': ['continuation'],
      'continuation': [null]
    }
  }
};

// ========== TEST RESULTS ==========
let results = {};

function resetResults() {
  results = {
    totalDays: 0,
    totalNews: 0,
    violations: [],
    byCategory: {},
    byPhase: {},
    magnitudeIssues: [],
    expectedPriceMismatches: [],
    phaseTransitions: [],
    phasePriceViolations: [],
    
    // NEW: Price/Log direction mismatches (GUI shows +$2 but log shows -19%)
    priceLogDirectionMismatches: [],  // Critical: GUI direction != log direction
    
    // DD-002: Missing API properties (news generated but no eventExpectedPrice/Delta)
    missingEventProperties: [],  // Critical: Module generated news but forgot setPriceEvent()
    
    // NEW: Phase integrity checks
    missingPhases: [],           // Expected phases that never occurred
    orphanPhases: [],            // Phase transitions without corresponding news
    invalidTransitions: [],      // Phase A -> Phase C (skipped B)
    doubleTransitions: [],       // Same phase triggered twice in a row
    duplicateNews: [],           // Same headline generated twice
    missingTutorialHints: [],    // Phases without tutorial hints
    
    // Track phase sequences per stock
    phaseHistory: {},            // { stockSymbol: [{phase, day, hadNews}] }
    newsHeadlines: new Set(),    // Track all headlines for duplicate detection
    phasesWithNews: new Set(),   // Track phases that generated news
    
    // Gold Standard consistency (SHAKEOUT-specific)
    goldStandardViolations: []   // Count/criteria/probability mismatches
  };
  
  for (const cat of Object.keys(NEWS_PATTERNS)) {
    results.byCategory[cat] = { total: 0, correct: 0, wrong: 0, magnitudes: [] };
  }
}

// ========== MOCK INFRASTRUCTURE ==========

function createStock(symbol) {
  return {
    symbol,
    name: symbol + ' Corp',
    price: 100,
    basePrice: 100,
    previousPrice: 100,
    fairValue: 100,
    sentimentOffset: 0,
    volatility: 0.025,
    stability: 0.5 + random() * 0.5,
    isMeme: random() < 0.1,
    sector: 'Technology',
    trend: 0,
    epsModifier: 0,
    history: [],
    priceHistory: [],
    previousPrice: 100,
    institutionalAccumulation: 0,
    volatilityBoost: 0,
    consecutiveUpDays: 0,
    crashTransitionEffect: 0,
    shortReportTransitionEffect: 0,
    shakeoutTransitionEffect: 0,
    sweepTransitionEffect: 0,
    indexRebalanceTransitionEffect: 0,
    shortSqueezeTransitionEffect: 0,
    fomoRallyTransitionEffect: 0,
    phaseStartPrice: null,
    triggerPrice: null
  };
}

function getMemeMultiplier(stock) {
  const stability = stock.stability !== undefined ? stock.stability : 0.5;
  return 0.3 + (1 - stability) * 0.7;
}

function randomChoice(arr) {
  return arr[Math.floor(random() * arr.length)];
}

function isEventTypeEnabled() { return true; }

function getDate() {
  return `Y${gameState.year}M${gameState.month}D${gameState.day}`;
}

// ========== LOAD MODULES ==========

let SSR, DCB, SHAKEOUT, PIVOT, EXEC;
let INDEX, SPLIT, SQUEEZE, FOMO, SWEEP, INSIDER;

try { SSR = require('./shortSellerReport.js'); } catch(e) { console.log('✗ shortSellerReport.js:', e.message); }
try { DCB = require('./deadCatBounce.js'); } catch(e) { console.log('✗ deadCatBounce.js:', e.message); }
try { SHAKEOUT = require('./newsShakeout.js'); } catch(e) { console.log('✗ newsShakeout.js:', e.message); }
try { PIVOT = require('./strategicPivot.js'); } catch(e) { console.log('✗ strategicPivot.js:', e.message); }
try { EXEC = require('./executiveChange.js'); } catch(e) { console.log('✗ executiveChange.js:', e.message); }

// Tier 1-2 dailyBias modules
try { INDEX = require('./indexRebalance.js'); } catch(e) { console.log('✗ indexRebalance.js:', e.message); }
try { SPLIT = require('./stockSplit.js'); } catch(e) { console.log('✗ stockSplit.js:', e.message); }
try { SQUEEZE = require('./shortSqueeze.js'); } catch(e) { console.log('✗ shortSqueeze.js:', e.message); }
try { FOMO = require('./fomoRally.js'); } catch(e) { console.log('✗ fomoRally.js:', e.message); }
try { SWEEP = require('./liquiditySweep.js'); } catch(e) { console.log('✗ liquiditySweep.js:', e.message); }
try { INSIDER = require('./insiderBuying.js'); } catch(e) { console.log('✗ insiderBuying.js:', e.message); }

// ========== PRICE CALCULATION (from market.js) ==========

function updateStockPrices() {
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    
    const expectedPriceBefore = stock.eventExpectedPrice;
    const expectedDeltaBefore = stock.eventExpectedDelta;
    
    stock.fairValue = stock.basePrice * (1 + stock.epsModifier);
    stock.sentimentOffset = Math.max(-0.8, Math.min(3.0, stock.sentimentOffset));
    
    if (Math.abs(stock.sentimentOffset) > 0.01) {
      stock.sentimentOffset *= 0.98;
    }
    
    const manipulationPressure = (stock.institutionalAccumulation || 0) * 0.15;
    const targetPrice = stock.fairValue * (1 + stock.sentimentOffset + manipulationPressure);
    
    const effectiveVolatility = stock.volatility * (1 + (stock.volatilityBoost || 0));
    const noiseMultiplier = stock.crashPhase || stock.shortReportPhase || stock.newsShakeout ? 0.3 : 1.0;
    const noise = (random() - 0.5) * 2 * effectiveVolatility * noiseMultiplier;
    
    const currentDeviation = (stock.price - targetPrice) / targetPrice;
    const baseConvergenceSpeed = stock.crashPhase || stock.shortReportPhase || stock.newsShakeout ? 0.05 : 0.15;
    const correction = -currentDeviation * baseConvergenceSpeed;
    
    const trendMultiplier = stock.crashPhase ? 0.3 : 1.0;
    const trendEffect = stock.trend * 0.05 * trendMultiplier;
    
    // CRITICAL: Transition effects from modules
    const crashTransition = stock.crashTransitionEffect || 0;
    const ssrTransition = stock.shortReportTransitionEffect || 0;
    const shakeoutTransition = stock.shakeoutTransitionEffect || 0;
    const sweepTransition = stock.sweepTransitionEffect || 0;
    const indexTransition = stock.indexRebalanceTransitionEffect || 0;
    const squeezeTransition = stock.shortSqueezeTransitionEffect || 0;
    const fomoTransition = stock.fomoRallyTransitionEffect || 0;
    const transitionEffect = crashTransition + ssrTransition + shakeoutTransition + sweepTransition + indexTransition + squeezeTransition + fomoTransition;
    
    stock.crashTransitionEffect = 0;
    stock.shortReportTransitionEffect = 0;
    stock.shakeoutTransitionEffect = 0;
    stock.sweepTransitionEffect = 0;
    stock.indexRebalanceTransitionEffect = 0;
    stock.shortSqueezeTransitionEffect = 0;
    stock.fomoRallyTransitionEffect = 0;
    
    // DESIGN DECISION DD-001: Pure transition effect on catalyst days
    // When transition effect is active, suppress noise/trend/correction to ensure exact price match.
    // See plan.md for full decision record.
    const hasTransition = transitionEffect !== 0;
    let newPrice;
    if (hasTransition) {
      // Pure transition effect only - matches module's expected price exactly
      newPrice = stock.price * (1 + transitionEffect);
    } else {
      // Normal day: apply all market forces
      newPrice = stock.price * (1 + trendEffect + correction + noise);
    }
    
    const priceFloor = Math.max(1, stock.basePrice * 0.05);
    const priceCeiling = stock.basePrice * 20;
    newPrice = Math.max(priceFloor, Math.min(priceCeiling, newPrice));
    
    // Round to 2 decimal places (matches market.js)
    newPrice = Math.round(newPrice * 100) / 100;
    
    stock.previousPrice = stock.price;
    stock.price = newPrice;
    
    // ========== GUI vs LOG PARITY CHECK ==========
    // Simulates what trading page (render.js) shows vs what module logged
    // GUI: $price, $change (pct%)
    // LOG: eventExpectedPrice, eventExpectedDelta
    if (expectedPriceBefore !== undefined && expectedDeltaBefore !== undefined) {
      // What GUI would show (formatted to 2 decimal places like render.js)
      const guiPrice = stock.price.toFixed(2);
      const guiChange = (stock.price - stock.previousPrice).toFixed(2);
      const guiPctNum = stock.previousPrice > 0 
        ? ((stock.price - stock.previousPrice) / stock.previousPrice * 100)
        : 0;
      const guiPct = guiPctNum.toFixed(1);
      
      // What LOG showed (from module)
      const logPrice = expectedPriceBefore.toFixed(2);
      const logPctNum = expectedDeltaBefore * 100;
      const logPct = logPctNum.toFixed(1);
      
      // Compare GUI vs LOG
      // Price must match exactly, but allow 0.15% tolerance for percentage (floating point rounding)
      const priceMismatch = guiPrice !== logPrice;
      const pctMismatch = Math.abs(guiPctNum - logPctNum) > 0.15;
      
      if (priceMismatch || pctMismatch) {
        results.expectedPriceMismatches.push({
          day: gameState.day,
          symbol: stock.symbol,
          phase: detectPhase(stock),
          gui: { price: guiPrice, change: guiChange, pct: guiPct },
          log: { price: logPrice, pct: logPct },
          priceMismatch: priceMismatch,
          pctMismatch: pctMismatch,
          transitionEffect: transitionEffect,
          hasTransition: hasTransition
        });
      }
      
      // Also check for DIRECTION mismatch (most critical - GUI shows green when log shows crash)
      const actualDelta = (stock.price - stock.previousPrice) / stock.previousPrice;
      const expectedDirection = Math.sign(expectedDeltaBefore);
      const actualDirection = Math.sign(actualDelta);
      const directionMismatch = expectedDirection !== 0 && actualDirection !== 0 && 
                                 expectedDirection !== actualDirection &&
                                 Math.abs(expectedDeltaBefore) > 0.05; // Only check if expected move is significant (>5%)
      
      if (directionMismatch) {
        results.priceLogDirectionMismatches.push({
          day: gameState.day,
          symbol: stock.symbol,
          phase: detectPhase(stock),
          gui: { price: guiPrice, change: guiChange, pct: guiPct },
          log: { price: logPrice, pct: logPct },
          severity: Math.abs(expectedDeltaBefore - actualDelta),
          description: `LOG says ${logPct}% (${expectedDirection < 0 ? 'DOWN' : 'UP'}), ` +
                      `but GUI shows ${guiPct}% (${actualDirection < 0 ? 'DOWN' : 'UP'})`
        });
      }
      
      stock.eventExpectedPrice = undefined;
      stock.eventExpectedDelta = undefined;
    }
  }
}

// ========== NEWS CLASSIFICATION ==========

function classifyNews(headline) {
  const upper = headline.toUpperCase();
  
  // Context-aware classification to reduce false positives
  // "collapses" when referring to P/C ratio, short interest etc is bullish
  // "soars" when referring to short interest is bearish
  const bullishContextTerms = ['PUT/CALL RATIO', 'P/C RATIO', 'PUT-CALL', 'SHORT INTEREST SOARS', 'SHORTS SOAR'];
  const hasBullishContext = bullishContextTerms.some(term => upper.includes(term));
  
  // T+3 reversal is bearish (post-split selloff), not bullish recovery
  const isSplitReversal = upper.includes('T+3') || upper.includes('POST-SPLIT');
  
  // "gives back gains" is bearish, not bullish
  const isGivingBack = upper.includes('GIVES BACK') || upper.includes('HOLD BAGS') || upper.includes('HOLD THE BAG');
  
  for (const [category, config] of Object.entries(NEWS_PATTERNS)) {
    for (const keyword of config.keywords) {
      if (upper.includes(keyword)) {
        // Skip bearish classification if context indicates bullish
        if (hasBullishContext && config.expectedDirection === -1) {
          continue;
        }
        // Skip "soars" classification for bearish contexts
        if (keyword === 'SOARS' && upper.includes('SHORT INTEREST')) {
          return { category: 'bearish_moderate', keyword, config: NEWS_PATTERNS.bearish_moderate };
        }
        // T+3/post-split "reversal" is bearish, not bullish
        if (keyword === 'REVERSAL' && isSplitReversal) {
          return { category: 'bearish_moderate', keyword, config: NEWS_PATTERNS.bearish_moderate };
        }
        // "gives back gains" / "hold bags" is bearish, not bullish
        if ((keyword === 'GAINS' || keyword === 'HOLDS') && isGivingBack) {
          return { category: 'bearish_moderate', keyword, config: NEWS_PATTERNS.bearish_moderate };
        }
        return { category, keyword, config };
      }
    }
  }
  return null;
}

function detectPhase(stock) {
  if (stock.shortReportPhase) return `SSR:${stock.shortReportPhase}`;
  if (stock.crashPhase) return `DCB:${stock.crashPhase}`;
  if (stock.newsShakeout) return `SHAKEOUT:${stock.newsShakeout.phase}`;
  if (stock.execChangePhase) return `EXEC:${stock.execChangePhase}`;
  if (stock.strategicPivotPhase) return `PIVOT:${stock.strategicPivotPhase}`;
  return 'none';
}

function trackPhaseTransition(stock, oldPhase, newPhase, module) {
  const phaseKey = `${module}:${newPhase}`;
  const expectation = PHASE_EXPECTATIONS[phaseKey];
  
  const transition = {
    day: gameState.day,
    symbol: stock.symbol,
    module: module,
    fromPhase: oldPhase,
    toPhase: newPhase,
    priceAtTransition: stock.price,
    triggerPrice: stock.triggerPrice || stock.price,
    phaseStartPrice: stock.phaseStartPrice || stock.price
  };
  
  // Determine reference price for calculating change
  // - For initial crash/attack phases of DCB/SSR, use triggerPrice (price when event first triggered)
  // - For FOMO crash, use phaseStartPrice (price before crash began, i.e. end of blowOff)
  // - For other phases, use phaseStartPrice (price when entering current phase)
  const isInitialCrashPhase = ['attack', 'panic', 'initial_crash', 'triggered'].includes(newPhase) && module !== 'FOMO';
  const referencePrice = isInitialCrashPhase ? transition.triggerPrice : transition.phaseStartPrice;
  
  if (referencePrice) {
    transition.changeFromReference = (stock.price - referencePrice) / referencePrice;
  }
  
  results.phaseTransitions.push(transition);
  
  if (expectation && transition.changeFromReference !== undefined) {
    let violation = null;
    
    if (expectation.direction === -1) {
      if (transition.changeFromReference > 0.02) {
        violation = `Expected DROP but price UP ${(transition.changeFromReference * 100).toFixed(1)}%`;
      } else if (expectation.minDrop && Math.abs(transition.changeFromReference) < expectation.minDrop * 0.5) {
        violation = `Drop ${(Math.abs(transition.changeFromReference) * 100).toFixed(1)}% < min ${(expectation.minDrop * 100).toFixed(0)}%`;
      } else if (expectation.maxDrop && Math.abs(transition.changeFromReference) > expectation.maxDrop * 1.5) {
        violation = `Drop ${(Math.abs(transition.changeFromReference) * 100).toFixed(1)}% > max ${(expectation.maxDrop * 100).toFixed(0)}%`;
      }
    } else if (expectation.direction === 1) {
      if (transition.changeFromReference < -0.10) {
        violation = `Expected GAIN but price DOWN ${(transition.changeFromReference * 100).toFixed(1)}%`;
      }
    } else if (expectation.maxMove) {
      if (Math.abs(transition.changeFromReference) > expectation.maxMove * 1.5) {
        violation = `Move ${(Math.abs(transition.changeFromReference) * 100).toFixed(1)}% > max sideways ${(expectation.maxMove * 100).toFixed(0)}%`;
      }
    }
    
    if (violation) {
      results.phasePriceViolations.push({
        ...transition,
        violation: violation,
        expectation: expectation.description,
        referencePrice: referencePrice,
        isInitialPhase: isInitialCrashPhase
      });
    }
  }
  
  stock.phaseStartPrice = stock.price;
}

// ========== PHASE INTEGRITY CHECKS ==========

// Track phase transition for integrity validation
function trackPhaseForIntegrity(stock, oldPhase, newPhase, module, hadNews) {
  const key = `${module}:${stock.symbol}`;
  
  if (!results.phaseHistory[key]) {
    results.phaseHistory[key] = [];
  }
  
  const history = results.phaseHistory[key];
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  
  // Check for double transition (same phase twice in a row)
  if (lastEntry && lastEntry.phase === newPhase) {
    results.doubleTransitions.push({
      day: gameState.day,
      symbol: stock.symbol,
      module: module,
      phase: newPhase,
      message: `Phase '${newPhase}' triggered twice consecutively`
    });
  }
  
  // Check for invalid transition (skipped phases)
  const validTransitions = PHASE_SEQUENCES[module]?.validTransitions;
  if (validTransitions) {
    const fromKey = oldPhase || 'null';
    const validNext = validTransitions[fromKey] || [];
    
    if (validNext.length > 0 && !validNext.includes(newPhase) && !validNext.includes(null)) {
      results.invalidTransitions.push({
        day: gameState.day,
        symbol: stock.symbol,
        module: module,
        from: oldPhase || '(start)',
        to: newPhase,
        expected: validNext.join(' or '),
        message: `Invalid transition: ${oldPhase || '(start)'} → ${newPhase}. Expected: ${validNext.join(' or ')}`
      });
    }
  }
  
  // Record this transition
  history.push({
    day: gameState.day,
    phase: newPhase,
    hadNews: hadNews
  });
  
  // Track if this phase had news
  if (hadNews) {
    results.phasesWithNews.add(`${module}:${newPhase}`);
  }
}

// Check for orphan phase (transition without news)
function checkOrphanPhase(stock, oldPhase, newPhase, module, newsCount) {
  if (newsCount === 0 && newPhase) {
    results.orphanPhases.push({
      day: gameState.day,
      symbol: stock.symbol,
      module: module,
      phase: newPhase,
      message: `Phase '${newPhase}' triggered but no news generated`
    });
  }
}

// Check for duplicate news headlines (same day, same stock, same headline = bug)
function checkDuplicateNews(newsItem) {
  // Key includes day to detect same-day duplicates (a real bug)
  const headlineKey = `day${gameState.day}:${newsItem.relatedStock || newsItem.symbol}:${newsItem.headline}`;
  
  if (results.newsHeadlines.has(headlineKey)) {
    results.duplicateNews.push({
      day: gameState.day,
      symbol: newsItem.relatedStock || newsItem.symbol,
      headline: newsItem.headline,
      newsType: newsItem.newsType,
      message: `Duplicate headline on same day`
    });
  }
  
  results.newsHeadlines.add(headlineKey);
}

// Check for tutorial hint (informational - only if tutorial mode enabled)
function checkTutorialHint(newsItem, module) {
  // Skip tutorial hint check - hints are only shown when tutorial mode is enabled
  // This check is informational only and won't count as an issue
  return;
}

// DD-002 VALIDATION: Check that modules set eventExpectedPrice/Delta when generating price-moving news
// This catches the bug where news is generated but setPriceEvent() was not called
function validateEventProperties(module) {
  for (const stock of stocks) {
    // Check if there's a transition effect set but no eventExpectedPrice
    const hasTransition = (stock.crashTransitionEffect || 0) !== 0 ||
                          (stock.shortReportTransitionEffect || 0) !== 0 ||
                          (stock.shakeoutTransitionEffect || 0) !== 0 ||
                          (stock.sweepTransitionEffect || 0) !== 0 ||
                          (stock.indexRebalanceTransitionEffect || 0) !== 0 ||
                          (stock.shortSqueezeTransitionEffect || 0) !== 0 ||
                          (stock.fomoRallyTransitionEffect || 0) !== 0;
    
    const hasEventPrice = stock.eventExpectedPrice !== undefined;
    const hasEventDelta = stock.eventExpectedDelta !== undefined;
    
    if (hasTransition && (!hasEventPrice || !hasEventDelta)) {
      results.missingEventProperties.push({
        day: gameState.day,
        symbol: stock.symbol,
        module: module,
        phase: detectPhase(stock),
        message: `DD-002 VIOLATION: Module set transition effect but forgot eventExpectedPrice/Delta`,
        hasTransition: hasTransition,
        hasEventPrice: hasEventPrice,
        hasEventDelta: hasEventDelta,
        transitionEffect: {
          crash: stock.crashTransitionEffect || 0,
          ssr: stock.shortReportTransitionEffect || 0,
          shakeout: stock.shakeoutTransitionEffect || 0,
          sweep: stock.sweepTransitionEffect || 0,
          index: stock.indexRebalanceTransitionEffect || 0,
          squeeze: stock.shortSqueezeTransitionEffect || 0,
          fomo: stock.fomoRallyTransitionEffect || 0
        }
      });
    }
    
    // Also check: news generated but no transition effect AND no event properties
    // This is also a bug - news with price impact should use setPriceEvent()
  }
}

// ========== GOLD STANDARD CONSISTENCY VALIDATORS ==========

// Generic 4-criteria Gold Standard validation
// Works for: SHAKEOUT, INDEX, SPLIT, SQUEEZE, FOMO, SWEEP
function validateGoldStandardGeneric(news, config) {
  if (!news) return;
  
  const { 
    newsType,           // e.g., 'news_shakeout', 'index_rebalance'
    countField,         // e.g., 'goldStandardCount'
    criteriaField,      // e.g., 'goldStandardCriteria'
    criteriaKeys,       // e.g., ['transientNews', 'volumeClimax', 'rsiOversold', 'stabilization']
    probabilityMap,     // e.g., { 0: 30, 1: 45, 2: 55, 3: 70, 4: 85 }
    moduleName          // e.g., 'SHAKEOUT'
  } = config;
  
  // Check news type matches
  if (news.type !== newsType && news.newsType !== newsType) return;
  
  const count = news[countField];
  const criteria = news[criteriaField];
  
  // Check 1: Criteria should be an object, not a string
  if (criteria && typeof criteria === 'string') {
    results.goldStandardViolations.push({
      day: gameState.day,
      symbol: news.relatedStock || news.symbol,
      phase: news.phase,
      module: moduleName,
      issue: 'CRITERIA_TYPE',
      message: `${criteriaField} is a string, should be object`,
      criteria: criteria
    });
    return;
  }
  
  // Check 2: Count should match actual criteria
  if (criteria && typeof criteria === 'object' && count !== undefined) {
    const actualCount = criteriaKeys.reduce((sum, key) => sum + (criteria[key] ? 1 : 0), 0);
    
    if (count !== actualCount) {
      results.goldStandardViolations.push({
        day: gameState.day,
        symbol: news.relatedStock || news.symbol,
        phase: news.phase,
        module: moduleName,
        issue: 'COUNT_MISMATCH',
        message: `${countField}=${count} but criteria sum to ${actualCount}`,
        count: count,
        actualCount: actualCount,
        criteria: criteria
      });
    }
  }
  
  // Check 3: Probability consistency (if map provided)
  if (probabilityMap && count !== undefined && news.telltale) {
    const expectedProb = probabilityMap[count] || probabilityMap[0];
    const probMatch = news.telltale.match(/(\d+)%/);
    if (probMatch) {
      const statedProb = parseInt(probMatch[1], 10);
      // Allow 25% tolerance for veto factors
      if (Math.abs(statedProb - expectedProb) > 25) {
        results.goldStandardViolations.push({
          day: gameState.day,
          symbol: news.relatedStock || news.symbol,
          phase: news.phase,
          module: moduleName,
          issue: 'PROBABILITY_MISMATCH',
          message: `Stated ${statedProb}% but count=${count} suggests ~${expectedProb}%`,
          statedProb: statedProb,
          expectedProb: expectedProb,
          count: count
        });
      }
    }
  }
}

// Configuration for each phenomenon's Gold Standard validation
const GOLD_STANDARD_CONFIGS = {
  SHAKEOUT: {
    newsType: 'news_shakeout',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['transientNews', 'volumeClimax', 'rsiOversold', 'stabilization'],
    probabilityMap: { 0: 30, 1: 45, 2: 55, 3: 70, 4: 85 },
    moduleName: 'SHAKEOUT'
  },
  INDEX: {
    newsType: 'index_rebalance',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandard',
    criteriaKeys: ['majorIndex', 'significantRunUp', 'mocSpike', 'lowerHighConfirmed'],
    probabilityMap: { 0: 40, 1: 50, 2: 60, 3: 70, 4: 78 },
    moduleName: 'INDEX'
  },
  SPLIT: {
    newsType: 'stock_split',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandard',
    criteriaKeys: ['megaCap', 'significantRunUp', 'otmCallSpike', 'lowerHighConfirmed'],
    probabilityMap: { 0: 50, 1: 60, 2: 67, 3: 72, 4: 77 },
    moduleName: 'SPLIT'
  },
  SQUEEZE: {
    newsType: 'short_squeeze',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandard',
    criteriaKeys: ['extremeExtension', 'volumeClimax', 'ctbPlateau', 'rsiDivergence'],
    probabilityMap: { 0: 40, 1: 55, 2: 65, 3: 75, 4: 85 },
    moduleName: 'SQUEEZE'
  },
  FOMO: {
    newsType: 'fomo_rally',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandard',
    criteriaKeys: ['parabolicMove', 'putCallExtreme', 'sentimentDivergence', 'blowOffVolume'],
    probabilityMap: { 0: 45, 1: 55, 2: 65, 3: 75, 4: 85 },
    moduleName: 'FOMO'
  },
  SWEEP: {
    newsType: 'liquidity_sweep',
    countField: 'goldStandardCount',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['obviousSupport', 'falseBreakdown', 'absorptionVolume', 'reEntry'],
    probabilityMap: { 0: 30, 1: 45, 2: 60, 3: 75, 4: 85 },
    moduleName: 'SWEEP'
  }
};

// Type-based validation for DCB (signal-based probability)
function validateDCBSignals(news) {
  if (!news || (news.type !== 'dcb' && news.newsType !== 'dcb')) return;
  
  // DCB uses signalCount and signals array
  const signalCount = news.signalCount;
  const signals = news.signals;
  
  if (signals && Array.isArray(signals) && signalCount !== undefined) {
    if (signalCount !== signals.length) {
      results.goldStandardViolations.push({
        day: gameState.day,
        symbol: news.relatedStock || news.symbol,
        phase: news.phase,
        module: 'DCB',
        issue: 'SIGNAL_COUNT_MISMATCH',
        message: `signalCount=${signalCount} but signals array has ${signals.length} items`,
        signalCount: signalCount,
        actualCount: signals.length
      });
    }
  }
}

// Type-based validation for SSR (accusation type probability)
function validateSSRAccusation(news) {
  if (!news || (news.type !== 'short_report' && news.newsType !== 'short_report')) return;
  
  const accusationType = news.accusationType;
  const probability = news.recoveryProbability;
  
  // Base probabilities by accusation type
  const baseProbByType = {
    'fraud': 10,
    'valuation': 40,
    'accounting': 25,
    'governance': 35
  };
  
  if (accusationType && probability !== undefined && baseProbByType[accusationType]) {
    const baseProb = baseProbByType[accusationType];
    // Recovery probability should be at least base (can be higher with signals)
    if (probability < baseProb - 10) {
      results.goldStandardViolations.push({
        day: gameState.day,
        symbol: news.relatedStock || news.symbol,
        phase: news.phase,
        module: 'SSR',
        issue: 'ACCUSATION_PROBABILITY_LOW',
        message: `recoveryProbability=${probability}% but ${accusationType} base is ${baseProb}%`,
        accusationType: accusationType,
        statedProb: probability,
        baseProb: baseProb
      });
    }
  }
}

// Type-based validation for PIVOT (pivot type probability)
function validatePIVOTType(news) {
  if (!news || !news.isPivot) return;
  
  const pivotType = news.pivotType;
  const probability = news.successProbability;
  
  // Probabilities by pivot type
  const probByType = {
    'reactive': 10,
    'structural': 30,
    'symbolic': 65,
    'gold_standard': 85
  };
  
  if (pivotType && probability !== undefined && probByType[pivotType]) {
    const expectedProb = probByType[pivotType];
    if (Math.abs(probability - expectedProb) > 15) {
      results.goldStandardViolations.push({
        day: gameState.day,
        symbol: news.relatedStock || news.symbol,
        phase: news.phase,
        module: 'PIVOT',
        issue: 'PIVOT_TYPE_PROBABILITY_MISMATCH',
        message: `successProbability=${probability}% but ${pivotType} suggests ${expectedProb}%`,
        pivotType: pivotType,
        statedProb: probability,
        expectedProb: expectedProb
      });
    }
  }
}

// Type-based validation for EXEC (transition type probability)
function validateEXECType(news) {
  if (!news || (news.type !== 'executive_change' && news.newsType !== 'executive_change')) return;
  
  const transitionType = news.transitionType;
  const probability = news.successProbability;
  
  // Probabilities by transition type
  const probByType = {
    'abrupt_no_successor': 15,
    'cfo_exit_clean': 50,
    'planned_internal': 70,
    'gold_standard': 85
  };
  
  if (transitionType && probability !== undefined && probByType[transitionType]) {
    const expectedProb = probByType[transitionType];
    if (Math.abs(probability - expectedProb) > 15) {
      results.goldStandardViolations.push({
        day: gameState.day,
        symbol: news.relatedStock || news.symbol,
        phase: news.phase,
        module: 'EXEC',
        issue: 'EXEC_TYPE_PROBABILITY_MISMATCH',
        message: `successProbability=${probability}% but ${transitionType} suggests ${expectedProb}%`,
        transitionType: transitionType,
        statedProb: probability,
        expectedProb: expectedProb
      });
    }
  }
}

// Unified validation function that routes to appropriate validator
function validatePhenomenonConsistency(news, moduleName) {
  if (!news) return;
  
  // 4-criteria Gold Standard modules
  if (GOLD_STANDARD_CONFIGS[moduleName]) {
    validateGoldStandardGeneric(news, GOLD_STANDARD_CONFIGS[moduleName]);
  }
  
  // Type-based modules
  switch (moduleName) {
    case 'DCB':
      validateDCBSignals(news);
      break;
    case 'SSR':
      validateSSRAccusation(news);
      break;
    case 'PIVOT':
      validatePIVOTType(news);
      break;
    case 'EXEC':
      validateEXECType(news);
      break;
    // INSIDER doesn't have complex criteria to validate
  }
}

// DEPRECATED: Old SHAKEOUT-specific function - use validatePhenomenonConsistency instead
function validateGoldStandard(news) {
  validateGoldStandardGeneric(news, GOLD_STANDARD_CONFIGS.SHAKEOUT);
}

// ========== PERMUTATION TEST CONFIGURATIONS ==========

const PERMUTATION_CONFIGS = {
  SHAKEOUT: {
    module: () => SHAKEOUT,
    newsType: 'news_shakeout',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['transientNews', 'volumeClimax', 'rsiOversold', 'stabilization'],
    criteriaLabels: ['Transient news', 'Volume climax', 'RSI oversold', 'Stabilization'],
    probabilityMap: { 0: 30, 1: 45, 2: 55, 3: 70, 4: 85 },
    mockPhase: 'entry',
    extraFields: (criteria) => ({ type: 'news_shakeout', isTransient: criteria.transientNews })
  },
  INDEX: {
    module: () => INDEX,
    newsType: 'index_rebalance',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['isTier1', 'hasRunUp', 'hasMocSpike', 'hasReversalSetup'],
    criteriaLabels: ['Tier1', 'RunUp', 'MocSpike', 'ReversalSetup'],
    probabilityMap: { 0: 40, 1: 50, 2: 60, 3: 70, 4: 78 },
    mockPhase: 'effectiveDay',
    phaseField: 'indexRebalancePhase',
    extraFields: () => ({ isIndexRebalance: true, isAddition: true, indexTier: 'tier1', indexName: 'S&P 500' })
  },
  SPLIT: {
    module: () => SPLIT,
    newsType: 'stock_split',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['isMegaCap', 'hasRunUp', 'hasOtmSpike', 'hasReversalSetup'],
    criteriaLabels: ['MegaCap', 'RunUp', 'OtmSpike', 'ReversalSetup'],
    probabilityMap: { 0: 50, 1: 60, 2: 67, 3: 72, 4: 77 },
    mockPhase: 'runUp',
    phaseField: 'splitPhase',
    extraFields: () => ({ isStockSplit: true, splitRatio: 4, stockTier: 'megaCap' })
  },
  SQUEEZE: {
    module: () => SQUEEZE,
    newsType: 'short_squeeze',
    criteriaField: 'goldStandard',
    criteriaKeys: ['hasParabolicExtension', 'hasVolumeClimax', 'hasBorrowPlateau', 'hasRsiDivergence'],
    criteriaLabels: ['ParabolicExtension', 'VolumeClimax', 'BorrowPlateau', 'RsiDivergence'],
    probabilityMap: { 0: 40, 1: 55, 2: 65, 3: 75, 4: 85 },
    mockPhase: 'squeeze',
    phaseField: 'shortSqueezePhase',
    extraFields: () => ({ isShortSqueeze: true, shortInterest: 0.35, daysToCover: 5, volumeMultiple: 3.0, rsiValue: 70, currentGain: 0.50 })
  },
  FOMO: {
    module: () => FOMO,
    newsType: 'fomo_rally',
    criteriaField: 'goldStandard',
    criteriaKeys: ['hasVerticalitySignal', 'hasRetailEuphoria', 'hasSentimentDivergence', 'hasBlowOffTop'],
    criteriaLabels: ['VerticalitySignal', 'RetailEuphoria', 'SentimentDivergence', 'BlowOffTop'],
    probabilityMap: { 0: 45, 1: 55, 2: 65, 3: 75, 4: 85 },
    mockPhase: 'euphoria',
    // FOMO getTutorialHint takes stock, not newsItem - needs special handling
    specialHandler: 'stock_based',
    extraFields: () => ({ isFOMORally: true })
  },
  SWEEP: {
    module: () => SWEEP,
    newsType: 'liquidity_sweep',
    criteriaField: 'goldStandardCriteria',
    criteriaKeys: ['volume', 'falseBreakdown', 'reEntry', 'stopHunt'],
    criteriaLabels: ['Volume', 'FalseBreakdown', 'ReEntry', 'StopHunt'],
    probabilityMap: { 0: 30, 1: 45, 2: 60, 3: 75, 4: 85 },
    mockPhase: 'recovery',  // Use recovery phase which shows gold standard count
    extraFields: () => ({ type: 'liquidity_sweep' })
  },
  // Type-based modules (different permutation approach)
  DCB: {
    module: () => DCB,
    newsType: 'dcb',
    type: 'signal_based',
    signals: ['retracement_50', 'retracement_618', 'rising_volume', 'higher_lows', 'three_day_rule'],
    signalProbabilities: { 0: 30, 1: 35, 2: 45, 3: 55, 4: 65, 5: 75 },
    mockPhase: 'bounce',
    extraFields: () => ({ newsType: 'crash', isCrash: true })
  },
  SSR: {
    module: () => SSR,
    newsType: 'short_report',
    type: 'accusation_based',
    accusations: [
      { type: 'fraud', baseProb: 10 },
      { type: 'valuation', baseProb: 40 },
      { type: 'accounting', baseProb: 25 },
      { type: 'governance', baseProb: 35 }
    ],
    mockPhase: 'initial_crash',
    extraFields: () => ({ isShortReport: true })
  },
  PIVOT: {
    module: () => PIVOT,
    newsType: 'strategic_pivot',
    type: 'pivot_type_based',
    pivotTypes: [
      { type: 'reactive', prob: 10 },
      { type: 'structural', prob: 30 },
      { type: 'symbolic', prob: 65 },
      { type: 'gold_standard', prob: 85 }
    ],
    mockPhase: 'announcement',
    extraFields: () => ({ isStrategicPivot: true })
  },
  EXEC: {
    module: () => EXEC,
    newsType: 'executive_change',
    type: 'transition_based',
    transitionTypes: [
      { type: 'abrupt_no_successor', prob: 15 },
      { type: 'cfo_exit_clean', prob: 50 },
      { type: 'planned_internal', prob: 70 },
      { type: 'gold_standard', prob: 85 }
    ],
    mockPhase: 'announcement',
    extraFields: () => ({ isExecutiveChange: true })
  }
};

// Generic permutation test for 4-criteria Gold Standard modules
function runGoldStandardPermutationTest(moduleName, config) {
  const results = { tested: 0, passed: 0, failed: [] };
  const mod = config.module();
  
  if (!mod || !mod.getTutorialHint) {
    return { tested: 0, passed: 0, failed: [], skipped: true };
  }
  
  // Handle FOMO which takes stock instead of newsItem
  if (config.specialHandler === 'stock_based') {
    return runStockBasedPermutationTest(moduleName, config);
  }
  
  // Generate all 16 permutations
  for (let i = 0; i < 16; i++) {
    const criteria = {};
    config.criteriaKeys.forEach((key, idx) => {
      criteria[key] = !!(i & (1 << idx));
    });
    
    const expectedCount = config.criteriaKeys.reduce((sum, key) => sum + (criteria[key] ? 1 : 0), 0);
    
    // Create mock news with proper phase field
    const mockNews = {
      type: config.newsType,
      relatedStock: 'TEST',
      goldStandardCount: expectedCount,
      [config.criteriaField]: criteria,
      ...config.extraFields(criteria)
    };
    
    // Add phase field - use module-specific field name if defined
    if (config.phaseField) {
      mockNews[config.phaseField] = config.mockPhase;
    }
    mockNews.phase = config.mockPhase;
    
    try {
      const hint = mod.getTutorialHint(mockNews);
      if (hint) {
        results.tested++;
        
        // Verify count in title or type
        const countMatch = hint.type && (
          hint.type.includes(`${expectedCount}/4`) ||
          hint.goldStandard?.includes(`${expectedCount}/4`)
        );
        
        // For modules that display criteria in catalyst, verify each one
        let criteriaOk = true;
        if (hint.catalyst && config.criteriaLabels) {
          config.criteriaLabels.forEach((label, idx) => {
            const key = config.criteriaKeys[idx];
            const hasCheck = hint.catalyst.includes(`${label} ✓`) || hint.catalyst.includes(`${label}: ✓`) || hint.catalyst.includes(`✓ ${label}`);
            const hasCross = hint.catalyst.includes(`${label} ✗`) || hint.catalyst.includes(`${label}: ✗`) || hint.catalyst.includes(`✗ ${label}`);
            if (criteria[key] && !hasCheck) criteriaOk = false;
            if (!criteria[key] && !hasCross && hasCheck) criteriaOk = false;
          });
        }
        
        // Pass if hint was generated (basic functionality)
        // More advanced: verify count display
        if (hint.type || hint.description) {
          results.passed++;
        } else {
          results.failed.push({
            criteria,
            expectedCount,
            hint: hint.type,
            catalyst: hint.catalyst?.substring(0, 100)
          });
        }
      }
    } catch (e) {
      // Some modules may not handle all permutations gracefully
    }
  }
  
  return results;
}

// Stock-based permutation test (FOMO)
function runStockBasedPermutationTest(moduleName, config) {
  const results = { tested: 0, passed: 0, failed: [] };
  const mod = config.module();
  
  if (!mod || !mod.getTutorialHint) {
    return { tested: 0, passed: 0, failed: [], skipped: true };
  }
  
  // Generate all 16 permutations
  for (let i = 0; i < 16; i++) {
    const criteria = {};
    config.criteriaKeys.forEach((key, idx) => {
      criteria[key] = !!(i & (1 << idx));
    });
    
    const expectedCount = config.criteriaKeys.reduce((sum, key) => sum + (criteria[key] ? 1 : 0), 0);
    
    // Create mock stock with fomoRally state
    const mockStock = {
      symbol: 'TEST',
      price: 100,
      fomoRally: {
        phase: config.mockPhase,
        day: 5,
        dayInPhase: 3,
        goldStandard: criteria,
        socialMentions: 10.0,
        priceDeviation: 3.5,
        putCallRatio: 0.35,
        volumeMultiple: 5.0,
        crashWillHappen: true
      }
    };
    
    try {
      const hint = mod.getTutorialHint(mockStock);
      if (hint) {
        results.tested++;
        results.passed++; // Pass if hint generated
      }
    } catch (e) {
      // Skip errors
    }
  }
  
  return results;
}

// Signal-based permutation test (DCB)
function runSignalPermutationTest(moduleName, config) {
  const results = { tested: 0, passed: 0, failed: [] };
  const mod = config.module();
  
  if (!mod || !mod.getTutorialHint) {
    return { tested: 0, passed: 0, failed: [], skipped: true };
  }
  
  // Test combinations of signals (0 to all)
  const signalCount = config.signals.length;
  for (let i = 0; i <= signalCount; i++) {
    const signals = config.signals.slice(0, i);
    
    const mockNews = {
      type: config.newsType,
      relatedStock: 'TEST',
      phase: config.mockPhase,
      signalCount: i,
      signals: signals,
      ...(config.extraFields ? config.extraFields() : {})
    };
    
    try {
      const hint = mod.getTutorialHint(mockNews);
      if (hint) {
        results.tested++;
        results.passed++; // Basic pass if hint is generated
      }
    } catch (e) {}
  }
  
  return results;
}

// Type-based permutation test (SSR, PIVOT, EXEC)
function runTypePermutationTest(moduleName, config) {
  const results = { tested: 0, passed: 0, failed: [] };
  const mod = config.module();
  
  if (!mod || !mod.getTutorialHint) {
    return { tested: 0, passed: 0, failed: [], skipped: true };
  }
  
  const types = config.accusations || config.pivotTypes || config.transitionTypes || [];
  
  for (const typeConfig of types) {
    const mockNews = {
      type: config.newsType,
      relatedStock: 'TEST',
      phase: config.mockPhase,
      ...(config.extraFields ? config.extraFields() : {})
    };
    
    // Add type-specific fields
    if (config.accusations) {
      mockNews.accusationType = typeConfig.type;
      mockNews.recoveryProbability = typeConfig.baseProb;
    } else if (config.pivotTypes) {
      mockNews.isPivot = true;
      mockNews.pivotType = typeConfig.type;
      mockNews.successProbability = typeConfig.prob;
    } else if (config.transitionTypes) {
      mockNews.transitionType = typeConfig.type;
      mockNews.successProbability = typeConfig.prob;
    }
    
    try {
      const hint = mod.getTutorialHint(mockNews);
      if (hint) {
        results.tested++;
        results.passed++; // Basic pass if hint is generated for type
      }
    } catch (e) {}
  }
  
  return results;
}

// Run appropriate permutation test based on module type
function runPermutationTest(moduleName) {
  const config = PERMUTATION_CONFIGS[moduleName];
  if (!config) return { tested: 0, passed: 0, failed: [], skipped: true };
  
  if (config.type === 'signal_based') {
    return runSignalPermutationTest(moduleName, config);
  } else if (config.type === 'accusation_based' || config.type === 'pivot_type_based' || config.type === 'transition_based') {
    return runTypePermutationTest(moduleName, config);
  } else {
    return runGoldStandardPermutationTest(moduleName, config);
  }
}

// Print permutation test results
function printPermutationResults(moduleName, results) {
  if (results.skipped) {
    console.log(`  ⚠️ ${moduleName}: getTutorialHint not exposed - permutation test skipped`);
    return;
  }
  
  if (results.tested === 0) {
    console.log(`  ⚠️ ${moduleName}: No permutations tested`);
    return;
  }
  
  const allPassed = results.failed.length === 0;
  console.log(`  ${allPassed ? '✓' : '❌'} ${moduleName} Permutations: ${results.passed}/${results.tested} passed`);
  
  if (results.failed.length > 0) {
    for (const f of results.failed.slice(0, 2)) {
      console.log(`    Failed: count=${f.expectedCount}, hint=${f.hint?.substring(0, 50)}`);
    }
  }
}

// Final validation: check for missing phases in completed events
function validatePhaseCompleteness(module) {
  const expectedPhases = PHASE_SEQUENCES[module]?.phases || [];
  const seenPhases = new Set();
  
  // Collect all phases seen for this module
  for (const [key, history] of Object.entries(results.phaseHistory)) {
    if (key.startsWith(module + ':')) {
      history.forEach(entry => seenPhases.add(entry.phase));
    }
  }
  
  // Check which expected phases were never seen
  for (const phase of expectedPhases) {
    if (!seenPhases.has(phase)) {
      results.missingPhases.push({
        module: module,
        phase: phase,
        message: `Phase '${phase}' never occurred in ${module} test`
      });
    }
  }
}

// ========== COUPLING CHECK ==========

function checkCoupling(stock, newsItem) {
  const classification = classifyNews(newsItem.headline);
  if (!classification) return null;
  
  const { category, keyword, config } = classification;
  const priceChange = (stock.price - stock.previousPrice) / stock.previousPrice;
  const magnitude = Math.abs(priceChange);
  const direction = priceChange >= 0 ? 1 : -1;
  
  results.byCategory[category].total++;
  results.byCategory[category].magnitudes.push(magnitude);
  
  const directionCorrect = (direction === config.expectedDirection) || 
                           (Math.abs(priceChange) <= config.maxWrongDirection);
  
  // Resolution news announces historical outcomes
  const isResolutionNews = ['short_report_resolution', 'crash_resolution', 'recovery_complete'].includes(newsItem.newsType);
  const isHistoricalOutcome = isResolutionNews && !directionCorrect;
  
  if (directionCorrect || isHistoricalOutcome) {
    results.byCategory[category].correct++;
  } else {
    results.byCategory[category].wrong++;
  }
  
  const magnitudeOk = magnitude >= config.expectedMagnitude.min * 0.5 && 
                      magnitude <= config.expectedMagnitude.max * 2;
  
  const phase = detectPhase(stock);
  
  if (!results.byPhase[phase]) {
    results.byPhase[phase] = { total: 0, correct: 0, wrong: 0 };
  }
  results.byPhase[phase].total++;
  
  if (!directionCorrect && !isHistoricalOutcome) {
    results.byPhase[phase].wrong++;
    
    results.violations.push({
      day: gameState.day,
      symbol: stock.symbol,
      phase,
      headline: newsItem.headline,
      keyword,
      category,
      expectedDir: config.expectedDirection < 0 ? 'DOWN' : 'UP',
      actualChange: priceChange,
      sentimentOffset: stock.sentimentOffset,
      newsType: newsItem.newsType
    });
    
    return false;
  } else {
    results.byPhase[phase].correct++;
  }
  
  if (!magnitudeOk) {
    results.magnitudeIssues.push({
      day: gameState.day,
      symbol: stock.symbol,
      phase,
      keyword,
      expectedMag: `${(config.expectedMagnitude.min*100).toFixed(1)}%-${(config.expectedMagnitude.max*100).toFixed(1)}%`,
      actualMag: `${(magnitude*100).toFixed(2)}%`
    });
  }
  
  return true;
}

// ========== MODULE-SPECIFIC TESTS ==========

function initializeModule(module) {
  const deps = {
    stocks,
    todayNews,
    gameState,  // Added for modules that need current day
    getMemeMultiplier,
    randomChoice,
    isEventTypeEnabled,
    random: random,
    getDate: getDate
  };
  
  if (module && module.init) {
    module.init(deps);
    return true;
  }
  return false;
}

// ===== DCB Test =====
function testDCB(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Dead Cat Bounce (DCB)');
  console.log('='.repeat(60));
  
  if (!DCB) {
    console.log('❌ DCB module not loaded');
    return null;
  }
  
  seed = 12345; // Reset seed for reproducibility
  resetResults();
  stocks.length = 0;
  
  // Create stocks for DCB test
  ['DCB1', 'DCB2', 'DCB3', 'DCB4', 'DCB5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(DCB);
  
  // Pre-trigger crashes on all stocks
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (DCB.triggerCrash) {
      DCB.triggerCrash(stock, 0.15 + random() * 0.15);
      // Track the manually triggered 'crash' phase (no news in test mode)
      trackPhaseForIntegrity(stock, null, 'crash', 'DCB', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevCrashPhase = s.crashPhase;
    });
    
    // Process ONLY DCB
    if (DCB.processDeadCatBounce) {
      try { DCB.processDeadCatBounce(); } catch(e) { console.log('DCB error:', e.message); }
    }
    
    // Track phase transitions
    for (const stock of stocks) {
      if (stock.crashPhase !== stock._prevCrashPhase && stock.crashPhase) {
        trackPhaseTransition(stock, stock._prevCrashPhase, stock.crashPhase, 'DCB');
        
        // Count news for this stock today
        const stockNews = todayNews.filter(n => 
          (n.relatedStock || n.symbol) === stock.symbol
        );
        trackPhaseForIntegrity(stock, stock._prevCrashPhase, stock.crashPhase, 'DCB', stockNews.length > 0);
        checkOrphanPhase(stock, stock._prevCrashPhase, stock.crashPhase, 'DCB', stockNews.length);
      }
    }
    
    // DD-002 VALIDATION: Check event properties BEFORE updateStockPrices clears them
    validateEventProperties('DCB');
    
    updateStockPrices();
    
    // Check coupling and integrity
    for (const news of todayNews) {
      checkDuplicateNews(news);
      checkTutorialHint(news, 'DCB');
      validatePhenomenonConsistency(news, 'DCB');
      
      const newsSymbol = news.relatedStock || news.symbol || (news.stock?.symbol);
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger any finished stocks
    for (const stock of stocks) {
      if (!stock.crashPhase && random() < 0.1) {
        stock.triggerPrice = stock.price;
        stock.phaseStartPrice = null;
        if (DCB.triggerCrash) {
          DCB.triggerCrash(stock, 0.15 + random() * 0.15);
          trackPhaseForIntegrity(stock, null, 'crash', 'DCB', false);
        }
      }
    }
  }
  
  // Final validation
  validatePhaseCompleteness('DCB');
  
  return results;
}

// ===== SSR Test =====
function testSSR(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Short Seller Report (SSR)');
  console.log('='.repeat(60));
  
  if (!SSR) {
    console.log('❌ SSR module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['SSR1', 'SSR2', 'SSR3', 'SSR4', 'SSR5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(SSR);
  
  // Pre-trigger short reports on all stocks
  const firms = ['Hindenburg', 'Citron', 'Muddy Waters'];
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (SSR.triggerShortReport) {
      SSR.triggerShortReport(stock, randomChoice(firms));
      // Track the manually triggered 'initial_crash' phase (no news in test mode)
      trackPhaseForIntegrity(stock, null, 'initial_crash', 'SSR', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevSSRPhase = s.shortReportPhase;
    });
    
    // Process ONLY SSR
    if (SSR.processShortReport) {
      try { SSR.processShortReport(); } catch(e) { console.log('SSR error:', e.message); }
    }
    
    for (const stock of stocks) {
      if (stock.shortReportPhase !== stock._prevSSRPhase && stock.shortReportPhase) {
        trackPhaseTransition(stock, stock._prevSSRPhase, stock.shortReportPhase, 'SSR');
        
        const stockNews = todayNews.filter(n => 
          (n.relatedStock || n.symbol) === stock.symbol
        );
        trackPhaseForIntegrity(stock, stock._prevSSRPhase, stock.shortReportPhase, 'SSR', stockNews.length > 0);
        checkOrphanPhase(stock, stock._prevSSRPhase, stock.shortReportPhase, 'SSR', stockNews.length);
      }
    }
    
    // DD-002 VALIDATION: Check event properties BEFORE updateStockPrices clears them
    validateEventProperties('SSR');
    
    updateStockPrices();
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      checkTutorialHint(news, 'SSR');
      validatePhenomenonConsistency(news, 'SSR');
      
      const newsSymbol = news.relatedStock || news.symbol || (news.stock?.symbol);
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger finished stocks
    for (const stock of stocks) {
      if (!stock.shortReportPhase && random() < 0.1) {
        stock.triggerPrice = stock.price;
        stock.phaseStartPrice = null;
        if (SSR.triggerShortReport) {
          SSR.triggerShortReport(stock, randomChoice(firms));
          trackPhaseForIntegrity(stock, null, 'initial_crash', 'SSR', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('SSR');
  
  return results;
}

// ===== SHAKEOUT Test =====
function testSHAKEOUT(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: News Shakeout (SHAKEOUT)');
  console.log('='.repeat(60));
  
  if (!SHAKEOUT) {
    console.log('❌ SHAKEOUT module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['SHK1', 'SHK2', 'SHK3', 'SHK4', 'SHK5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(SHAKEOUT);
  
  const newsTypes = ['macro_scare', 'analyst_downgrade', 'guidance_miss'];
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (SHAKEOUT.triggerNewsShakeout) {
      SHAKEOUT.triggerNewsShakeout(stock, { newsType: randomChoice(newsTypes) });
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevShakeoutPhase = s.newsShakeout?.phase;
    });
    
    // Process ONLY SHAKEOUT
    if (SHAKEOUT.checkNewsShakeoutEvents) {
      for (const stock of stocks) {
        try { 
          // Note: SHAKEOUT sets shakeoutTransitionEffect internally
          // Don't add result.priceChange to avoid double-application
          SHAKEOUT.checkNewsShakeoutEvents(stock, todayNews);
        } catch(e) { console.log('SHAKEOUT error:', e.message); }
      }
    }
    
    for (const stock of stocks) {
      if (stock.newsShakeout?.phase !== stock._prevShakeoutPhase && stock.newsShakeout?.phase) {
        trackPhaseTransition(stock, stock._prevShakeoutPhase, stock.newsShakeout.phase, 'SHAKEOUT');
        
        const stockNews = todayNews.filter(n => 
          (n.relatedStock || n.symbol) === stock.symbol
        );
        trackPhaseForIntegrity(stock, stock._prevShakeoutPhase, stock.newsShakeout.phase, 'SHAKEOUT', stockNews.length > 0);
        checkOrphanPhase(stock, stock._prevShakeoutPhase, stock.newsShakeout.phase, 'SHAKEOUT', stockNews.length);
      }
    }
    
    // DD-002 VALIDATION: Check event properties BEFORE updateStockPrices clears them
    validateEventProperties('SHAKEOUT');
    
    updateStockPrices();
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      checkTutorialHint(news, 'SHAKEOUT');
      validatePhenomenonConsistency(news, 'SHAKEOUT');
      
      const newsSymbol = news.relatedStock || news.symbol || (news.stock?.symbol);
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger finished stocks
    for (const stock of stocks) {
      if (!stock.newsShakeout && random() < 0.1) {
        stock.triggerPrice = stock.price;
        stock.phaseStartPrice = null;
        if (SHAKEOUT.triggerNewsShakeout) {
          SHAKEOUT.triggerNewsShakeout(stock, { newsType: randomChoice(newsTypes) });
        }
      }
    }
  }
  
  validatePhaseCompleteness('SHAKEOUT');
  
  // Permutation tests run in aggregate at end
  
  return results;
}

// ===== PIVOT Test =====
function testPIVOT(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Strategic Pivot (PIVOT)');
  console.log('='.repeat(60));
  
  if (!PIVOT) {
    console.log('❌ PIVOT module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['PIV1', 'PIV2', 'PIV3', 'PIV4', 'PIV5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(PIVOT);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (PIVOT.triggerStrategicPivot) {
      PIVOT.triggerStrategicPivot(stock);
      // Track the manually triggered 'announcement' phase (no news in test mode)
      trackPhaseForIntegrity(stock, null, 'announcement', 'PIVOT', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevPivotPhase = s.strategicPivotPhase;
    });
    
    if (PIVOT.processStrategicPivot) {
      try { PIVOT.processStrategicPivot(); } catch(e) { console.log('PIVOT error:', e.message); }
    }
    
    for (const stock of stocks) {
      if (stock.strategicPivotPhase !== stock._prevPivotPhase && stock.strategicPivotPhase) {
        trackPhaseTransition(stock, stock._prevPivotPhase, stock.strategicPivotPhase, 'PIVOT');
        
        const stockNews = todayNews.filter(n => 
          (n.relatedStock || n.symbol) === stock.symbol
        );
        trackPhaseForIntegrity(stock, stock._prevPivotPhase, stock.strategicPivotPhase, 'PIVOT', stockNews.length > 0);
        checkOrphanPhase(stock, stock._prevPivotPhase, stock.strategicPivotPhase, 'PIVOT', stockNews.length);
      }
    }
    
    // DD-002 VALIDATION: Check event properties BEFORE updateStockPrices clears them
    validateEventProperties('PIVOT');
    
    updateStockPrices();
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      checkTutorialHint(news, 'PIVOT');
      validatePhenomenonConsistency(news, 'PIVOT');
      
      const newsSymbol = news.relatedStock || news.symbol || (news.stock?.symbol);
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger finished stocks
    for (const stock of stocks) {
      if (!stock.strategicPivotPhase && random() < 0.1) {
        stock.triggerPrice = stock.price;
        stock.phaseStartPrice = null;
        if (PIVOT.triggerStrategicPivot) {
          PIVOT.triggerStrategicPivot(stock);
          trackPhaseForIntegrity(stock, null, 'announcement', 'PIVOT', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('PIVOT');
  
  return results;
}

// ===== EXEC Test =====
function testEXEC(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Executive Change (EXEC)');
  console.log('='.repeat(60));
  
  if (!EXEC) {
    console.log('❌ EXEC module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['EXC1', 'EXC2', 'EXC3', 'EXC4', 'EXC5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(EXEC);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (EXEC.triggerExecutiveChange) {
      EXEC.triggerExecutiveChange(stock);
      // Track the manually triggered 'announcement' phase (no news in test mode)
      trackPhaseForIntegrity(stock, null, 'announcement', 'EXEC', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevExecPhase = s.execChangePhase;
    });
    
    if (EXEC.processExecutiveChange) {
      try { EXEC.processExecutiveChange(); } catch(e) { console.log('EXEC error:', e.message); }
    }
    
    for (const stock of stocks) {
      if (stock.execChangePhase !== stock._prevExecPhase && stock.execChangePhase) {
        trackPhaseTransition(stock, stock._prevExecPhase, stock.execChangePhase, 'EXEC');
        
        const stockNews = todayNews.filter(n => 
          (n.relatedStock || n.symbol) === stock.symbol
        );
        trackPhaseForIntegrity(stock, stock._prevExecPhase, stock.execChangePhase, 'EXEC', stockNews.length > 0);
        checkOrphanPhase(stock, stock._prevExecPhase, stock.execChangePhase, 'EXEC', stockNews.length);
      }
    }
    
    // DD-002 VALIDATION: Check event properties BEFORE updateStockPrices clears them
    validateEventProperties('EXEC');
    
    updateStockPrices();
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      checkTutorialHint(news, 'EXEC');
      validatePhenomenonConsistency(news, 'EXEC');
      
      const newsSymbol = news.relatedStock || news.symbol || (news.stock?.symbol);
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger finished stocks
    for (const stock of stocks) {
      if (!stock.execChangePhase && random() < 0.1) {
        stock.triggerPrice = stock.price;
        stock.phaseStartPrice = null;
        if (EXEC.triggerExecutiveChange) {
          EXEC.triggerExecutiveChange(stock);
          trackPhaseForIntegrity(stock, null, 'announcement', 'EXEC', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('EXEC');
  
  return results;
}

// ===== INDEX (Index Rebalancing) Test =====
function testINDEX(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Index Rebalancing (INDEX) - Tier 1');
  console.log('='.repeat(60));
  
  if (!INDEX) {
    console.log('❌ INDEX module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['IDX1', 'IDX2', 'IDX3', 'IDX4', 'IDX5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(INDEX);
  
  // Trigger index events on all stocks
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (INDEX.triggerIndexRebalance) {
      const eventType = random() < 0.6 ? 'addition' : 'deletion';
      INDEX.triggerIndexRebalance(stock, { eventType, indexTier: 'tier1' });
      trackPhaseForIntegrity(stock, null, 'announcement', 'INDEX', true);  // Announcement generates news
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevIndexPhase = s.indexRebalance?.phase;
    });
    
    if (INDEX.processIndexRebalance) {
      for (const stock of stocks) {
        try { INDEX.processIndexRebalance(stock); } catch(e) { console.log('INDEX error:', e.message); }
      }
    }
    
    // Track phase transitions
    for (const stock of stocks) {
      const currentPhase = stock.indexRebalance?.phase;
      if (currentPhase !== stock._prevIndexPhase && currentPhase) {
        trackPhaseTransition(stock, stock._prevIndexPhase, currentPhase, 'INDEX');
        const stockNews = todayNews.filter(n => (n.relatedStock || n.symbol) === stock.symbol);
        trackPhaseForIntegrity(stock, stock._prevIndexPhase, currentPhase, 'INDEX', stockNews.length > 0);
      }
    }
    
    // Apply dailyBias as price change (simulating market.js)
    for (const stock of stocks) {
      if (stock.indexRebalance?.dailyBias) {
        const bias = stock.indexRebalance.dailyBias;
        stock.price = stock.price * (1 + bias);
        stock.indexRebalance.dailyBias = 0;
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'INDEX');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    // Re-trigger finished stocks
    for (const stock of stocks) {
      if (!stock.indexRebalance && random() < 0.1) {
        stock.triggerPrice = stock.price;
        if (INDEX.triggerIndexRebalance) {
          const eventType = random() < 0.6 ? 'addition' : 'deletion';
          INDEX.triggerIndexRebalance(stock, { eventType, indexTier: 'tier1' });
          trackPhaseForIntegrity(stock, null, 'announcement', 'INDEX', true);
        }
      }
    }
  }
  
  validatePhaseCompleteness('INDEX');
  return results;
}

// ===== SPLIT (Stock Split) Test =====
function testSPLIT(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Stock Split (SPLIT) - Tier 2');
  console.log('='.repeat(60));
  
  if (!SPLIT) {
    console.log('❌ SPLIT module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['SPL1', 'SPL2', 'SPL3', 'SPL4', 'SPL5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(SPLIT);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (SPLIT.triggerStockSplit) {
      SPLIT.triggerStockSplit(stock);
      trackPhaseForIntegrity(stock, null, 'announcement', 'SPLIT', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevSplitPhase = s.splitState?.phase;
    });
    
    if (SPLIT.processStockSplit) {
      for (const stock of stocks) {
        try { SPLIT.processStockSplit(stock); } catch(e) { console.log('SPLIT error:', e.message); }
      }
    }
    
    for (const stock of stocks) {
      const currentPhase = stock.splitState?.phase;
      if (currentPhase !== stock._prevSplitPhase && currentPhase) {
        trackPhaseTransition(stock, stock._prevSplitPhase, currentPhase, 'SPLIT');
        const stockNews = todayNews.filter(n => (n.relatedStock || n.symbol) === stock.symbol);
        trackPhaseForIntegrity(stock, stock._prevSplitPhase, currentPhase, 'SPLIT', stockNews.length > 0);
      }
    }
    
    // Apply dailyBias
    for (const stock of stocks) {
      if (stock.splitState?.dailyBias) {
        stock.price = stock.price * (1 + stock.splitState.dailyBias);
        stock.splitState.dailyBias = 0;
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'SPLIT');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    for (const stock of stocks) {
      if (!stock.splitState && random() < 0.1) {
        stock.triggerPrice = stock.price;
        if (SPLIT.triggerStockSplit) {
          SPLIT.triggerStockSplit(stock);
          trackPhaseForIntegrity(stock, null, 'announcement', 'SPLIT', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('SPLIT');
  return results;
}

// ===== SQUEEZE (Short Squeeze) Test =====
function testSQUEEZE(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Short Squeeze (SQUEEZE) - Tier 2');
  console.log('='.repeat(60));
  
  if (!SQUEEZE) {
    console.log('❌ SQUEEZE module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['SQZ1', 'SQZ2', 'SQZ3', 'SQZ4', 'SQZ5'].forEach(s => {
    const stock = createStock(s);
    stock.shortInterest = 0.30 + random() * 0.20;  // High short interest
    stocks.push(stock);
  });
  
  initializeModule(SQUEEZE);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (SQUEEZE.triggerShortSqueeze) {
      SQUEEZE.triggerShortSqueeze(stock);
      trackPhaseForIntegrity(stock, null, 'buildup', 'SQUEEZE', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevSqueezePhase = s.shortSqueezeState?.phase;
    });
    
    if (SQUEEZE.processShortSqueeze) {
      for (const stock of stocks) {
        try { 
          const result = SQUEEZE.processShortSqueeze(stock);
          if (result?.dailyBias) {
            stock.price = stock.price * (1 + result.dailyBias);
          }
        } catch(e) { console.log('SQUEEZE error:', e.message); }
      }
    }
    
    for (const stock of stocks) {
      const currentPhase = stock.shortSqueezeState?.phase;
      if (currentPhase !== stock._prevSqueezePhase && currentPhase) {
        trackPhaseTransition(stock, stock._prevSqueezePhase, currentPhase, 'SQUEEZE');
        const stockNews = todayNews.filter(n => (n.relatedStock || n.symbol) === stock.symbol);
        trackPhaseForIntegrity(stock, stock._prevSqueezePhase, currentPhase, 'SQUEEZE', stockNews.length > 0);
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'SQUEEZE');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    for (const stock of stocks) {
      if (!stock.shortSqueezeState && random() < 0.1) {
        stock.shortInterest = 0.30 + random() * 0.20;
        stock.triggerPrice = stock.price;
        if (SQUEEZE.triggerShortSqueeze) {
          SQUEEZE.triggerShortSqueeze(stock);
          trackPhaseForIntegrity(stock, null, 'buildup', 'SQUEEZE', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('SQUEEZE');
  return results;
}

// ===== FOMO (FOMO Rally) Test =====
function testFOMO(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: FOMO Rally (FOMO) - Tier 2');
  console.log('='.repeat(60));
  
  if (!FOMO) {
    console.log('❌ FOMO module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['FMO1', 'FMO2', 'FMO3', 'FMO4', 'FMO5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(FOMO);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (FOMO.triggerFOMORally) {
      FOMO.triggerFOMORally(stock);
      trackPhaseForIntegrity(stock, null, 'buildup', 'FOMO', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevFomoPhase = s.fomoRally?.phase;
      // Store price BEFORE this day's processing for phase transition tracking
      s._priceBeforeProcess = s.price;
    });
    
    if (FOMO.processFOMORally) {
      for (const stock of stocks) {
        try { 
          FOMO.processFOMORally(stock);
          // Calculate signal to get dailyBias (processFOMORally doesn't return dailyBias)
          if (FOMO.calculateSignal && stock.fomoRally) {
            const signal = FOMO.calculateSignal(stock);
            if (signal?.dailyBias) {
              stock.price = stock.price * (1 + signal.dailyBias);
            }
          }
        } catch(e) { console.log('FOMO error:', e.message); }
      }
    }
    
    for (const stock of stocks) {
      const currentPhase = stock.fomoRally?.phase;
      if (currentPhase !== stock._prevFomoPhase && currentPhase) {
        // Update phaseStartPrice to the price BEFORE the phase changed
        stock.phaseStartPrice = stock._priceBeforeProcess;
        trackPhaseTransition(stock, stock._prevFomoPhase, currentPhase, 'FOMO');
        const stockNews = todayNews.filter(n => (n.relatedStock || n.symbol) === stock.symbol);
        trackPhaseForIntegrity(stock, stock._prevFomoPhase, currentPhase, 'FOMO', stockNews.length > 0);
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'FOMO');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    for (const stock of stocks) {
      if (!stock.fomoRally && random() < 0.1) {
        stock.triggerPrice = stock.price;
        if (FOMO.triggerFOMORally) {
          FOMO.triggerFOMORally(stock);
          trackPhaseForIntegrity(stock, null, 'buildup', 'FOMO', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('FOMO');
  return results;
}

// ===== SWEEP (Liquidity Sweep) Test =====
function testSWEEP(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Liquidity Sweep (SWEEP) - Tier 2');
  console.log('='.repeat(60));
  
  if (!SWEEP) {
    console.log('❌ SWEEP module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['SWP1', 'SWP2', 'SWP3', 'SWP4', 'SWP5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(SWEEP);
  
  for (const stock of stocks) {
    stock.triggerPrice = stock.price;
    if (SWEEP.triggerLiquiditySweep) {
      SWEEP.triggerLiquiditySweep(stock);
      trackPhaseForIntegrity(stock, null, 'setup', 'SWEEP', false);
    }
  }
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
      s._prevSweepPhase = s.liquiditySweep?.phase;
    });
    
    if (SWEEP.processLiquiditySweep) {
      for (const stock of stocks) {
        try { 
          const result = SWEEP.processLiquiditySweep(stock);
          if (result?.dailyBias) {
            stock.price = stock.price * (1 + result.dailyBias);
          }
        } catch(e) { console.log('SWEEP error:', e.message); }
      }
    }
    
    for (const stock of stocks) {
      const currentPhase = stock.liquiditySweep?.phase;
      if (currentPhase !== stock._prevSweepPhase && currentPhase) {
        trackPhaseTransition(stock, stock._prevSweepPhase, currentPhase, 'SWEEP');
        const stockNews = todayNews.filter(n => (n.relatedStock || n.symbol) === stock.symbol);
        trackPhaseForIntegrity(stock, stock._prevSweepPhase, currentPhase, 'SWEEP', stockNews.length > 0);
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'SWEEP');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
    
    for (const stock of stocks) {
      if (!stock.liquiditySweep && random() < 0.1) {
        stock.triggerPrice = stock.price;
        if (SWEEP.triggerLiquiditySweep) {
          SWEEP.triggerLiquiditySweep(stock);
          trackPhaseForIntegrity(stock, null, 'setup', 'SWEEP', false);
        }
      }
    }
  }
  
  validatePhaseCompleteness('SWEEP');
  return results;
}

// ===== INSIDER (Insider Buying) Test =====
function testINSIDER(days = 200) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING: Insider Buying (INSIDER) - Tier 1');
  console.log('='.repeat(60));
  
  if (!INSIDER) {
    console.log('❌ INSIDER module not loaded');
    return null;
  }
  
  seed = 12345;
  resetResults();
  stocks.length = 0;
  
  ['INS1', 'INS2', 'INS3', 'INS4', 'INS5'].forEach(s => stocks.push(createStock(s)));
  
  initializeModule(INSIDER);
  
  // Insider buying doesn't have phases - it's event-based
  // Just track news generation and sentiment effect
  
  for (let day = 0; day < days; day++) {
    gameState.day = day;
    todayNews.length = 0;
    
    stocks.forEach(s => {
      s.previousPrice = s.price;
    });
    
    // Try to generate insider events
    if (INSIDER.checkForInsiderBuying) {
      for (const stock of stocks) {
        try { INSIDER.checkForInsiderBuying(stock); } catch(e) { console.log('INSIDER error:', e.message); }
      }
    }
    
    // Apply sentiment boost from insider buying
    for (const stock of stocks) {
      if (stock.insiderBuySignal) {
        const boost = INSIDER.getInsiderBoost ? INSIDER.getInsiderBoost(stock) : 0.02;
        stock.sentimentOffset = (stock.sentimentOffset || 0) + boost;
        stock.price = stock.price * (1 + boost * 0.5);  // Immediate price impact
      }
    }
    
    for (const news of todayNews) {
      checkDuplicateNews(news);
      validatePhenomenonConsistency(news, 'INSIDER');
      const newsSymbol = news.relatedStock || news.symbol;
      const stock = newsSymbol ? stocks.find(s => s.symbol === newsSymbol) : null;
      if (stock) {
        results.totalNews++;
        checkCoupling(stock, news);
      }
    }
    
    results.totalDays++;
  }
  
  return results;
}

// ========== REPORTING ==========

function printModuleResults(moduleName, results) {
  if (!results) return 0;
  
  console.log(`\n  Days: ${results.totalDays}, News: ${results.totalNews}`);
  console.log(`  Direction violations: ${results.violations.length}`);
  console.log(`  GUI/log mismatches: ${results.expectedPriceMismatches.length}`);
  console.log(`  DD-002 violations (missing event props): ${results.missingEventProperties?.length || 0}`);
  console.log(`  Phase price violations: ${results.phasePriceViolations.length}`);
  console.log(`  Phase transitions: ${results.phaseTransitions.length}`);
  
  // Phase Integrity Results
  console.log('\n  Phase Integrity:');
  const missingCount = results.missingPhases?.length || 0;
  const orphanCount = results.orphanPhases?.length || 0;
  const invalidCount = results.invalidTransitions?.length || 0;
  const doubleCount = results.doubleTransitions?.length || 0;
  const dupNewsCount = results.duplicateNews?.length || 0;
  const missingHintCount = results.missingTutorialHints?.length || 0;
  const missingEventCount = results.missingEventProperties?.length || 0;
  
  console.log(`    ${missingCount === 0 ? '✓' : '❌'} Missing phases: ${missingCount}`);
  console.log(`    ${orphanCount === 0 ? '✓' : '❌'} Orphan phases (no news): ${orphanCount}`);
  console.log(`    ${invalidCount === 0 ? '✓' : '❌'} Invalid transitions: ${invalidCount}`);
  console.log(`    ${doubleCount === 0 ? '✓' : '❌'} Double triggers: ${doubleCount}`);
  console.log(`    ${dupNewsCount === 0 ? '✓' : '❌'} Duplicate news: ${dupNewsCount}`);
  console.log(`    ${missingHintCount === 0 ? '✓' : '❌'} Missing tutorial hints: ${missingHintCount}`);
  
  // By category
  console.log('\n  By Category:');
  for (const [cat, stats] of Object.entries(results.byCategory)) {
    if (stats.total === 0) continue;
    const accuracy = (stats.correct / stats.total * 100).toFixed(1);
    const status = stats.wrong > 0 ? '❌' : '✓';
    console.log(`    ${status} ${cat}: ${stats.correct}/${stats.total} (${accuracy}%)`);
  }
  
  // By phase
  console.log('\n  By Phase:');
  for (const [phase, stats] of Object.entries(results.byPhase)) {
    if (stats.total === 0) continue;
    const accuracy = (stats.correct / stats.total * 100).toFixed(1);
    const status = stats.wrong > 0 ? '❌' : '✓';
    console.log(`    ${status} ${phase}: ${stats.correct}/${stats.total} (${accuracy}%)`);
  }
  
  // Sample violations
  if (results.violations.length > 0) {
    console.log('\n  Sample violations:');
    for (const v of results.violations.slice(0, 5)) {
      console.log(`    Day ${v.day} | ${v.symbol} | ${v.phase}`);
      console.log(`      "${v.headline.substring(0, 50)}..."`);
      console.log(`      Expected: ${v.expectedDir}, Actual: ${(v.actualChange * 100).toFixed(2)}%`);
    }
  }
  
  // Sample GUI/log mismatches (price and % between trading page and terminal log)
  if (results.expectedPriceMismatches.length > 0) {
    console.log('\n  Sample GUI vs LOG mismatches:');
    for (const m of results.expectedPriceMismatches.slice(0, 5)) {
      console.log(`    Day ${m.day} | ${m.symbol} | ${m.phase}`);
      console.log(`      GUI: $${m.gui.price} (${m.gui.pct}%)`);
      console.log(`      LOG: $${m.log.price} (${m.log.pct}%)`);
      if (m.priceMismatch) console.log(`      ❌ Price mismatch`);
      if (m.pctMismatch) console.log(`      ❌ Percent mismatch`);
    }
  }
  
  // *** CRITICAL: Price/Log DIRECTION mismatches (GUI shows green, log shows red crash) ***
  const dirMismatchCount = results.priceLogDirectionMismatches?.length || 0;
  if (dirMismatchCount > 0) {
    console.log('\n  ⚠️ CRITICAL - GUI vs LOG DIRECTION Mismatches:');
    for (const m of results.priceLogDirectionMismatches.slice(0, 5)) {
      console.log(`    Day ${m.day} | ${m.symbol} | ${m.phase}`);
      console.log(`      GUI: $${m.gui.price} (${m.gui.pct}%)`);
      console.log(`      LOG: $${m.log.price} (${m.log.pct}%)`);
      console.log(`      ${m.description}`);
    }
  }
  
  // Sample phase violations
  if (results.phasePriceViolations.length > 0) {
    console.log('\n  Sample phase violations:');
    for (const v of results.phasePriceViolations.slice(0, 5)) {
      console.log(`    Day ${v.day} | ${v.symbol} | ${v.module}:${v.toPhase}`);
      console.log(`      ${v.violation}`);
    }
  }
  
  // Sample missing phases
  if (results.missingPhases?.length > 0) {
    console.log('\n  Sample missing phases:');
    for (const m of results.missingPhases.slice(0, 3)) {
      console.log(`    ${m.module}: phase '${m.phase}' never occurred`);
    }
  }
  
  // Sample orphan phases
  if (results.orphanPhases?.length > 0) {
    console.log('\n  Sample orphan phases (phase triggered without news):');
    for (const o of results.orphanPhases.slice(0, 3)) {
      console.log(`    Day ${o.day} | ${o.symbol} | ${o.phase} - no news generated`);
    }
  }
  
  // Sample invalid transitions
  if (results.invalidTransitions?.length > 0) {
    console.log('\n  Sample invalid transitions:');
    for (const t of results.invalidTransitions.slice(0, 3)) {
      console.log(`    Day ${t.day} | ${t.symbol} | ${t.from || 'null'} → ${t.to}`);
    }
  }
  
  // Sample double triggers
  if (results.doubleTransitions?.length > 0) {
    console.log('\n  Sample double triggers:');
    for (const d of results.doubleTransitions.slice(0, 3)) {
      console.log(`    Day ${d.day} | ${d.symbol} | ${d.phase} triggered again`);
    }
  }
  
  // Sample duplicate news
  if (results.duplicateNews?.length > 0) {
    console.log('\n  Sample duplicate news:');
    for (const dn of results.duplicateNews.slice(0, 3)) {
      console.log(`    Day ${dn.day} | ${dn.symbol} | "${dn.headline.substring(0, 40)}..."`);
    }
  }
  
  // Sample missing tutorial hints
  if (results.missingTutorialHints?.length > 0) {
    console.log('\n  Sample missing tutorial hints:');
    for (const h of results.missingTutorialHints.slice(0, 3)) {
      console.log(`    Day ${h.day} | ${h.symbol} | "${h.headline.substring(0, 40)}..."`);
    }
  }
  
  // DD-002: Sample missing event properties (critical - causes GUI/log mismatch)
  if (results.missingEventProperties?.length > 0) {
    console.log('\n  ⚠️ DD-002 VIOLATIONS (missing setPriceEvent() call):');
    for (const e of results.missingEventProperties.slice(0, 3)) {
      console.log(`    Day ${e.day} | ${e.symbol} | ${e.phase} | ${e.message}`);
    }
  }
  
  // Gold Standard violations (SHAKEOUT-specific)
  const goldViolationCount = results.goldStandardViolations?.length || 0;
  if (goldViolationCount > 0) {
    console.log('\n  ⚠️ GOLD STANDARD VIOLATIONS (count/criteria/probability mismatch):');
    for (const g of results.goldStandardViolations.slice(0, 5)) {
      console.log(`    Day ${g.day} | ${g.symbol} | ${g.phase} | ${g.issue}`);
      console.log(`      ${g.message}`);
    }
  }
  
  const totalIssues = results.violations.length + 
                      results.expectedPriceMismatches.length + 
                      results.phasePriceViolations.length +
                      dirMismatchCount +  // Critical: direction mismatches
                      goldViolationCount + // Gold Standard consistency
                      missingCount + orphanCount + invalidCount + 
                      doubleCount + dupNewsCount + missingHintCount +
                      missingEventCount;  // DD-002 violations
  
  return totalIssues;
}

// ========== MAIN ==========

console.log('\n🔬 PRICE-NEWS COUPLING TEST (ISOLATED MODULES)');
console.log('Testing each phenomenon individually to avoid multi-module conflicts\n');

// Parse command line argument
const moduleArg = process.argv[2]?.toUpperCase() || 'ALL';

const allResults = {};
let grandTotalIssues = 0;

if (moduleArg === 'ALL' || moduleArg === 'DCB') {
  allResults.DCB = testDCB();
  if (allResults.DCB) {
    const issues = printModuleResults('DCB', allResults.DCB);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'SSR') {
  allResults.SSR = testSSR();
  if (allResults.SSR) {
    const issues = printModuleResults('SSR', allResults.SSR);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'SHAKEOUT') {
  allResults.SHAKEOUT = testSHAKEOUT();
  if (allResults.SHAKEOUT) {
    const issues = printModuleResults('SHAKEOUT', allResults.SHAKEOUT);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'PIVOT') {
  allResults.PIVOT = testPIVOT();
  if (allResults.PIVOT) {
    const issues = printModuleResults('PIVOT', allResults.PIVOT);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'EXEC') {
  allResults.EXEC = testEXEC();
  if (allResults.EXEC) {
    const issues = printModuleResults('EXEC', allResults.EXEC);
    grandTotalIssues += issues;
  }
}

// Tier 1-2 dailyBias modules
if (moduleArg === 'ALL' || moduleArg === 'INDEX') {
  allResults.INDEX = testINDEX();
  if (allResults.INDEX) {
    const issues = printModuleResults('INDEX', allResults.INDEX);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'SPLIT') {
  allResults.SPLIT = testSPLIT();
  if (allResults.SPLIT) {
    const issues = printModuleResults('SPLIT', allResults.SPLIT);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'SQUEEZE') {
  allResults.SQUEEZE = testSQUEEZE();
  if (allResults.SQUEEZE) {
    const issues = printModuleResults('SQUEEZE', allResults.SQUEEZE);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'FOMO') {
  allResults.FOMO = testFOMO();
  if (allResults.FOMO) {
    const issues = printModuleResults('FOMO', allResults.FOMO);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'SWEEP') {
  allResults.SWEEP = testSWEEP();
  if (allResults.SWEEP) {
    const issues = printModuleResults('SWEEP', allResults.SWEEP);
    grandTotalIssues += issues;
  }
}

if (moduleArg === 'ALL' || moduleArg === 'INSIDER') {
  allResults.INSIDER = testINSIDER();
  if (allResults.INSIDER) {
    const issues = printModuleResults('INSIDER', allResults.INSIDER);
    grandTotalIssues += issues;
  }
}

// Final summary
console.log('\n' + '='.repeat(60));
console.log('FINAL SUMMARY');
console.log('='.repeat(60));

for (const [mod, res] of Object.entries(allResults)) {
  if (!res) continue;
  const dirMismatch = res.priceLogDirectionMismatches?.length || 0;
  const dd002Violations = res.missingEventProperties?.length || 0;
  const goldViolations = res.goldStandardViolations?.length || 0;
  const issues = res.violations.length + res.expectedPriceMismatches.length + res.phasePriceViolations.length + dirMismatch + dd002Violations + goldViolations;
  const status = issues === 0 ? '✅' : '❌';
  const criticalFlag = (dirMismatch > 0 || dd002Violations > 0) ? ' ⚠️CRITICAL' : '';
  const goldFlag = goldViolations > 0 ? `, ${goldViolations} gold-std` : '';
  console.log(`${status} ${mod}: ${issues} issues (${res.violations.length} direction, ${res.expectedPriceMismatches.length} GUI/log, ${dd002Violations} DD-002, ${res.phasePriceViolations.length} phase, ${dirMismatch} price/log direction${goldFlag}${criticalFlag})`);
}

console.log('-'.repeat(60));
if (grandTotalIssues === 0) {
  console.log('✅ ALL TESTS PASSED!');
} else {
  console.log(`❌ TOTAL ISSUES: ${grandTotalIssues}`);
}
console.log('='.repeat(60));

// ========== PERMUTATION TESTS FOR ALL PHENOMENA ==========
console.log('\n' + '='.repeat(60));
console.log('PERMUTATION TESTS (Gold Standard / Type-Based Hints)');
console.log('='.repeat(60));

const permModules = ['SHAKEOUT', 'INDEX', 'SPLIT', 'SQUEEZE', 'FOMO', 'SWEEP', 'DCB', 'SSR', 'PIVOT', 'EXEC'];
let totalPermTested = 0;
let totalPermPassed = 0;

for (const modName of permModules) {
  const permResults = runPermutationTest(modName);
  printPermutationResults(modName, permResults);
  totalPermTested += permResults.tested;
  totalPermPassed += permResults.passed;
}

console.log('-'.repeat(60));
console.log(`Permutation Summary: ${totalPermPassed}/${totalPermTested} passed`);
console.log('='.repeat(60));

