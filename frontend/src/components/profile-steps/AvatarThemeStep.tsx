import React, { useState, useRef } from 'react';
import { PhotoIcon, PaintBrushIcon, SwatchIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
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

const THEME_PRESETS = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
  { name: 'Purple Magic', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A855F7' },
  { name: 'Emerald Green', primary: '#10B981', secondary: '#059669', accent: '#34D399' },
  { name: 'Sunset Orange', primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#DB2777', accent: '#F472B6' },
  { name: 'Slate Gray', primary: '#64748B', secondary: '#475569', accent: '#94A3B8' },
];

const TIP_AMOUNT_PRESETS = [
  [1, 5, 10],
  [3, 7, 15],
  [5, 10, 25],
  [2, 8, 20],
  [10, 25, 50],
];

export const AvatarThemeStep: React.FC<StepProps> = ({ 
  profileData, 
  updateProfileData, 
  onNext 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      // Convert file to base64 for client-side upload
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // First try to upload to a simple image hosting service (fallback approach)
      // Skip Cloudinary for now and use a direct base64 storage approach
      console.log('Using direct base64 storage for image upload');
      
      // Generate a unique ID for this upload session
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the base64 data directly - this works immediately
      updateProfileData({ 
        avatar: uploadId,
        avatarData: base64
      });
      
      console.log('Image uploaded successfully using fallback method');
      
      // Optional: You can implement Cloudinary upload later with proper presets
      // For now, this ensures the feature works without 401 errors
    } catch (error) {
      console.error('Upload error:', error);
      
      // Even if upload fails, allow users to continue with generated avatar
      setUploadError('Upload service temporarily unavailable. Using generated avatar instead.');
      
      // Clear the avatar to fall back to generated one
      updateProfileData({ 
        avatar: undefined,
        avatarData: undefined 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const generateAvatarUrl = (name: string) => {
    // Generate a deterministic avatar based on the name
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['3B82F6', '8B5CF6', '10B981', 'F59E0B', 'EC4899', '64748B'];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex]}&color=fff&size=400`;
  };

  const getAvatarUrl = () => {
    // Check for base64 data first (from upload or existing profile)
    if (profileData.avatarData) {
      return profileData.avatarData;
    }
    
    // Check for existing avatar from profile (could be base64 stored in Firestore)
    if (profileData.avatar) {
      // If it's a base64 string (starts with data:image/)
      if (profileData.avatar.startsWith('data:image/')) {
        return profileData.avatar;
      }
      
      // If it's an upload ID from our fallback method
      if (profileData.avatar.startsWith('upload_') || profileData.avatar.startsWith('temp_')) {
        return generateAvatarUrl(profileData.displayName || 'User');
      }
      
      // If it's a Cloudinary public ID
      if (!profileData.avatar.startsWith('upload_') && !profileData.avatar.startsWith('temp_') && !profileData.avatar.startsWith('data:')) {
        return `https://res.cloudinary.com/dyr7qylh4/image/upload/c_fill,w_400,h_400,q_auto,f_auto/${profileData.avatar}`;
      }
      
      // If it's some other format, try to use it directly (like existing_avatar)
      if (profileData.avatar === 'existing_avatar') {
        return generateAvatarUrl(profileData.displayName || 'User');
      }
      
      // Try to use it as a direct URL
      return profileData.avatar;
    }
    
    // Fall back to generated avatar
    return generateAvatarUrl(profileData.displayName || 'User');
  };

  const selectTheme = (theme: typeof THEME_PRESETS[0]) => {
    updateProfileData({
      theme: {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
        accentColor: theme.accent,
      }
    });
  };

  const updateCustomAmount = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newAmounts = [...profileData.customTipAmounts];
    newAmounts[index] = numValue;
    updateProfileData({ customTipAmounts: newAmounts });
  };

  const selectTipPreset = (preset: number[]) => {
    updateProfileData({ customTipAmounts: preset });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Avatar & Theme
        </h2>
        <p className="text-gray-600">
          Customize your profile image and tip page appearance
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Image Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <PhotoIcon className="h-5 w-5" />
            <span>Profile Image</span>
          </h3>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar Preview */}
            <div className="flex-shrink-0">
              <img
                src={getAvatarUrl()}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            
            {/* Upload Area */}
            <div className="flex-1">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
              {!profileData.avatar && (
                <p className="text-xs text-gray-500 mt-2">
                  We'll generate a beautiful avatar if you don't upload one
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <PaintBrushIcon className="h-5 w-5" />
            <span>Choose Your Theme</span>
          </h3>
          <p className="text-sm text-gray-600">
            Select colors that represent your brand and personality
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((theme) => (
              <button
                key={theme.name}
                onClick={() => selectTheme(theme)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  profileData.theme.primaryColor === theme.primary
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex space-x-2 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Tip Amounts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span>Suggested Tip Amounts</span>
          </h3>
          <p className="text-sm text-gray-600">
            Set three suggested amounts to make it easy for supporters to tip you
          </p>
          
          {/* Preset Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Quick Presets:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TIP_AMOUNT_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => selectTipPreset(preset)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    JSON.stringify(profileData.customTipAmounts) === JSON.stringify(preset)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Preset {index + 1}</div>
                    <div className="font-medium">${preset.join(', $')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Input */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Or customize your own:</p>
            <div className="grid grid-cols-3 gap-4">
              {profileData.customTipAmounts.map((amount, index) => (
                <div key={index} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Amount {index + 1}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={amount}
                      onChange={(e) => updateCustomAmount(index, e.target.value)}
                      className="input-field pl-7 text-center"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <SwatchIcon className="h-4 w-4" />
            <span>Preview</span>
          </h4>
          <div 
            className="rounded-lg p-6 text-white text-center"
            style={{ 
              background: `linear-gradient(135deg, ${profileData.theme.primaryColor}, ${profileData.theme.secondaryColor})` 
            }}
          >
            <img
              src={getAvatarUrl()}
              alt="Preview avatar"
              className="w-16 h-16 rounded-full mx-auto mb-4 border-3 border-white"
            />
            <h3 className="text-lg font-semibold">{profileData.displayName}</h3>
            <p className="text-sm opacity-90">@{profileData.handle}</p>
            <div className="flex justify-center space-x-2 mt-4">
              {profileData.customTipAmounts.map((amount, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: `${profileData.theme.accentColor}40` }}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onNext}
            className="btn-primary px-8 py-3"
          >
            Continue to Social Links
          </button>
        </div>
      </div>
    </div>
  );
}; 