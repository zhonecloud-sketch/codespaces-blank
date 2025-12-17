# STONKS 9800 - Stage 03 Feature Plan

## Stage 03: Options Trading (Primary Feature)

### Why Options Over Technical Analysis

Technical Analysis was considered but rejected because:
- Indicators are **descriptive, not predictive**
- The honest lesson is "this doesn't really work reliably"
- No actionable profit strategies emerge

Options Trading offers:
- **Concrete mechanics** with calculable outcomes
- **Teachable timing signals** tied to game events
- **Asymmetric risk/reward** strategies
- **Income generation** in sideways markets

---

## Options Trading Implementation

### Core Mechanics

#### Option Types
| Type | Right | Profit When | Risk |
|------|-------|-------------|------|
| **Call** | Buy stock at strike | Stock rises above strike | Premium paid |
| **Put** | Sell stock at strike | Stock falls below strike | Premium paid |

#### The Greeks (Simplified)
| Greek | Plain English | Game Display |
|-------|--------------|--------------|
| **Delta** | Option moves $X per $1 stock move | "Δ 0.45 = +$45 per $100 move" |
| **Theta** | Daily time decay cost | "θ -$12/day = melting ice cube" |
| **Vega** | Sensitivity to volatility | "High IV = expensive options" |

---

### WHEN to Buy Calls (Timing Signals)

| Signal | Why It Works | Game Alert |
|--------|--------------|------------|
| **After capitulation** | Panic exhausted, bounce likely | "📈 Capitulation on {STOCK} - calls profit from bounce" |
| **Insider buying** | Insiders know catalyst coming | "📈 Insider bought $500K - consider calls before news" |
| **Post-crash day 3-5** | Dead cat bounce probability high | "📈 Crash day 4 - bounce probability 73%" |
| **Short squeeze building** | High SI + catalyst = explosion | "📈 Short interest 35% - squeeze setup" |
| **Low IV before event** | Options underpriced | "📈 Earnings in 5 days, IV only 25%" |

### WHEN to Buy Puts (Timing Signals)

| Signal | Why It Works | Game Alert |
|--------|--------------|------------|
| **Manipulation pump day 4+** | Dump phase imminent | "📉 Pump day 5 - distribution detected" |
| **Dividend at risk** | High yield = distress | "📉 Yield 12% - company struggling" |
| **FOMO rally exhaustion** | Day 7+ usually reverses | "📉 FOMO day 7 - momentum fading" |
| **Huge run into earnings** | Priced for perfection | "📉 Stock +40% into earnings - high risk" |

---

### Strike Price Selection

| Situation | Strike | Lesson |
|-----------|--------|--------|
| **High confidence** | ATM (At The Money) | Highest delta, moves most |
| **Speculative bet** | OTM (Out of Money) | Cheaper but needs bigger move |
| **Selling for income** | Far OTM | High probability of keeping premium |
| **Insurance** | Slightly OTM puts | Lower cost protection |

**Key Lesson**: "Strike = probability bet. ATM = 50% profit chance. Far OTM = 10% chance, 10x payout."

---

### Contract Duration (DTE)

| Duration | Best For | Lesson |
|----------|----------|--------|
| **7 days** | Known catalyst (earnings) | Cheap but theta kills fast |
| **14-30 days** | Swing trades | Sweet spot - time + reasonable cost |
| **45-60 days** | Selling options | Theta accelerates - seller advantage |
| **90+ days** | Long conviction (LEAPS) | Less stress, more capital |

**Key Lesson**: "Match DTE to catalyst. No catalyst? Don't buy options."

---

### Teachable Strategies

#### 1. The Wheel (Income Generation)
```
Step 1: Sell cash-secured PUT on stock you want
        → Collect premium while waiting
Step 2: If assigned, you now own stock at lower price
Step 3: Sell covered CALL on your shares
        → Collect premium while holding
Step 4: If called away, profit from strike + all premiums
Step 5: Repeat
```
**Lesson**: "Generate income in sideways markets. Works on stable dividend stocks."

#### 2. Earnings Straddle
```
Buy CALL + PUT at same strike before earnings
Profit if stock moves BIG either direction
Lose if stock barely moves (theta + IV crush)
```
**Lesson**: "Bet on volatility, not direction. Only works if move exceeds IV expectation."

#### 3. Protective Put (Insurance)
```
Own stock + Buy OTM put
If stock crashes, put protects downside
Cost: premium paid (like insurance premium)
```
**Lesson**: "Insurance costs money. Decide if peace of mind is worth the premium."

---

### IV Crush Warning System

```
⚠️ IV CRUSH WARNING
━━━━━━━━━━━━━━━━━━━━
Stock: AAPL - Earnings in 2 days
Current IV: 85% (normal: 25%)
Options are 3.4x overpriced!

💡 Even if RIGHT about direction,
   IV crush may still lose money.
   Consider SELLING options instead.
```

---

### Game UI Components

#### Options Chain Display
```
┌─────────────────────────────────────────────────────┐
│ AAPL OPTIONS - Price: $250.00          DTE: 14 days │
├──────────────────────┬──────────────────────────────┤
│ CALLS                │ PUTS                         │
│ Strike  Price  Δ     │ Strike  Price  Δ             │
│ $240    $15.20 0.72  │ $240    $4.80  -0.28         │
│ $245    $11.50 0.62  │ $245    $6.20  -0.38         │
│►$250    $8.30  0.50◄ │►$250    $8.10  -0.50◄  ATM   │
│ $255    $5.80  0.38  │ $255    $10.60 -0.62         │
│ $260    $3.90  0.28  │ $260    $13.70 -0.72         │
├──────────────────────┴──────────────────────────────┤
│ IV: 32%  │  θ decay: $0.58/day  │  📈 Call signal! │
└─────────────────────────────────────────────────────┘
```

