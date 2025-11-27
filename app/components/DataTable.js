'use client';

import { useState } from 'react';

export default function DataTable({ columns, data, onRowClick }) {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📊</div>
                <p className="text-gray-500 font-medium">No data available</p>
                <p className="text-gray-400 text-sm mt-1">Data will appear here when available</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                onClick={() => column.sortable !== false && handleSort(column.key)}
                                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    {column.label}
                                    {column.sortable !== false && sortColumn === column.key && (
                                        <span className="text-emerald-600">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`${onRowClick ? 'cursor-pointer hover:bg-emerald-50/50' : ''} transition-colors`}
                        >
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
