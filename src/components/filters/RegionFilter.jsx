import React, { useCallback } from 'react';

/**
 * RegionFilter renders a dropdown select for filtering by geographic region.
 * Supports keyboard navigation and screen reader accessibility.
 *
 * @param {Object} props
 * @param {Array} props.regions - Available region options
 * @param {string} props.selectedRegion - Currently selected region
 * @param {Function} props.onChange - Callback when selection changes
 */
const RegionFilter = ({ regions, selectedRegion, onChange }) => {
    const handleChange = useCallback(
        (e) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <div className="filter-group">
            <label htmlFor="region-filter" className="filter-label">
                Region
            </label>
            <select
                id="region-filter"
                className="filter-select"
                value={selectedRegion}
                onChange={handleChange}
                aria-label="Filter by geographic region"
                aria-describedby="region-filter-desc"
            >
                <option value="all">All Regions</option>
                {regions.map((region) => (
                    <option key={region} value={region}>
                        {region}
                    </option>
                ))}
            </select>
            <span id="region-filter-desc" className="sr-only">
                Select a geographic region to filter the dashboard data
            </span>
        </div>
    );
};

export default React.memo(RegionFilter);
