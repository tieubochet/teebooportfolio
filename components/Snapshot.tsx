import React from 'react';
import { User, AlphaReward, TradeEvent } from '../types';

interface SnapshotProps {
    user: User;
    totalValue: number;
}

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const Snapshot: React.FC<SnapshotProps> = ({ user, totalValue }) => {
    const alphaRewardColumns = [
        { key: 'tokenName' as keyof AlphaReward, header: 'Tên Token' },
        { key: 'quantity' as keyof AlphaReward, header: 'Số Lượng Nhận', isNumeric: true },
        { key: 'value' as keyof AlphaReward, header: 'Thành Tiền', isNumeric: true },
    ];
    
    const tradeEventColumns = [
        { key: 'tokenName' as keyof TradeEvent, header: 'Tên Token' },
        { key: 'sellPrice' as keyof TradeEvent, header: 'Giá bán', isNumeric: true },
        { key: 'totalTradeFee' as keyof TradeEvent, header: 'Phí Trade', isNumeric: true },
        { key: 'value' as keyof TradeEvent, header: 'Thành Tiền', isNumeric: true },
    ];
    
    const currentDate = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="w-[600px] bg-gray-900 text-gray-100 p-8 border-2 border-purple-500 rounded-lg shadow-2xl" style={{ fontFamily: 'sans-serif' }}>
            <header className="text-center mb-6 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-white">Portfolio Snapshot</h1>
                <p className="text-xl text-gray-400 mt-1">{user.name}</p>
            </header>

            <section className="mb-8 text-center bg-gray-800 p-6 rounded-lg">
                 <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wider">Tổng giá trị Portfolio</h2>
                 <p className="text-5xl font-extrabold text-green-400 mt-2 tracking-tight">{formatCurrency(totalValue)}</p>
            </section>
            
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Các giải thưởng Alpha</h2>
                <div className="overflow-x-auto bg-gray-800 rounded-lg">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-gray-700">
                            <tr>
                                {alphaRewardColumns.map(col => (
                                    <th key={String(col.key)} scope="col" className={`px-6 py-3 ${col.isNumeric ? 'text-right' : ''}`}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {user.alphaRewards.length > 0 ? user.alphaRewards.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 last:border-b-0">
                                    {alphaRewardColumns.map(col => {
                                        const cellValue = item[col.key];
                                        if (col.key === 'value' && typeof cellValue === 'number') {
                                            return (
                                                <td key={String(col.key)} className={`px-6 py-4 text-right font-mono text-green-400`}>
                                                   {formatCurrency(cellValue)}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={String(col.key)} className={`px-6 py-4 ${col.isNumeric ? 'text-right font-mono' : 'font-medium text-white'}`}>
                                                {typeof cellValue === 'number' ? cellValue.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(cellValue)}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )) : (
                                <tr><td colSpan={alphaRewardColumns.length} className="text-center py-4 text-gray-500">Không có dữ liệu.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Event Trade</h2>
                 <div className="overflow-x-auto bg-gray-800 rounded-lg">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-gray-700">
                            <tr>
                                {tradeEventColumns.map(col => (
                                    <th key={String(col.key)} scope="col" className={`px-6 py-3 ${col.isNumeric ? 'text-right' : ''}`}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                             {user.tradeEvents.length > 0 ? user.tradeEvents.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 last:border-b-0">
                                     {tradeEventColumns.map(col => {
                                        const cellValue = item[col.key as keyof TradeEvent];
                                        
                                        if (col.key === 'value' && typeof cellValue === 'number') {
                                            const numericValue = cellValue;
                                            const colorClass = numericValue >= 0 ? 'text-green-400' : 'text-red-400';
                                            
                                            return (
                                                <td key={String(col.key)} className={`px-6 py-4 text-right font-mono ${colorClass}`}>
                                                    {formatCurrency(numericValue)}
                                                </td>
                                            );
                                        }

                                        const isCurrency = col.key === 'sellPrice' || col.key === 'totalTradeFee';
                                        return (
                                            <td key={String(col.key)} className={`px-6 py-4 ${col.isNumeric ? 'text-right font-mono' : 'font-medium text-white'}`}>
                                                {typeof cellValue === 'number' ? (isCurrency ? formatCurrency(cellValue) : cellValue.toLocaleString('en-US', { maximumFractionDigits: 0 })) : String(cellValue)}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )) : (
                                <tr><td colSpan={tradeEventColumns.length} className="text-center py-4 text-gray-500">Không có dữ liệu.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <footer className="text-center mt-8 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">Snapshot được tạo vào ngày {currentDate}</p>
            </footer>
        </div>
    );
};

export default Snapshot;