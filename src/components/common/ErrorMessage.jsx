import React from 'react';

/**
 * ErrorMessage component displays error or empty state messages.
 * Provides retry functionality and accessible error notifications.
 *
 * @param {Object} props
 * @param {string} props.type - 'error' or 'empty'
 * @param {string} [props.title] - Error title
 * @param {string} [props.message] - Descriptive error message
 * @param {Function} [props.onRetry] - Callback for retry button
 */
const ErrorMessage = ({ type = 'error', title, message, onRetry }) => {
    const isError = type === 'error';

    return (
        <div
            className={isError ? 'error-container' : 'empty-state'}
            role={isError ? 'alert' : 'status'}
            aria-live="assertive"
        >
            <span className={isError ? 'error-icon' : 'empty-state-icon'} aria-hidden="true">
                {isError ? '⚠️' : '📊'}
            </span>
            <h3 className={isError ? 'error-title' : 'empty-state-title'}>
                {title || (isError ? 'Something went wrong' : 'No data found')}
            </h3>
            <p className={isError ? 'error-message' : 'empty-state-text'}>
                {message ||
                    (isError
                        ? 'An error occurred while processing the data. Please try again.'
                        : 'No data matches your current filter criteria. Try adjusting your filters.')}
            </p>
            {onRetry && (
                <button
                    className="retry-btn"
                    onClick={onRetry}
                    aria-label={isError ? 'Retry loading data' : 'Reset filters'}
                >
                    {isError ? 'Try Again' : 'Reset Filters'}
                </button>
            )}
        </div>
    );
};

export default React.memo(ErrorMessage);
