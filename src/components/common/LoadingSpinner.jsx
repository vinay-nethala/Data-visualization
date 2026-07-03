import React from 'react';

/**
 * LoadingSpinner component displays a spinner animation with optional message.
 * Provides accessible loading state indicator for screen readers.
 *
 * @param {Object} props
 * @param {string} [props.message='Loading data...'] - Loading message to display
 */
const LoadingSpinner = ({ message = 'Loading data...' }) => {
    return (
        <div
            className="loading-overlay"
            role="status"
            aria-live="polite"
            aria-label="Loading content"
        >
            <div className="loading-spinner" aria-hidden="true"></div>
            <p className="loading-text">{message}</p>
            <span className="sr-only">Please wait while the data is being loaded</span>
        </div>
    );
};

export default React.memo(LoadingSpinner);
