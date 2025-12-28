import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ showLogout = false, onLogout }) => {
  const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';

  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        background: 'linear-gradient(90deg, #202024 0%, #334059 100%)',
        padding: '15px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
    >

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <img src="/Sidekick logo.png" alt="Sidekick logo" style={{ height: '45px', width: 'auto' }} />
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#4FC3F7' }}>SideKick</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {isAuth && (
          <>
            <Link 
              to="/questionnaire" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#4FC3F7'}
              onMouseLeave={(e) => e.target.style.color = '#ffffff'}
            >
              ทำแบบสอบถาม
            </Link>
          </>
        )}

        {!showLogout ? (
          <Link 
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 195, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 195, 247, 0.3)';
            }}
          >
            <User size={18} /> เข้าสู่ระบบ
          </Link>
        ) : (
          <button 
            onClick={onLogout}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
              borderRadius: '25px',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ออกจากระบบ
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
