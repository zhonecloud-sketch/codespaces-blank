// ===== STONKS 9800 - Stage 03 - Trade Journal & Market Sentiment =====

// ========== TRADE JOURNAL ==========

// Log a trade to the journal
// Can accept stock object or symbol string
function logTrade(action, stockOrSymbol, qty, price, result = null) {
  // Handle both stock object and symbol string
  let symbol, stock;
  if (typeof stockOrSymbol === 'object' && stockOrSymbol.symbol) {
    stock = stockOrSymbol;
    symbol = stock.symbol;
  } else {
    symbol = stockOrSymbol;
    stock = stocks.find(s => s.symbol === symbol);
  }
  
  if (!stock) return;
  
  // Calculate total cost for entry
  const totalCost = qty * price;
  
  // Process result data (for closing trades)
  let processedResult = null;
  if (result && result.pnl !== undefined) {
    processedResult = {
      profit: result.pnl,
      percent: result.avgCost ? ((price - result.avgCost) / result.avgCost * 100) : 0
    };
    // Invert for short/cover (profit when price goes down)
    if (action === 'COVER') {
      processedResult.percent = result.avgCost ? ((result.avgCost - price) / result.avgCost * 100) : 0;
    }
  }
  
  const entry = {
    id: Date.now() + Math.random(),
    day: gameState.day,
    year: gameState.year,
    totalDay: getTotalDays(),
    action: action, // 'BUY', 'SELL', 'SHORT', 'COVER'
    symbol: symbol,
    name: stock.name,
    qty: qty,
    price: price,
    totalCost: totalCost,
    result: processedResult, // { profit, percent } for closing trades
    
    // Market conditions at time of trade
    conditions: {
      stockPrice: stock.price,
      dayChange: stock.price - stock.previousPrice,
      dayChangePct: ((stock.price - stock.previousPrice) / stock.previousPrice * 100).toFixed(1),
      fomoPhase: stock.fomoPhase || null,
      fomoDaysLeft: stock.fomoDaysLeft || 0,
      crashPhase: stock.crashPhase || null,
      manipulationPhase: stock.manipulationPhase || null,
      shortInterest: stock.shortInterest || 0,
      shortSqueezePhase: stock.shortSqueezePhase || null,
      insiderBuying: stock.insiderBuying || false,
      earningsDay: stock.earningsDay || null,
      sentimentOffset: stock.sentimentOffset || 0,
      marketSentiment: gameState.sentimentIndex
    },
    
    // Auto-generated tags and lessons
    tags: [],
    lessons: []
  };
  
  // Auto-tag based on conditions
  autoTagTrade(entry);
  
  // Add to journal (limit size)
  gameState.tradeJournal.unshift(entry);
  if (gameState.tradeJournal.length > JOURNAL_MAX_ENTRIES) {
    gameState.tradeJournal.pop();
  }
  
  return entry;
}

