// ===== STONKS 9800 - Stage 03 - Options Trading =====

// ========== OPTIONS PRICING (Simplified Black-Scholes) ==========

// Calculate option premium using simplified model
function calculateOptionPremium(stock, strike, daysToExpiry, isCall) {
  const S = stock.price;           // Current stock price
  const K = strike;                // Strike price
  const T = daysToExpiry / 365;    // Time to expiry in years
  const r = 0.05;                  // Risk-free rate (5%)
  const sigma = getImpliedVolatility(stock); // IV
  
  // Simplified Black-Scholes approximation
  const intrinsicValue = isCall 
    ? Math.max(0, S - K) 
    : Math.max(0, K - S);
  
  // Time value based on volatility and time remaining
  const timeValue = S * sigma * Math.sqrt(T) * 0.4;
  
  // Moneyness adjustment
  const moneyness = isCall ? (S - K) / S : (K - S) / S;
  const moneynessMultiplier = moneyness > 0 
    ? 1 + moneyness * 0.5   // ITM options cost more
    : Math.max(0.1, 1 + moneyness * 2); // OTM options cost less
  
  const premium = (intrinsicValue + timeValue * moneynessMultiplier);
  
  // Minimum premium
  return Math.max(0.05, premium);
}

// Get implied volatility for a stock
function getImpliedVolatility(stock) {
  let baseIV = stock.volatility * 10; // Convert daily vol to annualized-ish
  
  // Event-based IV adjustments
  if (stock.earningsDay && stock.earningsDay <= 7) {
    baseIV *= 1.5 + (7 - stock.earningsDay) * 0.1; // IV ramps up into earnings
  }
  if (stock.manipulationPhase) baseIV *= 1.3;
  if (stock.shortSqueezePhase) baseIV *= 1.5;
  if (stock.crashPhase) baseIV *= 1.8;
  if (stock.fomoPhase) baseIV *= 1.4;
  if (stock.shortReportPhase) baseIV *= 1.6;
  
  // Meme stocks have higher base IV
  const memeMultiplier = getMemeMultiplier(stock);
  baseIV *= (0.8 + memeMultiplier * 0.4);
  
  return Math.min(2.0, Math.max(0.15, baseIV)); // Cap between 15% and 200%
}

// ========== THE GREEKS ==========

// Delta: How much option price changes per $1 stock move
function calculateDelta(stock, strike, daysToExpiry, isCall) {
  const S = stock.price;
  const K = strike;
  const moneyness = (S - K) / S;
  const timeAdjust = Math.sqrt(daysToExpiry / 30); // More time = delta closer to 0.5
  
  let delta;
  if (isCall) {
    // Call delta: 0 to 1
    if (moneyness > 0.1) delta = 0.7 + moneyness * 0.3; // Deep ITM
    else if (moneyness < -0.1) delta = 0.3 + moneyness * 2; // Deep OTM
    else delta = 0.5 + moneyness * 2; // ATM
    delta = Math.max(0.05, Math.min(0.95, delta * timeAdjust));
  } else {
    // Put delta: -1 to 0
    if (moneyness < -0.1) delta = -0.7 + moneyness * 0.3; // Deep ITM put
    else if (moneyness > 0.1) delta = -0.3 + moneyness * 2; // Deep OTM put
    else delta = -0.5 + moneyness * 2; // ATM
    delta = Math.min(-0.05, Math.max(-0.95, delta * timeAdjust));
  }
  
  return Math.round(delta * 100) / 100;
}

// Theta: Daily time decay (negative for long options)
function calculateTheta(stock, strike, daysToExpiry, isCall, premium) {
  // Theta accelerates as expiry approaches
  const timeDecayRate = daysToExpiry <= 7 
    ? 0.08  // Last week: rapid decay
    : daysToExpiry <= 14 
      ? 0.05  // 2 weeks: moderate decay
      : daysToExpiry <= 30 
        ? 0.03  // 1 month: slow decay
        : 0.015; // Longer: very slow
  
  // ATM options have highest theta
  const moneyness = Math.abs((stock.price - strike) / stock.price);
  const moneynessAdjust = moneyness < 0.05 ? 1.2 : moneyness < 0.1 ? 1.0 : 0.7;
  
  const dailyDecay = premium * timeDecayRate * moneynessAdjust;
  return -Math.round(dailyDecay * 100) / 100;
}

