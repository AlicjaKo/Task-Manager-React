import React, { useState } from 'react';
import './styles/App.css';
import Tasks from './pages/Tasks';
import Records from './pages/Records';
import Summary from './pages/Summary';
import About from './pages/About';


function App() {
  const [activeView, setActiveView] = useState('tasks');

  const renderView = () => {
    switch (activeView) {
      case 'tasks': return <Tasks />;
      case 'summary': return <Summary />;
      case 'records': return <Records />;
      case 'about': return <About />;
      default: return <Tasks />;
    }
  };

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <button onClick={() => setActiveView('tasks')}>Tasks</button>
        <button onClick={() => setActiveView('summary')}>Summary</button>
        <button onClick={() => setActiveView('records')}>Records</button>
        <button onClick={() => setActiveView('about')}>About</button>
      </nav>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
