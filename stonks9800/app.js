// ===== STONKS 9800 - Stage 03 - Main App =====

// DOM Elements
const elements = {
  headerCash: document.getElementById('headerCash'),
  dayDisplay: document.getElementById('dayDisplay'),
  dateDisplay: document.getElementById('dateDisplay'),
  stressBar: document.getElementById('stressBar'),
  stressValue: document.getElementById('stressValue'),
  energyBar: document.getElementById('energyBar'),
  energyValue: document.getElementById('energyValue'),
  comfortStars: document.getElementById('comfortStars'),
  reputationValue: document.getElementById('reputationValue'),
  stockList: document.getElementById('stockList'),
  portfolioWorth: document.getElementById('portfolioWorth'),
  portfolioChange: document.getElementById('portfolioChange'),
  portfolioTable: document.getElementById('portfolioTable'),
  portfolioChartCanvas: document.getElementById('portfolioChartCanvas'),
  newsList: document.getElementById('newsList'),
  bankSavingsDisplay: document.getElementById('bankSavingsDisplay'),
  bankLoanDisplay: document.getElementById('bankLoanDisplay'),
  maxLoanDisplay: document.getElementById('maxLoanDisplay'),
  depositAmount: document.getElementById('depositAmount'),
  withdrawAmount: document.getElementById('withdrawAmount'),
  borrowAmount: document.getElementById('borrowAmount'),
  repayAmount: document.getElementById('repayAmount'),
  loanWarning: document.getElementById('loanWarning'),
  daysUntilDividend: document.getElementById('daysUntilDividend'),
  estimatedDividend: document.getElementById('estimatedDividend'),
  comfortLevelDisplay: document.getElementById('comfortLevelDisplay'),
  comfortStatus: document.getElementById('comfortStatus'),
  stressRecoveryBonus: document.getElementById('stressRecoveryBonus'),
  detailOverlay: document.getElementById('detailOverlay'),
  detailTitle: document.getElementById('detailTitle'),
  detailDesc: document.getElementById('detailDesc'),
  detailPrice: document.getElementById('detailPrice'),
  detailChange: document.getElementById('detailChange'),
  detailDividend: document.getElementById('detailDividend'),
  detailHoldings: document.getElementById('detailHoldings'),
  detailHoldingsValue: document.getElementById('detailHoldingsValue'),
  detailAvgCost: document.getElementById('detailAvgCost'),
  detailProfitLoss: document.getElementById('detailProfitLoss'),
  chartCanvas: document.getElementById('chartCanvas'),
  tradeQty: document.getElementById('tradeQty'),
  analysisContent: document.getElementById('analysisContent'),
  propertyOverlay: document.getElementById('propertyOverlay'),
  propertyTitle: document.getElementById('propertyTitle'),
  propertyType: document.getElementById('propertyType'),
  propertyValue: document.getElementById('propertyValue'),
  propertyRent: document.getElementById('propertyRent'),
  propertyMaint: document.getElementById('propertyMaint'),
  propertyComfort: document.getElementById('propertyComfort'),
  propertyCondition: document.getElementById('propertyCondition'),
  buyPropertyBtn: document.getElementById('buyPropertyBtn'),
  sellPropertyBtn: document.getElementById('sellPropertyBtn'),
  vehicleOverlay: document.getElementById('vehicleOverlay'),
  vehicleTitle: document.getElementById('vehicleTitle'),
  vehicleType: document.getElementById('vehicleType'),
  vehiclePrice: document.getElementById('vehiclePrice'),
  vehicleComfort: document.getElementById('vehicleComfort'),
  vehicleStatus: document.getElementById('vehicleStatus'),
  vehicleCondition: document.getElementById('vehicleCondition'),
  vehicleMonthlyCost: document.getElementById('vehicleMonthlyCost'),
  buyVehicleBtn: document.getElementById('buyVehicleBtn'),
  sellVehicleBtn: document.getElementById('sellVehicleBtn'),
  morningOverlay: document.getElementById('morningOverlay'),
  morningDate: document.getElementById('morningDate'),
  morningNews: document.getElementById('morningNews'),
  eventOverlay: document.getElementById('eventOverlay'),
  eventTitle: document.getElementById('eventTitle'),
  eventBody: document.getElementById('eventBody'),
  taxOverlay: document.getElementById('taxOverlay'),
  taxBody: document.getElementById('taxBody'),
  randomEventOverlay: document.getElementById('randomEventOverlay'),
  randomEventTitle: document.getElementById('randomEventTitle'),
  randomEventBody: document.getElementById('randomEventBody'),
  randomEventChoices: document.getElementById('randomEventChoices'),
  // Options elements
  optionsOverlay: document.getElementById('optionsOverlay'),
  optionsPositionsOverlay: document.getElementById('optionsPositionsOverlay')
};

