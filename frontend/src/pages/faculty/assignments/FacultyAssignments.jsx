import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../api/axiosConfig';
import ActivityTopicManager from '../../../components/activities/ActivityTopicManager';
import { BookOpen } from 'lucide-react';

const FacultyAssignments = () => {
    const [selectedCourse, setSelectedCourse] = useState('');

    const { data: courses = [] } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: async () => {
            const { data } = await axios.get('/faculty/courses');
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
                    <h1 className="text-2xl font-bold text-gray-900">Classroom Activities</h1>
                    <p className="text-gray-500">Manage Presentations, Projects, and Case Studies</p>
                </div>
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
                            {course.name} ({course.program} - {course.year})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse ? (
                <ActivityTopicManager courseId={selectedCourse} />
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">Please select a course to view activities.</p>
                </div>
            )}
        </div>
    );
};

export default FacultyAssignments;
