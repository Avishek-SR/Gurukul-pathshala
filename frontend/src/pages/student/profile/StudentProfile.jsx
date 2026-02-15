import React from 'react';
import { useOutletContext } from 'react-router-dom';

const StudentProfile = () => {
  const { student } = useOutletContext();

  if (!student) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="p-6">


      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100" style={{ borderTop: '4px solid var(--primary-medium)' }}>
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md transform hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, var(--primary-medium), var(--primary-accent))' }}>
            {student.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-dark)' }}>{student.name}</h2>
            <p className="text-lg font-medium opacity-80" style={{ color: 'var(--text-medium)' }}>{student.program} • Section {student.section}</p>
            <p className="text-sm mt-1 text-gray-400">Student ID: {student.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: 'var(--text-dark)' }}>Personal Information</h3>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Full Name</span>
              <span className="font-medium text-gray-800">{student.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Email Address</span>
              <span className="font-medium text-gray-800">{student.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Date of Birth</span>
              <span className="font-medium text-gray-800">{student.dob || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: 'var(--text-dark)' }}>Academic Information</h3>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Program / Class</span>
              <span className="font-medium text-gray-800">{student.program}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Section</span>
              <span className="font-medium text-gray-800">{student.section}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">Attendance & Performance</span>
              <span className="font-medium text-green-600">{student.attendance}% Attendance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;