#### Position Display
```
┌─────────────────────────────────────────────────────┐
│ YOUR OPTIONS                                         │
├─────────────────────────────────────────────────────┤
│ AAPL $255 CALL x2    Cost: $1,160   Now: $1,840    │
│ Expires: 12 days     P&L: +$680 (+58%)    [SELL]   │
│ θ: -$1.16/day        Δ: 0.52                       │
├─────────────────────────────────────────────────────┤
│ NVDA $140 PUT x1     Cost: $420    Now: $285       │
│ Expires: 5 days      P&L: -$135 (-32%)    [SELL]   │
│ θ: -$2.10/day        Δ: -0.35                      │
└─────────────────────────────────────────────────────┘
```

---

### Opportunity Alert System

The game detects setups and provides actionable alerts:

```
📈 CALL OPPORTUNITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stock: INTC ($20.50)
Signal: Capitulation + High Short Interest
Setup: Post-crash day 4, SI at 28%

Suggested Trade:
  Strike: $22 (ATM+7%)
  DTE: 14 days
  Est. Premium: $0.85 ($85/contract)
  
Historical Win Rate: 68%
Max Loss: $85 (premium)
Target: $170-$255 (100-200% gain)

💡 Capitulation marks panic bottom.
   High SI adds squeeze potential.
   2-week window captures bounce.
   
   [BUY CALL]  [DISMISS]
```

---

### Core Lessons Delivered

| # | Lesson | How Taught |
|---|--------|------------|
| 1 | **Timing = Catalyst** | Only show alerts when events align |
| 2 | **Strike = Conviction** | Suggest ATM for high-confidence, OTM for spec |
| 3 | **DTE = Timeline** | Match suggested duration to catalyst |
| 4 | **IV > Direction** | Warn when options overpriced |
| 5 | **Theta Eats Premium** | Show daily decay in portfolio |
| 6 | **Selling = Edge** | Teach Wheel strategy for income |
| 7 | **Size Small** | Warn if position >10% of portfolio |
| 8 | **No Catalyst = No Trade** | Don't show alerts without reason |

---

## Future Features (Stages 04+)

### Stage 04: Margin Trading
- 1.5x-2x leverage
- Margin call mechanics
- Interest costs visible
- Forced liquidation events

### Stage 05: Portfolio Analytics
- Performance tracking
- Risk metrics
- Sector allocation
- Win rate by strategy

### Stage 06: Achievements & Tutorial
- Unlockable badges
- Interactive walkthrough
- Strategy mastery tracking

---

## Stage 03 Additional Features

### Feature 2: Enhanced Short Selling Education ✅ IMPLEMENTED

#### Implementation Status
- ✅ Borrow rate calculation based on short interest (base 2% APR with multipliers up to 20x)
- ✅ Daily borrow fee deduction from cash
- ✅ Squeeze warning detection when SI > 25%
- ✅ Hard-to-borrow blocking when SI > 35%
- ✅ Short opportunity detection (pump exhaustion, distribution, FOMO end)
- ✅ Infinite loss warning for large positions (>15% of portfolio)
- ✅ Position size warnings displayed in detail view

#### Current Implementation
- Basic short selling unlocked at 25 reputation
- 150% margin requirement
- Cover to close positions
- Short interest tracking per stock

#### Missing Educational Elements (NOW IMPLEMENTED)

| Gap | Educational Value | Implementation |
|-----|-------------------|----------------|
| **Borrow Rate** | Daily cost varies by demand | ✅ Show APR eating into profits |
| **Squeeze Signals** | When to avoid/exit shorts | ✅ Alert when SI >25% + catalyst |
| **Infinite Loss Risk** | Stocks can rise infinitely | Warning on large positions |
| **Hard-to-Borrow** | Some stocks unavailable | Block shorting on high SI |
| **Buy-In Risk** | Broker can force cover | Random forced covers |
| **Uptick Rule** | Can't short on downticks | Disable on circuit breakers |

#### Short Opportunity Alerts
```
📉 SHORT OPPORTUNITY: MEME ($145)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Signal: Pump phase day 5 (dump imminent)
Short Interest: 12% (low squeeze risk)
Borrow Rate: 8% APR (manageable)

💡 Distribution detected. Smart money exiting.

[SHORT]  [DISMISS]
```

#### Short Warning Alerts
```
⚠️ SHORT DANGER: MEME ($145)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Short Interest: 38% (SQUEEZE RISK!)
Borrow Rate: 45% APR (expensive!)
Days to Cover: 4.2 days
Your Position: -50 shares @ $130

💡 High SI = squeeze fuel. Consider covering.
   Borrow rate costs you $8/day.

[COVER NOW]  [HOLD]
```

#### Borrow Rate Mechanics
| Short Interest | Borrow Rate | Daily Cost per $1000 |
|----------------|-------------|---------------------|
| < 10% | 2-5% APR | $0.05-0.14/day |
| 10-20% | 5-15% APR | $0.14-0.41/day |
| 20-30% | 15-40% APR | $0.41-1.10/day |
| > 30% | 40-100%+ APR | $1.10-2.74/day |

#### Core Short Selling Lessons
| # | Lesson | How Taught |
|---|--------|------------|
| 1 | **Unlimited Loss** | Show "Max Loss: ∞" vs "Max Gain: Entry Price" |
| 2 | **Borrow Costs** | Daily P&L shows borrow fee deduction |
| 3 | **Squeeze Risk** | Alert when SI >25% |
| 4 | **Timing Matters** | Show optimal entry during pump exhaustion |
| 5 | **Size = Survival** | Warn if short >10% of portfolio |

---

### Feature 3: Trade Journal System ✅ IMPLEMENTED

