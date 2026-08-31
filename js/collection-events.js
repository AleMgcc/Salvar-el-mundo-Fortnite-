// ============================================================================
// collection-events.js — Escuchadores de eventos del subnav "Más opciones",
// del acordeón de categorías, filtros, buscador y modal del Libro de colección.
// Migrado sin cambios funcionales desde el segundo <script> original.
// ============================================================================

import { lcState, lcModalState } from './state.js';
import { renderPanel, renderModal, closeModal } from './render.js';
import {
  subnavToggle, subnavStripWrap, subnavBtns, moContent, devCard, devCardTitle, lcWrap,
  lcSearchInputBook, lcSearchClear, lcFilterButtons, lcStatusButtons,
  lcMenuGroups, lcCatButtons, lcSubButtons,
  lcModalOverlay, lcModalClose, lcModalPrev, lcModalNext
} from './dom.js';

(function(){

  // ---------- Barra secundaria: apertura/cierre horizontal ----------

  // Oculta por completo el módulo "Más opciones" / Libro de colección:
  // retrae la tira horizontal, quita el estado activo de sus botones,
  // y cierra tanto el contenedor de contenido (#moContent) como el
  // Libro de colección y la tarjeta "Aún en desarrollo" que pudiera contener.
  function closeMoContent(){
    subnavStripWrap.classList.remove('open');
    subnavToggle.classList.remove('active');
    subnavToggle.setAttribute('aria-expanded', 'false');

    subnavBtns.forEach(function(b){ b.classList.remove('active'); });

    moContent.classList.remove('open');   // #moContent -> display:none (CSS)
    lcWrap.classList.remove('open');      // Libro de colección -> display:none (CSS)
    devCard.style.display = 'none';       // Tarjeta "Aún en desarrollo" -> oculta
  }

  if(subnavToggle){
    subnavToggle.addEventListener('click', function(){
      var willOpen = !subnavStripWrap.classList.contains('open');

      if(willOpen){
        // Abrir: solo despliega la tira horizontal. NO muestra contenido todavía.
        subnavStripWrap.classList.add('open');
        subnavToggle.classList.add('active');
        subnavToggle.setAttribute('aria-expanded', 'true');
      } else {
        // Cerrar: retrae la tira Y oculta por completo el Libro de colección
        // (o la tarjeta "Aún en desarrollo") si estuviera visible.
        closeMoContent();
      }
    });
  }

  var sectionLabels = {
    s2:'Sección 2', s3:'Sección 3', s4:'Sección 4', s5:'Sección 5', s6:'Sección 6',
    s7:'Sección 7', s8:'Sección 8', s9:'Sección 9', s10:'Sección 10'
  };

  subnavBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      subnavBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');

      var target = btn.getAttribute('data-mo-target');
      moContent.classList.add('open');

      if(target === 'libro'){
        lcWrap.classList.add('open');
        devCard.style.display = 'none';
      } else {
        lcWrap.classList.remove('open');
        devCard.style.display = 'flex';
        devCardTitle.textContent = (sectionLabels[target] || 'Esta sección') + ' — Aún en desarrollo';
      }

      moContent.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  // ---------- Integración con la barra de navegación PRINCIPAL ----------
  // Al elegir cualquier pestaña principal (Inicio, Héroes, Trampas, IA, etc.)
  // el módulo "Más opciones" / Libro de colección debe cerrarse de inmediato,
  // sin tocar el listener original de esas pestañas (solo se añade este extra).
  document.querySelectorAll('.tab-btn').forEach(function(mainTabBtn){
    mainTabBtn.addEventListener('click', function(){
      closeMoContent();
    });
  });

  // ======================================================================
  // LIBRO DE COLECCIÓN — navegación, filtros y modal
  // ======================================================================

  if(lcModalClose) lcModalClose.addEventListener('click', closeModal);
  if(lcModalOverlay){
    lcModalOverlay.addEventListener('click', function(e){
      if(e.target === lcModalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lcModalOverlay.classList.contains('open')) closeModal();
  });
  if(lcModalPrev){
    lcModalPrev.addEventListener('click', function(){
      if(lcModalState.index > 0){ lcModalState.index--; renderModal(lcModalState.list[lcModalState.index]); }
    });
  }
  if(lcModalNext){
    lcModalNext.addEventListener('click', function(){
      if(lcModalState.index < lcModalState.list.length - 1){ lcModalState.index++; renderModal(lcModalState.list[lcModalState.index]); }
    });
  }

  // ---------- Acordeón de categorías con subcarpetas ----------
  lcMenuGroups.forEach(function(group){
    var header = group.querySelector('.lc-menu-item[data-cat]');
    if(!header) return;
    header.addEventListener('click', function(){
      var willOpen = !group.classList.contains('open');

      lcMenuGroups.forEach(function(g){
        if(g !== group){
          g.classList.remove('open');
          var otherHeader = g.querySelector('.lc-menu-item[data-cat]');
          if(otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
          var otherSubmenu = g.querySelector('.lc-submenu');
          if(otherSubmenu) otherSubmenu.style.maxHeight = null;
        }
      });

      group.classList.toggle('open', willOpen);
      header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      var submenu = group.querySelector('.lc-submenu');
      if(submenu){ submenu.style.maxHeight = willOpen ? submenu.scrollHeight + 'px' : null; }
    });
  });

  // ---------- Selección de subcategoría ----------
  lcSubButtons.forEach(function(sub){
    sub.addEventListener('click', function(e){
      e.stopPropagation();
      lcSubButtons.forEach(function(s){ s.classList.remove('active'); });
      lcCatButtons.forEach(function(c){ c.classList.remove('active'); });
      sub.classList.add('active');

      if(lcSearchInputBook){ lcSearchInputBook.value = ''; }
      lcSearchClear.hidden = true;

      lcState.mode = 'category';
      lcState.catKey = sub.getAttribute('data-cat');
      lcState.subKey = sub.getAttribute('data-sub');
      lcState.query = '';
      renderPanel();
    });
  });

  // ---------- Categorías planas (sin subcarpetas: Packs, Eventos, Expansión) ----------
  lcCatButtons.forEach(function(btn){
    if(!btn.classList.contains('lc-menu-flat')) return;
    btn.addEventListener('click', function(){
      lcSubButtons.forEach(function(s){ s.classList.remove('active'); });
      lcCatButtons.forEach(function(c){ c.classList.remove('active'); });
      lcMenuGroups.forEach(function(g){
        g.classList.remove('open');
        var h = g.querySelector('.lc-menu-item[data-cat]');
        if(h) h.setAttribute('aria-expanded', 'false');
        var sm = g.querySelector('.lc-submenu');
        if(sm) sm.style.maxHeight = null;
      });
      btn.classList.add('active');

      if(lcSearchInputBook){ lcSearchInputBook.value = ''; }
      lcSearchClear.hidden = true;

      lcState.mode = 'category';
      lcState.catKey = btn.getAttribute('data-cat');
      lcState.subKey = null;
      lcState.query = '';
      renderPanel();
    });
  });

  // ---------- Filtros de rareza ----------
  lcFilterButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      lcFilterButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      lcState.rarityFilter = btn.getAttribute('data-rarity-filter');
      renderPanel();
    });
  });

  // ---------- Filtro de estado de registro ----------
  lcStatusButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      lcStatusButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      lcState.statusFilter = btn.getAttribute('data-status-filter');
      renderPanel();
    });
  });

  // ---------- Buscador global en tiempo real (nombre, rol y subcategoría) ----------
  if(lcSearchInputBook){
    lcSearchInputBook.addEventListener('input', function(){
      var raw = lcSearchInputBook.value.trim();
      lcSearchClear.hidden = raw === '';

      if(raw === ''){
        lcCatButtons.forEach(function(c){ c.classList.remove('active'); });
        lcSubButtons.forEach(function(s){ s.classList.remove('active'); });
        lcState.mode = 'empty';
        lcState.catKey = null;
        lcState.subKey = null;
        lcState.query = '';
        renderPanel();
        return;
      }

      lcCatButtons.forEach(function(c){ c.classList.remove('active'); });
      lcSubButtons.forEach(function(s){ s.classList.remove('active'); });

      lcState.mode = 'search';
      lcState.query = raw.toLowerCase();
      renderPanel();
    });
  }

  if(lcSearchClear){
    lcSearchClear.addEventListener('click', function(){
      lcSearchInputBook.value = '';
      lcSearchInputBook.dispatchEvent(new Event('input'));
      lcSearchInputBook.focus();
    });
  }

})();
