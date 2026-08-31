// ============================================================================
// contact-widget.js — Widget de Contacto: desplegable + copiar + WhatsApp.
// Migrado sin cambios funcionales desde el segundo <script> original.
// ============================================================================

import { contactToggle, contactPanel, contactCopyBtn, contactToast } from './dom.js';

(function(){
  var CONTACT_NUMBER = '+528123823090';

  // El panel usa position:fixed y vive fuera del hero (que tiene overflow:hidden),
  // así que su posición se calcula en JS a partir del botón cada vez que se abre.
  function positionContactPanel(){
    var rect = contactToggle.getBoundingClientRect();
    var margin = 12; // separación mínima respecto al borde de la pantalla
    var panelWidth = contactPanel.offsetWidth;
    var viewportWidth = document.documentElement.clientWidth;

    // Centro horizontal ideal: el centro del botón.
    var idealLeft = rect.left + rect.width / 2;

    // El panel se centra con translateX(-50%), así que su borde real queda
    // en (left - panelWidth/2) y (left + panelWidth/2). Estos límites evitan
    // que se corte contra los bordes de la pantalla en celulares, cuando el
    // botón está cerca del borde izquierdo o derecho del viewport.
    var minLeft = margin + panelWidth / 2;
    var maxLeft = viewportWidth - margin - panelWidth / 2;
    var left = Math.min(Math.max(idealLeft, minLeft), maxLeft);

    contactPanel.style.top = (rect.bottom + 10) + 'px';
    contactPanel.style.left = left + 'px';
  }

  function closeContactPanel(){
    contactPanel.classList.remove('open');
    contactToggle.classList.remove('active');
    contactToggle.setAttribute('aria-expanded', 'false');
  }

  if(contactToggle){
    contactToggle.addEventListener('click', function(e){
      e.stopPropagation();
      var willOpen = !contactPanel.classList.contains('open');
      if(willOpen) positionContactPanel();
      contactPanel.classList.toggle('open', willOpen);
      contactToggle.classList.toggle('active', willOpen);
      contactToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function(e){
    if(contactPanel && contactPanel.classList.contains('open') &&
       !contactPanel.contains(e.target) && !contactToggle.contains(e.target)){
      closeContactPanel();
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeContactPanel();
  });
  // Cierra el panel al hacer scroll para que no quede flotando lejos del botón
  // (es position:fixed, no se mueve solo con el contenido de la página).
  window.addEventListener('scroll', function(){
    if(contactPanel.classList.contains('open')) closeContactPanel();
  }, { passive: true });
  window.addEventListener('resize', function(){
    if(contactPanel.classList.contains('open')) closeContactPanel();
  });

  if(contactCopyBtn){
    contactCopyBtn.addEventListener('click', function(){
      function showToast(){
        contactToast.classList.add('show');
        setTimeout(function(){ contactToast.classList.remove('show'); }, 1800);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(CONTACT_NUMBER).then(showToast, function(){
          // Alternativa si el navegador bloquea la API async del portapapeles
          fallbackCopy(CONTACT_NUMBER);
          showToast();
        });
      } else {
        fallbackCopy(CONTACT_NUMBER);
        showToast();
      }
    });
  }

  function fallbackCopy(text){
    var tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    try{ document.execCommand('copy'); }catch(err){}
    document.body.removeChild(tmp);
  }
})();
    
