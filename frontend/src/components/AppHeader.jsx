import React from 'react';
import './AppHeader.css';

const AppHeader = () => {
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo-section">
                    <span className="logo-symbol">SV</span>
                    <div className="logo-text">
                        <h1>Sri Vari & Co</h1>
                        <small>Premium Mobile Store</small>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
