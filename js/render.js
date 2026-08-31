// ============================================================================
// render.js — Renderizado del panel, tarjetas, contadores [N] y modal de
// ficha técnica del Libro de colección.
// Migrado sin cambios funcionales desde el <script> original.
// ============================================================================

import {
  RARITY_EN, RARITY_ES, LC_CAT_LABELS, LC_SUB_LABELS, LC_ROLE_ES,
  LC_DATA, LC_FLAT_INDEX, RARITY_TIER, HERO_ROLES, lcState, lcModalState
} from './state.js';
import {
  rarityMatchesFilter, statusMatchesFilter, textMatchesQuery,
  getItemsForCurrentSelection
} from './filters.js';
import {
  lcPanel, lcSearchInputBook, lcCatButtons, lcSubButtons,
  lcModalOverlay, lcModalClose, lcModalBand, lcModalRarityTag, lcModalMedia,
  lcModalName, lcModalRole, lcModalStats, lcModalPrev, lcModalNext
} from './dom.js';

// ---------- Generador de ficha ilustrativa (Daño/Impacto/Durabilidad/Recarga o Perk) ----------
// No existen datos reales de perks/estadísticas por objeto todavía, así que se
// deriva un set ilustrativo y estable (mismo objeto = mismos valores) a partir
// de su rareza, para dejar la interfaz del modal 100% lista sin inventar cifras
// oficiales de un objeto real.
function lcStatsHtml(it){
  var tier = RARITY_TIER[it.rarity] || 1;
  if(HERO_ROLES[it.role]){
    return '<h4>Ventaja de Héroe</h4>' +
      '<p class="lc-modal-perk-text">Ficha de ' + LC_ROLE_ES[it.role] + ' de rareza ' + RARITY_ES[it.rarity] +
      '. Su ventaja principal (Hero Perk) y el detalle de su set de equipo se completarán cuando se integre la base de datos real de perks.</p>';
  }
  var isTrap = /Trap$/.test(it.role);
  var damage = tier * (isTrap ? 12 : 12);
  var impact = Math.round(tier * 8.5);
  var durability = isTrap ? tier * 90 : null;
  var reload = (isTrap ? (3.2 - tier * 0.35) : (1.6 - tier * 0.15)).toFixed(2);
  var rows =
    '<div class="lc-modal-stat-row"><span>Daño</span><span>' + damage + '</span></div>' +
    '<div class="lc-modal-stat-row"><span>Impacto</span><span>' + impact + '</span></div>';
  if(durability){
    rows += '<div class="lc-modal-stat-row"><span>Durabilidad</span><span>' + durability + '</span></div>';
  }
  rows += '<div class="lc-modal-stat-row"><span>Tiempo de recarga</span><span>' + reload + 's</span></div>';
  return '<h4>Estadísticas base</h4>' + rows;
}

// ---------- Conteo dinámico para los badges [N] ----------
function lcCountFor(catKey, subKey){
  return LC_FLAT_INDEX.filter(function(it){
    if(it.catKey !== catKey) return false;
    if(subKey != null && it.subKey !== subKey) return false;
    if(!rarityMatchesFilter(it.rarity, lcState.rarityFilter)) return false;
    if(!statusMatchesFilter(it.registered, lcState.statusFilter)) return false;
    if(lcState.query && !textMatchesQuery(it, lcState.query)) return false;
    return true;
  }).length;
}

function lcSetBadge(container, count){
  var badge = container.querySelector('.lc-count-badge');
  if(!badge){
    badge = document.createElement('span');
    badge.className = 'lc-count-badge';
    container.appendChild(badge);
  }
  badge.textContent = '[' + count + ']';
}

export function updateCounters(){
  lcCatButtons.forEach(function(btn){
    var catKey = btn.getAttribute('data-cat');
    var labelEl = btn.querySelector('.lc-menu-label-top') || btn.querySelector('span');
    if(labelEl) lcSetBadge(labelEl, lcCountFor(catKey, null));
  });
  lcSubButtons.forEach(function(btn){
    var catKey = btn.getAttribute('data-cat');
    var subKey = btn.getAttribute('data-sub');
    lcSetBadge(btn, lcCountFor(catKey, subKey));
  });
}

function mediaSlotMarkup(){
  return '<div class="card-media-slot">' +
      '<span class="media-slot-fallback" aria-hidden="true">' +
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5.2-5.2a2 2 0 0 0-2.8 0L3 19"/>' +
        '</svg>' +
      '</span>' +
    '</div>';
}