// Auto-tag trades based on market conditions
function autoTagTrade(entry) {
  const c = entry.conditions;
  
  // FOMO-related tags
  if (c.fomoPhase) {
    entry.tags.push('fomo');
    if (entry.action === 'BUY' && c.fomoDaysLeft <= 3) {
      entry.tags.push('late-fomo');
      entry.lessons.push(JOURNAL_LESSONS.FOMO_BUY);
    }
  }
  
  // Crash/capitulation tags
  if (c.crashPhase === 'crash') {
    entry.tags.push('crash');
    if (entry.action === 'SELL') {
      entry.tags.push('panic-sell');
      entry.lessons.push(JOURNAL_LESSONS.CAPITULATION_SELL);
    }
    if (entry.action === 'BUY') {
      entry.tags.push('bottom-fish');
    }
  }
  
  if (c.crashPhase === 'bounce') {
    entry.tags.push('dead-cat-bounce');
    if (entry.action === 'BUY') {
      entry.lessons.push(JOURNAL_LESSONS.DEAD_CAT_HOLD);
    }
  }
  
  // Manipulation tags
  if (c.manipulationPhase === 'pump') {
    entry.tags.push('pump');
    if (entry.action === 'BUY') {
      entry.lessons.push(JOURNAL_LESSONS.PUMP_BUY);
    }
  }
  
  if (c.manipulationPhase === 'distribution') {
    entry.tags.push('distribution');
    if (entry.action === 'SELL') {
      entry.lessons.push(JOURNAL_LESSONS.DISTRIBUTION_SELL);
    }
  }
  
  // Short squeeze tags
  if (c.shortSqueezePhase === 'squeeze' || c.shortSqueezePhase === 'ready') {
    entry.tags.push('squeeze');
    if (entry.action === 'SHORT') {
      entry.lessons.push(JOURNAL_LESSONS.SQUEEZE_SHORT);
    }
  }
  
  // High short interest warning
  if (c.shortInterest > SHORT_SQUEEZE_WARNING_THRESHOLD) {
    entry.tags.push('high-si');
  }
  
  // Insider activity
  if (c.insiderBuying) {
    entry.tags.push('insider');
    if (entry.action === 'BUY') {
      entry.lessons.push(JOURNAL_LESSONS.INSIDER_FOLLOW);
    }
  }
  
  // Earnings proximity
  if (c.earningsDay && c.earningsDay <= 5) {
    entry.tags.push('earnings');
  }
  
  // Market sentiment
  if (c.marketSentiment < 25) {
    entry.tags.push('fear');
    if (entry.action === 'BUY') {
      entry.tags.push('contrarian-buy');
    }
  } else if (c.marketSentiment > 75) {
    entry.tags.push('greed');
    if (entry.action === 'SELL') {
      entry.tags.push('contrarian-sell');
    }
  }
  
  // Result-based tags (for closing trades)
  if (entry.result) {
    if (entry.result.profit > 0) {
      entry.tags.push('winner');
      if (entry.result.percent > 20) entry.tags.push('big-win');
    } else {
      entry.tags.push('loser');
      if (entry.result.percent < -20) entry.tags.push('big-loss');
    }
  }
}

// Analyze trade for additional lessons when closing
function analyzeClosedTrade(openEntry, closeEntry) {
  const holdDays = closeEntry.totalDay - openEntry.totalDay;
  const profitPct = closeEntry.result.percent;
  
  // Held too long with loss
  if (profitPct < -15 && holdDays > 10) {
    closeEntry.lessons.push(JOURNAL_LESSONS.HELD_LOSER);
    closeEntry.tags.push('held-too-long');
  }
  
  // Check if sold too early (if stock continued up)
  // This will be checked on subsequent days
  closeEntry.exitPrice = closeEntry.price;
  closeEntry.symbolAtExit = closeEntry.symbol;
  
  return closeEntry;
}

// Get journal statistics
function getJournalStats() {
  const journal = gameState.tradeJournal;
  
  // Filter closing trades (SELL, COVER)
  const closingTrades = journal.filter(t => t.result !== null);
  const winners = closingTrades.filter(t => t.result.profit > 0);
  const losers = closingTrades.filter(t => t.result.profit <= 0);
  
  const totalProfit = winners.reduce((sum, t) => sum + t.result.profit, 0);
  const totalLoss = Math.abs(losers.reduce((sum, t) => sum + t.result.profit, 0));
  
  // Tag analysis
  const tagCounts = {};
  const tagPnL = {};
  
  closingTrades.forEach(trade => {
    trade.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      tagPnL[tag] = (tagPnL[tag] || 0) + (trade.result?.profit || 0);
    });
  });
  
  // Find worst patterns (tags with most losses)
  const worstPatterns = Object.entries(tagPnL)
    .filter(([tag, pnl]) => pnl < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([tag, pnl]) => ({ tag, pnl, count: tagCounts[tag] }));
  
  // Find best patterns
  const bestPatterns = Object.entries(tagPnL)
    .filter(([tag, pnl]) => pnl > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, pnl]) => ({ tag, pnl, count: tagCounts[tag] }));
  
  return {
    totalTrades: closingTrades.length,
    winners: winners.length,
    losers: losers.length,
    winRate: closingTrades.length > 0 ? (winners.length / closingTrades.length * 100).toFixed(1) : 0,
    totalProfit: totalProfit,
    totalLoss: totalLoss,
    netPnL: totalProfit - totalLoss,
    avgWinner: winners.length > 0 ? totalProfit / winners.length : 0,
    avgLoser: losers.length > 0 ? totalLoss / losers.length : 0,
    profitFactor: totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : 'N/A',
    worstPatterns: worstPatterns,
    bestPatterns: bestPatterns
  };
}

// Get recent trades for display
function getRecentTrades(count = 10) {
  return gameState.tradeJournal.slice(0, count);
}

// ========== MARKET SENTIMENT INDEX ==========

