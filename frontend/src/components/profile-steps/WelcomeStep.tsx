import React from 'react';
import { SparklesIcon, GiftIcon, UserIcon, LinkIcon } from '@heroicons/react/24/outline';
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

export const WelcomeStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Let's set up your FlowTip profile! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Create your personalized tip page and start receiving support from your community
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Unique Handle</h3>
          <p className="text-sm text-gray-600">
            Claim your @handle and get a personalized tip page
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <GiftIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Custom Amounts</h3>
          <p className="text-sm text-gray-600">
            Set your preferred tip amounts and themes
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Social Links</h3>
          <p className="text-sm text-gray-600">
            Connect your social accounts for verification
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">What we'll set up together:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              1
            </div>
            <span className="text-gray-700">Your creator handle and bio</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <span className="text-gray-700">Profile picture and theme</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <span className="text-gray-700">Social media connections</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              4
            </div>
            <span className="text-gray-700">Preview and launch</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="btn-primary text-lg px-8 py-3 flex items-center space-x-3 mx-auto"
      >
        <SparklesIcon className="h-5 w-5" />
        <span>Let's Get Started!</span>
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Takes about 3 minutes • Your data is secure and private
      </p>
    </div>
  );
}; 