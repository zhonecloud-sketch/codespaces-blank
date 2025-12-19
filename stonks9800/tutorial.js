// Tutorial Mode - Educational hints embedded in news items
// When Tutorial Mode is ON, each news item shows Type, Description, Implication, and Action

// ========== DETAILED TRADING HINTS FOR TIER 1-2 EVENTS ==========
// These provide specific, actionable guidance for educational purposes
const DETAILED_TRADING_HINTS = {
  // ==================== TIER 1: HIGHEST EDUCATIONAL VALUE ====================
  
  // === SHORT SELLER REPORT ===
  shortSellerReport: {
    name: 'Short Seller Report Attack',
    tier: 1,
    telltales: [
      '💣 News mentioning "Hindenburg", "Muddy Waters", "Iceberg", "Viceroy" + fraud/accounting allegations',
      '📉 Immediate -25% to -40% price drop in single day',
      '📊 Stock previously had no issues - attack comes out of nowhere',
      '🔍 Look for "Part 2" or "follow-up" reports = more waves coming'
    ],
    nlpFilter: {
      title: '📰 SHORT REPORT HARD INFO KEYWORDS (Loughran & McDonald 2011)',
      hardKeywords: ['Exposed', 'Phantom', 'Fabricated', 'Investigation', 'Whistleblower', 'Audit', 'SEC', 'Restatement'],
      hardExplained: 'Reports using specific ACCOUNTING TERMS and % claims = HARD INFO = permanent damage (90% no reversal)',
      verbs: 'Active/Aggressive verbs: "Exposed," "Fabricated," "Inflated" = Fundamental Integrity Shock',
      goldStandard: '🏆 SSR Gold Standard (Reversal): Point-by-point DATA rebuttal OR Big 4 Auditor (Deloitte/PwC/EY/KPMG) confirms books',
      trapExample: '❌ TRAP: Generic denial ("We disagree") without DATA = stock makes new lows',
      headlineExample: '🔴 HARD INFO: "Hindenburg Research Claims Stock Y Fabricated 40% of Revenue" (specific % = permanent)'
    },
    phases: {
      initial: {
        name: 'Initial Crash',
        timing: 'Day 1',
        priceImpact: '-25% to -40% immediately',
        action: 'DO NOT BUY. This is NOT a dip to buy. More damage likely.',
        strategy: 'If holding: Consider selling immediately. If not holding: Watch for put option opportunity.'
      },
      denial: {
        name: 'Company Denial',
        timing: 'Days 2-4',
        priceImpact: '+5% to +10% bounce (trap!)',
        action: 'DO NOT BUY THE BOUNCE. Company denial means nothing - wait for evidence.',
        strategy: 'This bounce is a bull trap. Short sellers often release "Part 2" after denial.'
      },
      followup: {
        name: 'Follow-up Attack',
        timing: 'Days 7-21',
        priceImpact: '-10% to -20% additional drop',
        action: 'Each new wave confirms legitimacy. Probability of vindication increases.',
        strategy: 'Wave 2+ means 80%+ chance short seller is right. Stay away.'
      },
      investigation: {
        name: 'Investigation Phase',
        timing: 'Days 14-30',
        priceImpact: '±5% daily swings',
        action: 'WAIT. Outcome uncertain. Don\'t gamble on resolution.',
        strategy: 'Only trade if you have high conviction on outcome. Most should wait.'
      },
      resolution: {
        name: 'Resolution',
        timing: 'Final day',
        priceImpact: 'Vindicated: -15% more. Debunked: +15% to +25% recovery',
        action: 'Trade AFTER resolution news, not before.',
        strategy: 'If debunked: Consider buying for recovery. If vindicated: Stay away permanently.'
      }
    },
    sellSignals: {
      timing: [
        '⏱️ If HOLDING before attack: SELL immediately on report news',
        '⏱️ If bought PUTS: Hold until resolution (vindication) or -50% stock drop',
        '⏱️ If buying AFTER debunking: SELL when price recovers +15% to +20%',
        '⏱️ Never buy stock during attack - wait for resolution'
      ],
      priceTargets: [
        '🎯 PUT Target: +100% to +200% (sell puts when stock drops -40% total)',
        '🎯 Recovery Target: +15% to +20% from debunking price',
        '🎯 Stop Loss: If vindicated, do not buy - permanent damage',
        '🎯 Avoid: Buying "dips" during attack = catching falling knife'
      ]
    },
    expectedReturn: {
      puts: '+100% to +300% if bought early and held to vindication',
      calls: 'Only buy AFTER debunking confirmed, expect +20-40% recovery',
      stock: 'Buying dips during attack is -50% to total loss risk'
    },
    keyLessons: [
      'Short reports usually come in waves - don\'t catch falling knives',
      'More waves = higher chance of vindication (they found real problems)',
      'Company denial is meaningless - wait for independent verification',
      'Even if debunked, stock rarely fully recovers (mud sticks)'
    ]
  },
  
  // === INDEX REBALANCING ===
  // Empirically-based: Petajisto (2011), Kappou (2010), BPP (2021)
  // TIER 2: 75-80% success rate (below 85% Gold Standard threshold)
  indexRebalancing: {
    name: 'Index Rebalancing',
    tier: 2,
    goldStandard: '🏆 Tier 1 Index + 5%+ Run-up + MOC Spike + T+2 Reversal = 75-80% Success Rate',
    telltales: [
      '📰 News: "X to be ADDED to S&P 500" or "X REMOVED from Russell 2000"',
      '📅 Effective date announced (5-10 trading days out)',
      '📊 Run-up begins immediately after announcement (+0.5-1.5%/day)',
      '💰 Passive funds MUST buy/sell - this is a FORCED TRADE, not a choice'
    ],
    phases: {
      announcement: {
        name: 'Announcement',
        timing: 'Day 0',
        priceImpact: '+2-4% immediate (addition), -2-4% (removal)',
        action: 'DO NOT BUY NOW! Monitor for Gold Standard setup.',
        strategy: 'The retail edge is NOT buying the addition - it\'s shorting the exhaustion AFTER effective date.'
      },
      runUp: {
        name: 'Run-Up / Front-Running',
        timing: 'Days 1 to effective-1',
        priceImpact: '+0.5-1.5% per day (Tier 1 = 1.5x impact)',
        action: 'Track cumulative run-up. Need 5%+ for Gold Standard.',
        strategy: 'Speculators front-run passive funds. Watch for 5%+ run-up criterion.'
      },
      effectiveDay: {
        name: 'Effective Date',
        timing: 'Effective day',
        priceImpact: '+1-3% final push with 20-50x MOC volume spike',
        action: 'Observe MOC volume. Prepare for T+2 entry.',
        strategy: 'Massive Market-on-Close volume. The "marginal buyer" is now gone.'
      },
      reversal: {
        name: 'T+2 Reversal',
        timing: 'T+1 to T+5 (3-5 trading days)',
        priceImpact: '-2% to -5% mean reversion (Petajisto 2011)',
        action: 'ENTER SHORT on T+2 lower high. Target 2-5% gain.',
        strategy: 'With Gold Standard 4-step filter: 75-80% success rate on reversal trade.'
      }
    },
    sellSignals: {
      timing: [
        '⏱️ If you bought the addition: SELL before effective day',
        '⏱️ If shorting reversal: ENTER on T+2 (first lower high)',
        '⏱️ EXIT reversal short: 3-5 days after entry for 2-5% gain',
        '⏱️ Deletion bounce: BUY T+1 or T+2, EXIT +2-4%'
      ],
      priceTargets: [
        '🎯 Reversal Short Target: -2% to -5% from effective day peak',
        '🎯 Deletion Bounce Target: +2% to +4% from effective day low',
        '🎯 Stop Loss: Exit if reversal doesn\'t materialize by T+5',
        '🎯 Empirical basis: Kappou (2010), 2-4% abnormal return post-inclusion'
      ]
    },
    expectedReturn: {
      runUp: '+5% to +15% from announcement to effective (you\'re NOT trading this)',
      reversalShort: '+2% to +5% from shorting the post-effective reversal (Gold Standard trade)',
      deletionBounce: '+2% to +4% from buying the deletion bounce',
      successRate: '75-80% when all 4 Gold Standard criteria met'
    },
    keyLessons: [
      'The highest probability trade is NOT buying the addition - it\'s shorting the exhaustion',
      'Passive funds MUST buy/sell - the calendar is PUBLIC (S&P quarterly, Russell annual)',
      'Gold Standard: Tier 1 index + 5%+ run-up + MOC spike + T+2 reversal',
      'Petajisto (2011): S&P 500 additions reverse ~4% post-inclusion',
      'Front-running is legal - everyone does it. That\'s why you SHORT the exhaustion.'
    ]
  },
  
  // === INSIDER BUYING ===
  insiderBuying: {
    name: 'Insider Buying Signal',
    tier: 1,
    telltales: [
      '📰 News: "CEO purchases $500K in shares", "Insider buying", "Form 4 filing"',
      '💰 Multiple executives buying = stronger signal (cluster buying)',
      '📊 Buying on open market (not options exercise) is the real signal',
      '⏰ Insiders know 2-4 weeks before public catalyst',
      '⚠️ WARNING: ~30% of insider buying leads to nothing (routine/bad timing)'
    ],
    nlpFilter: {
      title: '📰 INSIDER BUYING HEADLINE KEYWORDS (SEC Filing Research)',
      goldKeywords: ['SEC Form 4', 'Open Market Purchase', 'Cluster Buying', 'Multi-million dollar stake', 'Code P'],
      goldExplained: 'The phrase "OPEN MARKET" is the gold standard - distinguishes real conviction from meaningless exercises.',
      trapKeywords: ['Option Exercise', 'Code M', 'Scheduled', '10b5-1 Plan', 'Compensation'],
      trapExplained: 'These indicate pre-planned, routine transactions with ZERO predictive power.',
      headlineExample: '✅ GOLD: "CEO and Three Directors Purchase $5M in Shares via Open Market"',
      trapExample: '❌ TRAP: "CEO Exercises Stock Options" (Code M = meaningless)'
    },
    phases: {
      initial: {
        name: 'First Insider Purchase',
        timing: 'Day 1',
        priceImpact: '+1% to +2% initially',
        action: 'BUY with small position after insider buying news.',
        strategy: 'Use position sizing - not every insider buy works out.'
      },
      accumulation: {
        name: 'Accumulation Period',
        timing: 'Days 2-5',
        priceImpact: '+1% per day drift up',
        action: 'HOLD and watch for more insider buying news.',
        strategy: 'Cluster buying (multiple insiders) strengthens the signal.'
      },
      catalyst: {
        name: 'Good News Arrives (~70% of cases)',
        timing: 'Days 3-10 after initial insider buying',
        priceImpact: '+12% to +25% on catalyst news',
        action: 'SELL on the catalyst news spike.',
        strategy: 'The news insiders knew about is now public. Take profits immediately.'
      },
      fizzle: {
        name: 'No Catalyst (~30% of cases)',
        timing: 'Days 5-10 after initial insider buying',
        priceImpact: '-3% to -5% drift back',
        action: 'SELL if news reveals "10b5-1 plan" or "scheduled purchase".',
        strategy: 'Pre-planned 10b5-1 purchases are routine - not signals of insider knowledge.'
      }
    },
    sellSignals: {
      timing: [
        '⏱️ SELL on Day 3-10 when positive catalyst news arrives',
        '⏱️ SELL if price rises +15% or more from your entry',
        '⚠️ SELL if news reveals "10b5-1 plan" or "scheduled compensation"',
        '⚠️ SELL if no catalyst after Day 7-10 (fading signal)',
        '⏱️ If "better-than-expected guidance" or similar catalyst news → SELL that day'
      ],
      priceTargets: [
        '🎯 Target: +12% from entry price (conservative)',
        '🎯 Target: +18% from entry price (if strong catalyst)',
        '🎯 Stop Loss: -5% if thesis breaks or "routine purchase" revealed'
      ]
    },
    expectedReturn: {
      stock: '+12% to +20% when catalyst arrives (70% of cases)',
      failure: '-3% to -5% when it fizzles (30% of cases)',
      expectedValue: '~+8% average accounting for failures',
      holdTime: '3-10 days typical'
    },
    keyLessons: [
      'Insiders know their company best - but they can still be wrong',
      'CEO/CFO buying is stronger signal than director buying',
      'Cluster buying (multiple insiders) is more reliable',
      '10b5-1 scheduled plans are NOT real signals - they\'re routine',
      'Insider SELLING is less meaningful (diversification, taxes, etc.)',
      'The catalyst is the EXIT - sell the news, not before',
      '⚠️ Position size appropriately - ~30% failure rate means don\'t bet the farm'
    ]
  },
  
  // === MULTI-WAVE MANIPULATION === (TIER 3 - Hard to detect, high failure rate)
  manipulation: {
    name: 'Institutional Pump & Dump',
    tier: 3, // Demoted from Tier 1 - unrealistic detection rate
    telltales: [
      '🔍 "Unusual volume", "dark pool trades", "offshore accounts" - no explanation',
      '❌ Volume spike with NO NEWS = suspicious (but often innocent)',
      '📰 Sudden "rumor" of acquisition/partnership with no source',
      '⚠️ WARNING: Most "suspicious volume" is NOT manipulation (~60% false positive)'
    ],
    realityCheck: [
      '⚠️ In real life, manipulation is VERY hard to detect',
      '⚠️ ~20% of schemes get caught by SEC (trading halted, losses)',
      '⚠️ ~20% of schemes fizzle (no catalyst ever comes)',
      '⚠️ ~20% is legitimate volume mistaken for manipulation',
      '⚠️ Only ~40% of suspicious volume actually leads to pump-dump'
    ],
    phases: {
      accumulation: {
        name: 'Quiet Accumulation',
        timing: 'Days 1-10 (hidden)',
        priceImpact: '+0.5% per day drift',
        action: 'NEARLY IMPOSSIBLE TO DETECT. Looks like normal trading.',
        strategy: 'Even if you spot unusual volume, it\'s probably not manipulation.'
      },
      sec_intervention: {
        name: 'SEC Intervention (~20%)',
        timing: 'Can happen anytime',
        priceImpact: '-15% to -25% when trading resumes',
        action: 'If holding when halted, you\'re trapped with losses.',
        strategy: 'Regulators monitor unusual patterns. Getting caught is common.'
      },
      fizzle: {
        name: 'Scheme Fizzles (~20%)',
        timing: 'After accumulation phase',
        priceImpact: '-5% to -10% drift back',
        action: 'Nothing happens. Volume disappears.',
        strategy: 'Many schemes collapse before the pump. No catalyst ever comes.'
      },
      catalyst: {
        name: 'Pump Phase (~40% reach this)',
        timing: '1-2 days',
        priceImpact: '+25% to +50% spike',
        action: 'If you catch it early, ride it but SET STOP-LOSS.',
        strategy: 'Take quick profits. This is NOT sustainable.'
      },
      distribution: {
        name: 'Distribution',
        timing: '3-5 days',
        priceImpact: 'Flat or slight decline',
        action: 'SELL if holding. Smart money exiting.',
        strategy: 'Price stays high but volume character changes. Institutions selling to retail.'
      },
      crash: {
        name: 'Final Dump',
        timing: '2-3 days',
        priceImpact: '-18% to -54% crash',
        action: 'AVOID. Don\'t try to catch the falling knife.',
        strategy: 'Retail bag holders created.'
      }
    },
    expectedReturn: {
      realistic: 'NEGATIVE expected value for most traders',
      ifCorrectlyIdentified: '+20% to +40% if sell during pump (rare)',
      ifWrong: '-10% to -25% from SEC halt or fizzle',
      successRate: '~40% (very low for Tier 3)'
    },
    keyLessons: [
      '⚠️ Most "manipulation" signals are false positives',
      '⚠️ SEC catches many schemes - don\'t assume you\'re smarter',
      '⚠️ Even sophisticated traders can\'t reliably detect manipulation',
      'In real life: If it looks too obvious, it\'s probably not manipulation',
      'Better strategy: Avoid suspicious stocks entirely rather than trying to trade them'
    ]
  },
  
  // ==================== TIER 2: GOOD EDUCATIONAL VALUE ====================
  
  // === DEAD CAT BOUNCE ===
  deadCatBounce: {
    name: 'Multi-Bounce Dead Cat',
    tier: 2,
    telltales: [
      '📉 Stock crashed -20% to -40% on bad news',
      '📈 "Finding support", "buyers stepping in" news after crash',
      '🔄 Each bounce is WEAKER than the previous one',
      '📊 Count the bounces - more bounces = closer to real bottom'
    ],
    nlpFilter: {
      title: '📰 DCB HEADLINE TRAP (Tetlock 2007)',
      description: 'Bounce headlines use "no-catalyst" language - a trap signature!',
      trapKeywords: ['bargain hunters', 'technical rebound', 'oversold bounce', 'relief rally', 'finding support'],
      trapExplained: 'When reporters use these filler phrases, they have NO fundamental reason for the rise. Classic DCB trap!',
      confirmationKeywords: ['SEC Form 4', 'insider buying', 'cluster purchase', 'dividend announced'],
      confirmationExplained: 'Only trust bounce if accompanied by HARD catalyst like insider buying.'
    },
    phases: {
      crash: {
        name: 'Initial Crash',
        timing: '2-3 days',
        priceImpact: '-12% to -20% per day',
        action: 'DO NOT BUY. Crash needs to exhaust itself.',
        strategy: 'Wait for bounce - but first bounce is usually a trap.'
      },
      bounce1: {
        name: 'First Bounce (TRAP)',
        timing: '2-3 days',
        priceImpact: '+8% to +12% recovery',
        action: 'DO NOT BUY. 70% chance of another leg down.',
        strategy: 'This is the "dead cat" bounce. Sells will resume.'
      },
      bounce2: {
        name: 'Second Bounce',
        timing: '2-3 days',
        priceImpact: '+6% to +9% recovery (weaker)',
        action: 'Still risky. 50% chance of more downside.',
        strategy: 'Bounce getting weaker = selling exhaustion building.'
      },
      bounce3plus: {
        name: 'Third+ Bounce',
        timing: '1-2 days',
        priceImpact: '+3% to +6% recovery (much weaker)',
        action: 'CONSIDER BUYING. 60-80% chance this is real bottom.',
        strategy: 'Multiple weak bounces = sellers exhausted. Real bottom forming.'
      },
      resolution: {
        name: 'Resolution',
        timing: 'After bounce fails or holds',
        priceImpact: 'Real bottom: recovery. Secular decline: more downside.',
        action: 'Buy only after resolution confirms direction.',
        strategy: 'Patience wins. Wait for clear signal before committing.'
      }
    },
    expectedReturn: {
      bounce1Buyer: '-20% to -40% additional loss (trap)',
      bounce3Buyer: '+15% to +30% if real bottom',
      patience: 'Waiting for bounce 3+ dramatically improves odds'
    },
    sellSignals: {
      timing: [
        '🚪 If bought at Bounce 3+: Sell 50% at +15% recovery',
        '🚪 Sell remaining 50% at +25% or if momentum stalls',
        '⚠️ "Another leg down" news = SELL ALL immediately'
      ],
      priceTargets: {
        conservative: '+10% to +15% (quick scalp)',
        standard: '+15% to +25% (hold for recovery)',
        aggressive: '+25% to +35% (only if strong reversal confirmed)'
      },
      exitStrategy: 'Scale out on strength. Dead cats can die again - respect momentum loss.'
    },
    keyLessons: [
      'First bounce after crash is usually a trap - don\'t buy',
      'Each successive bounce is weaker (selling exhaustion)',
      'More bounces = higher probability of real bottom',
      '"Even a dead cat bounces if it falls far enough"'
    ]
  },
  
  // === STOCK SPLIT ===
  stockSplit: {
    name: 'Stock Split Reversal',
    tier: 2,
    telltales: [
      '📰 News: "X announces 4:1 stock split"',
      '📅 Effective date set 5-10 days out',
      '💰 High-priced stocks (>$5000 = Mega-Cap = Gold Standard)',
      '📊 OTM call volume spiking (retail FOMO)'
    ],
    phases: {
      announcement: {
        name: 'Announcement Pop',
        timing: 'Day 0',
        priceImpact: '+2% to +5% immediate',
        action: 'BUY on announcement. Momentum begins.',
        strategy: 'Splits attract retail buyers. Psychology drives price.'
      },
      runUp: {
        name: 'Pre-Split Run-up',
        timing: 'Days 1 to effective-1',
        priceImpact: '+1% to +2.5% daily (15%+ total for Gold Standard)',
        action: 'HOLD. Watch for 15%+ run-up (Gold Standard criterion).',
        strategy: 'Track OTM call volume. 3x spike = retail euphoria.'
      },
      effectiveDay: {
        name: 'Split Effective Day',
        timing: 'Effective day',
        priceImpact: '+2% to +6% (price adjusts down, may pop)',
        action: 'SELL LONG POSITION. Prepare for reversal trade.',
        strategy: 'Peak retail euphoria. Smart money exits here.'
      },
      reversal: {
        name: 'THE TRADE: T+3 Reversal',
        timing: 'T+2 to T+5 after effective',
        priceImpact: '-0.8% to -2% daily decline',
        action: 'SHORT or BUY PUTS on T+3 lower high.',
        strategy: 'Gold Standard: 70-85% success if all criteria met.'
      }
    },
    expectedReturn: {
      longPosition: '+10% to +25% from announcement to effective',
      reversalTrade: '+5% to +15% shorting post-split fade',
      calls: '+50% to +100% on ATM calls (sell before effective)',
      holdTime: '5-10 days typical (exit by T+3 post-split)'
    },
    goldStandard: {
      criteria: [
        '✓ Mega-Cap Stock: Price >$5000 pre-split',
        '✓ 15%+ Run-up: From announcement to effective',
        '✓ OTM Call Spike: 3x+ normal volume',
        '✓ T+3 Lower High: Entry trigger for short'
      ],
      successRate: '70-85% when all 4 criteria met',
      strategy: 'Wait for T+3 confirmation. Then SHORT the fade.'
    },
    sellSignals: {
      timing: [
        '🚪 Sell longs on split effective date',
        '🩳 SHORT on T+3 if lower high confirmed',
        '🎯 Target: -5% to -15% from peak',
        '🚪 Cover short after 5-day reversal window'
      ],
      priceTargets: {
        conservative: '+10% to +15% (sell before effective)',
        standard: '+15% to +20% (sell on effective)',
        reversalTrade: '+5% to +10% (short the T+3 fade)'
      },
      exitStrategy: 'Two trades: (1) Long announcement→effective, (2) Short T+3 reversal.'
    },
    keyLessons: [
      'Splits don\'t change fundamental value',
      'Psychology drives run-up ("feels cheaper")',
      'Ikenberry (1996): +7.9% run-up, -2.8% post-split fade',
      'The REAL alpha is shorting the T+3 reversal (70-85% success)'
    ]
  },
  
  // === SHORT SQUEEZE ===
  shortSqueeze: {
    name: 'Short Squeeze Exhaustion',
    tier: 1,
    telltales: [
      '📊 Short Interest >30% (danger zone), >50% (extreme)',
      '📅 Days to Cover >5 (high risk), >10 (extreme)',
      '💰 Cost to Borrow >50% (critical), 100%+ (final spark)',
      '📈 Utilization 95-100% = no shares left to borrow'
    ],
    phases: {
      buildup: {
        name: 'Pressure Building',
        timing: '3-7 days',
        priceImpact: '+2% to +5% daily creep',
        action: 'WATCH. Monitor SI, CTB, utilization metrics.',
        strategy: 'High SI is the fuel. Wait for ignition catalyst.'
      },
      squeeze: {
        name: 'Parabolic Squeeze',
        timing: '2-5 days',
        priceImpact: '+10% to +25% daily (EXTREME)',
        action: 'DO NOT BUY HERE. Wait for exhaustion.',
        strategy: 'Shorts are covering. This is forced buying, not real demand.'
      },
      climax: {
        name: 'Blow-Off Top',
        timing: '1 day',
        priceImpact: '+15% to +50% final surge',
        action: 'PREPARE TO SHORT. Gold Standard signals emerging.',
        strategy: 'Volume climax + RSI >85 + CTB plateau = exhaustion imminent.'
      },
      reversal: {
        name: 'THE TRADE: Reversal',
        timing: '3-5 days',
        priceImpact: '-8% to -15% daily decline',
        action: 'SHORT or BUY PUTS. 50% of gains lost in 72 hours.',
        strategy: 'Gold Standard: 85% success rate on shorting exhaustion.'
      }
    },
    expectedReturn: {
      shortTheTop: '+30% to +60% shorting the reversal (85% Gold Standard)',
      buyingEarly: '+50% to +200% (rare, requires perfect timing)',
      buyingLate: '-50% to -80% loss (typical retail outcome)',
      riskLevel: 'The TRADE is shorting exhaustion, NOT buying the squeeze'
    },
    goldStandard: {
      criteria: [
        '✓ Parabolic Extension: 100%+ above 20-day MA',
        '✓ Volume Climax: 5x+ average volume',
        '✓ Borrow Fee Plateau: CTB drops while price peaks',
        '✓ RSI Divergence: RSI >85 at peak'
      ],
      successRate: '85%+ when all 4 criteria met',
      strategy: 'Wait for ALL 4 signals. Then SHORT the backside.'
    },
    sellSignals: {
      timing: [
        '🩳 Volume Climax + RSI >85 = INITIATE SHORT',
        '🩳 CTB dropping while price peaks = CONFIRMATION',
        '🎯 Target: 50% of squeeze gains retraced in 72 hours',
        '🚪 Cover short when RSI <30 or volume normalizes'
      ],
      priceTargets: {
        conservative: '+20% to +30% (cover early)',
        standard: '+40% to +50% (50% retracement)',
        aggressive: '+60%+ (full unwind)'
      },
      exitStrategy: 'Cover shorts when panic selling exhausts. Look for volume dry-up.'
    },
    keyLessons: [
      'The REAL trade is SHORTING exhaustion, not buying the squeeze',
      'CFA Institute: Stocks lose 50% of gains within 72 hours',
      'Gold Standard exhaustion filter = 85%+ success rate',
      'Buying squeezes is gambling. Shorting exhaustion is trading.'
    ]
  },
  
  // === FOMO RALLY EXHAUSTION ===
  // Empirical Sources: Barber & Odean (2008/2021), Da, Engelberg & Gao (2011/2024), Baltzer et al. (2023)
  // Gold Standard: SHORT the Sentiment Exhaustion (85%+ reversal)
  fomoRally: {
    name: 'FOMO Rally Exhaustion',
    tier: 2,
    empiricalSources: [
      'Barber & Odean (2021): Attention-driven buying → 30-90 day underperformance',
      'Da, Engelberg & Gao (2024): Search volume predicts 1-2 week spike, then reversal',
      'Baltzer et al. (2023): Positive feedback loops exhaust at "marginal buyer"'
    ],
    telltales: [
      '📊 Stock trading 3+ SD above 20-day MA (Bollinger extension)',
      '🎰 Put/Call ratio collapses to <0.40 (extreme greed)',
      '📉 DIVERGENCE: Record social mentions but price fails new high',
      '💥 Blow-off top: Gap up → close near low → record volume'
    ],
    nlpFilter: {
      title: '📰 EUPHORIA PEAK KEYWORDS (Barber & Odean - Attention-Driven Buying)',
      peakKeywords: ['Historic', 'Moon', 'Next Tesla', 'Retail Frenzy', 'Skyrockets', "Can't be stopped", 'Diamond hands'],
      peakExplained: 'When headlines become EXTRAVAGANT and focus on INVESTOR BEHAVIOR instead of company performance, the TOP is near!',
      focusShift: 'Headlines about "frenzy" and "everyone buying" = smart money exiting to dumb money',
      goldStandard: '🏆 GOLD STANDARD (Shorts): Superlatives + mainstream integration + volume climax = 85% crash probability',
      headlineExample: '✅ SHORT SIGNAL: "Retail Frenzy Continues as Stock Z Skyrockets to Historic Highs"'
    },
    phases: {
      buildup: {
        name: 'BUILDUP (Day 1-7)',
        timing: '5-10 days',
        priceImpact: '+2-5% daily',
        action: 'WATCH only. Mentions building 3x→10x baseline.',
        strategy: 'Too early to short. Monitor sentiment indicators.'
      },
      euphoria: {
        name: 'EUPHORIA (Day 8-11)',
        timing: '3-5 days',
        priceImpact: '+5-10% daily (parabolic)',
        action: 'PREPARE TO SHORT. 3+ SD extension developing.',
        strategy: 'Wait for blow-off confirmation. Do NOT buy here.'
      },
      blowOff: {
        name: 'BLOW-OFF TOP (Day 12)',
        timing: '1 day',
        priceImpact: '+0-5% then reversal',
        action: 'SHORT or BUY PUTS on "first lower high"',
        strategy: 'This is the "transfer of ownership." 85% crash follows.'
      },
      crash: {
        name: 'CRASH (Day 13-22)',
        timing: '5-10 days',
        priceImpact: '-3-8% daily → -20-60% total',
        action: 'HOLD SHORT. Target 50-day MA.',
        strategy: 'Return to mean is "almost inevitable" per research.'
      }
    },
    goldStandard: {
      criteria: [
        '📊 VERTICALITY: 3+ SD above 20-day MA',
        '🎰 RETAIL EUPHORIA: P/C ratio <0.40 (extreme greed)',
        '📉 DIVERGENCE: Record mentions + price fails new high',
        '💥 BLOW-OFF: Gap up + close near low + 3x+ volume'
      ],
      successRate: '85%+ reversal when ALL 4 criteria met',
      partialRates: {
        parabolicOnly: '60% reversal',
        plusSentiment: '70% reversal',
        plusDivergence: '80% reversal',
        allFour: '85%+ reversal (Gold Standard)'
      }
    },
    expectedReturn: {
      shortAtBlowOff: '+20-40% gain from short/puts',
      earlyBuyer: '+30-60% if sell before blow-off',
      blowOffBuyer: '-30-50% loss (bag holder created)',
      afterCrash: 'Return to 50-day MA typical'
    },
    vetoFactors: [
      '⚡ GAMMA LOOP: Good news reignites squeeze (-35% prob)',
      '🎪 EXTENDED MANIA: Market stays irrational months (-25% prob)',
      '🏦 INSTITUTIONAL BUYING: Real accumulation detected (-40% prob)',
      '📈 SHORT SQUEEZE FUEL: High SI adds upward pressure (-20% prob)'
    ],
    sellSignals: {
      timing: [
        '🎯 Wait for "First Day of Lower Highs" (key empirical signal)',
        '📊 Sentiment/Price divergence = entry for shorts',
        '💥 Blow-off candle (gap up, close low, volume spike) = go short',
        '📉 Target: Return to 50-day MA'
      ],
      priceTargets: {
        conservative: 'Short at -10% from peak, cover at -25%',
        standard: 'Short at blow-off, cover at 50-day MA',
        aggressive: 'Short at 3+ SD, pyramind on lower highs'
      },
      exitStrategy: 'Cover shorts when price approaches 50-day MA or sentiment normalizes'
    },
    keyLessons: [
      '"Don\'t miss out!" = YOU are the exit liquidity (Barber & Odean)',
      'Social mentions peak → price fails = marginal buyer exhausted',
      'Parabolic moves (3+ SD) are mathematically unsustainable',
      'Wait for CONFIRMATION (first lower high), not the exact peak',
      '30-90 day underperformance is empirically documented'
    ]
  },
  
  // === CAPITULATION ===
  capitulation: {
    name: 'Capitulation (Panic Selling)',
    tier: 2,
    telltales: [
      '📉 "CAPITULATION - investors throw in towel" news',
      '💉 "Blood in the streets", extreme fear language',
      '📊 Massive volume on down day',
      '🔄 Sharp V-reversal often follows within 1-3 days'
    ],
    phases: {
      capitulation: {
        name: 'Capitulation Event',
        timing: '1 day',
        priceImpact: 'Extreme selling exhausts itself',
        action: 'CONTRARIAN BUY. This is often the bottom.',
        strategy: '"Be greedy when others are fearful." Buy the extreme fear.'
      },
      reversal: {
        name: 'V-Shaped Reversal',
        timing: '1-3 days after',
        priceImpact: '+15% to +25% sharp bounce',
        action: 'If bought capitulation, HOLD for reversal.',
        strategy: 'Panic bottoms often produce sharp recoveries.'
      }
    },
    expectedReturn: {
      contrarian: '+15% to +30% on capitulation buy',
      calls: '+100% to +200% on OTM calls bought at capitulation',
      risk: 'Moderate - capitulation is usually the bottom but not always'
    },
    keyLessons: [
      'Capitulation = sellers exhausted, often marks bottom',
      '"Blood in streets" is when to buy, not sell',
      'V-shaped reversals common after capitulation',
      'Position size matters - start small'
    ]
  },
  
  // === LIQUIDITY SWEEP (WYCKOFF SPRING) ===
  // Empirical Sources: Aggarwal & Wu (2006), Comerton-Forde & Putniņš (2014), Lee et al. (2024)
  // Gold Standard: BUY the Failed Breakdown (85%+ reversal)
  liquiditySweep: {
    name: 'Liquidity Sweep (Wyckoff Spring)',
    tier: 2,
    empiricalSources: [
      'Aggarwal & Wu (2006): SEC manipulation study - institutional order flow patterns',
      'Comerton-Forde & Putniņš (2014): Closing price manipulation detection',
      'Lee, Li & Wang (2024): Deep learning for spoofing detection - order flow toxicity'
    ],
    telltales: [
      '📊 Price approaches OBVIOUS support level (double bottom, 3+ touches, long-term)',
      '💥 Sudden break BELOW support on HIGH VOLUME (stop-loss hunting)',
      '📈 Long lower wick (price recovers within same day)',
      '🔄 Volume spike but price FAILS to close lower (absorption)'
    ],
    phases: {
      setup: {
        name: 'Setup (Support Formation)',
        timing: '10-30 days prior',
        priceImpact: 'Range-bound, testing support',
        action: 'IDENTIFY obvious support levels (3+ touches).',
        strategy: 'The more "obvious" the support, the more stops are sitting below it.'
      },
      sweep: {
        name: 'The Sweep (Stop-Run)',
        timing: '1-3 days',
        priceImpact: '-2% to -8% below support',
        action: 'DO NOT PANIC SELL. Watch for absorption volume.',
        strategy: 'Institutions sweep retail stops to fill large buy orders cheaply.'
      },
      absorption: {
        name: 'Absorption (Volume Spike)',
        timing: 'Same day or next',
        priceImpact: 'Price refuses to stay down',
        action: 'LOOK FOR: 3x+ volume but price doesn\'t close lower.',
        strategy: 'High volume + price recovery = institutions absorbing supply.'
      },
      reEntry: {
        name: 'Re-Entry (BUY Signal)',
        timing: '1-2 days after sweep',
        priceImpact: '+2% to +5% back above support',
        action: 'BUY when price RECLAIMS support. This is Gold Standard entry.',
        strategy: '"Failed breakdown" = bullish. Liquidity vacuum propels price higher.'
      },
      continuation: {
        name: 'Continuation',
        timing: '5-15 days',
        priceImpact: '+8% to +15% from sweep low',
        action: 'HOLD for target. Trail stop at breakeven.',
        strategy: 'No sellers left = price rises with low resistance.'
      }
    },
    goldStandard: {
      criteria: [
        '✓ Obvious Support: Clear double bottom or 3+ touch support level',
        '✓ False Breakout: Aggressive break below support (2-10%), immediate recovery',
        '✓ Absorption Volume: 3x+ average volume, but price fails to close lower',
        '✓ Re-Entry: Price reclaims support level - BUY the retest'
      ],
      successRate: '85%+ when all 4 criteria met',
      partialRates: {
        supportOnly: '45% reversal',
        plusSweep: '60% reversal',
        plusVolume: '75% reversal',
        goldStandard: '85%+ reversal (all 4 criteria)'
      }
    },
    expectedReturn: {
      goldStandard: '+8% to +15% from sweep low (85% success)',
      partial: '+5% to +10% with 2-3 criteria (60-75% success)',
      failed: 'True breakdown continues -15%+ (no absorption = real selling)',
      riskLevel: 'Entry ONLY on re-entry above support, never during sweep'
    },
    vetoFactors: [
      '🐻 Bear Market: Overall market in downtrend (-20% probability)',
      '📉 Sector Weakness: Sector declining, not just stock (-15% probability)',
      '📰 Real Bad News: Actual fundamental issue vs stop hunting (-25% probability)',
      '🔄 Multiple Failures: Support failed before, now weaker (-30% probability)'
    ],
    sellSignals: {
      timing: [
        '🎯 BUY: When price reclaims support after sweep (re-entry)',
        '⏱️ HOLD: Through continuation phase (5-15 days)',
        '📊 SELL: At +8% to +15% target OR trail stop at breakeven',
        '🚪 STOP: If price fails to reclaim support within 3 days'
      ],
      priceTargets: {
        conservative: '+8% from entry (secure gain)',
        standard: '+12% from entry (typical sweep target)',
        aggressive: '+15%+ if momentum strong'
      },
      exitStrategy: 'Exit if price fails re-entry test or breaks below sweep low.'
    },
    keyLessons: [
      'Stop hunting is NOT retail paranoia - institutions DO sweep stops (Aggarwal & Wu)',
      'The more "obvious" the support, the more liquidity sits below it',
      '"False breakdown" = bullish. "Real breakdown" = no absorption, continued selling.',
      'BUY the failed breakdown, not the breakout. Opposite of what retail does.',
      'Volume is key: High volume + price recovery = absorption. Low volume = real selling.'
    ]
  },

  // === STRATEGIC PIVOT (4 Types with Different Outcomes) ===
  // Empirical Sources: Kogan, Wei & Zhao (2023), Brauer & Wiersema (2024), Tang & Agrawal (2022), HBS "Pivot Penalty" (2021)
  // KEY INSIGHT: Four distinct types with VERY different reversal probabilities
  strategicPivot: {
    name: 'Strategic Pivot (4 Types)',
    tier: 2,
    empiricalSources: [
      'Kogan, Wei & Zhao (2023): "Buzzword Effect" - Pivots without R&D history reverse 75% in 22 days',
      'Brauer & Wiersema (2024): No 8-K CapEx change in 30 days = symbolic, reverses',
      'Tang & Agrawal (2022): "Uncertainty Gap" - Deviant strategies recover in 15-20 days',
      'HBS "Pivot Penalty" (2021): -4.5% Day 1, proactive pivots reverse <3 weeks (68%)'
    ],
    telltales: [
      '📰 LANGUAGE TYPE: Buzzwords ("AI-First," "Blockchain") = SYMBOLIC (good). Technical metrics = STRUCTURAL (bad).',
      '💰 NON-DILUTIVE: No share issuance, no debt increase = SYMBOLIC (not raising money = overreaction)',
      '📊 ANCHOR REVENUE: Old business stable/growing = Cash Cow still works → REVERSAL',
      '👔 INSIDER BUY: 2+ insiders buy within 48 hours = MOST POWERFUL signal (85%+ reversal)',
      '📈 GAP FILL: Closes in upper 25% of day\'s range on high volume = Institutional absorption'
    ],
    nlpFilter: {
      title: '📰 PIVOT CLASSIFICATION (4 TYPES)',
      description: 'Classify pivot type to determine reversal probability!',
      reactive: {
        label: 'REACTIVE (<10% Reversal) ⛔',
        characteristics: 'Dying firm, last resort, revenue collapse',
        signals: 'Business declining + Desperate language + Cash bleeding',
        action: 'DO NOT BUY - Permanent re-rating. No reversal.'
      },
      structural: {
        label: 'STRUCTURAL (30% Reversal, 6 months) ⚠️',
        characteristics: 'Real capital commitment, debt/restructuring',
        signals: 'New debt + Divestiture + Technical language + R&D shift',
        action: 'SKIP - Too slow. 6-month timeframe, better opportunities elsewhere.'
      },
      symbolic: {
        label: 'SYMBOLIC (65% Reversal, 2-3 weeks) 📈',
        characteristics: 'Buzzwords, no CapEx change, hype-based',
        signals: 'Buzzword language + No capital raised + Old biz stable',
        action: 'CONSIDER BUYING - Market overreacted to words, not substance.'
      },
      goldStandard: {
        label: 'GOLD STANDARD (85%+ Reversal, 10-14 days) 🏆',
        characteristics: 'Symbolic + ALL 4 confirmation signals',
        signals: 'Non-Dilutive + Anchor Revenue + Insider Buy + Gap Fill',
        action: 'HIGH CONVICTION BUY - Best setup. Full reversal expected.'
      }
    },
    pivotTypes: {
      reactive: {
        name: 'Reactive Pivot',
        reversalProbability: '<10%',
        timeframe: 'No reversal - long drift',
        description: 'Dying firm grasping at straws. Revenue collapsing, this is desperation.',
        characteristics: [
          'Business fundamentally broken',
          'Last resort after repeated failures',
          'Often accompanied by "strategic alternatives" (sale)',
          'Desperation language: "exploring options," "challenging environment"'
        ],
        action: '⛔ DO NOT BUY - This is permanent re-rating, not opportunity'
      },
      structural: {
        name: 'Structural Pivot',
        reversalProbability: '30%',
        timeframe: '6 months',
        description: 'Real capital commitment signals genuine change. Market is RE-RATING.',
        characteristics: [
          'New debt or credit facility announced',
          'Divestiture or asset sale',
          'R&D budget shift with specific metrics',
          'Technical language: "unit economics," "LTV/CAC," "restructuring charge"'
        ],
        action: '⚠️ SKIP - Even if it recovers, 6-month timeframe too slow'
      },
      symbolic: {
        name: 'Symbolic Pivot',
        reversalProbability: '65%',
        timeframe: '2-3 weeks',
        description: 'Buzzwords without substance. Market overreacted to press release.',
        characteristics: [
          'Buzzword-heavy: "AI-First," "Blockchain," "Platform," "Synergies"',
          'No capital raised - pivot is "free"',
          'Old business still operating normally',
          'No insider selling (they know it\'s just PR)'
        ],
        action: '📈 CONSIDER BUYING - "Nothing has changed" = reversal'
      },
      goldStandard: {
        name: 'Gold Standard Pivot',
        reversalProbability: '85%+',
        timeframe: '10-14 days',
        description: 'Symbolic pivot with ALL 4 confirmation signals. Best setup.',
        characteristics: [
          '✓ Non-Dilutive: No share issuance, no debt increase',
          '✓ Anchor Revenue: Old business stable or growing',
          '✓ Insider Buy: 2+ insiders BUY within 48 hours (MOST POWERFUL)',
          '✓ Gap Fill: Closes in upper 25% of range on high volume'
        ],
        action: '🏆 HIGH CONVICTION BUY - Full reversal expected'
      }
    },
    goldStandardSignals: {
      nonDilutive: {
        name: 'Non-Dilutive',
        description: 'No share issuance, no debt increase',
        why: 'If not raising money, pivot is "symbolic" - market overreacted',
        weight: 'IMPORTANT - Proves nothing fundamentally changed'
      },
      anchorRevenue: {
        name: 'Anchor Revenue',
        description: 'Old business stable or growing',
        why: '"Cash Cow" still operating - groundwork hasn\'t ramped down',
        weight: 'IMPORTANT - Core business intact'
      },
      insiderBuy: {
        name: 'Insider Buy',
        description: '2+ insiders buy within 48 hours of announcement',
        why: 'Leaders know pivot is ADDITIVE, not destructive',
        weight: 'MOST POWERFUL - Insider buys are the strongest reversal signal'
      },
      gapFill: {
        name: 'Gap Fill',
        description: 'Closes in upper 25% of day\'s range on high volume',
        why: 'Institutional absorption - smart money buying retail panic',
        weight: 'CONFIRMS - Shows institutions are stepping in'
      }
    },
    phases: {
      announcement: {
        name: 'Announcement Drop',
        timing: 'Day 1',
        priceImpact: '-4.5% average (HBS 2021)',
        action: 'WAIT. Classify the pivot type. Don\'t rush.',
        strategy: 'Analyze: Language type? Capital raised? Insider action?'
      },
      uncertaintyGap: {
        name: 'Uncertainty Gap',
        timing: 'Days 2-7',
        priceImpact: 'Drifts or stabilizes',
        action: 'SYMBOLIC/GOLD: Watch for insider buys and gap fill.',
        strategy: 'This is when insiders show their hand. Watch Form 4 filings.'
      },
      recovery: {
        name: 'Recovery',
        timing: 'Days 8-20',
        priceImpact: 'Symbolic: +65%. Gold Standard: +85%.',
        action: 'SYMBOLIC/GOLD: Take profits at pre-announcement level.',
        strategy: 'Recovery window closes around Day 22 (Kogan 2023).'
      }
    },
    expectedReturn: {
      goldStandard: '+8% to +15% in 10-14 days (85% success)',
      symbolic: '+5% to +10% in 2-3 weeks (65% success)',
      structural: 'Skip - too slow, better setups exist',
      reactive: 'DO NOT BUY - permanent damage'
    },
    vetoFactors: [
      '⛔ REACTIVE: Business fundamentally broken (-90% reversal chance)',
      '⚠️ STRUCTURAL: New debt/credit facility announced (-55% reversal chance)',
      '⚠️ STRUCTURAL: Divestiture with specific metrics (-50% reversal chance)',
      '🚫 NO INSIDER BUY: Missing the most powerful signal (-40% reversal chance)'
    ],
    sellSignals: {
      timing: [
        '📥 GOLD STANDARD BUY: Days 2-3 (after signals confirm)',
        '📥 SYMBOLIC BUY: Days 3-5 (after stabilization)',
        '📤 SELL: At pre-announcement level (full reversal)',
        '⚠️ STOP: -10% from entry, or if pivot becomes structural'
      ],
      priceTargets: {
        goldStandardEntry: 'Day 2-3 after insider buy confirms',
        symbolicEntry: 'Day 3-5 after stabilization',
        exitTarget: 'Pre-announcement level',
        stopLoss: '-10% from entry'
      },
      exitStrategy: 'Gold/Symbolic: Exit at pre-announcement. Structural/Reactive: Never enter.'
    },
    keyLessons: [
      'Insider BUYING is the most powerful signal - opposite of insider selling!',
      'Buzzword pivots reverse because "nothing has changed" (Kogan 2023).',
      'Structural pivots don\'t reverse fast - real capital = real re-rating.',
      'Reactive pivots are death traps - dying firm, no hope.',
      '4 signals aligned = 85%+ reversal. Missing signals = much lower success.',
      'Gap Fill + Insider Buy = Institutions absorbing retail panic.'
    ]
  },

  // === EXECUTIVE CHANGE (LEADERSHIP TRANSITION / UNCERTAINTY PREMIUM) ===
  // Empirical Sources: Denis & Denis (1995), Warner Watts & Wruck (1988), Huson et al. (2001), Datarails (2023)
  // KEY INSIGHT: Four types with VERY different outcomes
  executiveChange: {
    name: 'Executive Change (Leadership Transition)',
    tier: 2,
    empiricalSources: [
      'Denis & Denis (1995): "Causes and Consequences of Management Turnover" - Forced turnovers = positive abnormal returns',
      'Warner, Watts & Wruck (1988): Market overreacts to uncertainty of new leader; inverse relation to firm performance',
      'Huson et al. (2001): "Leadership Vacuum" without successor increases volatility, decreases reversal chance',
      'ResearchGate (2024): V-Shaped recovery pattern after forced turnover (kitchen-sink → good news rally)',
      'Datarails (2023): CFO exits cause 3% drop, 30-day drift, but recover by 180 days if no fraud'
    ],
    telltales: [
      '📰 8-K LANGUAGE: "Retirement," "Planned transition," "Distinguished career" = GOOD (Shakeout)',
      '⚠️ 8-K RED FLAGS: "Effective immediately," "Personal reasons," "Disagreements" = BAD (Fundamental)',
      '👔 SUCCESSION: Internal successor named immediately = 70-85% reversal',
      '❌ NO SUCCESSOR: "Board initiating search" = <15% reversal (Leadership Vacuum)',
      '📋 CLEAN AUDIT: "No disagreements on accounting matters" clause = CRITICAL (85%+ if present)',
      '📊 VOLUME CLIMAX: 5-10% drop on 3x+ volume = emotional liquidation exhausted'
    ],
    nlpFilter: {
      goldStandardKeywords: ['retirement', 'planned transition', 'internal successor', 'promoted', 'COO', 'President', 'distinguished career', 'orderly transition'],
      redFlagKeywords: ['effective immediately', 'personal reasons', 'pursue other opportunities', 'disagreements', 'accounting review', 'internal investigation', 'strategic differences'],
      cleanAuditPhrase: 'no disagreements on any matter of accounting principles or practices',
      warningAuditPhrase: 'disagreements regarding accounting or disclosure'
    },
    changeTypes: {
      abruptNoSuccessor: {
        pattern: 'ABRUPT RESIGNATION + NO SUCCESSOR',
        reversalProbability: '<15%',
        outcome: 'Fundamental Crash - DO NOT BUY',
        characteristics: [
          '"Effective immediately" departure',
          'No replacement named - "board initiating search"',
          '8-K contains concerning language about "disagreements"',
          'Often precedes fraud investigation or SEC inquiry'
        ]
      },
      cfoExitClean: {
        pattern: 'CFO EXIT (CLEAN AUDIT)',
        reversalProbability: '50%',
        outcome: 'Slow 6-month recovery',
        characteristics: [
          'CFO departs but Big 4 auditor confirms clean books',
          '3% initial drop, 30-day negative drift',
          'Recovery by 180-day mark (Datarails 2023)',
          'Not worth trading - better opportunities elsewhere'
        ]
      },
      plannedInternal: {
        pattern: 'CEO RETIREMENT + INTERNAL SUCCESSOR',
        reversalProbability: '70%',
        outcome: 'Good reversal in 2 weeks',
        characteristics: [
          'Planned transition announced in advance',
          'Internal successor named (COO, President)',
          '"Uncertainty dip" only - fundamentals unchanged',
          'Consider buying after stabilization'
        ]
      },
      goldStandard: {
        pattern: 'GOLD STANDARD (ALL 4 FILTERS)',
        reversalProbability: '85%+',
        outcome: 'Full reversal in 10-14 days',
        characteristics: [
          '✓ Succession Integrity: Internal successor named immediately',
          '✓ Clean Audit: 8-K contains "no disagreements" boilerplate',
          '✓ Volume Capitulation: 5-10% drop on 3x+ average volume',
          '✓ 3-Day Stabilization: Stock holds Day 1 low for 3 consecutive days'
        ]
      }
    },
    phases: {
      announcement: {
        description: 'Day 1-2: Initial drop on news',
        priceAction: '-5% to -25% depending on type',
        behavior: 'Emotional liquidation - retail and stop-loss funds sell uncertainty'
      },
      stabilization: {
        description: 'Days 3-5: The "3-Day Rule"',
        priceAction: 'Should hold Day 1 low if reversal coming',
        behavior: 'Institutional buyers step in to absorb retail panic'
      },
      resolution: {
        description: 'Days 6-14: Recovery or continued decline',
        priceAction: '+8% to +15% if gold standard; continued decline if fundamental',
        behavior: '"Uncertainty Premium" evaporates for good setups'
      }
    },
    goldStandard: {
      title: '🏆 EXECUTIVE CHANGE GOLD STANDARD (85%+ Reversal)',
      criteria: [
        'Step 1: SUCCESSION INTEGRITY - Internal successor named at same time as departure',
        'Step 2: CLEAN AUDIT CLAUSE - 8-K states "no disagreements on accounting matters"',
        'Step 3: VOLUME CAPITULATION - 5-10% drop with volume > 3x 50-day average',
        'Step 4: 3-DAY STABILIZATION - Stock holds Day 1 low for 3 consecutive days'
      ],
      why: 'If all 4 criteria met, the drop was pure "Uncertainty Premium" - fundamentals unchanged. Once retail panic exhausted, price returns to fair value.',
      empiricalBasis: 'Denis & Denis (1995) found forced turnovers with successors show positive abnormal returns; Huson et al. (2001) confirmed succession integrity is key.'
    },
    expectedReturn: {
      goldStandardBuyer: '+8% to +15% in 10-14 days',
      abruptBuyer: '-10% to -25% additional loss (VALUE TRAP)',
      cfoExitBuyer: 'Slow 6-month recovery - not worth the capital',
      patience: 'The 8-K language is EVERYTHING. Read it before buying.'
    },
    vetoFactors: [
      '⚠️ NO SUCCESSOR: "Board initiating search" = Leadership Vacuum (-40% reversal)',
      '⚠️ 8-K RED FLAGS: "Disagreements," "accounting review," "SEC" = Fundamental (-50% reversal)',
      '⚠️ IMMEDIATE: "Effective immediately" departure = Something bad coming (-35% reversal)',
      '⚠️ NEW LOWS: Stock makes lower low on Day 2 or 3 = Not shakeout (-30% reversal)'
    ],
    sellSignals: {
      timing: [
        '📥 BUY: After 3-day stabilization confirms (Day 4-5)',
        '⏱️ HOLD: Through recovery phase (Days 5-14)',
        '📊 SELL: At pre-announcement level OR +10-15% from lows',
        '🚪 STOP: Below Day 1 low (invalidates stabilization)'
      ],
      priceTargets: {
        entry: '-5% to -10% from pre-announcement',
        exit: 'Pre-announcement level (full reversal)',
        stopLoss: 'Below Day 1 low'
      },
      exitStrategy: 'Exit at pre-announcement level. If breaks Day 1 low, exit immediately - becomes fundamental.'
    },
    keyLessons: [
      'NOT all executive changes are tradeable - 85% require FOUR specific signals.',
      'The 8-K "no disagreements" clause is the #1 predictor of reversal vs crash.',
      'Internal successor = continuity. External search = leadership vacuum.',
      'The 3-day stabilization rule separates shakeouts from fundamental declines.',
      '"Uncertainty Premium" evaporates quickly when succession is clear (Huson et al.).',
      'CFO exits are slow recoveries (6 months) - skip unless all gold signals present.'
    ]
  },

  // === NEWS SHAKEOUT (OVERREACTION HYPOTHESIS) ===
  // Empirical Sources: De Bondt & Thaler (1985), Tetlock (2007), Atkins & Dyl (1990), Chan (2003)
  // Gold Standard: BUY the Overreaction Recovery (85%+ reversal)
  newsShakeout: {
    name: 'News Shakeout (Overreaction Hypothesis)',
    tier: 1,
    empiricalSources: [
      'De Bondt & Thaler (1985): "Does the Stock Market Overreact?" - Extreme losers outperform extreme winners',
      'Tetlock (2007): High media negativity predicts high trading volume and reversion to fundamentals',
      'Atkins & Dyl (1990): Transaction data confirms 2-5 day overreaction reversals for news events',
      'Chan (2003): News-driven drops revert 40-60% faster than non-news drops'
    ],
    telltales: [
      '📰 "NOISE" news: Analyst downgrade, guidance miss, litigation rumor, macro scare (TRANSIENT)',
      '📊 Volume Climax: Panic selling creates 5x+ average volume (selling exhaustion)',
      '📉 RSI Oversold: RSI drops below 25 (rubber band stretched to extreme)',
      '⏳ Three-Day Stabilization: Day 3 close > Day 2, price holds above Day 1 low'
    ],
    nlpFilter: {
      title: '📰 HEADLINE LINGUISTIC FILTER (Loughran & McDonald 2011, Tetlock 2007)',
      description: 'Markets overreact to SOFT info but underreact to HARD info. Use headline language to classify!',
      softInfo: {
        label: 'SOFT INFO → REVERSES (Buy the dip)',
        verbType: 'Subjective: "Fears," "Worries," "Concerns," "Uncertainty"',
        focus: 'Price-focused: "Plunges," "Tumbles," "Crashes"',
        content: 'Opinions, macro noise, rumors',
        timing: 'Often mid-day (reactive)',
        keywords: ['fears', 'concerns', 'worries', 'uncertainty', 'rumors', 'shadows', 'plunges']
      },
      hardInfo: {
        label: 'HARD INFO → CONTINUES (Do NOT buy)',
        verbType: 'Objective: "Files," "Reports," "Sues," "Investigation"',
        focus: 'Cause-focused: "Defaulted," "Fraud," "SEC Filing"',
        content: 'Earnings, fraud, contracts, regulatory action',
        timing: 'Before open / after close (planned)',
        keywords: ['fraud', 'investigation', 'SEC', 'files', 'recalls', 'bankruptcy', 'restatement']
      },
      goldStandard: '🏆 85% GOLD STANDARD: Company you know is healthy + SOFT news headline ("Fears") + 10% drop on record volume + Day 3: Insider cluster buying'
    },
    phases: {
      panic: {
        name: 'The Panic (Day 1)',
        timing: 'Day of news',
        priceImpact: '-8% to -25% drop',
        action: 'DO NOT BUY. Panic selling not finished. Wait for stabilization.',
        strategy: 'Forced sellers (margin calls, funds) create artificial selling pressure.'
      },
      stabilization: {
        name: 'Stabilization (Days 2-3)',
        timing: '48-72 hours post-panic',
        priceImpact: 'Range-bound, testing panic low',
        action: 'WATCH for: Day 3 close > Day 2 AND price above Day 1 low.',
        strategy: 'Forced selling clearing out. "Value buyers" starting to step in.'
      },
      entry: {
        name: 'Entry (Day 3-4)',
        timing: 'After 3-day stabilization confirmed',
        priceImpact: 'First green day, +2% to +5%',
        action: 'BUY when RSI < 25 + stabilization confirmed. This is Gold Standard entry.',
        strategy: 'Mean reversion beginning. "Transient" news = temporary, not structural.'
      },
      recovery: {
        name: 'Recovery (Days 4-14)',
        timing: '5-14 days post-panic',
        priceImpact: '+8% to +15% gap fill',
        action: 'HOLD for gap fill target. Trail stop at breakeven.',
        strategy: 'De Bondt & Thaler: Extreme losers outperform within 30-90 days.'
      },
      complete: {
        name: 'Complete',
        timing: 'Target reached or failed',
        priceImpact: 'Gap filled or reversal failed',
        action: 'TAKE PROFITS at gap fill target.',
        strategy: 'Mean reversion complete. Pattern cycle ends.'
      }
    },
    goldStandard: {
      criteria: [
        '✓ Transient News: News does NOT change 12-month outlook (not fraud, not bankruptcy)',
        '✓ Volume Climax: 5x+ average volume on panic day (selling exhaustion)',
        '✓ Three-Day Stabilization: Day 3 close > Day 2, price above Day 1 low',
        '✓ RSI Oversold: RSI < 25 (rubber band stretched to extreme, snap-back likely)'
      ],
      successRate: '85%+ when all 4 criteria met',
      partialRates: {
        newsOnly: '50% reversal (need more confirmation)',
        plusVolume: '65% reversal (selling exhaustion detected)',
        plusStabilization: '75% reversal (forced selling cleared)',
        goldStandard: '85%+ reversal (all 4 criteria - mean reversion confirmed)'
      }
    },
    expectedReturn: {
      goldStandard: '+8% to +15% gap fill (85% success)',
      partial: '+5% to +10% with 2-3 criteria (60-75% success)',
      failed: 'Value Trap: Terminal news → price keeps falling -20%+ (no recovery)',
      riskLevel: 'Entry ONLY after 3-day stabilization, never during panic'
    },
    vetoFactors: [
      '💀 Terminal News: Fraud, bankruptcy, delisting = NO RECOVERY (-40% probability)',
      '📉 No Volume Climax: Low volume drop = more selling to come (-15% probability)',
      '🔻 Failed Stabilization: Day 3 close < Day 2 = still falling (-20% probability)',
      '🌊 Sector Collapse: Whole sector falling, not stock-specific (-25% probability)',
      '📊 Prior Downtrend: Stock was already falling before news (-10% probability)'
    ],
    sellSignals: {
      timing: [
        '🎯 BUY: After 3-day stabilization + RSI < 25',
        '⏱️ HOLD: Through recovery phase (5-14 days)',
        '📊 SELL: At gap fill target (pre-panic price) OR +12% from entry',
        '🚪 STOP: If price breaks below panic low'
      ],
      priceTargets: {
        conservative: '+8% from panic low (secure recovery)',
        standard: '+12% from entry (typical overreaction recovery)',
        aggressive: 'Full gap fill to pre-panic price (15%+)'
      },
      exitStrategy: 'Exit if stabilization fails (new lows) or terminal news confirmed.'
    },
    keyLessons: [
      'Distinguish "News Shakeout" (reverses) from "Value Trap" (keeps falling)',
      'Transient news (analyst, rumor, miss) reverses. Terminal news (fraud, bankruptcy) does NOT.',
      'Volume Climax (5x+) = selling exhaustion. Low volume drop = more selling ahead.',
      'Three-Day Rule: Day 3 must close > Day 2. If not, stabilization failed.',
      'RSI < 25 = rubber band stretched to extreme. Mathematical mean reversion likely.'
    ]
  }
};