// Options Trading State
let selectedOptionType = null;  // 'call' or 'put'
let selectedOptionStrike = null;
let selectedOptionPremium = null;
let selectedOptionDelta = null;
let selectedOptionTheta = null;
let selectedOptionDte = 14;  // Default 14 days
let optionQuantity = 1;

// Update quantity slider to match current tradeQuantity
function updateQtySlider() {
  if (!selectedStock) return;
  const stock = stocks.find(s => s.symbol === selectedStock.symbol);
  if (!stock) return;
  
  const qtySlider = document.getElementById('qtySlider');
  if (!qtySlider) return;
  
  const maxBuy = Math.floor(gameState.cash / stock.price);
  const holding = gameState.holdings[stock.symbol];
  const maxSell = holding?.qty || 0;
  const maxQty = Math.max(maxBuy, maxSell) || 100;
  
  // Map tradeQuantity to slider 1-100 scale
  const sliderValue = Math.round((tradeQuantity / maxQty) * 100);
  qtySlider.value = Math.min(100, Math.max(1, sliderValue));
}

// Game Loop
function advanceDay() {
  if (!gameState.canTrade && gameState.skipDays <= 0) {
    showEvent("Recovery", "Still recovering. Please wait.");
    return;
  }
  
  if (gameState.skipDays > 0) {
    gameState.skipDays--;
    if (gameState.skipDays > 0) {
      showEvent("Recovering", `${gameState.skipDays} days remaining.`);
    }
  }
  
  processEndOfDay();
  
  // Advance calendar
  gameState.day++;
  gameState.dayOfWeek = (gameState.dayOfWeek + 1) % 7;
  
  if (gameState.day > DAYS_IN_MONTH) {
    gameState.day = 1;
    gameState.month++;
    processMonthEnd();
    if (gameState.month > 12) {
      gameState.month = 1;
      gameState.year++;
    }
  }
  
  processNewDay();
  
  // Quarterly events
  if (getTotalDays() % DAYS_IN_QUARTER === 0) {
    processDividends();
    showTaxAssessment();
  }
  
  // Random life events (10% daily chance)
  if (Math.random() < 0.1) {
    checkRandomLifeEvent();
  }
  
  // Auto-save check
  checkAutoSave();
  
  showMorningBriefing();
  render();
}

function processEndOfDay() {
  const currentWorth = calculateNetWorth();
  const prevWorth = gameState.portfolioHistory.length > 0 
    ? gameState.portfolioHistory[gameState.portfolioHistory.length - 1].value 
    : INITIAL_CASH;
  
  const dailyChange = (currentWorth - prevWorth) / prevWorth;
  
  // Stress from losses
  if (dailyChange < -0.05) gameState.stress += 10;
  if (dailyChange < -0.10) gameState.stress += 20;
  if (dailyChange < -0.20) gameState.stress += 40;
  if (dailyChange > 0.05) gameState.stress = Math.max(0, gameState.stress - 10);
  
  // Natural stress recovery with comfort bonus
  const comfortData = COMFORT_LEVELS[gameState.comfort];
  const baseRecovery = 5 * comfortData.recovery;
  gameState.stress = Math.max(0, gameState.stress - baseRecovery);
  gameState.stress = Math.min(100, gameState.stress);
  
  // Stress events
  if (gameState.stress >= 100) {
    processHospitalization();
  } else if (gameState.stress >= 80 && Math.random() < 0.15) {
    processHighStressEvent();
  }
  
  // Record history
  gameState.portfolioHistory.push({ day: getTotalDays(), value: currentWorth });
  if (gameState.portfolioHistory.length > MAX_HISTORY_POINTS) {
    gameState.portfolioHistory.shift();
  }
  
  // Reputation decay
  gameState.reputation = Math.max(0, gameState.reputation - 0.05);
}