// Calculate market sentiment (0 = Extreme Fear, 100 = Extreme Greed)
function calculateMarketSentiment() {
  let sentiment = 50; // Start neutral
  
  // 1. Price Trend (25% weight)
  let upStocks = 0;
  let downStocks = 0;
  let bigUpStocks = 0;
  let bigDownStocks = 0;
  
  stocks.forEach(stock => {
    const changePct = (stock.price - stock.previousPrice) / stock.previousPrice;
    if (changePct > 0) upStocks++;
    if (changePct < 0) downStocks++;
    if (changePct > 0.05) bigUpStocks++;
    if (changePct < -0.05) bigDownStocks++;
  });
  
  const breadth = (upStocks - downStocks) / stocks.length;
  const priceTrend = 50 + breadth * 50; // -1 to 1 -> 0 to 100
  
  // Adjust for big moves
  if (bigDownStocks >= 3) sentiment -= 15;
  if (bigUpStocks >= 3) sentiment += 15;
  
  // 2. Volatility (20% weight)
  let volatilityScore = 50;
  const avgVolatility = stocks.reduce((sum, s) => sum + (s.volatilityBoost || 0), 0) / stocks.length;
  if (avgVolatility > 0.5) volatilityScore = 20; // High vol = fear
  if (avgVolatility > 1.0) volatilityScore = 10;
  
  // Circuit breakers = extreme fear
  const haltedStocks = stocks.filter(s => s.tradingHalted).length;
  if (haltedStocks > 0) volatilityScore = 5;
  
  // 3. Short Interest (15% weight)
  const avgSI = stocks.reduce((sum, s) => sum + (s.shortInterest || 0.1), 0) / stocks.length;
  let siScore = 50;
  if (avgSI > 0.20) siScore = 30; // High SI = fear
  if (avgSI < 0.10) siScore = 70; // Low SI = greed
  
  // 4. Volume / FOMO indicators (15% weight)
  let fomoScore = 50;
  const fomoStocks = stocks.filter(s => s.fomoPhase).length;
  if (fomoStocks >= 2) fomoScore = 75; // FOMO = greed
  if (fomoStocks >= 4) fomoScore = 90;
  
  // 5. News sentiment (15% weight)
  let newsScore = 50;
  const recentNews = todayNews || [];
  const positiveNews = recentNews.filter(n => n.sentiment === 'positive').length;
  const negativeNews = recentNews.filter(n => n.sentiment === 'negative').length;
  newsScore = 50 + (positiveNews - negativeNews) * 10;
  newsScore = Math.max(10, Math.min(90, newsScore));
  
  // 6. Active crashes (10% weight)
  let crashScore = 50;
  const crashingStocks = stocks.filter(s => s.crashPhase).length;
  if (crashingStocks >= 1) crashScore = 30;
  if (crashingStocks >= 3) crashScore = 10;
  
  // Calculate weighted average
  sentiment = 
    priceTrend * SENTIMENT_WEIGHTS.PRICE_TREND +
    volatilityScore * SENTIMENT_WEIGHTS.VOLATILITY +
    siScore * SENTIMENT_WEIGHTS.SHORT_INTEREST +
    fomoScore * SENTIMENT_WEIGHTS.VOLUME +
    newsScore * SENTIMENT_WEIGHTS.NEWS +
    crashScore * SENTIMENT_WEIGHTS.CRASHES;
  
  // Clamp to 0-100
  sentiment = Math.max(0, Math.min(100, Math.round(sentiment)));
  
  // Store in gameState
  gameState.sentimentIndex = sentiment;
  
  // Track history
  gameState.sentimentHistory.push({ day: getTotalDays(), value: sentiment });
  if (gameState.sentimentHistory.length > 90) {
    gameState.sentimentHistory.shift();
  }
  
  return sentiment;
}

// Get sentiment zone info
function getSentimentZone(value) {
  if (value === undefined) value = gameState.sentimentIndex;
  
  for (const [key, zone] of Object.entries(SENTIMENT_ZONES)) {
    if (value >= zone.min && value < zone.max) {
      return { key, ...zone };
    }
  }
  return SENTIMENT_ZONES.EXTREME_GREED; // 100
}