function cardMarkup(it){
  var enRarity = RARITY_EN[it.rarity] || '';
  var pendingClass = it.registered ? '' : ' is-pending';
  return '' +
    '<div class="lc-card rarity-' + it.rarity + pendingClass + '" data-item-id="' + it.id + '" tabindex="0" role="button" aria-label="Ver ficha de ' + it.name + '">' +
      '<span class="lc-card-status">' + (it.registered ? '✅' : '🔒') + '</span>' +
      mediaSlotMarkup() +
      '<h4 class="lc-card-name">' + it.name + '</h4>' +
      '<p class="lc-card-role">' + enRarity + ' ' + it.role + '</p>' +
      '<span class="lc-rarity-tag">' + RARITY_ES[it.rarity] + '</span>' +
    '</div>';
}

export function renderPanel(){
  updateCounters();
  var baseItems = getItemsForCurrentSelection();
  var filtered = baseItems.filter(function(it){
    return rarityMatchesFilter(it.rarity, lcState.rarityFilter) && statusMatchesFilter(it.registered, lcState.statusFilter);
  });

  if(lcState.mode === 'empty'){
    lcPanel.innerHTML =
      '<div class="lc-empty" id="lcEmptyState">' +
        '<div class="lc-empty-icon">📚</div>' +
        '<p>Selecciona una categoría del Libro de colección para explorar sus esquemas y personajes.</p>' +
      '</div>';
    return;
  }

  var titleHtml;
  if(lcState.mode === 'search'){
    titleHtml = '<h3>Resultados para «' + (lcSearchInputBook ? lcSearchInputBook.value.trim() : '') + '»</h3>';
  } else {
    var catLabel = LC_CAT_LABELS[lcState.catKey] || '';
    var subLabel = lcState.subKey ? (LC_SUB_LABELS[lcState.subKey] || '') : '';
    titleHtml = '<h3>' + catLabel + (subLabel ? ' <span class="lc-breadcrumb-sub">/ ' + subLabel + '</span>' : '') + '</h3>';
  }

  var countLabel = filtered.length + (filtered.length === 1 ? ' elemento' : ' elementos');
  var html = '<div class="lc-panel-title">' + titleHtml + '<span class="lc-result-count">' + countLabel + '</span></div>';

  if(filtered.length === 0){
    if(baseItems.length === 0 && lcState.mode === 'category'){
      var label = lcState.subKey ? (LC_SUB_LABELS[lcState.subKey] || '') : (LC_CAT_LABELS[lcState.catKey] || '');
      html +=
        '<div class="lc-soon">' +
          '<div class="lc-empty-icon">🗂️</div>' +
          '<p><strong>' + label + '</strong><br>Esta subcategoría se completará próximamente con la base de datos completa de objetos.</p>' +
        '</div>';
    } else {
      html += '<div class="lc-no-results">No se encontraron elementos con los filtros actuales.</div>';
    }
    lcPanel.innerHTML = html;
    return;
  }

  html += '<div class="lc-item-grid">';
  filtered.forEach(function(it){ html += cardMarkup(it); });
  html += '</div>';

  if(lcState.mode === 'category'){
    html += '<p class="lc-demo-note">Estructura lista para recibir imágenes reales de cada objeto.</p>';
  }

  lcPanel.innerHTML = html;

  // Guarda la lista filtrada actual para la navegación Anterior/Siguiente del modal
  lcModalState.list = filtered;

  lcPanel.querySelectorAll('.lc-card').forEach(function(cardEl){
    cardEl.addEventListener('click', function(){ openModalById(cardEl.getAttribute('data-item-id')); });
    cardEl.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModalById(cardEl.getAttribute('data-item-id')); }
    });
  });
}

// ---------- Modal de ficha técnica ----------
export function renderModal(it){
  lcModalBand.className = 'lc-modal-band rarity-' + it.rarity;
  lcModalRarityTag.className = 'lc-rarity-tag rarity-' + it.rarity;
  lcModalRarityTag.textContent = RARITY_ES[it.rarity];
  lcModalMedia.innerHTML =
    '<span class="media-slot-fallback" aria-hidden="true">' +
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5.2-5.2a2 2 0 0 0-2.8 0L3 19"/>' +
      '</svg>' +
    '</span>';
  lcModalMedia.setAttribute('data-item-id', it.id);
  lcModalName.textContent = it.name;
  lcModalRole.textContent = LC_ROLE_ES[it.role] ? (LC_ROLE_ES[it.role] + ' ' + RARITY_ES[it.rarity]) : (RARITY_ES[it.rarity] + ' ' + it.role);
  lcModalStats.innerHTML = lcStatsHtml(it);

  lcModalPrev.disabled = lcModalState.index <= 0;
  lcModalNext.disabled = lcModalState.index >= lcModalState.list.length - 1;
}

export function openModalById(id){
  var idx = lcModalState.list.findIndex(function(it){ return it.id === id; });
  if(idx === -1) return;
  lcModalState.index = idx;
  renderModal(lcModalState.list[idx]);
  lcModalOverlay.classList.add('open');
  lcModalClose.focus();
}

export function closeModal(){
  lcModalOverlay.classList.remove('open');
}
