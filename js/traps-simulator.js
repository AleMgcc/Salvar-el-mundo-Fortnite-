// ============================================================================
// traps-simulator.js — Simulador de perks de trampas (dropdowns personalizados
// + cálculo de durabilidad/recarga/daño).
// Migrado sin cambios funcionales desde el primer <script> original
// (sub-IIFE "Simulador de Perks de Trampas").
// ============================================================================

(function(){
  var trapSelect = document.getElementById('tcTrapSelect');
  var perkSelects = Array.prototype.slice.call(document.querySelectorAll('.tc-perk-select'));
  var resetBtn = document.getElementById('tcResetBtn');
  if(!trapSelect || !perkSelects.length) return;

  // Dropdowns personalizados: no usamos <select>, por lo que Android/iOS nunca abre
  // el selector nativo blanco del sistema. La lógica del simulador sigue usando valores simples.
  var dropdowns = [];
  var openDropdown = null;

  function getValue(el){ return el.getAttribute('data-value') || 'none'; }

  function closeDropdown(el){
    if(!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-expanded','false');
    if(openDropdown === el) openDropdown = null;
  }

  function closeAllDropdowns(except){
    dropdowns.forEach(function(d){ if(d !== except) closeDropdown(d); });
  }

  function setValue(el, value, emit){
    el.setAttribute('data-value', value);
    var option = el.querySelector('.tc-option[data-value="' + value + '"]');
    var valueEl = el.querySelector('.tc-custom-value');
    if(option && valueEl) valueEl.textContent = option.textContent.trim();
    el.querySelectorAll('.tc-option').forEach(function(opt){
      var selected = opt.getAttribute('data-value') === value;
      opt.classList.toggle('selected', selected);
      opt.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    if(emit){
      el.dispatchEvent(new CustomEvent('tc-change', {detail:{value:value}, bubbles:false}));
    }
  }

  function updateDisabledOptions(){
    var chosen = perkSelects.map(getValue).filter(function(v){ return v !== 'none'; });
    perkSelects.forEach(function(sel){
      var current = getValue(sel);
      sel.querySelectorAll('.tc-option').forEach(function(opt){
        var v = opt.getAttribute('data-value');
        var disabled = v !== 'none' && chosen.indexOf(v) !== -1 && v !== current;
        opt.classList.toggle('disabled', disabled);
        opt.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      });
    });
  }

  function setupDropdown(el){
    var trigger = el.querySelector('.tc-custom-trigger');
    if(!trigger) return;
    dropdowns.push(el);
    setValue(el, getValue(el), false);

    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if(el.classList.contains('open')) closeDropdown(el);
      else {
        closeAllDropdowns(el);
        updateDisabledOptions();
        el.classList.add('open');
        el.setAttribute('aria-expanded','true');
        openDropdown = el;
      }
    });

    el.querySelectorAll('.tc-option').forEach(function(option){
      option.addEventListener('click', function(e){
        e.stopPropagation();
        if(option.classList.contains('disabled')) return;
        setValue(el, option.getAttribute('data-value'), true);
        closeDropdown(el);
        updateDisabledOptions();
      });
    });

    el.addEventListener('keydown', function(e){
      if(e.key === 'Escape') { closeDropdown(el); trigger.focus(); return; }
      if((e.key === 'Enter' || e.key === ' ') && document.activeElement === el){
        e.preventDefault(); trigger.click();
      }
    });
  }

  document.querySelectorAll('.tc-custom-select').forEach(setupDropdown);
  document.addEventListener('click', function(){ closeAllDropdowns(null); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAllDropdowns(null); });

  // Valores base ilustrativos por trampa: durabilidad (HP), recarga (s), daño/impacto por uso.
  var TRAPS = {
    // Pared
    lanzador:     { label: 'Lanzador de Pared',           durability: 500, reload: 1.5,  damage: 15 },
    dardos:       { label: 'Dardos de Pared',             durability: 300, reload: 0.75, damage: 35 },
    dinamo_pared: { label: 'Dínamo de Pared (Eléctrica)', durability: 350, reload: 1.0,  damage: 40 },
    // Techo
    electrico:    { label: 'Campo Eléctrico de Techo',    durability: 350, reload: 0.5,  damage: 50 },
    zapper_techo: { label: 'Zapper de Techo',             durability: 300, reload: 0.6,  damage: 45 },
    // Suelo / Piso
    alquitran:    { label: 'Trampa de Alquitrán',         durability: 400, reload: 3.0,  damage: 5  },
    puas_suelo:   { label: 'Trampa de Púas de Suelo',     durability: 450, reload: 1.2,  damage: 30 },
    fuego_suelo:  { label: 'Parrilla de Fuego de Piso',   durability: 400, reload: 1.5,  damage: 60 },
    gas:          { label: 'Trampa de Gas',               durability: 250, reload: 2.0,  damage: 20 },
    congelacion:  { label: 'Trampa de Congelación',       durability: 300, reload: 2.5,  damage: 10 },
    dano_suelo:   { label: 'Trampa de Daño',              durability: 350, reload: 1.0,  damage: 25 }
  };

  // Efecto de cada perk. En una trampa Legendaria (Nivel 130) real cada una de las 5 ranuras
  // aloja un perk DISTINTO: no pueden repetirse dentro de la misma trampa.
  var PERKS = {
    recarga:     { tag: 'purple', label: '+ Velocidad de recarga', reloadMult: 0.85 },
    impacto:     { tag: 'fire',   label: '+ Impacto',              damageMult: 1.25 },
    durabilidad: { tag: 'water',  label: '+ Durabilidad',          durabilityFlat: 150 },
    dano:        { tag: 'gold',   label: '+ Daño',                 damageMult: 1.20 },
    estructura:  { tag: 'nature', label: '+ Vida de estructura',   structureFlat: 200 }
  };

  var elDurability = document.getElementById('tcDurability');
  var elReload = document.getElementById('tcReload');
  var elDamage = document.getElementById('tcDamage');
  var elSummary = document.getElementById('tcSummary');
  var elStructureNote = document.getElementById('tcStructureNote');
  var elStructureValue = document.getElementById('tcStructureValue');

  function enforceUniquePerks(){ updateDisabledOptions(); }

  function calculate(){
    enforceUniquePerks();

    var trap = TRAPS[getValue(trapSelect)];
    // Algunas trampas del selector son extensiones del catálogo visual y no tienen
    // estadísticas base en este simulador; mantienen valores seguros para no romperlo.
    if(!trap) trap = {durability:500, reload:1.5, damage:15};
    var durability = trap.durability;
    var reload = trap.reload;
    var damage = trap.damage;
    var structureBonus = 0;
    var counts = {};

    perkSelects.forEach(function(sel){
      var v = getValue(sel);
      if(v === 'none') return;
      counts[v] = (counts[v] || 0) + 1;
    });

    if(counts.durabilidad) durability += counts.durabilidad * PERKS.durabilidad.durabilityFlat;
    if(counts.recarga) reload *= Math.pow(PERKS.recarga.reloadMult, counts.recarga);
    if(counts.impacto) damage *= Math.pow(PERKS.impacto.damageMult, counts.impacto);
    if(counts.dano) damage *= Math.pow(PERKS.dano.damageMult, counts.dano);
    if(counts.estructura) structureBonus += counts.estructura * PERKS.estructura.structureFlat;

    elDurability.innerHTML = Math.round(durability);
    elReload.innerHTML = reload.toFixed(2) + '<span class="tc-stat-unit">s</span>';
    elDamage.innerHTML = Math.round(damage);

    if(structureBonus > 0){
      elStructureValue.textContent = structureBonus;
      elStructureNote.style.display = 'block';
    } else {
      elStructureNote.style.display = 'none';
    }

    var tagsHtml = '';
    Object.keys(counts).forEach(function(key){
      var perk = PERKS[key];
      var n = counts[key];
      tagsHtml += '<span class="tag ' + perk.tag + '">' + perk.label + (n > 1 ? ' ×' + n : '') + '</span>';
    });
    elSummary.innerHTML = tagsHtml || '<span style="color:var(--muted-2);font-size:.85rem;">Ninguna ranura configurada todavía.</span>';
  }

  trapSelect.addEventListener('tc-change', calculate);
  perkSelects.forEach(function(sel){ sel.addEventListener('tc-change', calculate); });

  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      perkSelects.forEach(function(sel){ setValue(sel, 'none', false); });
      updateDisabledOptions();
      calculate();
    });
  }

  calculate();
})();
