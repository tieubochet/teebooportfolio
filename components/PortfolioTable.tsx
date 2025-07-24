import React from 'react';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';

interface PortfolioTableProps<T> {
  items: T[];
  columns: { key: keyof T; header: string; isNumeric?: boolean }[];
  onDeleteItem: (id: string) => void;
  onUpdateItem?: (id: string) => void;
  emptyStateMessage: string;
}

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const PortfolioTable = <T extends { id: string; value?: number }>({ items, columns, onDeleteItem, onUpdateItem, emptyStateMessage }: PortfolioTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} scope="col" className={`px-6 py-3 ${col.isNumeric ? 'text-right' : ''}`}>
                {col.header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8 px-6 text-gray-500">
                {emptyStateMessage}
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                {columns.map((col) => {
                  const cellValue = item[col.key];
                  const key = String(col.key);

                  if (key === 'value' && typeof cellValue === 'number') {
                    const numericValue = cellValue;
                    const colorClass = numericValue >= 0 ? 'text-green-400' : 'text-red-400';
                    
                    return (
                      <td key={key} className={`px-6 py-4 font-mono text-right ${colorClass}`}>
                        {formatCurrency(numericValue)}
                      </td>
                    );
                  }

                  return (
                    <td key={key} className={`px-6 py-4 ${col.isNumeric ? 'text-right font-mono' : 'font-medium text-white'}`}>
                      {typeof cellValue === 'number' ? (key.toLowerCase().includes('fee') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('price') ? formatCurrency(cellValue) : cellValue.toLocaleString('en-US', { maximumFractionDigits: 0 })) : String(cellValue)}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {onUpdateItem && (
                            <button 
                                onClick={() => onUpdateItem(item.id)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-full hover:bg-blue-500/10"
                                aria-label="Update item"
                            >
                                <EditIcon />
                            </button>
                        )}
                        <button 
                            onClick={() => onDeleteItem(item.id)}
                            className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                            aria-label="Delete item"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;