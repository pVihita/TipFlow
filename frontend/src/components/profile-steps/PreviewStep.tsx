import React, { useState } from 'react';
import { 
  SparklesIcon, 
  EyeIcon, 
  ShareIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';
import type { ProfileData } from '../ProfileCreationModal';

interface StepProps {
  profileData: ProfileData;
  updateProfileData: (updates: Partial<ProfileData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isEditMode?: boolean;
}

export const PreviewStep: React.FC<StepProps> = ({ 
  profileData, 
  onComplete,
  isSubmitting
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const getAvatarUrl = () => {
    // Check for temporary base64 data first (fallback upload)
    if (profileData.avatarData) {
      return profileData.avatarData;
    }
    // Check for successful Cloudinary upload
    if (profileData.avatar && !profileData.avatar.startsWith('temp_')) {
      return `https://res.cloudinary.com/dyr7qylh4/image/upload/c_fill,w_400,h_400,q_auto,f_auto/${profileData.avatar}`;
    }
    // Generate a deterministic avatar based on the name
    const initials = profileData.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['3B82F6', '8B5CF6', '10B981', 'F59E0B', 'EC4899', '64748B'];
    const colorIndex = profileData.displayName.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex]}&color=fff&size=400`;
  };

  const copyProfileLink = async () => {
    const profileLink = `${window.location.origin}/tip/${profileData.handle}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileLink);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = profileLink;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.warn('Clipboard operation failed:', err);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const triggerCelebration = () => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Launch from right side  
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const connectedSocialCount = Object.values(profileData.socialLinks).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview & Launch
        </h2>
        <p className="text-gray-600">
          Here's how your FlowTip profile will look to supporters. Ready to go live?
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Profile Summary</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={getAvatarUrl()}
                  alt="Profile avatar"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{profileData.displayName}</h4>
                  <p className="text-gray-600">@{profileData.handle}</p>
                  {profileData.bio && (
                    <p className="text-sm text-gray-500 mt-1">{profileData.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{connectedSocialCount}</div>
                  <div className="text-sm text-gray-600">Social Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profileData.customTipAmounts.length}</div>
                  <div className="text-sm text-gray-600">Tip Options</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h5 className="font-medium text-gray-900 mb-2">Suggested Tip Amounts:</h5>
                <div className="flex space-x-2">
                  {profileData.customTipAmounts.map((amount, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      ${amount}
                    </span>
                  ))}
                </div>
              </div>

              {connectedSocialCount > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h5 className="font-medium text-gray-900 mb-2">Connected Platforms:</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(profileData.socialLinks)
                      .filter(([_, url]) => url)
                      .map(([platform]) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Link */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ShareIcon className="h-5 w-5" />
              <span>Your FlowTip Link</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <code className="text-sm font-mono text-blue-600 break-all">
                  {window.location.origin}/tip/{profileData.handle}
                </code>
              </div>
              
              <button
                onClick={copyProfileLink}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  copySuccess 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Share this link on your social media, website, or anywhere you want to receive tips
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <EyeIcon className="h-5 w-5" />
                <span>Live Preview</span>
              </h3>
            </div>
            
            {/* Tip Page Preview */}
            <div className="p-6">
              <div 
                className="rounded-xl p-8 text-white text-center mb-6"
                style={{ 
                  background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})` 
                }}
              >
                <img
                  src={getAvatarUrl()}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                />
                <h2 className="text-2xl font-bold mb-2">{profileData.displayName}</h2>
                <p className="text-lg opacity-90 mb-1">@{profileData.handle}</p>
                {profileData.bio && (
                  <p className="text-sm opacity-80 max-w-md mx-auto">{profileData.bio}</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  Send a Tip 💝
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {profileData.customTipAmounts.map((amount, index) => (
                    <button
                      key={index}
                      className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-blue-300 transition-colors"
                      style={{ borderColor: `${profileData.theme.accentColor}40` }}
                    >
                      <div className="text-lg font-bold text-gray-900">${amount}</div>
                      <div className="text-xs text-gray-500">USDC</div>
                    </button>
                  ))}
                </div>
                
                <div className="pt-4">
                  <button 
                    className="w-full py-3 rounded-xl font-semibold text-white"
                    style={{ backgroundColor: profileData.theme.primaryColor }}
                  >
                    Send Tip with FlowTip
                  </button>
                </div>

                {connectedSocialCount > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                      Follow @{profileData.handle}
                    </p>
                    <div className="flex justify-center space-x-3">
                      {Object.entries(profileData.socialLinks)
                        .filter(([_, url]) => url)
                        .slice(0, 4)
                        .map(([platform]) => (
                          <div
                            key={platform}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                          >
                            <span className="text-xs">📱</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🎉 You're Almost Ready!</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Profile will be created and stored securely</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Your unique tip link will be activated</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>You can start receiving tips immediately</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>All settings can be updated anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="text-center pt-8 border-t border-gray-200 mt-8">
        <button
          onClick={() => {
            triggerCelebration();
            onComplete();
          }}
          disabled={isSubmitting}
          className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              <span>Creating Your Profile...</span>
            </>
          ) : (
            <>
              <RocketLaunchIcon className="h-6 w-6" />
              <span>🎉 Launch My FlowTip Profile!</span>
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          By launching, you agree to FlowTip's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}; 