// Vega: Sensitivity to IV changes (simplified)
function calculateVega(stock, strike, daysToExpiry, premium) {
  // Longer-dated options more sensitive to IV
  const timeMultiplier = Math.sqrt(daysToExpiry / 30);
  // ATM options most sensitive
  const moneyness = Math.abs((stock.price - strike) / stock.price);
  const moneynessMultiplier = moneyness < 0.05 ? 1.0 : moneyness < 0.1 ? 0.8 : 0.5;
  
  return Math.round(premium * 0.1 * timeMultiplier * moneynessMultiplier * 100) / 100;
}

// ========== OPTIONS CHAIN GENERATION ==========

// Generate available strikes for a stock
function generateStrikes(stock) {
  const price = stock.price;
  const strikes = [];
  
  // Determine strike interval based on price
  let interval;
  if (price < 25) interval = 1;
  else if (price < 50) interval = 2.5;
  else if (price < 100) interval = 5;
  else if (price < 250) interval = 10;
  else if (price < 500) interval = 25;
  else interval = 50;
  
  // Generate strikes around current price
  const baseStrike = Math.round(price / interval) * interval;
  
  // 5 strikes below, ATM, 5 strikes above
  for (let i = -5; i <= 5; i++) {
    const strike = baseStrike + (i * interval);
    if (strike > 0) strikes.push(strike);
  }
  
  return strikes;
}

// Generate available expiration dates (DTE options)
function generateExpirations() {
  return [
    { days: 7, label: '7 days', description: 'Weekly - High theta decay' },
    { days: 14, label: '14 days', description: '2 weeks - Moderate decay' },
    { days: 30, label: '30 days', description: 'Monthly - Standard' },
    { days: 45, label: '45 days', description: '6 weeks - Seller sweet spot' },
    { days: 60, label: '60 days', description: '2 months - Lower decay' }
  ];
}

// Build full options chain for a stock
function buildOptionsChain(stock, daysToExpiry) {
  const strikes = generateStrikes(stock);
  const chain = {
    stock: stock.symbol,
    stockPrice: stock.price,
    daysToExpiry: daysToExpiry,
    iv: getImpliedVolatility(stock),
    calls: [],
    puts: []
  };
  
  strikes.forEach(strike => {
    // Call option
    const callPremium = calculateOptionPremium(stock, strike, daysToExpiry, true);
    const callDelta = calculateDelta(stock, strike, daysToExpiry, true);
    const callTheta = calculateTheta(stock, strike, daysToExpiry, true, callPremium);
    
    chain.calls.push({
      strike: strike,
      premium: Math.round(callPremium * 100) / 100,
      delta: callDelta,
      theta: callTheta,
      itm: stock.price > strike,
      atm: Math.abs(stock.price - strike) / stock.price < 0.02
    });
    
    // Put option
    const putPremium = calculateOptionPremium(stock, strike, daysToExpiry, false);
    const putDelta = calculateDelta(stock, strike, daysToExpiry, false);
    const putTheta = calculateTheta(stock, strike, daysToExpiry, false, putPremium);
    
    chain.puts.push({
      strike: strike,
      premium: Math.round(putPremium * 100) / 100,
      delta: putDelta,
      theta: putTheta,
      itm: stock.price < strike,
      atm: Math.abs(stock.price - strike) / stock.price < 0.02
    });
  });
  
  return chain;
}

// ========== CONTRACT MANAGEMENT ==========

// Calculate options transaction fees
function calculateOptionsTransactionFee(quantity) {
  // Per-contract fee (both buy and sell) - US standard ~$0.65 per contract
  const fee = quantity * TRANSACTION_FEES.OPTIONS_CONTRACT_FEE;
  return Math.round(fee * 100) / 100;
}