#### Implementation Status
- ✅ All trades logged (BUY, SELL, SHORT, COVER)
- ✅ Market conditions captured at time of trade
- ✅ Auto-tagging system (fomo, crash, squeeze, pump, earnings, etc.)
- ✅ Auto-lesson detection based on conditions
- ✅ Journal view with trade history
- ✅ Pattern analysis (best/worst performing tags)
- ✅ Statistics: Win rate, profit factor, total P&L

#### Purpose
Every trade logged with automatic analysis to help players learn from mistakes.

#### Journal Entry Structure
```
┌─────────────────────────────────────────────────────┐
│ TRADE #47                           Day 52, Year 1  │
├─────────────────────────────────────────────────────┤
│ Action: SELL MEME                                   │
│ Entry: Day 45 @ $120.00 (10 shares)                │
│ Exit:  Day 52 @ $85.00                             │
│ Result: -$350 (-29.2%)                             │
├─────────────────────────────────────────────────────┤
│ 📊 MARKET CONDITIONS AT ENTRY:                      │
│   • FOMO rally day 6 (exhaustion imminent)         │
│   • Volume declining                                │
│   • RSI: Overbought                                │
├─────────────────────────────────────────────────────┤
│ 💡 AUTO-LESSON:                                     │
│   "Bought during FOMO exhaustion phase.            │
│    Day 6+ of FOMO usually reverses."               │
├─────────────────────────────────────────────────────┤
│ 🏷️ TAGS: #fomo #loss #timing-mistake               │
└─────────────────────────────────────────────────────┘
```

#### Auto-Generated Lessons
| Situation | Auto-Lesson |
|-----------|-------------|
| Bought during FOMO day 5+ | "FOMO rallies exhaust after day 5-7" |
| Sold during capitulation | "Capitulation often marks the bottom" |
| Held through dead cat bounce | "Dead cat bounces are traps - sell the rip" |
| Shorted during squeeze | "Never short into a squeeze" |
| Bought before earnings, lost | "Earnings are 50/50 - IV crush risk" |
| Sold winner too early | "Let winners run - you left $X on table" |
| Held loser too long | "Cut losses early - 7% rule" |

#### Journal Statistics
```
TRADE JOURNAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━
Total Trades: 47
Win Rate: 42%
Avg Winner: +$285
Avg Loser: -$180
Profit Factor: 1.3

TOP MISTAKES:
1. FOMO buying (12 trades, -$1,450)
2. Held losers too long (8 trades, -$890)
3. Position too large (5 trades, -$720)

TOP SUCCESSES:
1. Bought capitulation (6 trades, +$1,200)
2. Shorted pump dumps (4 trades, +$680)
3. Covered before squeeze (3 trades, +$450)
```

---

### Feature 4: Market Sentiment Index ✅ IMPLEMENTED

#### Implementation Status
- ✅ Sentiment calculated from 6 factors (price trend, volatility, SI, volume/FOMO, news, crashes)
- ✅ Header displays current sentiment value and zone label
- ✅ Journal view shows full sentiment gauge with zones
- ✅ Sentiment advice with historical return context
- ✅ Color-coded zones (red=fear, yellow=neutral, green=greed)
- ✅ Click header indicator to jump to journal view

#### Purpose
Aggregate fear/greed indicator teaching contrarian investing.

#### Display
```
┌─────────────────────────────────────────────────────┐
│ MARKET SENTIMENT                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  EXTREME    FEAR    NEUTRAL   GREED    EXTREME     │
│   FEAR                                  GREED      │
│    ├────────┼────────┼────────┼────────┤          │
│              ▲                                      │
│             28                                      │
│         "FEAR"                                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 💡 "Be fearful when others are greedy,             │
│     greedy when others are fearful." - Buffett     │
│                                                     │
│ Historical: Buying at <25 returns +18% avg         │
│             Buying at >75 returns -8% avg          │
└─────────────────────────────────────────────────────┘
```

#### Sentiment Components
| Factor | Fear Signal | Greed Signal | Weight |
|--------|-------------|--------------|--------|
| **Price Trend** | >3 stocks down >10% | >3 stocks up >10% | 25% |
| **Volatility** | Circuit breakers hit | Low volatility | 20% |
| **Short Interest** | Avg SI >20% | Avg SI <10% | 15% |
| **Volume** | Panic selling volume | FOMO buying volume | 15% |
| **News Sentiment** | Negative headlines | Positive headlines | 15% |
| **Crash Events** | Active crashes | No crashes | 10% |

#### Sentiment Zones
| Range | Zone | Lesson |
|-------|------|--------|
| 0-20 | Extreme Fear | "Blood in streets - best buying opportunity" |
| 20-40 | Fear | "Pessimism high - consider accumulating" |
| 40-60 | Neutral | "No clear signal - trade individual setups" |
| 60-80 | Greed | "Optimism high - take profits, reduce risk" |
| 80-100 | Extreme Greed | "Euphoria - sell into strength" |

#### Sentiment Alerts
```
🔴 EXTREME FEAR (18)
Market in panic. 4 stocks down >15%.
Capitulation selling detected on MEME, INTC.
💡 Historically, buying here returns +22% over 30 days.
```

```
🟢 EXTREME GREED (87)
Market euphoric. FOMO rallies active on 5 stocks.
Volume 3x average. Retail piling in.
💡 Historically, buying here returns -12% over 30 days.
```

---

### Feature 5: Sector Correlation Display

#### Purpose
Show how stocks move together for diversification education.

#### Display
```
SECTOR HEAT MAP
━━━━━━━━━━━━━━━━━━
Tech:    ████████░░ +2.3%  (AAPL, NVDA, MSFT, INTC)
Finance: ███░░░░░░░ -1.2%  (JPM, GS)
Retail:  █████░░░░░ +0.5%  (AMZN, WMT)
Energy:  ██░░░░░░░░ -1.8%  (XOM, CVX)
Meme:    ██████████ +8.5%  (GME, AMC, MEME)

💡 Diversify across sectors to reduce risk.
   Your portfolio: 80% Tech (HIGH RISK)
```

