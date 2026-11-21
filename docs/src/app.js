const papers = [
  {
    year: "115",
    session: "第 4-3 次",
    subject: "first",
    subjectLabel: "第一科｜人工智慧基礎概論",
    file: "115年第4-3次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260906220418.pdf",
  },
  {
    year: "115",
    session: "第 4-3 次",
    subject: "second",
    subjectLabel: "第二科｜生成式 AI 應用與規劃",
    file: "115年第4-3次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260906220452.pdf",
  },
  {
    year: "115",
    session: "第 4-2 次",
    subject: "first",
    subjectLabel: "第一科｜人工智慧基礎概論",
    file: "115年第4-2次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260604212644.pdf",
  },
  {
    year: "115",
    session: "第 4-2 次",
    subject: "second",
    subjectLabel: "第二科｜生成式 AI 應用與規劃",
    file: "115年第4-2次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260604212719.pdf",
  },
  {
    year: "115",
    session: "第 4-1 次",
    subject: "first",
    subjectLabel: "第一科｜人工智慧基礎概論",
    file: "115年第4-1次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260410164304.pdf",
  },
  {
    year: "115",
    session: "第 4-1 次",
    subject: "second",
    subjectLabel: "第二科｜生成式 AI 應用與規劃",
    file: "115年第4-1次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260410164328.pdf",
  },
  {
    year: "114",
    session: "第 4-4 次",
    subject: "first",
    subjectLabel: "第一科｜人工智慧基礎概論",
    file: "114年第4-4次初級AI應用規劃師_第一科_人工智慧基礎概論(當次試題公告114_20251226000442.pdf",
  },
  {
    year: "114",
    session: "第 4-4 次",
    subject: "second",
    subjectLabel: "第二科｜生成式 AI 應用與規劃",
    file: "114年第4-4次初級AI應用規劃師_第二科_生成式AI應用與規劃(當次試題公告114_20251226000507.pdf",
  },
];

const searchInput = document.querySelector("#search");
const yearFilter = document.querySelector("#year-filter");
const subjectFilter = document.querySelector("#subject-filter");
const paperList = document.querySelector("#paper-list");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const questionBank = window.QUESTION_BANK;
const questions = questionBank && Array.isArray(questionBank.questions)
  ? questionBank.questions
  : [];
const questionCount = document.querySelector("#question-count");
const practiceForm = document.querySelector("#practice-filters");
const questionSearch = document.querySelector("#question-search");
const practiceYear = document.querySelector("#practice-year");
const practiceSubject = document.querySelector("#practice-subject");
const practiceScenario = document.querySelector("#practice-scenario");
const startPracticeButton = document.querySelector("#start-practice");
const practiceEmpty = document.querySelector("#practice-empty");
const quizCard = document.querySelector("#quiz-card");
const quizMeta = document.querySelector("#quiz-meta");
const quizProgress = document.querySelector("#quiz-progress");
const questionText = document.querySelector("#question-text");
const choices = document.querySelector("#choices");
const feedback = document.querySelector("#feedback");
const feedbackText = document.querySelector("#feedback-text");
const sourceLink = document.querySelector("#source-link");
const previousButton = document.querySelector("#previous-question");
const checkButton = document.querySelector("#check-answer");
const nextButton = document.querySelector("#next-question");
const quizSummary = document.querySelector("#quiz-summary");
const summaryText = document.querySelector("#summary-text");
const dataError = document.querySelector("#data-error");
const recordSummary = document.querySelector("#record-summary");
const recordError = document.querySelector("#record-error");
const wrongQuestionList = document.querySelector("#wrong-question-list");
const wrongEmpty = document.querySelector("#wrong-empty");
const statsOverview = document.querySelector("#stats-overview");
const yearStats = document.querySelector("#year-stats");
const subjectStats = document.querySelector("#subject-stats");
const scenarioStats = document.querySelector("#scenario-stats");
const scenarioCategories = questionBank && Array.isArray(questionBank.scenario_categories)
  ? questionBank.scenario_categories
  : [];
const selectedAnswers = new Map();
const checkedQuestions = new Set();
const RECORDS_STORAGE_KEY = "ai-study-answer-records";
let answerRecords = {};
let recordStorageAvailable = true;
let practiceQuestions = [];
let currentQuestionIndex = 0;

function showRecordError(message) {
  recordError.textContent = message;
  recordError.hidden = false;
}

