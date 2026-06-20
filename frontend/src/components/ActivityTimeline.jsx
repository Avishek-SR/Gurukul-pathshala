import React, { useEffect, useState } from 'react';
import './ActivityTimeline.css';
import api from '../services/api';

const ActivityTimeline = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchActivities = async () => {
            try {
                const data = await api.get(`/admin/users/${userId}/activity`).then(r => r.data);
                setActivities(data);
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
