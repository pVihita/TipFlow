import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../hooks/useUserProfile';
import { tipService } from '../services/tipService';
import { 
  ArrowLeftIcon, 
  GiftIcon, 
  HeartIcon, 
  UserIcon,
  SparklesIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  TrophyIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { TokenUSDC } from '../components/CryptoIcon';
// Blockchain icon replacements (simple text-based)

interface TipSent {
  id: string;
  toHandle: string;
  toDisplayName: string;
  toAvatar?: string;
  amount: number;
  message?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  thankYouMessage?: string;
  impactCategory: string;
}

interface FilterOptions {
  dateRange: 'all' | 'week' | 'month' | 'year';
  amountRange: 'all' | 'small' | 'medium' | 'large';
  searchQuery: string;
}

export const MyTipsPage: React.FC = () => {
  const { profile: currentUser } = useUserProfile();
  const [tipsSent, setTipsSent] = useState<TipSent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    amountRange: 'all',
    searchQuery: ''
  });

  // Mock data for demonstration
  const mockTipsSent: TipSent[] = [
    {
      id: '1',
      toHandle: 'jane_creator',
      toDisplayName: 'Jane Smith',
      toAvatar: '',
      amount: 10,
      message: 'Love your tutorials! Keep up the great work! 🚀',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      status: 'completed',
      thankYouMessage: 'Thank you so much for your support! It means the world to me. Working on an awesome new project thanks to supporters like you! 💖',
      impactCategory: 'Coffee supporter'
    },
    {
      id: '2',
      toHandle: 'dev_mike',
      toDisplayName: 'Mike Developer',
      amount: 25,
      message: 'Thanks for the open source contributions!',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'completed',
      impactCategory: 'Super supporter'
    },
    {
      id: '3',
      toHandle: 'artist_sara',
      toDisplayName: 'Sara Artist',
      amount: 5,
      message: 'Beautiful artwork! 🎨',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: 'completed',
      thankYouMessage: 'Your support helps me create more art! Thank you! 🎨✨',
      impactCategory: 'Snack supporter'
    },
    {
      id: '4',
      toHandle: 'writer_alex',
      toDisplayName: 'Alex Writer',
      amount: 50,
      message: 'Your articles have been incredibly helpful for my career!',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      status: 'completed',
      impactCategory: 'Major support'
    },
    {
      id: '5',
      toHandle: 'coder_jen',
      toDisplayName: 'Jennifer Coder',
      amount: 3,
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      status: 'completed',
      impactCategory: 'Appreciation'
    }
  ];

  // Load tips data
  useEffect(() => {
    const loadTips = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // In real implementation, this would fetch from the blockchain/database
        // const tips = await tipService.getTipsSentByUser(currentUser.id);
        
        // For now, using mock data
        setTipsSent(mockTipsSent);
      } catch (error) {
        console.error('Failed to load tips sent:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTips();
  }, [currentUser]);

  // Filter tips based on selected filters
  const filteredTips = tipsSent.filter(tip => {
    // Date filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      if (now - tip.timestamp.getTime() > ranges[filters.dateRange]) {
        return false;
      }
    }

    // Amount filter
    if (filters.amountRange !== 'all') {
      const ranges = {
        small: [0, 5],
        medium: [5, 20],
        large: [20, Infinity]
      };
      const [min, max] = ranges[filters.amountRange];
      if (tip.amount < min || tip.amount >= max) {
        return false;
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        tip.toHandle.toLowerCase().includes(query) ||
        tip.toDisplayName.toLowerCase().includes(query) ||
        tip.message?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate summary stats
  const totalTipsSent = tipsSent.length;
  const totalAmountSent = tipsSent.reduce((sum, tip) => sum + tip.amount, 0);
  const uniqueCreators = new Set(tipsSent.map(tip => tip.toHandle)).size;
  const thanksReceived = tipsSent.filter(tip => tip.thankYouMessage).length;

  const formatTimeAgo = (timestamp: Date) => {
    const now = Date.now();
    const diff = now - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getImpactEmoji = (category: string) => {
    switch (category) {
      case 'Major support': return '🎉';
      case 'Super supporter': return '🚀';
      case 'Coffee supporter': return '☕';
      case 'Snack supporter': return '🍕';
      case 'Appreciation': return '💝';
      default: return '❤️';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your tip history.</p>
          <DynamicWidget />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <Link to="/" className="text-2xl font-bold text-blue-600">
                FlowTip
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">My Tips Sent</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <DynamicWidget />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Impact Summary Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Tip History
            </h1>
            <p className="text-xl text-gray-600">
              Supporting amazing creators with every tip
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GiftIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{totalTipsSent}</div>
              <div className="text-sm text-gray-600">Tips Sent</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">${totalAmountSent}</div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{uniqueCreators}</div>
              <div className="text-sm text-gray-600">Creators Supported</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{thanksReceived}</div>
              <div className="text-sm text-gray-600">Thank You Messages</div>
            </div>
          </div>

          {/* Impact Statement */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <TrophyIcon className="h-8 w-8 text-amber-500" />
              <h3 className="text-2xl font-bold text-gray-900">Your Creator Impact</h3>
              <SparklesIcon className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-lg text-gray-700 mb-4">
              You've supported <strong className="text-blue-600">{uniqueCreators} creators</strong> with <strong className="text-green-600">${totalAmountSent} in tips</strong>, 
              helping them continue creating amazing content. Your generosity makes a real difference! 🎉
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span>
                <span>Gasless Tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>Direct Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span>Community Builder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Filter & Search</span>
              </h2>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search creators or messages..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date Range Filter */}
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>

                {/* Amount Range Filter */}
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value as any }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Amounts</option>
                  <option value="small">$1 - $5</option>
                  <option value="medium">$5 - $20</option>
                  <option value="large">$20+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tips History */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="text-center py-12">
              <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tipsSent.length === 0 ? 'No tips sent yet' : 'No tips match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {tipsSent.length === 0 
                  ? 'Start supporting creators by sending your first tip!'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
              {tipsSent.length === 0 && (
                <Link to="/tip" className="btn-primary inline-flex items-center space-x-2">
                  <GiftIcon className="h-5 w-5" />
                  <span>Send Your First Tip</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTips.map(tip => (
                <div key={tip.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Creator Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {tip.toAvatar ? (
                        <img src={tip.toAvatar} alt={tip.toDisplayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        tip.toDisplayName.charAt(0)
                      )}
                    </div>

                    {/* Tip Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{tip.toDisplayName}</h3>
                          <p className="text-sm text-gray-600">@{tip.toHandle}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-2xl font-bold text-green-600">${tip.amount}</span>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span>
                              <span className="text-xs">USDC</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{formatTimeAgo(tip.timestamp)}</div>
                        </div>
                      </div>

                      {/* Impact Badge */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg">{getImpactEmoji(tip.impactCategory)}</span>
                        <span className="text-sm font-medium text-gray-700">{tip.impactCategory}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tip.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tip.status === 'completed' ? '✓ Delivered' : 
                           tip.status === 'pending' ? '⏳ Pending' : '❌ Failed'}
                        </div>
                      </div>

                      {/* Message */}
                      {tip.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">"{tip.message}"</p>
                        </div>
                      )}

                      {/* Thank You Message */}
                      {tip.thankYouMessage && (
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <ChatBubbleLeftRightIcon className="h-4 w-4 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">Thank you message:</h4>
                              <p className="text-sm text-gray-700">"{tip.thankYouMessage}"</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-4 mt-4">
                        <Link
                          to={`/tip/${tip.toHandle}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <GiftIcon className="h-4 w-4" />
                          <span>Tip Again</span>
                        </Link>
                        <button className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center space-x-1">
                          <ArrowUpIcon className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!loading && filteredTips.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Keep Supporting Amazing Creators! 
              </h3>
              <p className="text-gray-600 mb-6">
                Your tips make a real difference. Every contribution helps creators continue their passion.
              </p>
              <Link to="/tip" className="btn-primary inline-flex items-center space-x-2">
                <GiftIcon className="h-5 w-5" />
                <span>Send Another Tip</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}; 