// Buy an option contract
function buyOption(stock, strike, daysToExpiry, isCall, quantity) {
  const premium = calculateOptionPremium(stock, strike, daysToExpiry, isCall);
  const contractCost = premium * 100 * quantity; // Options are 100 shares per contract
  const transactionFee = calculateOptionsTransactionFee(quantity);
  const totalCost = contractCost + transactionFee;
  
  if (gameState.cash < totalCost) {
    return { success: false, message: 'Insufficient funds' };
  }
  
  // Check position size warning (>10% of portfolio)
  const portfolioValue = calculateNetWorth();
  if (contractCost > portfolioValue * 0.1) {
    // Still allow but warn
    console.log('Warning: Position >10% of portfolio');
  }
  
  gameState.cash -= totalCost;
  
  // Track fees
  if (!gameState.totalFeesPaid) gameState.totalFeesPaid = 0;
  gameState.totalFeesPaid += transactionFee;
  
  const contract = {
    id: Date.now() + Math.random(),
    symbol: stock.symbol,
    type: isCall ? 'call' : 'put',
    strike: strike,
    quantity: quantity,
    premium: premium,
    costBasis: contractCost, // Cost basis doesn't include fees (for P&L calc)
    purchaseDay: getTotalDays(),
    expirationDay: getTotalDays() + daysToExpiry,
    daysToExpiry: daysToExpiry
  };
  
  gameState.optionPositions.push(contract);
  
  // Track for statistics
  gameState.stats.optionsTrades = (gameState.stats.optionsTrades || 0) + 1;
  
  if (transactionFee >= 0.10) {
    console.log(`[FEES] OPTIONS BUY ${quantity} contracts: $${transactionFee.toFixed(2)}`);
  }
  
  return { 
    success: true, 
    message: `Bought ${quantity} ${stock.symbol} $${strike} ${isCall ? 'CALL' : 'PUT'} (fee: $${transactionFee.toFixed(2)})`,
    contract: contract
  };
}

// Sell (close) an option position
function sellOption(contractId) {
  const index = gameState.optionPositions.findIndex(c => c.id === contractId);
  if (index === -1) {
    return { success: false, message: 'Contract not found' };
  }
  
  const contract = gameState.optionPositions[index];
  const stock = stocks.find(s => s.symbol === contract.symbol);
  
  if (!stock) {
    return { success: false, message: 'Stock not found' };
  }
  
  const daysRemaining = contract.expirationDay - getTotalDays();
  const currentPremium = calculateOptionPremium(
    stock, 
    contract.strike, 
    Math.max(1, daysRemaining), 
    contract.type === 'call'
  );
  
  const grossProceeds = currentPremium * 100 * contract.quantity;
  const transactionFee = calculateOptionsTransactionFee(contract.quantity);
  const netProceeds = grossProceeds - transactionFee;
  const pnl = netProceeds - contract.costBasis;
  
  gameState.cash += netProceeds;
  gameState.optionPositions.splice(index, 1);
  
  // Track fees
  if (!gameState.totalFeesPaid) gameState.totalFeesPaid = 0;
  gameState.totalFeesPaid += transactionFee;
  
  // Track P&L
  gameState.stats.optionsPnL = (gameState.stats.optionsPnL || 0) + pnl;
  if (pnl > 0) {
    gameState.stats.optionsWins = (gameState.stats.optionsWins || 0) + 1;
  } else {
    gameState.stats.optionsLosses = (gameState.stats.optionsLosses || 0) + 1;
  }
  
  if (transactionFee >= 0.10) {
    console.log(`[FEES] OPTIONS SELL ${contract.quantity} contracts: $${transactionFee.toFixed(2)}`);
  }
  
  return {
    success: true,
    message: `Sold ${contract.symbol} ${contract.type.toUpperCase()} for $${netProceeds.toFixed(2)} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}, fee: $${transactionFee.toFixed(2)})`,
    pnl: pnl
  };
}

// Process option expiration
function processOptionExpirations() {
  const today = getTotalDays();
  const expiredContracts = [];
  
  gameState.optionPositions = gameState.optionPositions.filter(contract => {
    if (contract.expirationDay <= today) {
      expiredContracts.push(contract);
      return false;
    }
    return true;
  });
  
  expiredContracts.forEach(contract => {
    const stock = stocks.find(s => s.symbol === contract.symbol);
    if (!stock) return;
    
    let value = 0;
    if (contract.type === 'call' && stock.price > contract.strike) {
      // Call ITM - exercise value
      value = (stock.price - contract.strike) * 100 * contract.quantity;
    } else if (contract.type === 'put' && stock.price < contract.strike) {
      // Put ITM - exercise value
      value = (contract.strike - stock.price) * 100 * contract.quantity;
    }
    // OTM options expire worthless (value = 0)
    
    const pnl = value - contract.costBasis;
    gameState.cash += value;
    gameState.stats.optionsPnL = (gameState.stats.optionsPnL || 0) + pnl;
    
    if (value > 0) {
      gameState.stats.optionsWins = (gameState.stats.optionsWins || 0) + 1;
      todayNews.push({
        headline: `Your ${contract.symbol} $${contract.strike} ${contract.type.toUpperCase()} expired ITM!`,
        description: `Received $${value.toFixed(2)} (P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`,
        sentiment: 'positive',
        newsType: 'options_expiry'
      });
    } else {
      gameState.stats.optionsLosses = (gameState.stats.optionsLosses || 0) + 1;
      todayNews.push({
        headline: `Your ${contract.symbol} $${contract.strike} ${contract.type.toUpperCase()} expired worthless`,
        description: `Lost $${contract.costBasis.toFixed(2)} premium`,
        sentiment: 'negative',
        newsType: 'options_expiry'
      });
    }
  });
}

