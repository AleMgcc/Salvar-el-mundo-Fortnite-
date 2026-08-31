// ============================================================================
// state.js — Estado y datos globales del Libro de colección
// Migrado sin cambios funcionales desde el <script> original (bloque
// "LIBRO DE COLECCIÓN — Base de datos, navegación, filtros y modal").
// ============================================================================

// ---------- Utilidades de rareza ----------
// Clave interna (ES, usada en clases CSS) -> etiqueta oficial en inglés
// que se muestra junto al rol del objeto (ej. "Legendary Soldier").
export var RARITY_EN = {
  'comun':        'Common',
  'poco-comun':   'Uncommon',
  'raro':         'Rare',
  'epico':        'Epic',
  'legendario':   'Legendary',
  'mitico':       'Mythic'
};
export var RARITY_ES = {
  'comun':'Común', 'poco-comun':'Poco común', 'raro':'Raro',
  'epico':'Épico', 'legendario':'Legendario', 'mitico':'Mítico'
};

// ---------- Etiquetas ES de categorías y subcategorías (solo UI) ----------
export var LC_CAT_LABELS = {
  heroes:'Héroes', personal:'Personal', ranged:'Armas a distancia', melee:'Armas cuerpo a cuerpo',
  traps:'Trampas', packs:'Packs de inicio', event_people:'Personajes de evento',
  event_schematics:'Esquemas de evento', expansion_people:'Personajes de expansión',
  expansion_schematics:'Esquemas de expansión'
};
// Subcategorías en español latinoamericano (etiquetas de navegación).
// Los NOMBRES PROPIOS de cada objeto dentro de LC_DATA se mantienen en su
// idioma original: son nombres técnicos propios del ecosistema del juego.
export var LC_SUB_LABELS = {
  soldiers:'Soldados', constructors:'Constructores', ninjas:'Ninjas', outlanders:'Trotamundos',
  survivors:'Supervivientes', lead_survivors:'Líderes', defenders:'Defensores',
  assault_rifles:'Fusiles de asalto', shotguns:'Escopetas', pistols_smgs:'Pistolas y subfusiles',
  sniper_rifles:'Rifles de francotirador', explosive_weapons:'Armas explosivas',
  swords:'Espadas', axes:'Hachas', spears:'Lanzas', scythes:'Guadañas', clubs_hardware:'Mazos y herramientas',
  wall_traps:'Trampas de pared', floor_traps:'Trampas de suelo', ceiling_traps:'Trampas de techo'
};

// ---------- Rol -> tipo de objeto en español (para el modal) ----------
export var LC_ROLE_ES = {
  'Soldier':'Héroe Soldado', 'Constructor':'Héroe Constructor', 'Ninja':'Héroe Ninja', 'Outlander':'Héroe Trotamundos',
  'Assault Rifle':'Esquema de Fusil de asalto', 'Shotgun':'Esquema de Escopeta', 'SMG':'Esquema de Subfusil',
  'Sniper Rifle':'Esquema de Rifle de francotirador', 'Explosive Weapon':'Esquema de Arma explosiva',
  'Sword':'Esquema de Espada', 'Axe':'Esquema de Hacha', 'Club':'Esquema de Mazo',
  'Wall Trap':'Esquema de Trampa de pared', 'Floor Trap':'Esquema de Trampa de suelo', 'Ceiling Trap':'Esquema de Trampa de techo'
};