function loadAnswerRecords() {
  try {
    const storedRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!storedRecords) {
      return {};
    }

    const parsedRecords = JSON.parse(storedRecords);
    if (
      !parsedRecords ||
      parsedRecords.schema_version !== 1 ||
      !parsedRecords.answers ||
      typeof parsedRecords.answers !== "object" ||
      Array.isArray(parsedRecords.answers)
    ) {
      throw new Error("作答紀錄格式不正確。");
    }

    for (const [questionId, record] of Object.entries(parsedRecords.answers)) {
      if (
        !questionId ||
        !record ||
        !["A", "B", "C", "D"].includes(record.answer) ||
        typeof record.is_correct !== "boolean" ||
        typeof record.checked_at !== "string" ||
        (record.note !== undefined && typeof record.note !== "string")
      ) {
        throw new Error("作答紀錄內容不完整。");
      }
    }

    return parsedRecords.answers;
  } catch (error) {
    recordStorageAvailable = false;
    showRecordError(`無法讀取本機作答紀錄：${error.message}`);
    return {};
  }
}

function persistAnswerRecords(updatedRecords) {
  if (!recordStorageAvailable) {
    answerRecords = updatedRecords;
    showRecordError("本機作答紀錄無法讀取；本次結果只保留在目前頁面，重新載入後會遺失。");
    return false;
  }

  try {
    window.localStorage.setItem(
      RECORDS_STORAGE_KEY,
      JSON.stringify({ schema_version: 1, answers: updatedRecords })
    );
  } catch (error) {
    answerRecords = updatedRecords;
    showRecordError(
      `無法永久儲存本機作答紀錄：${error.message} 本次結果只保留在目前頁面，重新載入後會遺失。`
    );
    return false;
  }

  answerRecords = updatedRecords;
  recordError.hidden = true;
  return true;
}

function saveAnswerRecord(question, answer) {
  const updatedRecords = {
    ...answerRecords,
    [question.id]: {
      ...answerRecords[question.id],
      answer,
      is_correct: answer === question.answer,
      checked_at: new Date().toISOString(),
    },
  };

  persistAnswerRecords(updatedRecords);
  renderAnswerRecords();
  renderLearningStats();
}

function renderAnswerRecords() {
  const knownRecords = getKnownAnswerRecords();
  const reviewRecords = knownRecords
    .filter(({ record }) => !record.is_correct || Boolean(record.note && record.note.trim()))
    .sort((left, right) => right.record.checked_at.localeCompare(left.record.checked_at));
  updateRecordSummary(knownRecords);
  wrongEmpty.hidden = reviewRecords.length > 0;
  wrongQuestionList.replaceChildren(...reviewRecords.map(createWrongQuestionCard));
}

function getKnownAnswerRecords() {
  const questionById = new Map(questions.map((question) => [question.id, question]));
  return Object.entries(answerRecords)
    .map(([questionId, record]) => ({
      question: questionById.get(questionId),
      record,
    }))
    .filter(({ question }) => question);
}

function updateRecordSummary(knownRecords = getKnownAnswerRecords()) {
  const wrongCount = knownRecords.filter(({ record }) => !record.is_correct).length;
  const noteCount = knownRecords.filter(({ record }) => record.note && record.note.trim()).length;
  recordSummary.textContent =
    `已核對 ${knownRecords.length} 題 · 錯題 ${wrongCount} 題 · 筆記 ${noteCount} 則`;
}

function summarizeQuestions(questionSet) {
  const records = questionSet
    .map((question) => answerRecords[question.id])
    .filter((record) => record);
  return {
    total: questionSet.length,
    answered: records.length,
    correct: records.filter((record) => record.is_correct).length,
  };
}

function accuracyText(stats) {
  return stats.answered
    ? `${((stats.correct / stats.answered) * 100).toFixed(1)}%`
    : "—";
}

function createStatsCard(label, value, detail) {
  const card = document.createElement("article");
  card.className = "stats-card";

  const title = document.createElement("span");
  title.textContent = label;

  const number = document.createElement("strong");
  number.textContent = value;

  const description = document.createElement("small");
  description.textContent = detail;

  card.append(title, number, description);
  return card;
}

function createStatsRow(label, questionsInGroup) {
  const stats = summarizeQuestions(questionsInGroup);
  const row = document.createElement("article");
  row.className = "stats-row";

  const details = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = label;

  const description = document.createElement("p");
  description.textContent = stats.answered
    ? `已核對 ${stats.answered} / ${stats.total} 題 · 答對 ${stats.correct} 題`
    : `尚無作答 · 共 ${stats.total} 題`;
  details.append(title, description);

  const rate = document.createElement("strong");
  rate.className = "stats-rate";
  rate.textContent = accuracyText(stats);

  row.append(details, rate);
  return row;
}

