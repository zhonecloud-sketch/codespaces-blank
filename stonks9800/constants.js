// ===== STONKS 9800 - Stage 03 - Constants =====

const INITIAL_CASH = 100000; // $100,000 USD starting capital
const MAX_HISTORY_POINTS = 50;
const DAYS_IN_MONTH = 30;
const DAYS_IN_QUARTER = 90;
const DAYS_IN_YEAR = 360;

// Short Selling
const SHORT_SELL_REP_REQUIRED = 25;
const SHORT_BORROW_RATE_BASE = 0.02; // 2% base APR
const SHORT_BORROW_RATE_MULTIPLIERS = {
  LOW: 1,      // SI < 10%
  MEDIUM: 3,   // SI 10-20%
  HIGH: 8,     // SI 20-30%
  EXTREME: 20  // SI > 30%
};
const SHORT_HARD_TO_BORROW_THRESHOLD = 0.35; // 35% SI = hard to borrow
const SHORT_SQUEEZE_WARNING_THRESHOLD = 0.25; // Warn at 25% SI
const SHORT_MAX_POSITION_PCT = 0.15; // Warn if short >15% of portfolio

// Trade Journal
const JOURNAL_MAX_ENTRIES = 100; // Keep last 100 trades
const JOURNAL_LESSONS = {
  FOMO_BUY: 'Bought during FOMO rally - these exhaust after day 5-7',
  CAPITULATION_SELL: 'Sold during capitulation - panic selling often marks bottoms',
  DEAD_CAT_HOLD: 'Held through dead cat bounce - bounces are traps, sell the rip',
  SQUEEZE_SHORT: 'Shorted during squeeze buildup - never fight a squeeze',
  EARNINGS_LOSS: 'Lost on earnings play - 50/50 odds with IV crush risk',
  SOLD_EARLY: 'Sold winner early - left money on the table',
  HELD_LOSER: 'Held loser too long - cut losses at 7-10%',
  PUMP_BUY: 'Bought during pump phase - smart money already exiting',
  DISTRIBUTION_SELL: 'Sold during distribution - good timing, institutions exiting',
  INSIDER_FOLLOW: 'Followed insider activity - insiders know their company',
  GOOD_ENTRY: 'Good entry timing - bought at relative low',
  GOOD_EXIT: 'Good exit timing - sold near relative high'
};

// Market Sentiment
const SENTIMENT_ZONES = {
  EXTREME_FEAR: { min: 0, max: 20, label: 'EXTREME FEAR', color: '#dc2626' },
  FEAR: { min: 20, max: 40, label: 'FEAR', color: '#f97316' },
  NEUTRAL: { min: 40, max: 60, label: 'NEUTRAL', color: '#facc15' },
  GREED: { min: 60, max: 80, label: 'GREED', color: '#84cc16' },
  EXTREME_GREED: { min: 80, max: 100, label: 'EXTREME GREED', color: '#22c55e' }
};
const SENTIMENT_WEIGHTS = {
  PRICE_TREND: 0.25,
  VOLATILITY: 0.20,
  SHORT_INTEREST: 0.15,
  VOLUME: 0.15,
  NEWS: 0.15,
  CRASHES: 0.10
};

// Transaction Fees (US Standard - Regulatory fees only, commission-free era)
const TRANSACTION_FEES = {
  SEC_FEE_RATE: 0.0000278,      // $0.0000278 per $ of sale proceeds (SEC fee on SELLS only)
  FINRA_TAF_RATE: 0.000166,    // $0.000166 per share sold (FINRA TAF on SELLS only)
  FINRA_TAF_MAX: 8.30,          // Maximum FINRA TAF per transaction
  OPTIONS_CONTRACT_FEE: 0.65,   // $0.65 per options contract (both buy and sell)
  MIN_FEE: 0.01                 // Minimum fee displayed (round up to 1 cent)
};

// Options Trading
const OPTIONS_REP_REQUIRED = 30; // Reputation needed to unlock options
const OPTIONS_CONTRACT_SIZE = 100; // Standard 100 shares per contract
const OPTIONS_MAX_CONTRACTS = 10; // Max contracts per trade
const OPTIONS_MAX_POSITION_PCT = 0.15; // Warn if position >15% of portfolio
const OPTIONS_COMMISSION = 0.65; // $0.65 per contract (simplified)

// Options expiration choices (days to expiry)
const OPTIONS_DTE_CHOICES = [
  { days: 7, label: '7d', description: 'Weekly - Highest theta decay, cheapest' },
  { days: 14, label: '14d', description: '2 weeks - Moderate decay, good for swing trades' },
  { days: 30, label: '30d', description: 'Monthly - Standard, balanced' },
  { days: 45, label: '45d', description: '45 days - Seller sweet spot' },
  { days: 60, label: '60d', description: '2 months - Lower decay, more time' }
];