---

### Feature 6: Earnings Calendar

#### Purpose
Show upcoming catalysts for planning.

#### Display
```
EARNINGS CALENDAR
━━━━━━━━━━━━━━━━━━
📅 Day 48: AAPL - Consensus: Beat
   IV Rank: 85% (options expensive!)
   
📅 Day 50: NVDA - Consensus: Big Move
   IV Rank: 92% (very expensive!)
   
📅 Day 52: INTC - Consensus: Miss
   IV Rank: 65% (moderate)

💡 Options IV spikes before earnings.
   Consider selling options to collect premium.
```

---

### Feature 7: Risk Management Tools

#### Stop Loss Orders
```
SET STOP LOSS
━━━━━━━━━━━━━━━━━━
Stock: MEME (Current: $145)
Your Position: 20 shares @ $130

Stop Price: $120 (-17% from entry)
If triggered: Sell 20 shares market order

💡 7% stop loss is standard risk management.
   "Cut losses short, let profits run."
```

#### Take Profit Orders
```
SET TAKE PROFIT
━━━━━━━━━━━━━━━━━━
Stock: MEME (Current: $145)
Your Position: 20 shares @ $130

Target Price: $175 (+35% from entry)
If triggered: Sell 20 shares market order

💡 Set 2:1 reward-to-risk ratio.
   Risk $15/share to make $30/share.
```

---

### Feature 8: Volume Analysis

#### Display
```
VOLUME ALERT: MEME
━━━━━━━━━━━━━━━━━━
Today: 15M shares (3x average!)
Price Change: +2%

📊 HIGH VOLUME + UP = Strong buying (bullish)
📊 HIGH VOLUME + DOWN = Distribution (bearish)
📊 LOW VOLUME + UP = Weak rally (sell the rip)
📊 LOW VOLUME + DOWN = No conviction (may bounce)

💡 Volume confirms price moves.
   This move has conviction.
```

---

## Implementation Checklist - Stage 03

### Options Trading (COMPLETE)
- [x] options.js - Pricing, Greeks, contract management, UI handlers
- [x] state.js - Options positions, contracts tracking, stats
- [x] constants.js - Strike intervals, IV bases, DTE options
- [x] index.html - Options chain UI, positions, alerts overlay
- [x] styles.css - Options styling, call/put colors, chain display
- [x] market.js - Theta decay, IV changes, expiration processing
- [x] events.js - Opportunity detection, alert generation
- [x] render.js - Options display, P&L, Greeks, portfolio integration
- [x] app.js - Buy/sell handlers, overlay management

### Short Selling Education (DONE)
- [x] Add borrow rate calculation based on short interest
- [x] Add daily borrow fee deduction from cash
- [x] Add squeeze warning alerts
- [x] Add hard-to-borrow blocking
- [x] Add short opportunity detection
- [x] Add infinite loss warning display

### Trade Journal (DONE)
- [x] Add tradeJournal array to state
- [x] Log all buy/sell/short/cover actions
- [x] Auto-tag trades with market conditions (FOMO, crash, squeeze, etc.)
- [x] Generate auto-lessons for each trade
- [x] Add journal view with pattern analysis
- [x] Add win rate, profit factor, P&L statistics

### Market Sentiment (DONE)
- [x] Calculate sentiment from game events (price trends, volatility, crashes, etc.)
- [x] Add sentiment display to header and journal view
- [x] Add sentiment gauge with fear/greed zones
- [x] Add historical returns advice by sentiment zone

### Tutorial Mode (DONE)
- [x] Add tutorial toggle in Settings (📚 TUTORIAL MODE)
- [x] Add tutorial toggle in Menu (TUTORIAL MODE)
- [x] When enabled, unlock all features (options, short selling)
- [x] Embed educational hints directly in news items
- [x] Hints show: TYPE, WHAT (description), IMPLICATION, ACTION
- [x] Reactive only - hints appear when events occur (not predictive)
- [x] Cover 25+ phenomena: FOMO, panic, squeeze, crash, earnings, Fed, etc.
- [x] Keyword-based detection for non-tagged news items
- [x] Remove old overlay popup system

---

## Tutorial Mode Implementation Details

### Philosophy
Tutorial Mode is designed for **reactive learning** - players see educational context as events unfold, simulating real-world conditions where you learn to recognize patterns AFTER they happen, not predict them.

### News Item Format (Tutorial ON)
```
┌─────────────────────────────────────────────────────┐
│ 📰 MEME surges 15% on retail buying frenzy!         │
│                                                     │
│ ┌─ 🎓 TUTORIAL ──────────────────────────────────┐ │
│ │ TYPE: FOMO Rally (building phase)              │ │
│ │ WHAT: Fear Of Missing Out is driving retail    │ │
│ │       investors to pile in...                  │ │
│ │ IMPLICATION: Stock will likely continue        │ │
│ │              rising for several more days...   │ │
│ │ ACTION: CONSIDER BUYING - Early stage has      │ │
│ │         best risk/reward...                    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Covered Event Types

| Category | Events | Phases |
|----------|--------|--------|
| **FOMO Rally** | Social media buzz, retail frenzy | building, blowoff, collapse |
| **Panic Sell** | Fear, capitulation, blood in streets | early, mid, late |
| **Short Squeeze** | Shorts covering, explosive surge | early, mid, late |
| **Manipulation** | Pump & dump, suspicious volume | detection, warning |
| **Dead Cat Bounce** | False recovery, trap | active |
| **Fed Rate** | Rate decisions | hike, cut, hold |
| **Earnings** | Quarterly reports | beat, miss |
| **Dividend** | Dividend changes | increase, cut |
| **M&A** | Merger/acquisition | target |
| **Analyst** | Rating changes | upgrade, downgrade |
| **Regulatory** | Government action | positive, negative |
| **Geopolitical** | War, conflicts | war, peace |
| **Economic** | Macro events | boom, recession, inflation |
| **Market-wide** | Broad market | rally, decline |
| **Sentiment** | Extreme conditions | extreme_greed, extreme_fear |

### File Changes

#### tutorial.js
- `TUTORIAL_HINTS` - Comprehensive hint definitions (25+ types)
- `getTutorialForNews(newsItem)` - Detect phenomena and return tutorial data
- `getTutorialForSentiment(value)` - Sentiment-based hints
- `toggleTutorialMode()` - ON/OFF toggle, unlocks features
- `initTutorialMode()` - Initialize handlers

#### render.js
- `renderNews()` - Inject tutorial section when mode ON

#### styles.css
- `.tutorial-embedded` - Embedded hint styling in news items
- Removed overlay-based tutorial CSS

#### index.html
- Removed tutorial overlay HTML
- Settings toggle exists: `#toggleTutorial`
- Menu toggle exists: `#menuTutorial`

