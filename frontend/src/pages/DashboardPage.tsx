import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDynamicFeatures } from '../hooks/useDynamicFeatures';
import { tipService, type TipTransaction, type TipStats } from '../services/tipService';
import { ProfileCreationModal } from '../components/ProfileCreationModal';
import { TipsAnalyticsChart } from '../components/TipsAnalyticsChart';
import { RealBlockchainNotice } from '../components/RealBlockchainNotice';
import confetti from 'canvas-confetti';
// Social media icons from devicons  
import { SiX, SiDiscord, SiGithub, SiInstagram, SiFarcaster } from 'react-icons/si';
import { TokenSOL, TokenETH, TokenUSDC } from '../components/CryptoIcon';
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  UserIcon,
  GiftIcon,
  SparklesIcon,
  ChevronRightIcon,
  ClockIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ShareIcon,
  WalletIcon,
  HeartIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { CoinbaseFundCard } from '../components/CoinbaseFundCard';

// Loading skeleton for stats
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

// Transaction item component
const TransactionItem = ({ tip }: { tip: TipTransaction }) => {
  const isReceived = tip.toUserId === tip.fromUserId; // This would be fixed with proper user matching
  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isReceived ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {isReceived ? (
            <ArrowDownIcon className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpIcon className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {isReceived ? `From @${tip.fromHandle}` : `To @${tip.toHandle}`}
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{formatDate(tip.createdAt)}</span>
          </div>
          {tip.message && (
            <div className="text-sm text-gray-600 mt-1 italic">"{tip.message}"</div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${
          isReceived ? 'text-green-600' : 'text-gray-900'
        }`}>
          {isReceived ? '+' : '-'}${tip.amount} USDC
        </div>
        <div className="text-xs text-gray-500 capitalize">{tip.status}</div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { handleLogOut, primaryWallet, user } = useDynamicContext();
  const { profile, loading: profileLoading } = useUserProfile();
  

  const { 
    tokenBalances, 
    walletActivities, 
    onRampProviders, 
    socialAccounts,
    loading: dynamicLoading,
    initializeRealOnRamp,
    getExchangeRates,
    checkFundingAvailability,
    connectSocialAccount,
    disconnectSocialAccount,
    fetchTokenBalances,
    isConnected,
    walletAddress,
    walletChain
  } = useDynamicFeatures();
  const [tipStats, setTipStats] = useState<TipStats | null>(null);
  const [recentTips, setRecentTips] = useState<TipTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [activeOnRampProvider, setActiveOnRampProvider] = useState<string | null>(null);

  // Load user tip data
  useEffect(() => {
    const loadTipData = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        const [stats, received, sent] = await Promise.all([
          tipService.getUserTipStats(profile.id),
          tipService.getTipsReceived(profile.id, 5),
          tipService.getTipsSent(profile.id, 5)
        ]);

        setTipStats(stats);
        
        // Combine and sort recent tips
        const allTips = [...received, ...sent].sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date();
          const bTime = b.createdAt?.toDate?.() || new Date();
          return bTime.getTime() - aTime.getTime();
        });
        
        setRecentTips(allTips.slice(0, 10));
      } catch (error) {
        console.error('Failed to load tip data:', error);
        // Fallback to demo data
        setTipStats({
          totalTipsReceived: 0,
          totalTipsSent: 0,
          tipCount: 0,
          averageTip: 0
        });
        setRecentTips([]);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      loadTipData();
    }
  }, [profile]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleProfileModalComplete = () => {
    setShowProfileModal(false);
    // Refresh profile data
    window.location.reload();
  };

  const handleFundWallet = async (amount: number, provider: string, token: string) => {
    console.log('🚀 Opening unified Coinbase Pay modal');
    console.log('Requested:', amount, token);
    
    // Simply open our unified Coinbase Pay modal
    setShowFundingModal(true);
  };

  // Social sharing functions
  const shareOnTwitter = (handle: string) => {
    const creatorLink = `${window.location.origin}/tip/${handle}`;
    const text = `🎉 Support me on FlowTip! Send me tips directly with crypto - fast, easy, and gasless! 💝✨\n\n${creatorLink}\n\n#FlowTip #CryptoTips #Web3`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareOnDiscord = (handle: string) => {
    const creatorLink = `${window.location.origin}/tip/${handle}`;
    const text = `🎉 Hey everyone! You can now support me on FlowTip! Send me tips with crypto - it's super easy and gasless! 💝✨\n\n${creatorLink}`;
    
    // Discord doesn't have a direct share URL, so we copy to clipboard and notify user
    navigator.clipboard.writeText(text).then(() => {
      alert('Discord message copied to clipboard! Paste it wherever you want to share 📋');
    }).catch(() => {
      // Fallback
      prompt('Copy this message and paste it in Discord:', text);
    });
  };

  const generalShare = (handle: string) => {
    const creatorLink = `${window.location.origin}/tip/${handle}`;
    const text = `Support me on FlowTip! ${creatorLink}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Support me on FlowTip!',
        text: 'Send me tips with crypto - fast, easy, and gasless!',
        url: creatorLink,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard! Share it anywhere you like 📋');
      }).catch(() => {
        prompt('Copy this link to share:', creatorLink);
      });
    }
  };



  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FlowTip</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
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
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">FlowTip</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogOut}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
              <DynamicWidget />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Real Blockchain Notice */}
        <RealBlockchainNotice />
        
        {/* Enhanced Header Section */}
        <div className="mb-8">
          {/* Welcome & Quick Stats Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Profile Card */}
            <div 
              className="rounded-xl p-6 text-white"
              style={{ 
                background: profile.theme 
                  ? `linear-gradient(135deg, ${profile.theme.primaryColor}, ${profile.theme.secondaryColor})`
                  : 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
              }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.displayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white border-opacity-30"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                      profile.avatar ? 'hidden' : 'flex'
                    }`}
                    style={{ display: profile.avatar ? 'none' : 'flex' }}
                  >
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                  {profile.isCreator && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-3 w-3 text-yellow-900" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
                  <p className="text-white text-opacity-90 font-medium">@{profile.handle}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <SparklesIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white text-opacity-80">
                      {profile.isCreator ? 'Creator Account' : 'User Account'}
                    </span>
                  </div>
                  {profile.bio && (
                    <p className="text-white text-opacity-85 text-sm mt-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link to="/tip" className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg hover:bg-opacity-100 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 border border-white border-opacity-50 shadow-sm">
                  <PlusIcon className="h-4 w-4" />
                  <span>Send Tip</span>
                </Link>
                {!profile.isCreator && (
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg hover:bg-opacity-100 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 border border-white border-opacity-50 shadow-sm"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Become Creator</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg hover:bg-opacity-100 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 border border-white border-opacity-50 shadow-sm"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Today's Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">$0</div>
                  <div className="text-sm text-gray-600">Tips Received Today</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Total Supporters</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">$0</div>
                <div className="text-sm text-gray-600">This Month</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Goal: $500</div>
              </div>
            </div>
          </div>

          {/* Enhanced Tip Link Management */}
          {profile.isCreator && profile.handle && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 mb-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Tip Link Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <LinkIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Your Creator Link</h3>
                        <p className="text-sm text-gray-600">Share this link to receive tips from supporters</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-xs text-gray-500">Link Clicks</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-blue-600 break-all flex-1 mr-4">
                          {window.location.origin}/tip/{profile.handle}
                        </code>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(window.location.origin + '/tip/' + profile.handle)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              copySuccess 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button 
                            onClick={() => generalShare(profile.handle)}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            <ShareIcon className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Social Sharing Templates */}
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => shareOnTwitter(profile.handle)}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                      >
                        <SiX className="w-5 h-5 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-xs text-gray-600 font-medium">Twitter</div>
                      </button>
                      <button 
                        onClick={() => shareOnDiscord(profile.handle)}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
                      >
                        <SiDiscord className="w-5 h-5 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-xs text-gray-600 font-medium">Discord</div>
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tip/${profile.handle}`).then(() => alert('Instagram share text copied! Paste it in your Instagram bio or story 📋'))}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-400 hover:bg-pink-50 transition-all text-center group"
                      >
                        <SiInstagram className="w-5 h-5 text-pink-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-xs text-gray-600 font-medium">Instagram</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                  <h4 className="font-semibold text-gray-900 mb-4">QR Code</h4>
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-gray-400 text-xs">QR Code</div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Perfect for mobile sharing</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Stats Section */}
        {loading ? (
          <StatsSkeleton />
        ) : tipStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tips Received</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${tipStats.totalTipsReceived.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tipStats.tipCount} transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ArrowDownIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tips Sent</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${tipStats.totalTipsSent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supporting creators
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ArrowUpIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Average Tip</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${tipStats.averageTip.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Per transaction
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Multi-Chain Balance & Asset Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
            <div className="flex items-center space-x-3">
              {isConnected && (
                <div className="text-sm text-gray-500">
                  {walletChain} • {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </div>
              )}
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Assets
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Total Portfolio Value */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-1">
              <div className="text-center">
                {dynamicLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${tokenBalances.reduce((total, token) => total + token.usdValue, 0).toFixed(2)}
                    </div>
                    <div className="text-gray-600 mb-4">Total Portfolio Value</div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">+2.4% (24h)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Per-Chain Token Cards */}
            <div className="lg:col-span-2 space-y-4">
              {dynamicLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-300 rounded mb-1 w-16"></div>
                        <div className="h-3 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : tokenBalances.length > 0 ? (
                tokenBalances.map((token) => (
                  <div key={token.symbol} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className={`p-4 ${
                      token.symbol === 'SOL' ? 'bg-gradient-to-r from-purple-50 to-purple-100' :
                      token.symbol === 'ETH' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                      'bg-gradient-to-r from-green-50 to-green-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                        token.symbol === 'SOL' ? 'bg-purple-600' :
                        token.symbol === 'ETH' ? 'bg-blue-600' :
                        'bg-green-600'
                      }`}>
                                                {token.symbol === 'SOL' ? <TokenSOL className="h-5 w-5" variant="mono" /> :
                         token.symbol === 'ETH' ? <TokenETH className="h-5 w-5" variant="mono" /> :
                         <TokenUSDC className="h-5 w-5" variant="mono" />}
                      </div>
                          <div>
                            <div className="font-semibold text-gray-900">{token.symbol}</div>
                            <div className="text-sm text-gray-600">${token.usdValue.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{token.balance} {token.symbol}</div>
                          <div className="text-sm text-gray-500">${token.usdValue.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                  <p className="text-gray-500">Connect a wallet to view your assets</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tips Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Tips Received (30 days)</h3>
                <div className="text-sm text-gray-500">Total: $0</div>
              </div>
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-2xl mb-2">📊</div>
                  <div>No tip data yet</div>
                </div>
              </div>
            </div>

            {/* Top Supporters */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Top Supporters</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div>Your supporters will appear here</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Display - Only show if user has social links */}
        {profile?.socialLinks && Object.values(profile.socialLinks).filter(Boolean).length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Connected Social Accounts
                  <span className="text-sm text-gray-500 ml-2">
                    ({Object.values(profile.socialLinks).filter(Boolean).length} connected)
                  </span>
                </h2>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage Links
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(profile.socialLinks || {})
                  .filter(([_, url]) => url && url.trim() !== '')
                  .map(([platform, url]) => {
                  const getSocialIcon = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case 'twitter': return SiX;
                      case 'discord': return SiDiscord;
                      case 'github': return SiGithub;
                      case 'instagram': return SiInstagram;
                      case 'farcaster': return SiFarcaster;
                      default: return LinkIcon;
                    }
                  };

                  const getPlatformColor = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case 'twitter': return 'text-blue-600 bg-blue-50 border-blue-200';
                      case 'discord': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
                      case 'github': return 'text-gray-600 bg-gray-50 border-gray-200';
                      case 'instagram': return 'text-pink-600 bg-pink-50 border-pink-200';
                      case 'farcaster': return 'text-purple-600 bg-purple-50 border-purple-200';
                      default: return 'text-gray-600 bg-gray-50 border-gray-200';
                    }
                  };

                  const IconComponent = getSocialIcon(platform);
                  
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${getPlatformColor(platform)}`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent className="w-6 h-6" />
                        <div className="text-sm font-medium capitalize">{platform}</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Social Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(profile.socialLinks || {}).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-gray-600">Connected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">+40%</div>
                    <div className="text-sm text-gray-600">Trust Boost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">✓</div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">🔗</div>
                    <div className="text-sm text-gray-600">Cross Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Links Prompt (when no links exist) */}
        {(!profile?.socialLinks || Object.values(profile.socialLinks || {}).filter(Boolean).length === 0) && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <LinkIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Connect Your Social Accounts</h3>
                    <p className="text-sm text-gray-600">Build trust with supporters by connecting your social profiles</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="btn-primary"
                >
                  Add Social Links
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { icon: SiX, name: 'Twitter', color: 'text-blue-600' },
                  { icon: SiDiscord, name: 'Discord', color: 'text-indigo-600' },
                  { icon: SiGithub, name: 'GitHub', color: 'text-gray-600' },
                  { icon: SiInstagram, name: 'Instagram', color: 'text-pink-600' },
                  { icon: SiFarcaster, name: 'Farcaster', color: 'text-purple-600' },
                ].map(({ icon: Icon, name, color }) => (
                  <div key={name} className="p-4 bg-white rounded-lg border border-gray-200 opacity-50">
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className={`w-6 h-6 ${color}`} />
                      <div className="text-sm font-medium text-gray-500">{name}</div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Connected profiles receive <strong className="text-green-600">40% more tips</strong> and build trust with supporters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips Analytics Chart */}
        <TipsAnalyticsChart className="mb-8" />

        {/* Enhanced Wallet Activity Log */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Wallet Activity</h2>
              <div className="flex items-center space-x-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Download CSV
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              {['All', 'Tips Received', 'Tips Sent', 'Other'].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === 'All' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Rich Transaction Cards */}
            <div className="space-y-4">
              {/* Demo Transaction Cards */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowDownIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Tip Received</div>
                    <div className="text-sm text-gray-600">From @supporter_123</div>
                    <div className="text-xs text-gray-500 italic">"Great content! Keep it up! 🎉"</div>
                    <div className="text-xs text-gray-500 mt-1">2 hours ago • Solana</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">+$5.00</div>
                  <div className="text-xs text-gray-500">USDC</div>
                  <div className="text-xs text-green-600">Confirmed</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowUpIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Tip Sent</div>
                    <div className="text-sm text-gray-600">To @creator_456</div>
                    <div className="text-xs text-gray-500 italic">"Thanks for the amazing tutorial!"</div>
                    <div className="text-xs text-gray-500 mt-1">1 day ago • Ethereum</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">-$3.00</div>
                  <div className="text-xs text-gray-500">USDC</div>
                  <div className="text-xs text-blue-600">Confirmed</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Fiat On-Ramp</div>
                    <div className="text-sm text-gray-600">Added funds to wallet</div>
                    <div className="text-xs text-gray-500 mt-1">3 days ago • Bank Transfer</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">+$50.00</div>
                  <div className="text-xs text-gray-500">USDC</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>

            {/* Empty State for New Users */}
            <div className="text-center py-8 hidden">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-4">
                Your wallet activity will appear here once you start using FlowTip.
              </p>
              <Link to="/tip" className="btn-primary inline-flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Send Your First Tip</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Fiat On-Ramp */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Funds</h3>
                  <p className="text-sm text-gray-600">Buy crypto with your bank account or card</p>
                  {!isConnected && (
                    <p className="text-xs text-amber-600 mt-1">Connect a wallet to enable on-ramp</p>
                  )}
                </div>
              </div>
              <button 
                className={`btn-primary ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isConnected}
                onClick={() => {
                  if (isConnected) {
                    setShowFundingModal(true);
                  }
                }}
              >
                Add Funds
              </button>
            </div>
            
            {/* Amount Suggestions */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Suggested amounts for tipping:</p>
              <div className="grid grid-cols-4 gap-3">
                {[20, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    className={`p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isConnected}
                    onClick={() => {
                      if (isConnected) {
                        // Open our unified Coinbase Pay modal instead
                        setShowFundingModal(true);
                      }
                    }}
                  >
                    <div className="font-semibold text-gray-900">${amount}</div>
                    <div className="text-xs text-gray-500">~{Math.floor(amount/5)} tips</div>
                  </button>
                ))}
              </div>

              {/* On-Ramp Providers - DISABLED to avoid conflicts with Coinbase Pay */}
              {/* 
              {isConnected && onRampProviders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Available Providers:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {onRampProviders.map((provider) => (
                      <div
                        key={provider.name}
                        className={`p-3 bg-white rounded-lg border transition-colors cursor-pointer ${
                          activeOnRampProvider === provider.name
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        onClick={() => setActiveOnRampProvider(provider.name)}
                      >
                        <div className="text-center">
                          <div className="font-medium text-gray-900 text-sm">{provider.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{provider.fees}</div>
                          <div className="text-xs text-emerald-600 mt-1">
                            ${provider.minAmount} - ${provider.maxAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              */}

              {/* Active On-Ramp Session - DISABLED */}
              {/* 
              {activeOnRampProvider && (
                <div className="mt-4 p-4 bg-emerald-100 rounded-lg border border-emerald-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-emerald-900">
                        On-ramp active via {activeOnRampProvider}
                      </div>
                      <div className="text-sm text-emerald-700">
                        Complete your purchase in the popup window
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveOnRampProvider(null)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              */}

              {/* Add unified funding message */}
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Use Coinbase Pay</div>
                      <div className="text-sm text-blue-700">
                        Click "Add Funds" above to buy USDC/SOL with your credit card
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wallet Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wallet Management</h3>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Secured by Dynamic</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Real Balance Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TokenSOL variant="mono" className="w-6 h-6" />
                    <span className="text-sm font-medium text-gray-600">SOL</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {dynamicLoading ? '...' : '0.00'}
                  </div>
                  <div className="text-xs text-gray-500">For transaction fees</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TokenUSDC variant="mono" className="w-6 h-6" />
                    <span className="text-sm font-medium text-gray-600">USDC</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {dynamicLoading ? '...' : '0.00'}
                  </div>
                  <div className="text-xs text-gray-500">For sending tips</div>
                </div>
              </div>
            </div>

            {/* REAL Devnet Funding Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://faucet.solana.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
              >
                <TokenSOL variant="mono" className="w-5 h-5" />
                <span>Get FREE SOL 🪂</span>
              </a>
              
              <a 
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-medium"
              >
                <TokenUSDC variant="mono" className="w-5 h-5" />
                <span>Get USDC 💰</span>
              </a>
            </div>

            {/* Real Transaction Notice */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">✅ Real Blockchain Integration Active!</h4>
                  <p className="text-sm text-green-700 mb-2">
                    FlowTip is now using <strong>real Solana devnet transactions</strong>. All tips are actual USDC transfers on the blockchain.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-green-600">
                    <span>🔗 Network: Solana Devnet</span>
                    <span>💰 Currency: Real USDC</span>
                    <span>⚡ Gasless: Via Relayer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={`loading-${i}`} className="flex items-center justify-between p-4 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentTips.length > 0 ? (
              <div className="space-y-2">
                {recentTips.map((tip, index) => (
                  <TransactionItem key={`transaction-${tip.id}-${index}-${tip.createdAt?.toDate?.().getTime() || Date.now()}`} tip={tip} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-4">
                  Start by sending your first tip or {profile.isCreator ? 'sharing your creator profile' : 'becoming a creator'}.
                </p>
                <div className="space-x-3">
                  <Link to="/tip" className="btn-primary inline-flex items-center space-x-2">
                    <PlusIcon className="h-4 w-4" />
                    <span>Send Your First Tip</span>
                  </Link>
                  {!profile.isCreator && (
                    <button 
                      onClick={() => setShowProfileModal(true)}
                      className="btn-secondary inline-flex items-center space-x-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Become Creator</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="space-y-4">
              {/* Creator Link Card - First item for creators */}
              {profile.isCreator && profile.handle && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <LinkIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Creator Link</h3>
                        <p className="text-sm text-gray-600">Share this link to receive tips from supporters</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(window.location.origin + '/tip/' + profile.handle)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        copySuccess 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-blue-600 break-all flex-1 mr-4">
                        {window.location.origin}/tip/{profile.handle}
                      </code>
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <CheckIcon className="h-3 w-3" />
                        <span className="whitespace-nowrap">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Sharing Templates */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Share Your Link</h4>
                      <Link 
                        to="/profile" 
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit Handle
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {/* Twitter/X Share */}
                      <button
                        onClick={() => shareOnTwitter(profile.handle)}
                        className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <SiX className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Twitter</span>
                      </button>

                      {/* Discord Share */}
                      <button
                        onClick={() => shareOnDiscord(profile.handle)}
                        className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                      >
                        <SiDiscord className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Discord</span>
                      </button>

                      {/* General Share */}
                      <button
                        onClick={() => generalShare(profile.handle)}
                        className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                      >
                        <ShareIcon className="w-5 h-5 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Share</span>
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500">
                        💡 <strong className="text-blue-600">Pro tip:</strong> Add your tip link to your bio, stream overlays, and content!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Link 
                to="/tip" 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                    <GiftIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Send a Tip</h3>
                    <p className="text-sm text-gray-500">Support your favorite creators</p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link 
                to="/my-tips" 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200">
                    <HeartIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">My Tips Sent</h3>
                    <p className="text-sm text-gray-500">View your tip history & impact</p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
              </Link>

              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">
                      {profile.isCreator ? 'Edit Profile' : 'Become a Creator'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile.isCreator ? 'Update your creator information' : 'Set up your creator profile'}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
              </button>

              {/* Add Money Card - Coinbase Pay Only */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <PlusIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Buy Crypto with Coinbase</h3>
                    <p className="text-sm text-gray-600">Get USDC and SOL instantly</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available tokens:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <TokenUSDC className="h-4 w-4" />
                        <span className="text-xs">USDC</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TokenSOL className="h-4 w-4" />
                        <span className="text-xs">SOL</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowFundingModal(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CreditCardIcon className="h-5 w-5" />
                    <span>Buy with Coinbase Pay</span>
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Secure payment with credit card, debit card, or bank transfer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Creation Modal - True Overlay Modal */}
      <ProfileCreationModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={handleProfileModalComplete}
        isEditMode={profile?.isCreator || false} // Edit mode if user already has a creator profile
      />

      {/* Wallet Funding Modal */}
      <CoinbaseFundCard
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
      />
    </div>
  );
}; 