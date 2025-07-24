import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AlphaReward, TradeEvent, User } from './types';
import Modal from './components/Modal';
import PortfolioTable from './components/PortfolioTable';
import PlusIcon from './components/icons/PlusIcon';
import TrashIcon from './components/icons/TrashIcon';
import ShareIcon from './components/icons/ShareIcon';

const USER_STORAGE_KEY = 'portfolio-tracker-users';

// Helper to format currency
const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Input field component
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
        <input
            id={id}
            {...props}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400"
        />
    </div>
);

const App: React.FC = () => {
    // App State
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    // Load initial data from URL or localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        let initialUsers: User[] = [];

        if (data) {
            try {
                // Safely decode from Base64, supporting Unicode characters.
                const decodedUsers = JSON.parse(decodeURIComponent(atob(data))) as User[];
                if (Array.isArray(decodedUsers) && decodedUsers.length > 0) {
                    initialUsers = decodedUsers;
                    // Persist imported data to localStorage
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(decodedUsers));
                }
                // Clean the URL to avoid reloading data on refresh
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error("Failed to load data from URL.", error);
            }
        }
        
        // If no data from URL, try localStorage
        if (initialUsers.length === 0) {
            try {
                const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
                if (storedUsers) {
                    initialUsers = JSON.parse(storedUsers);
                }
            } catch (error) {
                console.error("Failed to parse users from localStorage", error);
            }
        }

        // If still no data, create a default user
        if (initialUsers.length === 0) {
             const defaultUser: User = {
                id: `user${Date.now()}`,
                name: 'My Portfolio',
                alphaRewards: [],
                tradeEvents: [],
            };
            initialUsers = [defaultUser];
        }

        setUsers(initialUsers);
        setActiveUserId(initialUsers.length > 0 ? initialUsers[0].id : null);
        setIsLoading(false);
    }, []);

    // Save users to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
           localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
        }
    }, [users, isLoading]);
    
    // Modal states
    const [isRewardModalOpen, setRewardModalOpen] = useState(false);
    const [isAddTradeModalOpen, setAddTradeModalOpen] = useState(false);
    const [isUpdateTradeModalOpen, setUpdateTradeModalOpen] = useState(false);
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    // Form states
    const [newReward, setNewReward] = useState({ tokenName: '', quantity: '', value: '' });
    const [newTrade, setNewTrade] = useState({ tokenName: '', initialVolume: '', initialFee: '', rewardQuantity: '', value: '' });
    const [dailyEntry, setDailyEntry] = useState({ volume: '', fee: '' });
    const [currentTradeEventId, setCurrentTradeEventId] = useState<string | null>(null);
    const [newUserName, setNewUserName] = useState('');
    const [shareableLink, setShareableLink] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const activeUser = useMemo(() => users.find(u => u.id === activeUserId), [users, activeUserId]);

    const totalValue = useMemo(() => {
        if (!activeUser) return 0;
        const rewardsTotal = activeUser.alphaRewards.reduce((sum, item) => sum + item.value, 0);
        const tradesTotal = activeUser.tradeEvents.reduce((sum, item) => sum + item.value, 0);
        return rewardsTotal + tradesTotal;
    }, [activeUser]);

    const updateUser = useCallback((userId: string, updateFn: (user: User) => User) => {
        setUsers(prevUsers => prevUsers.map(user => user.id === userId ? updateFn(user) : user));
    }, []);

    const handleAddReward = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUserId || !newReward.tokenName || !newReward.quantity || !newReward.value) return;
        
        const newRewardItem: AlphaReward = {
            id: `ar${Date.now()}`,
            tokenName: newReward.tokenName,
            quantity: parseFloat(newReward.quantity),
            value: parseFloat(newReward.value)
        };

        updateUser(activeUserId, user => ({ ...user, alphaRewards: [...user.alphaRewards, newRewardItem] }));
        setNewReward({ tokenName: '', quantity: '', value: '' });
        setRewardModalOpen(false);
    };

    const handleAddTrade = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUserId || !newTrade.tokenName || !newTrade.initialVolume || !newTrade.initialFee || !newTrade.rewardQuantity || !newTrade.value) return;

        const newTradeItem: TradeEvent = {
            id: `te${Date.now()}`,
            tokenName: newTrade.tokenName,
            totalVolume: parseFloat(newTrade.initialVolume),
            totalTradeFee: parseFloat(newTrade.initialFee),
            rewardQuantity: parseFloat(newTrade.rewardQuantity),
            value: parseFloat(newTrade.value)
        };
        
        updateUser(activeUserId, user => ({ ...user, tradeEvents: [...user.tradeEvents, newTradeItem]}));
        setNewTrade({ tokenName: '', initialVolume: '', initialFee: '', rewardQuantity: '', value: '' });
        setAddTradeModalOpen(false);
    };

    const handleOpenUpdateModal = (id: string) => {
        setCurrentTradeEventId(id);
        setDailyEntry({ volume: '', fee: '' });
        setUpdateTradeModalOpen(true);
    };

    const handleUpdateTrade = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUserId || !currentTradeEventId || !dailyEntry.volume || !dailyEntry.fee) return;
        
        updateUser(activeUserId, user => ({
            ...user,
            tradeEvents: user.tradeEvents.map(event => 
                event.id === currentTradeEventId
                    ? {
                        ...event,
                        totalVolume: event.totalVolume + parseFloat(dailyEntry.volume),
                        totalTradeFee: event.totalTradeFee + parseFloat(dailyEntry.fee),
                      }
                    : event
            )
        }));

        setUpdateTradeModalOpen(false);
        setCurrentTradeEventId(null);
    };

    const deleteReward = useCallback((id: string) => {
        if (!activeUserId) return;
        updateUser(activeUserId, user => ({ ...user, alphaRewards: user.alphaRewards.filter(item => item.id !== id) }));
    }, [activeUserId, updateUser]);

    const deleteTrade = useCallback((id: string) => {
        if (!activeUserId) return;
        updateUser(activeUserId, user => ({ ...user, tradeEvents: user.tradeEvents.filter(item => item.id !== id) }));
    }, [activeUserId, updateUser]);

    const handleAddNewUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim()) return;
        const newUser: User = {
            id: `user${Date.now()}`,
            name: newUserName.trim(),
            alphaRewards: [],
            tradeEvents: [],
        };
        setUsers(prev => [...prev, newUser]);
        setActiveUserId(newUser.id);
        setNewUserName('');
        setUserModalOpen(false);
    };

    const handleDeleteCurrentUser = () => {
        if (!activeUserId || !window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${activeUser?.name}" và tất cả dữ liệu của họ không?`)) return;
        
        const remainingUsers = users.filter(user => user.id !== activeUserId);
        setUsers(remainingUsers);
        setActiveUserId(remainingUsers.length > 0 ? remainingUsers[0].id : null);
    };

    const handleGenerateShareLink = () => {
        if (users.length === 0) return;
        // Safely encode to Base64, supporting Unicode characters from user input.
        const encodedData = btoa(encodeURIComponent(JSON.stringify(users)));
        const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        setShareableLink(url);
        setShareModalOpen(true);
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareableLink).then(() => {
            setCopySuccess('Đã chép!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Lỗi');
        });
    };

    const alphaRewardColumns = [
        { key: 'tokenName' as keyof AlphaReward, header: 'Tên Token' },
        { key: 'quantity' as keyof AlphaReward, header: 'Số Lượng Nhận', isNumeric: true },
        { key: 'value' as keyof AlphaReward, header: 'Thành Tiền', isNumeric: true },
    ];
    
    const tradeEventColumns = [
        { key: 'tokenName' as keyof TradeEvent, header: 'Tên Token' },
        { key: 'totalVolume' as keyof TradeEvent, header: 'Tổng Volume', isNumeric: true },
        { key: 'totalTradeFee' as keyof TradeEvent, header: 'Tổng Phí Trade', isNumeric: true },
        { key: 'rewardQuantity' as keyof TradeEvent, header: 'Số Lượng Thưởng', isNumeric: true },
        { key: 'value' as keyof TradeEvent, header: 'Thành Tiền', isNumeric: true },
    ];

    const currentlyUpdatingEvent = useMemo(() => {
        return activeUser?.tradeEvents.find(event => event.id === currentTradeEventId);
    }, [currentTradeEventId, activeUser]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <p className="text-white text-lg animate-pulse">Đang tải ứng dụng...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-white mb-2">Portfolio Tracker</h1>
                    
                    <div className="mt-6 border-t border-gray-700 pt-4">
                        <h2 className="text-lg font-semibold text-white mb-3">Quản lý Portfolio</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <label htmlFor="user-select" className="sr-only">Portfolio hiện tại:</label>
                            <select 
                                id="user-select" 
                                value={activeUserId || ''} 
                                onChange={(e) => setActiveUserId(e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[180px]"
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            <button onClick={() => setUserModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                <PlusIcon className="w-5 h-5" /> Thêm Portfolio
                            </button>
                            {activeUserId && (
                                <>
                                    <button onClick={handleDeleteCurrentUser} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                        <TrashIcon className="w-5 h-5"/> Xóa Portfolio
                                    </button>
                                    <button onClick={handleGenerateShareLink} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                                        <ShareIcon className="w-5 h-5"/> Lưu & Di chuyển
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                   
                    {activeUser && (
                         <div className="mt-6 border-t border-gray-700 pt-4">
                            <p className="text-lg text-gray-400">
                                {`Tổng giá trị của "${activeUser.name}":`}
                            </p>
                            <p className="text-4xl font-extrabold text-green-400 tracking-tight">{formatCurrency(totalValue)}</p>
                        </div>
                    )}
                </header>

                <main className="space-y-8">
                    {!activeUser ? (
                         <div className="text-center py-16 px-6 bg-gray-800 rounded-xl border border-gray-700">
                            <h2 className="text-2xl font-semibold text-white">Chào mừng bạn!</h2>
                            <p className="mt-2 text-gray-400">Vui lòng chọn một portfolio từ menu trên hoặc thêm mới để bắt đầu.</p>
                        </div>
                    ) : (
                    <>
                        <section className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                            <div className="flex justify-between items-center p-4 bg-gray-700/50">
                                <h2 className="text-xl font-semibold text-white">Các giải thưởng Alpha</h2>
                                <button onClick={() => setRewardModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                                    <PlusIcon className="w-5 h-5" /> Thêm mới
                                </button>
                            </div>
                            <PortfolioTable items={activeUser.alphaRewards} columns={alphaRewardColumns} onDeleteItem={deleteReward} emptyStateMessage="Chưa có giải thưởng nào." />
                        </section>

                        <section className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                            <div className="flex justify-between items-center p-4 bg-gray-700/50">
                                <h2 className="text-xl font-semibold text-white">Event Trade</h2>
                                <button onClick={() => setAddTradeModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                                <PlusIcon className="w-5 h-5" /> Thêm mới
                                </button>
                            </div>
                            <PortfolioTable items={activeUser.tradeEvents} columns={tradeEventColumns} onDeleteItem={deleteTrade} onUpdateItem={handleOpenUpdateModal} emptyStateMessage="Chưa có sự kiện trade nào."/>
                        </section>
                    </>
                    )}
                </main>

                {/* Modals */}
                <Modal isOpen={isShareModalOpen} onClose={() => { setShareModalOpen(false); setCopySuccess(''); }} title="Lưu & Di chuyển Dữ liệu">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Sao chép và sử dụng liên kết này để truy cập và chỉnh sửa dữ liệu của bạn trên một thiết bị khác. Liên kết này chứa toàn bộ dữ liệu hiện tại của bạn.</p>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={shareableLink} 
                                readOnly 
                                className="bg-gray-900 border border-gray-600 text-gray-300 text-sm rounded-lg block w-full p-2.5 pr-24"
                                onFocus={(e) => e.target.select()}
                            />
                            <button 
                                onClick={copyToClipboard}
                                className="absolute top-1/2 right-1.5 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-md text-sm w-[80px] text-center"
                            >
                                {copySuccess || 'Sao chép'}
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} title="Thêm Portfolio mới">
                     <form onSubmit={handleAddNewUser} className="space-y-4">
                        <InputField label="Tên Portfolio" id="user-name" type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required autoFocus placeholder="Ví dụ: Airdrop tháng 7"/>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition">Thêm Portfolio</button>
                    </form>
                </Modal>

                <Modal isOpen={isRewardModalOpen} onClose={() => setRewardModalOpen(false)} title="Thêm giải thưởng Alpha">
                    <form onSubmit={handleAddReward} className="space-y-4">
                        <InputField label="Tên Token" id="reward-token" type="text" value={newReward.tokenName} onChange={(e) => setNewReward({ ...newReward, tokenName: e.target.value })} required />
                        <InputField label="Số lượng nhận" id="reward-quantity" type="number" step="any" min="0" value={newReward.quantity} onChange={(e) => setNewReward({ ...newReward, quantity: e.target.value })} required />
                        <InputField label="Thành tiền ($)" id="reward-value" type="number" step="any" min="0" value={newReward.value} onChange={(e) => setNewReward({ ...newReward, value: e.target.value })} required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition">Thêm giải thưởng</button>
                    </form>
                </Modal>
                
                <Modal isOpen={isAddTradeModalOpen} onClose={() => setAddTradeModalOpen(false)} title="Thêm Event Trade Mới">
                    <form onSubmit={handleAddTrade} className="space-y-4">
                        <InputField label="Tên Token" id="trade-token" type="text" value={newTrade.tokenName} onChange={(e) => setNewTrade({ ...newTrade, tokenName: e.target.value })} required />
                        <InputField label="Volume ban đầu ($)" id="trade-initial-volume" type="number" step="any" min="0" value={newTrade.initialVolume} onChange={(e) => setNewTrade({ ...newTrade, initialVolume: e.target.value })} required />
                        <InputField label="Phí Trade ban đầu ($)" id="trade-initial-fee" type="number" step="any" min="0" value={newTrade.initialFee} onChange={(e) => setNewTrade({ ...newTrade, initialFee: e.target.value })} required />
                        <InputField label="Số lượng thưởng" id="trade-reward-qty" type="number" step="any" min="0" value={newTrade.rewardQuantity} onChange={(e) => setNewTrade({ ...newTrade, rewardQuantity: e.target.value })} required />
                        <InputField label="Thành tiền ($)" id="trade-value" type="number" step="any" min="0" value={newTrade.value} onChange={(e) => setNewTrade({ ...newTrade, value: e.target.value })} required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition">Thêm Event</button>
                    </form>
                </Modal>

                <Modal isOpen={isUpdateTradeModalOpen} onClose={() => setUpdateTradeModalOpen(false)} title={`Cập nhật Event: ${currentlyUpdatingEvent?.tokenName || ''}`}>
                    <form onSubmit={handleUpdateTrade} className="space-y-4">
                        <InputField label="Volume hôm nay ($)" id="daily-volume" type="number" step="any" min="0" value={dailyEntry.volume} onChange={(e) => setDailyEntry({ ...dailyEntry, volume: e.target.value })} required autoFocus />
                        <InputField label="Phí trade hôm nay ($)" id="daily-fee" type="number" step="any" min="0" value={dailyEntry.fee} onChange={(e) => setDailyEntry({ ...dailyEntry, fee: e.target.value })} required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition">Cập nhật</button>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default App;