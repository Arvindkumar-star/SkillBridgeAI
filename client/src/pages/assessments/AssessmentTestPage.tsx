import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Assessment, AssessmentQuestion } from '../../types';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Award,
  Sparkles,
  HelpCircle,
  Send
} from 'lucide-react';

export const AssessmentTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAssessment = async () => {
    try {
      const res = await api.get(`/assessments/${id}`);
      if (res.data?.success) {
        setAssessment(res.data.data.assessment);
        // Pre-fill answers if completed
        if (res.data.data.assessment.status === 'Completed') {
          const prefill: any = {};
          for (const q of res.data.data.assessment.questions) {
            prefill[q.id] = q.userAnswer || '';
          }
          setAnswers(prefill);
        }
      }
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (assessment?.status === 'Completed') return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    const formattedAnswers = assessment.questions.map((q) => ({
      questionId: q.id,
      userAnswer: answers[q.id] || ''
    }));

    const unanswered = formattedAnswers.filter((a) => !a.userAnswer);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit test anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/assessments/${assessment._id}/submit`, {
        answers: formattedAnswers
      });
      if (res.data?.success) {
        setAssessment(res.data.data.assessment);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assessment test questions..." />;
  }

  if (!assessment) {
    return (
      <div className="text-center py-12 text-slate-400">
        Assessment not found.{' '}
        <Link to="/assessments" className="text-brand-400 underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  const isCompleted = assessment.status === 'Completed';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assessments</span>
        </Link>

        {isCompleted && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            Graded by Backend Engine
          </span>
        )}
      </div>

      {/* Result Banner if Completed */}
      {isCompleted && (
        <Card className="bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 border-brand-500/30 text-center py-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-300 mb-3 shadow-lg shadow-brand-500/20">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Score: {assessment.score}%</h2>
            <p className="text-xs text-slate-300 mt-1">
              Verified Level: <span className="font-bold text-emerald-400">{assessment.levelLabel}</span> · Verified Confidence: <span className="font-bold text-sky-400">{assessment.confidence}%</span>
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              Your profile has been automatically upgraded with this verified demonstration. Any analysis against target jobs will now incorporate this verified evidence.
            </p>
          </div>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {assessment.questions?.map((q: AssessmentQuestion, idx: number) => {
          const selected = answers[q.id];

          return (
            <Card key={q.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Question {idx + 1} of {assessment.questions.length}
                </span>
                {isCompleted && (
                  <span className="text-xs font-semibold">
                    {q.isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct (+{q.points || 20} pts)
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-100 leading-relaxed">{q.prompt}</p>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {q.options?.map((opt: string, optIdx: number) => {
                  const isThisSelected = selected === opt;
                  const isThisCorrect = isCompleted && q.correctAnswer === opt;
                  const isThisWrongSelected = isCompleted && isThisSelected && !q.isCorrect;

                  let optClass = 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (isThisCorrect) {
                    optClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium';
                  } else if (isThisWrongSelected) {
                    optClass = 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-medium';
                  } else if (isThisSelected) {
                    optClass = 'bg-brand-600/20 border-brand-500/50 text-brand-200 font-medium';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                        isCompleted ? 'cursor-default' : 'cursor-pointer'
                      } ${optClass}`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                        isThisSelected ? 'border-brand-400 bg-brand-500 text-white' : 'border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation on completion */}
              {isCompleted && q.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1">Explanation:</span>
                  {q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isCompleted && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Test for Backend Verification</span>
          </button>
        </div>
      )}
    </div>
  );
};