function processNewDay() {
  // Generate news FIRST so it affects today's prices
  generateDailyNews();
  
  updateStockPrices();
  
  // Finalize news archive AFTER updateStockPrices() - bounce/crash news generated in market.js
  // Add timestamps to any news added during updateStockPrices()
  todayNews.forEach(item => {
    if (!item.timestamp) {
      item.timestamp = `Day ${gameState.day}`;
      item.id = Math.random().toString(36).substr(2, 9);
    }
  });
  // Add to news archive (most recent first)
  news = [...todayNews, ...news].slice(0, 30);
  
  applyNewsEffects();
  
  // Process short selling borrowing costs
  processShortBorrowingCosts();
  
  // Update market sentiment index
  if (typeof calculateMarketSentiment === 'function') {
    calculateMarketSentiment();
  }
  
  // Energy recovery
  let energyRecovery = 30;
  if (gameState.stress < 30) energyRecovery += 10;
  if (gameState.stress > 70) energyRecovery -= 10;
  gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + energyRecovery);
  
  // Process temp effects
  gameState.tempEffects = gameState.tempEffects.filter(e => {
    e.duration--;
    if (e.duration <= 0 && e.type === 'energy_boost') {
      gameState.maxEnergy -= e.value;
    }
    return e.duration > 0;
  });
  
  gameState.canTrade = true;
}

function processMonthEnd() {
  processBankInterest();
  processRentalIncome();
  processVehicleCosts();
  
  // Reputation gain from assets
  gameState.reputation += gameState.ownedProperties.length * 0.5;
  gameState.reputation += gameState.ownedVehicles.length * 0.3;
}

function processHighStressEvent() {
  const event = randomChoice(HEALTH_EVENTS.highStress);
  
  if (event.effect === 'energy_recovery') {
    gameState.maxEnergy = Math.max(50, gameState.maxEnergy + event.value);
  } else if (event.effect === 'skip_actions') {
    gameState.canTrade = false;
  } else if (event.effect === 'random_sell') {
    const holdings = Object.entries(gameState.holdings).filter(([_, h]) => h.qty > 0);
    if (holdings.length > 0) {
      const [symbol, holding] = randomChoice(holdings);
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) {
        gameState.cash += stock.price * holding.qty;
        delete gameState.holdings[symbol];
      }
    }
  }
  
  showEvent(event.name, event.message);
}