// IV levels for warnings
const IV_CRUSH_THRESHOLD = 1.8; // Warn if IV is 1.8x normal
const IV_CHEAP_THRESHOLD = 0.7; // Signal if IV is 0.7x normal (options cheap)

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Energy costs (trading is free - it doesn't take significant energy)
const ENERGY_COST = {
  TRADE: 0,
  RESEARCH: 0,
  BANK_VISIT: 5,
  NEWS_READ: 2,
  PROPERTY_VIEW: 3,
  VEHICLE_VIEW: 3
};

// Bank rates
const BANK = {
  SAVINGS_RATE: 0.005,
  LOAN_RATE: 0.02,
  MAX_LOAN_RATIO: 0.5,
  MISSED_PAYMENTS_LIMIT: 3
};

// Tax rates
const TAX = {
  INCOME: 0.15,
  DIVIDEND: 0.10,
  PROPERTY: 0.01
};

// Comfort system
const COMFORT_LEVELS = {
  1: { recovery: 1.0, status: 'Struggling' },
  2: { recovery: 1.1, status: 'Comfortable' },
  3: { recovery: 1.2, status: 'Well-off' },
  4: { recovery: 1.3, status: 'Wealthy' },
  5: { recovery: 1.5, status: 'Elite' }
};

// CEO Mode requirements (USD)
const CEO_REQUIREMENTS = {
  NET_WORTH: 10000000, // $10M
  REPUTATION: 50,
  TRADES: 100
};

// Initial stocks - 20 US Blue Chip Companies (NYSE/NASDAQ) - Dec 2024 prices
// Sorted alphabetically by symbol
// stability: 0.0 = meme-prone, 1.0 = rock-solid blue chip
const INITIAL_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 250, volatility: 0.025, trend: 0.02, dividendYield: 0.004, sector: 'tech', stability: 0.7, description: 'Consumer electronics and software giant.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 225, volatility: 0.032, trend: 0.03, dividendYield: 0.0, sector: 'tech', stability: 0.5, description: 'E-commerce and cloud infrastructure.' },
  { symbol: 'BAC', name: 'Bank of America', price: 46, volatility: 0.028, trend: 0.01, dividendYield: 0.023, sector: 'finance', stability: 0.7, description: 'Consumer and commercial banking.' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', price: 395, volatility: 0.025, trend: 0.015, dividendYield: 0.014, sector: 'industrial', stability: 0.75, description: 'Construction and mining equipment.' },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 145, volatility: 0.024, trend: 0.008, dividendYield: 0.044, sector: 'energy', stability: 0.8, description: 'Integrated energy company.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 192, volatility: 0.028, trend: 0.02, dividendYield: 0.005, sector: 'tech', stability: 0.65, description: 'Search, advertising, and cloud services.' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 20, volatility: 0.04, trend: -0.03, dividendYield: 0.02, sector: 'tech', stability: 0.3, description: 'Semiconductor manufacturing.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 145, volatility: 0.015, trend: 0.01, dividendYield: 0.034, sector: 'healthcare', stability: 0.95, description: 'Pharmaceuticals and medical devices.' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 242, volatility: 0.022, trend: 0.015, dividendYield: 0.021, sector: 'finance', stability: 0.85, description: 'Largest US bank by assets.' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 62, volatility: 0.01, trend: 0.008, dividendYield: 0.031, sector: 'consumer', stability: 0.95, description: 'Global beverage company.' },
  { symbol: 'MCD', name: "McDonald's Corp.", price: 290, volatility: 0.014, trend: 0.012, dividendYield: 0.024, sector: 'consumer', stability: 0.9, description: 'Global fast food chain.' },
  { symbol: 'META', name: 'Meta Platforms', price: 612, volatility: 0.035, trend: 0.02, dividendYield: 0.003, sector: 'tech', stability: 0.4, description: 'Social media and virtual reality.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 448, volatility: 0.022, trend: 0.025, dividendYield: 0.007, sector: 'tech', stability: 0.8, description: 'Enterprise software and cloud computing.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 135, volatility: 0.045, trend: 0.04, dividendYield: 0.0003, sector: 'tech', stability: 0.2, description: 'AI chips and graphics processing.' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 26, volatility: 0.025, trend: -0.01, dividendYield: 0.065, sector: 'healthcare', stability: 0.75, description: 'Pharmaceutical research and manufacturing.' },
  { symbol: 'PG', name: 'Procter & Gamble', price: 170, volatility: 0.012, trend: 0.01, dividendYield: 0.024, sector: 'consumer', stability: 0.95, description: 'Consumer goods conglomerate.' },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 525, volatility: 0.02, trend: 0.02, dividendYield: 0.015, sector: 'healthcare', stability: 0.85, description: 'Health insurance and services.' },
  { symbol: 'V', name: 'Visa Inc.', price: 315, volatility: 0.018, trend: 0.02, dividendYield: 0.007, sector: 'finance', stability: 0.85, description: 'Global payments technology.' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 92, volatility: 0.015, trend: 0.015, dividendYield: 0.009, sector: 'consumer', stability: 0.9, description: 'Retail and e-commerce giant.' },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 108, volatility: 0.025, trend: 0.005, dividendYield: 0.035, sector: 'energy', stability: 0.8, description: 'Oil and gas supermajor.' }
];

