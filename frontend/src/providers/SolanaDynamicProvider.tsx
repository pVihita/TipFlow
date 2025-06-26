import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

interface SolanaDynamicProviderProps {
  children: React.ReactNode;
}

export const SolanaDynamicProvider: React.FC<SolanaDynamicProviderProps> = ({ children }) => {
  const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || 'a8eacbdc-5e30-430f-b1ab-70186a62f362';
  
  console.log('🔧 Solana Dynamic Provider Configuration:');
  console.log('- Environment ID:', environmentId);
  console.log('- Chain: Solana Devnet');
  console.log('- Gasless: Enabled');

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        // ONLY Solana wallets to ensure Solana is primary
        walletConnectors: [SolanaWalletConnectors],
        
        // Configure for Solana-first experience
        initialAuthenticationMode: 'connect-only',
        
        // Remove all EVM networks to force Solana
        evmNetworks: [],
        
        // Configure app for Solana tipping
        appName: 'FlowTip',
        appLogoUrl: '/logo.png',
        
        // Enable multi-wallet for embedded + external
        multiWallet: true,
        
        // Configure embedded wallet settings for Solana
        embeddedWalletSettings: {
          createOnSignIn: 'users-without-wallets',
        },
        
        // Network validation
        networkValidationMode: 'allow-all',
        
        // Configure Solana-specific settings
        bridgeChains: [], // No bridge chains needed for pure Solana app
        
        // Debug mode for development
        debugError: true,
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}; 