// Apply daily theta decay to option positions (for display purposes)
function updateOptionValues() {
  const today = getTotalDays();
  
  gameState.optionPositions.forEach(contract => {
    const stock = stocks.find(s => s.symbol === contract.symbol);
    if (!stock) return;
    
    const daysRemaining = Math.max(1, contract.expirationDay - today);
    const currentPremium = calculateOptionPremium(
      stock,
      contract.strike,
      daysRemaining,
      contract.type === 'call'
    );
    
    contract.currentValue = currentPremium * 100 * contract.quantity;
    contract.daysRemaining = daysRemaining;
    contract.pnl = contract.currentValue - contract.costBasis;
    contract.pnlPercent = (contract.pnl / contract.costBasis) * 100;
    
    // Update Greeks
    contract.delta = calculateDelta(stock, contract.strike, daysRemaining, contract.type === 'call');
    contract.theta = calculateTheta(stock, contract.strike, daysRemaining, contract.type === 'call', currentPremium);
  });
}

// ========== OPPORTUNITY DETECTION ==========

// Detect call opportunities based on game events
function detectCallOpportunities() {
  const opportunities = [];
  
  stocks.forEach(stock => {
    const signals = [];
    let confidence = 0;
    let suggestedStrike = null;
    let suggestedDte = 14;
    let reasoning = [];
    
    // Capitulation signal
    if (stock.capitulationPhase === 'reversal') {
      signals.push('capitulation_reversal');
      confidence += 25;
      reasoning.push('Capitulation reversal in progress - panic selling exhausted');
    }
    
    // Insider buying
    if (stock.insiderPhase === 'buying') {
      signals.push('insider_buying');
      confidence += 20;
      reasoning.push('Insider buying detected - executives expect good news');
    }
    
    // Post-crash bounce
    if (stock.crashPhase === 'recovery' || 
        (stock.crashPhaseDay && stock.crashPhaseDay >= 3 && stock.crashPhaseDay <= 6)) {
      signals.push('post_crash_bounce');
      confidence += 20;
      reasoning.push(`Crash day ${stock.crashPhaseDay || '?'} - bounce probability elevated`);
      suggestedDte = 14; // Short window for bounce
    }
    
    // Short squeeze setup
    if (stock.shortInterest > 0.25 && stock.shortSqueezePhase === 'ready') {
      signals.push('squeeze_setup');
      confidence += 30;
      reasoning.push(`Short interest ${(stock.shortInterest * 100).toFixed(0)}% - squeeze ready for catalyst`);
      suggestedDte = 21; // Need time for squeeze to develop
    }
    
    // Low IV before potential catalyst
    const iv = getImpliedVolatility(stock);
    if (iv < 0.30 && (stock.earningsDay && stock.earningsDay <= 10)) {
      signals.push('low_iv_earnings');
      confidence += 15;
      reasoning.push(`IV only ${(iv * 100).toFixed(0)}% with earnings in ${stock.earningsDay} days - options cheap`);
      suggestedDte = stock.earningsDay + 2;
    }
    
    // Oversold bounce
    if (stock.sentimentOffset < -0.15) {
      signals.push('oversold');
      confidence += 10;
      reasoning.push('Stock oversold - mean reversion likely');
    }
    
    // Only create opportunity if confidence threshold met
    if (confidence >= 30 && signals.length >= 1) {
      // Suggest ATM or slightly OTM strike
      const strikes = generateStrikes(stock);
      const atmIndex = strikes.findIndex(s => Math.abs(s - stock.price) / stock.price < 0.03);
      suggestedStrike = strikes[Math.min(atmIndex + 1, strikes.length - 1)] || strikes[Math.floor(strikes.length / 2)];
      
      const premium = calculateOptionPremium(stock, suggestedStrike, suggestedDte, true);
      
      opportunities.push({
        type: 'call',
        stock: stock,
        signals: signals,
        confidence: Math.min(95, confidence),
        suggestedStrike: suggestedStrike,
        suggestedDte: suggestedDte,
        estimatedPremium: premium,
        reasoning: reasoning,
        maxLoss: premium * 100,
        potentialGain: premium * 100 * 2 // Conservative 100% target
      });
    }
  });
  
  return opportunities;
}

