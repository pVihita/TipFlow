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
  const isWebContainer = currentOrigin.includes('webcontainer-api.io');
  
  console.log('🔧 Dynamic Provider Configuration:');
  console.log('- Environment ID:', dynamicEnvironmentId);
  console.log('- Current Origin:', currentOrigin);
  console.log('- WebContainer detected:', isWebContainer);
  
  if (isWebContainer) {
    console.log('🚨 WEBCONTAINER CORS SETUP REQUIRED:');
    console.log('📝 Add this domain to Dynamic project settings:');
    console.log(`   ${currentOrigin}`);
    console.log('🔗 Go to: https://app.dynamic.xyz/dashboard/developer');
    console.log('⚙️  Navigate to: Settings → Domains → Add Domain');
    console.log('✅ Add the domain above to fix CORS errors');
  }

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
        
        // Enhanced error handling for CORS issues
        onError: (error: any) => {
          console.error('🔴 Dynamic SDK Error:', error);
          
          // Specific handling for CORS errors
          if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
            console.error('🚨 CORS Error detected!');
            console.error('📝 Current domain that needs whitelisting:', currentOrigin);
            console.error('🔗 Add this domain to Dynamic project settings:');
            console.error('   https://app.dynamic.xyz/dashboard/developer');
            console.error('⚙️  Settings → Domains → Add Domain');
            console.error(`✅ Add: ${currentOrigin}`);
            
            // Show user-friendly error
            if (typeof window !== 'undefined') {
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee2e2;
                border: 2px solid #fca5a5;
                color: #991b1b;
                padding: 16px;
                border-radius: 8px;
                max-width: 400px;
                z-index: 10000;
                font-family: monospace;
                font-size: 12px;
                line-height: 1.4;
              `;
              errorDiv.innerHTML = `
                <strong>🚨 CORS Error - Domain Not Whitelisted</strong><br><br>
                <strong>Current domain:</strong><br>
                <code>${currentOrigin}</code><br><br>
                <strong>Action needed:</strong><br>
                1. Go to Dynamic Dashboard<br>
                2. Settings → Domains<br>
                3. Add the domain above<br><br>
                <button onclick="this.parentElement.remove()" style="background: #991b1b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Close</button>
              `;
              document.body.appendChild(errorDiv);
              
              // Auto-remove after 30 seconds
              setTimeout(() => {
                if (errorDiv.parentElement) {
                  errorDiv.remove();
                }
              }, 30000);
            }
          }
          
          // Don't crash the app on Dynamic errors
          return false;
        },

        // Debug mode for development
        debugMode: process.env.NODE_ENV === 'development',
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};