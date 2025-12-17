// ===== STONKS 9800 - Stage 03 - State Management =====

let gameState = {
  // Calendar
  day: 1,
  dayOfWeek: 1,
  month: 1,
  year: 1,
  
  // Financial
  cash: INITIAL_CASH,
  bankSavings: 0,
  bankLoan: 0,
  missedLoanPayments: 0,
  
  // Health
  stress: 0,
  energy: 100,
  maxEnergy: 100,
  
  // Trading
  holdings: {},        // Long positions: { symbol: { qty, avgCost } }
  shortPositions: {},  // Short positions: { symbol: { qty, entryPrice } }
  optionPositions: [], // Options: [{ id, symbol, type, strike, quantity, premium, costBasis, purchaseDay, expirationDay }]
  realizedGains: 0,
  taxesDue: 0,
  totalTrades: 0,
  
  // Lifestyle
  ownedProperties: [],
  ownedVehicles: [],
  comfort: 1,
  reputation: 0,
  
  // History
  portfolioHistory: [],
  
  // Effects
  activeEffects: [],
  tempEffects: [],
  
  // Institutional manipulation schemes in progress
  activeSchemes: [],
  
  // Market-wide state
  marketSentiment: 'neutral',      // 'risk_on', 'neutral', 'risk_off' (for sector rotation)
  sectorRotationTarget: null,      // Which sector money is flowing into
  correlationStable: true,         // When false, diversification fails
  liquidityCrisis: false,          // When true, selling is penalized
  
  // Options Trading
  optionsUnlocked: false,          // Unlock after reputation >= 30
  currentOptionOpportunities: [],  // Active alerts
  
  // Trade Journal
  tradeJournal: [],                // Array of trade entries
  
  // Market Sentiment Index (Fear/Greed)
  sentimentIndex: 50,              // 0 = Extreme Fear, 100 = Extreme Greed
  sentimentHistory: [],            // Track sentiment over time
  
  // Statistics (for options tracking)
  stats: {
    optionsTrades: 0,
    optionsPnL: 0,
    optionsWins: 0,
    optionsLosses: 0,
    // Trade journal stats
    totalBuys: 0,
    totalSells: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    biggestWin: 0,
    biggestLoss: 0,
    // Short stats
    shortsOpened: 0,
    shortsCovered: 0,
    shortProfits: 0,
    shortLosses: 0,
    borrowFeesPaid: 0
  },
  
  // Flags
  canTrade: true,
  ceoUnlocked: false,
  skipDays: 0
};

let stocks = [];
let news = [];
let todayNews = [];
let selectedStock = null;
let selectedProperty = null;
let selectedVehicle = null;
let currentView = 'market';
let currentLifestyleTab = 'property';
let tradeQuantity = 1;

// Initialize stocks with history and fair value tracking
function initializeStocks() {
  stocks = INITIAL_STOCKS.map(s => {
    // Base EPS derived from price and a reasonable P/E ratio
    const basePE = 15 + Math.random() * 10; // P/E between 15-25
    const baseEPS = s.price / basePE;
    
    return {
      ...s,
      previousPrice: s.price,
      basePrice: s.price,           // Original "fair value" baseline
      fairValue: s.price,           // Current fair value (affected by EPS news)
      
      // EPS Tracking (the core driver)
      actualEPS: baseEPS,           // True underlying EPS
      expectedEPS: baseEPS,         // What analysts/market expects
      priceInExpectation: 0,        // How much expectation is already in price (-1 to +1)
      
      epsModifier: 0,               // Cumulative EPS impact from events
      sentimentOffset: 0,           // Current sentiment deviation from fair value
      volatilityBoost: 0,           // Temporary volatility increase
      
      // Institutional manipulation tracking
      institutionalAccumulation: 0, // Hidden buying pressure (0 to 1)
      manipulationPhase: null,      // 'accumulation', 'catalyst', 'distribution', null
      manipulationDaysLeft: 0,      // Days remaining in current phase
      
      // Short interest tracking (for short squeeze)
      shortInterest: 0.05 + Math.random() * 0.10, // 5-15% baseline short interest
      shortSqueezePhase: null,      // 'building', 'ready', 'squeeze', 'unwind', null
      shortSqueezeDaysLeft: 0,
      
      // Dead cat bounce tracking
      crashPhase: null,             // 'crash', 'bounce', 'continued_decline', null
      crashDaysLeft: 0,
      preCrashPrice: 0,             // Price before crash started
      
      // FOMO rally tracking
      fomoPhase: null,              // 'building', 'blowoff', 'collapse', null
      fomoDaysLeft: 0,
      fomoCooldown: 0,              // Days until FOMO can trigger again (prevents infinite loops)
      fomoStartSentiment: null,     // Sentiment when FOMO started (to reset properly after collapse)
      
      // Capitulation tracking
      capitulationDay: false,
      
      // Recent performance tracking (for mean reversion, FOMO)
      recentHigh: s.price,
      recentLow: s.price,
      consecutiveUpDays: 0,
      consecutiveDownDays: 0,
      
      // Short seller report tracking
      shortReportPhase: null,       // 'report', 'denial', 'investigation', 'resolution'
      shortReportDaysLeft: 0,
      shortReportVindicated: null,  // true/false after resolution
      preReportPrice: 0,
      
      // Insider trading tracking
      insiderPhase: null,           // 'accumulating', 'catalyst', null
      insiderDaysLeft: 0,
      insiderBuyAmount: 0,          // Cumulative insider buying signal
      
      // Stock split tracking
      splitPhase: null,             // 'announced', 'effective', null
      splitDaysLeft: 0,
      splitRatio: 0,                // e.g., 2 for 2:1 split
      
      // Analyst rating tracking
      analystRating: 2,             // 0=Sell, 1=Hold, 2=Buy (start neutral-positive)
      targetPrice: s.price * (1 + Math.random() * 0.2), // 0-20% above current
      pendingRatingChange: null,    // 'upgrade', 'downgrade', null
      ratingChangeDaysLeft: 0,
      
      // Index inclusion tracking
      indexPhase: null,             // 'addition_announced', 'removal_announced', 'effective', null
      indexDaysLeft: 0,
      indexAction: null,            // 'add', 'remove'
      
      // Sector correlation (for sector rotation)
      sector: ['tech', 'finance', 'industrial', 'consumer', 'energy', 'healthcare'][Math.floor(Math.random() * 6)],
      
      // Circuit breaker tracking
      tradingHalted: false,         // Can't trade this stock
      haltDaysLeft: 0,
      
      // Gap tracking (overnight moves)
      pendingGap: 0,                // Gap to apply on next day open
      
      // Dividend tracking (for dividend trap)
      dividendYield: 0.01 + Math.random() * 0.03, // 1-4% base yield
      dividendAtRisk: false,        // Dividend might be cut
      
      // Earnings whisper tracking
      whisperExpectation: 0,        // Hidden "real" expectation vs official
      
      // YTD performance (for tax loss harvesting, window dressing)
      ytdReturn: 0,                 // Year-to-date return
      
      // Short position tracking (player can short sell)
      // Note: shortInterest already exists for market short interest
      
      history: Array.from({ length: 20 }, (_, i) => ({
        day: i - 19,
        price: s.price * (1 + (Math.random() * 0.1 - 0.05))
      }))
    };
  });
}

