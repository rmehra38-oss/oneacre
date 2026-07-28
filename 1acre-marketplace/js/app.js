// ========================================================
// 1Acre - Main Application UI Controller & Interactive Engine
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  populateAllDistrictDropdowns();
  renderNavbarRoleSelector();
  setupGlobalModals();
});

// Auto populate all 22 Haryana Districts across select dropdowns
function populateAllDistrictDropdowns() {
  const districts = window.haryanaDistricts || [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", 
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", 
    "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", 
    "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ];
  
  const selectElements = document.querySelectorAll('#search-location, #filter-district, #prop-district, .haryana-district-select');
  selectElements.forEach(el => {
    const currentVal = el.value;
    const isRequiredProp = el.id === 'prop-district';
    let html = isRequiredProp ? '<option value="">Select District *</option>' : '<option value="">All Haryana Locations</option>';
    districts.forEach(d => {
      html += `<option value="${d}">${d}</option>`;
    });
    el.innerHTML = html;
    if (currentVal) el.value = currentVal;
  });
}

// Toast System
window.showToast = function(message, icon = 'check-circle') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="lucide-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
};

// Global Role Selector (Buyer / Seller / Admin)
function renderNavbarRoleSelector() {
  const currentRole = localStorage.getItem('1acre_current_role') || 'buyer';
  const roleSelectEl = document.getElementById('global-role-select');
  if (roleSelectEl) {
    roleSelectEl.value = currentRole;
    roleSelectEl.addEventListener('change', (e) => {
      localStorage.setItem('1acre_current_role', e.target.value);
      showToast(`Switched active portal role to: ${e.target.value.toUpperCase()}`);
      setTimeout(() => {
        if (e.target.value === 'seller') window.location.href = 'dashboard-seller.html';
        else if (e.target.value === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'dashboard-buyer.html';
      }, 500);
    });
  }
}

// Property Card Component Renderer
window.renderPropertyCard = function(prop) {
  const favs = window.db.getFavorites();
  const isFav = favs.includes(prop.id);

  return `
    <div class="property-card" id="card-${prop.id}">
      <div class="card-image-wrap">
        <img src="${prop.images && prop.images[0] ? prop.images[0] : 'assets/images/agriculture.jpg'}" alt="${prop.title}" class="card-image" onerror="this.src='assets/images/agriculture.jpg'">
        ${prop.verification_status ? `
          <div class="badge-verified badge-verified-gold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            1Acre Verified
          </div>
        ` : ''}
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFav('${prop.id}', event)" title="Save Property">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      
      <div class="card-content">
        <div class="card-price">
          ${prop.price_display || ('₹ ' + (prop.price / 10000000).toFixed(2) + ' Cr')}
        </div>
        <h3 class="card-title">${prop.title}</h3>
        <div class="card-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${prop.city}, ${prop.district}, Haryana
        </div>
        
        <div class="card-features">
          <div class="feature-item">
            <span class="feature-label">Size</span>
            <span class="feature-val">${prop.area} ${prop.unit}</span>
          </div>
          <div class="feature-item">
            <span class="feature-label">Type</span>
            <span class="feature-val">${prop.subcategory}</span>
          </div>
          <div class="feature-item">
            <span class="feature-label">Title</span>
            <span class="feature-val">${prop.registry_status ? 'Registry Clear' : 'Clear'}</span>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <a href="property-detail.html?id=${prop.id}" class="btn-primary" style="flex: 1; justify-content: center; font-size: 0.85rem; padding: 0.5rem;">View Details</a>
          <button onclick="openWhatsAppInquiry('${prop.title}', '${prop.id}')" class="btn-gold" style="padding: 0.5rem 0.75rem;" title="WhatsApp Inquiry">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.099 4.019 4.142-1.086z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

// Favorite Bookmark Toggle
window.toggleFav = function(id, event) {
  if (event) event.stopPropagation();
  const isNowFav = window.db.toggleFavorite(id);
  const btn = event ? event.currentTarget : null;
  if (btn) {
    if (isNowFav) {
      btn.classList.add('active');
      btn.querySelector('svg').setAttribute('fill', '#ef4444');
    } else {
      btn.classList.remove('active');
      btn.querySelector('svg').setAttribute('fill', 'none');
    }
  }
  showToast(isNowFav ? 'Property added to saved favorites!' : 'Removed from saved properties');
};

// WhatsApp Instant Lead Launcher
window.openWhatsAppInquiry = function(title, id) {
  const message = `Hello 1Acre Team, I am interested in the property: "${title}" (ID: ${id}). Please share more photos and location coordinates.`;
  const url = `https://wa.me/919812044550?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

// Modal Handler Setup
function setupGlobalModals() {
  window.openVisitModal = function(propId, propTitle) {
    const modal = document.getElementById('visit-modal');
    if (!modal) return;
    document.getElementById('modal-prop-id').value = propId;
    document.getElementById('modal-prop-title-text').innerText = propTitle;
    modal.classList.add('open');
  };

  window.closeVisitModal = function() {
    const modal = document.getElementById('visit-modal');
    if (modal) modal.classList.remove('open');
  };

  window.openInquiryModal = function(propId, propTitle) {
    const modal = document.getElementById('inquiry-modal');
    if (!modal) return;
    document.getElementById('inq-prop-id').value = propId;
    document.getElementById('inq-prop-title-text').innerText = propTitle;
    modal.classList.add('open');
  };

  window.closeInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.classList.remove('open');
  };
}
