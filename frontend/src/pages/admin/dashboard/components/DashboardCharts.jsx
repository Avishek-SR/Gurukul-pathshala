import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import './DashboardCharts.css';

const DashboardCharts = ({ analytics }) => {
    if (!analytics) return <div className="charts-loading">Loading charts...</div>;

    const { genderDistribution, attendanceTrend, admissionTrend } = analytics;

    // Transform Gender Data for Pie Chart
    const genderData = [
        { name: 'Male', value: genderDistribution?.Male || 0 },
        { name: 'Female', value: genderDistribution?.Female || 0 },
    ];
    const COLORS = ['#0088FE', '#FF8042'];

    // Transform Admission Data for Bar Chart (Simplified for MVP)
    const admissionData = [
        { name: 'New (This Month)', count: admissionTrend?.newThisMonth || 0 },
        { name: 'Total Students', count: admissionTrend?.total || 0 },
    ];

    return (
        <div className="dashboard-charts-container">
            {/* Attendance Trend - Line Chart */}
            <div className="chart-card">
                <h3>Attendance Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" stroke="#82ca9d" name="Present Students" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="charts-row">
                {/* Gender Distribution - Pie Chart */}
                <div className="chart-card half-width">
                    <h3>Gender Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={genderData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Admission Stats - Bar Chart */}
                <div className="chart-card half-width">
                    <h3>Admission Stats</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={admissionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Students" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
