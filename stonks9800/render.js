// ===== STONKS 9800 - Stage 03 - Rendering =====

function render() {
  // Header
  elements.headerCash.textContent = `$${formatNumber(gameState.cash)}`;
  elements.dayDisplay.textContent = `DAY ${gameState.day} | ${DAY_NAMES[gameState.dayOfWeek]}`;
  elements.dateDisplay.textContent = `Year ${gameState.year} | Month ${gameState.month} | Day ${gameState.day}`;
  
  // Status bar
  elements.stressBar.style.width = `${gameState.stress}%`;
  elements.stressValue.textContent = gameState.stress;
  elements.energyBar.style.width = `${gameState.energy}%`;
  elements.energyValue.textContent = gameState.energy;
  elements.comfortStars.textContent = getComfortStars(gameState.comfort);
  elements.reputationValue.textContent = Math.floor(gameState.reputation);
  
  // Update market sentiment display
  if (typeof updateSentimentDisplay === 'function') {
    updateSentimentDisplay();
  }
  
  // Check for options unlock
  checkOptionsUnlock();
  
  // Render current view
  if (currentView === 'market') renderMarket();
  else if (currentView === 'portfolio') renderPortfolio();
  else if (currentView === 'news') renderNews();
  else if (currentView === 'bank') renderBank();
  else if (currentView === 'lifestyle') renderLifestyle();
  else if (currentView === 'journal') renderJournalView();
  
  if (selectedStock && elements.detailOverlay.classList.contains('active')) {
    updateDetailView();
  }
  
  // Render options opportunity alerts
  renderOptionOpportunityAlert();
}

// Check if options should be unlocked
function checkOptionsUnlock() {
  if (!gameState.optionsUnlocked && gameState.reputation >= OPTIONS_REP_REQUIRED) {
    gameState.optionsUnlocked = true;
    showEvent('OPTIONS TRADING UNLOCKED!', 
      'Your reputation has grown! You now have access to OPTIONS TRADING.\n\n' +
      '📈 Buy CALLS when you expect a stock to rise\n' +
      '📉 Buy PUTS when you expect a stock to fall\n\n' +
      'Look for opportunity alerts and check the Options Chain in the stock detail view.');
  }
}