// Tutorial hint definitions for all phenomena and events
const TUTORIAL_HINTS = {
    // ========== FOMO Rally Exhaustion ==========
    // Empirical: Barber & Odean (2021), Da et al. (2024), Baltzer et al. (2023)
    fomoRally: {
        type: 'FOMO Rally Exhaustion',
        phases: {
            early: {
                day: 'Day 1-7 (Buildup)',
                description: 'Social mentions building 3-10x baseline. Retail "attention-driven buying" beginning (Barber & Odean).',
                implication: 'Too early to trade. Price deviation < 2 SD. Sentiment indicators not extreme yet.',
                action: 'WATCH - Monitor for 3+ SD extension and P/C ratio collapse.',
                timing: 'ENTRY: None yet. EXIT: N/A.',
                catalyst: 'Watch for: Mentions going viral (10x+), P/C ratio falling below 0.50'
            },
            mid: {
                day: 'Day 8-11 (Euphoria)',
                description: 'PARABOLIC phase. Price 3+ SD above MA. P/C ratio collapsing toward 0.40. "Positive feedback loop" active.',
                implication: 'Gold Standard criteria emerging. Mathematically unsustainable. "Marginal buyer" approaching.',
                action: 'PREPARE TO SHORT - Watch for blow-off top confirmation.',
                timing: 'ENTRY: Wait for blow-off. EXIT: If long, SELL NOW.',
                catalyst: 'Gold Standard setup: 3+ SD + P/C <0.4 + Volume surge = SHORT entry imminent'
            },
            late: {
                day: 'Day 12+ (Blow-off & Crash)',
                description: 'BLOW-OFF TOP: Gap up → close near low → record volume. This is "transfer of ownership" to FOMO buyers.',
                implication: '85% reversal probability. Barber & Odean: 30-90 day underperformance ahead.',
                action: 'SHORT NOW or BUY PUTS. Target 50-day MA.',
                timing: 'ENTRY: On first lower high (empirically optimal). EXIT: Cover at 50-day MA.',
                catalyst: '"First Day of Lower Highs" = confirmed top. Sentiment still high but price decaying.'
            }
        }
    },

    // ========== Panic Sell ==========
    panicSell: {
        type: 'Panic Sell-off',
        phases: {
            early: {
                day: '1-2 of ~5',
                description: 'Fear is gripping investors. Bad news or market conditions triggering widespread selling.',
                implication: 'Stock likely to fall further as panic spreads. More sellers than buyers.',
                action: 'AVOID BUYING - Let panic run its course. If holding, decide: cut losses or wait it out.'
            },
            mid: {
                day: '3-4 of ~5',
                description: 'Panic selling continues but may be moderating. Weak hands have mostly sold.',
                implication: 'Bottom may be forming. Value buyers starting to look for entry.',
                action: 'WATCH CLOSELY - Look for volume spike on green day as bottom signal.'
            },
            late: {
                day: '5+ of ~5',
                description: 'Panic exhaustion. Selling pressure diminishing as sellers run out.',
                implication: 'Recovery likely starting. Stock oversold and undervalued.',
                action: 'CONSIDER BUYING - Panic bottoms offer good entry. Start small position.'
            }
        }
    },

    // ========== Short Squeeze ==========
    shortSqueeze: {
        type: 'Short Squeeze',
        phases: {
            early: {
                day: '1-2 of ~5',
                description: 'Short sellers are being forced to buy back shares to cover losses. This creates explosive upward pressure.',
                implication: 'Violent upward moves as shorts panic-buy. Can surge 50-200%+ rapidly.',
                action: 'HIGH RISK PLAY - If entering, use small position. Set stop-loss. Take quick profits.',
                timing: 'ENTRY: On "EXPLODES" or "squeeze" news (Day 1 only). EXIT: Sell 50% at +30%, rest at +50%.',
                catalyst: 'Trigger: High short interest (25%+) + any positive news. Watch for "shorts scramble to cover".'
            },
            mid: {
                day: '2-3 of ~5',
                description: 'Squeeze intensifying. Short sellers in maximum pain. Retail piling on.',
                implication: 'Most explosive gains happen here but also most volatility.',
                action: 'TAKE PROFITS if holding. Extremely dangerous to enter now.',
                timing: 'ENTRY: DO NOT BUY. EXIT: Sell remaining position into strength.',
                catalyst: '"Squeeze continues" = sell into this strength. "Shorts bleeding" = exit window closing.'
            },
            late: {
                day: '4-5 of ~5',
                description: 'Most shorts have covered. Squeeze losing steam. Only FOMO buyers remain.',
                implication: 'Crash likely as no more short covering to fuel rally. Bag holders created.',
                action: 'EXIT IMMEDIATELY if holding. DO NOT BUY - you will likely lose money.',
                timing: 'ENTRY: NEVER. EXIT: IMMEDIATELY - sell 100% at any price.',
                catalyst: '"Squeeze exhausted" or "rally fades" = crash starting. Late buyers get crushed -30% to -50%.'
            }
        }
    },

    // ========== Mean Reversion ==========
    meanReversion: {
        type: 'Mean Reversion',
        description: 'Stock has moved too far from its average price and is reverting back toward normal levels.',
        implication: 'Extreme moves tend to correct. Overbought stocks fall, oversold stocks rise.',
        action: 'CONTRARIAN PLAY - Buy oversold stocks, sell/short overbought stocks. Wait for confirmation.'
    },

    // ========== Volume Spike ==========
    volumeSpike: {
        type: 'Volume Spike',
        description: 'Trading volume is abnormally high. This indicates strong interest and often precedes big moves.',
        implication: 'High volume on UP day = bullish (accumulation). High volume on DOWN day = bearish (distribution).',
        action: 'PAY ATTENTION - Volume confirms price moves. Low volume moves are unreliable.'
    },

    // ========== Gap Up/Down ==========
    gap: {
        up: {
            type: 'Gap Up',
            description: 'Stock opened significantly higher than previous close due to overnight news or pre-market activity.',
            implication: 'Strong bullish signal, but gaps often partially fill. Profit-taking may occur.',
            action: 'CAUTION BUYING - Gap ups often retrace. Consider waiting for pullback or buying small.'
        },
        down: {
            type: 'Gap Down',
            description: 'Stock opened significantly lower than previous close due to overnight developments.',
            implication: 'Bearish signal, but oversold gaps can bounce. Panic selling may be overdone.',
            action: 'WAIT FOR STABILIZATION - Gap downs can continue falling. Don\'t catch falling knives.'
        }
    },

    // ========== Momentum Play ==========
    momentum: {
        type: 'Momentum',
        description: 'Stock is trending strongly in one direction. Momentum tends to persist in the short term.',
        implication: 'Strong stocks tend to stay strong, weak stocks tend to stay weak (in short term).',
        action: 'TREND FOLLOWING - Buy strength, sell weakness. Don\'t fight the trend.'
    },

    // ========== Fed Rate Decision ==========
    fedRate: {
        hike: {
            type: 'Fed Rate Hike',
            description: 'Federal Reserve is raising interest rates to fight inflation. Borrowing becomes more expensive.',
            implication: 'Higher rates hurt growth stocks (TECH) most. Banks may benefit. Real estate weakens.',
            action: 'ROTATE: Reduce TECH exposure, consider bank stocks. Expect market volatility.'
        },
        cut: {
            type: 'Fed Rate Cut',
            description: 'Federal Reserve is cutting interest rates to stimulate economy. Cheaper borrowing.',
            implication: 'Lower rates boost growth stocks (TECH). Real estate benefits. Banks may suffer.',
            action: 'ROTATE: Increase TECH and growth exposure. Good for risk assets.'
        },
        hold: {
            type: 'Fed Holds Rates',
            description: 'Federal Reserve keeping rates unchanged. Market gets stability signal.',
            implication: 'Current trends likely to continue. Less volatility expected.',
            action: 'STATUS QUO - Continue current strategy. No major rotation needed.'
        }
    },

    // ========== Market Crash ==========
    crash: {
        type: 'Market Crash',
        phases: {
            acute: {
                day: '1-3',
                description: 'Severe market downturn. Fear at maximum. Margin calls forcing selling.',
                implication: 'EVERYTHING falls in a crash. Even good stocks get sold.',
                action: 'PRESERVE CAPITAL - Don\'t try to catch falling knife. Cash is king.'
            },
            recovery: {
                day: '4+',
                description: 'Initial panic subsiding. Bargain hunters emerging. Volatility still high.',
                implication: 'Best companies recover first. Quality matters in recovery.',
                action: 'START NIBBLING - Buy quality stocks in small amounts. Average in slowly.'
            }
        }
    },

    // ========== Economic Boom ==========
    boom: {
        type: 'Economic Boom',
        description: 'Economy is expanding rapidly. Corporate profits rising. Employment strong.',
        implication: 'Most stocks benefit in boom. Cyclical stocks (INDUS) outperform.',
        action: 'STAY INVESTED - Rising tide lifts all boats. Focus on cyclical sectors.'
    },

    // ========== Recession ==========
    recession: {
        type: 'Recession',
        description: 'Economic contraction. Corporate profits falling. Unemployment rising.',
        implication: 'Defensive stocks (utilities, healthcare) outperform. Cyclicals suffer.',
        action: 'DEFENSIVE POSTURE - Reduce exposure. Hold cash. Quality over quantity.'
    },

    // ========== Inflation Spike ==========
    inflation: {
        high: {
            type: 'High Inflation',
            description: 'Prices rising rapidly. Purchasing power declining. Fed likely to act.',
            implication: 'Growth stocks hurt by higher rate expectations. Commodities benefit.',
            action: 'INFLATION HEDGE - Consider real assets, commodities. Reduce growth stock exposure.'
        },
        low: {
            type: 'Low Inflation',
            description: 'Prices stable or falling. May indicate weak demand.',
            implication: 'Fed may cut rates. Growth stocks benefit. Commodities weaken.',
            action: 'GROWTH FOCUS - Low inflation supports growth stock valuations.'
        }
    },

    // ========== Earnings Report ==========
    earnings: {
        beat: {
            type: 'Earnings Beat',
            description: 'Company exceeded analyst expectations. Business performing better than predicted.',
            implication: 'Stock often rises on beat, but "sell the news" reaction possible if priced in.',
            action: 'CHECK GUIDANCE - Future outlook matters more than past results.'
        },
        miss: {
            type: 'Earnings Miss',
            description: 'Company missed analyst expectations. Business underperforming.',
            implication: 'Stock often falls on miss. May create buying opportunity if temporary.',
            action: 'ASSESS CAUSE - One-time issue or structural problem? One-time = buy opportunity.'
        }
    },

    // ========== Sector Rotation ==========
    sectorRotation: {
        type: 'Sector Rotation',
        description: 'Money flowing from one sector to another based on economic cycle or sentiment.',
        implication: 'Leading sectors change throughout market cycles. Follow the money.',
        action: 'FOLLOW THE FLOW - Reduce lagging sectors, increase leading sectors.'
    },

    // ========== Dividend News ==========
    dividend: {
        increase: {
            type: 'Dividend Increase',
            description: 'Company raising dividend payment. Sign of financial strength and confidence.',
            implication: 'Stock often rises. Attracts income investors. Shows healthy cash flow.',
            action: 'BULLISH SIGNAL - Dividend growth indicates management confidence.'
        },
        cut: {
            type: 'Dividend Cut',
            description: 'Company reducing dividend payment. Sign of financial stress.',
            implication: 'Stock often falls sharply. Income investors exit. Cash flow concerns.',
            action: 'WARNING SIGN - Investigate why. May be buying opportunity or red flag.'
        }
    },

    // ========== IPO / New Stock ==========
    ipo: {
        type: 'IPO / New Listing',
        description: 'New stock entering the market. High uncertainty and volatility typical.',
        implication: 'IPOs often volatile for first weeks. May be overpriced due to hype.',
        action: 'WAIT AND SEE - Let price discover fair value. IPO pop often followed by decline.'
    },

    // ========== Merger & Acquisition ==========
    merger: {
        acquirer: {
            type: 'Acquisition (Buyer)',
            description: 'Company is buying another company. Using cash or stock to expand.',
            implication: 'Acquirer stock often falls short-term (paying premium). Long-term depends on synergies.',
            action: 'EVALUATE DEAL - Is price fair? Strategic fit? Watch for integration issues.'
        },
        target: {
            type: 'Acquisition (Target)',
            description: 'Company is being bought. Usually at premium to current price.',
            implication: 'Target stock rises to deal price. Limited upside unless bidding war.',
            action: 'ARBS OPPORTUNITY - Gap between current and deal price reflects deal risk.'
        }
    },

    // ========== Stock Split ==========
    stockSplit: {
        type: 'Stock Split Announced',
        description: 'Company dividing shares to lower price per share. "Cosmetic" but psychologically powerful.',
        implication: 'Expect +15-25% run-up to effective date. BUT: the Gold Standard trade is the REVERSAL.',
        action: 'DO NOT BUY NOW. Wait for T+3 after effective day to SHORT the post-split hangover.',
        timing: 'ENTRY: T+3 after split effective (short). EXIT: 5-7 days for 5-10% reversal gain.',
        catalyst: 'Watch for: 15%+ run-up, OTM call spike on effective day, then T+3 lower high = 77% reversal setup.'
    },

    // ========== Buyback ==========
    buyback: {
        type: 'Stock Buyback',
        description: 'Company repurchasing its own shares. Reduces shares outstanding.',
        implication: 'Increases earnings per share. Sign company thinks stock undervalued.',
        action: 'BUY - Management buying their own stock = confidence signal. Stock should be supported.',
        timing: 'ENTRY: On buyback announcement. EXIT: Hold for steady appreciation or next earnings.',
        catalyst: 'Company provides floor under stock price. Gradual appreciation expected.'
    },

    // ========== Insider Trading ==========
    insider: {
        buying: {
            type: 'Insider Buying',
            description: 'Company executives buying stock with their own money.',
            implication: 'Insiders know the company best. Buying OFTEN (not always) suggests upcoming catalyst.',
            action: 'BUY with caution - ~70% of time catalyst follows. ~30% it\'s routine or bad timing. Position size accordingly.',
            timing: 'ENTRY: On insider buying news. EXIT: On catalyst announcement OR if "10b5-1 plan" revealed.',
            catalyst: 'Expected (70%): Better guidance, major contract, regulatory approval. Fizzle (30%): Routine plan, bad timing.',
            warning: '⚠️ 10b5-1 scheduled purchases are NOT real signals - they\'re pre-planned and routine.'
        },
        selling: {
            type: 'Insider Selling',
            description: 'Company executives selling stock.',
            implication: 'May be routine diversification or red flag. Context matters.',
            action: 'CAUTION - Routine selling is normal. Cluster selling (multiple executives) is a warning sign. Consider reducing position.'
        }
    },

    // ========== Analyst Rating ==========
    analyst: {
        upgrade: {
            type: 'Analyst Upgrade',
            description: 'Wall Street analyst raising rating or price target.',
            implication: 'May attract institutional buying. Stock often rises short-term.',
            action: 'SENTIMENT BOOST - Upgrades help, but do your own research.'
        },
        downgrade: {
            type: 'Analyst Downgrade',
            description: 'Wall Street analyst lowering rating or price target.',
            implication: 'May trigger institutional selling. Stock often falls short-term.',
            action: 'EVALUATE REASONING - Sometimes downgrades create buying opportunities.'
        }
    },

    // ========== Options Activity ==========
    options: {
        callSweep: {
            type: 'Unusual Call Buying',
            description: 'Large call option purchases detected. Someone betting on upside.',
            implication: 'Smart money may know something. Bullish positioning.',
            action: 'WATCH CLOSELY - Follow unusual options activity. May signal coming move.'
        },
        putSweep: {
            type: 'Unusual Put Buying',
            description: 'Large put option purchases detected. Someone betting on downside.',
            implication: 'Hedging or bearish bet. May signal concerns.',
            action: 'CAUTION - Large put buying may indicate expected decline.'
        }
    },

    // ========== Short Interest ==========
    shortInterest: {
        high: {
            type: 'High Short Interest',
            description: 'Many investors betting against this stock by shorting it.',
            implication: 'High risk of short squeeze if stock rises. Also indicates skepticism.',
            action: 'WAIT for trigger - High SI is the FUEL, not the fire. Need positive catalyst to ignite squeeze.',
            timing: 'ENTRY: Only AFTER positive catalyst news arrives. EXIT: Follow squeeze timing.',
            catalyst: 'Squeeze trigger: Any positive news (earnings beat, upgrade, contract). Watch for "shorts scramble".'
        },
        low: {
            type: 'Low Short Interest',
            description: 'Few investors betting against this stock.',
            implication: 'Less squeeze potential. General confidence in stock.',
            action: 'NORMAL CONDITIONS - Trade based on fundamentals and technicals.'
        }
    },

    // ========== Market Sentiment ==========
    sentiment: {
        extreme_greed: {
            type: 'Extreme Greed',
            description: 'Market sentiment is extremely bullish. Everyone is buying.',
            implication: 'Markets often top when greed is extreme. Be cautious.',
            action: 'CONTRARIAN WARNING - "Be fearful when others are greedy."'
        },
        extreme_fear: {
            type: 'Extreme Fear',
            description: 'Market sentiment is extremely bearish. Everyone is selling.',
            implication: 'Markets often bottom when fear is extreme. Opportunity?',
            action: 'CONTRARIAN OPPORTUNITY - "Be greedy when others are fearful."'
        },
        greed: {
            type: 'Market Greed',
            description: 'Market sentiment is bullish. Optimism prevailing.',
            implication: 'Uptrend may continue but watch for signs of exhaustion.',
            action: 'STAY ALERT - Ride the trend but have exit plan.'
        },
        fear: {
            type: 'Market Fear',
            description: 'Market sentiment is bearish. Pessimism prevailing.',
            implication: 'Downtrend may continue but watch for capitulation.',
            action: 'BE PATIENT - Wait for fear to peak before buying.'
        }
    },

    // ========== General Market ==========
    marketUp: {
        type: 'Market Rally',
        description: 'Broad market is rising. Most stocks moving higher.',
        implication: 'Bull market conditions. Easier to make money when tide is rising.',
        action: 'STAY LONG - Don\'t fight the trend. Use pullbacks to add.'
    },
    marketDown: {
        type: 'Market Decline',
        description: 'Broad market is falling. Most stocks moving lower.',
        implication: 'Bear market conditions. Even good stocks can fall.',
        action: 'DEFENSIVE - Reduce exposure, raise cash, wait for bottom.'
    },

    // ========== Crypto Related ==========
    crypto: {
        surge: {
            type: 'Crypto Surge',
            description: 'Cryptocurrency prices spiking. Risk-on sentiment.',
            implication: 'Crypto often leads speculative assets. Tech may follow.',
            action: 'RISK-ON SIGNAL - Speculative appetite high. Growth may outperform.'
        },
        crash: {
            type: 'Crypto Crash',
            description: 'Cryptocurrency prices crashing. Risk-off sentiment.',
            implication: 'Crypto weakness may spill into tech stocks.',
            action: 'RISK-OFF WARNING - Speculative appetite low. Be cautious on growth.'
        }
    },

    // ========== Generic News Types ==========
    regulatory: {
        positive: {
            type: 'Positive Regulatory News',
            description: 'Favorable government or regulatory action for the company/sector.',
            implication: 'Reduced uncertainty. May unlock growth opportunities.',
            action: 'BULLISH - Regulatory tailwinds support stock price.'
        },
        negative: {
            type: 'Negative Regulatory News',
            description: 'Unfavorable government or regulatory action. Fines, restrictions, investigations.',
            implication: 'Increased uncertainty. May limit growth or cause losses.',
            action: 'CAUTIOUS - Assess severity. May create opportunity if overreaction.'
        }
    },

    // ========== War/Geopolitical ==========
    geopolitical: {
        war: {
            type: 'Geopolitical Conflict',
            description: 'War, military action, or severe international tensions.',
            implication: 'Defense stocks benefit. Oil spikes. Broad market fear.',
            action: 'FLIGHT TO SAFETY - Defense, energy benefit. Risk assets suffer.'
        },
        peace: {
            type: 'Geopolitical Resolution',
            description: 'Peace agreement, de-escalation, or diplomatic breakthrough.',
            implication: 'Risk-on return. Defense may sell off. Broad relief rally.',
            action: 'RISK-ON - Resume normal positioning. Relief rally likely.'
        }
    },

    // ========== Default/Unknown ==========
    default: {
        type: 'Market News',
        description: 'Standard market news or company update.',
        implication: 'Assess the specific content and affected stocks.',
        action: 'EVALUATE - Read carefully and consider impact on your positions.'
    }
};

