import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats, onNavigate }) => {
    if (!stats) return null;

    const cards = [
        { title: 'Total Users', value: stats.totalUsers, icon: 'fas fa-users', color: 'rgb(26, 188, 156)', link: 'all-users' }, // Redirect to All Users Page
        { title: 'Total Students', value: stats.totalStudents, icon: 'fas fa-user-graduate', color: 'rgb(26, 188, 156)', link: 'students' },
        { title: 'Total Faculty', value: stats.totalFaculty, icon: 'fas fa-chalkboard-teacher', color: 'rgb(26, 188, 156)', link: 'faculty' },
        { title: 'Total Courses', value: stats.totalCourses, icon: 'fas fa-book', color: 'rgb(26, 188, 156)', link: 'courses' },
        { title: 'Active Courses', value: stats.activeCourses, icon: 'fas fa-book-open', color: 'rgb(26, 188, 156)', link: 'courses' },
        { title: 'Total Batches', value: stats.totalBatches, icon: 'fas fa-layer-group', color: 'rgb(26, 188, 156)', link: 'students' },
        { title: 'Today\'s Logins', value: stats.todayLogins, icon: 'fas fa-clock', color: 'rgb(26, 188, 156)', link: 'reports' }, // Redirect to Reports tab
    ];

    const handleClick = (link) => {
        if (link && onNavigate) {
            onNavigate(link);
        }
    };

    return (
        <div className="dashboard-stats-grid">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`stat-card ${card.link ? 'clickable' : ''}`}
                    onClick={() => handleClick(card.link)}
                >
                    <div className="stat-icon" style={{ color: card.color }}>
                        <i className={card.icon}></i>
                    </div>
                    <div className="stat-info">
                        <h3>{card.value}</h3>
                        <p>{card.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