---

## Short Seller Report Mechanics

### Real-World Reference
Based on actual short seller attack patterns (Hindenburg, Muddy Waters, Iceberg, Viceroy, etc.):

**Typical Timeline:**
1. **Day 0**: Report released, immediate 20-40% crash (sometimes 60%+ for meme stocks)
2. **Day 1-3**: Company denial, partial recovery (bulls buy the dip)
3. **Day 7-14**: Follow-up report "Part 2" with new evidence, another 10-20% drop
4. **Day 14-28**: Possible Part 3/4, often timed around earnings announcements
5. **Final**: Resolution - either vindicated (permanent damage) or debunked (partial recovery)

**Real Examples:**
- Hindenburg vs Adani: 25% initial drop, multiple follow-ups, still down 50%+ months later
- Hindenburg vs Nikola: 40% crash, CEO resigned, fraud confirmed
- Citron vs GameStop: Backfired spectacularly (rare case of debunking)

### Game Implementation

#### Phase Flow
```
initial_crash → denial → [waiting → followup_attack → denial]* → investigation → resolution
                         ↑________________repeat 0-3 times________________↓
```

#### Phase Details

| Phase | Duration | Price Impact | Notes |
|-------|----------|--------------|-------|
| `initial_crash` | 1 day | -25% to -40% (×meme multiplier) | Immediate massive drop |
| `denial` | 2-3 days | +6% per day | Company responds, bulls buy dip |
| `waiting` | 5-14 days | Slight negative drift | Market uncertain, short seller preparing |
| `followup_attack` | 1 day | -10% to -20% | "Part 2/3/4" released |
| `investigation` | 5-10 days | ±3% random | Market evaluating evidence |
| `resolution` | 1 day | Varies | Vindicated: -15% + permanent EPS damage; Debunked: +15-25% |

#### Vindication Probability
- Base: 50%
- +15% per wave (more follow-ups = more likely they found real problems)
- Wave 1 only: 65% vindicated
- Wave 2: 80% vindicated  
- Wave 3+: 95% vindicated

#### Meme Stock Multiplier
All effects multiplied by `getMemeMultiplier(stock)`:
- Normal stocks: 1.0x
- High-volatility stocks: 1.2-1.5x
- Meme stocks: 1.5-2.0x

### Code Location
- **Mechanics**: `market.js` → `processShortSellerReports()`, `triggerShortSellerReport()`
- **News**: `events.js` → `checkShortSellerReportEvents()`, `generateShortReportNews()`
- **Constants**: `constants.js` → `short_report` sentiment event (standalone version, -30% no snapback)

### Player Strategy Tips
1. **Don't buy the dip** after Wave 1 - more waves likely coming
2. **Put options** are valuable during short attack if you spot early signs
3. **Wait for resolution** before deciding to enter
4. **Debunking is rare** (especially after multiple waves) - usually vindicated
5. **Recovery is partial** even when debunked - mud sticks

---

## Multi-Wave Manipulation (Pump & Dump) Mechanics

### Real-World Reference
Based on actual pump & dump patterns where manipulators run multiple cycles:

**Typical Pattern:**
1. **Wave 1**: Initial accumulation → catalyst → distribution (partial sell)
2. **Wave 2**: Re-accumulation during "consolidation" → new catalyst → more distribution  
3. **Wave 3**: Final accumulation → final pump → complete exit → crash

**Real Examples:**
- Many penny stocks see 2-3 pump cycles before final collapse
- Each wave attracts new retail buyers who become the next wave's exit liquidity
- Later buyers are more at risk - they're buying from wave 1 & 2 investors

### Game Implementation

#### Phase Flow
```
accumulation → catalyst → distribution → [re_accumulation → catalyst → distribution]* → crash
              ↑________________________________repeat 0-2 times_______________________↓
```

#### Phase Details

| Phase | Duration | Price Impact | Notes |
|-------|----------|--------------|-------|
| `accumulation` | 5-10 days | +0.5% per day drift | Initial quiet buying |
| `catalyst` | 1 day | +25-50% spike (×meme) | Big rumor/news drops |
| `distribution` | 3-5 days | Flat (selling into demand) | Institutions offloading |
| `re_accumulation` | 3-5 days | -2% per day drift | "Consolidation" shake-out |
| `crash` | 2-3 days | -18% per day (×wave×meme) | Final dump, retail trapped |

#### Wave Probability
- Wave 1 → 60% chance of another cycle
- Wave 2 → 40% chance of another cycle
- Wave 3 → Always crash (max 3 cycles)

#### Crash Severity
Multi-wave schemes crash HARDER:
- Wave 1 crash: Base severity
- Wave 2 crash: +30% more severe  
- Wave 3 crash: +60% more severe

More pump cycles = more retail trapped = worse crash.