// Get tutorial info for a news item based on its type and phenomena
function getTutorialForNews(newsItem) {
    if (!gameSettings || !gameSettings.tutorialMode) return null;
    
    const tutorial = {
        type: 'Market News',
        day: null,
        description: '',
        implication: '',
        action: ''
    };
    
    // ========== Check for FOMO news ==========
    if (newsItem.isFOMO || newsItem.newsType === 'fomo') {
        const phase = newsItem.fomoPhase || 'building';
        let tutorialPhase = 'early';
        if (phase === 'blowoff') tutorialPhase = 'late';
        else if (phase === 'collapse') tutorialPhase = 'late';
        
        const hint = TUTORIAL_HINTS.fomoRally.phases[tutorialPhase];
        tutorial.type = `${TUTORIAL_HINTS.fomoRally.type} (${phase} phase)`;
        tutorial.description = hint.description;
        tutorial.implication = hint.implication;
        tutorial.action = hint.action;
        tutorial.timing = hint.timing;
        tutorial.catalyst = hint.catalyst;
        return tutorial;
    }
    
    // ========== Check for Capitulation news ==========
    if (newsItem.isCapitulation || newsItem.newsType === 'capitulation') {
        const hint = TUTORIAL_HINTS.panicSell.phases.late;
        tutorial.type = 'Capitulation (Extreme Panic)';
        tutorial.description = 'Investors have given up. Extreme selling = extreme fear. This is often when bottoms form.';
        tutorial.implication = hint.implication;
        tutorial.action = 'CONTRARIAN BUY - "Blood in the streets" = buying opportunity. Start small position.';
        tutorial.timing = 'ENTRY: On capitulation news (Day 0). EXIT: On reversal news (+15-25% profit).';
        tutorial.catalyst = 'Expected: V-shaped reversal within 1-3 days. Watch for "REVERSING - was that the bottom?" news.';
        return tutorial;
    }
    
    // ========== Check for Short Squeeze news ==========
    if (newsItem.isShortSqueeze || newsItem.newsType === 'short_squeeze') {
        const phase = newsItem.squeezePhase || 'squeeze';
        let tutorialPhase = 'early';
        if (phase === 'covering') tutorialPhase = 'mid';
        else if (phase === 'unwind') tutorialPhase = 'late';
        
        const hint = TUTORIAL_HINTS.shortSqueeze.phases[tutorialPhase];
        tutorial.type = `${TUTORIAL_HINTS.shortSqueeze.type} (${phase} phase)`;
        tutorial.description = hint.description;
        tutorial.implication = hint.implication;
        tutorial.action = hint.action;
        tutorial.timing = hint.timing;
        tutorial.catalyst = hint.catalyst;
        return tutorial;
    }
    
    // ========== Check for Manipulation news ==========
    if (newsItem.isManipulation || newsItem.newsType === 'manipulation') {
        tutorial.type = 'Potential Manipulation (Pump & Dump)';
        tutorial.description = 'Suspicious trading activity detected. Could be pump-and-dump scheme. Volume without news = red flag.';
        tutorial.implication = 'High risk of sudden reversal. Early buyers may profit but late buyers get burned.';
        tutorial.action = 'EXTREME CAUTION - If playing, sell at +25-30%. Never hold through "consolidation".';
        tutorial.timing = 'ENTRY: Only on first pump (risky). EXIT: Sell 100% during pump, NEVER hold.';
        tutorial.catalyst = 'Multi-wave warning: "Consolidation" after pump = more waves coming = bigger crash. Each wave traps more retail.';
        return tutorial;
    }
    
    // ========== Dead Cat Bounce / Crash Resolution / Recovery hints ==========
    // All DCB-related hints are now generated by getDeadCatBounceTutorialHint() in deadCatBounce.js
    if (newsItem.isDeadCatBounce || newsItem.newsType === 'dead_cat_bounce' ||
        newsItem.isCrashResolution || newsItem.newsType === 'crash_resolution' ||
        newsItem.isRecovery || newsItem.newsType === 'recovery') {
        const dcbHint = getDeadCatBounceTutorialHint(newsItem);
        if (dcbHint && dcbHint.type) {
            return dcbHint;
        }
    }
    
    // ========== Index Rebalancing hints ==========
    // All Index Rebalance hints are generated by getIndexRebalanceTutorialHint() in indexRebalance.js
    if (newsItem.isIndexRebalance || newsItem.newsType === 'index_rebalance') {
        const indexHint = getIndexRebalanceTutorialHint(newsItem);
        if (indexHint && indexHint.type) {
            return indexHint;
        }
    }
    
    // ========== Insider Buying hints ==========
    // All Insider Buying hints are generated by getInsiderBuyingTutorialHint() in insiderBuying.js
    if (newsItem.isInsiderBuy || newsItem.newsType === 'insider_buy') {
        const insiderHint = getInsiderBuyingTutorialHint(newsItem);
        if (insiderHint && insiderHint.type) {
            return insiderHint;
        }
    }
    
    // ========== Insider Selling hints ==========
    // All Insider Selling hints are generated by getInsiderSellingTutorialHint() in insiderSelling.js
    if (newsItem.isInsiderSell || newsItem.newsType === 'insider_sell') {
        const insiderSellHint = getInsiderSellingTutorialHint(newsItem);
        if (insiderSellHint && insiderSellHint.type) {
            return insiderSellHint;
        }
    }
    
    // ========== Short Seller Report hints ==========
    // SSR hints are generated by getShortReportTutorialHint() in shortSellerReport.js
    if (newsItem.isShortReport || newsItem.newsType === 'short_report') {
        const ssrHint = getShortReportTutorialHint(newsItem);
        if (ssrHint && ssrHint.type) {
            return ssrHint;
        }
    }
    
    // ========== Stock Split hints ==========
    // All Stock Split hints are generated by getStockSplitTutorialHint() in stockSplit.js
    if (newsItem.isStockSplit || newsItem.newsType === 'stock_split') {
        const splitHint = getStockSplitTutorialHint(newsItem);
        if (splitHint && splitHint.type) {
            return splitHint;
        }
    }
    
    // ========== Liquidity Sweep hints ==========
    // Wyckoff Spring / Stop-Run Reversal (85% Gold Standard)
    if (newsItem.type === 'liquidity_sweep' || newsItem.newsType === 'liquidity_sweep') {
        const phase = newsItem.phase || 'setup';
        const goldCount = newsItem.goldStandardCount || 0;
        
        if (phase === 'setup') {
            tutorial.type = 'Liquidity Sweep SETUP - Watch for Sweep';
            tutorial.description = 'Stock approaching OBVIOUS support level. Stop-losses accumulating below.';
            tutorial.implication = 'Institutions may "sweep" these stops to fill large buy orders cheaply.';
            tutorial.action = 'WATCH - Do NOT place stops at obvious levels. Wait for sweep → recovery pattern.';
            tutorial.timing = 'ENTRY: None yet. Wait for sweep → absorption → re-entry signal.';
            tutorial.catalyst = 'Wyckoff Spring: The more "obvious" the support, the more liquidity sits below it.';
        } else if (phase === 'sweep') {
            tutorial.type = 'Liquidity Sweep IN PROGRESS - Stop Run Active';
            tutorial.description = 'Price breaking BELOW support on high volume. Stop-losses triggered. This is the "sweep."';
            tutorial.implication = 'If institutions are absorbing supply, price will quickly recover. Watch for absorption volume.';
            tutorial.action = 'DO NOT PANIC SELL. Watch for: (1) Volume spike + (2) Price fails to close lower.';
            tutorial.timing = 'ENTRY: NOT YET. Wait for price to RECLAIM support (re-entry signal).';
            tutorial.catalyst = 'Gold Standard check: Is this absorption (high vol + recovery) or real breakdown (closes lower)?';
        } else if (phase === 'recovery' || phase === 'absorption') {
            tutorial.type = `Liquidity Sweep RECOVERY - ${goldCount}/4 Gold Standard`;
            tutorial.description = 'Price snapping back above support. "Failed breakdown" confirming. Absorption volume detected.';
            tutorial.implication = goldCount >= 4 ? '85%+ reversal probability (Gold Standard)' : `${goldCount}/4 criteria met. ~${45 + goldCount * 10}% probability.`;
            tutorial.action = goldCount >= 3 ? 'BUY NOW - Re-entry confirmed. Classic Wyckoff Spring.' : 'CONSIDER BUY - Some criteria missing, lower probability.';
            tutorial.timing = 'ENTRY: On reclaim of support (this is Gold Standard entry). EXIT: +8% to +15% target.';
            tutorial.catalyst = `Gold Standard (${goldCount}/4): Obvious support ✓, False breakout ✓, Absorption volume ${goldCount >= 3 ? '✓' : '?'}, Re-entry ${goldCount >= 4 ? '✓' : '?'}`;
        } else if (phase === 'continuation') {
            tutorial.type = 'Liquidity Sweep CONTINUATION - Holding Position';
            tutorial.description = 'Sweep reversal playing out. "Liquidity vacuum" propelling price higher.';
            tutorial.implication = 'No sellers left below. Path of least resistance is UP.';
            tutorial.action = 'HOLD - Trail stop at breakeven. Target +8% to +15%.';
            tutorial.timing = 'ENTRY: Late but ok if still near support. EXIT: At target or if price fails re-test.';
            tutorial.catalyst = 'Aggarwal & Wu (2006): Institutional order flow creates "vacuum" after sweep absorbs supply.';
        } else if (phase === 'complete') {
            tutorial.type = 'Liquidity Sweep COMPLETE';
            tutorial.description = 'Sweep event finished. Pattern played out.';
            tutorial.implication = newsItem.sentiment > 0 ? 'Successful reversal - typical +8% to +15% gain.' : 'Failed sweep - price continued lower after false signal.';
            tutorial.action = 'TAKE PROFITS if holding. Trade complete.';
            tutorial.timing = 'ENTRY: N/A. EXIT: Sell remaining position.';
            tutorial.catalyst = 'Key lesson: Gold Standard (4/4 criteria) = 85% success. Partial criteria = lower odds.';
        } else if (phase === 'failed') {
            tutorial.type = 'Liquidity Sweep FAILED - Not All Criteria Met';
            tutorial.description = 'Sweep reversal did NOT materialize. Price failed to hold above support.';
            tutorial.implication = 'Only partial criteria met. This was a REAL breakdown, not a sweep.';
            tutorial.action = 'EXIT if holding. The sweep failed - price likely continues lower.';
            tutorial.timing = 'ENTRY: DO NOT BUY. EXIT: Stop out at sweep low if still holding.';
            tutorial.catalyst = 'Lesson: Gold Standard filter WORKS. Partial criteria = lower success rate for a reason.';
        }
        return tutorial;
    }

    // ========== News Shakeout hints ==========
    // Overreaction Hypothesis / Event-Driven Mean Reversion (85% Gold Standard)
    // Empirical: De Bondt & Thaler (1985), Tetlock (2007), Atkins & Dyl (1990), Chan (2003)
    if (newsItem.type === 'news_shakeout' || newsItem.newsType === 'news_shakeout') {
        const phase = newsItem.phase || 'panic';
        const goldCount = newsItem.goldStandardCount || 0;
        const isTransient = newsItem.isTransient !== false;
        const newsType = newsItem.triggerNews || 'unknown';
        
        if (phase === 'panic') {
            tutorial.type = 'News Shakeout PANIC - Do Not Buy Yet';
            tutorial.description = `News-driven panic drop (${newsType}). Forced sellers (margin calls, funds) dumping shares.`;
            tutorial.implication = 'Panic selling NOT finished. More downside possible in next 24-48 hours.';
            tutorial.action = 'DO NOT BUY. Wait for 3-day stabilization pattern before entry.';
            tutorial.timing = 'ENTRY: NOT YET. Wait for Day 3 close > Day 2. EXIT: N/A.';
            tutorial.catalyst = isTransient ? 
                'NEWS TYPE: TRANSIENT (analyst downgrade, guidance miss, rumor). Mean reversion likely.' :
                '⚠️ WARNING: Terminal news (fraud, bankruptcy) does NOT reverse. Verify news type!';
        } else if (phase === 'stabilization') {
            tutorial.type = `News Shakeout STABILIZATION - ${goldCount}/4 Gold Standard`;
            tutorial.description = 'Forced selling clearing out. Watching for 3-day stabilization pattern.';
            tutorial.implication = goldCount >= 2 ? 
                `Stabilization in progress. ${goldCount}/4 criteria met. Wait for Day 3 confirmation.` :
                'Too early to confirm stabilization. Need more criteria.';
            tutorial.action = 'WATCH - Key test: Does Day 3 close ABOVE Day 2? Price must hold above panic low.';
            tutorial.timing = 'ENTRY: Wait for Day 3+ confirmation. EXIT: N/A.';
            tutorial.catalyst = `De Bondt & Thaler (1985): Extreme losers outperform. Waiting for selling exhaustion to confirm.`;
        } else if (phase === 'entry') {
            tutorial.type = `News Shakeout ENTRY SIGNAL - ${goldCount}/4 Gold Standard`;
            tutorial.description = '3-day stabilization CONFIRMED. RSI oversold. Mean reversion beginning.';
            tutorial.implication = goldCount >= 4 ? 
                '85%+ reversal probability (Gold Standard). De Bondt & Thaler pattern confirmed.' : 
                `${goldCount}/4 criteria met. ~${50 + goldCount * 10}% probability.`;
            tutorial.action = goldCount >= 3 ? 
                'BUY NOW - Stabilization confirmed. Classic overreaction reversal.' : 
                'CONSIDER BUY - Some criteria missing, lower probability.';
            tutorial.timing = 'ENTRY: On first green day after stabilization. EXIT: +8% to +15% gap fill target.';
            tutorial.catalyst = `Gold Standard (${goldCount}/4): Transient news ${goldCount >= 1 ? '✓' : '?'}, Volume climax ${goldCount >= 2 ? '✓' : '?'}, Stabilization ${goldCount >= 3 ? '✓' : '?'}, RSI < 25 ${goldCount >= 4 ? '✓' : '?'}`;
        } else if (phase === 'recovery') {
            tutorial.type = 'News Shakeout RECOVERY - Gap Fill in Progress';
            tutorial.description = 'Mean reversion playing out. Price recovering toward pre-panic level.';
            tutorial.implication = 'De Bondt & Thaler: Extreme losers outperform within 30-90 days.';
            tutorial.action = 'HOLD - Trail stop at breakeven. Target gap fill (pre-panic price).';
            tutorial.timing = 'ENTRY: Late but ok if still below gap fill. EXIT: At gap fill target.';
            tutorial.catalyst = 'Tetlock (2007): High media negativity predicts reversion to fundamentals within 5-10 days.';
        } else if (phase === 'complete') {
            tutorial.type = 'News Shakeout COMPLETE';
            tutorial.description = 'Overreaction recovery finished. Gap filled or pattern concluded.';
            tutorial.implication = newsItem.sentiment > 0 ? 
                'Successful reversal - typical +8% to +15% gain from panic low.' : 
                'Value trap - terminal news prevented recovery.';
            tutorial.action = 'TAKE PROFITS if holding. Trade complete.';
            tutorial.timing = 'ENTRY: N/A. EXIT: Sell remaining position.';
            tutorial.catalyst = 'Key lesson: Transient news reverses (85%). Terminal news (fraud, bankruptcy) = value trap.';
        } else if (phase === 'failed' || phase === 'value_trap') {
            tutorial.type = 'News Shakeout FAILED - Value Trap';
            tutorial.description = 'Recovery did NOT materialize. This was NOT overreaction - news was structural.';
            tutorial.implication = 'Terminal news confirmed. Price likely continues lower. Cut losses.';
            tutorial.action = 'EXIT if holding. This is a VALUE TRAP, not a shakeout.';
            tutorial.timing = 'ENTRY: DO NOT BUY. EXIT: Stop out at panic low if still holding.';
            tutorial.catalyst = 'Lesson: Distinguish "News Shakeout" (transient) from "Value Trap" (terminal). Gold Standard filter helps.';
        }
        return tutorial;
    }
    
    // ========== Check for Executive Change news ==========
    if (newsItem.isExecutiveChange || newsItem.newsType === 'executive_change') {
        const phase = newsItem.executiveChangePhase || 'announced';
        const role = newsItem.executiveRole || 'CEO';
        
        if (phase === 'announced') {
            tutorial.type = `Executive Replacement (${role}) - Initial Dip`;
            tutorial.description = `${role} REPLACEMENT announced (successor named). Different from "sudden departure" - this is PLANNED transition.`;
            tutorial.implication = 'Initial -3% to -8% dip is normal. Recovery expected in 1-2 weeks ("honeymoon period").';
            tutorial.action = 'CONSIDER BUYING THE DIP - Planned transitions with named successor typically bounce.';
            tutorial.timing = 'ENTRY: On dip after announcement. EXIT: +8% to +15% during honeymoon phase.';
            tutorial.catalyst = 'KEY DIFFERENCE: "Sudden departure + no successor" = BAD (crash). "Transition + successor named" = recovery pattern.';
        } else if (phase === 'transition') {
            tutorial.type = `Executive Transition (${role}) - Stabilizing`;
            tutorial.description = 'New leader meeting investors, outlining vision. Uncertainty decreasing.';
            tutorial.implication = 'Dip likely bottomed. "Honeymoon period" rally incoming.';
            tutorial.action = 'BUY if you haven\'t - Transition proceeding well. Rally building.';
            tutorial.timing = 'ENTRY: Still good entry. EXIT: +8% to +15% during honeymoon phase.';
            tutorial.catalyst = 'Expected: "Fresh start" narrative → stock recovers as market gives new leader benefit of doubt.';
        } else if (phase === 'honeymoon') {
            tutorial.type = `Executive Honeymoon (${role}) - Recovery Rally`;
            tutorial.description = 'Market giving new leader benefit of doubt. "Fresh start" optimism driving rally.';
            tutorial.implication = 'Recovery in progress. Pattern typically lasts 1-2 weeks.';
            tutorial.action = 'HOLD or TAKE PARTIAL PROFITS - Honeymoon rally playing out.';
            tutorial.timing = 'ENTRY: Late but still ok. EXIT: Consider selling +10% to +15% from dip.';
            tutorial.catalyst = 'Reality check: Honeymoon period ends eventually. Stock returns to fundamentals after enthusiasm fades.';
        } else if (phase === 'complete') {
            tutorial.type = `Executive Transition Complete`;
            tutorial.description = 'Leadership transition finished. Stock returns to trading on fundamentals.';
            tutorial.implication = 'Transition premium fully priced in. No more easy gains.';
            tutorial.action = 'TAKE PROFITS if holding - Easy trade over. Future depends on execution.';
            tutorial.timing = 'ENTRY: No longer attractive. EXIT: Sell remaining position.';
            tutorial.catalyst = 'Trade complete. Watch for actual business results under new leadership.';
        }
        return tutorial;
    }
    
    // ========== Check for Strategic Pivot news (4-Type Framework) ==========
    if (newsItem.isStrategicPivot || newsItem.newsType === 'strategic_pivot') {
        const phase = newsItem.strategicPivotPhase || 'announced';
        const pivotType = newsItem.pivotType || 'symbolic';
        const signals = newsItem.pivotSignals || {};
        const goldSignalsMet = signals.goldSignalsMet || 0;
        
        const typeLabels = {
            reactive: 'REACTIVE (⛔ <10% reversal)',
            structural: 'STRUCTURAL (⚠️ 30% reversal)',
            symbolic: 'SYMBOLIC (📈 65% reversal)',
            gold_standard: 'GOLD STANDARD (🏆 85%+ reversal)'
        };
        
        const typeLabel = typeLabels[pivotType] || 'Strategic Pivot';
        
        // Generate signal summary
        let signalSummary = '';
        if (signals.nonDilutive) signalSummary += signals.nonDilutive.isMet ? '✓ Non-Dilutive ' : '✗ Dilutive ';
        if (signals.anchorRevenue) signalSummary += signals.anchorRevenue.isMet ? '✓ Anchor Revenue ' : '✗ No Anchor ';
        if (signals.insiderBuy) signalSummary += signals.insiderBuy.isMet ? '✓ INSIDER BUY ' : '✗ No Insider Buy ';
        if (signals.gapFill) signalSummary += signals.gapFill.isMet ? '✓ Gap Fill ' : '✗ No Gap Fill ';
        
        if (phase === 'announced') {
            if (pivotType === 'reactive') {
                tutorial.type = `${typeLabel} - AVOID`;
                tutorial.description = 'Dying firm grasping at straws. Revenue collapsing, this is desperation not opportunity.';
                tutorial.implication = '<10% reversal probability. Stock likely continues lower. NOT a dip to buy.';
                tutorial.action = '⛔ DO NOT BUY - This is permanent re-rating, not market overreaction.';
                tutorial.timing = 'ENTRY: NEVER. EXIT: N/A - avoid completely.';
                tutorial.catalyst = 'DEATH TRAP: "Strategic alternatives," "exploring options," "challenging environment" = dying firm.';
            } else if (pivotType === 'structural') {
                tutorial.type = `${typeLabel} - SKIP`;
                tutorial.description = 'Real capital commitment (debt, divestiture). Market is RE-RATING the company.';
                tutorial.implication = '30% reversal probability, but takes 6 MONTHS. Not worth trading.';
                tutorial.action = '⚠️ SKIP - Even if it recovers, 6-month timeframe too slow. Better opportunities elsewhere.';
                tutorial.timing = 'ENTRY: Not recommended. EXIT: N/A.';
                tutorial.catalyst = 'STRUCTURAL SIGNALS: New debt, divestiture, "unit economics," "restructuring charge" = real change.';
            } else if (pivotType === 'symbolic') {
                tutorial.type = `${typeLabel} - Watch for Confirmation`;
                tutorial.description = 'Buzzword pivot without substance. Market likely overreacted to press release.';
                tutorial.implication = `65% reversal in 2-3 weeks. Watch for Gold Standard signals! (${goldSignalsMet}/4 met)`;
                tutorial.action = 'CONSIDER BUYING - "Nothing has changed" = reversal likely. Wait for insider buy signal.';
                tutorial.timing = 'ENTRY: Days 3-5 after stabilization. EXIT: Pre-announcement level (+8% to +12%).';
                tutorial.catalyst = `SIGNALS: ${signalSummary || 'Watch for: Non-Dilutive, Anchor Revenue, Insider Buy, Gap Fill'}`;
            } else if (pivotType === 'gold_standard') {
                tutorial.type = `${typeLabel} - HIGH CONVICTION BUY`;
                tutorial.description = 'Symbolic pivot with ALL 4 confirmation signals! Best setup.';
                tutorial.implication = '85%+ reversal in 10-14 days. Full recovery expected to pre-announcement.';
                tutorial.action = '🏆 BUY NOW - All signals aligned. This is the ideal setup.';
                tutorial.timing = 'ENTRY: Day 2-3 (confirmed by insider buy). EXIT: Pre-announcement level.';
                tutorial.catalyst = `GOLD STANDARD: ${signalSummary}`;
            } else {
                tutorial.type = 'Strategic Pivot - Classify Type';
                tutorial.description = 'Analyze language and signals to determine pivot type.';
                tutorial.implication = 'Reactive (<10%), Structural (30%), Symbolic (65%), Gold Standard (85%+).';
                tutorial.action = 'WAIT - Classify the pivot first. Don\'t rush.';
                tutorial.timing = 'ENTRY: After classification. EXIT: Depends on type.';
                tutorial.catalyst = 'CLASSIFY: Buzzwords = Symbolic (good). Technical metrics = Structural (bad). Desperation = Reactive (death trap).';
            }
        } else if (phase === 'uncertainty_gap' || phase === 'digesting') {
            tutorial.type = `${typeLabel} - Uncertainty Gap`;
            tutorial.description = 'Initial selling exhausted. Now watching for confirmation signals.';
            tutorial.implication = pivotType === 'gold_standard' || pivotType === 'symbolic' ?
                `Good setup! ${goldSignalsMet}/4 Gold Standard signals met. Watch for insider buying.` :
                'Structural/Reactive pivot - stay away even during stabilization.';
            tutorial.action = pivotType === 'gold_standard' ? 
                '🏆 BUY - Signals confirmed. Enter position.' :
                pivotType === 'symbolic' ?
                'WATCH - Wait for insider buy signal to upgrade to Gold Standard.' :
                '⚠️ AVOID - This pivot type doesn\'t reverse quickly.';
            tutorial.timing = 'ENTRY: Now for Gold Standard. Days 3-5 for Symbolic. Never for Structural/Reactive.';
            tutorial.catalyst = `Current signals: ${signalSummary || 'Analyzing...'}`;
        } else if (phase === 'recovery' || phase === 'rerating') {
            tutorial.type = `${typeLabel} - Recovery`;
            tutorial.description = pivotType === 'gold_standard' || pivotType === 'symbolic' ?
                'Recovery in progress! Price moving toward pre-announcement level.' :
                'Bounce in progress - but be cautious if Structural/Reactive.';
            tutorial.implication = pivotType === 'gold_standard' ? '85%+ chance of full recovery.' :
                pivotType === 'symbolic' ? '65% chance of recovery to pre-announcement.' :
                'Low probability recovery - consider taking profits if any.';
            tutorial.action = 'HOLD or TAKE PARTIAL PROFITS - Rally playing out as expected.';
            tutorial.timing = 'ENTRY: Late but ok for Symbolic/Gold. EXIT: Pre-announcement level.';
            tutorial.catalyst = 'Kogan 2023: Symbolic pivots complete reversal within 22 days.';
        } else if (phase === 'complete') {
            tutorial.type = `Strategic Pivot Complete`;
            tutorial.description = 'Pivot fully digested. Stock returns to trading on fundamentals.';
            tutorial.implication = 'Easy money made (or avoided). Trade pattern finished.';
            tutorial.action = 'TAKE PROFITS if holding - The predictable trade is over.';
            tutorial.timing = 'ENTRY: No longer attractive. EXIT: Close remaining position.';
            tutorial.catalyst = 'Trade complete. Now watch for actual execution results.';
        }
        return tutorial;
    }
    
    // ========== Check for Short Report news ==========
    if (newsItem.isShortReport || newsItem.newsType === 'short_report') {
        const phase = newsItem.shortReportPhase || 'report';
        if (phase === 'report' || phase === 'initial') {
            tutorial.type = 'Short Seller Report (Initial Attack)';
            tutorial.description = 'Activist short sellers publishing fraud allegations. They profit if stock falls.';
            tutorial.implication = 'Stock crashes -25% to -40%. More waves likely. DO NOT buy the dip.';
            tutorial.action = 'IF HOLDING: Sell immediately. IF NOT: Watch for puts or wait for resolution.';
            tutorial.timing = 'ENTRY: NEVER during attack. EXIT: Sell any holdings NOW.';
            tutorial.catalyst = 'Expected: Company denial (meaningless), then "Part 2" follow-up attack. Resolution in 2-4 weeks.';
        } else if (phase === 'denial') {
            tutorial.type = 'Short Report (Company Denial)';
            tutorial.description = 'Company denying allegations. This bounce is a TRAP - denial means nothing.';
            tutorial.implication = '+5% to +10% bounce is temporary. Follow-up attacks coming.';
            tutorial.action = 'DO NOT BUY THE BOUNCE - Wait for resolution. More waves likely.';
            tutorial.timing = 'ENTRY: NEVER. EXIT: If you bought, sell on this bounce.';
            tutorial.catalyst = 'Expected: "Part 2" follow-up report incoming. Each wave increases vindication odds.';
        } else if (phase === 'vindicated' || (phase === 'resolution' && newsItem.isVindicated)) {
            tutorial.type = 'Short Report (VINDICATED - Fraud Confirmed)';
            tutorial.description = 'Short seller was RIGHT. Company admits problems or SEC investigating.';
            tutorial.implication = 'Stock will fall further. Permanent damage to company.';
            tutorial.action = 'STAY AWAY - Fraud confirmed. More downside ahead. Do not buy.';
            tutorial.timing = 'ENTRY: NEVER. EXIT: N/A - avoid this stock permanently.';
            tutorial.catalyst = 'Expect: Continued selling, possible delisting, lawsuits. "Dead money."';
        } else if (phase === 'debunked' || (phase === 'resolution' && newsItem.isVindicated === false)) {
            tutorial.type = 'Short Report (DEBUNKED - Company Cleared)';
            tutorial.description = 'Short seller was WRONG. Company cleared by audit or investigation.';
            tutorial.implication = 'Recovery rally expected +15% to +25%. Short seller loses credibility.';
            tutorial.action = 'CONSIDER BUYING - Company cleared. Recovery rally likely.';
            tutorial.timing = 'ENTRY: On debunking news. EXIT: +15% to +25% recovery.';
            tutorial.catalyst = 'Expected: Relief rally as uncertainty clears. Dip buyers rewarded.';
        } else {
            tutorial.type = 'Short Seller Report (Investigation)';
            tutorial.description = 'Claims being investigated. Outcome uncertain.';
            tutorial.implication = 'High volatility. Resolution will determine direction.';
            tutorial.action = 'WAIT - Don\'t gamble on outcome. Trade AFTER resolution.';
            tutorial.timing = 'ENTRY: Only AFTER resolution. EXIT: Based on outcome.';
            tutorial.catalyst = 'Waiting for: Resolution news (vindicated or debunked). Don\'t guess.';
        }
        return tutorial;
    }
    
    // ========== Check for newsType-based detection ==========
    const newsType = newsItem.newsType || '';
    
    switch (newsType) {
        // Quiet day - educational patience lesson
        case 'quiet_day':
            tutorial.type = 'Quiet Day (No Actionable Signals)';
            tutorial.description = 'No Tier 1-2 events today. This is NORMAL - not every day has good setups.';
            tutorial.implication = 'Forcing trades on quiet days = losing money. Professional traders often sit out 70% of days.';
            tutorial.action = 'DO NOTHING - Use this time to review watchlist, study past trades, prepare for next catalyst.';
            tutorial.timing = 'ENTRY: None today. Wait for: Insider buying, short squeeze setups, bounce #3+, index rebalancing.';
            tutorial.catalyst = 'LESSON: "The goal is not to trade every day. The goal is to trade only when odds are heavily in your favor."';
            return tutorial;
        
        // Common news types
        case 'market':
            if (newsItem.sentiment === 'positive') {
                tutorial.type = TUTORIAL_HINTS.marketUp.type;
                tutorial.description = TUTORIAL_HINTS.marketUp.description;
                tutorial.implication = TUTORIAL_HINTS.marketUp.implication;
                tutorial.action = TUTORIAL_HINTS.marketUp.action;
            } else {
                tutorial.type = TUTORIAL_HINTS.marketDown.type;
                tutorial.description = TUTORIAL_HINTS.marketDown.description;
                tutorial.implication = TUTORIAL_HINTS.marketDown.implication;
                tutorial.action = TUTORIAL_HINTS.marketDown.action;
            }
            return tutorial;
            
        case 'eps_driven':
            if (newsItem.sentiment === 'positive') {
                tutorial.type = 'Positive Fundamental News';
                tutorial.description = 'Company fundamentals (earnings, revenue, contracts) driving stock price. This is "real" value change.';
                tutorial.implication = 'Fundamental news often has lasting impact. Price may continue in direction of news.';
                tutorial.action = 'FOLLOW THE FUNDAMENTALS - Good news = consider buying. Bad news = consider selling or avoiding.';
            } else {
                tutorial.type = 'Negative Fundamental News';
                tutorial.description = 'Company fundamentals deteriorating. Earnings miss, lost contracts, or operational issues.';
                tutorial.implication = 'Fundamental damage can persist. Stock may face continued selling pressure.';
                tutorial.action = 'CAUTION - Avoid catching falling knives. Wait for stabilization before buying.';
            }
            return tutorial;
            
        case 'sentiment':
            if (newsItem.sentiment === 'positive') {
                tutorial.type = 'Positive Sentiment News';
                tutorial.description = 'News affecting how people FEEL about the stock, not necessarily fundamentals.';
                tutorial.implication = 'Sentiment can move prices short-term but may not reflect real value.';
                tutorial.action = 'SHORT-TERM PLAY - Sentiment moves are often temporary. Don\'t overstay.';
            } else if (newsItem.sentiment === 'negative') {
                tutorial.type = 'Negative Sentiment News';
                tutorial.description = 'News creating fear or doubt. May not affect actual business performance.';
                tutorial.implication = 'Sentiment-driven dips can be buying opportunities if fundamentals are solid.';
                tutorial.action = 'ASSESS REALITY - Is the fear justified? If not, consider buying the dip.';
            } else {
                tutorial.type = 'Neutral News';
                tutorial.description = 'News with unclear or mixed implications. Market may move either direction.';
                tutorial.implication = 'Uncertainty often leads to volatility. Wait for clarity.';
                tutorial.action = 'WAIT AND SEE - Let the market digest the news before acting.';
            }
            return tutorial;
            
        case 'hybrid':
            tutorial.type = 'Mixed Impact News';
            tutorial.description = 'News combining fundamental and sentiment factors. Complex situation.';
            tutorial.implication = 'Both short-term sentiment and long-term fundamentals may be affected.';
            tutorial.action = 'ANALYZE BOTH - Consider both immediate reaction and lasting impact.';
            return tutorial;
            
        case 'short_interest':
            const siHint = TUTORIAL_HINTS.shortInterest.high;
            tutorial.type = siHint.type;
            tutorial.description = siHint.description;
            tutorial.implication = siHint.implication;
            tutorial.action = siHint.action;
            tutorial.timing = siHint.timing;
            tutorial.catalyst = siHint.catalyst;
            return tutorial;
            
        case 'unusual_volume':
            tutorial.type = TUTORIAL_HINTS.volumeSpike.type;
            tutorial.description = TUTORIAL_HINTS.volumeSpike.description;
            tutorial.implication = TUTORIAL_HINTS.volumeSpike.implication;
            tutorial.action = TUTORIAL_HINTS.volumeSpike.action;
            return tutorial;
            
        case 'crash':
            const crashHint = TUTORIAL_HINTS.crash.phases.acute;
            tutorial.type = TUTORIAL_HINTS.crash.type;
            tutorial.description = crashHint.description;
            tutorial.implication = crashHint.implication;
            tutorial.action = crashHint.action;
            tutorial.timing = 'ENTRY: WAIT for bounce #3+ (dead cat bounce pattern). EXIT: N/A - don\'t buy early.';
            tutorial.catalyst = 'Expected: Multiple dead cat bounces. Each bounce weaker. Buy only after bounce #3 holds.';
            return tutorial;
            
        case 'insider':
            // Check insiderTag first for specific events (catalyst, fizzle), then fall back to headline check
            if (newsItem.insiderTag === 'catalyst' || newsItem.isInsiderCatalyst) {
                // Insider buying led to positive catalyst - the payoff!
                tutorial.type = 'Insider Catalyst (Payoff!)';
                tutorial.description = 'The positive news insiders were buying ahead of has arrived!';
                tutorial.implication = 'Stock surging +12% to +25%. Insiders were right - they knew this was coming.';
                tutorial.action = 'TAKE PROFITS - The catalyst has arrived. Sell into strength.';
                tutorial.timing = 'EXIT: NOW - Sell on this news. The insider edge is now public knowledge.';
                tutorial.catalyst = 'Classic pattern: Insider buying → Wait 3-7 days → Good news arrives → Stock pops. Trade complete!';
            } else if (newsItem.insiderTag === 'fizzle_routine' || newsItem.insiderTag === 'fizzle_wrong') {
                // Insider buying didn't lead to catalyst - teaching moment
                tutorial.type = 'Insider Fizzle (No Catalyst)';
                tutorial.description = newsItem.insiderTag === 'fizzle_routine' 
                    ? 'Insider buying was pre-planned (10b5-1) - not a real signal.'
                    : 'Insider was wrong or had bad timing - no catalyst materialized.';
                tutorial.implication = 'Price giving back some gains. This is why insider buying works ~70%, not 100%.';
                tutorial.action = 'SELL - The signal fizzled. Cut losses and move on.';
                tutorial.timing = 'EXIT: On fizzle news. Accept small loss, preserve capital for next signal.';
                tutorial.catalyst = 'LESSON: Not all insider buying works. ~30% fizzle rate. Use position sizing to manage risk.';
            } else {
                const insiderHeadline = (newsItem.headline || '').toLowerCase();
                if (insiderHeadline.includes('buy') || insiderHeadline.includes('purchase') || 
                    insiderHeadline.includes('adds to stake') || insiderHeadline.includes('increases stake') ||
                    newsItem.insiderTag === 'insider_buy') {
                    tutorial.type = TUTORIAL_HINTS.insider.buying.type;
                    tutorial.description = TUTORIAL_HINTS.insider.buying.description;
                    tutorial.implication = TUTORIAL_HINTS.insider.buying.implication;
                    tutorial.action = TUTORIAL_HINTS.insider.buying.action;
                    tutorial.timing = TUTORIAL_HINTS.insider.buying.timing;
                    tutorial.catalyst = TUTORIAL_HINTS.insider.buying.catalyst;
                } else {
                    tutorial.type = TUTORIAL_HINTS.insider.selling.type;
                    tutorial.description = TUTORIAL_HINTS.insider.selling.description;
                    tutorial.implication = TUTORIAL_HINTS.insider.selling.implication;
                    tutorial.action = TUTORIAL_HINTS.insider.selling.action;
                }
            }
            return tutorial;
            
        case 'stock_split':
            // Delegate to StockSplit module for phase-aware hints
            const stockSplitHint = getStockSplitTutorialHint(newsItem);
            if (stockSplitHint && stockSplitHint.type) {
                return stockSplitHint;
            }
            // Fallback for legacy newsType without isStockSplit flag
            tutorial.type = TUTORIAL_HINTS.stockSplit.type;
            tutorial.description = TUTORIAL_HINTS.stockSplit.description;
            tutorial.implication = TUTORIAL_HINTS.stockSplit.implication;
            tutorial.action = TUTORIAL_HINTS.stockSplit.action;
            tutorial.timing = TUTORIAL_HINTS.stockSplit.timing;
            tutorial.catalyst = TUTORIAL_HINTS.stockSplit.catalyst;
            return tutorial;
            
        case 'analyst':
            const analystHeadline = (newsItem.headline || '').toLowerCase();
            if (analystHeadline.includes('upgrade') || newsItem.sentiment === 'positive') {
                tutorial.type = TUTORIAL_HINTS.analyst.upgrade.type;
                tutorial.description = TUTORIAL_HINTS.analyst.upgrade.description;
                tutorial.implication = TUTORIAL_HINTS.analyst.upgrade.implication;
                tutorial.action = TUTORIAL_HINTS.analyst.upgrade.action;
            } else {
                tutorial.type = TUTORIAL_HINTS.analyst.downgrade.type;
                tutorial.description = TUTORIAL_HINTS.analyst.downgrade.description;
                tutorial.implication = TUTORIAL_HINTS.analyst.downgrade.implication;
                tutorial.action = TUTORIAL_HINTS.analyst.downgrade.action;
            }
            return tutorial;
            
        case 'index_rebalance':
            // Delegate to IndexRebalance module for phase-aware hints
            const indexRebalanceHint = getIndexRebalanceTutorialHint(newsItem);
            if (indexRebalanceHint && indexRebalanceHint.type) {
                return indexRebalanceHint;
            }
            // Fallback for legacy newsType without isIndexRebalance flag
            const isAdditionLegacy = newsItem.indexAction === 'add' || (newsItem.headline || '').toLowerCase().includes('added');
            if (isAdditionLegacy) {
                tutorial.type = '📅 Index Addition (Forced Buying)';
                tutorial.description = 'Stock being ADDED to major index. Passive funds MUST buy regardless of price.';
                tutorial.implication = 'Run-up expected (+5-15%). The REAL trade is the reversal AFTER effective date.';
                tutorial.action = 'DO NOT BUY NOW. Wait for Gold Standard setup (5%+ run-up, MOC spike, T+2 reversal).';
                tutorial.timing = 'ENTRY: T+2 after effective day. EXIT: 3-5 days for 2-5% reversal gain.';
                tutorial.catalyst = '🏆 Gold Standard: Tier 1 index + 5%+ run-up + MOC spike + T+2 lower high = 78% success';
            } else {
                tutorial.type = '📅 Index Deletion (Forced Selling)';
                tutorial.description = 'Stock being REMOVED from index. Passive funds MUST sell regardless of price.';
                tutorial.implication = 'Sell-off expected (-8-15%). Bounce opportunity after selling exhausts.';
                tutorial.action = 'Wait for BOUNCE after effective day. Deletions often recover 2-4%.';
                tutorial.timing = 'ENTRY: After effective day (T+1 or T+2). EXIT: +2-4% bounce over 3-5 days.';
                tutorial.catalyst = '🎯 Deletion Trade: Forced selling → overshoot → recovery bounce';
            }
            return tutorial;
            
        case 'sector_rotation':
            tutorial.type = TUTORIAL_HINTS.sectorRotation.type;
            tutorial.description = TUTORIAL_HINTS.sectorRotation.description;
            tutorial.implication = TUTORIAL_HINTS.sectorRotation.implication;
            tutorial.action = TUTORIAL_HINTS.sectorRotation.action;
            return tutorial;
            
        case 'dividend_trap':
        case 'dividend_cut':
            tutorial.type = TUTORIAL_HINTS.dividend.cut.type;
            tutorial.description = 'High dividend yield often signals distress. Company may cut dividend.';
            tutorial.implication = TUTORIAL_HINTS.dividend.cut.implication;
            tutorial.action = 'YIELD TRAP WARNING - Very high yields are often unsustainable.';
            return tutorial;
            
        case 'circuit_breaker':
            tutorial.type = 'Circuit Breaker / Trading Halt';
            tutorial.description = 'Trading halted due to extreme price movement. Automatic market protection.';
            tutorial.implication = 'Extreme volatility. When trading resumes, expect continued wild swings.';
            tutorial.action = 'EXTREME CAUTION - Let volatility settle before trading. Gap risk is high.';
            return tutorial;
            
        case 'gap':
            if (newsItem.gapDirection === 'up' || newsItem.sentiment === 'positive') {
                tutorial.type = TUTORIAL_HINTS.gap.up.type;
                tutorial.description = TUTORIAL_HINTS.gap.up.description;
                tutorial.implication = TUTORIAL_HINTS.gap.up.implication;
                tutorial.action = TUTORIAL_HINTS.gap.up.action;
            } else {
                tutorial.type = TUTORIAL_HINTS.gap.down.type;
                tutorial.description = TUTORIAL_HINTS.gap.down.description;
                tutorial.implication = TUTORIAL_HINTS.gap.down.implication;
                tutorial.action = TUTORIAL_HINTS.gap.down.action;
            }
            return tutorial;
    }
    
    // ========== Check for market-wide flags ==========
    if (newsItem.isMarketWide) {
        if (newsItem.sentiment === 'positive') {
            tutorial.type = TUTORIAL_HINTS.marketUp.type;
            tutorial.description = TUTORIAL_HINTS.marketUp.description;
            tutorial.implication = TUTORIAL_HINTS.marketUp.implication;
            tutorial.action = TUTORIAL_HINTS.marketUp.action;
            return tutorial;
        } else if (newsItem.sentiment === 'negative') {
            tutorial.type = TUTORIAL_HINTS.marketDown.type;
            tutorial.description = TUTORIAL_HINTS.marketDown.description;
            tutorial.implication = TUTORIAL_HINTS.marketDown.implication;
            tutorial.action = TUTORIAL_HINTS.marketDown.action;
            return tutorial;
        }
    }
    
    // No specific tutorial found
    return null;
}

