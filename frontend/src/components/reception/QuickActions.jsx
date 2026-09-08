import React from 'react';

const QuickActions = ({ onRegister, onSearch }) => {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h3 className="h5 fw-bold mb-3">Quick Actions</h3>
        <div className="d-grid gap-2">
        <button className="btn btn-success fw-semibold" onClick={onRegister}>
          <span>Register Patient</span>
        </button>
        <button className="btn btn-outline-success fw-semibold" onClick={onSearch}>
          <span>Search Patient</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