// Properties (USD)
const PROPERTIES = [
  { id: 'apt_small', name: 'Studio Apartment', type: 'apartment', price: 150000, rent: 1200, maintenance: 200, comfort: 1, description: 'Small studio in the city.' },
  { id: 'apt_mid', name: 'City Condo', type: 'apartment', price: 350000, rent: 2500, maintenance: 400, comfort: 2, description: '2BR condo with amenities.' },
  { id: 'apt_luxury', name: 'Luxury Penthouse', type: 'apartment', price: 1200000, rent: 8000, maintenance: 1500, comfort: 3, description: 'High-rise penthouse with views.' },
  { id: 'house_sub', name: 'Suburban Home', type: 'house', price: 450000, rent: 3000, maintenance: 600, comfort: 3, description: 'Family home in the suburbs.' },
  { id: 'house_exec', name: 'Executive Estate', type: 'house', price: 1500000, rent: 9000, maintenance: 2000, comfort: 4, description: 'Gated community mansion.' },
  { id: 'mansion', name: 'Beverly Hills Mansion', type: 'mansion', price: 8000000, rent: 40000, maintenance: 10000, comfort: 5, description: 'Ultra-luxury estate.' },
  { id: 'commercial', name: 'Office Building', type: 'commercial', price: 2500000, rent: 25000, maintenance: 5000, comfort: 0, description: 'Commercial real estate investment.' }
];

// Vehicles (USD)
const VEHICLES = [
  { id: 'bike', name: 'Electric Scooter', type: 'economy', price: 3000, comfort: 0, status: 0, monthlyCost: 50, description: 'Gets you around town.' },
  { id: 'compact', name: 'Honda Civic', type: 'economy', price: 28000, comfort: 1, status: 0, monthlyCost: 300, description: 'Reliable and efficient.' },
  { id: 'sedan', name: 'BMW 5 Series', type: 'sedan', price: 65000, comfort: 2, status: 1, monthlyCost: 600, description: 'Executive luxury sedan.' },
  { id: 'luxury', name: 'Mercedes S-Class', type: 'luxury', price: 120000, comfort: 3, status: 2, monthlyCost: 1200, description: 'Ultimate luxury comfort.' },
  { id: 'sports', name: 'Porsche 911', type: 'supercar', price: 180000, comfort: 2, status: 3, monthlyCost: 1500, description: 'Iconic sports car.' },
  { id: 'supercar', name: 'Lamborghini Huracán', type: 'supercar', price: 280000, comfort: 3, status: 4, monthlyCost: 3000, description: 'The ultimate status symbol.' }
];

// ===== ENHANCED NEWS SYSTEM =====
// News types: eps_driven (affects fundamentals), sentiment (perception only), hybrid (both)