// Get sentiment lesson/advice
function getSentimentAdvice() {
  const sentiment = gameState.sentimentIndex;
  const zone = getSentimentZone(sentiment);
  
  let advice = '';
  let historicalReturn = '';
  
  switch (zone.key) {
    case 'EXTREME_FEAR':
      advice = '"Blood in the streets" - historically best buying opportunity';
      historicalReturn = 'Buying at <20: Average +22% over 30 days';
      break;
    case 'FEAR':
      advice = 'Pessimism high - consider accumulating quality stocks';
      historicalReturn = 'Buying at 20-40: Average +12% over 30 days';
      break;
    case 'NEUTRAL':
      advice = 'No clear signal - trade individual setups';
      historicalReturn = 'Buying at 40-60: Average +4% over 30 days';
      break;
    case 'GREED':
      advice = 'Optimism high - consider taking profits';
      historicalReturn = 'Buying at 60-80: Average -3% over 30 days';
      break;
    case 'EXTREME_GREED':
      advice = '"Euphoria" - sell into strength, reduce exposure';
      historicalReturn = 'Buying at >80: Average -12% over 30 days';
      break;
  }
  
  return { zone, advice, historicalReturn };
}

// Generate sentiment alert if extreme
function checkSentimentAlert() {
  const sentiment = gameState.sentimentIndex;
  const zone = getSentimentZone(sentiment);
  
  if (zone.key === 'EXTREME_FEAR') {
    return {
      type: 'fear',
      title: '🔴 EXTREME FEAR',
      message: `Market sentiment at ${sentiment}. Panic selling detected.`,
      advice: 'Historically, buying during extreme fear returns +22% over 30 days.',
      lesson: '"Be greedy when others are fearful" - Warren Buffett'
    };
  }
  
  if (zone.key === 'EXTREME_GREED') {
    return {
      type: 'greed',
      title: '🟢 EXTREME GREED',
      message: `Market sentiment at ${sentiment}. Euphoria detected.`,
      advice: 'Historically, buying during extreme greed returns -12% over 30 days.',
      lesson: '"Be fearful when others are greedy" - Warren Buffett'
    };
  }
  
  return null;
}

// ========== ENHANCED SHORT SELLING ==========

// Calculate borrow rate based on short interest
function calculateBorrowRate(stock) {
  const si = stock.shortInterest || 0.05;
  let multiplier = SHORT_BORROW_RATE_MULTIPLIERS.LOW;
  
  if (si >= 0.30) multiplier = SHORT_BORROW_RATE_MULTIPLIERS.EXTREME;
  else if (si >= 0.20) multiplier = SHORT_BORROW_RATE_MULTIPLIERS.HIGH;
  else if (si >= 0.10) multiplier = SHORT_BORROW_RATE_MULTIPLIERS.MEDIUM;
  
  // Add randomness for "demand" factor
  const demandFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  const annualRate = SHORT_BORROW_RATE_BASE * multiplier * demandFactor;
  const dailyRate = annualRate / 365;
  
  return {
    annual: annualRate,
    daily: dailyRate,
    multiplier: multiplier,
    category: si >= 0.30 ? 'EXTREME' : si >= 0.20 ? 'HIGH' : si >= 0.10 ? 'MEDIUM' : 'LOW'
  };
}

// Check if stock is hard to borrow
function isHardToBorrow(stock) {
  return (stock.shortInterest || 0) >= SHORT_HARD_TO_BORROW_THRESHOLD;
}

// Process daily borrow fees for short positions
function processBorrowFees() {
  let totalFees = 0;
  
  Object.entries(gameState.shortPositions).forEach(([symbol, pos]) => {
    if (pos.qty <= 0) return;
    
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const borrowRate = calculateBorrowRate(stock);
    const positionValue = stock.price * pos.qty;
    const dailyFee = positionValue * borrowRate.daily;
    
    // Deduct fee from cash
    gameState.cash -= dailyFee;
    totalFees += dailyFee;
    
    // Track in stats
    gameState.stats.borrowFeesPaid = (gameState.stats.borrowFeesPaid || 0) + dailyFee;
    
    // Store rate on position for display
    pos.currentBorrowRate = borrowRate.annual;
    pos.dailyBorrowFee = dailyFee;
  });
  
  return totalFees;
}

