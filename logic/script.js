import {
  spaceWords,
  htmlWords,
  cssWords,
  javascriptWords,
  archlinux,
} from "../data.js";

const $time = document.querySelector("#time");
const $paragraph = document.querySelector("#text-area");
const $accuracy = document.querySelector("#accuracy");
const $wpm = document.querySelector("#wpm");
const $rank = document.querySelector("#rank");
const $rankPercentile = document.querySelector("#rank-percentile");
const $resetButton = document.querySelector("#reset");
const $stopButton = document.querySelector("#stop");
const $categoryButtons = document.querySelectorAll(".category-button");

const INITIAL_TIME = 10;
const WORDS_PER_BATCH = 30;
const REFRES_THRESHOLD = 16;

let words = [];
let currentWords = htmlWords;
let currentTime = INITIAL_TIME;
let correctWords = 0;
let correctLetters = 0;
let incorrectLetters = 0;
let playing = false;
let interval;
let currentWordIndex = 0;
let wordsCompletedInCurrentBatch = 0;

function initGame() {
  playing = false;
  words = currentWords.sort(() => Math.random() - 0.5);
  currentTime = INITIAL_TIME;
  correctWords = 0;
  correctLetters = 0;
  incorrectLetters = 0;
  currentWordIndex = 0;
  wordsCompletedInCurrentBatch = 0;
  $time.textContent = `${currentTime}s`;
  $accuracy.textContent = `0%`;
  $wpm.textContent = `0`;
  $rank.textContent = `-`;
  $rankPercentile.textContent = ``;
  renderWords();
}

// funcion para comenzar el juego
function startGame() {
  if (playing) return; // si comenzo el game, no se hace nada
  playing = true;
  // disminuye el tiempo cada seg
  interval = setInterval(() => {
    currentTime--;
    $time.textContent = `${currentTime}s`;
    //cuando llege a 0 se para el gamee
    if (currentTime <= 0) {
      clearInterval(interval); // se detiene el temporizador
      $time.textContent = "0s"; // se pone el tiempo en 0
      gameOver();
    }
  }, 1000); // cada (1s)
}

// parar el game manualmente
function stopGame() {
  if (!playing) return;
  clearInterval(interval);
  playing = false; // el juego ha terminado
  gameOver();
}

$stopButton.addEventListener("click", stopGame);

function gameOver() {
  playing = false;
  const totalLetters = correctLetters + incorrectLetters; // total de letras
  const accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0; // calcular precision
  $accuracy.textContent = `${accuracy.toFixed(2)}%`; // mostrar precision
  const wpm = (correctWords * 60) / INITIAL_TIME; // calcular wpm
  $wpm.textContent = `${wpm.toFixed(0)}`; // mostrar wpm

  // mostrar un rank aleatorio xd
  const rank = Math.floor(Math.random() * 100) + 1;
  $rank.textContent = `${rank}`;
  $rankPercentile.textContent = `Top ${
    Math.floor(Math.random() * 20) + 1
  }% of players`;
}

// cambiar de categoria
function changeCategory(newWords) {
  currentWords = newWords;
  initGame(); // reiniciar el game conla nueva categoria
}
// asignar event Click a los buttons de categoria
$categoryButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const category = e.target.textContent; // obtener la categoria seleccionada

    // cambiar las palabras dependiendo de la categoria
    switch (category) {
      case "Space":
        changeCategory(spaceWords);
        break;
      case "HTML":
        changeCategory(htmlWords);
        break;
      case "CSS":
        changeCategory(cssWords);
        break;
      case "JavaScript":
        changeCategory(javascriptWords);
        break;
      case "ArchLinux":
        changeCategory(archlinux);
        break;
      default:
        break;
    }
  });
});

