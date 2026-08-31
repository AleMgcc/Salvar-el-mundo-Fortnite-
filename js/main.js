// ============================================================================
// main.js — Punto de entrada. Dispara las llamadas de inicialización que en
// el archivo original se ejecutaban al final de cada <script>:
//   - observeReveals(): arranca el IntersectionObserver del scroll-reveal
//     (antes al final del bloque de tabs/reveal del primer <script>).
//   - updateCounters(): pinta los badges [N] del Libro de colección desde el
//     arranque, antes de seleccionar cualquier categoría (antes al final del
//     segundo <script>).
// Se ejecuta después de que ui.js, render.js y collection-events.js ya
// registraron sus listeners, preservando el orden original.
// ============================================================================

import { observeReveals } from './ui.js';
import { updateCounters } from './render.js';

// Asegura que './traps-simulator.js', './contact-widget.js' y
// './collection-events.js' se carguen y ejecuten como parte del grafo de
// módulos, aunque este archivo no use directamente sus exports.
import './traps-simulator.js';
import './contact-widget.js';
import './collection-events.js';

observeReveals();
updateCounters();
