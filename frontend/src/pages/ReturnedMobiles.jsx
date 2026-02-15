import React, { useState, useEffect } from 'react';
import { mobilesAPI } from '../services/api';
import {
    FiRotateCcw,
    FiPackage,
    FiAlertTriangle,
    FiPhone,
    FiCalendar,
    FiUser,
    FiMessageSquare
} from 'react-icons/fi';
import Skeleton, { InventoryCardSkeleton } from '../components/Skeleton';
import './ReturnedMobiles.css';

const ReturnedMobiles = () => {
    const [mobiles, setMobiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processing, setProcessing] = useState(null); // tracks which mobile id is being processed

    useEffect(() => {
        fetchReturnedMobiles();
    }, []);

    const fetchReturnedMobiles = async () => {
        try {
            setLoading(true);
            const response = await mobilesAPI.getAll({ status: 'RETURNED' });
            setMobiles(response.data.data);
        } catch (err) {
            setError('Failed to load returned mobiles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToStock = async (id) => {
        setProcessing(id);
        setError('');
        try {
            await mobilesAPI.moveToStock(id);
            setSuccess('Mobile moved back to stock!');
            fetchReturnedMobiles();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to move to stock';
            setError(errorMsg);
        } finally {
            setProcessing(null);
        }
    };

    const handleReturnToSeller = async (id) => {
        setProcessing(id);
        setError('');
        try {
            await mobilesAPI.returnToSeller(id);
            setSuccess('Mobile returned to seller!');
            fetchReturnedMobiles();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to return to seller';
            setError(errorMsg);
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <div className="returned-mobiles">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Returned Mobiles</h1>
                    <p className="page-subtitle">Manage returned mobile phones</p>
                </div>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Content */}
            <div className="card">
                {loading ? (
                    <div className="returned-content">
                        <div className="mobile-card-list">
                            {[1, 2, 3].map(i => <InventoryCardSkeleton key={i} />)}
                        </div>
                    </div>
                ) : mobiles.length === 0 ? (
                    <div className="empty-state">
                        <FiRotateCcw size={48} />
                        <h3>No returned mobiles</h3>
                        <p>Returned mobiles will appear here when a sold mobile is marked as returned.</p>
                    </div>
                ) : (
                    <div className="returned-content">
                        {/* Mobile Card View */}
                        <div className="returned-card-list">
                            {mobiles.map((mobile) => (
                                <div key={mobile.id} className="returned-card">
                                    <div className="returned-card-header">
                                        <div className="returned-card-title">
                                            <FiPhone className="card-icon" />
                                            <h3>{mobile.modelName}</h3>
                                        </div>
                                        <span className="badge badge-warning">Returned</span>
                                    </div>

                                    <div className="returned-card-details">
                                        <div className="detail-row">
                                            <span className="detail-label">S.No</span>
                                            <span className="detail-value">{mobile.serialNo}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">IMEI 1</span>
                                            <span className="detail-value imei">{mobile.imei1}</span>
                                        </div>
                                        {mobile.imei2 && (
                                            <div className="detail-row">
                                                <span className="detail-label">IMEI 2</span>
                                                <span className="detail-value imei">{mobile.imei2}</span>
                                            </div>
                                        )}
                                        <div className="detail-row">
                                            <span className="detail-label">RAM/ROM</span>
                                            <span className="detail-value">{mobile.ramRom || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="returned-card-return-info">
                                        <h4 className="return-info-title">
                                            <FiAlertTriangle className="return-icon" /> Return Details
                                        </h4>
                                        <div className="detail-row">
                                            <FiUser className="detail-icon" />
                                            <span className="detail-label">Customer</span>
                                            <span className="detail-value">{mobile.returned_customer_name || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <FiCalendar className="detail-icon" />
                                            <span className="detail-label">Returned On</span>
                                            <span className="detail-value">{formatDate(mobile.returned_date)}</span>
                                        </div>
                                        <div className="detail-row reason-row">
                                            <FiMessageSquare className="detail-icon" />
                                            <span className="detail-label">Reason</span>
                                            <span className="detail-value reason-text">{mobile.returned_reason || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="returned-card-pricing">
                                        <div className="price-item">
                                            <span className="price-label">Sold For</span>
                                            <span className="price-value">{formatCurrency(mobile.salesAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="returned-card-actions">
                                        <button
                                            className="btn btn-primary action-btn"
                                            onClick={() => handleMoveToStock(mobile.id)}
                                            disabled={processing === mobile.id}
                                        >
                                            <FiPackage />
                                            {processing === mobile.id ? 'Processing...' : 'Move to Stock'}
                                        </button>
                                        <button
                                            className="btn btn-danger action-btn"
                                            onClick={() => handleReturnToSeller(mobile.id)}
                                            disabled={processing === mobile.id}
                                        >
                                            <FiAlertTriangle />
                                            {processing === mobile.id ? 'Processing...' : 'Return to Seller'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Model</th>
                                        <th>IMEI</th>
                                        <th>Customer Name</th>
                                        <th>Returned Date</th>
                                        <th>Reason</th>
                                        <th>Sold Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mobiles.map((mobile) => (
                                        <tr key={mobile.id}>
                                            <td>{mobile.serialNo}</td>
                                            <td className="model-name">{mobile.modelName}</td>
                                            <td className="imei">{mobile.imei1}</td>
                                            <td>{mobile.returned_customer_name || '-'}</td>
                                            <td>{formatDate(mobile.returned_date)}</td>
                                            <td className="reason-cell">{mobile.returned_reason || '-'}</td>
                                            <td>{formatCurrency(mobile.salesAmount)}</td>
                                            <td>
                                                <span className="badge badge-warning">Returned</span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleMoveToStock(mobile.id)}
                                                        disabled={processing === mobile.id}
                                                        title="Move to Stock"
                                                    >
                                                        <FiPackage />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleReturnToSeller(mobile.id)}
                                                        disabled={processing === mobile.id}
                                                        title="Return to Seller"
                                                    >
                                                        <FiAlertTriangle />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnedMobiles;
