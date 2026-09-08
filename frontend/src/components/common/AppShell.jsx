import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AccountMenu from './AccountMenu';
import logo from '../../kazimililogo.png';

const tanzaniaEmblem =
  'https://upload.wikimedia.org/wikipedia/commons/c/c2/Coat_of_arms_of_Tanzania.svg';

const AppShell = ({
  children,
  title,
  subtitle,
  rightContent,
  bannerActions,
  headerVariant = 'default',
  bannerTitle = 'Ministry of Health',
  bannerSubtitle = 'KazimiliCare Hospital Management System',
  showAppHeader = true
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const accountMenu = <AccountMenu onLogout={handleLogout} />;

  return (
    <div className="app-shell">
      {headerVariant === 'ministry' ? (
        <header className="ministry-banner">
          <div className="banner-mark banner-mark-left">
            <img src={tanzaniaEmblem} alt="Tanzania Coat of Arms" />
          </div>
          <div className="banner-copy">
            <h1>{bannerTitle}</h1>
            <p>{bannerSubtitle}</p>
          </div>
          <div className="banner-mark banner-mark-right">
            <img src={logo} alt="KazimiliCare Logo" />
          </div>
          {(bannerActions || accountMenu) && (
            <div className="ministry-banner-actions">
              {bannerActions || accountMenu}
            </div>
          )}
        </header>
      ) : (
        <header className="app-shell-topline">
          <span>Ministry of Health</span>
          <strong>KazimiliCare Hospital Management System</strong>
        </header>
      )}

      {showAppHeader && (
        <header className="app-shell-header">
          <button
            type="button"
            className="app-shell-brand"
            onClick={() => navigate('/dashboard')}
          >
            <img src={logo} alt="KazimiliCare Logo" />
            <span>
              <strong>KazimiliCare</strong>
              <small>Hospital Management System</small>
            </span>
          </button>

          <div className="app-shell-actions">
            <div className="app-shell-context">
              <strong>{title || 'Hospital Management'}</strong>
              {subtitle && <span>{subtitle}</span>}
            </div>
            <div className="app-shell-user">
              <span className="avatar" aria-hidden="true">
                {String(user?.firstName || 'C').slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{user?.firstName || 'Care'} {user?.lastName || 'Team'}</strong>
                <small>{user?.role || 'User'}</small>
              </span>
            </div>
            {rightContent}
            {headerVariant !== 'ministry' && accountMenu}
          </div>
        </header>
      )}

      <div>{children}</div>

      <style>{`
        .app-shell {
          min-height: 100vh;
          background: #f4f7f8;
          color: #172126;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .app-shell-topline {
          min-height: 42px;
          padding: 8px clamp(18px, 4vw, 40px);
          background: #12323d;
          color: #dbe9ee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 800;
        }

        .ministry-banner {
          position: relative;
          z-index: 1000;
          padding: 16px clamp(18px, 4vw, 40px);
          border-bottom: 1px solid #dee2e6;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 2vw, 28px);
        }

        .ministry-banner-actions {
          position: absolute;
          top: 50%;
          right: clamp(18px, 4vw, 40px);
          z-index: 1100;
          transform: translateY(-50%);
        }

        .banner-copy {
          text-align: center;
          min-width: 0;
        }

        .banner-copy h1 {
          margin: 0;
          color: #0d6efd;
          font-size: clamp(24px, 3vw, 40px);
          line-height: 1.1;
          letter-spacing: 0;
          font-weight: 900;
        }

        .banner-copy p {
          margin: 6px 0 0;
          color: #198754;
          font-size: clamp(13px, 1.4vw, 17px);
          font-weight: 800;
          letter-spacing: 0;
        }

        .banner-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border: 1px solid #dee2e6;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .banner-mark-left {
          background: #f8f9fa;
        }

        .banner-mark-right {
          background: #ffffff;
        }

        .banner-mark img {
          width: 68px;
          height: 68px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.84);
        }

        .banner-mark-right img {
          border-radius: 8px;
        }

        .app-shell-header {
          min-height: 76px;
          padding: 12px clamp(18px, 4vw, 40px);
          background: #ffffff;
          border-bottom: 1px solid #dce6ea;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .app-shell-brand {
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0;
          cursor: pointer;
          text-align: left;
          font: inherit;
        }

        .app-shell-brand img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 8px;
        }

        .app-shell-brand strong,
        .app-shell-brand small,
        .app-shell-user strong,
        .app-shell-user small {
          display: block;
        }

        .app-shell-brand strong {
          color: #06465a;
          font-size: 19px;
        }

        .app-shell-brand small {
          color: #65747a;
          font-size: 12px;
          font-weight: 700;
        }

        .app-shell-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .app-shell-context {
          border: 1px solid #d7e1e5;
          border-radius: 8px;
          padding: 8px 12px;
          background: #f8fbfc;
        }

        .app-shell-context strong {
          display: block;
          font-size: 13px;
        }

        .app-shell-context span {
          display: block;
          margin-top: 2px;
          color: #65747a;
          font-size: 12px;
          font-weight: 700;
        }

        .app-shell-user {
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          background: #eef4f6;
          padding: 6px 12px 6px 6px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #006780;
          color: #ffffff;
          font-weight: 900;
        }

        .app-shell-user strong {
          color: #172126;
          font-size: 13px;
          line-height: 1.1;
        }

        .app-shell-user small {
          margin-top: 2px;
          color: #65747a;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        @media (max-width: 760px) {
          .ministry-banner {
            gap: 10px;
            padding: 10px 14px;
          }

          .ministry-banner-actions {
            right: 10px;
          }

          .banner-mark {
            width: 58px;
            height: 58px;
          }

          .banner-mark img {
            width: 48px;
            height: 48px;
          }

          .app-shell-topline,
          .app-shell-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .app-shell-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AppShell;
