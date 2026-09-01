// ============================================================================
// state.js — Estado, datos y persistencia del Libro de colección.
// v2: base de datos ampliada (héroes, armas, trampas) con costos de
// reclutamiento, estadísticas, perks oficiales y lore; progreso del jugador
// y recursos guardados en localStorage.
// ============================================================================

// ---------- Utilidades de rareza ----------
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

// ---------- Elementos ----------
export var ELEMENT_ES = {
  'fisico':'Físico', 'energia':'Energía', 'fuego':'Fuego',
  'agua':'Agua', 'naturaleza':'Naturaleza', 'ninguno':'Sin elemento'
};
export var ELEMENT_ICON = {
  'fisico':'⚙️', 'energia':'⚡', 'fuego':'🔥', 'agua':'💧', 'naturaleza':'🌿', 'ninguno':'▫️'
};

// ---------- Etiquetas ES de categorías y subcategorías (solo UI) ----------
export var LC_CAT_LABELS = {
  heroes:'Héroes', personal:'Personal', ranged:'Armas a distancia', melee:'Armas cuerpo a cuerpo',
  traps:'Trampas', packs:'Packs de inicio', event_people:'Personajes de evento',
  event_schematics:'Esquemas de evento', expansion_people:'Personajes de expansión',
  expansion_schematics:'Esquemas de expansión'
};
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
  'Survivor':'Superviviente Líder',
  'Assault Rifle':'Esquema de Fusil de asalto', 'Shotgun':'Esquema de Escopeta', 'SMG':'Esquema de Subfusil',
  'Sniper Rifle':'Esquema de Rifle de francotirador', 'Explosive Weapon':'Esquema de Arma explosiva',
  'Sword':'Esquema de Espada', 'Axe':'Esquema de Hacha', 'Club':'Esquema de Mazo',
  'Wall Trap':'Esquema de Trampa de pared', 'Floor Trap':'Esquema de Trampa de suelo', 'Ceiling Trap':'Esquema de Trampa de techo',
  'Starter Pack':'Objeto de Pack de inicio'
};

export var RARITY_TIER = { 'comun':1, 'poco-comun':2, 'raro':3, 'epico':4, 'legendario':5, 'mitico':6 };
export var HERO_ROLES = { 'Soldier':1, 'Constructor':1, 'Ninja':1, 'Outlander':1 };

// ---------- Costo de reclutamiento por defecto según rareza ----------
var DEFAULT_COST_BY_RARITY = {
  'comun':        { flux: 0,   manuales: 0,  gotasPurificadas: 0 },
  'poco-comun':   { flux: 8,   manuales: 1,  gotasPurificadas: 0 },
  'raro':         { flux: 15,  manuales: 2,  gotasPurificadas: 0 },
  'epico':        { flux: 30,  manuales: 3,  gotasPurificadas: 0 },
  'legendario':   { flux: 50,  manuales: 5,  gotasPurificadas: 1 },
  'mitico':       { flux: 100, manuales: 10, gotasPurificadas: 2 }
};
function costoPorDefecto(rareza){
  var c = DEFAULT_COST_BY_RARITY[rareza] || DEFAULT_COST_BY_RARITY['comun'];
  return { flux: c.flux, manuales: c.manuales, gotasPurificadas: c.gotasPurificadas };
}