// Check for short squeeze warnings
function checkShortSqueezeWarnings() {
  const warnings = [];
  
  Object.entries(gameState.shortPositions).forEach(([symbol, pos]) => {
    if (pos.qty <= 0) return;
    
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const si = stock.shortInterest || 0;
    
    // Squeeze warning
    if (si >= SHORT_SQUEEZE_WARNING_THRESHOLD) {
      const borrowRate = calculateBorrowRate(stock);
      const posValue = stock.price * pos.qty;
      const pnl = (pos.entryPrice - stock.price) * pos.qty;
      
      warnings.push({
        symbol: symbol,
        type: 'squeeze_risk',
        shortInterest: si,
        borrowRate: borrowRate.annual,
        dailyCost: pos.dailyBorrowFee || 0,
        positionValue: posValue,
        currentPnL: pnl,
        message: `Short interest ${(si * 100).toFixed(0)}% - squeeze risk!`,
        advice: si >= 0.35 ? 'DANGER: Consider covering immediately' : 'WARNING: Monitor closely'
      });
    }
    
    // Infinite loss warning
    const portfolioValue = calculateNetWorth();
    const positionPct = (stock.price * pos.qty) / portfolioValue;
    
    if (positionPct > SHORT_MAX_POSITION_PCT) {
      warnings.push({
        symbol: symbol,
        type: 'position_size',
        positionPercent: positionPct * 100,
        message: `Short position is ${(positionPct * 100).toFixed(1)}% of portfolio`,
        advice: 'Shorts have unlimited loss potential. Consider reducing size.'
      });
    }
  });
  
  return warnings;
}

