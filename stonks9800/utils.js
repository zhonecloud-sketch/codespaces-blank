// ===== STONKS 9800 - Stage 02 - Utilities =====

function formatNumber(num) {
  return Math.round(num).toLocaleString();
}

// Format price with 2 decimal places for precise stock prices
function formatPrice(num) {
  return num.toFixed(2);
}

function formatCompact(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Calculate meme factor - how much extreme moves are amplified/dampened
// stability 0.0 = full meme (100% impact), stability 1.0 = solid (30% impact)
// Returns multiplier: 0.3 to 1.0
function getMemeMultiplier(stock) {
  const stability = stock.stability !== undefined ? stock.stability : 0.5;
  // Invert stability: low stability = high meme factor
  // Scale from 0.3 (very stable) to 1.0 (meme-prone)
  return 0.3 + (1 - stability) * 0.7;
}

// Check if stock is meme-prone (stability < 0.5)
function isMemeProne(stock) {
  return (stock.stability !== undefined ? stock.stability : 0.5) < 0.5;
}

// Check if stock is solid blue-chip (stability >= 0.8)
function isSolidStock(stock) {
  return (stock.stability !== undefined ? stock.stability : 0.5) >= 0.8;
}

function getTotalDays() {
  return (gameState.year - 1) * DAYS_IN_YEAR + (gameState.month - 1) * DAYS_IN_MONTH + gameState.day;
}

function getDaysUntilDividend() {
  return DAYS_IN_QUARTER - (getTotalDays() % DAYS_IN_QUARTER);
}

function getComfortStars(level) {
  return '★'.repeat(level) + '☆'.repeat(5 - level);
}

function getStressRecoveryBonus() {
  const comfortData = COMFORT_LEVELS[gameState.comfort] || COMFORT_LEVELS[1];
  return Math.round((comfortData.recovery - 1) * 100);
}

// Draw chart on canvas
function drawChart(canvas, data, color) {
  if (!canvas || !data || data.length < 2) return;
  
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  
  const width = rect.width;
  const height = rect.height;
  const padding = 10;
  
  ctx.clearRect(0, 0, width, height);
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  
  const xStep = (width - padding * 2) / (data.length - 1);
  const yScale = (height - padding * 2) / priceRange;
  
  // Area fill
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  data.forEach((point, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (point.price - minPrice) * yScale;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(padding + (data.length - 1) * xStep, height - padding);
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, color + '4D');
  gradient.addColorStop(1, color + '00');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Line
  ctx.beginPath();
  data.forEach((point, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (point.price - minPrice) * yScale;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Store expected price outcome on stock for consistent GUI/log display
 * Both GUI and terminal logs should reference these values
 * @param {Object} stock - The stock object
 * @param {number} expectedPrice - The expected price after the event applies
 * @param {number} expectedDelta - The expected percentage change (negative for drops)
 */
function setExpectedOutcome(stock, expectedPrice, expectedDelta) {
  stock.eventExpectedPrice = expectedPrice;
  stock.eventExpectedDelta = expectedDelta;
}

/**
 * Format expected outcome for log display
 * @param {Object} stock - The stock object with eventExpectedPrice/Delta set
 * @returns {string} Formatted string like "[$25.00 Δ-15.0%]"
 */
function formatExpectedOutcome(stock) {
  if (!stock.eventExpectedPrice || stock.eventExpectedDelta === undefined) {
    return `[$${stock.price?.toFixed(2) || '?'} Δ?%]`;
  }
  const sign = stock.eventExpectedDelta >= 0 ? '+' : '';
  return `[$${stock.eventExpectedPrice.toFixed(2)} Δ${sign}${(stock.eventExpectedDelta * 100).toFixed(1)}%]`;
}
