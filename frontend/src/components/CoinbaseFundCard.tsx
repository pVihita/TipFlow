import React, { useEffect, useState, useRef } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { initOnRamp } from '@coinbase/cbpay-js';
import type { CBPayInstanceType } from '@coinbase/cbpay-js';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CoinbaseFundCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinbaseFundCard: React.FC<CoinbaseFundCardProps> = ({ isOpen, onClose }) => {
  const { primaryWallet } = useDynamicContext();
  const [onrampInstance, setOnrampInstance] = useState<CBPayInstanceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !primaryWallet?.address) return;

    setIsLoading(true);

    // Initialize Coinbase Pay widget with session token
    const initializeWidget = async () => {
      try {
        console.log('🔵 Getting session token for Coinbase Pay...');
        
        // Get session token from our relayer
        const relayerUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : `https://${window.location.hostname}`;
          
        const tokenResponse = await fetch(`${relayerUrl}/api/create-coinbase-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: primaryWallet.address
          })
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          throw new Error(`Session token failed: ${error.error}`);
        }

        const { sessionToken } = await tokenResponse.json();
        console.log('✅ Session token received');

        // Generate Coinbase Pay URL with session token
        const coinbaseParams = new URLSearchParams({
          sessionToken: sessionToken,
          // Additional customization parameters
          defaultAsset: 'USDC',
          defaultNetwork: 'solana', 
          defaultPaymentMethod: 'CARD',
          presetFiatAmount: '50',
          fiatCurrency: 'USD'
        });

        const coinbaseUrl = `https://pay.coinbase.com/buy?${coinbaseParams.toString()}`;
        
        console.log('🚀 Opening Coinbase Pay with session token');
        
        // Open Coinbase Pay in new tab
        const newTab = window.open(coinbaseUrl, '_blank');
        
        if (!newTab) {
          throw new Error('Popup blocked! Please allow popups for this site.');
        }

        // Mark as initialized
        setOnrampInstance({ open: () => {}, destroy: () => {} } as any);
        setIsLoading(false);

        // Monitor for completion (simplified)
        const checkInterval = setInterval(() => {
          if (newTab.closed) {
            clearInterval(checkInterval);
            console.log('✅ Coinbase Pay tab closed');
            setTimeout(() => onClose(), 1000); // Close our modal after short delay
          }
        }, 1000);

        // Auto-cleanup after 10 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!newTab.closed) {
            newTab.close();
          }
        }, 600000);

      } catch (error) {
        console.error('❌ Error initializing Coinbase Pay:', error);
        setIsLoading(false);
        
        // Show error message
        alert(`Coinbase Pay Setup Issue:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nFor testing, please use the free devnet faucets below.`);
      }
    };

    initializeWidget();

    // Cleanup when modal closes
    return () => {
      if (onrampInstance) {
        setOnrampInstance(null);
      }
    };
  }, [isOpen, primaryWallet?.address, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200/50 ring-1 ring-blue-100/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Buy Crypto with Coinbase Pay
              </h2>
              <p className="text-sm text-gray-500">
                Official Coinbase widget - customize your purchase
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {primaryWallet?.address ? (
              <div className="space-y-6">
                {/* Wallet Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="font-medium text-blue-900">Your Solana Wallet</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(primaryWallet.address);
                        // Quick visual feedback
                        const btn = document.activeElement as HTMLElement;
                        const original = btn.textContent;
                        btn.textContent = '✅ Copied!';
                        setTimeout(() => {
                          btn.textContent = original;
                        }, 2000);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📋 Copy Address
                    </button>
                  </div>
                  <code className="text-sm font-mono text-blue-800 break-all block p-2 bg-white rounded border">
                    {primaryWallet.address}
                  </code>
                </div>

                {/* Widget Container */}
                <div className="min-h-[500px]">
                  {isLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading Coinbase Pay...</span>
                    </div>
                  )}
                  
                  {/* Widget will render here automatically when initialized */}
                  <div ref={widgetContainerRef} className="w-full">
                    {!isLoading && !onrampInstance && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                        <h3 className="font-medium text-amber-900 mb-2">⚠️ Coinbase Pay Setup Required</h3>
                        <p className="text-amber-800 text-sm mb-4">
                          Coinbase Pay requires production configuration with API keys and sessionToken setup.
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">🔧 For Production Setup:</h4>
                          <ol className="text-sm text-gray-700 text-left space-y-1">
                            <li>1. Create Coinbase Developer Project</li>
                            <li>2. Get production API keys</li>
                            <li>3. Set up secure sessionToken generation (Required after 7/31/2025)</li>
                            <li>4. Configure webhook endpoints</li>
                            <li>5. Deploy to production domain (localhost not supported)</li>
                          </ol>
                        </div>
                        <p className="text-xs text-amber-700">
                          For now, use the free devnet tokens below for testing FlowTip functionality.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Testing Options */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">🎯 For Testing FlowTip:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <a 
                      href="https://faucet.solana.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white border border-green-200 rounded-lg hover:border-green-400 transition-colors"
                    >
                      <div className="text-2xl mr-3">🚰</div>
                      <div>
                        <div className="font-medium text-gray-900">Free SOL</div>
                        <div className="text-xs text-gray-600">For gas fees (1-2 SOL)</div>
                      </div>
                    </a>
                    <a 
                      href="https://faucet.circle.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white border border-green-200 rounded-lg hover:border-green-400 transition-colors"
                    >
                      <div className="text-2xl mr-3">💰</div>
                      <div>
                        <div className="font-medium text-gray-900">Free USDC</div>
                        <div className="text-xs text-gray-600">For testing tips (up to 100)</div>
                      </div>
                    </a>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Quick Setup:</strong> Copy your wallet address above, visit the faucets, and request tokens.
                    </p>
                    <p className="text-xs text-green-700">
                      ✅ These are REAL blockchain transactions on Solana devnet with zero real-world value.
                    </p>
                  </div>
                </div>

                {/* Future Coinbase Pay Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🚀 When Coinbase Pay is enabled:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Choose between USDC (for tips) or SOL (for gas fees)</li>
                    <li>• Set custom purchase amounts ($10-$10,000)</li>
                    <li>• Pay with credit card, debit card, or bank transfer</li>
                    <li>• Instant delivery to your Solana wallet</li>
                    <li>• No need to manually copy/paste addresses</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="font-medium text-yellow-900 mb-2">Wallet Required</h3>
                  <p className="text-yellow-800 text-sm">
                    Please connect your wallet first to add funds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 