// Detect short opportunities
function detectShortOpportunities() {
  const opportunities = [];
  
  stocks.forEach(stock => {
    // Skip if hard to borrow
    if (isHardToBorrow(stock)) return;
    
    const signals = [];
    let confidence = 0;
    
    // Pump dump imminent
    if (stock.manipulationPhase === 'pump' && stock.manipulationDaysLeft <= 2) {
      signals.push('pump_exhaustion');
      confidence += 35;
    }
    
    // Distribution phase
    if (stock.manipulationPhase === 'distribution') {
      signals.push('distribution');
      confidence += 30;
    }
    
    // FOMO exhaustion
    if (stock.fomoPhase && stock.fomoDaysLeft <= 2) {
      signals.push('fomo_exhaustion');
      confidence += 25;
    }
    
    // Overbought
    if (stock.sentimentOffset > 0.25) {
      signals.push('overbought');
      confidence += 15;
    }
    
    // Low squeeze risk (low SI)
    if (stock.shortInterest < 0.15) {
      confidence += 10; // Safer to short
    } else if (stock.shortInterest > 0.25) {
      confidence -= 20; // Squeeze risk
    }
    
    if (confidence >= 30 && signals.length >= 1) {
      const borrowRate = calculateBorrowRate(stock);
      
      opportunities.push({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        signals: signals,
        confidence: Math.min(95, confidence),
        shortInterest: stock.shortInterest,
        borrowRate: borrowRate.annual,
        dailyCostPer1000: (1000 * borrowRate.daily).toFixed(2),
        squeezeRisk: stock.shortInterest > 0.25 ? 'HIGH' : stock.shortInterest > 0.15 ? 'MEDIUM' : 'LOW'
      });
    }
  });
  
  return opportunities.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// ========== JOURNAL VIEW RENDERING ==========

function renderJournalView() {
  // Update sentiment display
  updateSentimentDisplay();
  
  // Update stats
  const stats = getJournalStats();
  
  const winRateEl = document.getElementById('journalWinRate');
  const pfEl = document.getElementById('journalProfitFactor');
  const pnlEl = document.getElementById('journalTotalPnL');
  
  if (winRateEl) winRateEl.textContent = stats.winRate + '%';
  if (pfEl) pfEl.textContent = stats.profitFactor;
  if (pnlEl) {
    pnlEl.textContent = (stats.netPnL >= 0 ? '+' : '') + '$' + formatNumber(stats.netPnL);
    pnlEl.className = 'journal-stat-value ' + (stats.netPnL >= 0 ? 'positive' : 'negative');
  }
  
  // Render patterns
  renderPatterns(stats.worstPatterns, document.getElementById('worstPatterns'), 'bad');
  renderPatterns(stats.bestPatterns, document.getElementById('bestPatterns'), 'good');
  
  // Render recent trades
  renderRecentTrades();
}

function renderPatterns(patterns, container, type) {
  if (!container) return;
  
  if (!patterns || patterns.length === 0) {
    container.innerHTML = '<div class="pattern-empty">No data yet</div>';
    return;
  }
  
  const tagLabels = {
    'fomo': 'FOMO Entry',
    'late-fomo': 'Late FOMO Buy',
    'crash': 'Crash Trade',
    'panic-sell': 'Panic Sell',
    'bottom-fish': 'Bottom Fish',
    'dead-cat-bounce': 'Dead Cat Bounce',
    'pump': 'Pump Phase',
    'distribution': 'Distribution',
    'squeeze': 'Squeeze',
    'high-si': 'High Short Interest',
    'insider': 'Insider Signal',
    'earnings': 'Earnings Play',
    'fear': 'Fear Market',
    'greed': 'Greed Market',
    'contrarian-buy': 'Contrarian Buy',
    'contrarian-sell': 'Contrarian Sell',
    'winner': 'Winner',
    'loser': 'Loser',
    'big-win': 'Big Win',
    'big-loss': 'Big Loss',
    'held-too-long': 'Held Too Long'
  };
  
  container.innerHTML = patterns.map(p => `
    <div class="pattern-item ${type}">
      <span class="pattern-name">${tagLabels[p.tag] || p.tag}</span>
      <span class="pattern-count">${p.count} trades</span>
      <span class="pattern-pnl ${p.pnl >= 0 ? 'positive' : 'negative'}">
        ${p.pnl >= 0 ? '+' : ''}$${formatNumber(p.pnl)}
      </span>
    </div>
  `).join('');
}

function renderRecentTrades() {
  const container = document.getElementById('recentTrades');
  if (!container) return;
  
  const recent = getRecentTrades(15);
  
  if (recent.length === 0) {
    container.innerHTML = '<div class="journal-empty">No trades yet. Start trading to track your performance!</div>';
    return;
  }
  
  container.innerHTML = recent.map(trade => {
    const actionClass = {
      'BUY': 'action-buy',
      'SELL': 'action-sell',
      'SHORT': 'action-short',
      'COVER': 'action-cover'
    }[trade.action] || '';
    
    const resultHtml = trade.result ? `
      <span class="trade-result ${trade.result.profit >= 0 ? 'positive' : 'negative'}">
        ${trade.result.profit >= 0 ? '+' : ''}$${formatNumber(trade.result.profit)}
        (${trade.result.percent >= 0 ? '+' : ''}${trade.result.percent.toFixed(1)}%)
      </span>
    ` : '';
    
    const tagsHtml = trade.tags.length > 0 ? `
      <div class="trade-tags">
        ${trade.tags.slice(0, 3).map(t => `<span class="trade-tag tag-${t}">${t}</span>`).join('')}
      </div>
    ` : '';
    
    const lessonHtml = trade.lessons.length > 0 ? `
      <div class="trade-lesson">💡 ${trade.lessons[0]}</div>
    ` : '';
    
    return `
      <div class="trade-entry ${actionClass}">
        <div class="trade-header">
          <span class="trade-day">Day ${trade.day}</span>
          <span class="trade-action">${trade.action}</span>
          <span class="trade-symbol">${trade.symbol}</span>
          <span class="trade-qty">${trade.qty}x</span>
          <span class="trade-price">@$${trade.price.toFixed(2)}</span>
          ${resultHtml}
        </div>
        ${tagsHtml}
        ${lessonHtml}
      </div>
    `;
  }).join('');
}

function updateSentimentDisplay() {
  const sentiment = gameState.sentimentIndex || 50;
  const zone = getSentimentZone(sentiment);
  const advice = getSentimentAdvice();
  
  // Update marker position in journal view
  const marker = document.getElementById('sentimentMarker');
  if (marker) {
    marker.style.left = sentiment + '%';
  }
  
  // Update value display in journal view
  const valueEl = document.getElementById('sentimentGaugeValue');
  if (valueEl) {
    valueEl.textContent = sentiment;
    valueEl.style.color = zone.color;
  }
  
  // Update advice in journal view
  const adviceEl = document.getElementById('sentimentAdvice');
  if (adviceEl) {
    adviceEl.textContent = '💡 ' + advice.advice;
  }
  
  // Update header status bar sentiment
  const headerSentiment = document.getElementById('sentimentValue');
  if (headerSentiment) {
    headerSentiment.textContent = sentiment;
    headerSentiment.style.color = zone.color;
  }
  
  // Update header sentiment label
  const headerLabel = document.getElementById('sentimentLabel');
  if (headerLabel) {
    headerLabel.textContent = zone.label;
    headerLabel.style.color = zone.color;
  }
}