const NEWS_EVENTS = {
  // === EPS-DRIVEN: Changes actual company value ===
  eps_driven: {
    negative: [
      {
        id: 'factory_explosion',
        headline: "{STOCK} factory explosion halts production",
        description: "Major industrial accident. Production offline.",
        epsImpact: { immediate: -0.12, recovery: 0.05, permanent: -0.07, uncertainty: 0.04 },
        recoveryDays: 14,
        weight: 1,
        conflictsWith: ['efficiency_gains', 'market_expansion', 'earnings_beat', 'major_contract']
      },
      {
        id: 'product_recall',
        headline: "{STOCK} recalls 2 million defective units",
        description: "Quality control failure leads to massive recall.",
        epsImpact: { immediate: -0.08, recovery: 0.04, permanent: -0.04, uncertainty: 0.03 },
        recoveryDays: 10,
        weight: 2,
        conflictsWith: ['breakthrough', 'patent_win', 'earnings_beat']
      },
      {
        id: 'contract_lost',
        headline: "{STOCK} loses major defense contract",
        description: "Government contract awarded to competitor.",
        epsImpact: { immediate: -0.15, recovery: 0.03, permanent: -0.12, uncertainty: 0.05 },
        recoveryDays: 21,
        weight: 1,
        conflictsWith: ['major_contract', 'earnings_beat']
      },
      {
        id: 'regulatory_fine',
        headline: "{STOCK} fined heavily by Corpo-SEC",
        description: "Regulatory violations result in substantial penalty.",
        epsImpact: { immediate: -0.06, recovery: 0.05, permanent: -0.01, uncertainty: 0.02 },
        recoveryDays: 7,
        weight: 2,
        conflictsWith: ['earnings_beat']
      },
      {
        id: 'data_breach',
        headline: "Data breach exposes {STOCK} customer records",
        description: "Cybersecurity failure compromises millions of accounts.",
        epsImpact: { immediate: -0.05, recovery: 0.03, permanent: -0.02, uncertainty: 0.03 },
        recoveryDays: 10,
        weight: 2,
        conflictsWith: ['patent_win', 'breakthrough']
      },
      {
        id: 'supply_chain',
        headline: "{STOCK} faces critical supply chain disruption",
        description: "Key supplier issues threaten production.",
        epsImpact: { immediate: -0.07, recovery: 0.06, permanent: -0.01, uncertainty: 0.04 },
        recoveryDays: 12,
        weight: 2,
        conflictsWith: ['efficiency_gains', 'earnings_beat']
      }
    ],
    positive: [
      {
        id: 'major_contract',
        headline: "{STOCK} secures massive Neo-Government contract",
        description: "Multi-year deal worth billions in revenue.",
        epsImpact: { immediate: 0.12, recovery: 0, permanent: 0.12, uncertainty: 0.03 },
        recoveryDays: 0,
        weight: 1,
        conflictsWith: ['contract_lost', 'earnings_miss', 'ceo_scandal', 'lawsuit_major']
      },
      {
        id: 'breakthrough',
        headline: "{STOCK} announces breakthrough in quantum logistics",
        description: "Revolutionary technology promises market dominance.",
        epsImpact: { immediate: 0.10, recovery: 0, permanent: 0.10, uncertainty: 0.05 },
        recoveryDays: 0,
        weight: 1,
        conflictsWith: ['product_recall', 'data_breach', 'earnings_miss']
      },
      {
        id: 'efficiency_gains',
        headline: "{STOCK} automation initiative cuts costs by 30%",
        description: "Operational excellence drives margin expansion.",
        epsImpact: { immediate: 0.08, recovery: 0, permanent: 0.08, uncertainty: 0.02 },
        recoveryDays: 0,
        weight: 2,
        conflictsWith: ['factory_explosion', 'supply_chain', 'earnings_miss']
      },
      {
        id: 'market_expansion',
        headline: "{STOCK} expands into lucrative Sector 9 market",
        description: "New territory opens significant revenue opportunity.",
        epsImpact: { immediate: 0.06, recovery: 0, permanent: 0.06, uncertainty: 0.03 },
        recoveryDays: 0,
        weight: 2,
        conflictsWith: ['factory_explosion', 'earnings_miss']
      },
      {
        id: 'acquisition_synergy',
        headline: "{STOCK} acquisition delivers better-than-expected synergies",
        description: "Integration success boosts earnings outlook.",
        epsImpact: { immediate: 0.07, recovery: 0, permanent: 0.07, uncertainty: 0.02 },
        recoveryDays: 0,
        weight: 2,
        conflictsWith: ['earnings_miss', 'lawsuit_major']
      },
      {
        id: 'patent_win',
        headline: "{STOCK} patent approved for revolutionary tech",
        description: "Intellectual property secures competitive moat.",
        epsImpact: { immediate: 0.05, recovery: 0, permanent: 0.05, uncertainty: 0.02 },
        recoveryDays: 0,
        weight: 2,
        conflictsWith: ['product_recall', 'data_breach', 'earnings_miss']
      }
    ]
  },
  
  // === SENTIMENT-ONLY: Perception changes, fundamentals unchanged ===
  sentiment: {
    negative: [
      {
        id: 'analyst_downgrade',
        headline: "Analysts downgrade {STOCK} citing growth concerns",
        description: "Wall Street turns bearish on outlook.",
        sentimentShock: -0.06,
        snapbackDays: 3,
        weight: 3,
        conflictsWith: ['analyst_upgrade', 'analyst_raises_target']
      },
      {
        id: 'board_shuffle',
        headline: "{STOCK} replaces board members in surprise reshuffle",
        description: "Leadership changes spark uncertainty.",
        sentimentShock: -0.03,
        snapbackDays: 2,
        weight: 3,
        conflictsWith: ['ceo_conference']
      },
      {
        id: 'short_report',
        headline: "Short seller publishes scathing {STOCK} report",
        description: "Activist investor alleges accounting irregularities.",
        sentimentShock: -0.30,  // 30% drop - realistic for credible short report
        expectationShift: -0.15, // Significant downward revision
        snapbackDays: 0,  // NO automatic recovery - allegations don't just disappear
        weight: 1,
        conflictsWith: ['analyst_upgrade', 'fund_accumulation']
      },
      {
        id: 'sector_rotation_out',
        headline: "Funds rotate out of {STOCK} sector",
        description: "Institutional investors shift allocations.",
        sentimentShock: -0.04,
        snapbackDays: 4,
        weight: 2,
        conflictsWith: ['fund_accumulation']
      },
      {
        id: 'analyst_cuts_estimates',
        headline: "Wall Street cuts {STOCK} estimates ahead of earnings",
        description: "Analysts lower expectations citing headwinds.",
        sentimentShock: -0.04,
        expectationShift: -0.08,
        snapbackDays: 3,
        weight: 2,
        conflictsWith: ['analyst_raises_target', 'analyst_upgrade']
      }
    ],
    positive: [
      {
        id: 'analyst_upgrade',
        headline: "Sector analysts upgrade {STOCK} to MEGABUY",
        description: "Bullish thesis gains momentum.",
        sentimentShock: 0.06,
        expectationShift: 0.05,
        snapbackDays: 3,
        weight: 3,
        conflictsWith: ['analyst_downgrade', 'analyst_cuts_estimates', 'short_report']
      },
      {
        id: 'analyst_raises_target',
        headline: "Analyst raises {STOCK} price target by 30%",
        description: "Expects strong earnings ahead.",
        sentimentShock: 0.04,
        expectationShift: 0.10,
        snapbackDays: 2,
        weight: 2,
        conflictsWith: ['analyst_downgrade', 'analyst_cuts_estimates']
      },
      {
        id: 'ceo_conference',
        headline: "{STOCK} CEO delivers impressive keynote",
        description: "Leadership vision inspires investor confidence.",
        sentimentShock: 0.03,
        snapbackDays: 2,
        weight: 3,
        conflictsWith: ['board_shuffle', 'ceo_scandal']
      },
      {
        id: 'buyback_announce',
        headline: "{STOCK} announces major stock buyback program",
        description: "Company signals confidence in undervaluation.",
        sentimentShock: 0.05,
        snapbackDays: 4,
        weight: 2,
        conflictsWith: ['dividend_cut']
      },
      {
        id: 'fund_accumulation',
        headline: "Major fund building large {STOCK} position",
        description: "Smart money accumulating shares.",
        sentimentShock: 0.04,
        expectationShift: 0.03,
        snapbackDays: 3,
        weight: 2,
        conflictsWith: ['short_report', 'sector_rotation_out']
      }
    ],
    neutral: [
      {
        id: 'shareholder_meeting',
        headline: "{STOCK} hosting virtual shareholder meeting",
        description: "Annual meeting scheduled, no surprises expected.",
        sentimentShock: 0.01,
        snapbackDays: 1,
        weight: 4,
        conflictsWith: []
      },
      {
        id: 'analysts_divided',
        headline: "Analysts divided on {STOCK} trajectory",
        description: "Mixed opinions create uncertainty.",
        volatilityBoost: 0.3,
        duration: 3,
        weight: 3,
        conflictsWith: []
      },
      {
        id: 'maintains_position',
        headline: "{STOCK} maintains position amid market turbulence",
        description: "Steady performance in volatile conditions.",
        sentimentShock: 0,
        snapbackDays: 0,
        weight: 3,
        conflictsWith: []
      }
    ]
  },
  
  // === HYBRID: Real EPS impact + sentiment overreaction ===
  hybrid: {
    negative: [
      {
        id: 'ceo_scandal',
        headline: "{STOCK} CEO under investigation for fraud",
        description: "Executive misconduct allegations surface.",
        epsImpact: { immediate: -0.05, recovery: 0.02, permanent: -0.03, uncertainty: 0.06 },
        sentimentOverreaction: -0.12,
        recoveryDays: 10,
        snapbackDays: 7,
        weight: 1,
        conflictsWith: ['ceo_conference', 'earnings_beat', 'major_contract']
      },
      {
        id: 'lawsuit_major',
        headline: "{STOCK} faces class action lawsuit",
        description: "Shareholders allege material misrepresentation.",
        epsImpact: { immediate: -0.04, recovery: 0.02, permanent: -0.02, uncertainty: 0.05 },
        sentimentOverreaction: -0.08,
        recoveryDays: 14,
        snapbackDays: 5,
        weight: 2,
        conflictsWith: ['earnings_beat', 'major_contract', 'acquisition_synergy']
      },
      {
        id: 'dividend_cut',
        headline: "{STOCK} suspends dividend payments",
        description: "Cash conservation measures disappoint income investors.",
        epsImpact: { immediate: -0.03, recovery: 0, permanent: -0.03, uncertainty: 0.02 },
        sentimentOverreaction: -0.10,
        recoveryDays: 0,
        snapbackDays: 5,
        weight: 2,
        conflictsWith: ['dividend_hike', 'buyback_announce', 'earnings_beat']
      },
      {
        id: 'earnings_miss',
        headline: "{STOCK} quarterly earnings miss estimates badly",
        description: "Results fall short of analyst expectations.",
        epsImpact: { immediate: -0.08, recovery: 0.03, permanent: -0.05, uncertainty: 0.04 },
        sentimentOverreaction: -0.07,
        recoveryDays: 7,
        snapbackDays: 4,
        weight: 2,
        conflictsWith: ['earnings_beat', 'earnings_beat_weak_guidance', 'earnings_beat_priced_in', 'major_contract', 'breakthrough', 'efficiency_gains', 'market_expansion', 'acquisition_synergy', 'patent_win']
      }
    ],
    positive: [
      {
        id: 'earnings_beat',
        headline: "{STOCK} smashes earnings expectations",
        description: "Quarterly results exceed estimates by wide margin.",
        epsImpact: { immediate: 0.10, recovery: 0, permanent: 0.10, uncertainty: 0.03 },
        sentimentOverreaction: 0.08,
        recoveryDays: 0,
        snapbackDays: 5,
        weight: 2,
        conflictsWith: ['earnings_miss', 'factory_explosion', 'product_recall', 'contract_lost', 'regulatory_fine', 'supply_chain', 'ceo_scandal', 'lawsuit_major', 'dividend_cut']
      },
      {
        id: 'earnings_beat_weak_guidance',
        headline: "{STOCK} beats estimates but guides lower",
        description: "Strong quarter overshadowed by cautious outlook.",
        epsImpact: { immediate: 0.05, recovery: 0, permanent: 0.05, uncertainty: 0.02 },
        sentimentOverreaction: -0.06,
        recoveryDays: 0,
        snapbackDays: 7,
        weight: 2,
        conflictsWith: ['earnings_miss', 'earnings_beat', 'earnings_beat_priced_in']
      },
      {
        id: 'earnings_beat_priced_in',
        headline: "{STOCK} beats but 'already priced in' say analysts",
        description: "Results meet high expectations, profit-taking ensues.",
        epsImpact: { immediate: 0.08, recovery: 0, permanent: 0.08, uncertainty: 0.02 },
        sentimentOverreaction: -0.04,
        recoveryDays: 0,
        snapbackDays: 5,
        weight: 1,
        conflictsWith: ['earnings_miss', 'earnings_beat', 'earnings_beat_weak_guidance']
      },
      {
        id: 'dividend_hike',
        headline: "{STOCK} announces dividend increase of 25%",
        description: "Shareholder returns boosted significantly.",
        epsImpact: { immediate: 0.02, recovery: 0, permanent: 0.02, uncertainty: 0.01 },
        sentimentOverreaction: 0.06,
        recoveryDays: 0,
        snapbackDays: 3,
        weight: 2,
        conflictsWith: ['dividend_cut', 'earnings_miss']
      },
      {
        id: 'takeover_rumor',
        headline: "RUMOR: {STOCK} takeover bid imminent",
        description: "Acquisition speculation drives buying frenzy.",
        epsImpact: { immediate: 0.05, recovery: -0.03, permanent: 0.02, uncertainty: 0.10 },
        sentimentOverreaction: 0.15,
        recoveryDays: 7,
        snapbackDays: 10,
        weight: 1,
        conflictsWith: ['ceo_scandal', 'lawsuit_major']
      }
    ]
  },
  
  // === MARKET-WIDE: Affects all stocks ===
  market: {
    positive: [
      { id: 'market_rally_economic', headline: "Markets rally on positive economic data", marketShock: 0.03, duration: 2, conflictsWith: ['market_recession_fears', 'market_panic_selloff', 'market_rate_hike', 'market_geopolitical'] },
      { id: 'market_confidence_surge', headline: "Investor confidence surges to multi-year high", marketShock: 0.02, duration: 3, conflictsWith: ['market_recession_fears', 'market_panic_selloff', 'market_rate_hike', 'market_geopolitical'] },
      { id: 'market_supportive_policy', headline: "Central bank signals supportive monetary policy", marketShock: 0.04, duration: 4, conflictsWith: ['market_rate_hike', 'market_recession_fears', 'market_panic_selloff'] },
      { id: 'market_trade_deal', headline: "Trade deal breakthrough boosts market sentiment", marketShock: 0.03, duration: 3, conflictsWith: ['market_geopolitical', 'market_panic_selloff', 'market_recession_fears'] }
    ],
    negative: [
      { id: 'market_recession_fears', headline: "Markets tumble amid recession fears", marketShock: -0.04, duration: 3, conflictsWith: ['market_rally_economic', 'market_confidence_surge', 'market_supportive_policy', 'market_trade_deal'] },
      { id: 'market_panic_selloff', headline: "Investor panic triggers broad selloff", marketShock: -0.05, duration: 2, conflictsWith: ['market_rally_economic', 'market_confidence_surge', 'market_supportive_policy', 'market_trade_deal'] },
      { id: 'market_rate_hike', headline: "Central bank raises rates unexpectedly", marketShock: -0.03, duration: 4, conflictsWith: ['market_supportive_policy', 'market_confidence_surge', 'market_rally_economic'] },
      { id: 'market_geopolitical', headline: "Geopolitical tensions rattle markets", marketShock: -0.03, duration: 3, conflictsWith: ['market_trade_deal', 'market_confidence_surge', 'market_rally_economic'] }
    ]
  }
};