function renderMarket() {
  elements.stockList.innerHTML = stocks.map(stock => {
    const change = stock.price - stock.previousPrice;
    const pct = ((change / stock.previousPrice) * 100);
    const isUp = change >= 0;
    const holding = gameState.holdings[stock.symbol];
    
    return `
      <div class="stock-item" data-symbol="${stock.symbol}">
        <div class="stock-header">
          <span class="stock-symbol">${stock.symbol}</span>
          <span class="stock-price ${isUp ? 'price-up' : 'price-down'}">$${formatNumber(stock.price)}</span>
        </div>
        <div class="stock-footer">
          <span>${stock.name}</span>
          <span class="stock-change ${isUp ? 'price-up' : 'price-down'}">${isUp ? '↗' : '↘'} ${Math.abs(pct).toFixed(2)}%</span>
        </div>
        <div class="stock-footer">
          <span class="stock-dividend">DIV: ${(stock.dividendYield * 100).toFixed(1)}%</span>
          ${holding?.qty > 0 ? `<span class="neon-cyan">OWNED: ${holding.qty}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  elements.stockList.querySelectorAll('.stock-item').forEach(el => {
    el.addEventListener('click', () => {
      selectedStock = stocks.find(s => s.symbol === el.dataset.symbol);
      tradeQuantity = 1;
      elements.tradeQty.value = 1;
      showDetail();
      updateTradeInfo();
    });
  });
}

// Update trade info panel showing transaction value, fees, % of cash, % of net worth
function updateTradeInfo() {
  if (!selectedStock) return;
  
  const stock = stocks.find(s => s.symbol === selectedStock.symbol) || selectedStock;
  const transactionValue = stock.price * tradeQuantity;
  const netWorth = calculateNetWorth();
  const cashPct = gameState.cash > 0 ? (transactionValue / gameState.cash) * 100 : 0;
  const netWorthPct = netWorth > 0 ? (transactionValue / netWorth) * 100 : 0;
  
  // Calculate estimated sell fees (SEC + FINRA TAF)
  const secFee = transactionValue * TRANSACTION_FEES.SEC_FEE_RATE;
  const finraFee = Math.min(tradeQuantity * TRANSACTION_FEES.FINRA_TAF_RATE, TRANSACTION_FEES.FINRA_TAF_MAX);
  const estimatedFees = Math.max(secFee + finraFee, TRANSACTION_FEES.MIN_FEE);
  
  const tradeValueEl = document.getElementById('tradeValue');
  const tradeFeesEl = document.getElementById('tradeFees');
  const tradeCashPctEl = document.getElementById('tradeCashPct');
  const tradeNetWorthPctEl = document.getElementById('tradeNetWorthPct');
  
  if (tradeValueEl) {
    tradeValueEl.textContent = `$${formatNumber(transactionValue)}`;
  }
  
  if (tradeFeesEl) {
    tradeFeesEl.textContent = `$${estimatedFees.toFixed(2)}`;
  }
  
  if (tradeCashPctEl) {
    tradeCashPctEl.textContent = `${cashPct.toFixed(1)}%`;
    tradeCashPctEl.classList.remove('warning', 'danger');
    if (cashPct > 100) {
      tradeCashPctEl.classList.add('danger');
    } else if (cashPct > 50) {
      tradeCashPctEl.classList.add('warning');
    }
  }
  
  if (tradeNetWorthPctEl) {
    tradeNetWorthPctEl.textContent = `${netWorthPct.toFixed(1)}%`;
    tradeNetWorthPctEl.classList.remove('warning', 'danger');
    if (netWorthPct > 25) {
      tradeNetWorthPctEl.classList.add('danger');
    } else if (netWorthPct > 15) {
      tradeNetWorthPctEl.classList.add('warning');
    }
  }
}

function renderPortfolio() {
  const totalWorth = calculateNetWorth();
  const pctChange = ((totalWorth - INITIAL_CASH) / INITIAL_CASH) * 100;
  
  elements.portfolioWorth.textContent = `$${formatNumber(totalWorth)}`;
  elements.portfolioChange.textContent = (pctChange >= 0 ? '+' : '') + pctChange.toFixed(2) + '% All Time';
  elements.portfolioChange.className = 'portfolio-change ' + (pctChange >= 0 ? 'price-up' : 'price-down');
  
  let tableHTML = `
    <tr><td class="neon-green">CASH</td><td class="text-right">-</td><td class="text-right">$${formatNumber(gameState.cash)}</td><td class="text-right">-</td></tr>
    <tr><td class="neon-cyan">SAVINGS</td><td class="text-right">-</td><td class="text-right">$${formatNumber(gameState.bankSavings)}</td><td class="text-right">-</td></tr>
  `;
  
  if (gameState.bankLoan > 0) {
    tableHTML += `<tr><td class="price-down">LOAN</td><td class="text-right">-</td><td class="text-right price-down">-$${formatNumber(gameState.bankLoan)}</td><td class="text-right">-</td></tr>`;
  }
  
  Object.entries(gameState.holdings).forEach(([symbol, holding]) => {
    if (holding.qty <= 0) return;
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const value = holding.qty * stock.price;
    const pl = value - holding.totalCost;
    const plPct = (pl / holding.totalCost * 100).toFixed(1);
    
    tableHTML += `
      <tr>
        <td class="neon-pink" style="font-weight:bold">${symbol}</td>
        <td class="text-right">${holding.qty}</td>
        <td class="text-right">$${formatNumber(value)}</td>
        <td class="text-right ${pl >= 0 ? 'price-up' : 'price-down'}">${pl >= 0 ? '+' : ''}${plPct}%</td>
      </tr>
    `;
  });
  
  // Properties
  gameState.ownedProperties.forEach(owned => {
    const prop = PROPERTIES.find(p => p.id === owned.id);
    if (prop) {
      const value = Math.round(prop.price * owned.condition / 100);
      tableHTML += `<tr><td class="neon-orange">${prop.name}</td><td class="text-right">1</td><td class="text-right">$${formatNumber(value)}</td><td class="text-right">-</td></tr>`;
    }
  });
  
  // Vehicles
  gameState.ownedVehicles.forEach(owned => {
    const veh = VEHICLES.find(v => v.id === owned.id);
    if (veh) {
      const value = Math.round(veh.price * owned.condition / 100);
      tableHTML += `<tr><td class="neon-yellow">${veh.name}</td><td class="text-right">1</td><td class="text-right">$${formatNumber(value)}</td><td class="text-right">-</td></tr>`;
    }
  });
  
  // Options Positions
  if (gameState.optionPositions && gameState.optionPositions.length > 0) {
    gameState.optionPositions.forEach(contract => {
      const typeClass = contract.type === 'call' ? 'neon-green' : 'price-down';
      const typeLabel = contract.type.toUpperCase();
      const pnl = contract.pnl || 0;
      const pnlPct = contract.pnlPercent || 0;
      const value = contract.currentValue || contract.costBasis;
      
      tableHTML += `
        <tr>
          <td class="${typeClass}">${contract.symbol} $${contract.strike} ${typeLabel}</td>
          <td class="text-right">${contract.quantity}x</td>
          <td class="text-right">$${formatNumber(value)}</td>
          <td class="text-right ${pnl >= 0 ? 'price-up' : 'price-down'}">${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%</td>
        </tr>
      `;
    });
  }
  
  elements.portfolioTable.innerHTML = tableHTML;
  drawChart(elements.portfolioChartCanvas, gameState.portfolioHistory.map(h => ({ price: h.value })), '#c026d3');
}

function renderNews() {
  if (news.length === 0) {
    elements.newsList.innerHTML = '<div class="empty-state">NO HEADLINES YET...</div>';
    return;
  }
  
  elements.newsList.innerHTML = news.map(item => {
    // Determine news type indicator - teaches players what drives prices
    let typeTag = '';
    let phenomenonTag = '';
    
    // Market phenomena tags (educational)
    if (item.isShortReport) {
      const reportTags = {
        'report': '<span class="news-tag type-short-report">📄 SHORT REPORT</span>',
        'denial': '<span class="news-tag type-denial">DENIAL</span>',
        'investigation': '<span class="news-tag type-investigation">⏳ INVESTIGATING</span>',
        'vindicated': '<span class="news-tag type-vindicated">✓ REPORT CONFIRMED</span>',
        'debunked': '<span class="news-tag type-debunked">✗ REPORT DEBUNKED</span>'
      };
      typeTag = reportTags[item.shortReportPhase] || '';
    } else if (item.isInsider) {
      const insiderTags = {
        'insider_buy': '<span class="news-tag type-insider-buy">📈 INSIDER BUY</span>',
        'insider_sell': '<span class="news-tag type-insider-sell">📉 INSIDER SELL</span>',
        'catalyst': '<span class="news-tag type-insider-catalyst">💡 INSIDER KNEW</span>'
      };
      typeTag = insiderTags[item.insiderTag] || '';
    } else if (item.isSplit) {
      const splitTags = {
        'announced': '<span class="news-tag type-split">🔀 STOCK SPLIT</span>',
        'pending': '<span class="news-tag type-split-pending">⏰ SPLIT TOMORROW</span>',
        'effective': '<span class="news-tag type-split-effective">✓ SPLIT EFFECTIVE</span>'
      };
      typeTag = splitTags[item.splitPhase] || '';
    } else if (item.isAnalyst) {
      const analystTags = {
        'upgrade': '<span class="news-tag type-upgrade">⬆ UPGRADE</span>',
        'downgrade': '<span class="news-tag type-downgrade">⬇ DOWNGRADE</span>'
      };
      typeTag = analystTags[item.analystTag] || '';
    } else if (item.isIndexRebalance) {
      const indexTags = {
        'index_add': '<span class="news-tag type-index-add">📊 INDEX ADD</span>',
        'index_remove': '<span class="news-tag type-index-remove">📊 INDEX DROP</span>'
      };
      typeTag = indexTags[item.indexTag] || '';
    } else if (item.isSectorRotation) {
      typeTag = '<span class="news-tag type-sector-rotation">🔄 SECTOR ROTATION</span>';
    } else if (item.isDividendTrap) {
      typeTag = '<span class="news-tag type-dividend-trap">⚠ YIELD TRAP</span>';
    } else if (item.isDividendCut) {
      typeTag = '<span class="news-tag type-dividend-cut">✂ DIVIDEND CUT</span>';
    } else if (item.isGap) {
      typeTag = item.gapDirection === 'up'
        ? '<span class="news-tag type-gap-up">⬆ GAP UP</span>'
        : '<span class="news-tag type-gap-down">⬇ GAP DOWN</span>';
    } else if (item.isCorrelationBreakdown !== undefined) {
      typeTag = item.isCorrelationBreakdown
        ? '<span class="news-tag type-correlation">📉 CORRELATION BREAKDOWN</span>'
        : '<span class="news-tag type-correlation-ok">📈 CORRELATIONS NORMAL</span>';
    } else if (item.isLiquidityCrisis !== undefined) {
      typeTag = item.isLiquidityCrisis
        ? '<span class="news-tag type-liquidity-crisis">🚨 LIQUIDITY CRISIS</span>'
        : '<span class="news-tag type-liquidity-ok">💧 LIQUIDITY RESTORED</span>';
    } else if (item.isWindowDressing) {
      typeTag = '<span class="news-tag type-window-dressing">📅 WINDOW DRESSING</span>';
    } else if (item.isTaxSelling) {
      typeTag = '<span class="news-tag type-tax-selling">💰 TAX SELLING</span>';
    } else if (item.isWhisper) {
      typeTag = '<span class="news-tag type-whisper">🤫 WHISPER NUMBER</span>';
    } else if (item.isCircuitBreaker) {
      typeTag = item.isHalted
        ? '<span class="news-tag type-circuit-breaker">⛔ HALTED</span>'
        : '<span class="news-tag type-circuit-resume">▶ RESUMED</span>';
    } else if (item.isShortSqueeze) {
      typeTag = '<span class="news-tag type-squeeze">SHORT SQUEEZE</span>';
    } else if (item.isShortInterest) {
      typeTag = `<span class="news-tag type-short">SHORT ${item.shortInterest}%</span>`;
    } else if (item.isDeadCatBounce) {
      typeTag = item.isTrap 
        ? '<span class="news-tag type-trap">⚠ BOUNCE?</span>'
        : '<span class="news-tag type-deadcat">DEAD CAT</span>';
    } else if (item.isFOMO) {
      typeTag = item.fomoPhase === 'blowoff'
        ? '<span class="news-tag type-fomo-danger">🔥 FOMO ALERT</span>'
        : '<span class="news-tag type-fomo">FOMO</span>';
    } else if (item.isCapitulation) {
      typeTag = item.isReversal
        ? '<span class="news-tag type-reversal">REVERSAL?</span>'
        : '<span class="news-tag type-capitulation">CAPITULATION</span>';
    } else if (item.newsType === 'crash') {
      typeTag = '<span class="news-tag type-crash">CRASH</span>';
    } else if (item.newsType === 'manipulation') {
      typeTag = item.isCrash 
        ? '<span class="news-tag type-manipulation-crash">⚠ UNVERIFIED</span>'
        : '<span class="news-tag type-manipulation">SPECULATION</span>';
    } else if (item.newsType === 'eps_driven') {
      typeTag = '<span class="news-tag type-eps">EARNINGS</span>';
    } else if (item.newsType === 'hybrid') {
      typeTag = '<span class="news-tag type-hybrid">OVERREACTION</span>';
    } else if (item.newsType === 'sentiment') {
      typeTag = '<span class="news-tag type-sentiment">SENTIMENT</span>';
    } else if (item.newsType === 'unusual_volume') {
      typeTag = '<span class="news-tag type-volume">VOLUME ALERT</span>';
    }
    
    // Volume clue tag - helps players learn to distinguish manipulation vs legitimate
    let clueTag = '';
    if (item.volumeClue) {
      const clueLabels = {
        // Suspicious clues (manipulation)
        'dark_pool': '<span class="news-tag clue-suspicious">DARK POOL</span>',
        'offshore': '<span class="news-tag clue-suspicious">OFFSHORE</span>',
        'no_catalyst': '<span class="news-tag clue-suspicious">NO CATALYST</span>',
        'no_news': '<span class="news-tag clue-suspicious">UNEXPLAINED</span>',
        'put_activity': '<span class="news-tag clue-suspicious">PUT BUYING</span>',
        // Legitimate clues (safe)
        'index_rebalance': '<span class="news-tag clue-legitimate">INDEX REBAL</span>',
        'disclosed': '<span class="news-tag clue-legitimate">DISCLOSED</span>',
        'etf_flow': '<span class="news-tag clue-legitimate">ETF FLOW</span>',
        'reported': '<span class="news-tag clue-legitimate">REPORTED</span>',
        '13f_filing': '<span class="news-tag clue-legitimate">13F FILED</span>',
        'earnings_hedge': '<span class="news-tag clue-legitimate">PRE-EARNINGS</span>'
      };
      clueTag = clueLabels[item.volumeClue] || '';
    }
    
    // Determine extra CSS classes
    let extraClasses = '';
    if (item.isManipulation) extraClasses += ' manipulation';
    if (item.isShortSqueeze) extraClasses += ' squeeze';
    if (item.isShortReport) extraClasses += ' short-report';
    if (item.isFOMO && item.fomoPhase === 'blowoff') extraClasses += ' fomo-danger';
    if (item.isDeadCatBounce && item.isTrap) extraClasses += ' trap';
    
    // Get tutorial info if tutorial mode is active
    let tutorialHtml = '';
    if (gameSettings && gameSettings.tutorialMode && typeof getTutorialForNews === 'function') {
      const tutorial = getTutorialForNews(item);
      if (tutorial) {
        const tutorialId = `tutorial-${item.id || Math.random().toString(36).substr(2, 9)}`;
        
        // Check for detailed trading hints for this event type
        let detailedHintHtml = '';
        if (typeof getDetailedTradingHint === 'function') {
          // Find the related stock for context
          let relatedStock = null;
          if (item.relatedStock && typeof stocks !== 'undefined') {
            relatedStock = stocks.find(s => s.symbol === item.relatedStock);
          }
          
          const detailedHint = getDetailedTradingHint(item, relatedStock);
          if (detailedHint) {
            detailedHintHtml = `
              <div class="tutorial-detailed" id="${tutorialId}-detailed">
                <div class="tutorial-detailed-header tutorial-toggle" onclick="this.parentElement.classList.toggle('tutorial-detailed-collapsed')">
                  <span>📋 DETAILED TRADING STRATEGY</span>
                  <span class="tutorial-expand-icon">▼</span>
                </div>
                <div class="tutorial-detailed-content">
                  ${detailedHint.telltales && detailedHint.telltales.length > 0 ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">🔍 TELLTALES TO IDENTIFY</div>
                      <ul class="tutorial-list">
                        ${detailedHint.telltales.map(t => `<li>${t}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  
                  ${detailedHint.timeline ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">⏰ TIMELINE</div>
                      ${detailedHint.timeline.total ? `<div class="tutorial-timing">Duration: ${detailedHint.timeline.total}</div>` : ''}
                      ${detailedHint.timeline.phases ? `
                        <ul class="tutorial-list">
                          ${detailedHint.timeline.phases.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                      ` : ''}
                      ${detailedHint.timeline.optimalEntry ? `<div class="tutorial-timing entry">📥 Entry: ${detailedHint.timeline.optimalEntry}</div>` : ''}
                      ${detailedHint.timeline.optimalExit ? `<div class="tutorial-timing exit">📤 Exit: ${detailedHint.timeline.optimalExit}</div>` : ''}
                    </div>
                  ` : ''}
                  
                  ${detailedHint.calculatedTargets ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">💰 PRICE TARGETS</div>
                      ${detailedHint.calculatedTargets.entryLow && detailedHint.calculatedTargets.entryHigh ? `
                        <div class="tutorial-price entry">📥 Buy Zone: $${detailedHint.calculatedTargets.entryLow.toFixed(2)} - $${detailedHint.calculatedTargets.entryHigh.toFixed(2)}</div>
                      ` : ''}
                      ${detailedHint.calculatedTargets.exitLow && detailedHint.calculatedTargets.exitHigh ? `
                        <div class="tutorial-price exit">📤 Sell Zone: $${detailedHint.calculatedTargets.exitLow.toFixed(2)} - $${detailedHint.calculatedTargets.exitHigh.toFixed(2)}</div>
                      ` : ''}
                      ${detailedHint.calculatedTargets.stopLoss ? `
                        <div class="tutorial-price stop">🛑 Stop Loss: $${detailedHint.calculatedTargets.stopLoss.toFixed(2)}</div>
                      ` : ''}
                    </div>
                  ` : (detailedHint.priceTargets ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">💰 PRICE TARGETS (% from event start)</div>
                      ${detailedHint.priceTargets.entryZone ? `
                        <div class="tutorial-price entry">📥 Buy: ${((detailedHint.priceTargets.entryZone[0] - 1) * 100).toFixed(0)}% to ${((detailedHint.priceTargets.entryZone[1] - 1) * 100).toFixed(0)}%</div>
                      ` : ''}
                      ${detailedHint.priceTargets.exitZone ? `
                        <div class="tutorial-price exit">📤 Sell: ${((detailedHint.priceTargets.exitZone[0] - 1) * 100).toFixed(0)}% to ${((detailedHint.priceTargets.exitZone[1] - 1) * 100).toFixed(0)}%</div>
                      ` : ''}
                      ${detailedHint.priceTargets.stopLoss ? `
                        <div class="tutorial-price stop">🛑 Stop: ${((detailedHint.priceTargets.stopLoss - 1) * 100).toFixed(0)}%</div>
                      ` : ''}
                    </div>
                  ` : '')}
                  
                  ${detailedHint.strategy && detailedHint.strategy.length > 0 ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">📋 STRATEGY</div>
                      <ol class="tutorial-strategy">
                        ${detailedHint.strategy.map(s => `<li>${s}</li>`).join('')}
                      </ol>
                    </div>
                  ` : ''}
                  
                  ${detailedHint.stockContext && detailedHint.stockContext.phase ? `
                    <div class="tutorial-section">
                      <div class="tutorial-section-title">📈 CURRENT STATUS</div>
                      <div class="tutorial-status">Phase: ${detailedHint.stockContext.phase}</div>
                      ${detailedHint.stockContext.waveNumber ? `<div class="tutorial-status">Wave/Bounce #${detailedHint.stockContext.waveNumber}</div>` : ''}
                      ${detailedHint.stockContext.daysRemaining ? `<div class="tutorial-status">~${detailedHint.stockContext.daysRemaining} days remaining</div>` : ''}
                    </div>
                  ` : ''}
                  
                  <div class="tutorial-risk ${detailedHint.riskLevel.toLowerCase()}">
                    ⚠️ Risk Level: ${detailedHint.riskLevel}
                  </div>
                </div>
              </div>
            `;
          }
        }
        
        // Build optional timing and catalyst rows
        const timingRow = tutorial.timing ? `<div class="tutorial-row tutorial-timing"><span class="tutorial-label">⏱️ TIMING:</span> ${tutorial.timing}</div>` : '';
        const catalystRow = tutorial.catalyst ? `<div class="tutorial-row tutorial-catalyst"><span class="tutorial-label">📈 CATALYST:</span> ${tutorial.catalyst}</div>` : '';
        
        tutorialHtml = `
          <div class="tutorial-embedded tutorial-collapsed" id="${tutorialId}">
            <div class="tutorial-header tutorial-toggle" onclick="this.parentElement.classList.toggle('tutorial-collapsed')">
              <span>🎓 HINT</span>
              <span class="tutorial-expand-icon">▶</span>
            </div>
            <div class="tutorial-content">
              <div class="tutorial-row"><span class="tutorial-label">TYPE:</span> ${tutorial.type}</div>
              <div class="tutorial-row"><span class="tutorial-label">WHAT:</span> ${tutorial.description}</div>
              <div class="tutorial-row"><span class="tutorial-label">IMPLICATION:</span> ${tutorial.implication}</div>
              <div class="tutorial-row tutorial-action"><span class="tutorial-label">ACTION:</span> ${tutorial.action}</div>
              ${timingRow}
              ${catalystRow}
              ${detailedHintHtml}
            </div>
          </div>
        `;
      }
    }
    
    return `
      <div class="news-item ${item.sentiment}${extraClasses}">
        <div class="news-meta"><span>HEADLINES</span><span>${item.timestamp}</span></div>
        <p class="news-headline">${item.headline}</p>
        ${item.description ? `<p class="news-desc">${item.description}</p>` : ''}
        ${tutorialHtml}
        <div class="news-tags">
          ${item.relatedStock ? `<span class="news-tag news-stock-ref" data-symbol="${item.relatedStock}">REF: ${item.relatedStock}</span>` : ''}
          ${item.isMarketWide ? `<span class="news-tag">MARKET-WIDE</span>` : ''}
          ${typeTag}
          ${clueTag}
        </div>
      </div>
    `;
  }).join('');
}

function renderBank() {
  elements.bankSavingsDisplay.textContent = `$${formatNumber(gameState.bankSavings)}`;
  elements.bankLoanDisplay.textContent = `$${formatNumber(gameState.bankLoan)}`;
  elements.maxLoanDisplay.textContent = `$${formatNumber(calculateMaxLoan())}`;
  elements.daysUntilDividend.textContent = getDaysUntilDividend();
  elements.estimatedDividend.textContent = `$${formatNumber(calculateEstimatedDividend())}`;
  
  if (gameState.missedLoanPayments > 0) {
    elements.loanWarning.textContent = `⚠ ${gameState.missedLoanPayments} missed payments. ${BANK.MISSED_PAYMENTS_LIMIT - gameState.missedLoanPayments} remaining.`;
  } else {
    elements.loanWarning.textContent = '';
  }
}

function renderLifestyle() {
  // Comfort summary
  const comfortData = COMFORT_LEVELS[gameState.comfort];
  elements.comfortLevelDisplay.textContent = getComfortStars(gameState.comfort);
  elements.comfortStatus.textContent = comfortData.status;
  elements.stressRecoveryBonus.textContent = `+${getStressRecoveryBonus()}%`;
  
  // CEO requirements
  const ceo = checkCEOUnlock();
  document.getElementById('ceoReqWealth').innerHTML = `Net Worth: $10M <span class="req-status ${ceo.meetsWealth ? 'met' : ''}">${ceo.meetsWealth ? '✓' : '❌'}</span>`;
  document.getElementById('ceoReqRep').innerHTML = `Reputation: 50+ <span class="req-status ${ceo.meetsRep ? 'met' : ''}">${ceo.meetsRep ? '✓' : '❌'}</span>`;
  document.getElementById('ceoReqTrades').innerHTML = `Trades: 100+ <span class="req-status ${ceo.meetsTrades ? 'met' : ''}">${ceo.meetsTrades ? '✓' : '❌'}</span>`;
  
  document.getElementById('ceoStatus').classList.toggle('hidden', ceo.unlocked);
  document.getElementById('ceoContent').classList.toggle('hidden', !ceo.unlocked);
  
  renderPropertyTab();
  renderVehicleTab();
}

function renderPropertyTab() {
  // Owned
  if (gameState.ownedProperties.length === 0) {
    document.getElementById('ownedProperties').innerHTML = '<div class="empty-state">No properties owned</div>';
  } else {
    document.getElementById('ownedProperties').innerHTML = gameState.ownedProperties.map(owned => {
      const prop = PROPERTIES.find(p => p.id === owned.id);
      if (!prop) return '';
      return `
        <div class="property-card owned" data-id="${prop.id}" data-owned="true">
          <div class="card-header"><span class="card-name">${prop.name}</span><span class="card-price">$${formatCompact(prop.price)}</span></div>
          <div class="card-details">
            <div class="card-detail"><span class="card-detail-label">Rent:</span><span class="card-detail-value rent">$${formatCompact(prop.rent)}/mo</span></div>
            <div class="card-detail"><span class="card-detail-label">Comfort:</span><span class="card-detail-value comfort">+${prop.comfort}</span></div>
            <div class="card-detail"><span class="card-detail-label">Cond:</span><span class="card-detail-value">${Math.round(owned.condition)}%</span></div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Market
  const unownedProps = PROPERTIES.filter(p => !gameState.ownedProperties.some(o => o.id === p.id));
  document.getElementById('propertyMarket').innerHTML = unownedProps.map(prop => `
    <div class="property-card" data-id="${prop.id}" data-owned="false">
      <div class="card-header"><span class="card-name">${prop.name}</span><span class="card-price">$${formatCompact(prop.price)}</span></div>
      <div class="card-details">
        <div class="card-detail"><span class="card-detail-label">Rent:</span><span class="card-detail-value rent">$${formatCompact(prop.rent)}/mo</span></div>
        <div class="card-detail"><span class="card-detail-label">Comfort:</span><span class="card-detail-value comfort">+${prop.comfort}</span></div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.property-card').forEach(el => {
    el.addEventListener('click', () => showPropertyOverlay(el.dataset.id, el.dataset.owned === 'true'));
  });
}

function renderVehicleTab() {
  // Owned
  if (gameState.ownedVehicles.length === 0) {
    document.getElementById('ownedVehicles').innerHTML = '<div class="empty-state">No vehicles owned</div>';
  } else {
    document.getElementById('ownedVehicles').innerHTML = gameState.ownedVehicles.map(owned => {
      const veh = VEHICLES.find(v => v.id === owned.id);
      if (!veh) return '';
      return `
        <div class="vehicle-card owned" data-id="${veh.id}" data-owned="true">
          <div class="card-header"><span class="card-name">${veh.name}</span><span class="card-price">$${formatCompact(veh.price)}</span></div>
          <div class="card-details">
            <div class="card-detail"><span class="card-detail-label">Comfort:</span><span class="card-detail-value comfort">+${veh.comfort}</span></div>
            <div class="card-detail"><span class="card-detail-label">Status:</span><span class="card-detail-value">+${veh.status} REP</span></div>
            <div class="card-detail"><span class="card-detail-label">Cond:</span><span class="card-detail-value">${Math.round(owned.condition)}%</span></div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Market
  const unownedVehs = VEHICLES.filter(v => !gameState.ownedVehicles.some(o => o.id === v.id));
  document.getElementById('vehicleMarket').innerHTML = unownedVehs.map(veh => `
    <div class="vehicle-card" data-id="${veh.id}" data-owned="false">
      <div class="card-header"><span class="card-name">${veh.name}</span><span class="card-price">$${formatCompact(veh.price)}</span></div>
      <div class="card-details">
        <div class="card-detail"><span class="card-detail-label">Comfort:</span><span class="card-detail-value comfort">+${veh.comfort}</span></div>
        <div class="card-detail"><span class="card-detail-label">Status:</span><span class="card-detail-value">+${veh.status} REP</span></div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.vehicle-card').forEach(el => {
    el.addEventListener('click', () => showVehicleOverlay(el.dataset.id, el.dataset.owned === 'true'));
  });
}

function showDetail() {
  if (!selectedStock) return;
  elements.detailOverlay.classList.add('active');
  elements.analysisContent.textContent = 'Query the AI Analyst for latest market rumors and predictions...';
  tradeQuantity = 1;
  elements.tradeQty.value = 1;
  updateQtySlider();
  updateDetailView();
}

function hideDetail() {
  elements.detailOverlay.classList.remove('active');
  selectedStock = null;
}

function updateDetailView() {
  if (!selectedStock) return;
  
  const stock = stocks.find(s => s.symbol === selectedStock.symbol) || selectedStock;
  const holding = gameState.holdings[stock.symbol];
  const owned = holding ? holding.qty : 0;
  const avgCost = holding?.qty > 0 ? holding.totalCost / holding.qty : 0;
  const value = owned * stock.price;
  const pl = value - (avgCost * owned);
  const change = stock.price - stock.previousPrice;
  const pctChange = stock.previousPrice > 0 ? (change / stock.previousPrice) * 100 : 0;
  const isUp = change >= 0;
  
  elements.detailTitle.textContent = stock.name;
  elements.detailDesc.textContent = stock.description;
  elements.detailPrice.textContent = `$${formatPrice(stock.price)}`;
  // Show both dollar and percent change for clarity
  elements.detailChange.textContent = `${change >= 0 ? '+' : '-'}$${formatPrice(Math.abs(change))} (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%)`;
  elements.detailChange.className = 'detail-change ' + (isUp ? 'price-up' : 'price-down');
  elements.detailDividend.textContent = `${(stock.dividendYield * 100).toFixed(1)}% annually`;
  
  elements.detailHoldings.textContent = owned;
  elements.detailHoldingsValue.textContent = `Value: $${formatNumber(value)}`;
  elements.detailAvgCost.textContent = `$${formatNumber(Math.round(avgCost))}`;
  elements.detailProfitLoss.textContent = `P/L: ${pl >= 0 ? '+' : ''}$${formatNumber(pl)}`;
  elements.detailProfitLoss.className = 'holding-sub ' + (pl >= 0 ? 'price-up' : 'price-down');
  
  // Short position display
  const shortPos = gameState.shortPositions[stock.symbol];
  const shortInfoEl = document.getElementById('shortPositionInfo');
  if (shortPos && shortPos.qty > 0) {
    const shortPnL = (shortPos.entryPrice - stock.price) * shortPos.qty;
    document.getElementById('shortQty').textContent = shortPos.qty;
    document.getElementById('shortEntry').textContent = formatNumber(Math.round(shortPos.entryPrice));
    document.getElementById('shortPnL').textContent = `P&L: ${shortPnL >= 0 ? '+' : ''}$${formatNumber(shortPnL)}`;
    document.getElementById('shortPnL').className = 'short-pnl ' + (shortPnL >= 0 ? 'profit' : 'loss');
    shortInfoEl.style.display = 'flex';
  } else {
    shortInfoEl.style.display = 'none';
  }
  
  // Enable/disable buttons
  document.getElementById('sellBtn').disabled = owned === 0;
  document.getElementById('buyBtn').disabled = gameState.cash < stock.price || stock.tradingHalted;
  
  // Short selling requires reputation and can't short halted stocks
  const canShort = gameState.reputation >= SHORT_SELL_REP_REQUIRED && !stock.tradingHalted;
  document.getElementById('shortBtn').disabled = !canShort || gameState.cash < stock.price * 1.5;
  document.getElementById('coverBtn').disabled = !shortPos || shortPos.qty === 0 || stock.tradingHalted;
  
  // Options requires reputation
  const canOptions = gameState.reputation >= OPTIONS_REP_REQUIRED && !stock.tradingHalted;
  document.getElementById('optionsBtn').disabled = !canOptions;
  
  // Show halted warning
  if (stock.tradingHalted) {
    elements.detailDesc.textContent = "⛔ TRADING HALTED - Circuit breaker triggered";
  }
  
  drawChart(elements.chartCanvas, stock.history, isUp ? '#4ade80' : '#f87171');
}

function switchView(view) {
  currentView = view;
  
  ['market', 'portfolio', 'news', 'bank', 'lifestyle', 'journal'].forEach(v => {
    const el = document.getElementById(v + 'View');
    if (el) el.classList.remove('active');
  });
  const activeView = document.getElementById(view + 'View');
  if (activeView) activeView.classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  render();
}

function switchLifestyleTab(tab) {
  currentLifestyleTab = tab;
  
  document.querySelectorAll('.lifestyle-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.lifestyle-tab[data-tab="${tab}"]`).classList.add('active');
  
  document.querySelectorAll('.lifestyle-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tab + 'Tab').classList.add('active');
  
  render();
}

// ========== OPTIONS RENDERING ==========

function renderOptionOpportunityAlert() {
  const alertEl = document.getElementById('optionsOpportunityAlert');
  if (!alertEl) return;
  
  // Only show if options unlocked and we have a selected stock with an opportunity
  if (!gameState.optionsUnlocked || !selectedStock) {
    alertEl.style.display = 'none';
    return;
  }
  
  // Find opportunity for selected stock
  const opportunities = gameState.currentOptionOpportunities || [];
  const opp = opportunities.find(o => o.stock.symbol === selectedStock.symbol);
  
  if (!opp) {
    alertEl.style.display = 'none';
    return;
  }
  
  alertEl.style.display = 'block';
  alertEl.className = 'options-opportunity-alert' + (opp.type === 'put' ? ' put-alert' : '');
  
  document.getElementById('opportunityType').textContent = 
    opp.type === 'call' ? '📈 CALL OPPORTUNITY' : '📉 PUT OPPORTUNITY';
  document.getElementById('opportunityConfidence').textContent = opp.confidence + '%';
  
  const detailsHtml = `
    <div><strong>Strike:</strong> $${opp.suggestedStrike} | <strong>DTE:</strong> ${opp.suggestedDte} days</div>
    <div><strong>Premium:</strong> ~$${opp.estimatedPremium.toFixed(2)} ($${(opp.estimatedPremium * 100).toFixed(0)}/contract)</div>
    <div style="margin-top:4px;">${opp.reasoning.slice(0, 2).join(' ')}</div>
  `;
  document.getElementById('opportunityDetails').innerHTML = detailsHtml;
}

function renderOptionsChain(stock, dte) {
  const chain = buildOptionsChain(stock, dte);
  const bodyEl = document.getElementById('optionsChainBody');
  
  if (!bodyEl) return;
  
  // Update header info
  document.getElementById('optionsSymbol').textContent = stock.symbol;
  document.getElementById('optionsStockPrice').textContent = '$' + stock.price.toFixed(2);
  document.getElementById('optionsIV').textContent = 'IV: ' + (chain.iv * 100).toFixed(0) + '%';
  
  // Check for IV warning
  const ivWarning = checkIVCrushWarning(stock);
  const warningEl = document.getElementById('ivWarning');
  if (ivWarning.warning) {
    warningEl.style.display = 'block';
    document.getElementById('ivWarningText').textContent = ivWarning.message;
  } else {
    warningEl.style.display = 'none';
  }
  
  // Build chain rows
  let html = '';
  for (let i = 0; i < chain.calls.length; i++) {
    const call = chain.calls[i];
    const put = chain.puts[i];
    const isAtm = call.atm || put.atm;
    
    html += `
      <div class="chain-row ${isAtm ? 'atm-row' : ''}">
        <div class="chain-cell chain-cell-call ${call.itm ? 'itm' : ''}" 
             data-type="call" data-strike="${call.strike}" data-premium="${call.premium}" 
             data-delta="${call.delta}" data-theta="${call.theta}">
          $${call.premium.toFixed(2)} <span style="font-size:9px;opacity:0.7">Δ${call.delta}</span>
        </div>
        <div class="chain-cell chain-cell-strike">$${call.strike}</div>
        <div class="chain-cell chain-cell-put ${put.itm ? 'itm' : ''}"
             data-type="put" data-strike="${put.strike}" data-premium="${put.premium}"
             data-delta="${put.delta}" data-theta="${put.theta}">
          $${put.premium.toFixed(2)} <span style="font-size:9px;opacity:0.7">Δ${put.delta}</span>
        </div>
      </div>
    `;
  }
  
  bodyEl.innerHTML = html;
}

function renderOptionsPositions() {
  const listEl = document.getElementById('optionsPositionsList');
  if (!listEl) return;
  
  if (!gameState.optionPositions || gameState.optionPositions.length === 0) {
    listEl.innerHTML = `
      <div class="options-empty">
        <div class="options-empty-icon">📋</div>
        <div>No option positions yet</div>
        <div style="font-size:11px;margin-top:8px;">Buy options from the chain view</div>
      </div>
    `;
    return;
  }
  
  let totalValue = 0;
  let totalPnl = 0;
  
  const html = gameState.optionPositions.map(contract => {
    const value = contract.currentValue || contract.costBasis;
    const pnl = contract.pnl || 0;
    const pnlPct = contract.pnlPercent || 0;
    
    totalValue += value;
    totalPnl += pnl;
    
    return `
      <div class="option-position-card">
        <div class="option-position-header">
          <span class="option-position-symbol ${contract.type}">${contract.symbol} $${contract.strike}</span>
          <span class="option-position-type ${contract.type}">${contract.type.toUpperCase()}</span>
        </div>
        <div class="option-position-details">
          <div class="option-position-detail">
            <span class="option-position-detail-label">Qty:</span>
            <span>${contract.quantity}x</span>
          </div>
          <div class="option-position-detail">
            <span class="option-position-detail-label">Cost:</span>
            <span>$${contract.costBasis.toFixed(0)}</span>
          </div>
          <div class="option-position-detail">
            <span class="option-position-detail-label">Value:</span>
            <span>$${value.toFixed(0)}</span>
          </div>
          <div class="option-position-detail">
            <span class="option-position-detail-label">Expires:</span>
            <span>${contract.daysRemaining || '?'}d</span>
          </div>
        </div>
        <div class="option-position-pnl">
          <span class="option-position-pnl-value ${pnl >= 0 ? 'positive' : 'negative'}">
            ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)} (${pnlPct.toFixed(1)}%)
          </span>
          <div class="option-position-actions">
            <button class="btn btn-danger btn-sm" onclick="handleSellOption('${contract.id}')">SELL</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  listEl.innerHTML = html;
  
  // Update summary
  document.getElementById('optionsTotalValue').textContent = '$' + totalValue.toFixed(0);
  document.getElementById('optionsTotalPnL').textContent = (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toFixed(0);
  document.getElementById('optionsTotalPnL').className = totalPnl >= 0 ? 'neon-green' : 'price-down';
  
  const wins = gameState.stats.optionsWins || 0;
  const losses = gameState.stats.optionsLosses || 0;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : '0';
  document.getElementById('optionsWinRate').textContent = winRate + '%';
}
