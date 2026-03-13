import React, { useState, useEffect } from 'react';
import { noticeAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const data = await noticeAPI.getActive();
        setNotices(data);
      } catch (error) {
        console.error("Failed to fetch notices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="notices-page" style={{ 
      minHeight: '70vh', 
      padding: '40px 20px', 
      background: '#f8fafc' 
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '30px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '15px'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-dark)', margin: 0 }}>
              <i className="fas fa-bullhorn" style={{ marginRight: '15px', color: 'var(--primary-medium)' }}></i>
              School Notices
            </h1>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1.1rem' }}>
              Stay updated with the latest announcements and events.
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div className="animate-spin" style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #cbd5e1', 
              borderTopColor: 'var(--primary-medium)', 
              borderRadius: '50%' 
            }}></div>
          </div>
        ) : notices.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <i className="fas fa-bell-slash" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '15px' }}></i>
            <h3 style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '10px' }}>No Active Notices</h3>
            <p style={{ color: '#94a3b8' }}>Check back later for updates and announcements.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {notices.map((notice) => (
              <div key={notice.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                borderLeft: `4px solid ${
                  notice.type === 'URGENT' ? '#ef4444' : 
                  notice.type === 'EVENT' ? '#8b5cf6' : 
                  notice.type === 'EXAM' ? '#f59e0b' : 
                  'var(--primary-medium)'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                    {notice.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      background: notice.type === 'URGENT' ? '#fecaca' : 
                                 notice.type === 'EVENT' ? '#ede9fe' : 
                                 notice.type === 'EXAM' ? '#fef3c7' : 
                                 '#e0f2fe',
                      color: notice.type === 'URGENT' ? '#b91c1c' : 
                             notice.type === 'EVENT' ? '#6d28d9' : 
                             notice.type === 'EXAM' ? '#b45309' : 
                             '#0369a1',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      {notice.type ? notice.type.toUpperCase() : 'GENERAL'}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="far fa-calendar-alt"></i>
                      {new Date(notice.publishDate).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                {notice.content && (
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                    {notice.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notices;