import React, { useMemo, useCallback, useState, useId } from 'react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import ErrorMessage from '../common/ErrorMessage.jsx';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

/**
 * Custom Tooltip component for the PieChart.
 */
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0];

    return (
        <div className="custom-tooltip" role="tooltip">
            <p className="tooltip-label">{data.name}</p>
            <div className="tooltip-item">
                <span
                    className="tooltip-dot"
                    style={{ backgroundColor: data.payload.fill }}
                    aria-hidden="true"
                ></span>
                <span>Revenue: ${data.value.toLocaleString()}</span>
            </div>
            <div className="tooltip-item">
                <span
                    className="tooltip-dot"
                    style={{ backgroundColor: data.payload.fill, opacity: 0.5 }}
                    aria-hidden="true"
                ></span>
                <span>Share: {((data.value / data.payload.total) * 100).toFixed(1)}%</span>
            </div>
        </div>
    );
};

/**
 * Custom label renderer for pie slices showing percentage.
 */
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/**
 * RegionPieChart displays revenue distribution across regions as a donut chart.
 * Includes percentage labels and custom tooltips.
 *
 * @param {Object} props
 * @param {Array} props.data - Region aggregated data
 */
const RegionPieChart = ({ data }) => {
    const hasData = data && data.length > 0;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isKeyboardMode, setIsKeyboardMode] = useState(false);
    const instructionsId = useId();
    const valueId = useId();

    const chartData = useMemo(() => {
        if (!hasData) return [];
        const total = data.reduce((sum, item) => sum + item.totalRevenue, 0);
        return data.map((item) => ({
            name: item.region,
            value: item.totalRevenue,
            units: item.totalUnits,
            total,
        }));
    }, [data, hasData]);

    const formatLegendValue = useCallback((value, entry) => {
        return (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
                {value}: ${entry.payload.value.toLocaleString()}
            </span>
        );
    }, []);

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
                title="No region data"
                message="No data available for the selected filters to display regional distribution."
            />
        );
    }

    const ariaDesc = chartData
        .map((d) => `${d.name}: $${d.value.toLocaleString()} (${((d.value / d.total) * 100).toFixed(1)}%)`)
        .join(', ');

    return (
        <div
            className="chart-container"
            role="group"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label={`Pie chart showing revenue distribution by region: ${ariaDesc}`}
            aria-describedby={`${instructionsId} ${valueId}`}
        >
            <span id={instructionsId} className="sr-only">
                Use left and right arrow keys to move between regions and read values.
            </span>
            <span id={valueId} className="sr-only">
                {activePoint
                    ? `${activePoint.name}: Revenue $${activePoint.value.toLocaleString()}, Share ${((activePoint.value / activePoint.total) * 100).toFixed(1)}%.`
                    : 'No active data point.'}
            </span>
            {activePoint && (
                <div className="custom-tooltip keyboard-tooltip" role="tooltip" aria-live="polite">
                    <p className="tooltip-label">{activePoint.name}</p>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#6366f1' }} aria-hidden="true"></span>
                        <span>Revenue: ${activePoint.value.toLocaleString()}</span>
                    </div>
                    <div className="tooltip-item">
                        <span className="tooltip-dot" style={{ backgroundColor: '#6366f1', opacity: 0.5 }} aria-hidden="true"></span>
                        <span>Share: {((activePoint.value / activePoint.total) * 100).toFixed(1)}%</span>
                    </div>
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="45%"
                        fill="#8884d8"
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        strokeWidth={0}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={formatLegendValue}
                        iconSize={10}
                        iconType="circle"
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(RegionPieChart);