function processHospitalization() {
  const cost = Math.round(calculateNetWorth() * HEALTH_EVENTS.hospitalization.costRatio);
  
  gameState.cash -= Math.min(gameState.cash, cost);
  gameState.stress = 30;
  gameState.energy = 50;
  gameState.skipDays = HEALTH_EVENTS.hospitalization.skipDays;
  
  showEvent(
    HEALTH_EVENTS.hospitalization.name,
    HEALTH_EVENTS.hospitalization.message.replace('{COST}', formatNumber(cost))
  );
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  // Lifestyle tabs
  document.querySelectorAll('.lifestyle-tab').forEach(tab => {
    tab.addEventListener('click', () => switchLifestyleTab(tab.dataset.tab));
  });
  
  // Next day
  document.getElementById('nextDayBtn').addEventListener('click', advanceDay);
  
  // Stock detail
  document.getElementById('closeDetail').addEventListener('click', hideDetail);
  document.getElementById('buyBtn').addEventListener('click', () => executeTrade('buy'));
  document.getElementById('sellBtn').addEventListener('click', () => executeTrade('sell'));
  document.getElementById('analyzeBtn').addEventListener('click', analyzeStock);
  
  // Short selling
  document.getElementById('shortBtn').addEventListener('click', () => {
    if (!selectedStock) return;
    const stock = stocks.find(s => s.symbol === selectedStock.symbol);
    if (stock) executeShortSell(stock, tradeQuantity);
    updateDetailView();
  });
  document.getElementById('coverBtn').addEventListener('click', () => {
    if (!selectedStock) return;
    const stock = stocks.find(s => s.symbol === selectedStock.symbol);
    if (stock) coverShort(stock, tradeQuantity);
    updateDetailView();
  });
  
  // Options trading
  document.getElementById('optionsBtn').addEventListener('click', () => {
    if (!selectedStock) return;
    const stock = stocks.find(s => s.symbol === selectedStock.symbol);
    if (stock) openOptionsChain(stock);
  });
  document.getElementById('optionsChainClose').addEventListener('click', closeOptionsChain);
  document.getElementById('buyOptionBtn').addEventListener('click', executeOptionBuy);
  setupOptionQuantityHandlers();
  
  // Trade quantity
  document.getElementById('qtyMinus').addEventListener('click', () => {
    tradeQuantity = Math.max(1, tradeQuantity - 1);
    elements.tradeQty.value = tradeQuantity;
    updateQtySlider();
    updateTradeInfo();
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    tradeQuantity++;
    elements.tradeQty.value = tradeQuantity;
    updateQtySlider();
    updateTradeInfo();
  });
  document.getElementById('qtyMax').addEventListener('click', () => {
    if (!selectedStock) return;
    const stock = stocks.find(s => s.symbol === selectedStock.symbol);
    if (!stock) return;
    const maxBuy = Math.floor(gameState.cash / stock.price);
    const holding = gameState.holdings[stock.symbol];
    tradeQuantity = Math.max(maxBuy, holding?.qty || 0) || 1;
    elements.tradeQty.value = tradeQuantity;
    updateQtySlider();
    updateTradeInfo();
  });
  elements.tradeQty.addEventListener('change', () => {
    tradeQuantity = Math.max(1, parseInt(elements.tradeQty.value) || 1);
    elements.tradeQty.value = tradeQuantity;
    updateQtySlider();
    updateTradeInfo();
  });
  
  // Quantity slider
  const qtySlider = document.getElementById('qtySlider');
  qtySlider.addEventListener('input', () => {
    if (!selectedStock) return;
    const stock = stocks.find(s => s.symbol === selectedStock.symbol);
    if (!stock) return;
    
    const sliderValue = parseInt(qtySlider.value);
    const maxBuy = Math.floor(gameState.cash / stock.price);
    const holding = gameState.holdings[stock.symbol];
    const maxSell = holding?.qty || 0;
    const maxQty = Math.max(maxBuy, maxSell) || 100;
    
    // Map slider 1-100 to 1-maxQty
    tradeQuantity = Math.max(1, Math.round((sliderValue / 100) * maxQty));
    elements.tradeQty.value = tradeQuantity;
    updateTradeInfo();
  });
  
  // Bank
  document.getElementById('depositBtn').addEventListener('click', bankDeposit);
  document.getElementById('withdrawBtn').addEventListener('click', bankWithdraw);
  document.getElementById('borrowBtn').addEventListener('click', bankBorrow);
  document.getElementById('repayBtn').addEventListener('click', bankRepay);
  
  // Property
  document.getElementById('closeProperty').addEventListener('click', hidePropertyOverlay);
  elements.buyPropertyBtn.addEventListener('click', () => {
    if (selectedProperty) buyProperty(selectedProperty.id);
  });
  elements.sellPropertyBtn.addEventListener('click', () => {
    if (selectedProperty) sellProperty(selectedProperty.id);
  });
  
  // Vehicle
  document.getElementById('closeVehicle').addEventListener('click', hideVehicleOverlay);
  elements.buyVehicleBtn.addEventListener('click', () => {
    if (selectedVehicle) buyVehicle(selectedVehicle.id);
  });
  elements.sellVehicleBtn.addEventListener('click', () => {
    if (selectedVehicle) sellVehicle(selectedVehicle.id);
  });
  
  // Overlays
  document.getElementById('closeMorning').addEventListener('click', closeMorningBriefing);
  document.getElementById('closeEvent').addEventListener('click', closeEventOverlay);
  document.getElementById('closeTax').addEventListener('click', payTaxes);
  
  // Menu System
  document.getElementById('menuBtn').addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  document.getElementById('menuSave').addEventListener('click', openSaveOverlay);
  document.getElementById('menuLoad').addEventListener('click', openLoadOverlay);
  document.getElementById('menuPhenomena').addEventListener('click', openPhenomenaSelector);
  document.getElementById('menuTutorial').addEventListener('click', () => {
    if (typeof toggleTutorialMode === 'function') {
      toggleTutorialMode();
      updateMenuStatus();
    }
  });
  document.getElementById('menuCRT').addEventListener('click', () => {
    toggleCRT();
    updateMenuStatus();
  });
  document.getElementById('menuAchievements').addEventListener('click', () => {
    closeMenu();
    showEvent("Coming Soon", "Achievements will be available in a future update!");
  });
  document.getElementById('menuStats').addEventListener('click', () => {
    closeMenu();
    showEvent("Coming Soon", "Statistics will be available in a future update!");
  });
  document.getElementById('menuQuit').addEventListener('click', () => {
    if (confirm("Are you sure you want to quit? Unsaved progress will be lost.")) {
      location.reload();
    }
  });
  
  // Save/Load overlays
  document.getElementById('saveClose').addEventListener('click', closeSaveOverlay);
  document.getElementById('loadClose').addEventListener('click', closeLoadOverlay);
  
  // Initialize tutorial mode (if available)
  if (typeof initTutorialMode === 'function') {
    initTutorialMode();
  }
  
  // Phenomena Selector
  document.getElementById('phenomenaClose').addEventListener('click', closePhenomenaSelector);
  document.getElementById('phenomenaDone').addEventListener('click', applyPhenomenaSelection);
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  
  // Sentiment alert close
  const sentimentCloseBtn = document.getElementById('closeSentimentAlert');
  if (sentimentCloseBtn) {
    sentimentCloseBtn.addEventListener('click', () => {
      document.getElementById('sentimentAlert').style.display = 'none';
    });
  }
  
  // Sentiment indicator click (go to journal)
  const sentimentIndicator = document.getElementById('sentimentIndicator');
  if (sentimentIndicator) {
    sentimentIndicator.addEventListener('click', () => switchView('journal'));
  }
  
  // News stock reference click (navigate to stock)
  const newsList = document.getElementById('newsList');
  if (newsList) {
    newsList.addEventListener('click', (e) => {
      const ref = e.target.closest('.news-stock-ref');
      if (ref) {
        const symbol = ref.dataset.symbol;
        if (symbol) {
          const stock = stocks.find(s => s.symbol === symbol);
          if (stock) {
            switchView('market');
            // Set selected stock and open detail panel
            selectedStock = stock;
            tradeQuantity = 1;
            if (elements.tradeQty) elements.tradeQty.value = 1;
            showDetail();
            updateTradeInfo();
          }
        }
      }
    });
  }
}

