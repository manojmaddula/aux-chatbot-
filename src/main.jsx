// src/main.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import BreakForm from './components/BreakForm';
import ArticleViewer from './components/ArticleViewer';
import AlertsPanel from './components/AlertsPanel';

const App = () => {
  const [alerts, setAlerts] = useState([]);

  // Mock periodic alerts (e.g., high traffic Monday morning)
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      // Example: Monday 08:00-10:00 high‑traffic mode
      if (now.getDay() === 1 && now.getHours() >= 8 && now.getHours() < 10) {
        setAlerts(prev => [...prev, { title: 'High Traffic Mode', body: 'Expect higher call volume today.' }]);
      }
    };
    const interval = setInterval(checkAlerts, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Forward alerts to Electron notification system
  useEffect(() => {
    alerts.forEach(alert => {
      window.electronAPI.sendAlert(alert);
    });
  }, [alerts]);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
      <h2>Auxiliary Mode Assistant</h2>
      <BreakForm />
      <hr />
      <ArticleViewer />
      <hr />
      <AlertsPanel alerts={alerts} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
