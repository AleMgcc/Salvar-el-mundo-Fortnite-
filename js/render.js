// ============================================================================
// render.js — Renderizado del panel, tarjetas, barra de nivel, contadores [N]
// y modal de ficha técnica (con pestañas: Ficha / Perks / Calculadora) del
// Libro de colección.
// ============================================================================

import {
  RARITY_EN, RARITY_ES, ELEMENT_ES, ELEMENT_ICON, LC_CAT_LABELS, LC_SUB_LABELS, LC_ROLE_ES,
  LC_DATA, LC_FLAT_INDEX, HERO_ROLES, lcState, lcModalState,
  lcPlayerResources, toggleRegisterStatus, toggleFavorite, saveResources
} from './state.js';
import {
  rarityMatchesFilter, statusMatchesFilter, elementMatchesFilter, textMatchesQuery,
  getItemsForCurrentSelection
} from './filters.js';
import {
  lcPanel, lcSearchInputBook, lcCatButtons, lcSubButtons,
  lcLevelFill, lcLevelLabel, lcLevelPercent,
  lcModalOverlay, lcModalClose, lcModalFav, lcModalBand, lcModalRarityTag, lcModalMedia,
  lcModalName, lcModalRole, lcModalTabs, lcModalStats, lcModalPerks, lcModalCalc,
  lcModalPrev, lcModalNext
} from './dom.js';

// ---------- Barra de nivel del Libro de colección (XP global) ----------
export function updateLevelPanel(){
  var total = LC_FLAT_INDEX.length;
  var done = LC_FLAT_INDEX.filter(function(it){ return it.registered; }).length;
  var pct = total ? Math.round((done / total) * 100) : 0;
  if(lcLevelFill) lcLevelFill.style.width = pct + '%';
  if(lcLevelPercent) lcLevelPercent.textContent = pct + '%';
  if(lcLevelLabel) lcLevelLabel.textContent = done + ' / ' + total + ' objetos registrados';
}

