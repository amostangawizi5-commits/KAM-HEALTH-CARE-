import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">404</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="home-link">
          Go Home
        </Link>
      </div>

      <style>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E8F4F8, #D4E8F0);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .not-found-content {
          text-align: center;
          background: white;
          padding: 48px 56px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          max-width: 480px;
          width: 100%;
        }

        .not-found-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .not-found-content h1 {
          font-size: 72px;
          font-weight: 800;
          color: #006780;
          margin: 0;
          line-height: 1;
        }

        .not-found-content h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1A1C1E;
          margin: 8px 0 0;
        }

        .not-found-content p {
          color: #6C787B;
          font-size: 15px;
          margin: 8px 0 24px;
        }

        .home-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #006780, #00829F);
          color: white;
          text-decoration: none;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s;
        }

        .home-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,103,128,0.3);
        }

        @media (max-width: 480px) {
          .not-found-content {
            padding: 32px 24px;
          }

          .not-found-content h1 {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