// Legacy format for compatibility
const NEWS_HEADLINES = {
  positive: NEWS_EVENTS.eps_driven.positive.map(e => e.headline)
    .concat(NEWS_EVENTS.sentiment.positive.map(e => e.headline))
    .concat(NEWS_EVENTS.hybrid.positive.map(e => e.headline)),
  negative: NEWS_EVENTS.eps_driven.negative.map(e => e.headline)
    .concat(NEWS_EVENTS.sentiment.negative.map(e => e.headline))
    .concat(NEWS_EVENTS.hybrid.negative.map(e => e.headline)),
  neutral: NEWS_EVENTS.sentiment.neutral.map(e => e.headline),
  market: NEWS_EVENTS.market
};

// Health events
const HEALTH_EVENTS = {
  highStress: [
    { name: "Insomnia", effect: "energy_recovery", value: -20, message: "Stress-induced insomnia. Energy recovery reduced." },
    { name: "Anxiety Attack", effect: "skip_actions", message: "Panic attack. Unable to trade today." },
    { name: "Bad Decision", effect: "random_sell", message: "Stress clouded judgment. Random stock sold." }
  ],
  hospitalization: { name: "Hospitalization", skipDays: 7, costRatio: 0.05, message: "Stress overload! Hospitalized for 7 days. Medical bills: ${COST}" }
};

