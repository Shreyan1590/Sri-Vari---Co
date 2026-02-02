import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import {
    FiPackage,
    FiShoppingCart,
    FiTrendingUp,
    FiTrendingDown,
    FiArrowRight
} from 'react-icons/fi';
import Skeleton, { CardSkeleton } from '../components/Skeleton';
import './Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await analyticsAPI.getSummary();
            setSummary(response.data.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    const isProfitable = (summary?.profitLoss || 0) >= 0;

    return (
        <div className="dashboard">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome to Sri Vari & Co Management System</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        {/* Total Mobiles */}
                        <div className="stat-card">
                            <div className="stat-icon primary">
                                <FiPackage />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{summary?.totalMobiles || 0}</div>
                                <div className="stat-label">Total Mobiles</div>
                            </div>
                        </div>

                        {/* In Stock */}
                        <div className="stat-card">
                            <div className="stat-icon info">
                                <FiPackage />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{summary?.inStock || 0}</div>
                                <div className="stat-label">In Stock</div>
                            </div>
                        </div>

                        {/* Sold */}
                        <div className="stat-card">
                            <div className="stat-icon success">
                                <FiShoppingCart />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{summary?.sold || 0}</div>
                                <div className="stat-label">Mobile Sold</div>
                            </div>
                        </div>

                        {/* Total Investment */}
                        <div className="stat-card">
                            <div className="stat-icon warning">
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹</span>
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{formatCurrency(summary?.totalInvestment)}</div>
                                <div className="stat-label">Total Investment</div>
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="stat-card">
                            <div className="stat-icon success">
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹</span>
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{formatCurrency(summary?.totalRevenue)}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                        </div>

                        {/* Total Profit */}
                        <div className="stat-card">
                            <div className={`stat-icon ${isProfitable ? 'success' : 'danger'}`}>
                                {isProfitable ? <FiTrendingUp /> : <FiTrendingDown />}
                            </div>
                            <div className="stat-details">
                                <div className={`stat-value ${isProfitable ? 'profit' : 'loss'}`}>
                                    {isProfitable ? '' : '-'}{formatCurrency(Math.abs(summary?.profitLoss || 0))}
                                </div>
                                <div className="stat-label">Total Profit</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card quick-actions">
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions-grid">
                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/inventory')}
                    >
                        <div className="action-icon">
                            <FiPackage />
                        </div>
                        <div className="action-text">
                            <span>Add New Mobile</span>
                            <small>Add inventory stock</small>
                        </div>
                        <FiArrowRight className="action-arrow" />
                    </button>

                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/inventory?status=IN_STOCK')}
                    >
                        <div className="action-icon success">
                            <FiShoppingCart />
                        </div>
                        <div className="action-text">
                            <span>Sell Mobile</span>
                            <small>Record a sale</small>
                        </div>
                        <FiArrowRight className="action-arrow" />
                    </button>

                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/analytics')}
                    >
                        <div className="action-icon warning">
                            <FiTrendingUp />
                        </div>
                        <div className="action-text">
                            <span>View Analytics</span>
                            <small>Charts & reports</small>
                        </div>
                        <FiArrowRight className="action-arrow" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
