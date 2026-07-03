import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RevenueLineChart from '../components/charts/LineChart';
import CategoryBarChart from '../components/charts/BarChart';
import RegionPieChart from '../components/charts/PieChart';

vi.mock('recharts', async () => {
    const actual = await vi.importActual('recharts');
    return {
        ...actual,
        ResponsiveContainer: ({ children }) => (
            <div style={{ width: 800, height: 400 }}>
                {typeof children === 'function' ? children({ width: 800, height: 400 }) : children}
            </div>
        ),
    };
});

const lineData = [
    { month: 'Jan 2023', totalRevenue: 10000, totalUnits: 50 },
    { month: 'Feb 2023', totalRevenue: 15000, totalUnits: 60 },
];

const barData = [
    { category: 'Electronics', totalRevenue: 20000, totalUnits: 120 },
    { category: 'Books', totalRevenue: 8000, totalUnits: 300 },
];

const pieData = [
    { region: 'North', totalRevenue: 14000, totalUnits: 90 },
    { region: 'South', totalRevenue: 11000, totalUnits: 70 },
];

describe('Chart components', () => {
    it('renders the line chart with keyboard tooltip support', () => {
        render(<RevenueLineChart data={lineData} />);
        const chart = screen.getByRole('group', { name: /line chart/i });
        expect(chart).toHaveAttribute('tabindex', '0');
        fireEvent.focus(chart);
        expect(screen.getByText('Jan 2023')).toBeInTheDocument();
    });

    it('renders the bar chart with keyboard tooltip support', () => {
        render(<CategoryBarChart data={barData} />);
        const chart = screen.getByRole('group', { name: /bar chart/i });
        expect(chart).toHaveAttribute('tabindex', '0');
        fireEvent.focus(chart);
        expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('renders the pie chart with keyboard tooltip support', () => {
        render(<RegionPieChart data={pieData} />);
        const chart = screen.getByRole('group', { name: /pie chart/i });
        expect(chart).toHaveAttribute('tabindex', '0');
        fireEvent.focus(chart);
        expect(screen.getByText('North')).toBeInTheDocument();
    });
});