// ===== MENU SYSTEM =====

function openMenu() {
  updateMenuStatus();
  document.getElementById('menuOverlay').classList.add('active');
}

function closeMenu() {
  document.getElementById('menuOverlay').classList.remove('active');
}

function openSaveOverlay() {
  closeMenu();
  renderSaveSlots('save');
  document.getElementById('saveOverlay').classList.add('active');
}

function closeSaveOverlay() {
  document.getElementById('saveOverlay').classList.remove('active');
}

function openLoadOverlay() {
  closeMenu();
  renderSaveSlots('load');
  document.getElementById('loadOverlay').classList.add('active');
}

function closeLoadOverlay() {
  document.getElementById('loadOverlay').classList.remove('active');
}

// ===== SAVE/LOAD SYSTEM =====

const SAVE_KEYS = ['stonks9800_save_1', 'stonks9800_save_2', 'stonks9800_save_3'];

function renderSaveSlots(mode) {
  const container = document.getElementById(mode === 'save' ? 'saveSlots' : 'loadSlots');
  container.innerHTML = '';
  
  SAVE_KEYS.forEach((key, index) => {
    const saveData = localStorage.getItem(key);
    const slot = document.createElement('div');
    slot.className = 'save-slot';
    
    if (saveData) {
      const data = JSON.parse(saveData);
      const date = new Date(data.timestamp);
      slot.innerHTML = `
        <div class="save-slot-header">
          <span class="save-slot-name">SLOT ${index + 1}</span>
        </div>
        <div class="save-slot-info">Day ${data.day} Y${data.year} | $${formatNumber(data.netWorth)} | ⭐${Math.floor(data.reputation)}</div>
        <div class="save-slot-date">Saved: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
        <div class="save-slot-actions">
          ${mode === 'save' 
            ? `<button class="btn btn-success" onclick="saveGame(${index})">OVERWRITE</button>
               <button class="btn btn-danger" onclick="deleteSave(${index})">DELETE</button>`
            : `<button class="btn btn-success" onclick="loadGame(${index})">LOAD</button>
               <button class="btn btn-danger" onclick="deleteSave(${index})">DELETE</button>`
          }
        </div>
      `;
    } else {
      slot.innerHTML = `
        <div class="save-slot-header">
          <span class="save-slot-name">SLOT ${index + 1}</span>
        </div>
        <div class="save-slot-info save-slot-empty">< Empty ></div>
        <div class="save-slot-actions">
          ${mode === 'save' 
            ? `<button class="btn btn-success" onclick="saveGame(${index})">SAVE HERE</button>`
            : `<span style="color: var(--color-gray); font-size: 11px;">No save data</span>`
          }
        </div>
      `;
    }
    
    container.appendChild(slot);
  });
}