// Random life events
// Note: Financial events with 'scaledToIncome: true' will scale to player's annual income
const LIFE_EVENTS = [
  { id: 'found_money', name: 'Lucky Find', type: 'financial', message: 'Found ${AMOUNT} on the street!', amountRange: [10000, 100000], effect: 'cash_gain', chance: 0.02 },
  { id: 'mugged', name: 'Mugged', type: 'financial', message: 'Attacked in a back alley. Lost ${AMOUNT}.', scaledToIncome: true, incomePercent: [0.02, 0.05], effect: 'cash_loss', stressGain: 20, chance: 0.01 },
  { id: 'unexpected_bill', name: 'Unexpected Bill', type: 'financial', message: 'Surprise expense! Pay ${AMOUNT}.', scaledToIncome: true, incomePercent: [0.03, 0.08], effect: 'cash_loss', chance: 0.003 },
  { id: 'inheritance', name: 'Inheritance', type: 'financial', message: 'Distant relative left you ${AMOUNT}!', amountRange: [1000000, 10000000], effect: 'cash_gain', chance: 0.005 },
  { id: 'food_poison', name: 'Food Poisoning', type: 'health', message: 'Bad sushi. Lost 2 days recovering.', effect: 'skip_days', value: 2, chance: 0.02 },
  { id: 'fitness', name: 'Fitness Kick', type: 'health', message: 'Started morning jogs. Feel great!', effect: 'energy_boost', value: 10, duration: 30, chance: 0.02 },
  { id: 'old_friend', name: 'Old Friend', type: 'social', message: 'Ran into an old friend. Gained reputation.', effect: 'reputation_gain', value: 5, chance: 0.03 },
  { id: 'hot_tip', name: 'Hot Tip', type: 'opportunity', message: 'Stranger whispers: "Buy {STOCK}. Trust me."', effect: 'stock_tip', accuracy: 0.7, chance: 0.02 }
];