// Get tutorial hint for market sentiment display
function getTutorialForSentiment(sentimentValue) {
    if (!gameSettings || !gameSettings.tutorialMode) return null;
    
    if (sentimentValue >= 80) {
        return TUTORIAL_HINTS.sentiment.extreme_greed;
    } else if (sentimentValue >= 60) {
        return TUTORIAL_HINTS.sentiment.greed;
    } else if (sentimentValue <= 20) {
        return TUTORIAL_HINTS.sentiment.extreme_fear;
    } else if (sentimentValue <= 40) {
        return TUTORIAL_HINTS.sentiment.fear;
    }
    
    return null;
}

// Check if tutorial mode is active
function isTutorialMode() {
    return gameSettings && gameSettings.tutorialMode;
}

// Toggle tutorial mode
function toggleTutorialMode() {
    if (gameSettings) {
        gameSettings.tutorialMode = !gameSettings.tutorialMode;
        
        // Unlock all features in tutorial mode
        if (gameSettings.tutorialMode) {
            // Enable advanced features for learning
            if (typeof enableOptionsTrading === 'function') {
                enableOptionsTrading();
            }
            if (typeof enableShortSelling === 'function') {
                enableShortSelling();
            }
            if (typeof addNews === 'function') {
                addNews('🎓 TUTORIAL MODE ACTIVATED - Educational hints now shown in news items', 'neutral', null);
            }
        } else {
            if (typeof addNews === 'function') {
                addNews('🎓 TUTORIAL MODE DEACTIVATED - Standard gameplay resumed', 'neutral', null);
            }
        }
        
        // Re-render to show/hide tutorial hints
        if (typeof renderNews === 'function') {
            renderNews();
        }
        if (typeof renderPortfolio === 'function') {
            renderPortfolio();
        }
        
        // Update menu status display
        if (typeof updateMenuStatus === 'function') {
            updateMenuStatus();
        }
        
        if (typeof saveSettings === 'function') {
            saveSettings();
        }
    }
}