### Code Location
- **Mechanics**: `market.js` → `processInstitutionalManipulation()`, `startInstitutionalScheme()`
- **News**: `market.js` → `generateManipulationCatalystNews()`, `generateManipulationReaccumulationNews()`, `generateManipulationCrashNews()`

### Player Strategy Tips
1. **Watch for re-accumulation** - "Healthy consolidation" often precedes wave 2
2. **Each wave has diminishing pump** - 15% less effective each time (skepticism builds)
3. **Don't chase wave 2/3** - You're late, insiders already positioned
4. **Put options** get more valuable with each wave (bigger crash coming)
5. **Volume clues** - Declining volume on pumps, increasing on dumps

---

## Multi-Bounce Dead Cat Mechanics

### Real-World Reference
Based on actual market crash patterns where stocks see multiple false bottoms:

**Typical Pattern:**
1. **Initial crash**: Sharp 20-40% drop on bad news
2. **Bounce 1**: 10-15% recovery, "bottom hunters" buy the dip → fails
3. **Bounce 2**: 8-12% recovery, weaker, "surely this is the bottom" → fails  
4. **Bounce 3**: 5-8% recovery, very weak, capitulation buyers → may be real bottom
5. **Resolution**: Either true bottom (recovery) or secular decline

**Real Examples:**
- Enron: Multiple bounces before final collapse
- 2008 financial crisis: 6+ false bottoms before real recovery
- Most bubbles: "buy the dip" mentality creates repeated bounces

### Game Implementation

#### Phase Flow
```
crash → [bounce → continued_decline]* → resolution
        ↑_______repeat 1-4 times______↓
```

#### Phase Details

| Phase | Duration | Price Impact | Notes |
|-------|----------|--------------|-------|
| `crash` | 2-3 days | -12-20% per day (×meme) | Initial freefall |
| `bounce` | 1-3 days | +3-12% per day (weakens each bounce) | False recovery trap |
| `continued_decline` | 2-3 days | -5-12% per day (weakens each decline) | Another leg down |
| `resolution` | 1 day | Varies | True bottom OR secular decline |

#### Bounce Characteristics
Each successive bounce is WEAKER:
- Bounce 1: +12% max recovery (strong trap)
- Bounce 2: +9.5% max recovery
- Bounce 3: +7% max recovery
- Bounce 4: +4.5% max recovery (weak, likely real bottom)

#### Multiple Bounce Probability
- After bounce 1: 70% chance of another bounce
- After bounce 2: 50% chance of another bounce
- After bounce 3: 30% chance of another bounce  
- After bounce 4: Always resolve (max 4 bounces)

#### Resolution Probability
More bounces = more likely this is the REAL bottom (selling exhaustion):
- 1 bounce: 30% real bottom, 70% secular decline
- 2 bounces: 45% real bottom
- 3 bounces: 60% real bottom
- 4 bounces: 80% real bottom

### Code Location
- **Mechanics**: `market.js` → `processDeadCatBounce()`, `triggerCrash()`
- **News**: `market.js` → `generateBounceFailedNews()`, `generateAnotherBounceNews()`, `generateRealBottomNews()`, `generateSecularDeclineNews()`

### Player Strategy Tips
1. **Don't buy bounce 1** - 70% chance of more pain
2. **Count the bounces** - More bounces = closer to real bottom
3. **Watch bounce strength** - Weaker bounces signal exhaustion
4. **Wait for resolution** - Patience prevents catching falling knives
5. **Put options** profitable during bounce phase (especially early bounces)
6. **Call options** reasonable after 3+ bounces resolved with real bottom

---

## Future Wave-Based Systems (Not Yet Implemented)

### Activist Investor Campaign

**Real-World Pattern:**
1. **Disclosure**: 13D filing reveals 5%+ stake, stock jumps 10-20%
2. **Letter Campaign**: Public letter demanding changes, +5-10% if well-received
3. **Proxy Fight**: Battle for board seats, uncertainty volatility
4. **Board Victory/Defeat**: Resolution with major move either way
5. **Implementation**: If won, multi-month turnaround period

**Why Valuable:**
- Teaches patience (campaigns take months)
- Teaches fundamental analysis (are demands reasonable?)
- Creates interesting timing decisions around proxy dates

### M&A Bidding War

**Real-World Pattern:**
1. **Initial Offer**: Acquirer offers premium, stock jumps to near offer price
2. **Competing Bid**: Second bidder enters, another 10-15% jump
3. **Counter Offers**: Back-and-forth bidding, price keeps climbing
4. **Regulatory Review**: Uncertainty period, deal may fail
5. **Resolution**: Deal closes (at final price) or fails (crashes back)

**Why Valuable:**
- Multiple upside waves with clear catalyst
- Risk/reward decisions: hold for higher bid vs take profit
- Regulatory risk teaches uncertainty management

### Regulatory Investigation Wave

**Real-World Pattern:**
1. **Rumor**: Whispers of investigation, -10-15% uncertainty
2. **Confirmation**: Official announcement, another -10-20%
3. **Waiting**: Extended uncertainty (months), stock drifts
4. **Settlement/Charges**: Resolution with big move either way
5. **Aftermath**: Fine = recovery; charges = secular decline

**Why Valuable:**
- Extended uncertainty periods teach patience
- Teaches that uncertainty often worse than bad outcome
- Settlement vs charges creates interesting risk assessment

### Earnings Revision Cycle

**Real-World Pattern:**
1. **Pre-announcement**: Company hints at issues, -5-10%
2. **Actual Miss**: Numbers released, -10-20% more
3. **Guidance Cut**: Forward outlook reduced, -5-10% more
4. **Analyst Downgrades**: Wave of cuts, -5% more
5. **Kitchen Sink**: Eventually all bad news priced in, bottom

**Why Valuable:**
- Multiple waves of pain teach "bad news comes in bunches"
- Kitchen sink quarter recognition = buying opportunity
- Teaches to wait for guidance, not just earnings