function renderGroupStats(container, groups) {
  container.replaceChildren(
    ...groups.map(({ label, groupQuestions }) =>
      createStatsRow(label, groupQuestions)
    )
  );
}

function renderLearningStats() {
  const overall = summarizeQuestions(questions);
  statsOverview.replaceChildren(
    createStatsCard(
      "已核對",
      `${overall.answered} / ${overall.total}`,
      "已核對題數 / 題庫總數"
    ),
    createStatsCard(
      "答對",
      overall.answered ? `${overall.correct} / ${overall.answered}` : "—",
      "答對題數 / 已核對題數"
    ),
    createStatsCard(
      "正確率",
      accuracyText(overall),
      "依每題最近一次核對結果"
    )
  );

  const years = [...new Set(questions.map((question) => question.year))]
    .sort((left, right) => Number(right) - Number(left));
  renderGroupStats(
    yearStats,
    years.map((year) => ({
      label: `${year} 年`,
      groupQuestions: questions.filter((question) => question.year === year),
    }))
  );

  const subjects = [...new Set(questions.map((question) => question.subject_label))];
  renderGroupStats(
    subjectStats,
    subjects.map((subjectLabel) => ({
      label: subjectLabel,
      groupQuestions: questions.filter(
        (question) => question.subject_label === subjectLabel
      ),
    }))
  );

  renderGroupStats(
    scenarioStats,
    scenarioCategories.map((category) => ({
      label: category.label,
      groupQuestions: questions.filter((question) =>
        question.scenario_tags.includes(category.id)
      ),
    }))
  );
}

function createWrongQuestionCard({ question, record }) {
  const card = document.createElement("article");
  card.className = "wrong-question-card";
  card.classList.toggle("is-corrected", record.is_correct);

  const meta = document.createElement("p");
  meta.className = "quiz-progress";
  meta.textContent =
    `${question.year} 年 ${question.session} · ${question.subject_label} · 第 ${question.number} 題`;

  const text = document.createElement("p");
  text.className = "wrong-question-text";
  text.textContent = question.question;

  const answer = document.createElement("p");
  answer.className = "wrong-answer";
  answer.textContent = record.is_correct
    ? "最近一次已答對；筆記保留供日後複習。"
    : `上次選擇 (${record.answer})；正確答案 (${question.answer}) ${question.choices[question.answer]}`;

  const noteLabel = document.createElement("label");
  noteLabel.className = "note-field";
  const noteLabelText = document.createElement("span");
  noteLabelText.textContent = "錯因筆記";

  const noteInput = document.createElement("textarea");
  noteInput.value = record.note || "";
  noteInput.placeholder = "記下答錯原因，或寫下下次提醒自己的重點。";
  noteInput.setAttribute("aria-label", `第 ${question.number} 題錯因筆記`);
  noteInput.addEventListener("input", () => {
    const updatedRecords = {
      ...answerRecords,
      [question.id]: {
        ...answerRecords[question.id],
        note: noteInput.value,
      },
    };
    const saved = persistAnswerRecords(updatedRecords);
    updateRecordSummary();
    noteStatus.textContent = saved
      ? "已保存"
      : "目前只保留在此頁，重新載入後可能遺失。";
  });
  noteInput.addEventListener("change", () => {
    if (record.is_correct && !noteInput.value.trim()) {
      renderAnswerRecords();
    }
  });

  const noteStatus = document.createElement("span");
  noteStatus.className = "note-status";
  noteStatus.setAttribute("role", "status");
  noteStatus.textContent = record.note ? "已保存" : "輸入內容會自動保存。";
  noteLabel.append(noteLabelText, noteInput);

  const retryButton = document.createElement("button");
  retryButton.className = "secondary-button";
  retryButton.type = "button";
  retryButton.textContent = "重做此題";
  retryButton.addEventListener("click", () => retryQuestion(question));

  card.append(meta, text, answer, noteLabel, noteStatus, retryButton);
  return card;
}

