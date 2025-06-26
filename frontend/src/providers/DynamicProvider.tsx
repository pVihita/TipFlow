import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

if (!dynamicEnvironmentId) {
  console.error('❌ VITE_DYNAMIC_ENVIRONMENT_ID is required but not set in environment variables');
  throw new Error('Dynamic Environment ID is required for the application to function');
}

export const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the current origin for CORS configuration
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  console.log('🔧 Dynamic Provider Configuration:');
  console.log('- Environment ID:', dynamicEnvironmentId);
  console.log('- Current Origin:', currentOrigin);
  console.log('- WebContainer detected:', currentOrigin.includes('webcontainer-api.io'));

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
        
        // WebContainer specific configuration
        ...(currentOrigin.includes('webcontainer-api.io') && {
          // Add WebContainer-specific settings to handle CORS
          apiBaseUrl: 'https://app.dynamicauth.com',
          corsMode: 'cors',
          // Allow credentials for cross-origin requests
          credentials: 'include',
        }),
        
        // Reduce bundle size and potential conflicts
        walletConnectorExtensions: [],
        
        // Enhanced error handling for CORS issues
        onError: (error: any) => {
          console.error('🔴 Dynamic SDK Error:', error);
          
          // Specific handling for CORS errors
          if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
            console.error('🚨 CORS Error detected - WebContainer domain may need to be whitelisted');
            console.error('📝 Current domain:', currentOrigin);
            console.error('💡 This domain needs to be added to Dynamic project settings');
          }
          
          // Don't crash the app on Dynamic errors
          return false;
        },

        // Debug mode for development
        debugMode: process.env.NODE_ENV === 'development',
        
        // Additional WebContainer compatibility settings
        ...(currentOrigin.includes('webcontainer-api.io') && {
          // Disable features that might cause CORS issues in WebContainer
          enableVisitTrackingOnConnectOnly: false,
          enableAccountAbstraction: false,
        }),
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};