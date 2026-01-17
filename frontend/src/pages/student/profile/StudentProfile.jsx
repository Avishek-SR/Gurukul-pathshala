// src/pages/student/Profile.jsx (Short)
import React from 'react';

const StudentProfile = () => {
  const student = {
    name: 'Aarav Sharma',
    roll: 'STU2024001',
    grade: '10th Grade - A',
    email: 'aarav@school.com',
    phone: '+91 9876543210'
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">AS</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-gray-600">{student.roll}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Grade', value: student.grade },
            { label: 'Email', value: student.email },
            { label: 'Phone', value: student.phone }
          ].map((item, i) => (
            <div key={i} className="border-b pb-3">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;