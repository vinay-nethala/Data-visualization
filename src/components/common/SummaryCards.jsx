import React from 'react';
import { formatCurrency, formatNumber } from '../../utils/dataTransformers';

/**
 * SummaryCards component renders the 4 KPI metric cards at the top of the dashboard.
 * Each card shows a key metric with an icon and contextual change indicator.
 *
 * @param {Object} props
 * @param {Object} props.summary - Summary statistics { totalRevenue, totalUnits, avgSatisfaction, productCount }
 * @param {boolean} props.isFiltered - Whether data is currently filtered
 */
const SummaryCards = ({ summary, isFiltered }) => {
    const cards = [
        {
            id: 'card-revenue',
            label: 'Total Revenue',
            value: formatCurrency(summary.totalRevenue),
            icon: '💰',
            change: isFiltered ? 'Filtered' : '+12.5%',
            changeType: isFiltered ? 'neutral' : 'positive',
        },
        {
            id: 'card-units',
            label: 'Units Sold',
            value: formatNumber(summary.totalUnits),
            icon: '📦',
            change: isFiltered ? 'Filtered' : '+8.3%',
            changeType: isFiltered ? 'neutral' : 'positive',
        },
        {
            id: 'card-satisfaction',
            label: 'Avg Satisfaction',
            value: `${summary.avgSatisfaction}/5.0`,
            icon: '⭐',
            change: isFiltered ? 'Filtered' : '+0.2',
            changeType: isFiltered ? 'neutral' : 'positive',
        },
        {
            id: 'card-products',
            label: 'Products',
            value: formatNumber(summary.productCount),
            icon: '🏷️',
            change: isFiltered ? 'Filtered' : 'Total Items',
            changeType: isFiltered ? 'neutral' : 'positive',
        },
    ];

    return (
        <section
            className="summary-cards"
            aria-label="Key performance metrics"
            role="region"
        >
            {cards.map((card) => (
                <article
                    key={card.id}
                    id={card.id}
                    className="summary-card"
                    aria-label={`${card.label}: ${card.value}`}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-icon" aria-hidden="true">
                            {card.icon}
                        </span>
                        <span className="summary-card-label">{card.label}</span>
                    </div>
                    <div className="summary-card-value">{card.value}</div>
                    <span className={`summary-card-change ${card.changeType}`}>
                        {card.changeType === 'positive' && '↑ '}
                        {card.changeType === 'negative' && '↓ '}
                        {card.change}
                    </span>
                </article>
            ))}
        </section>
    );
};

export default React.memo(SummaryCards);