// Calculate net worth
function calculateNetWorth() {
  let worth = gameState.cash + gameState.bankSavings - gameState.bankLoan;
  
  Object.entries(gameState.holdings).forEach(([symbol, holding]) => {
    if (holding.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) worth += stock.price * holding.qty;
    }
  });
  
  gameState.ownedProperties.forEach(prop => {
    const property = PROPERTIES.find(p => p.id === prop.id);
    if (property) worth += property.price * (prop.condition / 100);
  });
  
  gameState.ownedVehicles.forEach(veh => {
    const vehicle = VEHICLES.find(v => v.id === veh.id);
    if (vehicle) worth += vehicle.price * (veh.condition / 100);
  });
  
  // Add options positions value
  if (gameState.optionPositions) {
    gameState.optionPositions.forEach(contract => {
      worth += contract.currentValue || contract.costBasis;
    });
  }
  
  return worth;
}

// Calculate comfort level
function calculateComfort() {
  let maxPropertyComfort = 0;
  let vehicleBonus = 0;
  
  gameState.ownedProperties.forEach(prop => {
    const property = PROPERTIES.find(p => p.id === prop.id);
    if (property && property.comfort > maxPropertyComfort) {
      maxPropertyComfort = property.comfort;
    }
  });
  
  gameState.ownedVehicles.forEach(veh => {
    const vehicle = VEHICLES.find(v => v.id === veh.id);
    if (vehicle) vehicleBonus = Math.max(vehicleBonus, Math.floor(vehicle.comfort / 2));
  });
  
  gameState.comfort = Math.min(5, Math.max(1, maxPropertyComfort + vehicleBonus));
  return gameState.comfort;
}

// Check CEO unlock
function checkCEOUnlock() {
  const netWorth = calculateNetWorth();
  const meetsWealth = netWorth >= CEO_REQUIREMENTS.NET_WORTH;
  const meetsRep = gameState.reputation >= CEO_REQUIREMENTS.REPUTATION;
  const meetsTrades = gameState.totalTrades >= CEO_REQUIREMENTS.TRADES;
  
  gameState.ceoUnlocked = meetsWealth && meetsRep && meetsTrades;
  return { meetsWealth, meetsRep, meetsTrades, unlocked: gameState.ceoUnlocked };
}

// Reset game state
function resetGameState() {
  gameState = {
    day: 1, dayOfWeek: 1, month: 1, year: 1,
    cash: INITIAL_CASH, bankSavings: 0, bankLoan: 0, missedLoanPayments: 0,
    stress: 0, energy: 100, maxEnergy: 100,
    holdings: {}, realizedGains: 0, taxesDue: 0, totalTrades: 0,
    ownedProperties: [], ownedVehicles: [], comfort: 1, reputation: 0,
    portfolioHistory: [{ day: 0, value: INITIAL_CASH }],
    activeEffects: [], tempEffects: [],
    canTrade: true, ceoUnlocked: false, skipDays: 0
  };
  initializeStocks();
  news = [];
  todayNews = [];
}
