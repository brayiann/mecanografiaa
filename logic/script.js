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

const INITIAL_TIME = 60;
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

function startGame() {
  if (playing) return;
  playing = true;

  interval = setInterval(() => {
    currentTime--;
    $time.textContent = `${currentTime}s`;

    if (currentTime === 0) {
      clearInterval(interval);
      gameOver();
    }
  }, 1000);
}

function stopGame() {
  if (!playing) return;
  clearInterval(interval);
  playing = false;
  gameOver();
}

$stopButton.addEventListener("click", stopGame);

function gameOver() {
  playing = false;
  const totalLetters = correctLetters + incorrectLetters;
  const accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0;
  $accuracy.textContent = `${accuracy.toFixed(2)}%`;
  const wpm = (correctWords * 60) / INITIAL_TIME;
  $wpm.textContent = `${wpm.toFixed(0)}`;

  const rank = Math.floor(Math.random() * 100) + 1;
  $rank.textContent = `${rank}`;
  $rankPercentile.textContent = `Top ${
    Math.floor(Math.random() * 20) + 1
  }% of players`;
}

function changeCategory(newWords) {
  currentWords = newWords;
  initGame();
}

$categoryButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const category = e.target.textContent;

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

document.addEventListener("keydown", (e) => {
  if (!playing) startGame();

  const activeWord = $paragraph.querySelector("word.active");
  const activeLetter = activeWord.querySelector("letter.active");

  let keyPressed = e.key;

  if (
    e.key === "Shift" ||
    e.key === "Control" ||
    e.key === "Alt" ||
    e.ley === "CapsLock"
  ) {
    return;
  }

  const specialChars = {
    "<": "<",
    ">": ">",
    "/": "/",
    "-": "-",
  };
  if (specialChars[keyPressed]) {
    keyPressed = specialChars[keyPressed];
  }

  if (keyPressed === " ") {
    e.preventDefault();
    const hasErrors =
      activeWord.querySelectorAll("letter:not(.correct)").length > 0;
    if (!hasErrors) correctWords++;

    activeWord.classList.remove("active");
    wordsCompletedInCurrentBatch++;

    if (wordsCompletedInCurrentBatch === REFRES_THRESHOLD) {
      currentWordIndex += REFRES_THRESHOLD;
      wordsCompletedInCurrentBatch = 0;
      renderWords();
    } else {
      const nextWord = activeWord.nextElementSibling;
      if (nextWord) {
        nextWord.classList.add("active");
        nextWord.querySelector("letter").classList.add("active");
      }
    }

    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    const prevLetter = activeLetter.previousElementSibling;
    if (prevLetter) {
      activeLetter.classList.remove("active");
      prevLetter.classList.add("active");
    }
    return;
  }

  const letterClass =
    keyPressed === activeLetter.innerText ? "correct" : "incorrect";
  activeLetter.classList.add(letterClass);
  letterClass === "correct" ? correctLetters++ : incorrectLetters++;

  activeLetter.classList.remove("active");
  const nextLetter = activeLetter.nextElementSibling;
  if (nextLetter) {
    nextLetter.classList.add("active");
  }
});

function renderWords() {
  const visibleWords = words.slice(
    currentWordIndex,
    currentWordIndex + WORDS_PER_BATCH
  );

  // Si no quedan suficientes palabras, volver a mezclar y reutilizar
  if (visibleWords.length === 0) {
    words = currentWords.sort(() => Math.random() - 0.5);
    currentWordIndex = 0;
    renderWords();
    return;
  }

  $paragraph.innerHTML = visibleWords
    .map((word) => {
      return `<word>${[...word]
        .map((letter) => `<letter>${letter}</letter>`)
        .join("")}</word>`;
    })
    .join("");

  const firstWord = $paragraph.querySelector("word");
  if (firstWord) {
    firstWord.classList.add("active");
    firstWord.querySelector("letter").classList.add("active");
  }
}

$resetButton.addEventListener("click", initGame);
initGame();
