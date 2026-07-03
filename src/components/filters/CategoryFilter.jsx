import React, { useCallback } from 'react';

/**
 * CategoryFilter renders a dropdown select for filtering by product category.
 * Supports keyboard navigation and screen reader accessibility.
 *
 * @param {Object} props
 * @param {Array} props.categories - Available category options
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onChange - Callback when selection changes
 */
const CategoryFilter = ({ categories, selectedCategory, onChange }) => {
    const handleChange = useCallback(
        (e) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">
                Category
            </label>
            <select
                id="category-filter"
                className="filter-select"
                value={selectedCategory}
                onChange={handleChange}
                aria-label="Filter by product category"
                aria-describedby="category-filter-desc"
            >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>
            <span id="category-filter-desc" className="sr-only">
                Select a product category to filter the dashboard data
            </span>
        </div>
    );
};

export default React.memo(CategoryFilter);
