/**
 * EmbeddedZero — Interactive Quiz Engine
 * Renders MCQ quizzes with instant feedback, explanations, scoring,
 * and localStorage persistence.
 *
 * Usage:
 *   <div id="quiz-root"></div>
 *   <script>
 *     QuizEngine.init('quiz-root', {
 *       id: 'lesson-01-ohms-law',
 *       title: "Ohm's Law Quiz",
 *       questions: [ ... ]
 *     });
 *   </script>
 */
var QuizEngine = (function () {
  'use strict';

  var STORAGE_PREFIX = 'ez-quiz-';
  var state = {};

  function init(containerId, config) {
    var el = document.getElementById(containerId);
    if (!el) return;

    state = {
      el: el,
      id: config.id || 'quiz',
      title: config.title || 'Quiz',
      questions: config.questions || [],
      current: 0,
      answers: [],       // user's selected index per question
      answered: [],       // boolean — has question been answered?
      score: 0,
      finished: false
    };

    // Try to restore previous attempt
    var saved = loadState();
    if (saved && saved.finished) {
      state.answers = saved.answers;
      state.answered = saved.answered;
      state.score = saved.score;
      state.finished = true;
      renderResults();
      return;
    }

    // Initialize arrays
    for (var i = 0; i < state.questions.length; i++) {
      state.answers.push(-1);
      state.answered.push(false);
    }

    renderQuestion();
  }

  function renderQuestion() {
    var q = state.questions[state.current];
    var num = state.current + 1;
    var total = state.questions.length;
    var pct = Math.round((num / total) * 100);
    var letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    var html = '';
    html += '<div class="quiz-interactive">';

    // Header
    html += '<div class="quiz-header">';
    html += '<h3>📝 ' + state.title + '</h3>';
    html += '<div class="quiz-progress">';
    html += '<span>' + num + ' / ' + total + '</span>';
    html += '<div class="prog-bar"><div class="prog-fill" style="width:' + pct + '%"></div></div>';
    html += '</div>';
    html += '</div>';

    // Question
    html += '<div class="quiz-question">';
    html += '<div class="q-number">Question ' + num + ' of ' + total + '</div>';
    html += '<div class="q-text">' + q.question + '</div>';

    // Options
    html += '<div class="quiz-options">';
    for (var i = 0; i < q.options.length; i++) {
      var cls = 'quiz-option';
      var isAnswered = state.answered[state.current];

      if (isAnswered) {
        cls += ' disabled';
        if (i === q.correct) cls += ' correct';
        if (state.answers[state.current] === i && i !== q.correct) cls += ' wrong';
      } else if (state.answers[state.current] === i) {
        cls += ' selected';
      }

      html += '<div class="' + cls + '" data-idx="' + i + '">';
      html += '<span class="opt-letter">' + letters[i] + '</span>';
      html += '<span>' + q.options[i] + '</span>';
      html += '</div>';
    }
    html += '</div>';

    // Explanation (if answered)
    if (isAnswered && q.explanation) {
      var correct = state.answers[state.current] === q.correct;
      html += '<div class="quiz-explanation ' + (correct ? 'is-correct' : 'is-wrong') + '">';
      html += '<strong>' + (correct ? '✅ Correct!' : '❌ Incorrect.') + '</strong> ';
      html += q.explanation;
      html += '</div>';
    }

    // Navigation
    html += '<div class="quiz-nav">';
    if (state.current > 0) {
      html += '<button class="quiz-btn quiz-btn-outline" data-action="prev">← Previous</button>';
    }
    if (!isAnswered) {
      html += '<button class="quiz-btn quiz-btn-primary" data-action="check" ' +
        (state.answers[state.current] === -1 ? 'disabled' : '') +
        '>Check Answer</button>';
    } else if (state.current < state.questions.length - 1) {
      html += '<button class="quiz-btn quiz-btn-primary" data-action="next">Next →</button>';
    } else {
      html += '<button class="quiz-btn quiz-btn-primary" data-action="finish">See Results</button>';
    }
    html += '</div>';

    html += '</div>'; // quiz-question
    html += '</div>'; // quiz-interactive

    state.el.innerHTML = html;
    bindEvents();
  }

  function renderResults() {
    // Calculate score
    var correct = 0;
    for (var i = 0; i < state.questions.length; i++) {
      if (state.answers[i] === state.questions[i].correct) correct++;
    }
    state.score = correct;
    state.finished = true;
    saveState();

    var total = state.questions.length;
    var pct = Math.round((correct / total) * 100);
    var grade = pct >= 80 ? 'excellent' : (pct >= 50 ? 'good' : 'poor');
    var msg = pct >= 80 ? 'Excellent work! 🎉' : (pct >= 50 ? 'Good effort! Keep going.' : 'Review the lesson and try again.');

    var html = '';
    html += '<div class="quiz-interactive">';
    html += '<div class="quiz-results">';

    html += '<div class="score-circle ' + grade + '">';
    html += '<span class="score-num">' + pct + '%</span>';
    html += '<span class="score-label">' + correct + ' / ' + total + '</span>';
    html += '</div>';

    html += '<div class="result-msg">' + msg + '</div>';
    html += '<div class="result-detail">You answered ' + correct + ' out of ' + total + ' questions correctly.</div>';

    html += '<div class="result-actions">';
    html += '<button class="quiz-btn quiz-btn-outline" data-action="review">Review Answers</button>';
    html += '<button class="quiz-btn quiz-btn-primary" data-action="retry">Try Again</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    state.el.innerHTML = html;

    // Bind result actions
    var btns = state.el.querySelectorAll('[data-action]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function (e) {
        var action = this.getAttribute('data-action');
        if (action === 'retry') {
          clearState();
          state.current = 0;
          state.answers = [];
          state.answered = [];
          state.score = 0;
          state.finished = false;
          for (var j = 0; j < state.questions.length; j++) {
            state.answers.push(-1);
            state.answered.push(false);
          }
          renderQuestion();
        } else if (action === 'review') {
          state.current = 0;
          renderQuestion();
        }
      });
    }
  }

  function bindEvents() {
    // Option click
    var opts = state.el.querySelectorAll('.quiz-option:not(.disabled)');
    for (var o = 0; o < opts.length; o++) {
      opts[o].addEventListener('click', function () {
        if (state.answered[state.current]) return;
        var idx = parseInt(this.getAttribute('data-idx'));
        state.answers[state.current] = idx;
        renderQuestion();
      });
    }

    // Button click
    var btns = state.el.querySelectorAll('[data-action]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'check') {
          state.answered[state.current] = true;
          renderQuestion();
        } else if (action === 'next') {
          state.current++;
          renderQuestion();
        } else if (action === 'prev') {
          state.current--;
          renderQuestion();
        } else if (action === 'finish') {
          renderResults();
        }
      });
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_PREFIX + state.id, JSON.stringify({
        answers: state.answers,
        answered: state.answered,
        score: state.score,
        finished: state.finished
      }));
    } catch (e) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + state.id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearState() {
    try {
      localStorage.removeItem(STORAGE_PREFIX + state.id);
    } catch (e) {}
  }

  // Public API for quiz index page — get best scores
  function getScore(quizId) {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + quizId);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data.finished ? data.score : null;
    } catch (e) { return null; }
  }

  return {
    init: init,
    getScore: getScore
  };
})();
