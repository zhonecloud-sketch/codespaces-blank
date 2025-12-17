// ===== STONKS 9800 - Stage 02 - Banking =====

function bankDeposit() {
  const amount = parseInt(elements.depositAmount.value) || 0;
  if (amount <= 0 || amount > gameState.cash) return;
  
  gameState.cash -= amount;
  gameState.bankSavings += amount;
  elements.depositAmount.value = '';
  render();
}

function bankWithdraw() {
  const amount = parseInt(elements.withdrawAmount.value) || 0;
  if (amount <= 0 || amount > gameState.bankSavings) return;
  
  gameState.bankSavings -= amount;
  gameState.cash += amount;
  elements.withdrawAmount.value = '';
  render();
}

function bankBorrow() {
  const amount = parseInt(elements.borrowAmount.value) || 0;
  const maxLoan = calculateMaxLoan();
  
  if (amount <= 0 || amount > maxLoan - gameState.bankLoan) return;
  
  gameState.bankLoan += amount;
  gameState.cash += amount;
  elements.borrowAmount.value = '';
  render();
}

function bankRepay() {
  const amount = parseInt(elements.repayAmount.value) || 0;
  if (amount <= 0 || amount > Math.min(gameState.cash, gameState.bankLoan)) return;
  
  gameState.cash -= amount;
  gameState.bankLoan -= amount;
  
  if (gameState.bankLoan <= 0) {
    gameState.stress = Math.max(0, gameState.stress - 20);
    gameState.reputation += 5;
  }
  
  elements.repayAmount.value = '';
  render();
}

function calculateMaxLoan() {
  return Math.round(calculateNetWorth() * BANK.MAX_LOAN_RATIO);
}

function processBankInterest() {
  // Savings interest
  if (gameState.bankSavings > 0) {
    const interest = Math.round(gameState.bankSavings * BANK.SAVINGS_RATE);
    gameState.bankSavings += interest;
    addNews(`Bank interest received: $${formatNumber(interest)}`, 'positive', null);
  }
  
  // Loan interest
  if (gameState.bankLoan > 0) {
    const interest = Math.round(gameState.bankLoan * BANK.LOAN_RATE);
    gameState.bankLoan += interest;
    
    const payment = Math.min(gameState.cash, Math.round(gameState.bankLoan * 0.1));
    if (payment > 0) {
      gameState.cash -= payment;
      gameState.bankLoan -= payment;
      addNews(`Loan payment processed: $${formatNumber(payment)}`, 'neutral', null);
    } else {
      gameState.missedLoanPayments++;
      gameState.stress += 15;
      if (gameState.missedLoanPayments >= BANK.MISSED_PAYMENTS_LIMIT) {
        forceLiquidation();
      }
    }
  }
}

function forceLiquidation() {
  showEvent("Loan Default", "Missed too many payments. Assets being liquidated.");
  
  // Sell all holdings
  Object.entries(gameState.holdings).forEach(([symbol, holding]) => {
    if (holding.qty > 0) {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock) gameState.cash += stock.price * holding.qty;
    }
  });
  gameState.holdings = {};
  
  // Sell properties
  gameState.ownedProperties.forEach(prop => {
    const property = PROPERTIES.find(p => p.id === prop.id);
    if (property) gameState.cash += Math.round(property.price * prop.condition / 100 * 0.8);
  });
  gameState.ownedProperties = [];
  
  // Sell vehicles
  gameState.ownedVehicles.forEach(veh => {
    const vehicle = VEHICLES.find(v => v.id === veh.id);
    if (vehicle) gameState.cash += Math.round(vehicle.price * veh.condition / 100 * 0.7);
  });
  gameState.ownedVehicles = [];
  
  // Pay off loan
  const payoff = Math.min(gameState.cash, gameState.bankLoan);
  gameState.cash -= payoff;
  gameState.bankLoan -= payoff;
  gameState.missedLoanPayments = 0;
  gameState.reputation = Math.max(0, gameState.reputation - 20);
  
  calculateComfort();
  render();
}

function showTaxAssessment() {
  if (gameState.realizedGains <= 0) return;
  
  const tax = Math.round(gameState.realizedGains * TAX.INCOME);
  gameState.taxesDue = tax;
  
  elements.taxBody.innerHTML = `
    <div class="tax-line"><span>Realized Gains</span><span class="neon-green">$${formatNumber(gameState.realizedGains)}</span></div>
    <div class="tax-line"><span>Tax Rate</span><span>${(TAX.INCOME * 100)}%</span></div>
    <div class="tax-total">TOTAL DUE: $${formatNumber(tax)}</div>
  `;
  elements.taxOverlay.classList.add('active');
}

function payTaxes() {
  if (gameState.cash >= gameState.taxesDue) {
    gameState.cash -= gameState.taxesDue;
  } else {
    const unpaid = gameState.taxesDue - gameState.cash;
    gameState.cash = 0;
    gameState.stress += 20;
    showEvent("Tax Penalty", `Unable to pay full taxes. $${formatNumber(unpaid)} in penalties added.`);
  }
  
  gameState.realizedGains = 0;
  gameState.taxesDue = 0;
  elements.taxOverlay.classList.remove('active');
  render();
}