function retryQuestion(question) {
  practiceQuestions = [question];
  selectedAnswers.delete(question.id);
  checkedQuestions.delete(question.id);
  currentQuestionIndex = 0;
  quizSummary.hidden = true;
  practiceEmpty.hidden = true;
  quizCard.hidden = false;
  renderQuestion();
  quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderPapers() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const selectedYear = yearFilter.value;
  const selectedSubject = subjectFilter.value;
  const matchingPapers = papers.filter((paper) => {
    const searchableText = `${paper.year} ${paper.session} ${paper.subjectLabel}`.toLocaleLowerCase();
    return (
      (!searchTerm || searchableText.includes(searchTerm)) &&
      (!selectedYear || paper.year === selectedYear) &&
      (!selectedSubject || paper.subject === selectedSubject)
    );
  });

  resultCount.textContent = `共 ${matchingPapers.length} 份試題`;
  emptyState.hidden = matchingPapers.length > 0;
  paperList.replaceChildren(...matchingPapers.map(createPaperCard));
}

function createPaperCard(paper) {
  const card = document.createElement("article");
  card.className = "paper-card";

  const content = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "paper-meta";

  const yearBadge = document.createElement("span");
  yearBadge.className = "badge";
  yearBadge.textContent = `${paper.year} 年 ${paper.session}`;

  const subjectBadge = document.createElement("span");
  subjectBadge.className = "badge subject-badge";
  subjectBadge.textContent = paper.subject === "first" ? "第一科" : "第二科";

  const title = document.createElement("h3");
  title.textContent = paper.subjectLabel;

  const link = document.createElement("a");
  link.className = "paper-link";
  link.href = `../data/originals/${encodeURIComponent(paper.file)}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "開啟原始試題 PDF ↗";
  link.setAttribute("aria-label", `開啟 ${paper.year} 年 ${paper.session} ${paper.subjectLabel} PDF`);

  meta.append(yearBadge, subjectBadge);
  content.append(meta, title);
  card.append(content, link);
  return card;
}

function getFilteredQuestions() {
  const searchTerm = questionSearch.value.trim().toLocaleLowerCase();
  const selectedYear = practiceYear.value;
  const selectedSubject = practiceSubject.value;
  const selectedScenario = practiceScenario.value;

  return questions.filter((question) => {
    const searchableText = [
      question.year,
      question.session,
      question.subject_label,
      question.number,
      question.question,
      ...Object.values(question.choices),
    ].join(" ").toLocaleLowerCase();

    return (
      (!searchTerm || searchableText.includes(searchTerm)) &&
      (!selectedYear || question.year === selectedYear) &&
      (!selectedSubject || question.subject === selectedSubject) &&
      (!selectedScenario ||
        (selectedScenario === "unreviewed"
          ? !question.scenario_reviewed
          : selectedScenario === "unclassified"
            ? question.scenario_reviewed &&
              question.scenario_tags.length === 0
            : question.scenario_tags.includes(selectedScenario)))
    );
  });
}

function updateQuestionCount() {
  if (!questionBank || !Array.isArray(questionBank.questions)) {
    questionCount.textContent = "題庫資料未載入";
    startPracticeButton.disabled = true;
    document.querySelector("#total-question-count").textContent = "0";
    return;
  }

  const count = getFilteredQuestions().length;
  questionCount.textContent = `符合條件 ${count} 題`;
  startPracticeButton.disabled = count === 0;
  document.querySelector("#total-question-count").textContent =
    questionBank ? String(questionBank.question_count) : "0";
}

function renderQuestion() {
  const question = practiceQuestions[currentQuestionIndex];
  if (!question) {
    return;
  }

  quizMeta.replaceChildren();
  const badges = [
    `${question.year} 年 ${question.session}`,
    question.subject_label,
    `第 ${question.number} 題`,
  ];
  for (const text of badges) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = text;
    quizMeta.append(badge);
  }

  const answeredCount = practiceQuestions.filter((item) =>
    selectedAnswers.has(item.id)
  ).length;
  const correctCount = practiceQuestions.filter((item) =>
    checkedQuestions.has(item.id) && selectedAnswers.get(item.id) === item.answer
  ).length;
  quizProgress.textContent =
    `${currentQuestionIndex + 1} / ${practiceQuestions.length} 題` +
    ` · 已作答 ${answeredCount} 題 · 答對 ${correctCount} 題`;
  questionText.textContent = question.question;
  choices.replaceChildren(choices.querySelector("legend"));

  for (const [label, text] of Object.entries(question.choices).sort()) {
    const option = document.createElement("label");
    option.className = "choice";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "question-answer";
    input.value = label;
    input.checked = selectedAnswers.get(question.id) === label;
    input.addEventListener("change", () => {
      selectedAnswers.set(question.id, label);
      checkedQuestions.delete(question.id);
      feedback.hidden = true;
      updateQuizProgress();
    });

    const optionLabel = document.createElement("span");
    optionLabel.className = "choice-label";
    optionLabel.textContent = `(${label})`;

    const optionText = document.createElement("span");
    optionText.textContent = text;
    option.append(input, optionLabel, optionText);
    choices.append(option);
  }

  feedback.hidden = !checkedQuestions.has(question.id);
  if (!feedback.hidden) {
    showAnswerFeedback(question);
  } else {
    sourceLink.hidden = true;
  }

  previousButton.disabled = currentQuestionIndex === 0;
  nextButton.textContent =
    currentQuestionIndex === practiceQuestions.length - 1
      ? "完成本回合"
      : "下一題";
}

function updateQuizProgress() {
  const answeredCount = practiceQuestions.filter((question) =>
    selectedAnswers.has(question.id)
  ).length;
  const correctCount = practiceQuestions.filter((question) =>
    checkedQuestions.has(question.id) &&
    selectedAnswers.get(question.id) === question.answer
  ).length;
  quizProgress.textContent =
    `${currentQuestionIndex + 1} / ${practiceQuestions.length} 題` +
    ` · 已作答 ${answeredCount} 題 · 答對 ${correctCount} 題`;
}

function showAnswerFeedback(question) {
  const isCorrect = selectedAnswers.get(question.id) === question.answer;
  feedback.classList.toggle("is-correct", isCorrect);
  feedbackText.textContent = isCorrect
    ? "答對了！"
    : `再加油，正確答案是 (${question.answer}) ${question.choices[question.answer]}`;
  sourceLink.href =
    `../data/originals/${encodeURIComponent(question.source_file)}` +
    `#page=${question.source_page}`;
  sourceLink.textContent = `查看原始試題第 ${question.source_page} 頁`;
  sourceLink.hidden = false;
}

