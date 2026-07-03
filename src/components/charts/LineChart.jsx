import React, { useMemo, useState, useCallback, useId } from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import ErrorMessage from '../common/ErrorMessage.jsx';

/**
 * Custom Tooltip component for the LineChart.
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="custom-tooltip" role="tooltip">
            <p className="tooltip-label">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="tooltip-item">
                    <span
                        className="tooltip-dot"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                    ></span>
                    <span>
                        {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * RevenueLineChart displays a dual-axis line chart of monthly revenue and units sold.
 * Uses Recharts ResponsiveContainer for adaptive sizing.
 *
 * @param {Object} props
 * @param {Array} props.data - Monthly aggregated data
 */
const RevenueLineChart = ({ data }) => {
    const hasData = data && data.length > 0;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isKeyboardMode, setIsKeyboardMode] = useState(false);
    const instructionsId = useId();
    const valueId = useId();

    const chartData = useMemo(() => {
        if (!hasData) return [];
        return data.map((item) => ({
            ...item,
            revenue: item.totalRevenue,
            units: item.totalUnits,
        }));
    }, [data, hasData]);

    const safeIndex = chartData.length
        ? Math.min(activeIndex, chartData.length - 1)
        : 0;
    const activePoint = isKeyboardMode && chartData.length
        ? chartData[safeIndex]
        : null;

    const handleKeyDown = useCallback(
        (event) => {
            if (!chartData.length) return;

            let nextIndex = null;
            if (event.key === 'ArrowRight') nextIndex = safeIndex + 1;
            if (event.key === 'ArrowLeft') nextIndex = safeIndex - 1;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = chartData.length - 1;

            if (nextIndex !== null) {
                event.preventDefault();
                const clamped = Math.max(0, Math.min(nextIndex, chartData.length - 1));
                setActiveIndex(clamped);
            }
        },
        [chartData.length, safeIndex]
    );

    const handleFocus = useCallback(() => {
        if (!chartData.length) return;
        setIsKeyboardMode(true);
        setActiveIndex((prev) => (prev == null ? 0 : prev));
    }, [chartData.length]);

    const handleBlur = useCallback(() => {
        setIsKeyboardMode(false);
    }, []);

    if (!hasData) {
        return (
            <ErrorMessage
                type="empty"
                title="No trend data"
                message="No data available for the selected filters to display revenue trends."
            />
        );
    }

    return (
        <div
            className="chart-container"
            role="group"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label={`Line chart showing revenue trends over ${chartData.length} months. Revenue ranges from $${Math.min(...chartData.map(d => d.revenue)).toLocaleString()} to $${Math.max(...chartData.map(d => d.revenue)).toLocaleString()}.`}
            aria-describedby={`${instructionsId} ${valueId}`}
        >
            <span id={instructionsId} className="sr-only">
                Use left and right arrow keys to move between months and read values.
            </span>
            <span id={valueId} className="sr-only">
                {activePoint
                    ? `${activePoint.month}: Revenue $${activePoint.revenue.toLocaleString()}, Units ${activePoint.units.toLocaleString()}.`
                    : 'No active data point.'}
            </span>
            {activePoint && (
                <div className="custom-tooltip keyboard-tooltip" role="tooltip" aria-live="polite">
                    <p className="tooltip-label">{activePoint.month}</p>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#6366f1' }} aria-hidden="true"></span>
                        <span>Revenue: ${activePoint.revenue.toLocaleString()}</span>
                    </div>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#06b6d4' }} aria-hidden="true"></span>
                        <span>Units Sold: {activePoint.units.toLocaleString()}</span>
                    </div>
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                            value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`
                        }
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ color: '#94a3b8', fontSize: 13 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }}
                        activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="units"
                        name="Units Sold"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, fill: '#06b6d4' }}
                        activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#fff' }}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(RevenueLineChart);