function saveGame(slotIndex) {
  const saveData = {
    version: "0.2.0",
    timestamp: Date.now(),
    day: gameState.day,
    month: gameState.month,
    year: gameState.year,
    dayOfWeek: gameState.dayOfWeek,
    netWorth: calculateNetWorth(),
    reputation: gameState.reputation,
    gameState: { ...gameState },
    stocks: stocks.map(s => ({
      symbol: s.symbol,
      price: s.price,
      history: s.history,
      trend: s.trend,
      actualEPS: s.actualEPS,
      expectedEPS: s.expectedEPS,
      priceInExpectation: s.priceInExpectation
    })),
    news: news.slice(0, 20)
  };
  
  try {
    localStorage.setItem(SAVE_KEYS[slotIndex], JSON.stringify(saveData));
    closeSaveOverlay();
    showEvent("Game Saved", `Your progress has been saved to Slot ${slotIndex + 1}`);
  } catch (e) {
    showEvent("Save Failed", "Could not save game. Storage may be full.");
  }
}

function loadGame(slotIndex) {
  const saveData = localStorage.getItem(SAVE_KEYS[slotIndex]);
  if (!saveData) return;
  
  try {
    const data = JSON.parse(saveData);
    
    // Restore gameState
    Object.assign(gameState, data.gameState);
    
    // Restore stocks
    data.stocks.forEach(savedStock => {
      const stock = stocks.find(s => s.symbol === savedStock.symbol);
      if (stock) {
        stock.price = savedStock.price;
        stock.history = savedStock.history;
        stock.trend = savedStock.trend;
        stock.actualEPS = savedStock.actualEPS;
        stock.expectedEPS = savedStock.expectedEPS;
        stock.priceInExpectation = savedStock.priceInExpectation;
      }
    });
    
    // Restore news
    news.length = 0;
    news.push(...(data.news || []));
    
    closeLoadOverlay();
    render();
    showEvent("Game Loaded", `Loaded save from Slot ${slotIndex + 1}`);
  } catch (e) {
    showEvent("Load Failed", "Could not load save data. File may be corrupted.");
  }
}

function deleteSave(slotIndex) {
  if (confirm(`Delete save in Slot ${slotIndex + 1}?`)) {
    localStorage.removeItem(SAVE_KEYS[slotIndex]);
    // Re-render current overlay
    if (document.getElementById('saveOverlay').classList.contains('active')) {
      renderSaveSlots('save');
    } else {
      renderSaveSlots('load');
    }
  }
}

// ===== SETTINGS SYSTEM =====

const defaultSettings = {
  crtEffects: true,
  tutorialMode: false,  // Educational hints for all events
  enabledEvents: null   // Will be populated from EVENT_TIERS defaults
};

let gameSettings = { ...defaultSettings };

function loadSettings() {
  const saved = localStorage.getItem('stonks9800_settings');
  if (saved) {
    gameSettings = { ...defaultSettings, ...JSON.parse(saved) };
  }
  
  // Initialize enabledEvents from tier defaults if not set
  // ALWAYS merge with defaults to ensure new event types are included
  const defaults = (typeof getDefaultEnabledEvents === 'function') 
    ? getDefaultEnabledEvents() 
    : {
        // Tier 1 - Highly Educational (enabled)
        short_seller_report: true,
        index_rebalancing: true,
        insider_buying: true,
        // Tier 2 - Good Educational (enabled)
        dead_cat_bounce: true,
        stock_split: true,
        short_squeeze: true,
        fomo_rally: true,
        executive_change: true,  // Replacement announced = honeymoon bounce pattern
        strategic_pivot: true,   // "Unfavorable" announcements that recover (layoffs, restructuring)
        // Tier 3 - Moderate (disabled)
        institutional_manipulation: false, // Hard to detect, ~40% success rate
        analyst: false,
        capitulation: false,
        tax_loss_harvesting: false,
        // Tier 4 - Advanced/Random (disabled)
        basic_news: false,        // Random daily news without telltales
        sector_rotation: false,
        dividend_trap: false,
        gap_up: false,
        gap_down: false,
        circuit_breaker: false,
        unusual_volume: false,
        wash_trading: false,
        options_gamma: false,
        correlation_breakdown: false,
        liquidity_crisis: false,
        window_dressing: false,
        earnings_whisper: false
      };
  
  if (!gameSettings.enabledEvents) {
    // No saved settings - use defaults
    gameSettings.enabledEvents = defaults;
    saveSettings();
  } else {
    // Merge: Add any missing event types from defaults (new events get their default value)
    let needsSave = false;
    for (const [eventType, defaultValue] of Object.entries(defaults)) {
      if (gameSettings.enabledEvents[eventType] === undefined) {
        console.log(`[SETTINGS] Adding missing event type '${eventType}' with default: ${defaultValue}`);
        gameSettings.enabledEvents[eventType] = defaultValue;
        needsSave = true;
      }
    }
    if (needsSave) {
      saveSettings();
    }
  }
  
  applySettings();
}