### Bankruptcy Process

**Real-World Pattern:**
1. **Liquidity Concerns**: Rumors of cash problems, -20-30%
2. **Going Concern Warning**: Auditor warning, -15-25% more
3. **Restructuring**: Attempts to avoid bankruptcy, bounces/drops
4. **Chapter 11**: Filing, stock often worthless (equity wiped)
5. **Emergence**: If survives, new equity may have value

**Why Valuable:**
- Ultimate "don't catch falling knife" lesson
- Teaches that equity = last in line
- Rare but memorable learning experience

---

## 📋 PLAYER STRATEGY GUIDE

### Event Tier System

Events are categorized into tiers based on educational value and tradability:

| Tier | Educational Value | Default | Description |
|------|------------------|---------|-------------|
| **Tier 1** | Highly Educational | ✅ ON | Clear telltales, predictable timeline, good price range |
| **Tier 2** | Good Educational | ✅ ON | Clear signals with some complexity |
| **Tier 3** | Moderate | ❌ OFF | Requires experience, harder to time |
| **Tier 4** | Advanced/Random | ❌ OFF | Unpredictable or difficult to profit from |

---

### TIER 1: Highly Educational Events

#### 1. Short Seller Report 🔴

**The Setup:** Activist short sellers publish research reports exposing alleged fraud or problems.

**Telltales to Identify:**
- News about "SHORT SELLER TARGETS" with specific firm name (Muddy Waters, Hindenburg, etc.)
- Initial drop of 15-25% is the first wave
- Company responds with "REBUTTAL" within 1-2 days
- Look for escalation news like "SECOND REPORT" or "FOLLOW-UP ATTACK"

**Timeline:**
- **Day 0-2**: Initial attack - sharp drop (Wave 1)
- **Day 3-5**: Company rebuttal - partial recovery
- **Day 6-10**: Follow-up attacks possible (Waves 2-3)
- **Day 10-20**: Resolution phase - trend becomes clear

**Trading Strategy:**
1. **DON'T buy the initial dip** - more waves usually follow
2. Wait for Wave 2 or 3 announcement (if any)
3. After final wave, wait 2-3 days for selling exhaustion
4. Entry zone: 40-55% below pre-attack price
5. Exit zone: Recovery to 70-85% of original price
6. Stop loss: 60% below original (new low made)

**Risk Level:** MEDIUM - Multi-wave structure is predictable once understood.

---

#### 2. Index Rebalancing 🟢

**The Setup:** S&P 500 or other major index announces adds/removes stocks on fixed dates.

**Telltales to Identify:**
- News about "INDEX ADDITION" or "INDEX REMOVAL"
- Known effective date (usually 5-10 days advance notice)
- Volume increases as index funds prepare
- Price momentum accelerates into effective date

**Timeline:**
- **Announcement to Day -5**: Gradual positioning begins
- **Day -5 to -1**: Momentum accelerates
- **Effective Date**: Forced buying/selling complete
- **Day +1 to +5**: Mean reversion as excess demand/supply normalizes

**Trading Strategy:**
1. **For additions**: Buy on announcement, sell day before effective date
2. **For removals**: Can short on announcement, cover before effective date
3. Entry: Within 1-2 days of announcement
4. Exit: Day before effective date (not after - "sell the news")
5. Expected gain: +8-15% for additions, -5-12% for removals

**Risk Level:** LOW - Fixed timeline, predictable institutional flows.

---

#### 3. Insider Buying 🟢

**The Setup:** Corporate executives or directors buy stock with their own money.

**Telltales to Identify:**
- News about "INSIDER BUYS" or "DIRECTOR PURCHASES"
- Look for MULTIPLE insiders or LARGE dollar amounts
- CEO/CFO buying is strongest signal
- Cluster buying (several insiders in short period) is very bullish

**Timeline:**
- **Day 0-5**: Initial reaction to news (+3-8%)
- **Day 5-20**: Continued bullish sentiment as market digests
- **Day 20-40**: Often catalyst emerges (earnings, deal, etc.)

**Trading Strategy:**
1. Buy within 1-2 days of insider buying news
2. Look for cluster buying (2+ insiders) for strongest signal
3. Entry: Up to +10% from pre-news price is still good
4. Target: +15-30% gain over 2-4 weeks
5. Stop loss: 8% below entry

**Risk Level:** LOW - Insiders know their companies best.

---

#### 4. Institutional Manipulation (Pump & Dump) ⚠️

**The Setup:** Large players coordinate to inflate price before dumping shares.

**Telltales to Identify:**
- Unusually large buying with thin news ("UNUSUAL BUYING ACTIVITY")
- Watch for "dark pool" or "offshore" volume clues = SUSPICIOUS
- Legitimate volume has catalysts (earnings, deal, product)
- Multiple pump waves before the crash

**Timeline:**
- **Wave 1 (Days 1-5)**: First pump, +20-35%
- **Wave 2 (Days 6-10)**: Second pump, +15-25% more (if occurs)
- **Wave 3 (Days 11-15)**: Final pump, +10-20% more (if occurs)
- **Dump Phase**: Sudden crash, -40-60% in 1-3 days

**Trading Strategy:**
1. **DO NOT buy during pump** unless you have clear exit plan
2. Count the waves - 1-3 pumps before dump is typical
3. Exit any position BEFORE suspected dump
4. After crash: DON'T buy, no clear recovery pattern
5. If you must trade: Small position, sell into strength, never hold overnight late in cycle

**Risk Level:** HIGH - Can profit but requires discipline. Most retail traders get dumped on.

---

### TIER 2: Good Educational Events

#### 5. Dead Cat Bounce 🔴

**The Setup:** After major crash, brief false recoveries before eventual bottom.

