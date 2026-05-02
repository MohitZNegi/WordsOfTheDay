// State management
let allWords = {};
let currentView = "list";
let currentState = "dates";
let selectedDate = null;
let selectedWord = null;
let quizState = null;

// Initialize
document.addEventListener("DOMContentLoaded", init);

function init() {
  attachEventListeners();
  loadWords();
}

// Attach event listeners
function attachEventListeners() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", switchView);
  });

  document.getElementById("backBtn").addEventListener("click", goBackToDatesList);
  document.getElementById("backToWordsBtn").addEventListener("click", goBackToWordsList);
  document.getElementById("calendarBackBtn").addEventListener("click", goBackToCalendar);
  document.getElementById("quizBackBtn").addEventListener("click", goBackToList);

  document.getElementById("deleteWordBtn").addEventListener("click", deleteCurrentWord);
  document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
}

// Load words
function loadWords() {
  chrome.runtime.sendMessage({ action: "getWords" }, (words) => {
    allWords = words || {};
    renderDatesList();
  });
}

// Render dates list
function renderDatesList() {
  const datesList = document.getElementById("datesList");
  const dates = Object.keys(allWords).sort().reverse();

  datesList.innerHTML = "";

  if (dates.length === 0) {
    datesList.innerHTML = '<p class="empty-state">No words saved yet.</p>';
    return;
  }

  dates.forEach(date => {
    const container = document.createElement("div");
    container.className = "date-item";

    const header = document.createElement("div");
    header.className = "date-header";

    header.innerHTML = `
      <span class="date-label">${formatDate(date)}</span>
      <span class="word-count">${allWords[date].length} word(s)</span>
    `;

    header.addEventListener("click", () => selectDate(date));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger btn-small";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteDate(date));

    container.appendChild(header);
    container.appendChild(deleteBtn);
    datesList.appendChild(container);
  });
}

// Select date
function selectDate(date) {
  selectedDate = date;
  currentState = "words";
  showWordsForDate(date);
}

// Show words
function showWordsForDate(date) {
  document.getElementById("datesList").classList.add("hidden");
  document.getElementById("wordsContainer").classList.remove("hidden");

  const wordsList = document.getElementById("wordsList");
  wordsList.innerHTML = "";

  allWords[date].forEach((wordObj, index) => {
    const item = document.createElement("div");
    item.className = "word-item";

    item.innerHTML = `
      <span class="word-text">${wordObj.word}</span>
      <span class="word-type">${wordObj.meaning}</span>
    `;

    item.addEventListener("click", () => selectWord(date, index));
    wordsList.appendChild(item);
  });
}

// Select word
function selectWord(date, index) {
  selectedDate = date;
  selectedWord = index;
  currentState = "wordDetails";
  showWordDetails(date, index);
}

// Show details
function showWordDetails(date, index) {
  document.getElementById("wordsContainer").classList.add("hidden");
  document.getElementById("wordDetailsContainer").classList.remove("hidden");

  const wordObj = allWords[date][index];

  document.getElementById("selectedWord").textContent = wordObj.word;
  document.getElementById("wordMeaning").textContent = wordObj.meaning;
  document.getElementById("wordDefinition").textContent = wordObj.definition;
  document.getElementById("wordExample").textContent = wordObj.example;
}

// Navigation
function goBackToDatesList() {
  document.getElementById("datesList").classList.remove("hidden");
  document.getElementById("wordsContainer").classList.add("hidden");
}

function goBackToWordsList() {
  document.getElementById("wordDetailsContainer").classList.add("hidden");
  document.getElementById("wordsContainer").classList.remove("hidden");
}

function goBackToCalendar() {
  document.getElementById("calendarWordsContainer").classList.add("hidden");
  document.getElementById("calendar").classList.remove("hidden");
}

function goBackToList() {
  document.getElementById("quizView").classList.add("hidden");
  document.getElementById("listView").classList.remove("hidden");
  quizState = null;
}

// Delete
function deleteCurrentWord() {
  if (!selectedDate || selectedWord === null) return;

  chrome.runtime.sendMessage(
    {
      action: "deleteWord",
      date: selectedDate,
      word: allWords[selectedDate][selectedWord].word
    },
    () => {
      loadWords();
      goBackToWordsList();
    }
  );
}

function deleteDate(date) {
  if (confirm(`Delete all words from ${formatDate(date)}?`)) {
    chrome.runtime.sendMessage({ action: "deleteDate", date }, loadWords);
  }
}

// View switch
function switchView(e) {
  const viewName = e.target.dataset.view;

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));

  if (viewName === "list") {
    document.getElementById("listView").classList.remove("hidden");
    renderDatesList();
  } else {
    document.getElementById("calendarView").classList.remove("hidden");
    renderCalendar();
  }
}

// Calendar (fixed)
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const title = document.createElement("h2");
  title.textContent = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasWords = allWords[dateStr];

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    cell.innerHTML = `<span>${day}</span>`;

    if (hasWords) {
      cell.classList.add("has-words");
      cell.addEventListener("click", () => selectDateFromCalendar(dateStr));
    }

    grid.appendChild(cell);
  }

  calendar.appendChild(title);
  calendar.appendChild(grid);
}

// Calendar select
function selectDateFromCalendar(date) {
  if (!allWords[date]) return;

  document.getElementById("calendar").classList.add("hidden");
  document.getElementById("calendarWordsContainer").classList.remove("hidden");

  const list = document.getElementById("calendarWordsList");
  list.innerHTML = "";

  allWords[date].forEach(wordObj => {
    const item = document.createElement("div");
    item.className = "word-item";
    item.textContent = `${wordObj.word} - ${wordObj.meaning}`;
    list.appendChild(item);
  });
}

// Quiz
function startQuiz() {
  const all = Object.values(allWords).flat();

  if (!all.length) return alert("No words yet!");

  quizState = { words: all, index: 0, score: 0 };

  document.getElementById("listView").classList.add("hidden");
  document.getElementById("quizView").classList.remove("hidden");

  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizState.words[quizState.index];
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  const title = document.createElement("h3");
  title.innerHTML = `What does "<b>${q.word}</b>" mean?`;

  const correct = q.definition;
  const wrong = generateWrongAnswers(correct, quizState.words);
  const options = [correct, ...wrong].sort(() => Math.random() - 0.5);

  container.appendChild(title);

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;

    btn.addEventListener("click", () => {
      if (opt === correct) quizState.score++;

      quizState.index++;

      if (quizState.index >= quizState.words.length) {
        showResults();
      } else {
        showQuizQuestion();
      }
    });

    container.appendChild(btn);
  });
}

function showResults() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = `<h2>Score: ${quizState.score}</h2>`;

  const btn = document.createElement("button");
  btn.textContent = "Back";
  btn.addEventListener("click", goBackToList);

  container.appendChild(btn);
}

function generateWrongAnswers(correct, words) {
  return words
    .map(w => w.definition)
    .filter(def => def !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

// Format date
function formatDate(dateStr) {
  return new Date(dateStr).toDateString();
}