function saveSettings() {
  localStorage.setItem('stonks9800_settings', JSON.stringify(gameSettings));
}

function applySettings() {
  // CRT effects
  document.getElementById('app').classList.toggle('crt', gameSettings.crtEffects);
  
  // Tutorial mode - unlock features if enabled
  if (gameSettings.tutorialMode && typeof initTutorialMode === 'function') {
    initTutorialMode();
  }
}

// Toggle a specific event type on/off
function toggleEventType(eventType) {
  if (gameSettings.enabledEvents) {
    gameSettings.enabledEvents[eventType] = !gameSettings.enabledEvents[eventType];
    saveSettings();
    updateEventConfigUI();
  }
}

// Enable all events in a tier
function enableTier(tierKey) {
  if (typeof EVENT_TIERS !== 'undefined' && EVENT_TIERS[tierKey]) {
    EVENT_TIERS[tierKey].events.forEach(eventType => {
      if (gameSettings.enabledEvents) {
        gameSettings.enabledEvents[eventType] = true;
      }
    });
    saveSettings();
    updateEventConfigUI();
  }
}

// Disable all events in a tier
function disableTier(tierKey) {
  if (typeof EVENT_TIERS !== 'undefined' && EVENT_TIERS[tierKey]) {
    EVENT_TIERS[tierKey].events.forEach(eventType => {
      if (gameSettings.enabledEvents) {
        gameSettings.enabledEvents[eventType] = false;
      }
    });
    saveSettings();
    updateEventConfigUI();
  }
}

// Reset events to tier defaults
function resetEventDefaults() {
  if (typeof getDefaultEnabledEvents === 'function') {
    gameSettings.enabledEvents = getDefaultEnabledEvents();
  }
  saveSettings();
  updateEventConfigUI();
}

// Update event configuration UI (if overlay is open)
function updateEventConfigUI() {
  const overlay = document.getElementById('eventConfigOverlay');
  if (overlay && overlay.classList.contains('active')) {
    renderEventConfigOverlay();
  }
}

function updateMenuStatus() {
  // Tutorial status
  const menuTutorialStatus = document.getElementById('menuTutorialStatus');
  if (menuTutorialStatus) {
    menuTutorialStatus.textContent = gameSettings.tutorialMode ? 'ON' : 'OFF';
    menuTutorialStatus.classList.toggle('active', gameSettings.tutorialMode);
  }
  
  // CRT status
  const menuCRTStatus = document.getElementById('menuCRTStatus');
  if (menuCRTStatus) {
    menuCRTStatus.textContent = gameSettings.crtEffects ? 'ON' : 'OFF';
    menuCRTStatus.classList.toggle('active', gameSettings.crtEffects);
  }
}

function toggleCRT() {
  gameSettings.crtEffects = !gameSettings.crtEffects;
  saveSettings();
  applySettings();
}

// Auto-save every 10 days
function checkAutoSave() {
  if (gameSettings.autoSave && gameState.day % 10 === 0) {
    // Auto-save to slot 1
    const saveData = {
      version: "0.2.0",
      timestamp: Date.now(),
      day: gameState.day,
      month: gameState.month,
      year: gameState.year,
      dayOfWeek: gameState.dayOfWeek,
      netWorth: calculateNetWorth(),
      reputation: gameState.reputation,
      gameState: { ...gameState },
      stocks: stocks.map(s => ({
        symbol: s.symbol,
        price: s.price,
        history: s.history,
        trend: s.trend,
        actualEPS: s.actualEPS,
        expectedEPS: s.expectedEPS,
        priceInExpectation: s.priceInExpectation
      })),
      news: news.slice(0, 20),
      isAutoSave: true
    };
    
    try {
      localStorage.setItem('stonks9800_autosave', JSON.stringify(saveData));
    } catch (e) {
      // Silent fail for auto-save
    }
  }
}

// ===== PHENOMENA SELECTOR =====

// Default to intermediate (Tier 1-2) for best learning experience
let enabledPhenomena = [...PHENOMENA_PRESETS.intermediate];
let currentFilter = 'all';

function loadEnabledPhenomena() {
  const saved = localStorage.getItem('stonks9800_phenomena');
  if (saved) {
    enabledPhenomena = JSON.parse(saved);
  }
}

function saveEnabledPhenomena() {
  localStorage.setItem('stonks9800_phenomena', JSON.stringify(enabledPhenomena));
}

function openPhenomenaSelector() {
  closeMenu();
  loadEnabledPhenomena();
  renderPhenomenaList();
  updatePhenomenaCount();
  document.getElementById('phenomenaOverlay').classList.add('active');
}

