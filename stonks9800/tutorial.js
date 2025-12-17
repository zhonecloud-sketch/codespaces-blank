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
  indexRebalancing: {
    name: 'Index Rebalancing',
    tier: 1,
    telltales: [
      '📰 News: "X to be ADDED to S&P 500" or "X REMOVED from Russell 2000"',
      '📅 Specific effective date announced (usually 5-10 days out)',
      '📊 Stock shows steady buying/selling pressure leading up to date',
      '💰 Index funds MUST buy/sell regardless of price'
    ],
    phases: {
      announced: {
        name: 'Announcement',
        timing: 'Day 1',
        priceImpact: '+8% to +13% immediate (addition), -8% to -13% (removal)',
        action: 'BUY on addition announcement, SHORT on removal announcement',
        strategy: 'Enter immediately on news. Index funds will front-run for days.'
      },
      frontrun: {
        name: 'Front-Running Period',
        timing: 'Days 2 to effective-1',
        priceImpact: '+2% to +3.5% per day (addition), -2% to -3.5% (removal)',
        action: 'HOLD through this period. Momentum continues.',
        strategy: 'Let the index fund buying/selling push price in your favor.'
      },
      effective: {
        name: 'Effective Date',
        timing: 'Effective day',
        priceImpact: 'Peak on effective day, then slight reversal',
        action: 'SELL day before or morning of effective date.',
        strategy: '"Buy the rumor, sell the news" - exit as forced buying completes.'
      },
      aftermath: {
        name: 'Post-Effective',
        timing: 'Day after effective',
        priceImpact: '-2% to -5% reversal (addition), +2% to +5% bounce (removal)',
        action: 'Consider counter-trade after forced flow completes.',
        strategy: 'Overreaction often corrects. Removal stocks may bounce.'
      }
    },
    sellSignals: {
      timing: [
        '⏱️ SELL on the day BEFORE the effective date (peak price)',
        '⏱️ Or SELL morning of effective date before close',
        '⏱️ Do NOT hold past effective date - reversal starts immediately',
        '⏱️ If trading removal: Cover short on effective date'
      ],
      priceTargets: [
        '🎯 Addition Target: +15% to +25% from announcement price',
        '🎯 Removal Target: -15% to -25% from announcement price (short profit)',
        '🎯 Stop Loss: -3% from entry if momentum stalls early',
        '🎯 Counter-trade: +5% bounce after effective date (removal stocks)'
      ]
    },
    expectedReturn: {
      addition: '+15% to +25% from announcement to effective date',
      removal: '-15% to -25% from announcement to effective date',
      reversal: '+3% to +7% counter-trade after effective date'
    },
    keyLessons: [
      'Index funds MUST buy/sell - it\'s forced, not a choice',
      'Front-running is legal and everyone does it',
      'Sell BEFORE effective date - forced buying = your exit liquidity',
      'Removal stocks often bounce after forced selling exhausted'
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
    name: 'Stock Split Momentum',
    tier: 2,
    telltales: [
      '📰 News: "X announces 4:1 stock split"',
      '📅 Effective date set 5-10 days out',
      '💰 High-priced stocks (>$5000) more likely to split',
      '📊 Steady buying pressure into effective date'
    ],
    phases: {
      announced: {
        name: 'Announcement',
        timing: 'Day 1',
        priceImpact: '+5% immediate pop',
        action: 'BUY on announcement. Momentum begins.',
        strategy: 'Splits attract retail buyers. Ride the wave.'
      },
      runup: {
        name: 'Pre-Split Rally',
        timing: 'Days 2 to effective-1',
        priceImpact: '+2% to +3% per day',
        action: 'HOLD. Momentum continues into split.',
        strategy: 'Psychological effect brings new buyers daily.'
      },
      effective: {
        name: 'Split Effective',
        timing: 'Effective day',
        priceImpact: 'Price adjusts, often +2% post-split momentum',
        action: 'Consider taking profits or hold for continued momentum.',
        strategy: 'Lower price attracts new retail. May continue up.'
      }
    },
    expectedReturn: {
      stock: '+10% to +25% from announcement to effective',
      calls: '+50% to +100% on ATM calls',
      holdTime: '5-10 days typical'
    },
    sellSignals: {
      timing: [
        '🚪 Sell 50% on split effective date',
        '🚪 Sell remaining within 2-3 days after split',
        '⚠️ Post-split momentum rarely lasts >5 days'
      ],
      priceTargets: {
        conservative: '+10% to +15% (sell before effective date)',
        standard: '+15% to +20% (sell on effective date)',
        aggressive: '+20% to +25% (hold 2 days post-split)'
      },
      exitStrategy: 'Effective date is the natural exit. Take most profits by then.'
    },
    keyLessons: [
      'Splits don\'t change fundamental value',
      'Psychology drives price up (feels "cheaper")',
      'Retail accessibility increases = more buyers',
      'Momentum typically continues past effective date'
    ]
  },
  
  // === SHORT SQUEEZE ===
  shortSqueeze: {
    name: 'Short Squeeze',
    tier: 2,
    telltales: [
      '📊 "Short interest hits 35%+" news',
      '⚠️ "Squeeze warning" or "potential squeeze" headlines',
      '📈 Positive catalyst + high SI = explosion trigger',
      '🚀 Explosive upward move with "shorts covering" news'
    ],
    phases: {
      building: {
        name: 'Short Interest Building',
        timing: '5-10 days',
        priceImpact: '-2% per day drift (shorts pushing down)',
        action: 'WATCH. Need catalyst to trigger squeeze.',
        strategy: 'High SI is the gun. Wait for trigger (positive news).'
      },
      trigger: {
        name: 'Squeeze Triggered',
        timing: 'Day 1 of squeeze',
        priceImpact: '+20% to +60% explosion',
        action: 'BUY early if you catch it. HIGH RISK.',
        strategy: 'Get in fast, get out fast. This is not investing.'
      },
      squeeze: {
        name: 'Squeeze In Progress',
        timing: 'Days 1-4',
        priceImpact: '+20% to +60% additional (meme stocks)',
        action: 'TAKE PROFITS if holding. Do NOT buy here.',
        strategy: 'Shorts being destroyed. But end is coming.'
      },
      unwind: {
        name: 'Unwind Phase',
        timing: 'Days 3-6',
        priceImpact: '-12% to -24% correction',
        action: 'EXIT if still holding. Late buyers get crushed.',
        strategy: 'Squeeze exhausted. Give back 30-50% of gains typical.'
      }
    },
    expectedReturn: {
      earlyBuyer: '+50% to +200% if timed well (rare)',
      lateBuyer: '-30% to -60% loss if buy during squeeze peak',
      riskLevel: 'EXTREME - most traders lose money on squeezes'
    },
    sellSignals: {
      timing: [
        '🚪 Sell 50% at +30% (lock in profits EARLY)',
        '🚪 Sell remaining at +50% or "squeeze exhausted" news',
        '💀 "Unwind" or "shorts covered" = SELL ALL IMMEDIATELY'
      ],
      priceTargets: {
        conservative: '+25% to +35% (take profits, leave table)',
        standard: '+40% to +60% (sell into squeeze momentum)',
        aggressive: 'NEVER - greed causes massive losses in squeezes'
      },
      exitStrategy: 'Exit EARLY. Most squeeze profits evaporate in unwind phase. Sell into strength, never into weakness.'
    },
    keyLessons: [
      'High short interest is the FUEL, not the trigger',
      'Need positive catalyst to ignite squeeze',
      'Sell into strength - don\'t wait for top',
      '"Squeeze likely exhausted" news = EXIT immediately'
    ]
  },
  
  // === FOMO RALLY ===
  fomoRally: {
    name: 'FOMO Rally',
    tier: 2,
    telltales: [
      '📈 Stock up +30% from recent low with momentum',
      '📰 "Rally attracts retail", "social media buzzing" news',
      '🔥 "Don\'t miss out!" headlines = TOP IS NEAR',
      '💥 Collapse follows with "FOMO buyers holding bags" news'
    ],
    phases: {
      building: {
        name: 'FOMO Building',
        timing: '3-6 days',
        priceImpact: '+8% to +15% per day',
        action: 'RISKY BUY but best entry if you want in.',
        strategy: 'Early FOMO stage has best risk/reward.'
      },
      blowoff: {
        name: 'Blowoff Top',
        timing: '1-2 days',
        priceImpact: '+20% to +35% final surge',
        action: 'SELL IMMEDIATELY. "Don\'t miss out" = you\'re the exit liquidity.',
        strategy: 'This is the top. Every buyer here loses.'
      },
      collapse: {
        name: 'Collapse',
        timing: '3-5 days',
        priceImpact: '-20% to -35% crash',
        action: 'DO NOT BUY. Bag holders being created.',
        strategy: 'Late FOMO buyers suffer massive losses.'
      }
    },
    expectedReturn: {
      earlyBuyer: '+30% to +60% if sell at blowoff',
      blowoffBuyer: '-30% to -50% loss',
      putBuyer: '+100% to +200% on puts bought at blowoff'
    },
    sellSignals: {
      timing: [
        '🚪 Sell 50% when "FOMO" or "retail piling in" news appears',
        '🚪 Sell remaining 50% at first red day',
        '💀 "Don\'t miss out!" headlines = SELL 100% IMMEDIATELY'
      ],
      priceTargets: {
        conservative: '+20% to +30% (sell during building phase)',
        standard: '+30% to +50% (sell into FOMO peak)',
        aggressive: 'NEVER hold for blowoff top - you WILL miss it'
      },
      exitStrategy: 'FOMO rallies end suddenly. Sell when greed is highest. "Don\'t miss out" = you\'re the exit liquidity.'
    },
    keyLessons: [
      '"Don\'t miss out!" is the SELL signal, not buy',
      'When everyone is buying, you should be selling',
      'Blowoff tops look exciting but destroy wealth',
      'The last buyers fund the early sellers\' profits'
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
  }
};

// Tutorial hint definitions for all phenomena and events
const TUTORIAL_HINTS = {
    // ========== FOMO Rally ==========
    fomoRally: {
        type: 'FOMO Rally',
        phases: {
            early: {
                day: '1-2 of ~7',
                description: 'Fear Of Missing Out is driving retail investors to pile in. Social media buzz is building and everyone wants a piece of the action.',
                implication: 'Stock will likely continue rising for several more days as more buyers join. Volume increasing.',
                action: 'CONSIDER BUYING - Early stage has best risk/reward. Set a target exit price around +20-40%.',
                timing: 'ENTRY: On "rally attracts retail" news. EXIT: On "Don\'t miss out!" or first red day.',
                catalyst: 'Watch for: "FOMO MANIA" or "Don\'t miss out" headlines = SELL SIGNAL. Blowoff top imminent.'
            },
            mid: {
                day: '3-5 of ~7',
                description: 'FOMO rally in full swing. Late buyers are rushing in. Smart money may be starting to take profits.',
                implication: 'Rally could continue but risk is increasing. Watch for volume decline as warning sign.',
                action: 'IF HOLDING: Consider selling half to lock profits. IF BUYING: Very risky entry point.',
                timing: 'ENTRY: DO NOT BUY. EXIT: Sell 50% now if holding.',
                catalyst: 'Warning signs: Slowing momentum, "Don\'t miss out" headlines appearing.'
            },
            late: {
                day: '6-7 of ~7',
                description: 'FOMO exhaustion approaching. Most who wanted to buy have bought. Selling pressure building.',
                implication: 'Rally will likely end soon. Sharp reversal possible as early buyers take profits.',
                action: 'SELL - Take profits now. Do NOT buy at this stage. Reversal imminent.',
                timing: 'ENTRY: NEVER. EXIT: IMMEDIATELY - sell 100% now.',
                catalyst: 'Collapse news coming: "FOMO buyers left holding bags" - you don\'t want to be one of them.'
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
        type: 'Stock Split',
        description: 'Company dividing shares to lower price per share. No change in total value.',
        implication: 'Psychologically bullish. Lower price attracts retail buyers.',
        action: 'BUY on announcement - Splits attract retail. Expect +10% to +20% run into effective date.',
        timing: 'ENTRY: On split announcement. EXIT: Day before or day of effective date.',
        catalyst: 'Expected: Steady buying pressure into effective date. Post-split momentum may continue 2-3 days.'
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
    
    // ========== Check for Dead Cat Bounce news ==========
    if (newsItem.isDeadCatBounce || newsItem.newsType === 'dead_cat_bounce') {
        const bounceNum = newsItem.bounceNumber || 1;
        const rsi = newsItem.bounceRSI || (30 - bounceNum * 4);
        
        if (bounceNum >= 4) {
            tutorial.type = `Dead Cat Bounce #${bounceNum} (STRONG BUY Signal)`;
            tutorial.description = `Multiple confirmations: RSI(14) divergence + Bollinger Band support + volume exhaustion after ${bounceNum} bounces.`;
            tutorial.implication = `${Math.min(90, 65 + (bounceNum-3)*12)}% probability this is the REAL bottom. Sellers completely exhausted.`;
            tutorial.action = `STRONG BUY SIGNAL - Confluence of indicators: RSI divergence, Bollinger support, volume dried up.`;
            tutorial.timing = `ENTRY: NOW - ${bounceNum} bounces = very high probability bottom. EXIT: +15% to +25% recovery.`;
            tutorial.catalyst = 'INDICATORS TO LEARN: After 4+ bounces, you want RSI divergence (price lower, RSI higher) + low volume + price at Bollinger Band.';
        } else if (bounceNum === 3) {
            tutorial.type = `Dead Cat Bounce #3 (RSI DIVERGENCE)`;
            tutorial.description = `Key signal: Price made new low, but RSI(14) made HIGHER low. This "bullish divergence" = sellers weakening.`;
            tutorial.implication = '65% chance this is the real bottom. RSI divergence is a powerful signal.';
            tutorial.action = 'CONSIDER BUYING - RSI divergence detected. Start small position.';
            tutorial.timing = 'ENTRY: On bounce #3 with RSI divergence. EXIT: +15% to +25% recovery.';
            tutorial.catalyst = 'INDICATOR TO LEARN: RSI Divergence = price makes new low but RSI makes higher low. Shows sellers losing momentum.';
        } else if (bounceNum === 2) {
            tutorial.type = `Dead Cat Bounce #2 (Volume Declining)`;
            tutorial.description = `RSI(14) still oversold. Watch for: selling VOLUME declining = sellers running out of shares to sell.`;
            tutorial.implication = '45% chance of bottom. Volume exhaustion is good sign, but need more confirmation.';
            tutorial.action = 'DO NOT BUY YET - Two signals (RSI oversold + volume decline) but still risky. Wait for bounce #3.';
            tutorial.timing = 'ENTRY: WAIT for bounce #3 with RSI divergence. EXIT: N/A.';
            tutorial.catalyst = 'INDICATOR TO LEARN: After RSI oversold fails, watch if selling VOLUME decreases each bounce. Volume dry-up = sellers exhausted.';
        } else {
            tutorial.type = `Dead Cat Bounce #1 (RSI Oversold Only)`;
            tutorial.description = `RSI(14) hit oversold (<30) triggering algorithmic buying. Single indicator = UNRELIABLE.`;
            tutorial.implication = 'Only 30% chance of bottom. RSI oversold alone is NOT a buy signal.';
            tutorial.action = 'DO NOT BUY - Single indicator (RSI oversold) fails 70% of the time. Wait for bounce #3.';
            tutorial.timing = 'ENTRY: WAIT for bounce #3+. EXIT: N/A - don\'t buy first bounce.';
            tutorial.catalyst = 'INDICATOR TO LEARN: RSI(14) < 30 = "oversold" but this alone is WEAK signal. Need multiple confirmations.';
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
    
    // ========== Check for Strategic Pivot news ==========
    if (newsItem.isStrategicPivot || newsItem.newsType === 'strategic_pivot') {
        const phase = newsItem.strategicPivotPhase || 'announced';
        const pivotType = newsItem.pivotType || 'restructuring';
        const narrative = newsItem.pivotNarrative || 'efficiency';
        
        const pivotLabels = {
            layoffs: 'Layoffs/Job Cuts',
            restructuring: 'Restructuring',
            market_exit: 'Market Exit',
            product_kill: 'Product Discontinuation',
            pivot: 'Strategic Pivot',
            divestiture: 'Divestiture',
            cost_cutting: 'Cost Cutting'
        };
        
        const label = pivotLabels[pivotType] || 'Strategic Change';
        
        if (phase === 'announced') {
            tutorial.type = `${label} Announced - Initial Drop`;
            tutorial.description = `"Unfavorable" strategic announcement. Market reacts negatively initially, but these often RECOVER in 2-3 weeks.`;
            tutorial.implication = 'Initial -5% to -12% drop is normal. Recovery expected as "${narrative}" narrative takes hold.';
            tutorial.action = 'CONSIDER BUYING THE DIP - History shows "bad news" pivots often lead to rallies.';
            tutorial.timing = 'ENTRY: On dip after announcement (or wait for "digesting" phase). EXIT: +8% to +15% during rerating.';
            tutorial.catalyst = `KEY PATTERN: "Unfavorable news" → Market digests → Analysts reframe as "${narrative}" → Recovery rally.`;
        } else if (phase === 'digesting') {
            tutorial.type = `${label} - Market Digesting`;
            tutorial.description = 'Initial selling exhausted. Market processing the strategic change.';
            tutorial.implication = 'Dip likely near bottom. Watch for narrative shift from "bad" to "bold."';
            tutorial.action = 'BUY if you haven\'t - Selling pressure fading. Recovery phase coming.';
            tutorial.timing = 'ENTRY: Good entry point. EXIT: +8% to +15% during rerating phase.';
            tutorial.catalyst = `Expected: Analysts will soon reframe this as "${narrative}" story → stock rebounds.`;
        } else if (phase === 'rerating') {
            tutorial.type = `${label} - "Bold Move" Rally`;
            tutorial.description = `Narrative shift complete! What was "bad news" is now "${narrative}" story. Stock recovering.`;
            tutorial.implication = 'Recovery in progress. Pattern typically recovers most/all of initial drop.';
            tutorial.action = 'HOLD or TAKE PARTIAL PROFITS - Rally playing out as expected.';
            tutorial.timing = 'ENTRY: Late but potentially ok. EXIT: Consider selling at +10% to +15% from bottom.';
            tutorial.catalyst = 'Classic Wall Street: Bad news → "Actually this is smart" → Rally. Human nature at work.';
        } else if (phase === 'complete') {
            tutorial.type = `${label} - Priced In`;
            tutorial.description = 'Strategic pivot fully digested. Stock returns to trading on fundamentals.';
            tutorial.implication = 'Easy money made. Future depends on execution of the plan.';
            tutorial.action = 'TAKE PROFITS if holding - The predictable trade is over.';
            tutorial.timing = 'ENTRY: No longer attractive. EXIT: Close remaining position.';
            tutorial.catalyst = 'Trade complete. Now watch for actual results from the strategic changes.';
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
            const isAddition = newsItem.indexAction === 'add' || (newsItem.headline || '').toLowerCase().includes('added');
            if (isAddition) {
                tutorial.type = 'Index Addition (Forced Buying Coming)';
                tutorial.description = 'Stock being ADDED to major index. Index funds MUST buy regardless of price.';
                tutorial.implication = 'Modern markets are efficient. Expect +3-5% total from entry to exit (realistic).';
                tutorial.action = 'BUY on announcement - modest but reliable gains from forced index fund buying.';
                tutorial.timing = 'ENTRY: Buy when you see "joins index" news. EXIT: Sell on "Effective TOMORROW" news.';
                tutorial.catalyst = '⚠️ "Effective tomorrow" news = YOUR SELL SIGNAL. Next day is too late!';
            } else {
                tutorial.type = 'Index Removal (Forced Selling Coming)';
                tutorial.description = 'Stock being REMOVED from major index. Index funds MUST sell regardless of price.';
                tutorial.implication = 'Expect -3-5% total drop. Short sellers profit from forced selling pressure.';
                tutorial.action = 'SHORT or AVOID - Forced selling creates predictable downward pressure.';
                tutorial.timing = 'ENTRY (short): On announcement. EXIT: Cover on effective date, watch for bounce.';
                tutorial.catalyst = 'Post-removal bounce often +2-3% as selling exhausts. Reversal trade possible.';
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
            ticker: stock.ticker,
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
        output.push(`  Stock: ${ctx.ticker} @ $${ctx.currentPrice.toFixed(2)}`);
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
