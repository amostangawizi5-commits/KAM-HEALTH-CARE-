import React from 'react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import QueueTable from './QueueTable';

const DashboardOverview = ({ patients, queue, appointments, onRegister, onSearch }) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = [
    { 
      label: 'Patients Today', 
      value: patients?.length || 0, 
      color: '#15803d',
      change: 'Updated',
      changeType: 'up'
    },
    { 
      label: 'New Patients', 
      value: patients?.filter(p => p.registrationDate === today).length || 0,
      color: '#166534',
      change: 'Today',
      changeType: 'up'
    },
    { 
      label: 'Waiting Patients', 
      value: queue?.filter(q => q.status === 'WAITING').length || 0,
      color: '#14532d',
      change: 'Live',
      changeType: 'up'
    },
  ];

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">
        {stats.map((stat, index) => (
          <div className="col-12 col-md-4" key={index}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <QuickActions onRegister={onRegister} onSearch={onSearch} />
        </div>
        <div className="col-12 col-lg-8">
          <QueueTable queue={queue?.slice(0, 5) || []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
