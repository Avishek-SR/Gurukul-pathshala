import React, { useEffect, useState } from 'react';
import './ActivityTimeline.css';

const ActivityTimeline = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchActivities = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`/api/admin/users/${userId}/activity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [userId]);

    if (loading) return <p>Loading activity log...</p>;
    if (activities.length === 0) return <p>No recent activity.</p>;

    return (
        <div className="activity-timeline">
            <h3>Activity Log</h3>
            <ul>
                {activities.map((log) => (
                    <li key={log.id} className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-history"></i>
                        </div>
                        <div className="activity-content">
                            <p className="activity-action">{log.action}</p>
                            <p className="activity-desc">{log.description}</p>
                            <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityTimeline;