function closePhenomenaSelector() {
  document.getElementById('phenomenaOverlay').classList.remove('active');
}

function applyPhenomenaSelection() {
  saveEnabledPhenomena();
  closePhenomenaSelector();
  showEvent("Phenomena Updated", `${enabledPhenomena.length} phenomena enabled`);
}

function renderPhenomenaList() {
  const container = document.getElementById('phenomenaList');
  container.innerHTML = '';
  
  // Group by tier for clearer educational progression
  const groups = {
    1: { name: '🏆 TIER 1 - HIGHLY EDUCATIONAL', desc: 'Clear signals, predictable timelines', items: [] },
    2: { name: '📚 TIER 2 - GOOD EDUCATIONAL', desc: 'Clear signals with some complexity', items: [] },
    3: { name: '📊 TIER 3 - MODERATE', desc: 'Requires experience to trade profitably', items: [] },
    4: { name: '🎲 TIER 4 - ADVANCED/RANDOM', desc: 'Unpredictable or difficult to profit from', items: [] }
  };
  
  // Also keep predictability groups for filter
  const predGroups = {
    predictable: [],
    partial: [],
    unpredictable: []
  };
  
  PHENOMENA.forEach(p => {
    const tier = p.tier || 4;
    if (groups[tier]) {
      groups[tier].items.push(p);
    }
    predGroups[p.pred].push(p);
  });
  
  Object.entries(groups).forEach(([tierKey, group]) => {
    if (group.items.length === 0) return;
    
    // Filter by predictability if filter is active
    let filteredItems = group.items;
    if (currentFilter !== 'all') {
      filteredItems = group.items.filter(p => p.pred === currentFilter);
    }
    if (filteredItems.length === 0) return;
    
    const category = document.createElement('div');
    category.className = 'phenomena-category';
    category.innerHTML = `
      <div class="phenomena-category-header">
        ${group.name}
        <span class="phenomena-tier-desc">${group.desc}</span>
      </div>
    `;
    
    const items = document.createElement('div');
    items.className = 'phenomena-items';
    
    filteredItems.forEach(p => {
      const isEnabled = enabledPhenomena.includes(p.id);
      const item = document.createElement('div');
      item.className = 'phenomena-item' + (isEnabled ? ' enabled' : '');
      item.dataset.id = p.id;
      item.innerHTML = `
        <div class="phenomena-check">✓</div>
        <div class="phenomena-info">
          <div class="phenomena-name">${p.name}</div>
          <div class="phenomena-desc">${p.desc}</div>
        </div>
        <div class="phenomena-pred">${p.icon}</div>
      `;
      item.addEventListener('click', () => togglePhenomenon(p.id));
      items.appendChild(item);
    });
    
    category.appendChild(items);
    container.appendChild(category);
  });
}

function togglePhenomenon(id) {
  const index = enabledPhenomena.indexOf(id);
  if (index > -1) {
    enabledPhenomena.splice(index, 1);
  } else {
    enabledPhenomena.push(id);
  }
  renderPhenomenaList();
  updatePhenomenaCount();
}

function applyPreset(presetName) {
  enabledPhenomena = [...PHENOMENA_PRESETS[presetName]];
  
  // Update preset button styles
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetName);
  });
  
  renderPhenomenaList();
  updatePhenomenaCount();
}

function setFilter(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderPhenomenaList();
}

function updatePhenomenaCount() {
  document.getElementById('phenomenaCount').textContent = 
    `${enabledPhenomena.length}/${PHENOMENA.length} enabled`;
}

// Check if a phenomenon is enabled (used by market.js and events.js)
function isPhenomenonEnabled(id) {
  return enabledPhenomena.includes(id);
}

// Initialize
function initGame() {
  loadSettings();
  loadEnabledPhenomena();
  initializeStocks();
  gameState.portfolioHistory.push({ day: 0, value: INITIAL_CASH });
  
  setupEventListeners();
  
  // Generate day 1 news and apply effects so prices move on first day
  generateDailyNews();
  updateStockPrices();
  
  // Finalize news archive AFTER updateStockPrices() - bounce/crash news generated in market.js
  todayNews.forEach(item => {
    if (!item.timestamp) {
      item.timestamp = `Day ${gameState.day}`;
      item.id = Math.random().toString(36).substr(2, 9);
    }
  });
  news = [...todayNews, ...news].slice(0, 30);
  
  applyNewsEffects();
  
  showMorningBriefing();
  render();
}

// Start
initGame();