// Initialize tutorial toggle handler
function initTutorialMode() {
    // Initialize menu status on load
    if (typeof updateMenuStatus === 'function') {
        updateMenuStatus();
    }
}

// ============================================================================
// EVENT TIER CONFIGURATION
// Tier 1-2: Educational, clear signals - ENABLED by default
// Tier 3-4: Complex/random - DISABLED by default (player must enable manually)
// ============================================================================
const EVENT_TIERS = {
    // TIER 1: Highly Educational - Multiple clear signals, predictable timeline
    tier1: {
        label: 'Tier 1 - Highly Educational',
        description: 'Clear telltales, predictable timelines, best for learning',
        defaultEnabled: true,
        events: [
            'short_seller_report',   // Multi-wave with clear escalation signals
            'index_rebalancing',     // Known date, predictable flow pattern  
            'insider_buying'         // Clear bullish signal (~70% success rate)
        ]
    },
    
    // TIER 2: Good Educational - Clear signals, some complexity
    tier2: {
        label: 'Tier 2 - Good Educational Value',
        description: 'Clear signals with some complexity, good learning opportunities',
        defaultEnabled: true,
        events: [
            'dead_cat_bounce',       // Identifiable bounces after crash
            'stock_split',           // Known mechanics, sentiment-driven
            'short_squeeze',         // Clear setup conditions visible
            'fomo_rally',            // Identifiable euphoria phases
            'executive_change',      // Replacement announced = honeymoon bounce pattern
            'strategic_pivot'        // "Unfavorable" news that recovers (layoffs, restructuring)
        ]
    },
    
    // TIER 3: Moderate Educational - Requires more experience
    tier3: {
        label: 'Tier 3 - Moderate',
        description: 'Harder to time, requires experience to trade profitably',
        defaultEnabled: false,
        events: [
            'institutional_manipulation', // Hard to detect, high failure rate (~40% success)
            'analyst',              // Impact varies, short-lived
            'capitulation',         // Hard to distinguish from normal selling
            'tax_loss_harvesting'   // Calendar-based but weak signals
        ]
    },
    
    // TIER 4: Lower Educational - Random/unpredictable
    tier4: {
        label: 'Tier 4 - Advanced/Random',
        description: 'Unpredictable timing or difficult to profit from',
        defaultEnabled: false,
        events: [
            'basic_news',           // Random daily news (eps_driven, sentiment, hybrid) - no telltales
            'sector_rotation',      // Gradual, hard to time entry/exit
            'dividend_trap',        // Complex dynamics, can trap beginners
            'gap_up',               // Already priced in by open
            'gap_down',             // Already priced in by open
            'circuit_breaker',      // Emergency mechanism, not tradeable
            'unusual_volume',       // Ambiguous signal
            'wash_trading',         // Deceptive, hard to identify
            'options_gamma',        // Requires options knowledge
            'correlation_breakdown', // Random market phenomenon
            'liquidity_crisis',     // Random crisis event
            'window_dressing',      // Calendar-based but weak signals
            'earnings_whisper'      // Confusing for beginners
        ]
    }
};

