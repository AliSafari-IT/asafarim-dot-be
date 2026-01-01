import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Zap, Target, Award } from 'lucide-react';
import progressService, { ProgressSummary, LessonProgress, TimeSeriesData, Family } from '../api/progressService';
import './ProgressPage.css';

export default function ProgressPage() {
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<number | null>(null);
    const [timePeriod, setTimePeriod] = useState<'7' | '30' | '90' | 'custom'>('30');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [lessons, setLessons] = useState<LessonProgress[]>([]);
    const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'accuracy' | 'attempts' | 'lastpracticed'>('accuracy');

    useEffect(() => {
        loadFamilies();
    }, []);

    useEffect(() => {
        if (selectedFamily) {
            loadProgressData();
        }
    }, [selectedFamily, selectedMember, timePeriod, fromDate, toDate, sortBy]);

    const loadFamilies = async () => {
        try {
            setLoading(true);
            const data = await progressService.getFamilies();
            setFamilies(data);
            if (data.length > 0) {
                setSelectedFamily(data[0]!.familyId);
            }
        } catch (err) {
            setError('Failed to load families');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        const to = new Date();
        let from = new Date();

        if (timePeriod === 'custom') {
            return { from: fromDate ? new Date(fromDate) : from, to: toDate ? new Date(toDate) : to };
        }

        const days = parseInt(timePeriod);
        from.setDate(from.getDate() - days);
        return { from, to };
    };

    const loadProgressData = async () => {
        if (!selectedFamily) return;

        try {
            setLoading(true);
            setError(null);
            const { from, to } = getDateRange();

            const memberId = selectedMember ?? undefined;

            const [summaryData, lessonsData, timeSeriesData] = await Promise.all([
                progressService.getSummary(selectedFamily, memberId, from.toISOString(), to.toISOString()),
                progressService.getLessons(selectedFamily, memberId, from.toISOString(), to.toISOString(), 1, 50, sortBy),
                progressService.getTimeSeries(selectedFamily, memberId, from.toISOString(), to.toISOString()),
            ]);

            setSummary(summaryData);
            setLessons(lessonsData);
            setTimeSeries(timeSeriesData);
        } catch (err) {
            setError('Failed to load progress data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !summary) {
        return (
            <div className="progress-page container">
                <header className="page-header">
                    <h1>Progress</h1>
                </header>
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="progress-page container">
            <header className="page-header">
                <div>
                    <h1>Progress</h1>
                    <p>Track your learning journey</p>
                </div>
            </header>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                </div>
            )}

            <div className="progress-controls">
                <div className="control-group">
                    <label htmlFor="family-select">Family</label>
                    <select
                        id="family-select"
                        value={selectedFamily || ''}
                        onChange={(e) => setSelectedFamily(parseInt(e.target.value))}
                        className="select-input"
                    >
                        {families.map((f) => (
                            <option key={f.familyId} value={f.familyId}>
                                {f.familyName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="period-select">Time Period</label>
                    <select
                        id="period-select"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value as any)}
                        className="select-input"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="custom">Custom range</option>
                    </select>
                </div>

                {timePeriod === 'custom' && (
                    <>
                        <div className="control-group">
                            <label htmlFor="from-date">From</label>
                            <input
                                id="from-date"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="control-group">
                            <label htmlFor="to-date">To</label>
                            <input
                                id="to-date"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </>
                )}
            </div>

            {summary && (
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon sessions">
                            <Zap size={24} />
                        </div>
                        <div className="kpi-content">
                            <p className="kpi-label">Sessions</p>
                            <p className="kpi-value">{summary.totalSessions}</p>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon attempts">
                            <Target size={24} />
                        </div>
                        <div className="kpi-content">
                            <p className="kpi-label">Attempts</p>
                            <p className="kpi-value">{summary.totalAttempts}</p>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon accuracy">
                            <TrendingUp size={24} />
                        </div>
                        <div className="kpi-content">
                            <p className="kpi-label">Accuracy</p>
                            <p className="kpi-value">{summary.accuracyPercentage.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <Award size={24} />
                        </div>
                        <div className="kpi-content">
                            <p className="kpi-label">Points</p>
                            <p className="kpi-value">
                                {summary.totalPoints} / {summary.maxPossiblePoints}
                                {summary.maxPossiblePoints > 0 && (
                                    <span className="kpi-percentage">
                                        {' '}({Math.round((summary.totalPoints / summary.maxPossiblePoints) * 100)}%)
                                    </span>

                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {timeSeries.length > 0 && (
                <div className="chart-section">
                    <h2>Attempts Over Time</h2>
                    <div className="simple-chart">
                        {timeSeries.map((data, idx) => {
                            const maxAttempts = Math.max(...timeSeries.map(d => d.attemptCount), 1);
                            const height = (data.attemptCount / maxAttempts) * 100;
                            return (
                                <div key={idx} className="chart-bar" title={`${data.date}: ${data.attemptCount} attempts`}>
                                    <div className="bar" style={{ height: `${height}%` }}></div>
                                    <span className="label">{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="lessons-section">
                <div className="lessons-header">
                    <h2>Lesson Progress</h2>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="sort-select"
                    >
                        <option value="accuracy">Sort by Accuracy</option>
                        <option value="attempts">Sort by Attempts</option>
                        <option value="lastpracticed">Sort by Last Practiced</option>
                    </select>
                </div>

                {lessons.length > 0 ? (
                    <div className="lessons-table">
                        <div className="table-header">
                            <div className="col-title">Lesson</div>
                            <div className="col-attempts">Attempts</div>
                            <div className="col-accuracy">Accuracy</div>
                            <div className="col-points">Points</div>
                            <div className="col-last">Last Practiced</div>
                        </div>
                        {lessons.map((lesson) => (
                            <div key={lesson.lessonId} className="table-row">
                                <div className="col-title">{lesson.lessonTitle}</div>
                                <div className="col-attempts">{lesson.attemptCount}</div>
                                <div className="col-accuracy">
                                    <div className="accuracy-bar">
                                        <div
                                            className="accuracy-fill"
                                            style={{ width: `${lesson.accuracy * 100}%` }}
                                        ></div>
                                    </div>
                                    <span>{(lesson.accuracy * 100).toFixed(0)}%</span>
                                </div>
                                <div className="col-points">{lesson.pointsEarned}</div>
                                <div className="col-last">
                                    {lesson.lastPracticed
                                        ? new Date(lesson.lastPracticed).toLocaleDateString()
                                        : 'Never'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No lesson data available for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
}