// ---------- Base de datos (nombres de objetos en su idioma original) ----------
// Estructura: LC_DATA[categoría].subcats[subcategoría] = [ {name, rarity, role, registered} ... ]
// Las categorías sin subcarpetas oficiales usan LC_DATA[categoría].items = [ ... ]
//
// "registered" es un estado ILUSTRATIVO de demostración (simula el progreso de
// un jugador) para poder probar el filtro Registrados/Pendientes; no proviene
// de una cuenta real todavía.
//
// NOTA DE VERIFICACIÓN: las rarezas se contrastaron contra la wiki de la comunidad.
// Se corrigieron 3 entradas que originalmente decían "mitico" (Dragon Scorch,
// Hunter-Killer y Spectral Blade): ninguna tiene versión Mítica real en el juego,
// su rareza máxima verificada es Legendario. Hunter-Killer también se movió de
// "Armas explosivas" a "Fusiles de asalto", su categoría correcta. El resto de la
// base de datos es contenido de demostración para el layout y aún no ha pasado
// por esta misma verificación exhaustiva.
export var LC_DATA = {
  heroes: {
    subcats: {
      soldiers: [
        { name:'Urban Assault Headhunter', rarity:'legendario', role:'Soldier', registered:true },
        { name:'Master Grenadier Ramirez', rarity:'legendario', role:'Soldier', registered:false },
        { name:'Survivalist Jonesy',       rarity:'poco-comun', role:'Soldier', registered:true },
        { name:'Special Forces Banshee',   rarity:'epico',      role:'Soldier', registered:false }
      ],
      constructors: [
        { name:'Mega Base Kyle',   rarity:'legendario', role:'Constructor', registered:true },
        { name:'Power BASE Knox',  rarity:'epico',      role:'Constructor', registered:true },
        { name:'BASE Kyle',        rarity:'comun',      role:'Constructor', registered:true },
        { name:'Heavy BASE Kyle',  rarity:'raro',       role:'Constructor', registered:false },
        { name:'Machinist Harper', rarity:'legendario', role:'Constructor', registered:false }
      ],
      ninjas: [
        { name:'Dragon Scorch',            rarity:'legendario', role:'Ninja', registered:true },
        { name:'Dim Mak Mari',             rarity:'legendario', role:'Ninja', registered:false },
        { name:'Shuriken Master Llamurai', rarity:'legendario', role:'Ninja', registered:false },
        { name:'Sarah Hotep',              rarity:'epico',      role:'Ninja', registered:true }
      ],
      outlanders: [
        { name:'Ranger Deadeye',    rarity:'legendario', role:'Outlander', registered:false },
        { name:'Striker A.C.',      rarity:'epico',      role:'Outlander', registered:true },
        { name:'Enforcer Grizzly',  rarity:'legendario', role:'Outlander', registered:false },
        { name:'Trailblazer Quinn', rarity:'epico',      role:'Outlander', registered:true }
      ]
    }
  },

  personal: {
    subcats: {
      survivors: [],
      lead_survivors: [],
      defenders: []
    }
  },

  ranged: {
    subcats: {
      assault_rifles: [
        { name:'Siegebreaker',  rarity:'legendario', role:'Assault Rifle', registered:true },
        { name:'Thunderbolt',   rarity:'epico',      role:'Assault Rifle', registered:false },
        { name:'Hunter-Killer', rarity:'legendario', role:'Assault Rifle', registered:false }
      ],
      shotguns: [
        { name:'Super Shredder', rarity:'legendario', role:'Shotgun', registered:true }
      ],
      pistols_smgs: [
        { name:'Nocturno', rarity:'epico', role:'SMG', registered:false }
      ],
      sniper_rifles: [
        { name:"Ol' Betsy", rarity:'legendario', role:'Sniper Rifle', registered:true }
      ],
      explosive_weapons: [
        { name:'Grenade Launcher', rarity:'epico', role:'Explosive Weapon', registered:false }
      ]
    }
  },

  melee: {
    subcats: {
      swords: [
        { name:'Spectral Blade', rarity:'legendario', role:'Sword', registered:false },
        { name:'Stormblade',     rarity:'legendario', role:'Sword', registered:true }
      ],
      axes: [
        { name:'Huskcleaver', rarity:'legendario', role:'Axe', registered:false }
      ],
      spears: [],
      scythes: [],
      clubs_hardware: [
        { name:'Walloper', rarity:'epico', role:'Club', registered:true }
      ]
    }
  },

  traps: {
    subcats: {
      wall_traps: [
        { name:'Broadside',     rarity:'legendario', role:'Wall Trap', registered:false },
        { name:'Wall Dart',     rarity:'comun',      role:'Wall Trap', registered:true },
        { name:'Wall Dynamo',   rarity:'epico',      role:'Wall Trap', registered:true },
        { name:'Wall Launcher', rarity:'comun',      role:'Wall Trap', registered:true }
      ],
      floor_traps: [
        { name:'Wooden Floor Spikes', rarity:'comun',      role:'Floor Trap', registered:true },
        { name:'Tar Pit',             rarity:'raro',       role:'Floor Trap', registered:false },
        { name:'Flame Grill Trap',    rarity:'epico',      role:'Floor Trap', registered:false },
        { name:'Floor Freezer',       rarity:'legendario', role:'Floor Trap', registered:false }
      ],
      ceiling_traps: [
        { name:'Ceiling Gas Trap',       rarity:'raro',       role:'Ceiling Trap', registered:true },
        { name:'Ceiling Electric Field', rarity:'epico',      role:'Ceiling Trap', registered:false },
        { name:'Ceiling Drop Trap',      rarity:'legendario', role:'Ceiling Trap', registered:false }
      ]
    }
  },

  packs:                { items: [] },
  event_people:         { items: [] },
  event_schematics:     { items: [] },
  expansion_people:     { items: [] },
  expansion_schematics: { items: [] }
};

// ---------- Slug simple para data-item-id ----------
function lcSlugify(str){
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- Índice plano (fuente única para conteo, búsqueda y modal) ----------
export var LC_FLAT_INDEX = [];
(function buildFlatIndex(){
  Object.keys(LC_DATA).forEach(function(catKey){
    var cat = LC_DATA[catKey];
    if(cat.subcats){
      Object.keys(cat.subcats).forEach(function(subKey){
        cat.subcats[subKey].forEach(function(it){
          LC_FLAT_INDEX.push({
            name: it.name, rarity: it.rarity, role: it.role, registered: it.registered,
            catKey: catKey, subKey: subKey, id: lcSlugify(it.name)
          });
        });
      });
    } else if(cat.items){
      cat.items.forEach(function(it){
        LC_FLAT_INDEX.push({
          name: it.name, rarity: it.rarity, role: it.role, registered: it.registered,
          catKey: catKey, subKey: null, id: lcSlugify(it.name)
        });
      });
    }
  });
})();

// ---------- Tablas usadas por el generador de ficha ilustrativa ----------
export var RARITY_TIER = { 'comun':1, 'poco-comun':2, 'raro':3, 'epico':4, 'legendario':5, 'mitico':6 };
export var HERO_ROLES = { 'Soldier':1, 'Constructor':1, 'Ninja':1, 'Outlander':1 };

// ---------- Estado de la vista actual del Libro de colección ----------
// Objeto mutable: los demás módulos importan esta misma referencia y
// modifican sus propiedades directamente (igual que en el script original).
export var lcState = {
  mode: 'empty',        // 'empty' | 'category' | 'search'
  catKey: null,
  subKey: null,
  query: '',
  rarityFilter: 'all',  // 'all' | 'legendary-mythic' | 'epico' | 'raro'
  statusFilter: 'all'   // 'all' | 'registered' | 'pending'
};

// ---------- Estado de navegación del modal de ficha técnica ----------
// Envuelto en un objeto (en vez de "let" sueltas) para poder mutarlo desde
// otros módulos sin reasignar el binding importado.
export var lcModalState = {
  list: [],
  index: -1
};
