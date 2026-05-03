'use client';

import { useState } from 'react';
import questions from '@/data/questions.json';

type Question = {
  num: number;
  body: string;
  choices: Record<string, string>;
  answers: string[];
  page: number;
};

const ALL_QUESTIONS: Question[] = questions as Question[];
const ANSWERED = ALL_QUESTIONS.filter(q => q.answers.length > 0);

type Mode = 'home' | 'quiz' | 'review' | 'results';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState<'practice' | 'exam'>('practice');
  const [questionCount, setQuestionCount] = useState(20);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showResultsReview, setShowResultsReview] = useState(false);

  const currentQ = quizQuestions[currentIdx];
  const totalQuestions = quizQuestions.length;
  const progress = totalQuestions > 0 ? (currentIdx / totalQuestions) * 100 : 0;

  const startQuiz = (qMode: 'practice' | 'exam') => {
    setQuizMode(qMode);
    const pool = ANSWERED;
    const selected = shuffleArray(pool).slice(0, Math.min(questionCount, pool.length));
    setQuizQuestions(selected);
    setCurrentIdx(0);
    setUserAnswers({});
    setShowAnswer(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMode('quiz');
  };

  const toggleAnswer = (letter: string) => {
    if (showAnswer) return;
    const qNum = currentQ.num;
    const isMulti = currentQ.answers.length > 1;
    setUserAnswers(prev => {
      const current = prev[qNum] || [];
      if (isMulti) {
        return current.includes(letter)
          ? { ...prev, [qNum]: current.filter(l => l !== letter) }
          : { ...prev, [qNum]: [...current, letter] };
      } else {
        return { ...prev, [qNum]: [letter] };
      }
    });
  };

  const checkAnswer = () => {
    const qNum = currentQ.num;
    const userAns = userAnswers[qNum] || [];
    const correct = currentQ.answers;
    const isCorrect = correct.length === userAns.length && correct.every(a => userAns.includes(a));
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const newS = s + 1;
        setBestStreak(b => Math.max(b, newS));
        return newS;
      });
    } else {
      setStreak(0);
    }
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= totalQuestions) {
      setMode('results');
    } else {
      setCurrentIdx(i => i + 1);
      setShowAnswer(false);
    }
  };

  const getFilteredReviewQuestions = () => {
    let qs = ALL_QUESTIONS;
    if (reviewFilter === 'answered') qs = qs.filter(q => q.answers.length > 0);
    if (reviewFilter === 'unanswered') qs = qs.filter(q => q.answers.length === 0);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      qs = qs.filter(q =>
        q.body.toLowerCase().includes(term) ||
        Object.values(q.choices).some(c => c.toLowerCase().includes(term))
      );
    }
    return qs;
  };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-4">
              <span className="text-3xl">🗄️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">MySQL ITS Reviewer</h1>
            <p className="text-slate-400 text-sm">ITS Database — USER SCHOOL</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{ALL_QUESTIONS.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Total Questions</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{ANSWERED.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">With Answer Keys</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Settings</h2>
            <label className="text-sm text-slate-300 block mb-2">
              Questions per session: <span className="text-emerald-400 font-bold">{questionCount}</span>
            </label>
            <input
              type="range"
              min={5}
              max={ANSWERED.length}
              step={5}
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>5</span>
              <span>{ANSWERED.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => startQuiz('practice')}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <span>⚡</span> Practice Mode
              <span className="text-emerald-300 text-xs font-normal">— instant feedback</span>
            </button>
            <button
              onClick={() => startQuiz('exam')}
              className="w-full py-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-semibold transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              <span>📝</span> Exam Simulation
              <span className="text-blue-300 text-xs font-normal">— review at end</span>
            </button>
            <button
              onClick={() => { setMode('review'); setSearchTerm(''); setReviewFilter('all'); setExpanded(null); }}
              className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <span>📖</span> Browse All Questions
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            Instructors: Charis Barbosa · Reban Cliff Fajardo · Fe Yara
          </p>
        </div>
      </div>
    );
  }

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (mode === 'review') {
    const filtered = getFilteredReviewQuestions();
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => setMode('home')} className="text-slate-400 hover:text-white text-sm">← Back</button>
              <h1 className="text-sm font-semibold text-white">All Questions</h1>
              <span className="text-xs text-slate-500 ml-auto">{filtered.length} shown</span>
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 mb-3"
            />
            <div className="flex gap-2">
              {(['all', 'answered', 'unanswered'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    reviewFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-4 space-y-2">
          {filtered.map(q => (
            <div key={q.num} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === q.num ? null : q.num)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-xs font-mono text-slate-500 w-8 flex-shrink-0">Q{q.num}</span>
                <span className="text-sm text-slate-200 flex-1 text-left line-clamp-2">
                  {q.body.length > 80 ? q.body.slice(0, 80) + '…' : q.body}
                </span>
                {q.answers.length > 0 ? (
                  <span className="flex-shrink-0 flex gap-1">
                    {q.answers.map(a => (
                      <span key={a} className="text-xs bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-bold">{a}</span>
                    ))}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600 flex-shrink-0">No key</span>
                )}
                <span className="text-slate-600 text-xs flex-shrink-0">{expanded === q.num ? '▲' : '▼'}</span>
              </button>
              {expanded === q.num && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-3">
                  <p className="text-sm text-slate-300 mb-3 leading-relaxed">{q.body}</p>
                  <div className="grid gap-2">
                    {Object.entries(q.choices).sort().map(([letter, text]) => (
                      <div
                        key={letter}
                        className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                          q.answers.includes(letter)
                            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                            : 'bg-slate-800/50 text-slate-400 border border-transparent'
                        }`}
                      >
                        <span className="font-bold flex-shrink-0 w-4">{letter}.</span>
                        <span>{text}</span>
                        {q.answers.includes(letter) && <span className="ml-auto text-emerald-400">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (mode === 'results') {
    const pct = Math.round((score / totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{pct >= 90 ? '🏆' : pct >= 75 ? '🎉' : pct >= 50 ? '📚' : '💪'}</div>
            <h1 className="text-3xl font-bold mb-2">
              {pct >= 90 ? 'Excellent!' : pct >= 75 ? 'Good Job!' : pct >= 50 ? 'Keep Studying' : "Don't Give Up!"}
            </h1>
            <div className={`text-6xl font-black mb-2 ${pct >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pct}%
            </div>
            <p className="text-slate-400">{score} out of {totalQuestions} correct</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-emerald-400">{score}</div>
              <div className="text-xs text-slate-500">Correct</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-red-400">{totalQuestions - score}</div>
              <div className="text-xs text-slate-500">Wrong</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-amber-400">{bestStreak}</div>
              <div className="text-xs text-slate-500">Best Streak</div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <button onClick={() => startQuiz(quizMode)} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all">
              Try Again
            </button>
            <button onClick={() => setShowResultsReview(!showResultsReview)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700">
              {showResultsReview ? 'Hide' : 'Review'} Answers
            </button>
            <button onClick={() => setMode('home')} className="w-full py-3 rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
              ← Back to Home
            </button>
          </div>

          {showResultsReview && (
            <div className="space-y-3">
              {quizQuestions.map(q => {
                const userAns = userAnswers[q.num] || [];
                const isCorrect = q.answers.length === userAns.length && q.answers.every(a => userAns.includes(a));
                return (
                  <div key={q.num} className={`bg-slate-900 border rounded-xl p-4 ${isCorrect ? 'border-emerald-800/60' : 'border-red-900/60'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">Q{q.num}</span>
                      <span>{isCorrect ? '✅' : '❌'}</span>
                      {!isCorrect && userAns.length > 0 && (
                        <span className="text-xs text-red-400">You: {userAns.join(', ')}</span>
                      )}
                      {!isCorrect && userAns.length === 0 && (
                        <span className="text-xs text-slate-500">Skipped</span>
                      )}
                      <span className="text-xs text-emerald-400 ml-auto">Ans: {q.answers.join(', ')}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{q.body.slice(0, 150)}{q.body.length > 150 ? '…' : ''}</p>
                    {!isCorrect && (
                      <div className="grid gap-1">
                        {Object.entries(q.choices).sort().map(([letter, text]) => (
                          <div key={letter} className={`flex gap-2 text-xs p-1.5 rounded ${
                            q.answers.includes(letter) ? 'bg-emerald-950/50 text-emerald-300' :
                            userAns.includes(letter) ? 'bg-red-950/50 text-red-300' :
                            'text-slate-600'
                          }`}>
                            <span className="font-bold">{letter}.</span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (!currentQ) return null;
  const userAns = userAnswers[currentQ.num] || [];
  const isMulti = currentQ.answers.length > 1;
  const hasAnswered = userAns.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => setMode('home')} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
            ← Exit
          </button>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-400 font-mono">✓ {score}</span>
            {streak > 1 && <span className="text-amber-400 font-mono">🔥 {streak}</span>}
            <span className="text-slate-400 font-mono">{currentIdx + 1}/{totalQuestions}</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Question {currentQ.num}
          </span>
          {isMulti && (
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700">
              Choose {currentQ.answers.length}
            </span>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 mb-5 leading-relaxed text-slate-200 text-sm">
          {currentQ.body}
        </div>

        <div className="grid gap-3 mb-6">
          {Object.entries(currentQ.choices).sort().map(([letter, text]) => {
            const isSelected = userAns.includes(letter);
            const isCorrect = currentQ.answers.includes(letter);
            let cls = 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800 cursor-pointer';
            if (showAnswer) {
              if (isCorrect) cls = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 cursor-default';
              else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-950/60 text-red-300 cursor-default';
              else cls = 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-default';
            } else if (isSelected) {
              cls = 'border-blue-500 bg-blue-950/60 text-blue-200 cursor-pointer';
            }

            return (
              <button
                key={letter}
                onClick={() => toggleAnswer(letter)}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${cls}`}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                  showAnswer && isCorrect ? 'border-emerald-400 text-emerald-400' :
                  showAnswer && isSelected && !isCorrect ? 'border-red-400 text-red-400' :
                  isSelected ? 'border-blue-400 text-blue-400 bg-blue-900/40' :
                  'border-slate-600 text-slate-500'
                }`}>
                  {letter}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed flex-1">{text}</span>
                {showAnswer && isCorrect && <span className="ml-auto text-emerald-400 flex-shrink-0">✓</span>}
                {showAnswer && isSelected && !isCorrect && <span className="ml-auto text-red-400 flex-shrink-0">✗</span>}
              </button>
            );
          })}
        </div>

        {quizMode === 'practice' ? (
          <div className="mt-auto">
            {!showAnswer ? (
              <button
                onClick={checkAnswer}
                disabled={!hasAnswered}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  hasAnswered
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-900/30"
              >
                {currentIdx + 1 >= totalQuestions ? 'See Results →' : 'Next →'}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-auto">
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-900/30"
            >
              {currentIdx + 1 >= totalQuestions ? 'See Results →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
