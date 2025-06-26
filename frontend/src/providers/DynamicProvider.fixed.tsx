import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

interface DynamicProviderProps {
  children: React.ReactNode;
}

export const DynamicProvider: React.FC<DynamicProviderProps> = ({ children }) => {
  // Get environment ID with debugging
  const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  const fallbackId = 'a8eacbdc-5e30-430f-b1ab-70186a62f362';
  
  // Debug logging
  console.log('🔧 Dynamic Environment Debug:');
  console.log('- VITE_DYNAMIC_ENVIRONMENT_ID:', environmentId);
  console.log('- Using environment ID:', environmentId || fallbackId);
  console.log('- Configuration: SOLANA ONLY - No EVM chains');
  
  // Ensure we always have a valid environment ID
  const finalEnvironmentId = environmentId || fallbackId;
  
  console.log('✅ Final environment ID being used:', finalEnvironmentId);
  console.log('🟣 Forcing Solana wallets only - no Polygon/EVM');
  
  if (!finalEnvironmentId) {
    console.error('❌ No Dynamic environment ID found!');
    throw new Error('Dynamic environment ID is required');
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: finalEnvironmentId,
        
        // SOLANA ONLY - No Ethereum connectors
        walletConnectors: [SolanaWalletConnectors],
        
        // Force Solana for embedded wallets created via social login
        initialAuthenticationMode: 'connect-only',
        
        // Override chain settings to force Solana
        overrides: {
          evmNetworks: [], // Disable all EVM networks completely
        },
        
        // Add error handling for SDK issues
        onError: (error: any) => {
          console.error('🔴 Dynamic SDK Error:', error);
          console.error('🔴 Error details:', error?.message || error);
          // Don't crash the app on Dynamic errors
          return false; // Continue execution
        },
        
        // Disable problematic features that might cause struct errors
        walletConnectorExtensions: [],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}; 