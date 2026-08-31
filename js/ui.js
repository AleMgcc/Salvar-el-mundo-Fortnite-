// ============================================================================
// ui.js — Fondo animado (canvas), tabs principales, acordeón, scroll-reveal,
// calculadora de elementos y buscador principal de la topbar.
// Migrado sin cambios funcionales desde el primer <script> original.
// (El simulador de perks de trampas se migró aparte a traps-simulator.js)
// ============================================================================

// ---- Fondo de niebla/partículas de la Tormenta (canvas) ----
var canvas = document.getElementById('fogCanvas');
var ctx = canvas.getContext('2d');
var particles = [];
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function makeParticle(){
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 200,
    r: 60 + Math.random() * 140,
    speed: 0.15 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 0.3,
    hue: Math.random() > 0.5 ? 'rgba(124,58,237,' : 'rgba(255,140,46,',
    alpha: 0.02 + Math.random() * 0.05
  };
}
var count = window.innerWidth < 700 ? 14 : 26;
for(var i=0;i<count;i++){ particles.push(makeParticle()); }

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(function(p){
    p.y -= p.speed;
    p.x += p.drift;
    if(p.y < -p.r){ Object.assign(p, makeParticle()); p.y = canvas.height + p.r; }
    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    grad.addColorStop(0, p.hue + p.alpha + ')');
    grad.addColorStop(1, p.hue + '0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  });
  if(!reduceMotion){ requestAnimationFrame(tick); }
}
if(!reduceMotion){ requestAnimationFrame(tick); } else { tick(); }

// ---- Tabs ----
var tabs = document.querySelectorAll('.tab-btn');
var panels = document.querySelectorAll('.panel');
tabs.forEach(function(btn){
  btn.addEventListener('click', function(){
    tabs.forEach(function(b){ b.classList.remove('active'); });
    panels.forEach(function(p){ p.classList.remove('active'); });
    btn.classList.add('active');
    var target = document.getElementById(btn.getAttribute('data-target'));
    if(target){ target.classList.add('active'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(observeReveals);
  });
});

// ---- Acordeón ----
document.querySelectorAll('.acc-header').forEach(function(header){
  header.addEventListener('click', function(){
    var item = header.closest('.acc-item');
    var panel = item.querySelector('.acc-panel');
    var isOpen = item.classList.contains('open');
    if(isOpen){
      panel.style.maxHeight = null;
      item.classList.remove('open');
    } else {
      item.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ---- Scroll reveal (IntersectionObserver) ----
var revealEls = document.querySelectorAll('.reveal');
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
export function observeReveals(){
  document.querySelectorAll('.hero .reveal:not(.in-view), .panel.active .reveal:not(.in-view)').forEach(function(el){ io.observe(el); });
}

// ---- Element calculator ----
var elemBtns = document.querySelectorAll('.elem-btn');
var result = document.getElementById('calcResult');
var recommendation = {
  fuego:      { rec: 'Agua 💧',       weak: 'El Fuego se apaga con Agua. Evita llevar armas de Naturaleza contra enemigos de Fuego.' },
  naturaleza: { rec: 'Fuego 🔥',      weak: 'La Naturaleza se quema con Fuego. Evita Agua, es poco eficaz aquí.' },
  agua:       { rec: 'Naturaleza 🌿', weak: 'El Agua es absorbida por la Naturaleza. Evita Fuego contra estos enemigos.' },
  energia:    { rec: 'Energía ⚡ o crítico', weak: 'La Energía no tiene una debilidad marcada: usa tu arma de mayor daño crítico o Energía como comodín seguro.' }
};
elemBtns.forEach(function(btn){
  btn.addEventListener('click', function(){
    elemBtns.forEach(function(b){ b.classList.remove('selected'); });
    btn.classList.add('selected');
    var el = btn.getAttribute('data-el');
    var data = recommendation[el];
    result.innerHTML =
      '<div class="rec-elem">Usa: ' + data.rec + '</div>' +
      '<p style="margin:0 0 4px;">contra un enemigo de <strong>' + btn.textContent.trim() + '</strong></p>' +
      '<div class="weak">' + data.weak + '</div>';
  });
});

// ---- Buscador colapsado a ícono: expandir/colapsar ----
var searchWrap = document.getElementById('searchWrap');
var searchToggleBtn = document.getElementById('searchToggleBtn');
var searchInputEl = document.getElementById('searchInput');

function collapseSearch(){
  searchWrap.classList.remove('expanded');
  searchToggleBtn.setAttribute('aria-expanded', 'false');
  if(searchInputEl.value !== ''){
    searchInputEl.value = '';
    searchInputEl.dispatchEvent(new Event('input'));
  }
}
function expandSearch(){
  searchWrap.classList.add('expanded');
  searchToggleBtn.setAttribute('aria-expanded', 'true');
  searchInputEl.focus();
}

if(searchToggleBtn){
  searchToggleBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(searchWrap.classList.contains('expanded')) collapseSearch();
    else expandSearch();
  });
}
document.addEventListener('click', function(e){
  if(searchWrap.classList.contains('expanded') && !searchWrap.contains(e.target)){
    collapseSearch();
  }
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && searchWrap.classList.contains('expanded')) collapseSearch();
});

// ---- Search filter: filtra tarjetas del acordeón y las abre automáticamente ----
var searchInput = document.getElementById('searchInput');
var noResults = document.getElementById('noResults');
searchInput.addEventListener('input', function(){
  var q = searchInput.value.trim().toLowerCase();

  if(q === ''){
    document.querySelectorAll('.acc-item').forEach(function(item){
      item.classList.remove('hidden-by-search');
    });
    noResults.style.display = 'none';
    return;
  }

  var anyMatch = false;
  var firstMatchPanel = null;

  document.querySelectorAll('.panel').forEach(function(panel){
    panel.querySelectorAll('.acc-item').forEach(function(item){
      var text = item.textContent.toLowerCase();
      var matches = text.indexOf(q) !== -1;
      item.classList.toggle('hidden-by-search', !matches);
      if(matches){
        anyMatch = true;
        if(!firstMatchPanel) firstMatchPanel = panel;
        var panelEl = item.querySelector('.acc-panel');
        if(!item.classList.contains('open')){
          item.classList.add('open');
          panelEl.style.maxHeight = panelEl.scrollHeight + 'px';
        }
      }
    });
  });

  if(firstMatchPanel){
    tabs.forEach(function(b){ b.classList.remove('active'); });
    panels.forEach(function(p){ p.classList.remove('active'); });
    firstMatchPanel.classList.add('active');
    var matchingTab = document.querySelector('.tab-btn[data-target="' + firstMatchPanel.id + '"]');
    if(matchingTab) matchingTab.classList.add('active');
    requestAnimationFrame(observeReveals);
  }

  noResults.style.display = anyMatch ? 'none' : 'block';
});
