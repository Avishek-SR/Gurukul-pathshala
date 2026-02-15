import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import { Calendar, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import './FacultyTimetable.css';

const FacultyTimetable = () => {
    const {
        data: timetable = [],
        isLoading,
        isError
    } = useQuery({
        queryKey: ['facultyTimetable'],
        queryFn: async () => {
            const response = await axios.get('/faculty/timetable');
            return response.data;
        }
    });

    const timeSlots = [
        '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'
    ];

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    const [activeDay, setActiveDay] = useState(() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        return days.includes(today) ? today : 'SUNDAY';
    });

    // Helper to add 1 hour to time string
    const calculateEndTime = (startTime) => {
        const [hours, minutes] = startTime.split(':');
        const endHour = parseInt(hours) + 1;
        return `${endHour.toString().padStart(2, '0')}:${minutes}:00`;
    };

    const formattedTimetable = useMemo(() => {
        return timetable;
    }, [timetable]);

    const getSlotContent = (day, time) => {
        return formattedTimetable.find(t =>
            t.dayOfWeek === day &&
            t.startTime.substring(0, 5) === time.substring(0, 5)
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-500 gap-4">
                <AlertCircle size={48} />
                <h2 className="text-xl font-bold">Failed to load timetable</h2>
            </div>
        );
    }

    return (
        <div className="faculty-timetable-container">
            <div className="timetable-header">
                <h1>Weekly Schedule</h1>
                <p>View your classes and room allocations</p>
            </div>

            {/* Desktop View (Table) */}
            <div className="timetable-desktop-view">
                <div className="timetable-grid-container">
                    <table className="timetable-grid">
                        <thead>
                            <tr>
                                <th className="time-slot-header" style={{ width: '150px' }}>WEEKDAY</th>
                                {timeSlots.map(time => (
                                    <th key={time}>
                                        {time.substring(0, 5)} to {calculateEndTime(time).substring(0, 5)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td className="time-slot-header" style={{ fontWeight: 'bold' }}>
                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                    </td>
                                    {timeSlots.map(time => {
                                        const slotData = getSlotContent(day, time);
                                        return (
                                            <td key={`${day}-${time}`} className="timetable-cell">
                                                {slotData ? (
                                                    <div className="class-card-simple">
                                                        <div className="slot-course">
                                                            {slotData.courseName}
                                                        </div>
                                                        <div className="slot-detail">
                                                            <span style={{ fontWeight: 500 }}>{slotData.courseCode}</span>
                                                        </div>
                                                        <div className="slot-detail">
                                                            <span>{slotData.program} {slotData.section}</span>
                                                        </div>
                                                        {slotData.roomNumber && (
                                                            <div className="slot-detail">
                                                                <MapPin size={12} />
                                                                Room {slotData.roomNumber}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Day Tabs + List) */}
            <div className="timetable-mobile-view">
                <div className="day-tabs">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-tab ${activeDay === day ? 'active' : ''}`}
                            onClick={() => setActiveDay(day)}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>

                <div className="mobile-schedule-list">
                    {formattedTimetable
                        .filter(t => t.dayOfWeek === activeDay)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .length > 0 ? (
                        formattedTimetable
                            .filter(t => t.dayOfWeek === activeDay)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((slot) => (
                                <div key={slot.id} className="mobile-class-card">
                                    <div className="mobile-card-time">
                                        <Clock size={16} />
                                        <span>{slot.startTime.substring(0, 5)} - {calculateEndTime(slot.startTime).substring(0, 5)}</span>
                                    </div>
                                    <div className="mobile-card-content">
                                        <h3>{slot.courseName}</h3>
                                        <div className="mobile-card-details">
                                            <span className="mobile-detail-item">{slot.courseCode}</span>
                                            <span className="dot">•</span>
                                            <span className="mobile-detail-item">{slot.program} {slot.section}</span>
                                        </div>
                                        {slot.roomNumber && (
                                            <div className="mobile-card-location">
                                                <MapPin size={14} />
                                                <span>Room {slot.roomNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="mobile-empty-state">
                            <Clock size={32} />
                            <p>No classes scheduled for {activeDay}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyTimetable;
