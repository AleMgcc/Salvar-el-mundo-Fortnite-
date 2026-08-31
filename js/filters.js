// ============================================================================
// filters.js — Lógica de filtrado y selección de ítems del Libro de colección.
// Migrado sin cambios funcionales desde el <script> original.
// ============================================================================

import { LC_DATA, LC_FLAT_INDEX, LC_CAT_LABELS, LC_SUB_LABELS, lcState } from './state.js';

export function rarityMatchesFilter(rarity, filter){
  if(filter === 'all') return true;
  if(filter === 'legendary-mythic') return rarity === 'legendario' || rarity === 'mitico';
  return rarity === filter;
}

export function statusMatchesFilter(registered, filter){
  if(filter === 'all') return true;
  if(filter === 'registered') return registered === true;
  return registered === false;
}

export function textMatchesQuery(it, q){
  if(!q) return true;
  var haystack = [
    it.name, it.role,
    LC_SUB_LABELS[it.subKey] || '', LC_CAT_LABELS[it.catKey] || '',
    it.subKey || '', it.catKey || ''
  ].join(' ').toLowerCase();
  return haystack.indexOf(q) !== -1;
}

// ---------- Selección de items visibles ----------
export function getItemsForCurrentSelection(){
  if(lcState.mode === 'search'){
    return LC_FLAT_INDEX.filter(function(it){ return textMatchesQuery(it, lcState.query); });
  }
  if(lcState.mode === 'category'){
    return LC_FLAT_INDEX.filter(function(it){
      if(it.catKey !== lcState.catKey) return false;
      if(lcState.subKey && it.subKey !== lcState.subKey) return false;
      if(!lcState.subKey && LC_DATA[lcState.catKey].subcats) return false;
      return true;
    });
  }
  return [];
}

export function getFilteredItems(){
  return getItemsForCurrentSelection().filter(function(it){
    return rarityMatchesFilter(it.rarity, lcState.rarityFilter) && statusMatchesFilter(it.registered, lcState.statusFilter);
  });
}