// Get default enabled events based on tier configuration
function getDefaultEnabledEvents() {
    const enabledEvents = {};
    
    Object.values(EVENT_TIERS).forEach(tier => {
        tier.events.forEach(eventType => {
            enabledEvents[eventType] = tier.defaultEnabled;
        });
    });
    
    return enabledEvents;
}

// Get tier for a specific event
function getEventTier(eventType) {
    for (const [tierKey, tierData] of Object.entries(EVENT_TIERS)) {
        if (tierData.events.includes(eventType)) {
            return { tier: tierKey, ...tierData };
        }
    }
    return null;
}

// Check if an event type is enabled
function isEventEnabled(eventType) {
    if (typeof gameSettings !== 'undefined' && gameSettings.enabledEvents) {
        return gameSettings.enabledEvents[eventType] !== false;
    }
    // Fall back to tier defaults
    const tier = getEventTier(eventType);
    return tier ? tier.defaultEnabled : true;
}

// ============================================================================
// DETAILED TRADING HINT RETRIEVAL
// Returns comprehensive trading guidance for tutorial mode "Hint" button
// ============================================================================
function getDetailedTradingHint(newsItem, stock) {
    if (!newsItem) return null;
    
    const eventType = newsItem.type || newsItem.eventType;
    const headline = (newsItem.headline || '').toLowerCase();
    
    // Try to find detailed hints
    let hints = null;
    
    switch (eventType) {
        case 'short_seller':
        case 'short_seller_report':
            hints = DETAILED_TRADING_HINTS.shortSellerReport;
            break;
            
        case 'index_rebalancing':
            hints = DETAILED_TRADING_HINTS.indexRebalancing;
            break;
            
        case 'insider':
            if (headline.includes('buy') || headline.includes('purchase')) {
                hints = DETAILED_TRADING_HINTS.insiderBuying;
            }
            break;
            
        case 'manipulation':
        case 'institutional_manipulation':
            hints = DETAILED_TRADING_HINTS.multiWaveManipulation;
            break;
            
        case 'dead_cat':
        case 'dead_cat_bounce':
        case 'crash':
            // Check if this is a dead cat bounce phase
            if (stock && stock.crashPhase) {
                hints = DETAILED_TRADING_HINTS.deadCatBounce;
            }
            break;
            
        case 'stock_split':
            hints = DETAILED_TRADING_HINTS.stockSplit;
            break;
            
        case 'short_squeeze':
            hints = DETAILED_TRADING_HINTS.shortSqueeze;
            break;
            
        case 'fomo':
        case 'fomo_rally':
            hints = DETAILED_TRADING_HINTS.fomoRally;
            break;
    }
    
    if (!hints) return null;
    
    // Build comprehensive hint object with stock-specific context
    const result = {
        title: hints.title || 'Trading Hint',
        summary: hints.summary || '',
        telltales: hints.telltales || [],
        timeline: hints.timeline || {},
        priceTargets: hints.priceTargets || {},
        strategy: hints.strategy || [],
        riskLevel: hints.riskLevel || 'MEDIUM'
    };
    
    // Add stock-specific context if available
    if (stock) {
        result.stockContext = {
            symbol: stock.symbol,
            currentPrice: stock.price,
            priceAtEventStart: stock.priceAtEventStart || stock.priceAtCrashStart || stock.priceAtManipulationStart || stock.price,
            phase: stock.crashPhase || stock.manipulationPhase || null,
            waveNumber: stock.manipulationWave || stock.crashBounceNumber || null,
            daysRemaining: stock.crashDaysLeft || stock.manipulationDaysLeft || null
        };
        
        // Calculate price targets based on actual stock price
        if (result.stockContext.priceAtEventStart && result.priceTargets) {
            const basePrice = result.stockContext.priceAtEventStart;
            result.calculatedTargets = {};
            
            if (result.priceTargets.entryZone) {
                result.calculatedTargets.entryLow = basePrice * result.priceTargets.entryZone[0];
                result.calculatedTargets.entryHigh = basePrice * result.priceTargets.entryZone[1];
            }
            if (result.priceTargets.exitZone) {
                result.calculatedTargets.exitLow = basePrice * result.priceTargets.exitZone[0];
                result.calculatedTargets.exitHigh = basePrice * result.priceTargets.exitZone[1];
            }
            if (result.priceTargets.stopLoss) {
                result.calculatedTargets.stopLoss = basePrice * result.priceTargets.stopLoss;
            }
        }
    }
    
    return result;
}