// Detect put opportunities based on game events
function detectPutOpportunities() {
  const opportunities = [];
  
  stocks.forEach(stock => {
    const signals = [];
    let confidence = 0;
    let suggestedStrike = null;
    let suggestedDte = 14;
    let reasoning = [];
    
    // Manipulation dump imminent
    if (stock.manipulationPhase === 'pump' && stock.manipulationDaysLeft <= 2) {
      signals.push('pump_dump_imminent');
      confidence += 35;
      reasoning.push('Pump phase ending - dump phase imminent');
      suggestedDte = 14;
    }
    
    // Distribution phase detected
    if (stock.manipulationPhase === 'distribution') {
      signals.push('distribution');
      confidence += 30;
      reasoning.push('Distribution phase - smart money exiting');
    }
    
    // Dividend at risk
    if (stock.dividendAtRisk) {
      signals.push('dividend_trap');
      confidence += 20;
      reasoning.push(`High yield ${(stock.dividendYield * 100).toFixed(1)}% signals distress`);
    }
    
    // FOMO exhaustion
    if (stock.fomoPhase && stock.fomoDaysLeft <= 3) {
      signals.push('fomo_exhaustion');
      confidence += 25;
      reasoning.push('FOMO rally exhausting - reversal likely');
      suggestedDte = 14;
    }
    
    // Overbought
    if (stock.sentimentOffset > 0.20) {
      signals.push('overbought');
      confidence += 15;
      reasoning.push('Stock overbought - mean reversion likely');
    }
    
    // Big run into earnings (priced for perfection)
    if (stock.earningsDay && stock.earningsDay <= 7) {
      const runUp = (stock.price - stock.basePrice) / stock.basePrice;
      if (runUp > 0.25) {
        signals.push('earnings_risk');
        confidence += 25;
        reasoning.push(`Stock up ${(runUp * 100).toFixed(0)}% into earnings - high expectations`);
        suggestedDte = stock.earningsDay + 2;
      }
    }
    
    // Short seller report active
    if (stock.shortReportPhase === 'report') {
      signals.push('short_report');
      confidence += 30;
      reasoning.push('Short seller report - 70% are vindicated');
    }
    
    // Only create opportunity if confidence threshold met
    if (confidence >= 30 && signals.length >= 1) {
      // Suggest slightly OTM put
      const strikes = generateStrikes(stock);
      const atmIndex = strikes.findIndex(s => Math.abs(s - stock.price) / stock.price < 0.03);
      suggestedStrike = strikes[Math.max(atmIndex - 1, 0)] || strikes[Math.floor(strikes.length / 2)];
      
      const premium = calculateOptionPremium(stock, suggestedStrike, suggestedDte, false);
      
      opportunities.push({
        type: 'put',
        stock: stock,
        signals: signals,
        confidence: Math.min(95, confidence),
        suggestedStrike: suggestedStrike,
        suggestedDte: suggestedDte,
        estimatedPremium: premium,
        reasoning: reasoning,
        maxLoss: premium * 100,
        potentialGain: premium * 100 * 2
      });
    }
  });
  
  return opportunities;
}

// Get all current opportunities
function getAllOptionOpportunities() {
  const calls = detectCallOpportunities();
  const puts = detectPutOpportunities();
  
  // Sort by confidence
  const all = [...calls, ...puts].sort((a, b) => b.confidence - a.confidence);
  
  // Return top 3 opportunities
  return all.slice(0, 3);
}

// ========== IV CRUSH WARNING ==========

