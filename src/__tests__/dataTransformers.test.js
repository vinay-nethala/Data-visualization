import { describe, it, expect } from 'vitest';
import {
    filterData,
    aggregateByMonth,
    aggregateByCategory,
    aggregateByRegion,
    calculateSummary,
    formatCurrency,
    formatNumber,
    getUniqueValues,
} from '../utils/dataTransformers';

// --- Sample Test Data ---
const sampleData = [
    { id: '1', date: '2023-01-15', category: 'Electronics', product: 'Laptop', value: 1000, units: 10, region: 'North', satisfaction: 4.5 },
    { id: '2', date: '2023-02-20', category: 'Books', product: 'React Book', value: 50, units: 100, region: 'South', satisfaction: 4.8 },
    { id: '3', date: '2023-03-10', category: 'Electronics', product: 'Mouse', value: 30, units: 200, region: 'East', satisfaction: 4.2 },
    { id: '4', date: '2023-04-05', category: 'Clothing', product: 'Jacket', value: 150, units: 50, region: 'West', satisfaction: 4.0 },
    { id: '5', date: '2023-05-18', category: 'Books', product: 'Python Book', value: 45, units: 80, region: 'North', satisfaction: 4.6 },
    { id: '6', date: '2023-06-22', category: 'Food', product: 'Organic Coffee', value: 25, units: 300, region: 'South', satisfaction: 4.3 },
    { id: '7', date: '2023-01-25', category: 'Electronics', product: 'Keyboard', value: 80, units: 60, region: 'North', satisfaction: 4.1 },
    { id: '8', date: '2023-07-30', category: 'Sports', product: 'Yoga Mat', value: 35, units: 150, region: 'East', satisfaction: 4.4 },
];

// ==========================================
// filterData Tests
// ==========================================
describe('filterData', () => {
    it('should return all data when no filters are applied', () => {
        const result = filterData(sampleData, {});
        expect(result).toHaveLength(8);
    });

    it('should return all data with "all" category filter', () => {
        const result = filterData(sampleData, { category: 'all' });
        expect(result).toHaveLength(8);
    });

    it('should filter by category correctly', () => {
        const result = filterData(sampleData, { category: 'Electronics' });
        expect(result).toHaveLength(3);
        result.forEach((item) => {
            expect(item.category).toBe('Electronics');
        });
    });

    it('should filter by region correctly', () => {
        const result = filterData(sampleData, { region: 'North' });
        expect(result).toHaveLength(3);
        result.forEach((item) => {
            expect(item.region).toBe('North');
        });
    });

    it('should filter by start date correctly', () => {
        const result = filterData(sampleData, { startDate: '2023-04-01' });
        expect(result).toHaveLength(4);
        result.forEach((item) => {
            expect(new Date(item.date) >= new Date('2023-04-01')).toBe(true);
        });
    });

    it('should filter by end date correctly', () => {
        const result = filterData(sampleData, { endDate: '2023-03-31' });
        expect(result).toHaveLength(4);
        result.forEach((item) => {
            expect(new Date(item.date) <= new Date('2023-03-31T23:59:59.999')).toBe(true);
        });
    });

    it('should filter by date range correctly', () => {
        const result = filterData(sampleData, {
            startDate: '2023-02-01',
            endDate: '2023-05-31',
        });
        expect(result).toHaveLength(4);
    });

    it('should combine category and region filters', () => {
        const result = filterData(sampleData, {
            category: 'Electronics',
            region: 'North',
        });
        expect(result).toHaveLength(2);
    });

    it('should combine all filters', () => {
        const result = filterData(sampleData, {
            category: 'Electronics',
            region: 'North',
            startDate: '2023-01-01',
            endDate: '2023-01-31',
        });
        expect(result).toHaveLength(2);
    });

    it('should return empty array when no data matches', () => {
        const result = filterData(sampleData, { category: 'NonExistent' });
        expect(result).toHaveLength(0);
    });

    it('should handle null/undefined data gracefully', () => {
        expect(filterData(null, {})).toEqual([]);
        expect(filterData(undefined, {})).toEqual([]);
    });

    it('should handle empty array', () => {
        const result = filterData([], { category: 'Electronics' });
        expect(result).toEqual([]);
    });

    it('should not mutate the original data', () => {
        const original = [...sampleData];
        filterData(sampleData, { category: 'Books' });
        expect(sampleData).toEqual(original);
    });
});

// ==========================================
// aggregateByMonth Tests
// ==========================================
describe('aggregateByMonth', () => {
    it('should aggregate data by month', () => {
        const result = aggregateByMonth(sampleData);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(12);
    });

    it('should sort results chronologically', () => {
        const result = aggregateByMonth(sampleData);
        for (let i = 1; i < result.length; i++) {
            expect(result[i].sortKey > result[i - 1].sortKey).toBe(true);
        }
    });

    it('should calculate correct totals for a month', () => {
        // January has items 1, 7: Laptop (1000*10=10000) + Keyboard (80*60=4800) = 14800
        const result = aggregateByMonth(sampleData);
        const january = result.find((m) => m.month.includes('Jan'));
        expect(january).toBeDefined();
        expect(january.totalRevenue).toBe(14800);
        expect(january.totalUnits).toBe(70); // 10 + 60
        expect(january.count).toBe(2);
    });

    it('should calculate average satisfaction', () => {
        const result = aggregateByMonth(sampleData);
        result.forEach((monthData) => {
            expect(monthData.avgSatisfaction).toBeGreaterThanOrEqual(1);
            expect(monthData.avgSatisfaction).toBeLessThanOrEqual(5);
        });
    });

    it('should return empty array for empty input', () => {
        expect(aggregateByMonth([])).toEqual([]);
        expect(aggregateByMonth(null)).toEqual([]);
    });
});

