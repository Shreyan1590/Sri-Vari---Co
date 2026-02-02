import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import './AppHeader.css';

const AppHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Map routes to titles
    const getPageTitle = (path) => {
        const routeTitles = {
            '/dashboard': 'Home',
            '/inventory': 'Inventory',
            '/inventory/add': 'Add Mobile',
            '/analytics': 'Analytics',
            '/profile': 'My Profile'
        };
        return routeTitles[path] || 'Sri Vari & Co';
    };

    const isRoot = location.pathname === '/dashboard';
    const title = getPageTitle(location.pathname);

    return (
        <header className="app-header">
            <div className="header-content">
                {!isRoot && (
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FiChevronLeft />
                    </button>
                )}

                <div className="header-title-section">
                    <h1 className="header-title">{title}</h1>
                </div>

                {isRoot && (
                    <div className="header-branding">
                        <span className="branding-badge">Premium</span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AppHeader;
