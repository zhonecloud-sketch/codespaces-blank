// ===== STONKS 9800 - Stage 02 - Property System =====

function buyProperty(propertyId) {
  const property = PROPERTIES.find(p => p.id === propertyId);
  if (!property) return false;
  
  if (gameState.cash < property.price) {
    showEvent("Insufficient Funds", `Need $${formatNumber(property.price)} to purchase.`);
    return false;
  }
  
  // Check if already owned
  if (gameState.ownedProperties.some(p => p.id === propertyId)) {
    showEvent("Already Owned", "You already own this property.");
    return false;
  }
  
  gameState.cash -= property.price;
  gameState.ownedProperties.push({
    id: propertyId,
    purchasePrice: property.price,
    purchaseDay: getTotalDays(),
    condition: 100
  });
  
  gameState.reputation += 5;
  calculateComfort();
  hidePropertyOverlay();
  render();
  
  addNews(`Purchased ${property.name} for $${formatNumber(property.price)}`, 'life', null);
  return true;
}

function sellProperty(propertyId) {
  const idx = gameState.ownedProperties.findIndex(p => p.id === propertyId);
  if (idx === -1) return false;
  
  const owned = gameState.ownedProperties[idx];
  const property = PROPERTIES.find(p => p.id === propertyId);
  if (!property) return false;
  
  const sellPrice = Math.round(property.price * (owned.condition / 100) * 0.9); // 10% selling fee
  gameState.cash += sellPrice;
  gameState.ownedProperties.splice(idx, 1);
  
  calculateComfort();
  hidePropertyOverlay();
  render();
  
  addNews(`Sold ${property.name} for $${formatNumber(sellPrice)}`, 'life', null);
  return true;
}

function processRentalIncome() {
  let totalRent = 0;
  let totalMaintenance = 0;
  
  gameState.ownedProperties.forEach(owned => {
    const property = PROPERTIES.find(p => p.id === owned.id);
    if (property) {
      totalRent += property.rent;
      totalMaintenance += property.maintenance;
      
      // Condition decay
      owned.condition = Math.max(50, owned.condition - 0.5);
    }
  });
  
  const netIncome = totalRent - totalMaintenance;
  if (netIncome !== 0) {
    gameState.cash += netIncome;
    if (netIncome > 0) {
      addNews(`Property income: $${formatNumber(netIncome)} (rent - maintenance)`, 'positive', null);
    } else {
      addNews(`Property costs: $${formatNumber(Math.abs(netIncome))} (maintenance > rent)`, 'negative', null);
    }
  }
}

function showPropertyOverlay(propertyId, isOwned = false) {
  const property = PROPERTIES.find(p => p.id === propertyId);
  if (!property) return;
  
  selectedProperty = { ...property, isOwned };
  
  const owned = gameState.ownedProperties.find(p => p.id === propertyId);
  const condition = owned ? owned.condition : 100;
  
  elements.propertyTitle.textContent = property.name;
  elements.propertyType.textContent = property.type.toUpperCase();
  elements.propertyValue.textContent = `$${formatNumber(property.price)}`;
  elements.propertyRent.textContent = `$${formatNumber(property.rent)}/mo`;
  elements.propertyMaint.textContent = `$${formatNumber(property.maintenance)}/mo`;
  elements.propertyComfort.textContent = property.comfort > 0 ? `+${property.comfort}` : '—';
  elements.propertyCondition.textContent = `${Math.round(condition)}%`;
  
  elements.buyPropertyBtn.classList.toggle('hidden', isOwned);
  elements.sellPropertyBtn.classList.toggle('hidden', !isOwned);
  
  elements.propertyOverlay.classList.add('active');
}

function hidePropertyOverlay() {
  elements.propertyOverlay.classList.remove('active');
  selectedProperty = null;
}