function checkIVCrushWarning(stock) {
  const iv = getImpliedVolatility(stock);
  const normalIV = stock.volatility * 8; // Baseline IV
  
  if (iv > normalIV * 2) {
    return {
      warning: true,
      currentIV: iv,
      normalIV: normalIV,
      multiple: (iv / normalIV).toFixed(1),
      message: `Options are ${(iv / normalIV).toFixed(1)}x more expensive than normal. Even if RIGHT about direction, IV crush may lose money.`
    };
  }
  
  return { warning: false };
}

// ========== UTILITY FUNCTIONS ==========

// Get total value of all option positions
function getOptionsPortfolioValue() {
  let total = 0;
  gameState.optionPositions.forEach(contract => {
    total += contract.currentValue || contract.costBasis;
  });
  return total;
}

// Check if player can afford option
function canAffordOption(premium, quantity) {
  return gameState.cash >= premium * 100 * quantity;
}

// Get position size as percentage of portfolio
function getPositionSizePercent(premium, quantity) {
  const cost = premium * 100 * quantity;
  const portfolioValue = calculateNetWorth();
  return (cost / portfolioValue) * 100;
}

// ========== UI HANDLING ==========

// Track selected option for buying
let selectedOption = null;
let currentOptionsStock = null;
let currentOptionsDte = 7;

// Open options chain overlay
function openOptionsChain(stock) {
  // Check reputation requirement
  if (gameState.reputation < OPTIONS_REP_REQUIRED) {
    showEvent(
      "Options Locked", 
      `Options trading requires ${OPTIONS_REP_REQUIRED} reputation.<br>Your reputation: ${gameState.reputation}<br><br>Build reputation by making profitable trades!`
    );
    return;
  }
  
  currentOptionsStock = stock;
  selectedOption = null;
  currentOptionsDte = 7;
  
  // Update stock info
  document.getElementById('optionsSymbol').textContent = stock.symbol;
  document.getElementById('optionsStockPrice').textContent = `$${stock.price.toFixed(2)}`;
  document.getElementById('optionsIV').textContent = `IV: ${(getImpliedVolatility(stock) * 100).toFixed(0)}%`;
  
  // Check for IV crush warning
  const ivWarning = checkIVCrushWarning(stock);
  const warningEl = document.getElementById('ivWarning');
  if (ivWarning.warning) {
    document.getElementById('ivWarningText').textContent = `Options are ${ivWarning.multiple}x overpriced due to high IV!`;
    warningEl.style.display = 'block';
  } else {
    warningEl.style.display = 'none';
  }
  
  // Hide selection details
  document.getElementById('selectedOptionDetails').style.display = 'none';
  document.getElementById('buyOptionBtn').disabled = true;
  
  // Set up DTE button handlers
  document.querySelectorAll('.dte-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.dte) === 7) btn.classList.add('active');
    
    btn.onclick = () => {
      document.querySelectorAll('.dte-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOptionsDte = parseInt(btn.dataset.dte);
      renderOptionsChainBody(stock, currentOptionsDte);
      selectedOption = null;
      document.getElementById('selectedOptionDetails').style.display = 'none';
      document.getElementById('buyOptionBtn').disabled = true;
    };
  });
  
  // Render initial chain
  renderOptionsChainBody(stock, 7);
  
  // Show overlay
  document.getElementById('optionsOverlay').classList.add('active');
}

// Render options chain table body
function renderOptionsChainBody(stock, dte) {
  const bodyEl = document.getElementById('optionsChainBody');
  const chain = buildOptionsChain(stock, dte);
  
  let html = '';
  
  chain.calls.forEach((call, i) => {
    const put = chain.puts[i];
    const strike = call.strike;
    const isAtm = call.atm;
    const callItm = call.itm;
    const putItm = put.itm;
    
    html += `
      <div class="chain-row ${isAtm ? 'atm-row' : ''}">
        <div class="chain-col chain-calls ${callItm ? 'itm' : ''}">
          <span class="option-premium option-clickable" 
                data-type="call" data-strike="${strike}" data-premium="${call.premium}"
                data-delta="${call.delta}" data-theta="${call.theta}" data-dte="${dte}">
            $${call.premium.toFixed(2)}
          </span>
          <span class="option-delta">Δ${call.delta.toFixed(2)}</span>
          <span class="option-theta">θ${call.theta.toFixed(2)}</span>
        </div>
        <div class="chain-col chain-strike ${isAtm ? 'atm' : ''}">${strike.toFixed(2)}</div>
        <div class="chain-col chain-puts ${putItm ? 'itm' : ''}">
          <span class="option-theta">θ${put.theta.toFixed(2)}</span>
          <span class="option-delta">Δ${put.delta.toFixed(2)}</span>
          <span class="option-premium option-clickable"
                data-type="put" data-strike="${strike}" data-premium="${put.premium}"
                data-delta="${put.delta}" data-theta="${put.theta}" data-dte="${dte}">
            $${put.premium.toFixed(2)}
          </span>
        </div>
      </div>
    `;
  });
  
  bodyEl.innerHTML = html;
  
  // Add click handlers
  document.querySelectorAll('.option-clickable').forEach(el => {
    el.addEventListener('click', () => selectOptionFromChain(el));
  });
}

