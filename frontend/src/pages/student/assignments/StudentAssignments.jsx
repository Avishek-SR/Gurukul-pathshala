import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import StudentActivitySelection from '../../../components/activities/StudentActivitySelection';
import { BookOpen, FileText } from 'lucide-react';

const StudentAssignments = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [viewMode, setViewMode] = useState('ACTIVITIES'); // 'ASSIGNMENTS' or 'ACTIVITIES'

    // Fetch enrolled courses
    const { data: courses = [] } = useQuery({
        queryKey: ['student-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/student/courses');
            return data;
        }
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 rounded-xl text-white">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Work</h1>
                    <p className="text-gray-500">Manage Assignments and Classroom Activities</p>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setViewMode('ASSIGNMENTS')}
                    className={`pb-4 px-2 font-medium transition-colors ${viewMode === 'ASSIGNMENTS'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        Assignments
                    </div>
                </button>
                <button
                    onClick={() => setViewMode('ACTIVITIES')}
                    className={`pb-4 px-2 font-medium transition-colors ${viewMode === 'ACTIVITIES'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} />
                        Classroom Activities
                    </div>
                </button>
            </div>

            {/* Course Selector */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">-- Choose Course --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse ? (
                <>
                    {viewMode === 'ASSIGNMENTS' && (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">Assignments Module (Coming Soon)</p>
                        </div>
                    )}
                    {viewMode === 'ACTIVITIES' && (
                        <StudentActivitySelection courseId={selectedCourse} />
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">Please select a course to view items.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
