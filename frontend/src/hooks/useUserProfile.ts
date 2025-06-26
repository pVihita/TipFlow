import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { userService, type UserProfile, type CreateUserData } from '../services/userService';

export const useUserProfile = () => {
  const { user } = useDynamicContext();
  const isAuthenticated = !!user;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticationReady, setAuthenticationReady] = useState(false);

  // Load or create user profile when Dynamic user changes
  useEffect(() => {
    const initializeUser = async () => {
      console.log('useUserProfile - initializeUser called');
      console.log('useUserProfile - isAuthenticated:', isAuthenticated);
      console.log('useUserProfile - user:', user);
      console.log('useUserProfile - user keys:', user ? Object.keys(user) : 'no user');
      
      if (!isAuthenticated || !user) {
        console.log('useUserProfile - No user or not authenticated');
        setProfile(null);
        setLoading(false);
        setAuthenticationReady(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Enhanced user ID debugging - Check ALL possible ID variations
        const possibleUserIds = {
          userId: (user as any).userId,
          id: (user as any).id,
          sub: (user as any).sub,
          email: user.email,
          dynamicUserId: (user as any).dynamicUserId,
          authId: (user as any).authId,
          primaryWallet: (user as any).primaryWallet?.address,
        };
        
        console.log('🔍 useUserProfile - All possible user IDs:', possibleUserIds);
        
        const userId = (user as any).userId || (user as any).id || (user as any).sub || '';
        console.log('🎯 useUserProfile - Final selected userId:', userId);
        console.log('📏 useUserProfile - userId type:', typeof userId, 'length:', userId.length);

        if (!userId) {
          console.error('useUserProfile - No valid user ID found');
          console.error('🚨 This might be why your existing profile is not loading!');
          setLoading(false);
          setAuthenticationReady(true); // User is authenticated even if no profile
          return;
        }

        // Try to get existing user profile
        console.log('🔎 useUserProfile - Searching for profile with userId:', userId);
        let userProfile = await userService.getUserById(userId);
        console.log('📄 useUserProfile - existing profile result:', userProfile);

        // If no profile found with current logic, try other ID variations
        if (!userProfile) {
          console.log('❌ No profile found with current ID logic');
          console.log('🔄 Trying other possible user IDs...');
          
          for (const [idType, idValue] of Object.entries(possibleUserIds)) {
            if (idValue && typeof idValue === 'string' && idValue !== userId) {
              console.log(`🔍 Trying ${idType}: ${idValue}`);
              try {
                const testProfile = await userService.getUserById(idValue);
                if (testProfile) {
                  console.log(`✅ FOUND EXISTING PROFILE with ${idType}!`);
                  console.log('📄 Profile details:', {
                    displayName: testProfile.displayName,
                    handle: testProfile.handle,
                    email: testProfile.email,
                    isCreator: testProfile.isCreator,
                    bio: testProfile.bio,
                    socialLinks: testProfile.socialLinks
                  });
                  console.log('🚨 IMPORTANT: This profile has more data than auto-generated!');
                  userProfile = testProfile;
                  break;
                }
              } catch (error) {
                console.log(`❌ Error checking ${idType}:`, error);
              }
            }
          }
        }

        // If no profile exists anywhere, create one
        if (!userProfile) {
          console.log('useUserProfile - Creating new profile (no existing profile found)');
          const userData: CreateUserData = {
            dynamicUserId: userId,
            email: user.email || '',
            displayName: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.email?.split('@')[0] || 'User',
            handle: user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${Date.now()}`,
            // Only include walletAddress if it exists
            ...(((user as any).primaryWallet?.address) && { walletAddress: (user as any).primaryWallet.address }),
            // Only include profileImage if it exists
            ...((user.metadata as any)?.avatar && { profileImage: (user.metadata as any).avatar })
          };

          console.log('useUserProfile - userData for NEW profile:', userData);
          userProfile = await userService.createUser(userData);
          console.log('useUserProfile - created NEW profile:', userProfile);
        } else {
          console.log('✅ useUserProfile - Using EXISTING profile with all your data!');
          console.log('📄 Existing profile loaded:', {
            handle: userProfile.handle,
            displayName: userProfile.displayName,
            isCreator: userProfile.isCreator,
            bio: userProfile.bio,
            hasTheme: !!userProfile.theme,
            hasSocialLinks: Object.keys(userProfile.socialLinks || {}).length > 0
          });
        }

        setProfile(userProfile);
        setAuthenticationReady(true);
      } catch (err) {
        console.error('Failed to initialize user profile:', err);
        
        const error = err as any;
        console.error('Error details:', {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          stack: error?.stack?.split('\n').slice(0, 3) // First 3 lines of stack
        });
        
        // Check if it's a Firestore permission error
        if (error?.code === 'permission-denied') {
          console.error('🚨 Firestore Permission Denied - Check your Firebase rules');
          setError('Database access denied. Please check Firebase configuration.');
        } else if (error?.code === 'unauthenticated') {
          console.error('🚨 Firestore Authentication Error');
          setError('Authentication required for database access.');
        } else if (error?.message?.includes('network')) {
          console.error('🚨 Network connectivity issue');
          setError('Network error - unable to connect to database.');
        } else {
          setError('Failed to load user profile. Please try again.');
        }
        
        // Even if profile creation fails, mark authentication as ready
        // This allows the app to function with basic auth state
        setAuthenticationReady(true);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [user, isAuthenticated]);

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const userId = (user as any)?.userId || (user as any)?.id || (user as any)?.sub;
    if (!user || !profile || !userId) return;

    try {
      await userService.updateUser(userId, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  // Setup creator profile
  const setupCreator = async (creatorData: { bio: string; profileImage?: string }) => {
    const userId = (user as any)?.userId || (user as any)?.id || (user as any)?.sub;
    if (!user || !profile || !userId) return;

    try {
      await userService.setupCreatorProfile(userId, creatorData);
      setProfile(prev => prev ? { 
        ...prev, 
        ...creatorData, 
        isCreator: true 
      } : null);
    } catch (err) {
      console.error('Failed to setup creator profile:', err);
      throw new Error('Failed to setup creator profile');
    }
  };

  // Check handle availability
  const checkHandleAvailability = async (handle: string): Promise<boolean> => {
    if (profile?.handle === handle) return true; // Current user's handle
    return await userService.isHandleAvailable(handle);
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    setupCreator,
    checkHandleAvailability,
    isAuthenticated: isAuthenticated && authenticationReady,
    authenticationReady
  };
}; 