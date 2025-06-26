import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../hooks/useUserProfile';
import { tipService } from '../services/tipService';
import { 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  BoltIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Animated counter component
const CountUp = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (now >= endTime) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Skeleton loader component
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
    {[1, 2, 3].map((i) => (
      <div key={i} className="text-center animate-pulse">
        <div className="h-12 w-20 bg-gray-300 rounded mx-auto mb-2"></div>
        <div className="h-4 w-24 bg-gray-300 rounded mx-auto"></div>
      </div>
    ))}
  </div>
);

// Feature card with hover animations
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } hover:-translate-y-2`}
    >
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
        <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const WelcomePage: React.FC = () => {
  const { isAuthenticated, authenticationReady, loading: userLoading } = useUserProfile();
  const { setShowAuthFlow, user } = useDynamicContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ totalTips: number; totalVolume: number; activeUsers: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('WelcomePage - user:', user);
    console.log('WelcomePage - isAuthenticated:', isAuthenticated);
    console.log('WelcomePage - authenticationReady:', authenticationReady);
    console.log('WelcomePage - userLoading:', userLoading);
  }, [user, isAuthenticated, authenticationReady, userLoading]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && authenticationReady && !userLoading) {
      console.log('Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, authenticationReady, userLoading, navigate]);

  // Function to trigger Dynamic auth
  const handleGetStarted = () => {
    console.log('Get Started clicked');
    if (setShowAuthFlow) {
      setShowAuthFlow(true);
    } else {
      console.error('setShowAuthFlow not available');
    }
  };

  // Load platform stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const platformStats = await tipService.getPlatformStats();
        setStats(platformStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to demo stats
        setStats({ totalTips: 1247, totalVolume: 12847, activeUsers: 389 });
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Progressive feature disclosure
  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: BoltIcon,
      title: "Gasless Transactions",
      description: "Send tips without worrying about gas fees. Our relayer handles all blockchain costs for seamless micro-payments.",
      delay: 200
    },
    {
      icon: ShieldCheckIcon,
      title: "Multi-Chain Support",
      description: "Native support for Solana and Ethereum networks with seamless cross-chain tipping capabilities.",
      delay: 400
    },
    {
      icon: GlobeAltIcon,
      title: "Social Authentication",
      description: "Login with Google, Twitter, Discord, or any social platform. No seed phrases required.",
      delay: 600
    },
    {
      icon: UserGroupIcon,
      title: "Creator Economy",
      description: "Built for content creators, streamers, and artists to monetize their work with instant tips.",
      delay: 800
    }
  ];

  const benefits = [
    "Zero gas fees for all transactions",
    "Instant USDC settlements", 
    "Cross-platform compatibility",
    "Enterprise-grade security",
    "24/7 global support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FlowTip
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              {isAuthenticated && authenticationReady && (
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              <DynamicWidget />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            {/* Animated gradient text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Web2-Smooth
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-reverse">
                Web3-Powerful
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              The gasless tipping platform that makes crypto payments as simple as sending a text. 
              <span className="text-blue-600 font-semibold"> Zero fees, maximum impact.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-500">
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started Free
                  </button>
                  <Link 
                    to="/tip/demo" 
                    className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
                  >
                    Try Demo
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/dashboard" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    to="/tip" 
                    className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
                  >
                    Send a Tip
                  </Link>
                </div>
              )}
            </div>

            {/* Social Proof Stats */}
            {loadingStats ? (
              <StatsSkeleton />
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up delay-700">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    $<CountUp end={stats.totalVolume} suffix="+" />
                  </div>
                  <div className="text-gray-600 font-medium">Total Tips Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    <CountUp end={stats.totalTips} suffix="+" />
                  </div>
                  <div className="text-gray-600 font-medium">Happy Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    <CountUp end={stats.activeUsers} suffix="+" />
                  </div>
                  <div className="text-gray-600 font-medium">Active Creators</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {showFeatures && (
        <section className="py-24 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose FlowTip?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for the modern creator economy with enterprise-grade security and Web2 simplicity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Everything you need to succeed
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-4 animate-fade-in-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center">
                  <ArrowTrendingUpIcon className="h-16 w-16 text-white mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to start earning?
                  </h3>
                  <p className="text-white/80 mb-6">
                    Join thousands of creators already using FlowTip to monetize their content.
                  </p>
                  {!isAuthenticated ? (
                    <DynamicWidget
                      variant="modal"
                      buttonClassName="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <Link 
                      to="/profile"
                      className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 inline-block"
                    >
                      Setup Creator Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">FlowTip</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The future of creator monetization. Gasless, instant, and built for the Web3 economy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Security</div>
                <div>API Docs</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Status</div>
                <div>Community</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FlowTip. Built with Dynamic SDK.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 