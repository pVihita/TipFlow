import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../hooks/useUserProfile';
import { userService, type UserProfile } from '../services/userService';
import { tipService } from '../services/tipService';
import confetti from 'canvas-confetti';
import { 
  ArrowLeftIcon, 
  GiftIcon, 
  CheckIcon, 
  ExclamationTriangleIcon, 
  UserIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HeartIcon,
  UsersIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { SiX, SiDiscord, SiGithub, SiInstagram, SiFarcaster } from 'react-icons/si';
import { TokenSOL, TokenETH, TokenUSDC } from '../components/CryptoIcon';

interface TipImpact {
  emoji: string;
  text: string;
  description: string;
}

const getTipImpact = (amount: number): TipImpact => {
  if (amount >= 50) return { emoji: '🎉', text: "You're funding their next big project!", description: 'Major support' };
  if (amount >= 20) return { emoji: '🚀', text: "You're boosting their creativity!", description: 'Super supporter' };
  if (amount >= 10) return { emoji: '☕', text: "You're buying them a premium coffee!", description: 'Coffee supporter' };
  if (amount >= 5) return { emoji: '🍕', text: "You're getting them a snack!", description: 'Snack supporter' };
  if (amount >= 1) return { emoji: '💝', text: "You're showing appreciation!", description: 'Appreciation' };
  return { emoji: '❤️', text: "Every bit helps!", description: 'Support' };
};

export const TippingPage: React.FC = () => {
  const { profile: currentUser } = useUserProfile();
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { setShowAuthFlow } = useDynamicContext();
  
  const [creator, setCreator] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [recentTips, setRecentTips] = useState<Array<{amount: number, message?: string, timestamp: Date}>>([]);
  const [supporterCount, setSupporterCount] = useState<number>(127);
  const [totalRaised, setTotalRaised] = useState<number>(2847);
  const [searchHandle, setSearchHandle] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Mock recent supporters (privacy-safe)
  const recentSupporters = [
    { avatar: '🎨', amount: 5, timeAgo: '2 min' },
    { avatar: '🚀', amount: 10, timeAgo: '5 min' },
    { avatar: '💎', amount: 20, timeAgo: '8 min' },
    { avatar: '🎯', amount: 3, timeAgo: '12 min' },
    { avatar: '🌟', amount: 15, timeAgo: '18 min' },
  ];

  // Creator's custom amounts (could come from their profile)
  const creatorAmounts = creator?.customTipAmounts || ['3', '5', '10', '25'];
  const currentAmount = customAmount || amount;
  const tipImpact = currentAmount ? getTipImpact(parseFloat(currentAmount)) : null;

  // Fetch creator data
  useEffect(() => {
    const fetchCreator = async () => {
      if (!handle) {
        // No handle provided - show search interface instead of error
        setIsLoading(false);
        return;
      }

      try {
        const user = await userService.getUserByHandle(handle);
        if (!user) {
          setError(`Creator @${handle} not found`);
        } else if (!user.isCreator) {
          setError(`@${handle} is not set up as a creator yet`);
        } else {
          setCreator(user);
          // Simulate loading recent tips for this creator
          setRecentTips([
            { amount: 5, message: 'Love your content!', timestamp: new Date(Date.now() - 120000) },
            { amount: 10, timestamp: new Date(Date.now() - 300000) },
            { amount: 20, message: 'Keep up the great work! 🚀', timestamp: new Date(Date.now() - 480000) },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch creator:', err);
        setError('Failed to load creator profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreator();
  }, [handle]);

  // Real-time tip simulation
  useEffect(() => {
    if (!creator) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const amounts = [1, 3, 5, 10, 20];
        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        
        setRecentTips(prev => [{
          amount: randomAmount,
          timestamp: new Date(),
        }, ...prev.slice(0, 4)]);
        
        setSupporterCount(prev => prev + 1);
        setTotalRaised(prev => prev + randomAmount);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [creator]);

  const triggerSuccessCelebration = () => {
    // Multi-burst confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const sendTip = async () => {
    if (!currentUser) {
      setShowAuthFlow(true);
      return;
    }

    if (!creator || !currentAmount) return;
    
    const tipAmount = parseFloat(currentAmount);
    
    setIsSending(true);
    setError('');

    try {
      console.log('🚀 SENDING REAL USDC TIP using Dynamic SDK');
      
      // Import and use REAL blockchain service
      const { useBlockchain } = await import('../services/blockchainService');
      
      // Get blockchain interface
      const blockchain = useBlockchain();
      
      // Check if wallet is connected
      if (!blockchain.isConnected) {
        setError('Please connect your wallet first');
        setIsSending(false);
        return;
      }

      // Get user's REAL blockchain profile
      const profile = await blockchain.getProfile();
      if (!profile) {
        setError('Failed to load wallet profile. Please try again.');
        setIsSending(false);
        return;
      }

      console.log('💰 REAL wallet profile loaded:');
      console.log('- SOL balance:', profile.solBalance);
      console.log('- USDC balance:', profile.usdcBalance);

      // Check REAL USDC balance
      if (profile.usdcBalance < tipAmount) {
        setError(`Insufficient USDC balance. You have ${profile.usdcBalance.toFixed(2)} USDC but need ${tipAmount.toFixed(2)} USDC`);
        setShowInsufficientFunds(true);
        setIsSending(false);
        return;
      }

      console.log('✅ REAL balance check passed');
      console.log(`💸 Sending ${tipAmount} USDC to creator wallet`);

      // Create tip record in database FIRST
      const tipId = await tipService.createTip({
        fromUserId: currentUser.id,
        toUserId: creator.id,
        fromHandle: currentUser.handle,
        toHandle: creator.handle,
        amount: tipAmount,
        message: message.trim() || undefined,
      });

      console.log('📝 Database record created, initiating REAL blockchain transaction...');
      
      // Get creator's wallet address from their profile
      const creatorWalletAddress = creator.walletAddress;
      if (!creatorWalletAddress) {
        throw new Error('Creator wallet address not found. They need to complete their profile setup.');
      }

      // Send REAL gasless USDC transaction via Dynamic SDK
      const transaction = await blockchain.sendTip(creatorWalletAddress, tipAmount);
      
      if (transaction) {
        console.log('🎉 REAL GASLESS USDC TIP SUCCESSFUL!');
        console.log('Transaction signature:', transaction.signature);
        console.log('Gasless:', transaction.gasless);
        
        // Update tip with REAL transaction signature
        await tipService.updateTipStatus(tipId, 'completed', transaction.signature);
        
        // Update local state
        setSupporterCount(prev => prev + 1);
        setTotalRaised(prev => prev + tipAmount);
        
        setSuccess(true);
        triggerSuccessCelebration();
        
        console.log('✅ REAL USDC tip completed successfully!');
        console.log('💸 This was a REAL blockchain transaction on Solana devnet!');
        console.log('🚀 Transaction was gasless - no fees paid by user!');
      } else {
        throw new Error('Transaction failed to process');
      }
      
    } catch (err) {
      console.error('❌ REAL blockchain transaction failed:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tip. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('Insufficient USDC balance')) {
        setShowInsufficientFunds(true);
      } else if (errorMessage.includes('wallet address not found')) {
        setError('Creator wallet not configured. Please contact them to complete setup.');
      } else if (errorMessage.includes('not connected')) {
        setError('Wallet not connected. Please connect your wallet and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSending(false);
    }
  };

  const shareSuccess = () => {
    const text = `I just tipped @${creator?.handle} on FlowTip! 🎉 Support amazing creators with gasless USDC tips.`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'FlowTip', text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Share text copied to clipboard!');
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return SiX;
      case 'discord': return SiDiscord;
      case 'github': return SiGithub;
      case 'instagram': return SiInstagram;
      case 'farcaster': return SiFarcaster;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  // Search for creator function
  const searchForCreator = async () => {
    if (!searchHandle || searchHandle.length < 2) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const user = await userService.getUserByHandle(searchHandle);
      if (!user) {
        setError(`Creator @${searchHandle} not found. Make sure they have a FlowTip account.`);
      } else if (!user.isCreator) {
        setError(`@${searchHandle} is not set up as a creator yet.`);
      } else {
        // Redirect to the creator's tip page
        navigate(`/tip/${searchHandle}`);
      }
    } catch (err) {
      console.error('Failed to search creator:', err);
      setError('Failed to search for creator. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Show creator search interface if no handle provided
  if (!handle && !creator) {
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
                <span className="text-gray-600">Send Tip</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <DynamicWidget />
              </div>
            </div>
          </div>
        </header>

        {/* Search Interface */}
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <GiftIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Send a Tip
            </h1>
            <p className="text-xl text-gray-600">
              Support creators with gasless USDC tips
            </p>
          </div>

          <div className="card">
            <div className="space-y-6">
              <div className="space-y-4">
                <label htmlFor="creator-search" className="block text-sm font-medium text-gray-700">
                  Find Creator
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">@</span>
                  </div>
                  <input
                    type="text"
                    id="creator-search"
                    value={searchHandle}
                    onChange={(e) => setSearchHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && searchForCreator()}
                    placeholder="creator_handle"
                    className="input-field pl-8"
                    maxLength={32}
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  Enter the creator's handle to find their tip page
                </p>
              </div>

              <button
                onClick={searchForCreator}
                disabled={!searchHandle || searchHandle.length < 2 || isSearching}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5" />
                    <span>Find Creator</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popular Creators */}
          <div className="mt-12 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Creators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { handle: 'jane_creator', name: 'Jane Smith', bio: 'Tech tutorials & coding tips' },
                { handle: 'dev_mike', name: 'Mike Developer', bio: 'Open source contributor' },
                { handle: 'artist_sara', name: 'Sara Artist', bio: 'Digital art & illustrations' },
                { handle: 'writer_alex', name: 'Alex Writer', bio: 'Tech articles & career advice' }
              ].map((creator) => (
                <Link
                  key={creator.handle}
                  to={`/tip/${creator.handle}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {creator.name}
                      </div>
                      <div className="text-sm text-gray-600">@{creator.handle}</div>
                      <div className="text-xs text-gray-500">{creator.bio}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || (!creator && handle)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Creator Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/tip" className="btn-primary">
            Search for Creator
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="card max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tip Sent Successfully! 🎉
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Your ${currentAmount} USDC tip to @{creator?.handle}
          </p>
          <p className="text-gray-500 mb-8">
            ⚡ Processed gaslessly • No fees • Instant delivery
          </p>
          
          <div className="space-y-4">
            <button
              onClick={shareSuccess}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Share Your Support</span>
            </button>
            
            <div className="flex space-x-3">
              <Link to="/dashboard" className="flex-1 btn-secondary">
                Dashboard
              </Link>
              <Link to={`/tip/${creator?.handle}`} className="flex-1 btn-primary">
                Tip Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Insufficient funds modal
  if (showInsufficientFunds) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CurrencyDollarIcon className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Insufficient USDC Balance
          </h2>
          <p className="text-gray-600 mb-6">
            You need ${(parseFloat(currentAmount) - 50).toFixed(2)} more USDC to complete this tip.
          </p>
          
          <div className="space-y-4">
            <button className="w-full btn-primary">
              Add Funds (${currentAmount} pre-filled)
            </button>
            <button 
              onClick={() => {
                setAmount('5');
                setCustomAmount('');
                setShowInsufficientFunds(false);
              }}
              className="w-full btn-secondary"
            >
              Tip $5 Instead
            </button>
            <button 
              onClick={() => setShowInsufficientFunds(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const creatorTheme = creator?.theme || { primaryColor: '#3B82F6', secondaryColor: '#8B5CF6' };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${creatorTheme.primaryColor}15, ${creatorTheme.secondaryColor}15, #ffffff)` 
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <Link to="/" className="text-2xl font-bold text-blue-600">
                FlowTip
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                <span>Gasless & Secure</span>
              </div>
              <DynamicWidget />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {/* Creator Avatar & Info */}
            <div className="flex flex-col items-center mb-8">
              <div 
                className="w-32 h-32 rounded-full mb-6 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${creatorTheme.primaryColor}, ${creatorTheme.secondaryColor})` 
                }}
              >
                {creator.avatar ? (
                  <img 
                    src={creator.avatar} 
                    alt={creator.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  creator.displayName.charAt(0).toUpperCase()
                )}
                {creator.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {creator.displayName}
                {creator.isVerified && <span className="text-blue-500 ml-2">✓</span>}
              </h1>
              <p className="text-xl text-gray-600 mb-2">@{creator.handle}</p>
              {creator.bio && (
                <p className="text-lg text-gray-700 max-w-2xl leading-relaxed mb-6">
                  {creator.bio}
                </p>
              )}

              {/* Social Links */}
              {creator.socialLinks && Object.keys(creator.socialLinks).length > 0 && (
                <div className="flex items-center space-x-4 mb-8">
                  {Object.entries(creator.socialLinks)
                    .filter(([_, url]) => url)
                    .map(([platform, url]) => {
                      const IconComponent = getSocialIcon(platform);
                      if (!IconComponent) return null;
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-md hover:shadow-lg transition-all"
                        >
                          <IconComponent className="w-5 h-5" />
                        </a>
                      );
                    })}
                </div>
              )}

              {/* Social Proof */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{supporterCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Supporters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${totalRaised.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>

              {/* Recent Supporters */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Recent supporters:</span>
                <div className="flex -space-x-2">
                  {recentSupporters.slice(0, 5).map((supporter, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                      title={`Tipped $${supporter.amount} ${supporter.timeAgo} ago`}
                    >
                      {supporter.avatar}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">+{supporterCount - 5} more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tipping Interface */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Support {creator.displayName.split(' ')[0]}
              </h2>
              <p className="text-gray-600">
                Send a tip to show your appreciation • Zero gas fees
              </p>
            </div>

            <div className="space-y-8">
              {/* Amount Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Choose Amount (USDC)
                </label>
                
                {/* Creator's Custom Amounts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {creatorAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => {
                        setAmount(presetAmount);
                        setCustomAmount('');
                      }}
                      className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all transform hover:scale-105 ${
                        amount === presetAmount && !customAmount
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl">${presetAmount}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getTipImpact(parseFloat(presetAmount)).description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount('');
                    }}
                    placeholder="Other amount..."
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-lg"
                  />
                </div>

                {/* Tip Impact */}
                {tipImpact && (
                  <div 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 animate-pulse"
                    style={{ animationDuration: '2s' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{tipImpact.emoji}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{tipImpact.text}</div>
                        <div className="text-sm text-gray-600">Impact: {tipImpact.description}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="space-y-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Send a Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hey ${creator.displayName.split(' ')[0]}, love your work! Keep it up! 🚀`}
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none"
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{200 - message.length} characters remaining</span>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <HeartIcon className="h-4 w-4" />
                    <StarIcon className="h-4 w-4" />
                    <FireIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Gamification */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="h-6 w-6 text-amber-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Be supporter #{supporterCount + 1}!</div>
                      <div className="text-sm text-gray-600">Join the community of supporters</div>
                    </div>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>

              {/* Enhanced CTA Section */}
              <div className="space-y-4">
                <button
                  onClick={sendTip}
                  disabled={!currentAmount || parseFloat(currentAmount) <= 0 || isSending}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 focus:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 ${
                    currentAmount && parseFloat(currentAmount) > 0
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <GiftIcon className="h-6 w-6" />
                      <span>Send ${currentAmount || '0'} Tip Now</span>
                      <SparklesIcon className="h-6 w-6" />
                    </>
                  )}
                </button>

                {/* Security Badges */}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TokenSOL className="h-5 w-5" variant="mono" />
                    <span>Gasless</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TokenUSDC className="h-5 w-5" variant="mono" />
                    <span>USDC</span>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500">
                  Powered by Dynamic SDK • Your funds go directly to the creator
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Features */}
          <div className="mt-8 space-y-6">
            {/* Recent Tips Ticker */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FireIcon className="h-5 w-5 text-orange-500" />
                  <span>Recent Support</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentTips.slice(0, 3).map((tip, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        💝
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Anonymous supporter</div>
                        {tip.message && (
                          <div className="text-sm text-gray-600 italic">"{tip.message}"</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${tip.amount}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((Date.now() - tip.timestamp.getTime()) / 60000)}m ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-blue-500" />
                <span>Community Goal</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Help reach 1,000 supporters!</span>
                  <span className="text-sm font-semibold text-gray-900">{supporterCount}/1000</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(supporterCount / 1000) * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">
                  🎉 <strong>{1000 - supporterCount} more supporters</strong> needed to unlock exclusive content!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 