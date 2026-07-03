import React from 'react';
import Dashboard from './components/Dashboard.jsx';

/**
 * App is the root application component.
 * Provides the app shell (header, main, footer) and skip navigation link.
 */
const App = () => {
    return (
        <div className="app">
            {/* Skip Navigation Link (Accessibility) */}
            <a href="#dashboard-content" className="skip-link">
                Skip to Dashboard Content
            </a>

            {/* Header */}
            <header className="app-header" role="banner">
                <div className="header-content">
                    <div className="header-brand">
                        <div className="header-logo" aria-hidden="true">
                            DP
                        </div>
                        <div>
                            <h1 className="header-title">DataPulse</h1>
                            <p className="header-subtitle">Analytics Dashboard</p>
                        </div>
                    </div>
                    <div className="header-status" aria-label="System status: Live">
                        <span className="status-dot" aria-hidden="true"></span>
                        <span>Live Data</span>
                    </div>
                </div>
            </header>

            {/* Main Dashboard */}
            <main className="app-main" role="main" id="main-content">
                <Dashboard />
            </main>

            {/* Footer */}
            <footer className="app-footer" role="contentinfo">
                <p>
                    © 2023 DataPulse Analytics Dashboard — Built with React &amp; Recharts
                    | Accessible &amp; Responsive
                </p>
            </footer>
        </div>
    );
};

export default App;
