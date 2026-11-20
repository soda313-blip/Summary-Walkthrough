import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Filter,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import { Story } from '../types/story';
import {
  fetchQuizResults,
  formatDurationMMSS,
  QuizResultRecord,
} from '../lib/firebase';

interface TeacherDashboardProps {
  stories: Story[];
  teacherEmail: string;
  onBackToShelf: () => void;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCompletedAt(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  stories,
  teacherEmail,
  onBackToShelf,
}) => {
  const [results, setResults] = useState<QuizResultRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('all');

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizResults();
      setResults(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load quiz results from Firestore.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResults();
  }, []);

  const storyFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    stories.forEach((s) => map.set(s.id, s.title));
    results.forEach((r) => {
      if (r.storyId && !map.has(r.storyId)) {
        map.set(r.storyId, r.storyTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [stories, results]);

  const filteredResults = useMemo(() => {
    if (selectedStoryId === 'all') return results;
    return results.filter((r) => r.storyId === selectedStoryId);
  }, [results, selectedStoryId]);

  const summaryStats = useMemo(() => {
    const count = filteredResults.length;
    if (count === 0) {
      return {
        totalAttempts: 0,
        avgPercent: null as number | null,
        avgDurationSeconds: 0,
      };
    }

    const scoredRows = filteredResults.filter((r) => r.totalQuestions > 0);
    const avgPercent =
      scoredRows.length > 0
        ? Math.round(
            (scoredRows.reduce(
              (acc, r) => acc + r.score / r.totalQuestions,
              0
            ) /
              scoredRows.length) *
              100
          )
        : null;

    const avgDurationSeconds = Math.round(
      filteredResults.reduce((acc, r) => acc + r.durationSeconds, 0) / count
    );

    return {
      totalAttempts: count,
      avgPercent,
      avgDurationSeconds,
    };
  }, [filteredResults]);

  const handleDownloadCsv = () => {
    const headers = [
      'Student Name',
      'Student Email',
      'Story',
      'Score',
      'Total Questions',
      'Time Taken (mm:ss)',
      'Duration Seconds',
      'Completed At',
    ];

    const rows = filteredResults.map((row) => [
      escapeCsvCell(row.studentName),
      escapeCsvCell(row.studentEmail),
      escapeCsvCell(row.storyTitle),
      escapeCsvCell(row.score),
      escapeCsvCell(row.totalQuestions),
      escapeCsvCell(formatDurationMMSS(row.durationSeconds)),
      escapeCsvCell(row.durationSeconds),
      escapeCsvCell(row.completedAt ? row.completedAt.toISOString() : ''),
    ]);

    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const storySuffix =
      selectedStoryId === 'all' ? 'all-stories' : selectedStoryId;
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `summary-walkthrough-results-${storySuffix}-${dateTag}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5">
      {/* Top Header Row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToShelf}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-amber-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Bookshelf</span>
          </button>
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Teacher Dashboard
            </h1>
            <p className="text-xs text-stone-500">
              Signed in as {teacherEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadResults()}
            disabled={loading}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-amber-50 disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={filteredResults.length === 0}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-50 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stats & Filter Bar */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-amber-200/80 bg-[#FFFDF9] px-4 py-3">
            <p className="text-xs font-medium text-stone-500">Attempts</p>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {summaryStats.totalAttempts}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-[#FFFDF9] px-4 py-3">
            <p className="text-xs font-medium text-stone-500">Avg. Score</p>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {summaryStats.avgPercent !== null
                ? `${summaryStats.avgPercent}%`
                : '—'}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-[#FFFDF9] px-4 py-3">
            <p className="text-xs font-medium text-stone-500">Avg. Time</p>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {summaryStats.totalAttempts > 0
                ? formatDurationMMSS(summaryStats.avgDurationSeconds)
                : '—'}
            </p>
          </div>
        </div>

        <div className="md:col-span-5 rounded-xl border border-amber-200/80 bg-[#FFFDF9] px-4 py-3 flex flex-col justify-center">
          <label
            htmlFor="teacher-story-filter"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-1.5"
          >
            <Filter className="h-3.5 w-3.5 text-amber-700" />
            <span>Filter by Story</span>
          </label>
          <select
            id="teacher-story-filter"
            value={selectedStoryId}
            onChange={(e) => setSelectedStoryId(e.target.value)}
            className="w-full min-h-[38px] rounded-lg border border-amber-300/90 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
          >
            <option value="all">All Stories ({results.length})</option>
            {storyFilterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Could not load student results</p>
            <p className="mt-0.5 text-xs sm:text-sm text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-[#FFFDF9] shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Loading student attempts...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-amber-400" />
            <p className="mt-3 font-serif-display text-lg font-bold text-stone-800">
              No completed attempts yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {selectedStoryId === 'all'
                ? 'When students finish a story walkthrough, their scores and times will appear here.'
                : 'No completed attempts found for this story yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-200/80 bg-[#FDF8EC] text-xs font-semibold uppercase tracking-wide text-stone-600">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Story</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Time Taken</th>
                  <th className="px-4 py-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-sm">
                {filteredResults.map((row) => {
                  const pct =
                    row.totalQuestions > 0
                      ? Math.round((row.score / row.totalQuestions) * 100)
                      : null;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-amber-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="font-semibold text-stone-900">
                          {row.studentName}
                        </div>
                        {row.studentEmail && (
                          <div className="text-xs text-stone-500">
                            {row.studentEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle font-medium text-stone-800">
                        {row.storyTitle}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-stone-900">
                          {row.score}/{row.totalQuestions}
                        </span>
                        {pct !== null && (
                          <span className="ml-2 text-xs text-stone-500">
                            ({pct}%)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono tabular-nums text-stone-800 whitespace-nowrap">
                        {formatDurationMMSS(row.durationSeconds)}
                      </td>
                      <td className="px-4 py-3 align-middle text-stone-600 whitespace-nowrap">
                        {formatCompletedAt(row.completedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
