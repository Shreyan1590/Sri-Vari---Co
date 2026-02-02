import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AppHeader from './AppHeader';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-layout">
            <AppHeader />
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
