/**
 * Data Transformation Utilities
 * Provides filtering, aggregation, and transformation functions
 * for the dashboard's data processing layer.
 */

/**
 * Filters raw data based on the provided filter criteria.
 * @param {Array} data - The raw dataset array
 * @param {Object} filters - Filter object with category, region, startDate, endDate
 * @returns {Array} Filtered subset of data
 */
export const filterData = (data, filters) => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.region && filters.region !== 'all') {
        filtered = filtered.filter((item) => item.region === filters.region);
    }

    if (filters.startDate) {
        const start = new Date(filters.startDate);
        filtered = filtered.filter((item) => new Date(item.date) >= start);
    }

    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((item) => new Date(item.date) <= end);
    }

    return filtered;
};

/**
 * Aggregates data by month for time-series charts.
 * @param {Array} data - Filtered dataset
 * @returns {Array} Monthly aggregated data sorted chronologically
 */
export const aggregateByMonth = (data) => {
    if (!data || data.length === 0) return [];

    const monthMap = {};
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    data.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        if (!monthMap[monthKey]) {
            monthMap[monthKey] = {
                month: monthLabel,
                sortKey: monthKey,
                totalRevenue: 0,
                totalUnits: 0,
                count: 0,
                avgSatisfaction: 0,
            };
        }

        monthMap[monthKey].totalRevenue += item.value * item.units;
        monthMap[monthKey].totalUnits += item.units;
        monthMap[monthKey].count += 1;
        monthMap[monthKey].avgSatisfaction += item.satisfaction;
    });

    return Object.values(monthMap)
        .map((entry) => ({
            ...entry,
            avgSatisfaction: Number((entry.avgSatisfaction / entry.count).toFixed(2)),
            totalRevenue: Math.round(entry.totalRevenue),
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
};

/**
 * Aggregates data by category for pie/bar charts.
 * @param {Array} data - Filtered dataset
 * @returns {Array} Category aggregated data sorted by revenue descending
 */
export const aggregateByCategory = (data) => {
    if (!data || data.length === 0) return [];

    const categoryMap = {};

    data.forEach((item) => {
        if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
                category: item.category,
                totalRevenue: 0,
                totalUnits: 0,
                count: 0,
                avgSatisfaction: 0,
            };
        }

        categoryMap[item.category].totalRevenue += item.value * item.units;
        categoryMap[item.category].totalUnits += item.units;
        categoryMap[item.category].count += 1;
        categoryMap[item.category].avgSatisfaction += item.satisfaction;
    });

    return Object.values(categoryMap)
        .map((entry) => ({
            ...entry,
            avgSatisfaction: Number((entry.avgSatisfaction / entry.count).toFixed(2)),
            totalRevenue: Math.round(entry.totalRevenue),
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

/**
 * Aggregates data by region for geographic/comparison charts.
 * @param {Array} data - Filtered dataset
 * @returns {Array} Region aggregated data sorted by revenue descending
 */
export const aggregateByRegion = (data) => {
    if (!data || data.length === 0) return [];

    const regionMap = {};

    data.forEach((item) => {
        if (!regionMap[item.region]) {
            regionMap[item.region] = {
                region: item.region,
                totalRevenue: 0,
                totalUnits: 0,
                count: 0,
                avgSatisfaction: 0,
            };
        }

        regionMap[item.region].totalRevenue += item.value * item.units;
        regionMap[item.region].totalUnits += item.units;
        regionMap[item.region].count += 1;
        regionMap[item.region].avgSatisfaction += item.satisfaction;
    });

    return Object.values(regionMap)
        .map((entry) => ({
            ...entry,
            avgSatisfaction: Number((entry.avgSatisfaction / entry.count).toFixed(2)),
            totalRevenue: Math.round(entry.totalRevenue),
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

/**
 * Calculates summary statistics from the filtered dataset.
 * @param {Array} data - Filtered dataset
 * @returns {Object} Summary stats: totalRevenue, totalUnits, avgSatisfaction, productCount
 */
export const calculateSummary = (data) => {
    if (!data || data.length === 0) {
        return {
            totalRevenue: 0,
            totalUnits: 0,
            avgSatisfaction: 0,
            productCount: 0,
        };
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.value * item.units, 0);
    const totalUnits = data.reduce((sum, item) => sum + item.units, 0);
    const avgSatisfaction = data.reduce((sum, item) => sum + item.satisfaction, 0) / data.length;

    return {
        totalRevenue: Math.round(totalRevenue),
        totalUnits,
        avgSatisfaction: Number(avgSatisfaction.toFixed(2)),
        productCount: data.length,
    };
};

/**
 * Formats a number as a currency string.
 * @param {number} value - Number to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
};

/**
 * Formats a number with commas for readability.
 * @param {number} value - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Extracts unique values for a given field from the dataset.
 * @param {Array} data - The raw dataset
 * @param {string} field - Field name to extract unique values from
 * @returns {Array} Sorted array of unique values
 */
export const getUniqueValues = (data, field) => {
    if (!data || !Array.isArray(data)) return [];
    return [...new Set(data.map((item) => item[field]))].sort();
};

/**
 * Simulates an API fetch with configurable delay.
 * @param {*} data - Data to return after delay
 * @param {number} delay - Delay in milliseconds (default: 800)
 * @returns {Promise} Resolves with data after delay
 */
export const simulateFetch = (data, delay = 800) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};
