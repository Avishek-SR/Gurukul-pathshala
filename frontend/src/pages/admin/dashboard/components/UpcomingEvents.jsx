import React, { useState } from 'react';
import './UpcomingEvents.css';

const UpcomingEvents = () => {
    // Mock Data for MVP - In real app, this would come from an API
    const [events, setEvents] = useState([
        { id: 1, title: 'Annual Sports Day', date: '2026-02-15', type: 'sports' },
        { id: 2, title: 'Parent-Teacher Meeting', date: '2026-02-20', type: 'meeting' },
        { id: 3, title: 'Science Exhibition', date: '2026-03-05', type: 'academic' },
        { id: 4, title: 'Holi Holiday', date: '2026-03-25', type: 'holiday' },
    ]);

    const getIcon = (type) => {
        switch (type) {
            case 'sports': return 'fas fa-running text-green-500';
            case 'meeting': return 'fas fa-users text-blue-500';
            case 'academic': return 'fas fa-flask text-purple-500';
            case 'holiday': return 'fas fa-umbrella-beach text-orange-500';
            default: return 'fas fa-calendar-alt text-gray-500';
        }
    };

    return (
        <div className="upcoming-events-card">
            <div className="events-header">
                <h3><i className="fas fa-calendar-alt"></i> Upcoming Events</h3>
                <button className="add-event-btn" title="Add Event (Coming Soon)">+</button>
            </div>
            <div className="events-list">
                {events.map(event => (
                    <div key={event.id} className="event-item">
                        <div className="event-date">
                            <span className="day">{new Date(event.date).getDate()}</span>
                            <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="event-details">
                            <span className="event-title">{event.title}</span>
                            <span className="event-type"><i className={getIcon(event.type)}></i> {event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingEvents;