// Choice events
const CHOICE_EVENTS = [
  {
    id: 'charity_gala',
    name: 'Charity Gala',
    message: 'Invited to a high-profile charity event. How much will you donate?',
    choices: [
      { text: 'Donate generously ($10M)', cost: 10000000, effect: { reputation: 25, stress: -10 } },
      { text: 'Donate modestly ($1M)', cost: 1000000, effect: { reputation: 10, stress: -5 } },
      { text: 'Decline invitation', cost: 0, effect: { reputation: -5 } }
    ],
    chance: 0.01,
    minNetWorth: 50000000
  },
  {
    id: 'bribe_offer',
    name: 'Suspicious Offer',
    message: 'A shady figure offers to "make your tax problems disappear" for $5M.',
    choices: [
      { text: 'Pay the bribe', cost: 5000000, effect: { taxReduction: 0.5, reputation: -10 } },
      { text: 'Refuse politely', cost: 0, effect: {} },
      { text: 'Report to authorities', cost: 0, effect: { reputation: 15, stress: 10 } }
    ],
    chance: 0.01,
    minNetWorth: 20000000
  },
  {
    id: 'investment_opp',
    name: 'Investment Opportunity',
    message: 'A startup founder pitches you their "revolutionary" idea. Invest?',
    choices: [
      { text: 'Invest big ($50M)', cost: 50000000, effect: { gamble: { min: -50000000, max: 150000000 } } },
      { text: 'Invest small ($5M)', cost: 5000000, effect: { gamble: { min: -5000000, max: 15000000 } } },
      { text: 'Pass on it', cost: 0, effect: {} }
    ],
    chance: 0.01,
    minNetWorth: 100000000
  }
];

