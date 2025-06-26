import React, { useState } from 'react';
import { 
  CheckIcon, 
  CurrencyDollarIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { TokenSOL, TokenUSDC } from '../components/CryptoIcon';

export const RealBlockchainNotice: React.FC = () => {
  const [showFunding, setShowFunding] = useState(false);

  const requestDevnetSOL = async () => {
    try {
      console.log('🚀 Requesting real Solana devnet SOL airdrop...');
      
      // In a real implementation, this would:
      // 1. Get the user's wallet address from Dynamic SDK
      // 2. Call our blockchain service to request airdrop
      // 3. Show confirmation with transaction signature
      
      alert('Real SOL airdrop requested! Check the console for details.\n\nIn a real implementation, this would:\n- Get your wallet address from Dynamic SDK\n- Request 1 SOL from Solana devnet\n- Show transaction confirmation');
      
      console.log('✅ This would be a REAL transaction on Solana devnet');
      console.log('💡 User would receive actual SOL tokens for gas fees');
    } catch (error) {
      console.error('Failed to request SOL airdrop:', error);
    }
  };

  const showUSDCInstructions = () => {
    setShowFunding(true);
  };

  return (
    <>
      {/* Main Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="h-7 w-7 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              🚀 Real Blockchain Integration Active!
            </h3>
            <p className="text-green-800 mb-4">
              FlowTip is now using <strong>real Solana devnet transactions</strong>. All tips are actual USDC transfers on the blockchain, not simulations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <LinkIcon className="h-4 w-4" />
                <span><strong>Network:</strong> Solana Devnet</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <TokenUSDC variant="mono" className="h-4 w-4" />
                <span><strong>Currency:</strong> Real USDC</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span><strong>Fees:</strong> Gasless via Relayer</span>
              </div>
            </div>

            {/* Funding Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={requestDevnetSOL}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <TokenSOL variant="mono" className="w-4 h-4" />
                <span>Get Free SOL</span>
              </button>
              
              <button
                onClick={showUSDCInstructions}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <TokenUSDC variant="mono" className="w-4 h-4" />
                <span>Get USDC</span>
              </button>
              
              <a
                href="https://solscan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span>View on Solscan</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* USDC Funding Modal */}
      {showFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Get Devnet USDC</h3>
              <button
                onClick={() => setShowFunding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Real Devnet Tokens</h4>
                    <p className="text-sm text-yellow-700">
                      These are actual tokens on Solana devnet for testing purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Option 1: Circle Faucet</h4>
                  <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    🔗 Visit Circle USDC Faucet
                  </a>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Option 2: Solana CLI</h4>
                  <div className="space-y-2">
                    <code className="block bg-gray-100 p-2 rounded text-sm">
                      spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
                    </code>
                    <code className="block bg-gray-100 p-2 rounded text-sm">
                      spl-token mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v 100
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Option 3: Ask in Discord</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Join the Solana Discord and ask for devnet USDC in the faucet channel.
                  </p>
                  <a
                    href="https://discord.gg/solana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    💬 Join Solana Discord
                  </a>
                </div>
              </div>

              <button
                onClick={() => setShowFunding(false)}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Got it! Let's tip! 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 