// Format detailed hint for display
function formatDetailedHint(hint) {
    if (!hint) return 'No detailed trading hint available for this event.';
    
    let output = [];
    
    output.push(`📊 ${hint.title}`);
    output.push('─'.repeat(40));
    
    if (hint.summary) {
        output.push(`\n${hint.summary}\n`);
    }
    
    if (hint.telltales && hint.telltales.length > 0) {
        output.push('\n🔍 TELLTALES TO IDENTIFY:');
        hint.telltales.forEach((t, i) => output.push(`  ${i + 1}. ${t}`));
    }
    
    if (hint.timeline) {
        output.push('\n⏰ TIMELINE:');
        if (hint.timeline.total) output.push(`  Total Duration: ${hint.timeline.total}`);
        if (hint.timeline.phases) {
            hint.timeline.phases.forEach(p => output.push(`  • ${p}`));
        }
        if (hint.timeline.optimalEntry) output.push(`  📥 Optimal Entry: ${hint.timeline.optimalEntry}`);
        if (hint.timeline.optimalExit) output.push(`  📤 Optimal Exit: ${hint.timeline.optimalExit}`);
    }
    
    if (hint.calculatedTargets) {
        output.push('\n💰 PRICE TARGETS (for this stock):');
        const t = hint.calculatedTargets;
        if (t.entryLow && t.entryHigh) {
            output.push(`  📥 Entry Zone: $${t.entryLow.toFixed(2)} - $${t.entryHigh.toFixed(2)}`);
        }
        if (t.exitLow && t.exitHigh) {
            output.push(`  📤 Exit Zone: $${t.exitLow.toFixed(2)} - $${t.exitHigh.toFixed(2)}`);
        }
        if (t.stopLoss) {
            output.push(`  🛑 Stop Loss: $${t.stopLoss.toFixed(2)}`);
        }
    } else if (hint.priceTargets) {
        output.push('\n💰 PRICE TARGETS (% from event start):');
        const t = hint.priceTargets;
        if (t.entryZone) {
            output.push(`  📥 Entry Zone: ${(t.entryZone[0] * 100 - 100).toFixed(0)}% to ${(t.entryZone[1] * 100 - 100).toFixed(0)}%`);
        }
        if (t.exitZone) {
            output.push(`  📤 Exit Zone: ${(t.exitZone[0] * 100 - 100).toFixed(0)}% to ${(t.exitZone[1] * 100 - 100).toFixed(0)}%`);
        }
        if (t.stopLoss) {
            output.push(`  🛑 Stop Loss: ${(t.stopLoss * 100 - 100).toFixed(0)}%`);
        }
    }
    
    if (hint.strategy && hint.strategy.length > 0) {
        output.push('\n📋 STRATEGY:');
        hint.strategy.forEach((s, i) => output.push(`  ${i + 1}. ${s}`));
    }
    
    if (hint.stockContext) {
        output.push('\n📈 CURRENT STATUS:');
        const ctx = hint.stockContext;
        output.push(`  Stock: ${ctx.symbol} @ $${ctx.currentPrice.toFixed(2)}`);
        if (ctx.phase) output.push(`  Phase: ${ctx.phase}`);
        if (ctx.waveNumber) output.push(`  Wave/Bounce #: ${ctx.waveNumber}`);
        if (ctx.daysRemaining) output.push(`  Days Remaining: ~${ctx.daysRemaining}`);
    }
    
    output.push(`\n⚠️ Risk Level: ${hint.riskLevel}`);
    
    return output.join('\n');
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.getTutorialForNews = getTutorialForNews;
    window.getTutorialForSentiment = getTutorialForSentiment;
    window.isTutorialMode = isTutorialMode;
    window.toggleTutorialMode = toggleTutorialMode;
    window.initTutorialMode = initTutorialMode;
    window.TUTORIAL_HINTS = TUTORIAL_HINTS;
    window.DETAILED_TRADING_HINTS = DETAILED_TRADING_HINTS;
    window.EVENT_TIERS = EVENT_TIERS;
    window.getDefaultEnabledEvents = getDefaultEnabledEvents;
    window.getEventTier = getEventTier;
    window.isEventEnabled = isEventEnabled;
    window.getDetailedTradingHint = getDetailedTradingHint;
    window.formatDetailedHint = formatDetailedHint;
}
