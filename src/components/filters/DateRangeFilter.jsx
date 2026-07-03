import React, { useCallback } from 'react';

/**
 * DateRangeFilter renders two date inputs for filtering by date range.
 * Ensures accessible labeling and validation between start/end dates.
 *
 * @param {Object} props
 * @param {string} props.startDate - Start date value (YYYY-MM-DD)
 * @param {string} props.endDate - End date value (YYYY-MM-DD)
 * @param {Function} props.onStartDateChange - Callback for start date change
 * @param {Function} props.onEndDateChange - Callback for end date change
 */
const DateRangeFilter = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}) => {
    const handleStartChange = useCallback(
        (e) => {
            onStartDateChange(e.target.value);
        },
        [onStartDateChange]
    );

    const handleEndChange = useCallback(
        (e) => {
            onEndDateChange(e.target.value);
        },
        [onEndDateChange]
    );

    return (
        <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label" id="date-range-label">
                Date Range
            </label>
            <div
                className="filter-date-group"
                role="group"
                aria-labelledby="date-range-label"
            >
                <div style={{ flex: 1 }}>
                    <input
                        type="date"
                        id="date-start"
                        className="filter-date-input"
                        value={startDate}
                        onChange={handleStartChange}
                        max={endDate || '2023-12-31'}
                        min="2023-01-01"
                        aria-label="Start date for filtering"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        type="date"
                        id="date-end"
                        className="filter-date-input"
                        value={endDate}
                        onChange={handleEndChange}
                        min={startDate || '2023-01-01'}
                        max="2023-12-31"
                        aria-label="End date for filtering"
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(DateRangeFilter);
