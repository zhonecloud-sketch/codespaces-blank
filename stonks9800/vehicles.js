// ===== STONKS 9800 - Stage 02 - Vehicle System =====

function buyVehicle(vehicleId) {
  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return false;
  
  if (gameState.cash < vehicle.price) {
    showEvent("Insufficient Funds", `Need $${formatNumber(vehicle.price)} to purchase.`);
    return false;
  }
  
  if (gameState.ownedVehicles.some(v => v.id === vehicleId)) {
    showEvent("Already Owned", "You already own this vehicle.");
    return false;
  }
  
  gameState.cash -= vehicle.price;
  gameState.ownedVehicles.push({
    id: vehicleId,
    purchasePrice: vehicle.price,
    purchaseDay: getTotalDays(),
    condition: 100
  });
  
  gameState.reputation += vehicle.status * 2;
  calculateComfort();
  hideVehicleOverlay();
  render();
  
  addNews(`Purchased ${vehicle.name} for $${formatNumber(vehicle.price)}`, 'life', null);
  return true;
}

function sellVehicle(vehicleId) {
  const idx = gameState.ownedVehicles.findIndex(v => v.id === vehicleId);
  if (idx === -1) return false;
  
  const owned = gameState.ownedVehicles[idx];
  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return false;
  
  const sellPrice = Math.round(vehicle.price * (owned.condition / 100) * 0.7); // 30% depreciation on sale
  gameState.cash += sellPrice;
  gameState.ownedVehicles.splice(idx, 1);
  
  calculateComfort();
  hideVehicleOverlay();
  render();
  
  addNews(`Sold ${vehicle.name} for $${formatNumber(sellPrice)}`, 'life', null);
  return true;
}

function processVehicleCosts() {
  let totalCosts = 0;
  
  gameState.ownedVehicles.forEach(owned => {
    const vehicle = VEHICLES.find(v => v.id === owned.id);
    if (vehicle) {
      totalCosts += vehicle.monthlyCost;
      
      // Depreciation
      owned.condition = Math.max(30, owned.condition - 0.8);
    }
  });
  
  if (totalCosts > 0) {
    gameState.cash -= totalCosts;
    addNews(`Vehicle costs: $${formatNumber(totalCosts)}`, 'neutral', null);
  }
}

function showVehicleOverlay(vehicleId, isOwned = false) {
  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return;
  
  selectedVehicle = { ...vehicle, isOwned };
  
  const owned = gameState.ownedVehicles.find(v => v.id === vehicleId);
  const condition = owned ? owned.condition : 100;
  
  elements.vehicleTitle.textContent = vehicle.name;
  elements.vehicleType.textContent = vehicle.type.toUpperCase();
  elements.vehiclePrice.textContent = `$${formatNumber(vehicle.price)}`;
  elements.vehicleComfort.textContent = vehicle.comfort > 0 ? `+${vehicle.comfort}` : '—';
  elements.vehicleStatus.textContent = vehicle.status > 0 ? `+${vehicle.status} REP` : '—';
  elements.vehicleCondition.textContent = `${Math.round(condition)}%`;
  elements.vehicleMonthlyCost.textContent = `$${formatNumber(vehicle.monthlyCost)}`;
  
  elements.buyVehicleBtn.classList.toggle('hidden', isOwned);
  elements.sellVehicleBtn.classList.toggle('hidden', !isOwned);
  
  elements.vehicleOverlay.classList.add('active');
}

function hideVehicleOverlay() {
  elements.vehicleOverlay.classList.remove('active');
  selectedVehicle = null;
}