// ==========================================
// aggregateByCategory Tests
// ==========================================
describe('aggregateByCategory', () => {
    it('should aggregate data by category', () => {
        const result = aggregateByCategory(sampleData);
        const categories = result.map((r) => r.category);
        expect(categories).toContain('Electronics');
        expect(categories).toContain('Books');
        expect(categories).toContain('Clothing');
        expect(categories).toContain('Food');
        expect(categories).toContain('Sports');
    });

    it('should have 5 unique categories', () => {
        const result = aggregateByCategory(sampleData);
        expect(result).toHaveLength(5);
    });

    it('should sort by revenue descending', () => {
        const result = aggregateByCategory(sampleData);
        for (let i = 1; i < result.length; i++) {
            expect(result[i].totalRevenue).toBeLessThanOrEqual(result[i - 1].totalRevenue);
        }
    });

    it('should calculate correct electronics revenue', () => {
        const result = aggregateByCategory(sampleData);
        const electronics = result.find((c) => c.category === 'Electronics');
        // 1000*10 + 30*200 + 80*60 = 10000 + 6000 + 4800 = 20800
        expect(electronics.totalRevenue).toBe(20800);
        expect(electronics.count).toBe(3);
    });

    it('should return empty array for empty input', () => {
        expect(aggregateByCategory([])).toEqual([]);
    });
});

// ==========================================
// aggregateByRegion Tests
// ==========================================
describe('aggregateByRegion', () => {
    it('should aggregate data by region', () => {
        const result = aggregateByRegion(sampleData);
        const regions = result.map((r) => r.region);
        expect(regions).toContain('North');
        expect(regions).toContain('South');
        expect(regions).toContain('East');
        expect(regions).toContain('West');
    });

    it('should have 4 regions', () => {
        const result = aggregateByRegion(sampleData);
        expect(result).toHaveLength(4);
    });

    it('should sort by revenue descending', () => {
        const result = aggregateByRegion(sampleData);
        for (let i = 1; i < result.length; i++) {
            expect(result[i].totalRevenue).toBeLessThanOrEqual(result[i - 1].totalRevenue);
        }
    });

    it('should return empty array for empty input', () => {
        expect(aggregateByRegion([])).toEqual([]);
    });
});

// ==========================================
// calculateSummary Tests
// ==========================================
describe('calculateSummary', () => {
    it('should calculate correct total revenue', () => {
        const result = calculateSummary(sampleData);
        // 10000 + 5000 + 6000 + 7500 + 3600 + 7500 + 4800 + 5250 = 49650
        const expected = sampleData.reduce((sum, item) => sum + item.value * item.units, 0);
        expect(result.totalRevenue).toBe(expected);
    });

    it('should calculate correct total units', () => {
        const result = calculateSummary(sampleData);
        const expected = sampleData.reduce((sum, item) => sum + item.units, 0);
        expect(result.totalUnits).toBe(expected);
    });

    it('should calculate correct average satisfaction', () => {
        const result = calculateSummary(sampleData);
        const avgSat = sampleData.reduce((sum, item) => sum + item.satisfaction, 0) / sampleData.length;
        expect(result.avgSatisfaction).toBeCloseTo(avgSat, 2);
    });

    it('should count products correctly', () => {
        const result = calculateSummary(sampleData);
        expect(result.productCount).toBe(8);
    });

    it('should return zeroes for empty data', () => {
        const result = calculateSummary([]);
        expect(result.totalRevenue).toBe(0);
        expect(result.totalUnits).toBe(0);
        expect(result.avgSatisfaction).toBe(0);
        expect(result.productCount).toBe(0);
    });

    it('should handle null data', () => {
        const result = calculateSummary(null);
        expect(result.totalRevenue).toBe(0);
        expect(result.productCount).toBe(0);
    });
});

// ==========================================
// formatCurrency Tests
// ==========================================
describe('formatCurrency', () => {
    it('should format millions correctly', () => {
        expect(formatCurrency(1500000)).toBe('$1.5M');
        expect(formatCurrency(2000000)).toBe('$2.0M');
    });

    it('should format thousands correctly', () => {
        expect(formatCurrency(15000)).toBe('$15.0K');
        expect(formatCurrency(1000)).toBe('$1.0K');
    });

    it('should format small numbers correctly', () => {
        expect(formatCurrency(500)).toBe('$500');
        expect(formatCurrency(0)).toBe('$0');
    });
});

// ==========================================
// formatNumber Tests
// ==========================================
describe('formatNumber', () => {
    it('should format with commas', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
        expect(formatNumber(42)).toBe('42');
        expect(formatNumber(0)).toBe('0');
    });
});

// ==========================================
// getUniqueValues Tests
// ==========================================
describe('getUniqueValues', () => {
    it('should extract unique categories', () => {
        const result = getUniqueValues(sampleData, 'category');
        expect(result).toEqual(['Books', 'Clothing', 'Electronics', 'Food', 'Sports']);
    });

    it('should extract unique regions', () => {
        const result = getUniqueValues(sampleData, 'region');
        expect(result).toEqual(['East', 'North', 'South', 'West']);
    });

    it('should return sorted values', () => {
        const result = getUniqueValues(sampleData, 'category');
        const sorted = [...result].sort();
        expect(result).toEqual(sorted);
    });

    it('should return empty array for null data', () => {
        expect(getUniqueValues(null, 'category')).toEqual([]);
        expect(getUniqueValues(undefined, 'category')).toEqual([]);
    });
});
