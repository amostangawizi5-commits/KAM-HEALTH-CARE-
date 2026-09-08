import React, { useState } from 'react';

const AccountMenu = ({ onLogout, onLock }) => {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  const handleLock = () => {
    setOpen(false);
    onLock?.();
  };

  return (
    <div className="kc-account-menu-wrap">
      {open && (
        <button
          type="button"
          className="kc-account-menu-backdrop"
          aria-label="Close account menu"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        type="button"
        className="kc-menu-button"
        aria-label="Open account actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        &#8942;
      </button>

      {open && (
        <div className="kc-account-menu" role="menu">
          {onLock && (
            <button type="button" role="menuitem" onClick={handleLock}>
              <span aria-hidden="true">&#128274;</span>
              Lock screen
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            className="kc-menu-danger"
            onClick={handleLogout}
          >
            <span aria-hidden="true">&#9211;</span>
            Logout
          </button>
        </div>
      )}

      <style>{`
        .kc-account-menu-wrap {
          position: relative;
          z-index: 65;
        }

        .kc-menu-button {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #b7c9e7;
          border-radius: 8px;
          background: #ffffff;
          color: #198754;
          font: inherit;
          font-size: 22px;
          line-height: 1;
          font-weight: 800;
          cursor: pointer;
        }

        .kc-menu-button:hover,
        .kc-menu-button[aria-expanded='true'] {
          background: #e7f4ed;
          border-color: #198754;
        }

        .kc-account-menu-backdrop {
          position: fixed;
          inset: 0;
          border: 0;
          background: transparent;
          z-index: 55;
          cursor: default;
        }

        .kc-account-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 70;
          width: 190px;
          padding: 8px;
          border: 1px solid #d8e2ef;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16);
        }

        .kc-account-menu button {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #214334;
          padding: 0 10px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          text-align: left;
          cursor: pointer;
        }

        .kc-account-menu button:hover {
          background: #e7f4ed;
          color: #146c43;
        }

        .kc-account-menu .kc-menu-danger {
          color: #b42318;
        }

        .kc-account-menu .kc-menu-danger:hover {
          background: #fff1f0;
          color: #912018;
        }
      `}</style>
    </div>
  );
};

export default AccountMenu;