// ---------- Conteo dinámico para los badges [N] ----------
function lcCountFor(catKey, subKey){
  return LC_FLAT_INDEX.filter(function(it){
    if(it.catKey !== catKey) return false;
    if(subKey != null && it.subKey !== subKey) return false;
    if(!rarityMatchesFilter(it.rarity, lcState.rarityFilter)) return false;
    if(!statusMatchesFilter(it.registered, lcState.statusFilter)) return false;
    if(!elementMatchesFilter(it.element, lcState.elementFilter)) return false;
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
  var elIcon = ELEMENT_ICON[it.element] || '';
  return '' +
    '<div class="lc-card rarity-' + it.rarity + pendingClass + '" data-item-id="' + it.id + '" tabindex="0" role="button" aria-label="Ver ficha de ' + it.name + '">' +
      '<button type="button" class="lc-card-register-btn" data-item-id="' + it.id + '" title="' + (it.registered ? 'Marcar como pendiente' : 'Marcar como registrado') + '" aria-label="' + (it.registered ? 'Marcar como pendiente' : 'Marcar como registrado') + '">' + (it.registered ? '✅' : '🔒') + '</button>' +
      (elIcon !== ELEMENT_ICON['ninguno'] ? '<span class="lc-card-element" title="' + ELEMENT_ES[it.element] + '">' + elIcon + '</span>' : '') +
      mediaSlotMarkup() +
      '<h4 class="lc-card-name">' + it.name + '</h4>' +
      '<p class="lc-card-role">' + enRarity + ' ' + it.role + '</p>' +
      '<span class="lc-rarity-tag">' + RARITY_ES[it.rarity] + '</span>' +
    '</div>';
}

export function renderPanel(){
  updateCounters();
  updateLevelPanel();
  var baseItems = getItemsForCurrentSelection();
  var filtered = baseItems.filter(function(it){
    return rarityMatchesFilter(it.rarity, lcState.rarityFilter) &&
           statusMatchesFilter(it.registered, lcState.statusFilter) &&
           elementMatchesFilter(it.element, lcState.elementFilter);
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
    html += '<p class="lc-demo-note">Toca el candado de una tarjeta para marcarla como registrada, o ábrela para ver su ficha completa.</p>';
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

  lcPanel.querySelectorAll('.lc-card-register-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var it = toggleRegisterStatus(btn.getAttribute('data-item-id'));
      if(!it) return;
      renderPanel();
      if(lcModalOverlay.classList.contains('open') && lcModalState.list[lcModalState.index] && lcModalState.list[lcModalState.index].id === it.id){
        renderModal(it);
      }
    });
  });
}

// ---------- Ficha técnica: estadísticas reales según tipo de objeto ----------
function statRow(label, value){
  if(value === undefined || value === null || value === '') return '';
  return '<div class="lc-modal-stat-row"><span>' + label + '</span><span>' + value + '</span></div>';
}

function lcStatsHtml(it){
  var s = it.stats || {};
  var rows = '';
  if(HERO_ROLES[it.role]){
    rows += statRow('Salud base', s.salud);
    rows += statRow('Escudo base', s.escudo);
    rows += statRow('Modificador de daño de habilidad', s.danoHabilidad ? ('x' + s.danoHabilidad) : null);
  } else if(it.role === 'Survivor'){
    rows += statRow('Bono de salud', s.bonoSalud);
    rows += statRow('Bono de fabricación', s.bonoFabricacion);
  } else {
    rows += statRow('Daño', s.dano);
    rows += statRow('Impacto', s.impacto);
    rows += statRow('Durabilidad', s.durabilidad);
    rows += statRow('Tamaño de cargador', s.tamanoCargador);
    rows += statRow('Cadencia de tiro (disparos/seg)', s.cadencia);
    rows += statRow('Tiempo de recarga', s.recarga ? (s.recarga + 's') : null);
    rows += statRow('Alcance', s.alcance);
  }
  if(!rows) rows = '<p class="lc-modal-perk-text">Esta ficha aún no tiene estadísticas de combate registradas.</p>';
  return '<h4>Estadísticas base</h4>' + rows +
    '<p class="lc-modal-illustrative">Valores de referencia a nivel/esquema base — escalan con el nivel del objeto y del jugador.</p>';
}

// ---------- Perks & God Rolls ----------
function lcPerksHtml(it){
  var p = it.perks || {};
  if(HERO_ROLES[it.role] || it.role === 'Survivor'){
    var html = '<h4>Ventajas de Héroe</h4>';
    if(p.estandar) html += '<div class="lc-perk-block"><span class="lc-perk-tag">Estándar</span><p class="lc-modal-perk-text">' + p.estandar + '</p></div>';
    if(p.comandante) html += '<div class="lc-perk-block"><span class="lc-perk-tag lc-perk-tag-cmd">Comandante</span><p class="lc-modal-perk-text">' + p.comandante + '</p></div>';
    if(!p.estandar && !p.comandante) html += '<p class="lc-modal-perk-text">Perks pendientes de documentar.</p>';
    return html;
  }
  var combo = p.combinacionIdeal ? p.combinacionIdeal.split('/').map(function(s){ return s.trim(); }) : [];
  var html2 = '<h4>Combinación ideal / God Roll</h4>';
  if(combo.length){
    html2 += '<ol class="lc-perk-slots">' + combo.map(function(perk){ return '<li>' + perk + '</li>'; }).join('') + '</ol>';
  } else {
    html2 += '<p class="lc-modal-perk-text">Combinación ideal pendiente de documentar.</p>';
  }
  return html2;
}

// ---------- Calculadora de reclutamiento ----------
function calcRow(resourceKey, label, needed){
  var have = lcPlayerResources[resourceKey] || 0;
  var missing = Math.max(0, needed - have);
  var ok = have >= needed;
  return '' +
    '<div class="lc-calc-row ' + (ok ? 'is-ok' : 'is-missing') + '">' +
      '<div class="lc-calc-row-top"><span>' + label + '</span><span class="lc-calc-needed">' + needed + ' necesarios</span></div>' +
      '<div class="lc-calc-row-bottom">' +
        '<label>Tienes: <input type="number" min="0" class="lc-calc-input" data-resource="' + resourceKey + '" value="' + have + '"></label>' +
        '<span class="lc-calc-status">' + (ok ? '✅ Completo' : '⚠️ Faltan ' + missing) + '</span>' +
      '</div>' +
    '</div>';
}

function lcCalcHtml(it){
  var c = it.cost || { flux:0, manuales:0, gotasPurificadas:0 };
  var rows = calcRow('flux', 'Flux', c.flux) + calcRow('manuales', 'Manuales de Entrenamiento/Diseño', c.manuales) + calcRow('gotasPurificadas', 'Gotas Purificadas', c.gotasPurificadas);
  var canAfford = (lcPlayerResources.flux || 0) >= c.flux && (lcPlayerResources.manuales || 0) >= c.manuales && (lcPlayerResources.gotasPurificadas || 0) >= c.gotasPurificadas;
  return '<h4>Costo de reclutamiento</h4>' + rows +
    '<p class="lc-calc-result ' + (canAfford ? 'can-afford' : 'cant-afford') + '">' +
      (canAfford ? '✅ Tienes lo necesario para sacar este objeto del Libro de colección.' : '⚠️ Aún te faltan recursos para reclutar este objeto.') +
    '</p>' +
    '<p class="lc-modal-illustrative">Edita tus recursos actuales arriba — se guardan automáticamente para el resto del Libro de colección.</p>';
}

// ---------- Modal de ficha técnica ----------
export function renderModal(it){
  lcModalBand.className = 'lc-modal-band rarity-' + it.rarity;
  lcModalRarityTag.className = 'lc-rarity-tag rarity-' + it.rarity;
  lcModalRarityTag.textContent = RARITY_ES[it.rarity] + (it.element !== 'ninguno' ? ' · ' + ELEMENT_ICON[it.element] + ' ' + ELEMENT_ES[it.element] : '');
  lcModalMedia.innerHTML =
    '<span class="media-slot-fallback" aria-hidden="true">' +
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="1.8"/><path d="M21 15l-5.2-5.2a2 2 0 0 0-2.8 0L3 19"/>' +
      '</svg>' +
    '</span>';
  lcModalMedia.setAttribute('data-item-id', it.id);
  lcModalName.textContent = it.name;
  lcModalRole.textContent = (LC_ROLE_ES[it.role] || it.role) + ' · ' + (it.lore || '');

  if(lcModalFav){
    lcModalFav.textContent = it.isFavorite ? '⭐' : '☆';
    lcModalFav.setAttribute('data-item-id', it.id);
    lcModalFav.setAttribute('aria-pressed', it.isFavorite ? 'true' : 'false');
  }

  lcModalStats.innerHTML = lcStatsHtml(it);
  lcModalPerks.innerHTML = lcPerksHtml(it);
  lcModalCalc.innerHTML = lcCalcHtml(it);

  applyModalTab(lcModalState.activeTab);

  lcModalPrev.disabled = lcModalState.index <= 0;
  lcModalNext.disabled = lcModalState.index >= lcModalState.list.length - 1;
}

export function applyModalTab(tabKey){
  lcModalState.activeTab = tabKey;
  lcModalTabs.forEach(function(tabBtn){
    tabBtn.classList.toggle('active', tabBtn.getAttribute('data-tab') === tabKey);
  });
  [ ['ficha', lcModalStats], ['perks', lcModalPerks], ['calculadora', lcModalCalc] ].forEach(function(pair){
    pair[1].classList.toggle('active', pair[0] === tabKey);
  });
}

export function openModalById(id){
  var idx = lcModalState.list.findIndex(function(it){ return it.id === id; });
  if(idx === -1) return;
  lcModalState.index = idx;
  lcModalState.activeTab = 'ficha';
  renderModal(lcModalState.list[idx]);
  lcModalOverlay.classList.add('open');
  lcModalClose.focus();
}

export function closeModal(){
  lcModalOverlay.classList.remove('open');
}

export { toggleFavorite, saveResources };
  
