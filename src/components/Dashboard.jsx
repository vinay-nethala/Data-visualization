import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import rawData from '../data/mockData.json';
import {
    filterData,
    aggregateByMonth,
    aggregateByCategory,
    aggregateByRegion,
    calculateSummary,
    getUniqueValues,
    simulateFetch,
} from '../utils/dataTransformers.js';

// Components
import LoadingSpinner from './common/LoadingSpinner.jsx';
import ErrorMessage from './common/ErrorMessage.jsx';
import SummaryCards from './common/SummaryCards.jsx';
import CategoryFilter from './filters/CategoryFilter.jsx';
import RegionFilter from './filters/RegionFilter.jsx';
import DateRangeFilter from './filters/DateRangeFilter.jsx';
import RevenueLineChart from './charts/LineChart.jsx';
import CategoryBarChart from './charts/BarChart.jsx';
import RegionPieChart from './charts/PieChart.jsx';

/**
 * Dashboard is the main container component for the data visualization dashboard.
 * It manages application state for filters, loading, errors, and coordinates
 * data flow from the mock dataset through transformation utilities to chart components.
 *
 * Architecture:
 * - Container/Presentational pattern: Dashboard manages state; child components are presentational
 * - Data flows: Raw Data -> filterData() -> aggregate functions -> Chart components
 * - Filter state is lifted here and passed down via props (avoiding prop drilling for this scope)
 */
