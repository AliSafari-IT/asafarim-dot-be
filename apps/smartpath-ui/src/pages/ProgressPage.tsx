import './ProgressPage.css';

export default function ProgressPage() {
    return (
        <div className="progress-page container">
            <header className="page-header">
                <div>
                    <h1>Progress</h1>
                    <p>Track your learning journey</p>
                </div>
            </header>

            <div className="empty-state">
                <p>Progress tracking coming soon!</p>
                <p className="subtitle">Complete lessons to see your progress here.</p>
            </div>
        </div>
    );
}
