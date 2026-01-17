// PerformanceChart.jsx
import React from 'react';
import './PerformanceChart.css';

const PerformanceChart = () => {
  const performanceData = [
    { month: 'Aug', gpa: 3.6, attendance: 88 },
    { month: 'Sep', gpa: 3.7, attendance: 92 },
    { month: 'Oct', gpa: 3.8, attendance: 94 },
    { month: 'Nov', gpa: 3.75, attendance: 91 },
    { month: 'Dec', gpa: 3.78, attendance: 94 },
  ];

  const maxGPA = Math.max(...performanceData.map(d => d.gpa));
  const maxAttendance = Math.max(...performanceData.map(d => d.attendance));

  return (
    <div className="performance-chart">
      <div className="dashboard-header">
        <i className="fas fa-chart-bar"></i>
        <h3>Performance Trends</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color gpa-color"></span>
            <span>GPA</span>
          </div>
          <div className="legend-item">
            <span className="legend-color attendance-color"></span>
            <span>Attendance</span>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-y-axis">
          <span>4.0</span>
          <span>3.5</span>
          <span>3.0</span>
          <span>2.5</span>
          <span>2.0</span>
        </div>
        
        <div className="chart-content">
          <div className="chart-grid">
            {performanceData.map((_, index) => (
              <div key={index} className="grid-line"></div>
            ))}
          </div>
          
          <div className="chart-bars">
            {performanceData.map((item, index) => (
              <div key={index} className="chart-column">
                <div className="bar-gpa" style={{ height: `${(item.gpa / maxGPA) * 100}%` }}>
                  <span className="bar-value">{item.gpa.toFixed(2)}</span>
                </div>
                <div className="bar-attendance" style={{ height: `${(item.attendance / maxAttendance) * 100}%` }}>
                  <span className="bar-value">{item.attendance}%</span>
                </div>
                <div className="month-label">{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="performance-insights">
        <div className="insight-card positive">
          <i className="fas fa-arrow-up"></i>
          <div>
            <h4>GPA Improving</h4>
            <p>+0.18 points since August</p>
          </div>
        </div>
        <div className="insight-card positive">
          <i className="fas fa-chart-line"></i>
          <div>
            <h4>Attendance Stable</h4>
            <p>Above 90% consistently</p>
          </div>
        </div>
        <div className="insight-card neutral">
          <i className="fas fa-bullseye"></i>
          <div>
            <h4>Target</h4>
            <p>Maintain 3.8+ GPA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;