const Dashboard = () => {
    // --- State ---
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        category: 'all',
        region: 'all',
        startDate: '',
        endDate: '',
    });

    const [appliedFilters, setAppliedFilters] = useState({
        category: 'all',
        region: 'all',
        startDate: '',
        endDate: '',
    });
    const [isFiltering, setIsFiltering] = useState(false);
    const isFirstFilterApply = useRef(true);

    // --- Derived Values (static, from raw data) ---
    const categories = useMemo(() => getUniqueValues(rawData, 'category'), []);
    const regions = useMemo(() => getUniqueValues(rawData, 'region'), []);

    // --- Initial Data Load (simulated fetch) ---
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const fetchedData = await simulateFetch(rawData, 1000);

                if (isMounted) {
                    setData(fetchedData);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load dashboard data. Please try again.');
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // --- Filter Application (simulated delay) ---
    useEffect(() => {
        if (isLoading) return;

        if (isFirstFilterApply.current) {
            isFirstFilterApply.current = false;
            setAppliedFilters(filters);
            return;
        }

        setIsFiltering(true);
        const timer = setTimeout(() => {
            setAppliedFilters(filters);
            setIsFiltering(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [filters, isLoading]);

    // --- Filtered & Aggregated Data (memoized) ---
    const { filteredData, filterError } = useMemo(() => {
        try {
            return {
                filteredData: filterData(data, appliedFilters),
                filterError: null,
            };
        } catch (err) {
            return {
                filteredData: [],
                filterError: 'An error occurred while filtering the data.',
            };
        }
    }, [data, appliedFilters]);

    const monthlyData = useMemo(() => aggregateByMonth(filteredData), [filteredData]);
    const categoryData = useMemo(() => aggregateByCategory(filteredData), [filteredData]);
    const regionData = useMemo(() => aggregateByRegion(filteredData), [filteredData]);
    const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);

    const isFiltered = useMemo(
        () =>
            filters.category !== 'all' ||
            filters.region !== 'all' ||
            filters.startDate !== '' ||
            filters.endDate !== '',
        [filters]
    );

    // --- Filter Handlers ---
    const handleCategoryChange = useCallback((value) => {
        setFilters((prev) => ({ ...prev, category: value }));
    }, []);

    const handleRegionChange = useCallback((value) => {
        setFilters((prev) => ({ ...prev, region: value }));
    }, []);

    const handleStartDateChange = useCallback((value) => {
        setFilters((prev) => ({ ...prev, startDate: value }));
    }, []);

    const handleEndDateChange = useCallback((value) => {
        setFilters((prev) => ({ ...prev, endDate: value }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            category: 'all',
            region: 'all',
            startDate: '',
            endDate: '',
        });
    }, []);

    const handleRetry = useCallback(() => {
        setError(null);
        setIsLoading(true);
        simulateFetch(rawData, 1000)
            .then((fetchedData) => {
                setData(fetchedData);
                setIsLoading(false);
            })
            .catch(() => {
                setError('Failed to load dashboard data. Please try again.');
                setIsLoading(false);
            });
    }, []);

    // --- Active filter tags ---
    const activeFilterTags = useMemo(() => {
        const tags = [];
        if (filters.category !== 'all') {
            tags.push({ key: 'category', label: `Category: ${filters.category}` });
        }
        if (filters.region !== 'all') {
            tags.push({ key: 'region', label: `Region: ${filters.region}` });
        }
        if (filters.startDate) {
            tags.push({ key: 'startDate', label: `From: ${filters.startDate}` });
        }
        if (filters.endDate) {
            tags.push({ key: 'endDate', label: `To: ${filters.endDate}` });
        }
        return tags;
    }, [filters]);

    // --- Render ---
    if (isLoading) {
        return <LoadingSpinner message="Fetching dashboard data..." />;
    }

    if (error) {
        return (
            <ErrorMessage
                type="error"
                title="Data Load Error"
                message={error}
                onRetry={handleRetry}
            />
        );
    }

    if (filterError) {
        return (
            <ErrorMessage
                type="error"
                title="Filter Error"
                message={filterError}
                onRetry={handleResetFilters}
            />
        );
    }

    return (
        <div id="dashboard-content">
            {/* Summary Cards */}
            <SummaryCards summary={summary} isFiltered={isFiltered} />

            {/* Filter Section */}
            <section
                className="filter-section"
                aria-label="Data filters"
                role="region"
            >
                <div className="filter-header">
                    <h2 className="filter-title">
                        <span className="filter-title-icon" aria-hidden="true">🔍</span>
                        Filter Data
                    </h2>
                    {isFiltered && (
                        <button
                            id="reset-filters-btn"
                            className="filter-reset-btn"
                            onClick={handleResetFilters}
                            aria-label="Reset all filters to default values"
                        >
                            ✕ Reset Filters
                        </button>
                    )}
                </div>
                <div className="filter-controls">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={filters.category}
                        onChange={handleCategoryChange}
                    />
                    <RegionFilter
                        regions={regions}
                        selectedRegion={filters.region}
                        onChange={handleRegionChange}
                    />
                    <DateRangeFilter
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                    />
                </div>

                {/* Active Filter Tags */}
                {activeFilterTags.length > 0 && (
                    <div
                        className="active-filters"
                        role="status"
                        aria-live="polite"
                        aria-label={`Active filters: ${activeFilterTags.map((t) => t.label).join(', ')}`}
                    >
                        {activeFilterTags.map((tag) => (
                            <span key={tag.key} className="active-filter-tag">
                                {tag.label}
                                <button
                                    className="active-filter-remove"
                                    onClick={() => {
                                        if (tag.key === 'category') handleCategoryChange('all');
                                        else if (tag.key === 'region') handleRegionChange('all');
                                        else if (tag.key === 'startDate') handleStartDateChange('');
                                        else if (tag.key === 'endDate') handleEndDateChange('');
                                    }}
                                    aria-label={`Remove filter: ${tag.label}`}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                <p className="results-count" aria-live="polite">
                    Showing <strong>{filteredData.length}</strong> of{' '}
                    <strong>{data.length}</strong> records
                </p>
            </section>

            {/* Charts - Loading/Empty state check */}
            {isFiltering ? (
                <LoadingSpinner message="Applying filters..." />
            ) : filteredData.length === 0 ? (
                <ErrorMessage
                    type="empty"
                    title="No matching data"
                    message="No records match your current filter criteria. Try adjusting or resetting your filters."
                    onRetry={handleResetFilters}
                />
            ) : (
                <>
                    {/* Charts Grid */}
                    <div className="charts-grid" role="region" aria-label="Data visualizations">
                        {/* Line Chart - Full Width */}
                        <div className="chart-card full-width animate-fade-in">
                            <div className="chart-header">
                                <div>
                                    <h3 className="chart-title">Revenue & Sales Trends</h3>
                                    <p className="chart-subtitle">Monthly revenue and units sold over time</p>
                                </div>
                                <span className="chart-badge">Time Series</span>
                            </div>
                            <RevenueLineChart data={monthlyData} />
                        </div>

                        {/* Bar Chart */}
                        <div className="chart-card animate-fade-in">
                            <div className="chart-header">
                                <div>
                                    <h3 className="chart-title">Revenue by Category</h3>
                                    <p className="chart-subtitle">Total revenue breakdown per category</p>
                                </div>
                                <span className="chart-badge">Comparison</span>
                            </div>
                            <CategoryBarChart data={categoryData} />
                        </div>

                        {/* Pie Chart */}
                        <div className="chart-card animate-fade-in">
                            <div className="chart-header">
                                <div>
                                    <h3 className="chart-title">Regional Distribution</h3>
                                    <p className="chart-subtitle">Revenue share across regions</p>
                                </div>
                                <span className="chart-badge">Distribution</span>
                            </div>
                            <RegionPieChart data={regionData} />
                        </div>
                    </div>

                    {/* Data Table */}
                    <section className="data-table-card" aria-label="Recent sales data" role="region">
                        <div className="chart-header">
                            <div>
                                <h3 className="chart-title">Recent Sales Data</h3>
                                <p className="chart-subtitle">
                                    Showing top 15 records {isFiltered ? '(filtered)' : ''}
                                </p>
                            </div>
                            <span className="chart-badge">{filteredData.length} Records</span>
                        </div>
                        <div className="data-table-wrapper">
                            <table className="data-table" aria-label="Sales records table">
                                <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Region</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Units</th>
                                        <th scope="col">Revenue</th>
                                        <th scope="col">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice(0, 15).map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td>{item.product}</td>
                                            <td>
                                                <span className={`category-badge ${item.category.toLowerCase()}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="region-text">{item.region}</td>
                                            <td>${item.value}</td>
                                            <td>{item.units.toLocaleString()}</td>
                                            <td>${(item.value * item.units).toLocaleString()}</td>
                                            <td>⭐ {item.satisfaction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Dashboard;
