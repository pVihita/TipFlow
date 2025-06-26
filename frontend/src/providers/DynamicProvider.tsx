import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

if (!dynamicEnvironmentId) {
  console.error('❌ VITE_DYNAMIC_ENVIRONMENT_ID is not set in environment variables');
}

export const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvironmentId,
        walletConnectors: [SolanaWalletConnectors],
        initialAuthenticationMode: 'connect-only',
        
        // Solana configuration
        overrides: {
          evmNetworks: [], // Disable EVM completely
        },
        
        // Reduce bundle size and potential conflicts
        walletConnectorExtensions: [],
        
        // Error handling
        onError: (error: any) => {
          console.error('🔴 Dynamic SDK Error:', error);
          // Don't crash the app on Dynamic errors
        },

        // Debug mode (can remove in production)
        debugMode: process.env.NODE_ENV === 'development',
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}; 