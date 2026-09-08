import React from 'react';

const StatsCard = ({ label, value, color, change, changeType }) => {
  return (
    <div className="card h-100 shadow-sm border-0 border-start border-4" style={{ borderLeftColor: color }}>
      <div className="card-body">
        <p className="text-secondary small fw-semibold mb-2">{label}</p>
        <div className="d-flex align-items-end justify-content-between gap-3">
          <h3 className="display-6 fw-bold mb-0">{value}</h3>
          {change && (
            <span className={`badge ${changeType === 'down' ? 'text-bg-danger' : 'text-bg-success'}`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
