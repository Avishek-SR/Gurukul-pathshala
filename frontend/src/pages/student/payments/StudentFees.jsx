import React, { useState, useEffect } from 'react';

const StudentFees = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = sessionStorage.getItem('token');
                // Currently fetching courses to display fee structure
                // Ideally this should be a dedicated /fees endpoint with payment history
                const res = await fetch('/api/student/courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Error fetching fees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-8">Loading fee details...</div>;

    const totalFee = courses.reduce((acc, curr) => acc + (curr.fee || 0), 0);

    return (
        <div className="p-6">


            <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50 shadow-sm mb-8 flex justify-between items-center">
                <div>
                    <p className="text-blue-800 font-medium">Total Payable Amount</p>
                    <h2 className="text-3xl font-bold text-blue-900 mt-1">₹{totalFee.toLocaleString()}</h2>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700">
                    Pay Now
                </button>
            </div>

            <h3 className="text-lg font-bold text-gray-700 mb-4">Fee Breakdown</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Course Code</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 w-full">Course Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600 font-medium">{course.code}</td>
                                <td className="px-6 py-4 text-gray-800">{course.name}</td>
                                <td className="px-6 py-4 text-gray-800 font-bold">₹{course.fee}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentFees;
