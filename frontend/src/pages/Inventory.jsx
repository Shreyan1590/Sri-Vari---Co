import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mobilesAPI } from '../services/api';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiFilter,
    FiPhone
} from 'react-icons/fi';
import Skeleton, { InventoryCardSkeleton } from '../components/Skeleton';
import './Inventory.css';

const Inventory = () => {
    const [searchParams] = useSearchParams();
    const [mobiles, setMobiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMobile, setSelectedMobile] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        serialNo: '',
        purchaseDate: '',
        modelName: '',
        imei1: '',
        imei2: '',
        purchaseAmount: '',
        ramRom: '',
        seller: ''
    });

    const [sellData, setSellData] = useState({
        salesDate: '',
        salesAmount: ''
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        serialNo: '',
        purchaseDate: '',
        modelName: '',
        imei1: '',
        imei2: '',
        purchaseAmount: '',
        ramRom: '',
        seller: '',
        salesDate: '',
        salesAmount: '',
        status: ''
    });

    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setShowAddModal(true);
        }
        fetchMobiles();
    }, [statusFilter, searchParams]);

    const fetchMobiles = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await mobilesAPI.getAll(params);
            setMobiles(response.data.data);
        } catch (err) {
            setError('Failed to load mobiles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMobiles();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ========================================
    // PRICE CODE MAP - Fixed Letter to Amount Mapping
    // ========================================
    // Z = ₹10,000  Y = ₹12,000  X = ₹15,000
    // W = ₹18,000  V = ₹20,000  U = ₹22,000
    // T = ₹25,000  S = ₹27,000  R = ₹30,000
    // Q = ₹35,000
    // ========================================

    const PRICE_CODE_MAP = {
        Z: 10000,
        Y: 12000,
        X: 15000,
        W: 18000,
        V: 20000,
        U: 22000,
        T: 25000,
        S: 27000,
        R: 30000,
        Q: 35000
    };

    const VALID_CODES = Object.keys(PRICE_CODE_MAP);

    /**
     * Convert code to numeric amount
     */
    const codeToNumeric = (code) => {
        if (!code) return null;
        const upperCode = code.toString().toUpperCase().trim();
        return PRICE_CODE_MAP[upperCode] || null;
    };

    /**
     * Check if a string is a valid price code
     */
    const isValidCode = (code) => {
        if (!code) return false;
        return VALID_CODES.includes(code.toString().toUpperCase().trim());
    };

    /**
     * Check if input is numeric
     */
    const isNumericInput = (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    };

    /**
     * Get helper text for a code
     */
    const getCodeHelperText = (code) => {
        if (!code) return '';
        const upperCode = code.toUpperCase();
        const amount = PRICE_CODE_MAP[upperCode];
        if (amount) {
            return `${upperCode} = ₹${amount.toLocaleString('en-IN')}`;
        }
        return '';
    };

    // Input validation state
    const [purchaseAmountError, setPurchaseAmountError] = useState('');
    const [purchaseAmountHelper, setPurchaseAmountHelper] = useState('');

    /**
     * Handle purchase amount input change
     * Accepts: numeric values OR single letter codes (Z-Q)
     */
    const handlePurchaseAmountChange = (value, isEdit = false) => {
        const trimmed = value.trim();
        const setter = isEdit ? setEditFormData : setFormData;
        const currentData = isEdit ? editFormData : formData;

        // Allow empty
        if (!trimmed) {
            setter({ ...currentData, purchaseAmount: '' });
            setPurchaseAmountError('');
            setPurchaseAmountHelper('');
            return;
        }

        // Check if numeric
        if (isNumericInput(trimmed)) {
            setter({ ...currentData, purchaseAmount: trimmed });
            setPurchaseAmountError('');
            setPurchaseAmountHelper('');
            return;
        }

        // Check if valid code (single letter)
        const upperValue = trimmed.toUpperCase();
        if (upperValue.length === 1 && isValidCode(upperValue)) {
            setter({ ...currentData, purchaseAmount: upperValue });
            setPurchaseAmountError('');
            setPurchaseAmountHelper(getCodeHelperText(upperValue));
            return;
        }

        // Invalid input
        setter({ ...currentData, purchaseAmount: trimmed.toUpperCase() });
        setPurchaseAmountError('Enter a number or valid code (Z, Y, X, W, V, U, T, S, R, Q)');
        setPurchaseAmountHelper('');
    };

    /**
     * Prepare purchase amount data for API submission
     * Returns { purchaseAmountCode, purchaseAmountNumeric }
     */
    const preparePurchaseAmount = (value) => {
        if (!value) return { purchaseAmountCode: null, purchaseAmountNumeric: null };
        const trimmed = value.toString().trim();

        if (isNumericInput(trimmed)) {
            return {
                purchaseAmountCode: null,
                purchaseAmountNumeric: parseFloat(trimmed)
            };
        }

        const upperCode = trimmed.toUpperCase();
        if (isValidCode(upperCode)) {
            return {
                purchaseAmountCode: upperCode,
                purchaseAmountNumeric: codeToNumeric(upperCode)
            };
        }

        return { purchaseAmountCode: null, purchaseAmountNumeric: null };
    };

    /**
     * Get display value for purchase amount in Inventory
     * Shows code if available, otherwise shows numeric
     */
    const getDisplayPurchaseAmount = (mobile) => {
        if (mobile.purchaseAmountCode) {
            return mobile.purchaseAmountCode;
        }
        // For legacy data with purchaseAmount field
        if (mobile.purchaseAmount) {
            return mobile.purchaseAmount;
        }
        // Fallback to numeric if no code
        if (mobile.purchaseAmountNumeric) {
            return mobile.purchaseAmountNumeric.toString();
        }
        return '-';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Handle Add Mobile
    const handleAddMobile = async (e) => {
        e.preventDefault();
        if (submitting) return; // Prevent double-submit
        setError('');
        setSubmitting(true);

        try {
            const { purchaseAmountCode, purchaseAmountNumeric } = preparePurchaseAmount(formData.purchaseAmount);

            if (!purchaseAmountNumeric) {
                setError('Please enter a valid purchase amount');
                setSubmitting(false);
                return;
            }

            await mobilesAPI.add({
                serialNo: formData.serialNo,
                purchaseDate: formData.purchaseDate,
                modelName: formData.modelName,
                imei1: formData.imei1,
                imei2: formData.imei2,
                purchaseAmountCode,
                purchaseAmountNumeric,
                ramRom: formData.ramRom,
                seller: formData.seller
            });

            setSuccess('Mobile added successfully!');
            setShowAddModal(false);
            setFormData({ serialNo: '', purchaseDate: '', modelName: '', imei1: '', imei2: '', purchaseAmount: '', ramRom: '', seller: '' });
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Add mobile error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Network error - please check connection';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Sell Mobile
    const handleSellMobile = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setError('');
        setSubmitting(true);

        try {
            await mobilesAPI.sell(selectedMobile._id, {
                ...sellData,
                salesAmount: parseFloat(sellData.salesAmount)
            });

            setSuccess('Mobile sold successfully!');
            setShowSellModal(false);
            setSellData({ salesDate: '', salesAmount: '' });
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Sell mobile error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Network error - please check connection';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Edit Mobile
    const handleEditMobile = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setError('');
        setSubmitting(true);

        try {
            const { purchaseAmountCode, purchaseAmountNumeric } = preparePurchaseAmount(editFormData.purchaseAmount);

            if (!purchaseAmountNumeric) {
                setError('Please enter a valid purchase amount');
                setSubmitting(false);
                return;
            }

            await mobilesAPI.update(selectedMobile._id, {
                serialNo: editFormData.serialNo,
                purchaseDate: editFormData.purchaseDate,
                modelName: editFormData.modelName,
                imei1: editFormData.imei1,
                imei2: editFormData.imei2,
                purchaseAmountCode,
                purchaseAmountNumeric,
                ramRom: editFormData.ramRom,
                seller: editFormData.seller,
                salesDate: editFormData.salesDate,
                salesAmount: editFormData.salesAmount ? parseFloat(editFormData.salesAmount) : null,
                status: editFormData.status
            });

            setSuccess('Mobile updated successfully!');
            setShowEditModal(false);
            setEditFormData({ serialNo: '', purchaseDate: '', modelName: '', imei1: '', imei2: '', purchaseAmount: '', ramRom: '', seller: '', salesDate: '', salesAmount: '', status: '' });
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Edit mobile error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Network error - please check connection';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete Mobile
    const handleDeleteMobile = async () => {
        try {
            await mobilesAPI.delete(selectedMobile._id);

            setSuccess('Mobile deleted successfully!');
            setShowDeleteModal(false);
            setSelectedMobile(null);
            fetchMobiles();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete mobile');
        }
    };

    // Open edit modal
    const openEditModal = (mobile) => {
        setSelectedMobile(mobile);
        // For purchase amount: show code if available, otherwise show numeric
        const purchaseAmountDisplay = mobile.purchaseAmountCode ||
            (mobile.purchaseAmountNumeric ? mobile.purchaseAmountNumeric.toString() : '') ||
            (mobile.purchaseAmount || ''); // Legacy fallback
        setEditFormData({
            serialNo: mobile.serialNo || '',
            purchaseDate: mobile.purchaseDate ? new Date(mobile.purchaseDate).toISOString().split('T')[0] : '',
            modelName: mobile.modelName || '',
            imei1: mobile.imei1 || '',
            imei2: mobile.imei2 || '',
            purchaseAmount: purchaseAmountDisplay,
            ramRom: mobile.ramRom || '',
            seller: mobile.seller || '',
            salesDate: mobile.salesDate ? new Date(mobile.salesDate).toISOString().split('T')[0] : '',
            salesAmount: mobile.salesAmount || '',
            status: mobile.status || 'IN_STOCK'
        });
        // Update helper text if showing a code
        if (mobile.purchaseAmountCode && isValidCode(mobile.purchaseAmountCode)) {
            setPurchaseAmountHelper(getCodeHelperText(mobile.purchaseAmountCode));
        } else {
            setPurchaseAmountHelper('');
        }
        setPurchaseAmountError('');
        setShowEditModal(true);
    };

    // Open sell modal
    const openSellModal = (mobile) => {
        setSelectedMobile(mobile);
        setSellData({ salesDate: new Date().toISOString().split('T')[0], salesAmount: '' });
        setShowSellModal(true);
    };

    // Open delete modal
    const openDeleteModal = (mobile) => {
        setSelectedMobile(mobile);
        setShowDeleteModal(true);
    };

    return (
        <div className="inventory">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory Management</h1>
                    <p className="page-subtitle">Manage your second-hand mobile phones</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <FiPlus /> Add Mobile
                </button>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search S.No, Model, IMEI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setSearchTerm('')}
                            type="button"
                        >
                            <FiX />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <FiFilter className="filter-icon" />
                    <select
                        className="form-input form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="SOLD">Sold</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="inventory-content">
                        <div className="mobile-card-list">
                            {[1, 2, 3].map(i => <InventoryCardSkeleton key={i} />)}
                        </div>
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {Array(12).fill(0).map((_, i) => <th key={i}><Skeleton width="80px" /></th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            {Array(12).fill(0).map((_, j) => <td key={j}><Skeleton width="100%" /></td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : mobiles.length === 0 ? (
                    <div className="empty-state">
                        <FiPhone size={48} />
                        <h3>No mobiles found</h3>
                        <p>Start by adding a new mobile to your inventory</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <FiPlus /> Add Mobile
                        </button>
                    </div>
                ) : (
                    <div className="inventory-content">
                        {/* Mobile Card View (Visible only on mobile) */}
                        <div className="mobile-card-list">
                            {mobiles.map((mobile) => (
                                <div key={mobile._id} className="mobile-inventory-card">
                                    <div className="card-badge-row">
                                        <span className="mobile-serial">S.No: {mobile.serialNo}</span>
                                        <span className={`badge ${mobile.status === 'IN_STOCK' ? 'badge-info' : 'badge-success'}`}>
                                            {mobile.status === 'IN_STOCK' ? 'In Stock' : 'Sold'}
                                        </span>
                                    </div>
                                    <div className="mobile-card-main">
                                        <h3 className="mobile-model">{mobile.modelName}</h3>
                                        <div className="mobile-spec-row">
                                            <span>{mobile.ramRom || 'N/A'}</span>
                                            <span className="dot">•</span>
                                            <span>{formatDate(mobile.purchaseDate)}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-imei-box">
                                        <code>{mobile.imei1}</code>
                                        {mobile.imei2 && <code>{mobile.imei2}</code>}
                                    </div>
                                    <div className="mobile-price-row">
                                        <div className="price-item">
                                            <span className="price-label">Cost:</span>
                                            <span className="price-value">{getDisplayPurchaseAmount(mobile)}</span>
                                        </div>
                                        {mobile.status === 'SOLD' && (
                                            <div className="price-item">
                                                <span className="price-label">Sold:</span>
                                                <span className="price-value success">{formatCurrency(mobile.salesAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mobile-card-actions">
                                        <button className="mobile-btn edit" onClick={() => openEditModal(mobile)}>
                                            <FiEdit2 /> Edit
                                        </button>
                                        {mobile.status === 'IN_STOCK' && (
                                            <button className="mobile-btn sell" onClick={() => openSellModal(mobile)}>
                                                <span style={{ fontWeight: 'bold' }}>₹</span> Sell
                                            </button>
                                        )}
                                        <button className="mobile-btn delete" onClick={() => openDeleteModal(mobile)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table (Visible only on desktop) */}
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Model Name</th>
                                        <th>RAM / ROM</th>
                                        <th>IMEI 1</th>
                                        <th>IMEI 2</th>
                                        <th>Purchase Date</th>
                                        <th>Purchase Amount</th>
                                        <th>Seller</th>
                                        <th>Sales Date</th>
                                        <th>Sales Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mobiles.map((mobile) => (
                                        <tr key={mobile._id}>
                                            <td>{mobile.serialNo}</td>
                                            <td className="model-name">{mobile.modelName}</td>
                                            <td>{mobile.ramRom || '-'}</td>
                                            <td className="imei">{mobile.imei1}</td>
                                            <td className="imei">{mobile.imei2 || '-'}</td>
                                            <td>{formatDate(mobile.purchaseDate)}</td>
                                            <td>{getDisplayPurchaseAmount(mobile)}</td>
                                            <td>{mobile.seller || '-'}</td>
                                            <td>{formatDate(mobile.salesDate)}</td>
                                            <td>{mobile.salesAmount ? formatCurrency(mobile.salesAmount) : '-'}</td>
                                            <td>
                                                <span className={`badge ${mobile.status === 'IN_STOCK' ? 'badge-info' : 'badge-success'}`}>
                                                    {mobile.status === 'IN_STOCK' ? 'In Stock' : 'Sold'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => openEditModal(mobile)}
                                                        title="Edit Mobile"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    {mobile.status === 'IN_STOCK' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => openSellModal(mobile)}
                                                            title="Sell Mobile"
                                                        >
                                                            <span style={{ fontWeight: 'bold' }}>₹</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => openDeleteModal(mobile)}
                                                        title="Delete Mobile"
                                                    >
                                                        <FiTrash2 />
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

            {/* Add Mobile Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Add New Mobile</h3>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleAddMobile}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">S.No (Optional)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Leave blank to auto-generate"
                                            value={formData.serialNo}
                                            onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                                        />
                                        <small className="form-hint">Manual S.No entry. If blank, next sequence is used.</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Purchase Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.purchaseDate}
                                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., iPhone 12 Pro"
                                            value={formData.modelName}
                                            onChange={(e) => setFormData({ ...formData, modelName: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IMEI 1 *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="15-digit IMEI 1"
                                            value={formData.imei1}
                                            onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                                            pattern="\d{15}"
                                            maxLength="15"
                                            required
                                        />
                                        <small className="form-hint">Enter exactly 15 digits</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IMEI 2 (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="15-digit IMEI 2"
                                            value={formData.imei2}
                                            onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                                            pattern="\d{15}"
                                            maxLength="15"
                                        />
                                        <small className="form-hint">Enter exactly 15 digits (dual SIM phones)</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Purchase Amount *</label>
                                        <input
                                            type="text"
                                            className={`form-input ${purchaseAmountError ? 'input-error' : ''}`}
                                            placeholder="e.g., 25000 or S"
                                            value={formData.purchaseAmount}
                                            onChange={(e) => handlePurchaseAmountChange(e.target.value, false)}
                                            required
                                        />
                                        {purchaseAmountHelper && <small className="form-hint form-hint-success">{purchaseAmountHelper}</small>}
                                        {purchaseAmountError && <small className="form-hint form-hint-error">{purchaseAmountError}</small>}
                                        <small className="form-hint">Enter amount or code: Z=₹10K, S=₹27K, Q=₹35K</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">RAM / ROM</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., 4/64"
                                            value={formData.ramRom}
                                            onChange={(e) => setFormData({ ...formData, ramRom: e.target.value.replace(/[^0-9/]/g, '') })}
                                        />
                                        <small className="form-hint">e.g., 4/64 for 4GB RAM / 64GB ROM</small>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Seller</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Seller name"
                                            value={formData.seller}
                                            onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-bottom-spacer"></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Adding...' : <><FiPlus /> Add Mobile</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Mobile Modal */}
            {
                showEditModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Edit Mobile</h3>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleEditMobile}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">S.No *</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="Serial Number"
                                                value={editFormData.serialNo}
                                                onChange={(e) => setEditFormData({ ...editFormData, serialNo: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Purchase Date *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={editFormData.purchaseDate}
                                                onChange={(e) => setEditFormData({ ...editFormData, purchaseDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Model Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., iPhone 12 Pro"
                                                value={editFormData.modelName}
                                                onChange={(e) => setEditFormData({ ...editFormData, modelName: e.target.value.toUpperCase() })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">IMEI 1 *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="15-digit IMEI 1"
                                                value={editFormData.imei1}
                                                onChange={(e) => setEditFormData({ ...editFormData, imei1: e.target.value })}
                                                pattern="\d{15}"
                                                maxLength="15"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">IMEI 2</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="15-digit IMEI 2"
                                                value={editFormData.imei2}
                                                onChange={(e) => setEditFormData({ ...editFormData, imei2: e.target.value })}
                                                pattern="\d{15}"
                                                maxLength="15"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Purchase Amount *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${purchaseAmountError ? 'input-error' : ''}`}
                                                placeholder="e.g., 25000 or S"
                                                value={editFormData.purchaseAmount}
                                                onChange={(e) => handlePurchaseAmountChange(e.target.value, true)}
                                                required
                                            />
                                            {purchaseAmountHelper && <small className="form-hint form-hint-success">{purchaseAmountHelper}</small>}
                                            {purchaseAmountError && <small className="form-hint form-hint-error">{purchaseAmountError}</small>}
                                            <small className="form-hint">Enter amount or code: Z=₹10K, S=₹27K, Q=₹35K</small>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">RAM / ROM</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., 4/64"
                                                value={editFormData.ramRom}
                                                onChange={(e) => setEditFormData({ ...editFormData, ramRom: e.target.value.replace(/[^0-9/]/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Seller</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Seller name"
                                                value={editFormData.seller}
                                                onChange={(e) => setEditFormData({ ...editFormData, seller: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-input form-select"
                                                value={editFormData.status}
                                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            >
                                                <option value="IN_STOCK">In Stock</option>
                                                <option value="SOLD">Sold</option>
                                            </select>
                                        </div>
                                    </div>
                                    {editFormData.status === 'SOLD' && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Sales Date</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={editFormData.salesDate}
                                                    onChange={(e) => setEditFormData({ ...editFormData, salesDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Sales Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="e.g., 30000"
                                                    value={editFormData.salesAmount}
                                                    onChange={(e) => setEditFormData({ ...editFormData, salesAmount: e.target.value })}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="modal-bottom-spacer"></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Updating...' : <><FiEdit2 /> Update Mobile</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Sell Mobile Modal */}
            {
                showSellModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Sell Mobile</h3>
                                <button className="modal-close" onClick={() => setShowSellModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSellMobile}>
                                <div className="modal-body">
                                    <div className="sell-mobile-info">
                                        <p><strong>Model:</strong> {selectedMobile.modelName}</p>
                                        <p><strong>IMEI 1:</strong> {selectedMobile.imei1}</p>
                                        {selectedMobile.imei2 && <p><strong>IMEI 2:</strong> {selectedMobile.imei2}</p>}
                                        <p><strong>Purchase Price:</strong> {selectedMobile.purchaseAmount}</p>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sales Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={sellData.salesDate}
                                            onChange={(e) => setSellData({ ...sellData, salesDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sales Amount (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="e.g., 30000"
                                            value={sellData.salesAmount}
                                            onChange={(e) => setSellData({ ...sellData, salesAmount: e.target.value })}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowSellModal(false)} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success" disabled={submitting}>
                                        {submitting ? 'Processing...' : <><span style={{ fontWeight: 'bold' }}>₹</span> Confirm Sale</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && selectedMobile && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Delete Mobile</h3>
                                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="delete-warning">
                                    <FiTrash2 size={48} />
                                    <p>Are you sure you want to delete this mobile?</p>
                                    <div className="delete-mobile-info">
                                        <p><strong>Model:</strong> {selectedMobile.modelName}</p>
                                        <p><strong>IMEI 1:</strong> {selectedMobile.imei1}</p>
                                        {selectedMobile.imei2 && <p><strong>IMEI 2:</strong> {selectedMobile.imei2}</p>}
                                    </div>
                                    <small>This action cannot be undone.</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger btn-delete-primary" onClick={handleDeleteMobile}>
                                    <FiTrash2 /> Delete
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Floating Action Button (Mobile Only) */}
            <button
                className="fab-add-mobile"
                onClick={() => setShowAddModal(true)}
                aria-label="Add New Mobile"
            >
                <FiPlus />
            </button>
        </div >
    );
};

export default Inventory;
