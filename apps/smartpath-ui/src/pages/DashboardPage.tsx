import { useEffect, useState } from 'react';
import smartpathService from '../api/smartpathService';
import { CheckSquare, BookOpen, TrendingUp, Users } from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
    const [families, setFamilies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await smartpathService.families.getMyFamilies();
            const familiesData = Array.isArray(response.data) ? response.data : [];
            setFamilies(familiesData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setFamilies([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-page container">
            <header className="dashboard-header">
                <h1>Welcome to SmartPath</h1>
                <p>Your family learning companion</p>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-icon tasks">
                        <CheckSquare size={32} />
                    </div>
                    <h3>Tasks</h3>
                    <p>Track homework and activities</p>
                    <a href="/tasks" className="card-link">View Tasks →</a>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon learning">
                        <BookOpen size={32} />
                    </div>
                    <h3>Learning</h3>
                    <p>Explore courses and lessons</p>
                    <a href="/learning" className="card-link">Start Learning →</a>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon progress">
                        <TrendingUp size={32} />
                    </div>
                    <h3>Progress</h3>
                    <p>Track mastery and achievements</p>
                    <a href="/progress" className="card-link">View Progress →</a>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon family">
                        <Users size={32} />
                    </div>
                    <h3>Family</h3>
                    <p>Manage family members</p>
                    <a href="/family" className="card-link">Manage Family →</a>
                </div>
            </div>

            {families.length > 0 && (
                <section className="families-section">
                    <h2>Your Families</h2>
                    <div className="families-list">
                        {families.map((family) => (
                            <div key={family.familyId} className="family-card">
                                <h3>{family.familyName}</h3>
                                <p>{family.memberCount} members</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