// ===== MARKET PHENOMENA =====
// Categorized by educational value and predictability
// TIER 1: Highly Educational - Clear signals, predictable timelines
// TIER 2: Good Educational - Clear signals, some complexity
// TIER 3: Moderate - Requires experience, harder to time
// TIER 4: Advanced/Random - Unpredictable or difficult
// eventType field maps to gameSettings.enabledEvents keys
const PHENOMENA = [
  // Tier 1 - Highly Educational
  { id: 10, eventType: 'short_seller_report', name: 'Short Seller Report', desc: 'Multi-wave attacks with clear escalation signals', pred: 'predictable', icon: '🟢', tier: 1 },
  { id: 16, eventType: 'insider_buying', name: 'Insider Buying', desc: 'Executives buying = strong bullish signal', pred: 'predictable', icon: '🟢', tier: 1 },
  { id: 19, eventType: 'index_rebalancing', name: 'Index Rebalance', desc: 'Forced buying/selling with known timeline', pred: 'predictable', icon: '🟢', tier: 1 },
  
  // Tier 2 - Good Educational
  { id: 6, eventType: 'dead_cat_bounce', name: 'Dead Cat Bounce', desc: 'Multiple false bounces after crash', pred: 'partial', icon: '🟡', tier: 2 },
  { id: 17, eventType: 'stock_split', name: 'Stock Split', desc: 'Clear mechanics, sentiment-driven', pred: 'predictable', icon: '🟢', tier: 2 },
  { id: 5, eventType: 'short_squeeze', name: 'Short Squeeze', desc: 'High short interest + catalyst = squeeze', pred: 'partial', icon: '🟡', tier: 2 },
  { id: 7, eventType: 'fomo_rally', name: 'FOMO Rally', desc: 'Identifiable euphoria phases', pred: 'predictable', icon: '🟢', tier: 2 },
  
  // Tier 3 - Moderate
  { id: 24, eventType: 'institutional_manipulation', name: 'Institutional Manipulation', desc: 'Hard to detect, high failure rate (~40%)', pred: 'partial', icon: '🟡', tier: 3 },
  { id: 18, eventType: 'analyst', name: 'Analyst Rating', desc: 'Upgrades/downgrades, short-lived impact', pred: 'partial', icon: '🟡', tier: 3 },
  { id: 8, eventType: 'capitulation', name: 'Capitulation', desc: 'Mass panic - hard to time bottom', pred: 'partial', icon: '🟡', tier: 3 },
  { id: 21, eventType: 'tax_loss_harvesting', name: 'Tax Loss Harvest', desc: 'Calendar-based, weak signals', pred: 'partial', icon: '🟡', tier: 3 },
  
  // Tier 4 - Advanced/Random
  { id: 1, eventType: 'basic_news', name: 'Basic News', desc: 'Random daily news without telltales', pred: 'partial', icon: '🟡', tier: 4 },
  { id: 11, eventType: 'sector_rotation', name: 'Sector Rotation', desc: 'Money flows between sectors - gradual', pred: 'partial', icon: '🟡', tier: 4 },
  { id: 12, eventType: 'dividend_trap', name: 'Dividend Trap', desc: 'High yield masks troubled company', pred: 'unpredictable', icon: '🔴', tier: 4 },
  { id: 13, eventType: 'gap_up', name: 'Gap Up/Down', desc: 'Already priced in by market open', pred: 'unpredictable', icon: '🔴', tier: 4 },
  { id: 14, eventType: 'correlation_breakdown', name: 'Correlation Break', desc: 'Normally linked stocks diverge', pred: 'unpredictable', icon: '🔴', tier: 4 },
  { id: 15, eventType: 'liquidity_crisis', name: 'Liquidity Crisis', desc: 'Selling begets more selling', pred: 'unpredictable', icon: '🔴', tier: 4 },
  { id: 20, eventType: 'window_dressing', name: 'Window Dressing', desc: 'Quarter-end fund repositioning', pred: 'partial', icon: '🟡', tier: 4 },
  { id: 22, eventType: 'earnings_whisper', name: 'Earnings Whisper', desc: 'Unofficial expectations differ', pred: 'unpredictable', icon: '🔴', tier: 4 },
  { id: 23, eventType: 'circuit_breaker', name: 'Circuit Breaker', desc: 'Emergency halt - not tradeable', pred: 'unpredictable', icon: '🔴', tier: 4 }
];

// Updated presets based on tier system
// IDs map to: 10=short_seller, 16=insider, 19=index, 6=deadcat, 17=split, 5=squeeze, 7=fomo
//             24=manipulation, 18=analyst, 8=capitulation, 21=tax_loss
//             1=basic_news, 11=sector, 12=dividend, 13=gap, 14=correlation, 15=liquidity, 20=window, 22=whisper, 23=circuit
const PHENOMENA_PRESETS = {
  // Tier 1 only - Best for learning
  beginner: [10, 16, 19],
  // Tier 1 + 2 - Good educational mix (DEFAULT)
  intermediate: [5, 6, 7, 10, 16, 17, 19],
  // Tier 1-3 - More challenging
  advanced: [5, 6, 7, 8, 10, 16, 17, 18, 19, 21, 24],
  // All phenomena
  all: [1, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  none: []
};