// ============================================================================
// BASE DE DATOS
// Estructura: LC_DATA[categoría].subcats[subcategoría] = [ {...} ... ]
// Las categorías sin subcarpetas usan LC_DATA[categoría].items = [ ... ]
//
// Campos por ficha: name, rarity, role, element, cost{flux,manuales,gotas},
// stats{...}, perks{...}, lore, registered (estado demo inicial, sobrescrito
// por lo guardado en localStorage en cuanto el usuario interactúa).
//
// NOTA DE VERIFICACIÓN: los perks de MEGA B.A.S.E. Kyle y Dragon Scorch, y las
// cifras de referencia del Siegebreaker, se contrastaron contra la wiki de la
// comunidad de Fortnite: Save the World. El resto de estadísticas y costos son
// valores de referencia (nivel/esquema base) estimados a partir del patrón oficial
// por rareza, ya que el juego escala estos números según nivel del arma y del jugador.
// ============================================================================
export var LC_DATA = {
  heroes: {
    subcats: {
      soldiers: [
        { name:'Urban Assault Headhunter', rarity:'legendario', role:'Soldier', element:'ninguno', registered:true,
          stats:{ salud:12850, escudo:5350, danoHabilidad:1.08 },
          perks:{ estandar:'Marcado por Cabeza: eliminar enemigos marcados otorga munición extra a todo el escuadrón.',
                   comandante:'Marcado por Cabeza (Comandante): aumenta el efecto de marcado a todo el equipo.' },
          lore:'Especialista en reconocimiento y eliminación de objetivos prioritarios, entrenado para coordinar el fuego del escuadrón sobre husks marcados.' },
        { name:'Master Grenadier Ramirez', rarity:'legendario', role:'Soldier', element:'ninguno', registered:false,
          stats:{ salud:12600, escudo:5200, danoHabilidad:1.1 },
          perks:{ estandar:'Anillo de Fuego: las granadas dejan un área de daño persistente.',
                   comandante:'Anillo de Fuego (Comandante): aumenta la duración del área de daño para todo el escuadrón.' },
          lore:'Veterano de demoliciones que convirtió el manejo de explosivos en una ciencia exacta contra oleadas de husks.' },
        { name:'Survivalist Jonesy',       rarity:'poco-comun', role:'Soldier', element:'ninguno', registered:true,
          stats:{ salud:9200, escudo:3600, danoHabilidad:1.0 },
          perks:{ estandar:'Preparado: pequeño bono de daño con armas de fuego cuerpo a cuerpo cercano.',
                   comandante:'Preparado (Comandante): extiende el bono a todo el escuadrón.' },
          lore:'La versión curtida por la tormenta de Jonesy, siempre lista con un plan de respaldo.' },
        { name:'Special Forces Banshee',   rarity:'epico',      role:'Soldier', element:'ninguno', registered:false,
          stats:{ salud:10800, escudo:4400, danoHabilidad:1.05 },
          perks:{ estandar:'Adrenalina de Combate: recarga más rápido tras una eliminación.',
                   comandante:'Adrenalina de Combate (Comandante): comparte parte del efecto con el equipo.' },
          lore:'Operativa de fuerzas especiales reclutada tras demostrar una puntería excepcional en misiones de rescate.' }
      ],
      constructors: [
        { name:'Mega Base Kyle',   rarity:'legendario', role:'Constructor', element:'ninguno', registered:true,
          stats:{ salud:14474, escudo:5975, danoHabilidad:1.1 },
          perks:{ estandar:'Arquitectura Elevada: la B.A.S.E. aumenta la vida de las estructuras en 28%.',
                   comandante:'Arquitectura Elevada (Comandante): la B.A.S.E. aumenta la vida de las estructuras en 84%.' },
          lore:'La evolución definitiva de Kyle: un maestro constructor cuya sola presencia fortalece cada muro, rampa y trampa de la base.' },
        { name:'Power BASE Knox',  rarity:'epico',      role:'Constructor', element:'ninguno', registered:true,
          stats:{ salud:11600, escudo:4700, danoHabilidad:1.05 },
          perks:{ estandar:'Base de Poder: reduce el costo de energía de las habilidades de estructura.',
                   comandante:'Base de Poder (Comandante): reduce el costo de energía para todo el escuadrón.' },
          lore:'Ingeniero de campo especializado en optimizar el consumo energético de fortificaciones B.A.S.E.' },
        { name:'BASE Kyle',        rarity:'comun',      role:'Constructor', element:'ninguno', registered:true,
          stats:{ salud:8200, escudo:3200, danoHabilidad:1.0 },
          perks:{ estandar:'Arquitectura Elevada: la B.A.S.E. aumenta la vida de las estructuras en 10%.',
                   comandante:'Arquitectura Elevada (Comandante): aumenta la vida de las estructuras en 22%.' },
          lore:'La versión inicial de Kyle, el primer constructor que todo comandante conoce al comenzar su base.' },
        { name:'Heavy BASE Kyle',  rarity:'raro',       role:'Constructor', element:'ninguno', registered:false,
          stats:{ salud:9600, escudo:3800, danoHabilidad:1.0 },
          perks:{ estandar:'Arquitectura Elevada: la B.A.S.E. aumenta la vida de las estructuras en 16%.',
                   comandante:'Arquitectura Elevada (Comandante): aumenta la vida de las estructuras en 40%.' },
          lore:'Kyle reforzado con equipo pesado, pensado para bases que reciben oleadas prolongadas.' },
        { name:'Machinist Harper', rarity:'legendario', role:'Constructor', element:'ninguno', registered:false,
          stats:{ salud:13200, escudo:5400, danoHabilidad:1.08 },
          perks:{ estandar:'Mano de Obra: las trampas fabricadas cerca de la B.A.S.E. reciben daño extra.',
                   comandante:'Mano de Obra (Comandante): el bono de daño a trampas se comparte con el equipo.' },
          lore:'Antigua ingeniera industrial que trasladó su experiencia en maquinaria pesada a la defensa de bases.' }
      ],
      ninjas: [
        { name:'Dragon Scorch',            rarity:'legendario', role:'Ninja', element:'fuego', registered:true,
          stats:{ salud:11400, escudo:4600, danoHabilidad:1.15 },
          perks:{ estandar:'Alas del Dragón: aumenta el alcance, ancho y daño de Golpe de Dragón en 25%.',
                   comandante:'Retorno del Dragón (Comandante): reduce el costo de energía de Golpe de Dragón en 30%.' },
          lore:'Ninja que canaliza energía ígnea en cada golpe de su espada, dejando un rastro de brasas sobre los husks.' },
        { name:'Dim Mak Mari',             rarity:'legendario', role:'Ninja', element:'fisico', registered:false,
          stats:{ salud:11000, escudo:4400, danoHabilidad:1.12 },
          perks:{ estandar:'Golpe Certero: aumenta el daño crítico durante la Postura de Sombra.',
                   comandante:'Golpe Certero (Comandante): comparte parte del bono crítico con el equipo.' },
          lore:'Discípula de las artes marciales que perfeccionó el arte de golpear puntos vitales con precisión letal.' },
        { name:'Shuriken Master Llamurai', rarity:'legendario', role:'Ninja', element:'fisico', registered:false,
          stats:{ salud:11200, escudo:4500, danoHabilidad:1.1 },
          perks:{ estandar:'Lluvia de Shurikens: reduce el tiempo de reutilización de armas arrojadizas.',
                   comandante:'Lluvia de Shurikens (Comandante): comparte el bono con el escuadrón.' },
          lore:'Guerrero enmascarado cuya destreza con shurikens se ha convertido en leyenda dentro del refugio.' },
        { name:'Sarah Hotep',              rarity:'epico',      role:'Ninja', element:'naturaleza', registered:true,
          stats:{ salud:10200, escudo:4100, danoHabilidad:1.05 },
          perks:{ estandar:'Vendajes Ancestrales: cura una pequeña cantidad de vida al eliminar enemigos.',
                   comandante:'Vendajes Ancestrales (Comandante): extiende la curación al escuadrón cercano.' },
          lore:'Ninja envuelta en vendas rituales que recuerda a las guardianas de tumbas antiguas.' }
      ],
      outlanders: [
        { name:'Ranger Deadeye',    rarity:'legendario', role:'Outlander', element:'ninguno', registered:false,
          stats:{ salud:10600, escudo:4300, danoHabilidad:1.1 },
          perks:{ estandar:'Ojo de Águila: aumenta el daño crítico con armas de francotirador.',
                   comandante:'Ojo de Águila (Comandante): comparte el bono crítico con el escuadrón.' },
          lore:'Rastreadora solitaria que recorre el mundo abierto en busca de recursos y supervivientes.' },
        { name:'Striker A.C.',      rarity:'epico',      role:'Outlander', element:'ninguno', registered:true,
          stats:{ salud:9800, escudo:4000, danoHabilidad:1.05 },
          perks:{ estandar:'Golpe Rápido: recarga el escudo al recolectar recursos.',
                   comandante:'Golpe Rápido (Comandante): comparte el bono de escudo con el escuadrón.' },
          lore:'Trotamundos veloz especializada en incursiones cortas para saqueo de recursos.' },
        { name:'Enforcer Grizzly',  rarity:'legendario', role:'Outlander', element:'ninguno', registered:false,
          stats:{ salud:11000, escudo:4500, danoHabilidad:1.1 },
          perks:{ estandar:'Mano Dura: aumenta el daño cuerpo a cuerpo del escuadrón cercano.',
                   comandante:'Mano Dura (Comandante): amplifica el bono de daño cuerpo a cuerpo.' },
          lore:'Ex-guardia de seguridad que impone respeto incluso entre las hordas de husks.' },
        { name:'Trailblazer Quinn', rarity:'epico',      role:'Outlander', element:'ninguno', registered:true,
          stats:{ salud:9600, escudo:3900, danoHabilidad:1.0 },
          perks:{ estandar:'Paso Firme: pequeño bono de velocidad de movimiento tras recolectar recursos.',
                   comandante:'Paso Firme (Comandante): comparte el bono de velocidad con el escuadrón.' },
          lore:'Exploradora incansable, siempre la primera en abrir camino hacia nuevas zonas de recursos.' }
      ]
    }
  },

  personal: {
    subcats: {
      survivors: [],
      lead_survivors: [
        { name:'Snuggly Squad Leader', rarity:'epico', role:'Survivor', element:'ninguno', registered:false,
          stats:{ bonoSalud:'+8% Salud del escuadrón', bonoFabricacion:'+5% Velocidad de fabricación' },
          perks:{ estandar:'Personalidad Coincidente: bono completo si coincide con la personalidad del héroe líder.' },
          lore:'Superviviente líder que organiza turnos de vigilancia y mantiene la moral alta dentro del refugio.' }
      ],
      defenders: []
    }
  },

  ranged: {
    subcats: {
      assault_rifles: [
        { name:'Siegebreaker',  rarity:'legendario', role:'Assault Rifle', element:'fisico', registered:true,
          stats:{ dano:34, impacto:26, tamanoCargador:30, cadencia:9.5, recarga:2.3, alcance:'Medio-Largo (hasta 15 casillas)' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Daño Crítico+ / Daño a Elementales+ / Munición+' },
          lore:'Fusil de asalto automático de precisión certera a media-larga distancia; ideal para jugadores que inician en armas legendarias.' },
        { name:'Hunter-Killer', rarity:'legendario', role:'Assault Rifle', element:'agua', registered:false,
          stats:{ dano:32, impacto:24, tamanoCargador:30, cadencia:9.0, recarga:2.4, alcance:'Medio-Largo (hasta 15 casillas)' },
          perks:{ combinacionIdeal:'Daño a Elementales (Agua)+ / Daño Crítico+ / Munición+ / Daño+ / Daño Crítico+' },
          lore:'Variante infundida con energía acuática del Siegebreaker, eficaz contra husks vulnerables al agua.' }
      ],
      shotguns: [
        { name:'Super Shredder', rarity:'legendario', role:'Shotgun', element:'fisico', registered:true,
          stats:{ dano:210, impacto:180, tamanoCargador:2, cadencia:1.1, recarga:2.8, alcance:'Corto (hasta 5 casillas)' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Daño Crítico+ / Munición+ / Daño a Elementales+' },
          lore:'Escopeta de doble cañón capaz de destrozar a un husk de un solo disparo bien colocado.' }
      ],
      pistols_smgs: [
        { name:'Nocturno', rarity:'epico', role:'SMG', element:'ninguno', registered:false,
          stats:{ dano:18, impacto:14, tamanoCargador:30, cadencia:11.0, recarga:2.0, alcance:'Corto-Medio (hasta 10 casillas)' },
          perks:{ combinacionIdeal:'Daño+ / Cadencia de tiro+ / Daño Crítico+ / Munición+' },
          lore:'Subfusil de la línea Fundador, apreciado por su altísima cadencia de disparo.' }
      ],
      sniper_rifles: [
        { name:"Ol' Betsy", rarity:'legendario', role:'Sniper Rifle', element:'fisico', registered:true,
          stats:{ dano:145, impacto:130, tamanoCargador:5, cadencia:1.0, recarga:2.6, alcance:'Largo (hasta 30 casillas)' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Daño Crítico+ / Munición+ / Daño a Elementales+' },
          lore:'Rifle de cerrojo confiable, favorito de francotiradores por su precisión a máxima distancia.' }
      ],
      explosive_weapons: [
        { name:'Grenade Launcher', rarity:'epico', role:'Explosive Weapon', element:'fisico', registered:false,
          stats:{ dano:120, impacto:150, tamanoCargador:6, cadencia:1.2, recarga:3.0, alcance:'Medio (hasta 12 casillas)' },
          perks:{ combinacionIdeal:'Daño en Área+ / Daño Crítico+ / Munición+ / Daño+' },
          lore:'Lanzagranadas ideal para dispersar grupos numerosos de husks antes de que alcancen la base.' }
      ]
    }
  },

  melee: {
    subcats: {
      swords: [
        { name:'Spectral Blade', rarity:'legendario', role:'Sword', element:'fisico', registered:false,
          stats:{ dano:98, impacto:60, durabilidad:220, cadencia:1.3, alcance:'Cuerpo a cuerpo' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Duración de Golpe Crítico+ / Durabilidad+' },
          lore:'Espada translúcida que parece cortar entre este mundo y el siguiente; su filo apenas hace ruido.' },
        { name:'Stormblade',     rarity:'legendario', role:'Sword', element:'energia', registered:true,
          stats:{ dano:102, impacto:64, durabilidad:220, cadencia:1.3, alcance:'Cuerpo a cuerpo' },
          perks:{ combinacionIdeal:'Daño a Elementales (Energía)+ / Daño Crítico+ / Daño+ / Durabilidad+' },
          lore:'Forjada con fragmentos de energía de tormenta, chisporrotea con cada golpe conectado.' }
      ],
      axes: [
        { name:'Huskcleaver', rarity:'legendario', role:'Axe', element:'fisico', registered:false,
          stats:{ dano:130, impacto:80, durabilidad:200, cadencia:1.0, alcance:'Cuerpo a cuerpo' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Duración de Golpe Crítico+ / Durabilidad+' },
          lore:'Hacha pesada diseñada para partir en dos a los husks más resistentes de una sola vez.' }
      ],
      spears: [],
      scythes: [],
      clubs_hardware: [
        { name:'Walloper', rarity:'epico', role:'Club', element:'fisico', registered:true,
          stats:{ dano:88, impacto:120, durabilidad:180, cadencia:0.9, alcance:'Cuerpo a cuerpo' },
          perks:{ combinacionIdeal:'Impacto+ / Daño+ / Durabilidad+ / Daño Crítico+' },
          lore:'Mazo improvisado con gran capacidad de aturdimiento, útil para contener oleadas cerca de la base.' }
      ]
    }
  },

  traps: {
    subcats: {
      wall_traps: [
        { name:'Broadside',     rarity:'legendario', role:'Wall Trap', element:'fisico', registered:false,
          stats:{ dano:145, durabilidad:900, recarga:2.5, alcance:'Rango de pared' },
          perks:{ combinacionIdeal:'Daño+ / Daño Crítico+ / Durabilidad+ / Daño a Elementales+' },
          lore:'Trampa de pared que dispara una descarga de perdigones a todo lo que cruce su línea de fuego.' },
        { name:'Wall Dart',     rarity:'comun',      role:'Wall Trap', element:'fisico', registered:true,
          stats:{ dano:35, durabilidad:400, recarga:1.8, alcance:'Rango de pared' },
          perks:{ combinacionIdeal:'Daño+ / Durabilidad+' },
          lore:'La trampa de pared más básica; sencilla, barata y siempre útil en los primeros niveles.' },
        { name:'Wall Dynamo',   rarity:'epico',      role:'Wall Trap', element:'energia', registered:true,
          stats:{ dano:90, durabilidad:700, recarga:2.0, alcance:'Rango de pared' },
          perks:{ combinacionIdeal:'Daño a Elementales (Energía)+
