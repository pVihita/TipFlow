import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';

export const WelcomePageSimple: React.FC = () => {
  const { user } = useDynamicContext();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      {/* Header */}
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '16px 24px', 
        borderRadius: '8px',
        marginBottom: '40px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#2563eb',
            margin: 0
          }}>
            FlowTip
          </h1>
          <DynamicWidget />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '16px'
        }}>
          Tip Creators Without Gas Fees
        </h2>
        
        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          FlowTip showcases the power of Dynamic SDK with gasless USDC micro-tipping. 
          Experience Web2-smooth, Web3-powerful creator support.
        </p>

        {/* CTA */}
        <div style={{ marginBottom: '60px' }}>
          <DynamicWidget 
            variant="modal"
            buttonClassName="btn-primary"
          />
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginTop: '60px'
        }}>
          <div className="card">
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '12px'
            }}>
              ⚡ Gasless Transactions
            </h3>
            <p style={{ color: '#6b7280' }}>
              Send USDC tips without worrying about gas fees. We handle the blockchain complexity.
            </p>
          </div>

          <div className="card">
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '12px'
            }}>
              🔗 Multi-Chain Support
            </h3>
            <p style={{ color: '#6b7280' }}>
              Connect with Solana, Ethereum, or Polygon wallets. Or sign up with email and social.
            </p>
          </div>

          <div className="card">
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '12px'
            }}>
              ✨ Web2 Smooth
            </h3>
            <p style={{ color: '#6b7280' }}>
              Familiar social login experience with powerful Web3 functionality underneath.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div style={{
          marginTop: '60px',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '20px'
          }}>
            🚀 Ready to try Dynamic SDK?
          </h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Click "Connect Wallet" above to authenticate with social login or wallet connection!
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span style={{width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%'}}></span>
              No gas fees
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span style={{width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%'}}></span>
              Multi-chain
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span style={{width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%'}}></span>
              Social login
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}; 