**Telltales to Identify:**
- Recent major crash event (-30%+ in short period)
- Recovery attempt of +10-20%
- News shows no fundamental improvement
- Multiple bounces typical (1-4 bounces before bottom)

**Timeline:**
- **Bounce 1**: +15-25% recovery, lasts 2-4 days, then fails
- **Bounce 2**: +12-20% recovery, weaker, lasts 1-3 days
- **Bounce 3**: +8-15% recovery, even weaker
- **Final bounce**: Very weak, may not reclaim prior bounce highs
- **True bottom**: When bounces stop and base forms

**Trading Strategy:**
1. **DON'T try to trade early bounces** - they fail
2. Count bounces: After 3-4 failed bounces, bottom is likely near
3. Entry: Wait for failed bounce pattern to exhaust (20-30+ days post-crash)
4. Look for news improving OR selling completely exhausted
5. Scale in small, add on confirmation of trend change
6. Stop loss: New lows made

**Risk Level:** MEDIUM-HIGH - Counter-trend trading requires patience.

---

#### 6. Stock Split 🟢

**The Setup:** Company splits shares (e.g., 4:1) making stock "cheaper" per share.

**Telltales to Identify:**
- Clear "STOCK SPLIT ANNOUNCED" news
- Ratio specified (2:1, 4:1, 10:1, etc.)
- Fixed effective date
- Usually announced by successful, high-priced companies

**Timeline:**
- **Announcement to Split**: 2-4 week lead time
- **Pre-split rally**: Often +10-20% excitement
- **Split day**: Shares multiply, price divides proportionally
- **Post-split**: Often continued momentum +5-15%

**Trading Strategy:**
1. Buy on split announcement
2. Hold through split date
3. Consider selling 50% at split, hold 50% for post-split momentum
4. Exit fully within 1-2 weeks post-split
5. No fundamental change - purely sentiment driven

**Risk Level:** LOW - Psychology driven but fairly predictable.

---

#### 7. Short Squeeze 🟡

**The Setup:** Heavily shorted stock rises, forcing shorts to cover, creating buying spiral.

**Telltales to Identify:**
- High short interest mentioned in news (>20% is high)
- Positive catalyst (earnings beat, deal announced)
- Volume surges dramatically
- Price gaps up and accelerates

**Timeline:**
- **Catalyst (Day 0)**: Initial gap up, shorts start covering
- **Days 1-3**: Squeeze accelerates, parabolic moves possible
- **Peak**: Volume exhaustion, no more shorts to cover
- **Collapse**: Rapid reversal as momentum fades

**Trading Strategy:**
1. **DO NOT chase parabolic moves**
2. If early: Buy on catalyst, ride momentum with trailing stop
3. Take profits in tranches (1/3 at +30%, 1/3 at +50%, 1/3 with tight stop)
4. Never add to position after day 2
5. If missed: DON'T buy, wait for next setup

**Risk Level:** HIGH - Explosive gains possible, but timing exit is critical.

---

#### 8. FOMO Rally 🟡

**The Setup:** Fear of missing out drives irrational buying, price disconnects from fundamentals.

**Telltales to Identify:**
- Multiple days of gains with accelerating momentum
- News becomes increasingly euphoric ("TO THE MOON!")
- Everyone talking about the stock
- Volume increases but price gains shrink (exhaustion)

**Timeline:**
- **Early Phase (Days 1-3)**: Legitimate buying, +15-25%
- **Middle Phase (Days 4-6)**: Momentum buyers pile in, +20-30%
- **Late Phase (Days 7-10)**: Euphoria, price targets absurd
- **Blow-off Top**: One final spike, then sharp reversal
- **Crash**: -30-50% in 1-3 days

**Trading Strategy:**
1. **If early**: Ride with trailing stop (15-20%)
2. **If middle**: Take partial profits, tighten stop
3. **If late (day 7+)**: DO NOT BUY, consider shorting
4. Watch for volume divergence (price up, volume down = exhaustion)
5. "Blow-off" day (huge volume, spike then reversal) = exit immediately

**Risk Level:** MEDIUM - Easy to profit early, dangerous late.

---

### General Trading Principles

#### The Numbers That Matter

| Metric | What to Watch | Threshold |
|--------|---------------|-----------|
| **Days into event** | Multi-day events have phases | Know which phase you're in |
| **% from event start** | Track your risk/reward | Entry, target, stop levels |
| **Volume trend** | Confirms or warns | Rising = momentum; Falling = exhaustion |
| **Wave/Bounce count** | Multi-wave events | Know how many before final phase |

#### Universal Rules

1. **Never chase** - If you missed the move, wait for next opportunity
2. **Know your exit before entry** - Target price and stop loss
3. **Size appropriately** - Riskier setups = smaller positions
4. **Respect the timeline** - Each event has expected duration
5. **Count the waves** - Multi-wave events have predictable structures
6. **News sentiment ≠ Price direction** - "Sell the news" is real
7. **When in doubt, sit out** - Cash is a position

#### Position Sizing by Risk Level

| Risk Level | Position Size | Stop Loss | Notes |
|------------|--------------|-----------|-------|
| LOW | Up to 15% of capital | 8% | Index rebalance, splits |
| MEDIUM | Up to 10% of capital | 10-12% | Short reports, insider buying |
| HIGH | Up to 5% of capital | 15-20% | Manipulation, squeezes, FOMO |

---

### Tutorial Mode Features

When **Tutorial Mode** is ON:
- 🎓 **HINT** button appears on each news item
- Basic hint shows: Type, What, Implication, Action
- 📋 **DETAILED TRADING STRATEGY** expands to show:
  - Telltales to identify the event
  - Timeline with entry/exit windows
  - Calculated price targets for current stock
  - Step-by-step strategy
  - Risk level warning

**Recommended**: Keep Tutorial Mode ON while learning, enable Tier 3-4 events gradually as you master Tier 1-2.