// eventos de teclado
document.addEventListener("keydown", (e) => {
  if (!playing) startGame(); // si no se esta jugando, se inicia el game apretando cualquier tecla

  // verificar si se escribio bien/mal la letra y palabra
  const activeWord = $paragraph.querySelector("word.active");
  const activeLetter = activeWord.querySelector("letter.active");

  let keyPressed = e.key; // obtener la tecla presionada

  // ignorar estas teclas
  if (
    e.key === "Shift" ||
    e.key === "Control" ||
    e.key === "Alt" ||
    e.ley === "CapsLock"
  ) {
    return;
  }
  // teclas especiales que se pueden usar
  const specialChars = {
    "<": "<",
    ">": ">",
    "/": "/",
    "-": "-",
  };
  if (specialChars[keyPressed]) {
    keyPressed = specialChars[keyPressed];
  }
  // si se preciona el space se preve su comportamiento por defecto
  if (keyPressed === " ") {
    e.preventDefault();
    // comprobar si la palabra tiene errores
    const hasErrors =
      activeWord.querySelectorAll("letter:not(.correct)").length > 0;
    if (!hasErrors) correctWords++; // incrementamos el contador de palabras correctas

    activeWord.classList.remove("active");
    wordsCompletedInCurrentBatch++; // Incrementamos el contador de palabras completadas de este grupo

    // si se completo el grupo de palabras, se genera otro grupo
    if (wordsCompletedInCurrentBatch === REFRES_THRESHOLD) {
      currentWordIndex += REFRES_THRESHOLD;
      wordsCompletedInCurrentBatch = 0;
      renderWords();
    } else {
      //mientras no se llege al max de palabras por grupo, se activa la proxima palabra
      const nextWord = activeWord.nextElementSibling;
      if (nextWord) {
        nextWord.classList.add("active");
        nextWord.querySelector("letter").classList.add("active");
      }
    }

    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault(); // evitar el comportamiento por defecto del backspace
    const prevLetter = activeLetter.previousElementSibling; // obtener la letra anterior
    if (prevLetter) {
      activeLetter.classList.remove("active");
      prevLetter.classList.add("active");
    }
    return;
  }
  // saber si la letra presionada es correcta o no
  const letterClass =
    keyPressed === activeLetter.innerText ? "correct" : "incorrect"; // comparar la letra presionada con la letra activa
  activeLetter.classList.add(letterClass); // agregar la clase correspondiente
  letterClass === "correct" ? correctLetters++ : incorrectLetters++;

  // cambiar la letra activa por la siguiente
  activeLetter.classList.remove("active"); // quitar el active se la letra actual
  const nextLetter = activeLetter.nextElementSibling; // obtener la letra siguiente
  if (nextLetter) {
    nextLetter.classList.add("active"); // si hay otra letra, se le añade el active
  }
});

// mostrar las palabras
function renderWords() {
  const visibleWords = words.slice(
    currentWordIndex, // (0)
    currentWordIndex + WORDS_PER_BATCH // (0 a 30)
  );

  // Si no quedan suficientes palabras, volver a mezclar y reutilizar
  if (visibleWords.length === 0) {
    words = currentWords.sort(() => Math.random() - 0.5);
    currentWordIndex = 0; // mostrar desde el principip el nuevo grupo de palabras
    renderWords(); // generar las palabras
    return;
  }

  // Generamos el HTML para mostrar las palabras en la pantalla
  $paragraph.innerHTML = visibleWords
    .map((word) => {
      // por cada palabra, se genera etiqueta <letter> para cada letra
      return `<word>${[...word]
        .map((letter) => `<letter>${letter}</letter>`)
        .join("")}</word>`;
    })
    .join(""); // Unimos todas las palabras generadas en una sola cadena de HTML

  // Selecciona la primera palabra del parrafo y la marca como activa
  const firstWord = $paragraph.querySelector("word");
  if (firstWord) {
    firstWord.classList.add("active"); // se le pone la clase active a la primera palabra
    firstWord.querySelector("letter").classList.add("active"); // se le pone la clase active a la primera letra de la primera palabra
  }
}

$resetButton.addEventListener("click", initGame); // evento para reiniciar el juego
initGame();