function startPractice(event) {
  event.preventDefault();
  practiceQuestions = getFilteredQuestions();
  selectedAnswers.clear();
  checkedQuestions.clear();
  currentQuestionIndex = 0;
  quizSummary.hidden = true;

  if (practiceQuestions.length === 0) {
    quizCard.hidden = true;
    practiceEmpty.hidden = false;
    return;
  }

  practiceEmpty.hidden = true;
  quizCard.hidden = false;
  renderQuestion();
}

function checkAnswer() {
  const question = practiceQuestions[currentQuestionIndex];
  if (!question) {
    return;
  }

  if (!selectedAnswers.has(question.id)) {
    feedback.classList.remove("is-correct");
    feedbackText.textContent = "請先選擇一個答案。";
    sourceLink.hidden = true;
    feedback.hidden = false;
    return;
  }

  checkedQuestions.add(question.id);
  feedback.hidden = false;
  showAnswerFeedback(question);
  saveAnswerRecord(question, selectedAnswers.get(question.id));
  updateQuizProgress();
}

function finishPractice() {
  const checkedCount = checkedQuestions.size;
  const correctCount = practiceQuestions.filter((question) =>
    checkedQuestions.has(question.id) &&
    selectedAnswers.get(question.id) === question.answer
  ).length;

  summaryText.textContent =
    `本回合共 ${practiceQuestions.length} 題，已核對 ${checkedCount} 題，答對 ${correctCount} 題。`;
  quizCard.hidden = true;
  quizSummary.hidden = false;
}

searchInput.addEventListener("input", renderPapers);
yearFilter.addEventListener("change", renderPapers);
subjectFilter.addEventListener("change", renderPapers);
document.querySelector("#filters").addEventListener("submit", (event) => {
  event.preventDefault();
});

questionSearch.addEventListener("input", updateQuestionCount);
practiceYear.addEventListener("change", updateQuestionCount);
practiceSubject.addEventListener("change", updateQuestionCount);
practiceScenario.addEventListener("change", updateQuestionCount);
practiceForm.addEventListener("submit", startPractice);
checkButton.addEventListener("click", checkAnswer);
previousButton.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    renderQuestion();
  }
});
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < practiceQuestions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
  } else {
    finishPractice();
  }
});
document.querySelector("#restart-practice").addEventListener("click", (event) => {
  startPractice(event);
});

if (!questionBank || !Array.isArray(questionBank.questions)) {
  dataError.hidden = false;
  startPracticeButton.disabled = true;
  questionCount.textContent = "題庫資料未載入";
}

for (const category of scenarioCategories) {
  const option = document.createElement("option");
  option.value = category.id;
  option.textContent = category.label;
  practiceScenario.append(option);
}

renderPapers();
updateQuestionCount();
answerRecords = loadAnswerRecords();
renderAnswerRecords();
renderLearningStats();
