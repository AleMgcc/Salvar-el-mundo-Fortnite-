// ============================================================================
// dom.js — Referencias al DOM usadas por el módulo "Más opciones" / Libro de
// colección (contact-widget.js, collection-events.js, render.js).
// Migrado sin cambios funcionales desde el <script> original.
// ============================================================================

// ---------- Widget de Contacto ----------
export var contactToggle  = document.getElementById('contactToggle');
export var contactPanel   = document.getElementById('contactPanel');
export var contactCopyBtn = document.getElementById('contactCopyBtn');
export var contactToast   = document.getElementById('contactToast');

// ---------- Barra secundaria "Más opciones" ----------
export var subnavToggle    = document.getElementById('subnavToggle');
export var subnavStripWrap = document.getElementById('subnavStripWrap');
export var subnavBtns      = document.querySelectorAll('.subnav-btn');
export var moContent       = document.getElementById('moContent');
export var devCard         = document.getElementById('devCard');
export var devCardTitle    = document.getElementById('devCardTitle');
export var lcWrap          = document.getElementById('lcWrap');

// ---------- Referencias DOM del Libro de colección ----------
export var lcMenu            = document.getElementById('lcMenu');
export var lcPanel           = document.getElementById('lcPanel');
export var lcSearchInputBook = document.getElementById('lcSearchInput');
export var lcSearchClear     = document.getElementById('lcSearchClear');
export var lcFilterButtons   = document.querySelectorAll('.lc-filter-btn');
export var lcStatusButtons   = document.querySelectorAll('.lc-status-btn');
export var lcElementButtons  = document.querySelectorAll('.lc-element-btn');
export var lcMenuGroups      = document.querySelectorAll('.lc-menu-group');
export var lcCatButtons      = document.querySelectorAll('.lc-menu-item[data-cat]');
export var lcSubButtons      = document.querySelectorAll('.lc-submenu-item');

// ---------- Panel de nivel del Libro de colección (barra de XP) ----------
export var lcLevelFill       = document.getElementById('lcLevelFill');
export var lcLevelLabel      = document.getElementById('lcLevelLabel');
export var lcLevelPercent    = document.getElementById('lcLevelPercent');

// ---------- Referencias del modal ----------
export var lcModalOverlay    = document.getElementById('lcModalOverlay');
export var lcModalClose      = document.getElementById('lcModalClose');
export var lcModalFav        = document.getElementById('lcModalFav');
export var lcModalBand       = document.getElementById('lcModalBand');
export var lcModalRarityTag  = document.getElementById('lcModalRarityTag');
export var lcModalMedia      = document.getElementById('lcModalMedia');
export var lcModalName       = document.getElementById('lcModalName');
export var lcModalRole       = document.getElementById('lcModalRole');
export var lcModalTabs       = document.querySelectorAll('.lc-modal-tab');
export var lcModalTabFicha   = document.getElementById('lcModalTabFicha');
export var lcModalTabPerks   = document.getElementById('lcModalTabPerks');
export var lcModalTabCalc    = document.getElementById('lcModalTabCalc');
export var lcModalStats      = document.getElementById('lcModalStats');
export var lcModalPerks      = document.getElementById('lcModalPerks');
export var lcModalCalc       = document.getElementById('lcModalCalc');
export var lcModalPrev       = document.getElementById('lcModalPrev');
export var lcModalNext       = document.getElementById('lcModalNext');
