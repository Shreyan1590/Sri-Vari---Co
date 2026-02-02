import React from 'react';
import { FiWifiOff, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import './NetworkError.css';

const NetworkError = ({
    error,
    onRetry,
    title = 'Connection Error',
    message = 'Unable to connect to the server. Please check your internet connection.',
    showRetry = true
}) => {
    const isOffline = !navigator.onLine;

    return (
        <div className="network-error">
            <div className="network-error-icon">
                {isOffline ? <FiWifiOff /> : <FiAlertCircle />}
            </div>
            <h3 className="network-error-title">
                {isOffline ? 'No Internet Connection' : title}
            </h3>
            <p className="network-error-message">
                {isOffline
                    ? 'Please check your network settings and try again.'
                    : (error?.userMessage || message)
                }
            </p>
            {showRetry && (
                <button className="network-error-retry" onClick={onRetry}>
                    <FiRefreshCw />
                    Try Again
                </button>
            )}
        </div>
    );
};

export default NetworkError;
