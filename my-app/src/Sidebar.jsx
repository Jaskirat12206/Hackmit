import React from 'react';

export default function Sidebar({ units, selectedId, onSelect }) {
  return (
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom">
        <h5 className="mb-0">Units</h5>
        <small className="text-muted">Live vitals & status</small>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {units.map(u => (
          <div
            key={u.id}
            onClick={() => onSelect(u.id)}
            className={`p-3 border-bottom ${selectedId === u.id ? 'bg-light' : ''}`}
            role="button"
          >
            <div className="d-flex justify-content-between align-items-center">
              <strong>{u.name}</strong>
              <span className={`badge ${u.status === 'ALERT' ? 'text-bg-danger' : 'text-bg-success'}`}>
                {u.status || 'OK'}
              </span>
            </div>

            <div className="mt-2">
              <div className="d-flex justify-content-between">
                <small className="text-muted">Oxygen</small>
                <small>{Math.round(u.o2pct)}%</small>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={u.o2pct} aria-valuemin="0" aria-valuemax="100">
                <div
                  className={`progress-bar ${u.o2pct < 19 ? 'bg-danger' : u.o2pct < 20 ? 'bg-warning' : ''}`}
                  style={{ width: `${Math.max(0, Math.min(100, u.o2pct))}%` }}
                />
              </div>
            </div>

            <div className="mt-2 d-flex gap-3 flex-wrap">
              <small className="text-muted">HR: <strong>{u.hr} bpm</strong></small>
              <small className="text-muted">Body: <strong>{u.tempC} °C</strong></small>
              <small className="text-muted">CO₂: <strong>{u.co2ppm} ppm</strong></small>
              {u.skinTempC != null && (
                <small className="text-muted">Skin: <strong>{u.skinTempC} °C</strong></small>
              )}
            </div>
          </div>
        ))}

        {units.length === 0 && (
          <div className="p-3 text-muted">No units yet…</div>
        )}
      </div>
    </div>
  );
}