// Handle option selection from chain
function selectOptionFromChain(el) {
  // Remove previous selection
  document.querySelectorAll('.option-clickable.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  
  const type = el.dataset.type;
  const strike = parseFloat(el.dataset.strike);
  const premium = parseFloat(el.dataset.premium);
  const delta = parseFloat(el.dataset.delta);
  const theta = parseFloat(el.dataset.theta);
  const dte = parseInt(el.dataset.dte);
  
  selectedOption = { type, strike, premium, delta, theta, dte };
  
  // Update selection display
  const detailsEl = document.getElementById('selectedOptionDetails');
  detailsEl.style.display = 'block';
  
  document.getElementById('selectedOptionType').textContent = type.toUpperCase();
  document.getElementById('selectedOptionType').className = `option-detail-type ${type}`;
  document.getElementById('selectedOptionStrike').textContent = `$${strike.toFixed(2)}`;
  document.getElementById('selectedOptionPremium').textContent = `$${premium.toFixed(2)}`;
  document.getElementById('selectedOptionDelta').textContent = delta.toFixed(2);
  document.getElementById('selectedOptionTheta').textContent = `-$${Math.abs(theta).toFixed(2)}/day`;
  document.getElementById('selectedOptionDTE').textContent = dte;
  
  // Calculate max contracts
  const totalCost = premium * 100;
  const maxContracts = Math.max(1, Math.min(OPTIONS_MAX_CONTRACTS, Math.floor(gameState.cash / totalCost)));
  
  // Update quantity input
  const qtyInput = document.getElementById('optionQty');
  qtyInput.value = 1;
  qtyInput.max = maxContracts;
  
  updateOptionTotal();
  
  // Enable buy button
  document.getElementById('buyOptionBtn').disabled = gameState.cash < totalCost;
  
  // Update educational tip
  let tip = '';
  if (type === 'call') {
    if (delta > 0.7) tip = '💡 Deep ITM call - expensive but high probability';
    else if (delta > 0.45) tip = '💡 ATM call - balanced risk/reward for bullish bet';
    else tip = '💡 OTM call - cheap but needs big move to profit';
  } else {
    if (Math.abs(delta) > 0.7) tip = '💡 Deep ITM put - expensive but high probability';
    else if (Math.abs(delta) > 0.45) tip = '💡 ATM put - balanced risk/reward for bearish bet';
    else tip = '💡 OTM put - cheap but needs big drop to profit';
  }
  if (dte <= 7) tip += ' ⚠️ Weekly: high theta decay!';
  document.getElementById('optionsTipText').textContent = tip;
}

// Update option total cost display
function updateOptionTotal() {
  if (!selectedOption) return;
  const qty = parseInt(document.getElementById('optionQty').value) || 1;
  const total = selectedOption.premium * 100 * qty;
  const fee = calculateOptionsTransactionFee(qty);
  document.getElementById('selectedOptionTotal').textContent = `$${total.toFixed(2)}`;
  
  // Update option fee display
  const optionFeeEl = document.getElementById('optionFee');
  if (optionFeeEl) {
    optionFeeEl.textContent = `$${fee.toFixed(2)}`;
  }
  
  // Update option trade info
  const totalWithFee = total + fee;
  const netWorth = calculateNetWorth();
  const cashPct = gameState.cash > 0 ? (totalWithFee / gameState.cash) * 100 : 0;
  const netWorthPct = netWorth > 0 ? (totalWithFee / netWorth) * 100 : 0;
  
  const optionCashPctEl = document.getElementById('optionCashPct');
  const optionNetWorthPctEl = document.getElementById('optionNetWorthPct');
  
  if (optionCashPctEl) {
    optionCashPctEl.textContent = `${cashPct.toFixed(1)}%`;
    optionCashPctEl.classList.remove('warning', 'danger');
    if (cashPct > 100) {
      optionCashPctEl.classList.add('danger');
    } else if (cashPct > 50) {
      optionCashPctEl.classList.add('warning');
    }
  }
  
  if (optionNetWorthPctEl) {
    optionNetWorthPctEl.textContent = `${netWorthPct.toFixed(1)}%`;
    optionNetWorthPctEl.classList.remove('warning', 'danger');
    if (netWorthPct > 25) {
      optionNetWorthPctEl.classList.add('danger');
    } else if (netWorthPct > 15) {
      optionNetWorthPctEl.classList.add('warning');
    }
  }
  
  // Position size warning
  const portfolioValue = calculateNetWorth();
  const positionPct = (totalWithFee / portfolioValue) * 100;
  const warningEl = document.getElementById('positionSizeWarning');
  if (positionPct > OPTIONS_MAX_POSITION_PCT * 100) {
    document.getElementById('positionSizePct').textContent = `${positionPct.toFixed(1)}%`;
    warningEl.style.display = 'block';
  } else {
    warningEl.style.display = 'none';
  }
}

// Execute option purchase
function executeOptionBuy() {
  if (!selectedOption || !currentOptionsStock) return;
  
  const qty = parseInt(document.getElementById('optionQty').value) || 1;
  const result = buyOption(
    currentOptionsStock,
    selectedOption.strike,
    selectedOption.dte,
    selectedOption.type === 'call',
    qty
  );
  
  if (result.success) {
    showEvent("Option Purchased", result.message + `<br><br>Max loss: $${(selectedOption.premium * 100 * qty).toFixed(2)}<br>Watch theta decay daily!`);
    closeOptionsChain();
    render();
  } else {
    showEvent("Purchase Failed", result.message);
  }
}

// Close options chain overlay
function closeOptionsChain() {
  document.getElementById('optionsOverlay').classList.remove('active');
  selectedOption = null;
  currentOptionsStock = null;
}

// Setup option quantity handlers (called from app.js init)
function setupOptionQuantityHandlers() {
  const qtyMinus = document.getElementById('optionQtyMinus');
  const qtyPlus = document.getElementById('optionQtyPlus');
  const qtyInput = document.getElementById('optionQty');
  
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
      updateOptionTotal();
    });
  }
  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      qtyInput.value = Math.min(parseInt(qtyInput.max) || 10, parseInt(qtyInput.value) + 1);
      updateOptionTotal();
    });
  }
  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      qtyInput.value = Math.max(1, Math.min(parseInt(qtyInput.max) || 10, parseInt(qtyInput.value) || 1));
      updateOptionTotal();
    });
  }
}

