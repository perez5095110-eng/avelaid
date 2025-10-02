const seccionJuego = document.querySelector(".seccion-del-juego");
const pvpContainer = document.querySelector(".pvp");
const btnOriginal = pvpContainer.innerHTML;

let jugador, areaJugable, objetos = [], animacionMovimiento, juegoActivo = false;
let velocidadBase = 2, velocidadActual = 2, velocidadMultiplicador = 1;
let vidas = 3;
let tiempoInicio, tiempo;
let vidasDisplay, tiempoDisplay, velocidadDisplay;

let jugadorX = 0;
let jugadorVelocidad = 4;
let direccionMovimiento = 0; // -1 izquierda, 1 derecha, 0 nada
const jugadorAncho = 40;

function crearJugador() {
  jugador = document.createElement("div");
  jugador.classList.add("jugador");
  jugador.style.left = `${jugadorX}px`;
  areaJugable.appendChild(jugador);
}

function crearObjeto() {
  const obj = document.createElement("div");
  obj.classList.add("objeto");
  const x = Math.random() * (areaJugable.clientWidth - 30);
  obj.style.left = `${x}px`;
  areaJugable.appendChild(obj);
  objetos.push({ elemento: obj, y: 0 });
}

function moverJugadorSuavemente() {
  if (!juegoActivo || direccionMovimiento === 0) return;

  jugadorX += direccionMovimiento * jugadorVelocidad;
  jugadorX = Math.max(0, Math.min(jugadorX, areaJugable.clientWidth - jugadorAncho));
  jugador.style.left = `${jugadorX}px`;
}

function actualizarObjetos() {
  for (let i = objetos.length - 1; i >= 0; i--) {
    const obj = objetos[i];
    obj.y += velocidadActual;
    obj.elemento.style.top = `${obj.y}px`;

    const objRect = obj.elemento.getBoundingClientRect();
    const jugadorRect = jugador.getBoundingClientRect();

    if (
      objRect.bottom >= jugadorRect.top &&
      objRect.top <= jugadorRect.bottom &&
      objRect.left <= jugadorRect.right &&
      objRect.right >= jugadorRect.left
    ) {
      vidas--;
      actualizarHUD();
      obj.elemento.remove();
      objetos.splice(i, 1);
      if (vidas <= 0) {
        terminarJuego();
        return;
      }
    } else if (obj.y > areaJugable.clientHeight) {
      obj.elemento.remove();
      objetos.splice(i, 1);
    }
  }
}

function actualizarHUD() {
  vidasDisplay.textContent = `❤️ ${vidas}`;
  tiempoDisplay.textContent = `🕔 ${tiempo}s`;
  velocidadDisplay.textContent = `Velocidad: x${velocidadMultiplicador}`;
}

function actualizarTiempo() {
  if (!juegoActivo) return;

  const segundosPasados = Math.floor((Date.now() - tiempoInicio) / 1000);
  const nuevoMultiplicador = Math.min(4, Math.floor(segundosPasados / 30) + 1);

  if (nuevoMultiplicador !== velocidadMultiplicador) {
    velocidadMultiplicador = nuevoMultiplicador;
    velocidadActual = velocidadBase * velocidadMultiplicador;
  }

  let segundosRestantes = 30 - (segundosPasados % 30);
  if (segundosRestantes === 0) segundosRestantes = 30;

  tiempo = segundosRestantes;

  actualizarHUD();
  setTimeout(actualizarTiempo, 500);
}

function animar() {
  if (!juegoActivo) return;

  moverJugadorSuavemente();
  actualizarObjetos();

  if (Math.random() < 0.03) {
    crearObjeto();
  }

  animacionMovimiento = requestAnimationFrame(animar);
}

function iniciarJuego() {
  juegoActivo = true;
  vidas = 3;
  velocidadMultiplicador = 1;
  velocidadActual = velocidadBase;
  jugadorX = (areaJugable.clientWidth - jugadorAncho) / 2;
  tiempoInicio = Date.now();
  objetos.forEach(o => o.elemento.remove());
  objetos = [];

  areaJugable.innerHTML = ""; // limpiar cualquier juego anterior

  crearJugador();

  pvpContainer.innerHTML = `<div class="game" id="velocidadDisplay">Velocidad: x1</div>`;
  velocidadDisplay = document.getElementById("velocidadDisplay");

  const hud = document.querySelectorAll(".info-game .game");
  vidasDisplay = hud[0];
  tiempoDisplay = hud[1];

  actualizarHUD();
  actualizarTiempo();
  animar();
}

function terminarJuego() {
  juegoActivo = false;
  cancelAnimationFrame(animacionMovimiento);

  objetos.forEach(o => o.elemento.remove());
  objetos = [];

  if (jugador) jugador.remove();

  alert("Juego terminado");

  pvpContainer.innerHTML = btnOriginal;
  const btnPVP = document.getElementById("btn-pvp");
  if (btnPVP) {
    btnPVP.addEventListener("click", () => {
      if (!juegoActivo) iniciarJuego();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnPVP = document.getElementById("btn-pvp");

  if (btnPVP) {
    btnPVP.addEventListener("click", () => {
      if (!juegoActivo) iniciarJuego();
    });
  }

  // Crear contenedor jugable
  areaJugable = document.createElement("div");
  areaJugable.classList.add("area-jugable");
  seccionJuego.insertBefore(areaJugable, document.querySelector(".controles"));

  // Botones móviles
  document.querySelectorAll(".boton-del-juego").forEach(btn => {
    btn.addEventListener("mousedown", () => {
      direccionMovimiento = btn.textContent.includes("izquierda") ? -1 : 1;
    });
    btn.addEventListener("mouseup", () => {
      direccionMovimiento = 0;
    });
    btn.addEventListener("touchstart", () => {
      direccionMovimiento = btn.textContent.includes("izquierda") ? -1 : 1;
    });
    btn.addEventListener("touchend", () => {
      direccionMovimiento = 0;
    });
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") direccionMovimiento = -1;
    if (e.key === "ArrowRight") direccionMovimiento = 1;
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      direccionMovimiento = 0;
    }
  });
});
