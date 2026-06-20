import React, { useState, useEffect } from 'react';
import './GlobalActivityLog.css';
import api from '../../../../services/api';

const GlobalActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.get('/admin/activity-logs').then(r => r.data);
                setLogs(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load activity logs');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading logs...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    const getIcon = (action) => {
        switch (action) {
            case 'LOGIN': return 'fas fa-sign-in-alt text-green-500';
            case 'LOGOUT': return 'fas fa-sign-out-alt text-red-500';
            case 'CREATE_USER': return 'fas fa-user-plus text-blue-500';
            case 'UPDATE_USER': return 'fas fa-user-edit text-yellow-500';
            default: return 'fas fa-history text-gray-500';
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="global-activity-log-container">
            <div className="page-header">
                <h2><i className="fas fa-history"></i> Global System Activity</h2>
                <p className="text-gray-500">Real-time log of all user activities across the system.</p>
            </div>

            <div className="activity-timeline-container">
                {logs.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-search"></i>
                        <p>No activity logs found.</p>
                    </div>
                ) : (
                    <div className="timeline-list">
                        {logs.map(log => (
                            <div key={log.id} className="timeline-item">
                                <div className="timeline-icon">
                                    <i className={getIcon(log.action)}></i>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-action">{log.action.replace('_', ' ')}</span>
                                        <span className="timeline-timestamp">{formatDate(log.timestamp)}</span>
                                    </div>
                                    <p className="timeline-description">{log.description}</p>
                                    <p className="timeline-user">User ID: {log.userId}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalActivityLog;