// Sell option from portfolio
function sellOptionPosition(contractId) {
  const result = sellOption(contractId);
  if (result.success) {
    showEvent(
      result.pnl >= 0 ? "Option Sold - Profit!" : "Option Sold - Loss", 
      result.message
    );
    render();
  } else {
    showEvent("Sell Failed", result.message);
  }
}

// Global handler for selling options (called from onclick in render.js)
function handleSellOption(contractId) {
  sellOptionPosition(contractId);
}

// ========== DAILY PROCESSING ==========

// Process all options for the day (called from market.js)
function processOptions() {
  // Update current values
  gameState.optionPositions.forEach(contract => {
    const stock = stocks.find(s => s.symbol === contract.symbol);
    if (!stock) return;
    
    const daysRemaining = contract.expirationDay - getTotalDays();
    if (daysRemaining > 0) {
      const currentPremium = calculateOptionPremium(
        stock,
        contract.strike,
        daysRemaining,
        contract.type === 'call'
      );
      contract.currentValue = currentPremium * 100 * contract.quantity;
      contract.currentPremium = currentPremium;
      contract.daysRemaining = daysRemaining;
      
      // Calculate P&L
      contract.pnl = contract.currentValue - contract.costBasis;
      contract.pnlPercent = (contract.pnl / contract.costBasis) * 100;
    }
  });
  
  // Process expirations
  processOptionExpirations();
}
