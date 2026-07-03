import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SummaryCards from '../components/common/SummaryCards';

// ==========================================
// LoadingSpinner Tests
// ==========================================
describe('LoadingSpinner', () => {
    it('should render with default message', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
        render(<LoadingSpinner message="Fetching sales data..." />);
        expect(screen.getByText('Fetching sales data...')).toBeInTheDocument();
    });

    it('should have accessible role="status"', () => {
        render(<LoadingSpinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have screen reader text', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Please wait while the data is being loaded')).toBeInTheDocument();
    });
});

// ==========================================
// ErrorMessage Tests
// ==========================================
describe('ErrorMessage', () => {
    it('should render error state with default message', () => {
        render(<ErrorMessage type="error" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render empty state with default message', () => {
        render(<ErrorMessage type="empty" />);
        expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should render custom title and message', () => {
        render(
            <ErrorMessage
                type="error"
                title="Custom Error"
                message="This is a custom error message"
            />
        );
        expect(screen.getByText('Custom Error')).toBeInTheDocument();
        expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
    });

    it('should display retry button when onRetry is provided', () => {
        const onRetry = vi.fn();
        render(<ErrorMessage type="error" onRetry={onRetry} />);
        const button = screen.getByRole('button', { name: /retry/i });
        expect(button).toBeInTheDocument();
    });

    it('should not display retry button when onRetry is not provided', () => {
        render(<ErrorMessage type="error" />);
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('should have role="alert" for error type', () => {
        render(<ErrorMessage type="error" />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have role="status" for empty type', () => {
        render(<ErrorMessage type="empty" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});

// ==========================================
// SummaryCards Tests
// ==========================================
describe('SummaryCards', () => {
    const mockSummary = {
        totalRevenue: 150000,
        totalUnits: 5000,
        avgSatisfaction: 4.35,
        productCount: 120,
    };

    it('should render all four summary cards', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Units Sold')).toBeInTheDocument();
        expect(screen.getByText('Avg Satisfaction')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('should display formatted revenue', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByText('$150.0K')).toBeInTheDocument();
    });

    it('should display formatted units', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByText('5,000')).toBeInTheDocument();
    });

    it('should display satisfaction rating', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByText('4.35/5.0')).toBeInTheDocument();
    });

    it('should display product count', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('should show "Filtered" labels when filtered', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={true} />);
        const filteredLabels = screen.getAllByText('Filtered');
        expect(filteredLabels.length).toBe(4);
    });

    it('should have accessible region label', () => {
        render(<SummaryCards summary={mockSummary} isFiltered={false} />);
        expect(screen.getByLabelText('Key performance metrics')).toBeInTheDocument();
    });
});
