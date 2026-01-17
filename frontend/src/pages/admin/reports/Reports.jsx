import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet('/admin/reports');
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          setReports([]);
        }
      } catch (e) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>System Reports</h1>
        <p>View and export system-generated reports</p>
      </div>

      <div className="reports-card">
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <p className="muted">No reports available.</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.generatedAt}</td>
                  <td>
                    <a
                      href={`http://localhost:8080/api/admin/reports/${r.id}/download`}
                      className="download-link"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
