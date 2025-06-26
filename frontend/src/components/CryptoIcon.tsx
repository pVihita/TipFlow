import React from 'react';

interface CryptoIconProps {
  symbol: 'SOL' | 'ETH' | 'USDC';
  className?: string;
  variant?: string; // For compatibility with web3icons API
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ symbol, className = "w-5 h-5" }) => {
  const getIconConfig = (sym: string) => {
    switch (sym) {
      case 'SOL':
        return { bg: 'bg-purple-500', text: 'S', color: 'text-white' };
      case 'ETH':
        return { bg: 'bg-blue-500', text: 'E', color: 'text-white' };
      case 'USDC':
        return { bg: 'bg-green-500', text: '$', color: 'text-white' };
      default:
        return { bg: 'bg-gray-500', text: '?', color: 'text-white' };
    }
  };

  const config = getIconConfig(symbol);

  return (
    <span 
      className={`${className} ${config.bg} rounded-full flex items-center justify-center ${config.color} text-xs font-bold`}
    >
      {config.text}
    </span>
  );
};

// Export individual components for compatibility
export const TokenSOL: React.FC<{ className?: string; variant?: string }> = ({ className, variant }) => 
  <CryptoIcon symbol="SOL" className={className} variant={variant} />;

export const TokenETH: React.FC<{ className?: string; variant?: string }> = ({ className, variant }) => 
  <CryptoIcon symbol="ETH" className={className} variant={variant} />;

export const TokenUSDC: React.FC<{ className?: string; variant?: string }> = ({ className, variant }) => 
  <CryptoIcon symbol="USDC" className={className} variant={variant} />; 