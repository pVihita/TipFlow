import { useState, useCallback, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  WelcomeStep, 
  BasicInfoStep, 
  AvatarThemeStep, 
  SocialLinksStep, 
  PreviewStep 
} from './profile-steps';

export interface ProfileData {
  handle: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar?: string;
  avatarData?: string; // Temporary base64 data for fallback upload
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  customTipAmounts: number[];
  socialLinks: {
    farcaster?: string;
    discord?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
}

const INITIAL_PROFILE_DATA: ProfileData = {
  handle: '',
  displayName: '',
  firstName: '',
  lastName: '',
  bio: '',
  theme: {
    primaryColor: '#3B82F6', // blue-500
    secondaryColor: '#8B5CF6', // purple-500
    accentColor: '#10B981', // emerald-500
  },
  customTipAmounts: [3, 7, 15],
  socialLinks: {},
};

const steps = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep },
  { id: 'avatar-theme', title: 'Avatar & Theme', component: AvatarThemeStep },
  { id: 'social-links', title: 'Social Links', component: SocialLinksStep },
  { id: 'preview', title: 'Preview & Launch', component: PreviewStep },
];

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isEditMode?: boolean; // New prop to indicate if this is editing an existing profile
}

export const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isEditMode = false,
}) => {
  const { user } = useDynamicContext();
  const { profile, updateProfile } = useUserProfile();
  // Start at step 1 (Basic Info) for edit mode, step 0 (Welcome) for new users
  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0);
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    // Initialize with existing profile data if available
    if (profile) {
      return {
        ...INITIAL_PROFILE_DATA,
        handle: profile.handle || '',
        displayName: profile.displayName || '',
        firstName: user?.firstName || profile.displayName?.split(' ')[0] || '',
        lastName: user?.lastName || profile.displayName?.split(' ').slice(1).join(' ') || '',
        bio: profile.bio || '',
        // Include existing theme and other data for editing
        theme: profile.theme || INITIAL_PROFILE_DATA.theme,
        customTipAmounts: profile.customTipAmounts || INITIAL_PROFILE_DATA.customTipAmounts,
        socialLinks: profile.socialLinks || INITIAL_PROFILE_DATA.socialLinks,
        avatar: profile.avatar,
      };
    }
    return INITIAL_PROFILE_DATA;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset step when modal opens/closes or mode changes and reload profile data for editing
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(isEditMode ? 1 : 0);
      
      // Reload profile data when opening in edit mode
      if (isEditMode && profile) {
        setProfileData({
          handle: profile.handle || '',
          displayName: profile.displayName || '',
          firstName: user?.firstName || profile.displayName?.split(' ')[0] || '',
          lastName: user?.lastName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          bio: profile.bio || '',
          // Load existing avatar data
          avatar: profile.avatar,
          avatarData: undefined, // Will be set if we have base64 data
          // Load existing theme
          theme: profile.theme || {
            primaryColor: '#3B82F6',
            secondaryColor: '#8B5CF6', 
            accentColor: '#10B981',
          },
          // Load existing tip amounts
          customTipAmounts: profile.customTipAmounts || [3, 7, 15],
          // Load existing social links
          socialLinks: profile.socialLinks || {},
        });
        
        // If the avatar is a base64 string (stored directly), set it as avatarData
        if (profile.avatar && profile.avatar.startsWith('data:image/')) {
          setProfileData(prev => ({
            ...prev,
            avatarData: profile.avatar,
            avatar: 'existing_avatar'
          }));
        }
      }
    }
  }, [isOpen, isEditMode, profile, user]);

  const updateProfileData = useCallback((updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Prepare profile data, including avatar data for fallback uploads
      const profileUpdate = {
        handle: profileData.handle,
        displayName: profileData.displayName,
        bio: profileData.bio,
        isCreator: true,
        theme: profileData.theme,
        customTipAmounts: profileData.customTipAmounts,
        socialLinks: profileData.socialLinks,
        // Include avatar data for both real uploads and fallback base64
        ...(profileData.avatar && {
          avatar: profileData.avatarData || profileData.avatar // Use base64 data if available, otherwise use avatar ID
        })
      };

      // Update profile in Firestore
      await updateProfile(profileUpdate);

      // TODO: Initialize creator profile on blockchain
      // await initializeCreatorProfile(profileData);

      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  // Calculate progress differently for edit mode (skips welcome step)
  const progress = isEditMode 
    ? (currentStep / (steps.length - 1)) * 100 
    : ((currentStep + 1) / steps.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop - Pure blur effect, no color overlay */}
        <div 
          className="fixed inset-0 backdrop-blur-sm transition-all duration-300"
          onClick={currentStep === 0 ? onClose : undefined}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200/50 ring-1 ring-blue-100/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? `Edit ${steps[currentStep].title}` : steps[currentStep].title}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditMode 
                    ? `Step ${currentStep} of ${steps.length - 1}` 
                    : `Step ${currentStep + 1} of ${steps.length}`
                  }
                </p>
              </div>
            </div>
            
            {(currentStep === 0 || isEditMode) && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
                      <CurrentStepComponent
            profileData={profileData}
            updateProfileData={updateProfileData}
            onNext={nextStep}
            onPrev={prevStep}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            isEditMode={isEditMode}
          />
          </div>

          {/* Navigation Footer */}
          {(currentStep > 0 || (isEditMode && currentStep >= 1)) && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={prevStep}
                disabled={isEditMode && currentStep === 1} // Disable previous if we're at first edit step
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <span>Continue</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>{isEditMode ? 'Saving Changes...' : 'Creating Profile...'}</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      <span>{isEditMode ? 'Save Changes' : 'Launch My Profile'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 