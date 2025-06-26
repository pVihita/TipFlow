import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUserProfile } from '../../hooks/useUserProfile';
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

export const BasicInfoStep: React.FC<StepProps> = ({ 
  profileData, 
  updateProfileData, 
  onNext,
  isEditMode = false
}) => {
  const { checkHandleAvailability, profile } = useUserProfile();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleHandleChange = (value: string) => {
    const cleanHandle = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    updateProfileData({ handle: cleanHandle });
    
    // Clear previous errors
    setErrors(prev => ({ ...prev, handle: '' }));
    
    if (cleanHandle.length >= 3 && cleanHandle !== profile?.handle) {
      checkHandle(cleanHandle);
    } else {
      setIsAvailable(profile?.handle === cleanHandle ? true : null);
    }
  };

  const checkHandle = async (handle: string) => {
    if (handle.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const available = await checkHandleAvailability(handle);
      setIsAvailable(available);
      if (!available) {
        setErrors(prev => ({ ...prev, handle: 'This handle is already taken' }));
      }
    } catch (error) {
      console.error('Error checking handle availability:', error);
      setIsAvailable(false);
      setErrors(prev => ({ ...prev, handle: 'Error checking availability' }));
    } finally {
      setIsChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    } else if (profileData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters';
    } else if (profileData.handle.length > 32) {
      newErrors.handle = 'Handle must be less than 32 characters';
    } else if (!isAvailable && profileData.handle !== profile?.handle) {
      newErrors.handle = 'Handle is not available';
    }

    if (profileData.bio.length > 150) {
      newErrors.bio = 'Bio must be less than 150 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Update display name from first and last names
      const displayName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
      updateProfileData({ displayName });
      onNext();
    }
  };

  // Auto-update display name when first/last names change
  useEffect(() => {
    if (profileData.firstName && profileData.lastName) {
      const displayName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
      updateProfileData({ displayName });
    }
  }, [profileData.firstName, profileData.lastName, updateProfileData]);

  const canContinue = profileData.firstName && 
                     profileData.lastName && 
                     profileData.handle && 
                     profileData.handle.length >= 3 && 
                     (isAvailable || profileData.handle === profile?.handle) &&
                     Object.keys(errors).length === 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          {isEditMode 
            ? "Update your profile information below. Your existing data has been loaded for editing."
            : "Let's start with the basics - your name and unique creator handle"
          }
        </p>
        {isEditMode && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              ✨ <strong>Edit Mode:</strong> All your existing profile data has been loaded. 
              Make any changes you'd like and continue through the steps to save.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Your Display Name</span>
          </h3>
          <p className="text-sm text-gray-600">
            This is how your name will appear to supporters and other users
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => updateProfileData({ firstName: e.target.value })}
                placeholder="John"
                className={`input-field ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                maxLength={50}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => updateProfileData({ lastName: e.target.value })}
                placeholder="Smith"
                className={`input-field ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                maxLength={50}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          {profileData.firstName && profileData.lastName && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700">
                Your display name will be: <span className="font-semibold">{profileData.displayName}</span>
              </p>
            </div>
          )}
        </div>

        {/* Handle Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Creator Handle</h3>
          <p className="text-sm text-gray-600">
            Choose a unique handle for your tip page. This will be part of your FlowTip URL.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
              Your Unique Tip Handle *
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg">@</span>
              </div>
              <input
                type="text"
                id="handle"
                value={profileData.handle}
                onChange={(e) => handleHandleChange(e.target.value)}
                placeholder="your_handle"
                className={`input-field pl-8 pr-12 ${errors.handle ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                maxLength={32}
              />
              
              {/* Status Icon */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
                {!isChecking && isAvailable === true && (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <XMarkIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Status Messages */}
            {profileData.handle.length > 0 && profileData.handle.length < 3 && (
              <p className="text-sm text-gray-500">
                Handle must be at least 3 characters
              </p>
            )}
            {isAvailable === true && profileData.handle !== profile?.handle && (
              <p className="text-sm text-green-600 flex items-center space-x-1">
                <CheckIcon className="h-4 w-4" />
                <span>@{profileData.handle} is available!</span>
              </p>
            )}
            {profileData.handle === profile?.handle && (
              <p className="text-sm text-blue-600 flex items-center space-x-1">
                <CheckIcon className="h-4 w-4" />
                <span>This is your current handle</span>
              </p>
            )}
            {errors.handle && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="h-4 w-4" />
                <span>{errors.handle}</span>
              </p>
            )}
          </div>

          {/* Preview URL */}
          {profileData.handle && profileData.handle.length >= 3 && (isAvailable || profileData.handle === profile?.handle) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Your FlowTip URL:</h4>
              <code className="text-sm font-mono text-blue-600 break-all">
                {window.location.origin}/tip/{profileData.handle}
              </code>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tell supporters about yourself</h3>
          <p className="text-sm text-gray-600">
            Write a short bio to help supporters understand who you are and what you do (optional)
          </p>
          
          <div className="space-y-2">
            <textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => updateProfileData({ bio: e.target.value })}
              placeholder="I'm a creator who loves building amazing experiences..."
              rows={3}
              className={`input-field resize-none ${errors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              maxLength={150}
            />
            <div className="flex justify-between items-center">
              <p className={`text-xs ${profileData.bio.length > 140 ? 'text-orange-600' : 'text-gray-500'}`}>
                {profileData.bio.length}/150 characters
              </p>
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Handle Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 3-32 characters</li>
            <li>• Letters, numbers, and underscores only</li>
            <li>• Must be unique across all users</li>
            <li>• Can be changed anytime after creation</li>
          </ul>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
          >
            Continue to Avatar & Theme
          </button>
        </div>
      </div>
    </div>
  );
}; 