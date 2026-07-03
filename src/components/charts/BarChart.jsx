import React, { useMemo, useState, useCallback, useId } from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import ErrorMessage from '../common/ErrorMessage.jsx';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

/**
 * Custom Tooltip for the BarChart.
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
 * CategoryBarChart displays revenue comparison across categories as a bar chart.
 * Features custom colored bars and responsive sizing.
 *
 * @param {Object} props
 * @param {Array} props.data - Category aggregated data
 */
const CategoryBarChart = ({ data }) => {
    const hasData = data && data.length > 0;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isKeyboardMode, setIsKeyboardMode] = useState(false);
    const instructionsId = useId();
    const valueId = useId();

    const chartData = useMemo(() => {
        if (!hasData) return [];
        return data.map((item) => ({
            name: item.category,
            Revenue: item.totalRevenue,
            Units: item.totalUnits,
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
                title="No category data"
                message="No data available for the selected filters to display category breakdown."
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
            aria-label={`Bar chart comparing revenue across ${chartData.length} categories. Highest category: ${chartData[0]?.name} with $${chartData[0]?.Revenue?.toLocaleString()}.`}
            aria-describedby={`${instructionsId} ${valueId}`}
        >
            <span id={instructionsId} className="sr-only">
                Use left and right arrow keys to move between categories and read values.
            </span>
            <span id={valueId} className="sr-only">
                {activePoint
                    ? `${activePoint.name}: Revenue $${activePoint.Revenue.toLocaleString()}, Units ${activePoint.Units.toLocaleString()}.`
                    : 'No active data point.'}
            </span>
            {activePoint && (
                <div className="custom-tooltip keyboard-tooltip" role="tooltip" aria-live="polite">
                    <p className="tooltip-label">{activePoint.name}</p>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#6366f1' }} aria-hidden="true"></span>
                        <span>Revenue: ${activePoint.Revenue.toLocaleString()}</span>
                    </div>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#06b6d4' }} aria-hidden="true"></span>
                        <span>Units: {activePoint.Units.toLocaleString()}</span>
                    </div>
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barCategoryGap="20%"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                            value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`
                        }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
                    <Bar
                        dataKey="Revenue"
                        name="Revenue"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={60}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                fillOpacity={0.85}
                            />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(CategoryBarChart);
