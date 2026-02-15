import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import toast from 'react-hot-toast';
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    Trash2,
    User,
    Loader2,
    AlertCircle
} from 'lucide-react';
import './TimetableManagement.css';

const TimetableManagement = () => {
    const [selectedProgram, setSelectedProgram] = useState('Nursery');
    const [selectedSection, setSelectedSection] = useState('All Sections');
    const [selectedShift, setSelectedShift] = useState('Morning');
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, startTime }
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedConstraints, setSelectedConstraints] = useState(['checkFacultyAvailability', 'shuffleSubjects']);

    const queryClient = useQueryClient();

    // Programs and Sections - could be fetched from API or config
    const programs = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const sections = ['All Sections', 'A', 'B', 'C', 'D', 'E'];
    const shifts = ['Morning', 'Day'];

    // Time slots for the grid
    const timeSlots = [
        '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'
    ];

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    // Helper to get section param (convert 'All Sections' to empty string)
    const getSectionParam = () => selectedSection === 'All Sections' ? '' : selectedSection;

    // Fetch courses for the dropdown in modal
    const { data: courses = [] } = useQuery({
        queryKey: ['courses', selectedProgram, selectedSection],
        queryFn: async () => {
            // Assuming endpoint to get courses by program/section exists or we filter client side
            // For now fetching all and filtering might be heavy, but let's assume an optimized endpoint
            const response = await axios.get(`/admin/courses?program=${selectedProgram}&section=${getSectionParam()}`);
            return response.data;
        }
    });

    // Fetch timetable
    const {
        data: timetable = [],
        isLoading,
        isError
    } = useQuery({
        queryKey: ['timetable', selectedProgram, selectedSection, selectedShift],
        queryFn: async () => {
            const response = await axios.get('/admin/timetable', {
                params: { program: selectedProgram, section: getSectionParam(), shift: selectedShift }
            });
            console.log("Fetched Timetable:", response.data);
            return response.data;
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await axios.post('/admin/timetable', data);
        },
        onSuccess: () => {
            toast.success('Class scheduled successfully');
            queryClient.invalidateQueries(['timetable']);
            setShowModal(false);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to schedule class';
            toast.error(errorMessage.toString());
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/admin/timetable/${id}`);
        },
        onSuccess: () => {
            toast.success('Class removed from schedule');
            queryClient.invalidateQueries(['timetable']);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to remove class';
            toast.error(errorMessage.toString());
        }
    });

    // Clear All Mutation
    const clearAllMutation = useMutation({
        mutationFn: async () => {
            if (!window.confirm("Are you sure you want to clear the entire timetable for " + selectedProgram + " " + selectedSection + "? This cannot be undone.")) {
                throw new Error("Cancelled by user");
            }
            return await axios.delete('/admin/clear-timetable', {
                params: { program: selectedProgram, section: getSectionParam() }
            });
        },
        onSuccess: () => {
            toast.success('All entries cleared successfully');
            queryClient.invalidateQueries(['timetable']);
        },
        onError: (error) => {
            if (error.message === "Cancelled by user") return;
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to clear timetable';
            toast.error(errorMessage.toString());
        }
    });

    // Auto-Generate Mutation
    const generateMutation = useMutation({
        mutationFn: async () => {
            const params = new URLSearchParams();
            params.append('program', selectedProgram);
            params.append('section', getSectionParam());
            params.append('shift', selectedShift);
            selectedConstraints.forEach(c => params.append('constraints', c));

            return await axios.post('/admin/timetable/generate', null, { params });
        },
        onSuccess: () => {
            toast.success('Timetable auto-generated successfully');
            queryClient.invalidateQueries(['timetable']);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to generate timetable';
            toast.error(errorMessage.toString());
        }
    });

    const handleAddSlot = (day, time) => {
        setSelectedSlot({ day, start: time, end: calculateEndTime(time) });
        setSelectedCourseId('');
        setShowModal(true);
    };

    // Helper to add 1 hour to time string
    const calculateEndTime = (startTime) => {
        const [hours, minutes] = startTime.split(':');
        const endHour = parseInt(hours) + 1;
        return `${endHour.toString().padStart(2, '0')}:${minutes}:00`;
    };

    const getSlotContent = (day, time) => {
        return timetable.find(t =>
            t.dayOfWeek === day &&
            t.startTime.substring(0, 5) === time.substring(0, 5)
        );
    };

    // Function to handle class selection
    const handleClassSelect = (cls) => {
        setSelectedProgram(cls);
        // setSelectedProgram state handles the current class view, but we use selectedProgram === null to show grid
        // Actually, let's change logic:
        // Default View: Grid
        // State: viewMode = 'grid' | 'timetable'
    }

    // New State for View Mode
    const [viewMode, setViewMode] = useState('grid');

    const selectClass = (cls) => {
        setSelectedProgram(cls);
        setViewMode('timetable');
    }

    const backToGrid = () => {
        setViewMode('grid');
    }

    if (viewMode === 'grid') {
        return (
            <div className="timetable-container">
                <div className="timetable-header">
                    <h1>Timetable Management</h1>
                    <p>Select a class to manage its schedule.</p>
                </div>
                <div className="class-grid-container">
                    {programs.map((cls) => (
                        <div key={cls} className="class-card-item" onClick={() => selectClass(cls)}>
                            <div className="class-card-icon">📅</div>
                            <h3>{cls}</h3>
                            <p>Manage Schedule</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="timetable-container">
            <div className="timetable-header">
                <button className="back-btn" onClick={backToGrid}>
                    Start Over / Change Class
                </button>
                <h1>Manage Timetable: {selectedProgram}</h1>
                <p>Manage weekly schedule for {selectedProgram}</p>
            </div>

            <div className="timetable-controls">
                {/* Program Select Hidden/Fixed or Removed since we selected it */}

                <div className="control-group">
                    <label>Section</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                    >
                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="control-group">
                    <label>Shift</label>
                    <select
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                    >
                        {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="control-group constraints-group" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedConstraints.includes('checkFacultyAvailability')}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedConstraints([...selectedConstraints, 'checkFacultyAvailability']);
                                else setSelectedConstraints(selectedConstraints.filter(c => c !== 'checkFacultyAvailability'));
                            }}
                        />
                        Avoid Faculty Conflicts
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedConstraints.includes('shuffleSubjects')}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedConstraints([...selectedConstraints, 'shuffleSubjects']);
                                else setSelectedConstraints(selectedConstraints.filter(c => c !== 'shuffleSubjects'));
                            }}
                        />
                        Distribute Subjects
                    </label>
                </div>

                <div className="flex gap-2 ml-auto items-end">
                    <button
                        onClick={() => clearAllMutation.mutate()}
                        disabled={clearAllMutation.isLoading}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        {clearAllMutation.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Clear All
                    </button>
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        {generateMutation.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                        Auto Generate
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
                    <AlertCircle size={32} />
                    <p>Failed to load timetable</p>
                </div>
            ) : (
                <div className="timetable-grid-container px-2 pb-2">
                    <table className="timetable-grid">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }}>WEEKDAY</th>
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
                                                    <div className="class-card">
                                                        <span className="slot-course">{slotData.courseName}</span>
                                                        <div className="slot-faculty">
                                                            <User size={12} />
                                                            {slotData.facultyName}
                                                        </div>
                                                        {slotData.roomNumber && (
                                                            <div className="slot-room">
                                                                <MapPin size={12} />
                                                                {slotData.roomNumber}
                                                            </div>
                                                        )}
                                                        <button
                                                            className="delete-slot-btn"
                                                            onClick={() => deleteMutation.mutate(slotData.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="add-slot-btn"
                                                        onClick={() => handleAddSlot(day, time)}
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Schedule Class</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            createMutation.mutate({
                                courseId: formData.get('courseId'),
                                dayOfWeek: selectedSlot.day,
                                startTime: selectedSlot.start,
                                endTime: selectedSlot.end,
                                roomNumber: formData.get('roomNumber'),
                                shift: selectedShift
                            });
                        }}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="bg-gray-50 p-3 rounded-lg flex gap-4 text-sm text-gray-600 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {selectedSlot.day}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {selectedSlot.start.substring(0, 5)} - {selectedSlot.end.substring(0, 5)}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Course *</label>
                                        <select
                                            name="courseId"
                                            value={selectedCourseId}
                                            required
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name} ({course.code})
                                                </option>
                                            ))}
                                        </select>

                                        {selectedCourseId && (() => {
                                            const course = courses.find(c => c.id.toString() === selectedCourseId.toString());
                                            return course?.faculty ? (
                                                <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded flex items-center gap-2">
                                                    <User size={14} />
                                                    <span>Faculty: <strong>{course.faculty.name}</strong></span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-orange-500 mt-1">
                                                    No faculty assigned to this course.
                                                </p>
                                            );
                                        })()}
                                    </div>

                                    <div className="form-group">
                                        <label>Room Number</label>
                                        <input name="roomNumber" placeholder="e.g. 101" />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={createMutation.isLoading}>
                                    {createMutation.isLoading ? 'Scheduling...' : 'Schedule Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableManagement;
