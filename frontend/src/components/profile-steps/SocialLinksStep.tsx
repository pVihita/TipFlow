import React from 'react';
import { LinkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { ProfileData } from '../ProfileCreationModal';
// Social media icons from devicons
import { 
  SiX, // Twitter/X icon
  SiFarcaster, 
  SiDiscord, 
  SiGithub, 
  SiInstagram 
} from 'react-icons/si';

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

interface SocialPlatform {
  name: string;
  key: keyof ProfileData['socialLinks'];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  placeholder: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Twitter',
    key: 'twitter',
    icon: SiX,
    color: 'blue',
    description: 'Connect your Twitter/X account',
    placeholder: 'https://twitter.com/yourusername'
  },
  {
    name: 'Discord',
    key: 'discord',
    icon: SiDiscord,
    color: 'indigo',
    description: 'Link your Discord server or profile',
    placeholder: 'https://discord.gg/yourserver'
  },
  {
    name: 'GitHub',
    key: 'github',
    icon: SiGithub,
    color: 'gray',
    description: 'Show your GitHub profile',
    placeholder: 'https://github.com/yourusername'
  },
  {
    name: 'Instagram',
    key: 'instagram',
    icon: SiInstagram,
    color: 'pink',
    description: 'Link your Instagram account',
    placeholder: 'https://instagram.com/yourusername'
  },
  {
    name: 'Farcaster',
    key: 'farcaster',
    icon: SiFarcaster,
    color: 'purple',
    description: 'Connect your Farcaster profile',
    placeholder: 'https://warpcast.com/yourusername'
  },
];

export const SocialLinksStep: React.FC<StepProps> = ({ 
  profileData, 
  updateProfileData, 
  onNext 
}) => {

  const updateSocialLink = (platform: keyof ProfileData['socialLinks'], value: string) => {
    updateProfileData({
      socialLinks: {
        ...profileData.socialLinks,
        [platform]: value
      }
    });
  };

  const removeSocialLink = (platform: keyof ProfileData['socialLinks']) => {
    const newSocialLinks = { ...profileData.socialLinks };
    delete newSocialLinks[platform];
    updateProfileData({ socialLinks: newSocialLinks });
  };



  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      gray: 'border-gray-200 bg-gray-50 text-gray-700',
      pink: 'border-pink-200 bg-pink-50 text-pink-700',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const totalConnections = Object.values(profileData.socialLinks).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Social Links
        </h2>
        <p className="text-gray-600">
          Connect your social accounts to build trust and showcase your online presence
        </p>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Social Connections</h3>
                <p className="text-sm text-gray-600">
                  {totalConnections} of {SOCIAL_PLATFORMS.length} platforms connected
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{totalConnections}</div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalConnections / SOCIAL_PLATFORMS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Social Platforms */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Connect Your Platforms</h3>
          <p className="text-sm text-gray-600">
            Add links to your social profiles. These will be displayed on your tip page to help supporters verify your identity.
          </p>
          
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isConnected = !!profileData.socialLinks[platform.key];
              const currentValue = profileData.socialLinks[platform.key] || '';
              
              return (
                <div
                  key={platform.key}
                  className={`border rounded-lg p-4 transition-all ${
                    isConnected 
                      ? getColorClasses(platform.color)
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <platform.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    
                    {isConnected && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                  </div>
                  
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="url"
                          value={currentValue}
                          onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                          placeholder={platform.placeholder}
                          className="flex-1 input-field text-sm"
                        />
                        <button
                          onClick={() => removeSocialLink(platform.key)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateSocialLink(platform.key, platform.placeholder)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add {platform.name} Link</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">Why connect social accounts?</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Build Trust</div>
                <div>Show supporters you're a real creator</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Increase Tips</div>
                <div>Connected profiles receive 40% more support</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Cross-Platform</div>
                <div>Drive traffic between your platforms</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Verification</div>
                <div>Get verified creator status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts Preview */}
        {totalConnections > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Connected Accounts Preview</h4>
            <div className="space-y-2">
              {Object.entries(profileData.socialLinks)
                .filter(([_, url]) => url)
                .map(([platform, url]) => {
                  const platformData = SOCIAL_PLATFORMS.find(p => p.key === platform);
                  return (
                    <div key={platform} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {platformData?.icon && <platformData.icon className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{platform}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">{url}</div>
                        </div>
                      </div>
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Skip Option */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">
            Social connections are optional, but recommended for building trust with supporters.
          </p>
          <button
            onClick={onNext}
            className="btn-primary px-8 py-3"
          >
            {totalConnections > 0 ? 'Continue to Preview' : 'Skip for Now'}
          </button>
        </div>
      </div>
    </div>
  );
}; 