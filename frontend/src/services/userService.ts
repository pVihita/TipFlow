import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  id: string;
  dynamicUserId: string;
  email: string;
  displayName: string;
  handle: string;
  bio?: string;
  profileImage?: string;
  walletAddress?: string;
  isCreator: boolean;
  createdAt: any;
  updatedAt: any;
  // Enhanced profile fields
  avatar?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  customTipAmounts?: number[];
  socialLinks?: {
    farcaster?: string;
    discord?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  // Creator specific fields
  totalTipsReceived?: number;
  totalTipsSent?: number;
  followerCount?: number;
  isVerified?: boolean;
}

export interface CreateUserData {
  dynamicUserId: string;
  email: string;
  displayName: string;
  handle: string;
  walletAddress?: string;
  profileImage?: string;
}

export const userService = {
  // Create new user profile - ONLY if no profile exists
  async createUser(userData: CreateUserData): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', userData.dynamicUserId);
      
      // 🚨 STRICT SAFEGUARD: Check if profile already exists
      const existingDoc = await getDoc(userRef);
      if (existingDoc.exists()) {
        console.error('🛡️ PROTECTION: Profile already exists, refusing to overwrite!');
        console.log('📄 Existing profile:', existingDoc.data());
        throw new Error('Profile already exists - will not overwrite existing data');
      }
      
      // Filter out undefined values for Firestore
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );
      
      const newUser: Omit<UserProfile, 'id'> = {
        ...cleanUserData,
        bio: '',
        isCreator: false,
        // Enhanced profile defaults
        theme: {
          primaryColor: '#3B82F6', // blue-500
          secondaryColor: '#8B5CF6', // purple-500
          accentColor: '#10B981', // emerald-500
        },
        customTipAmounts: [3, 7, 15],
        socialLinks: {},
        // Creator stats
        totalTipsReceived: 0,
        totalTipsSent: 0,
        followerCount: 0,
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as Omit<UserProfile, 'id'>;

      await setDoc(userRef, newUser);
      
      console.log('✅ Created NEW profile safely:', newUser);
      
      return {
        id: userData.dynamicUserId,
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Get user by Dynamic user ID
  async getUserById(dynamicUserId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', dynamicUserId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return {
          id: userSnap.id,
          ...userSnap.data()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Get user by handle
  async getUserByHandle(handle: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('handle', '==', handle.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as UserProfile;
    }
    
    return null;
  },

  // Update user profile - WITH STRICT PROTECTION
  async updateUser(dynamicUserId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', dynamicUserId);
      
      // 🚨 STRICT SAFEGUARD: Get existing profile first
      const existingDoc = await getDoc(userRef);
      if (!existingDoc.exists()) {
        throw new Error('Cannot update non-existent profile');
      }
      
      const existingData = existingDoc.data() as UserProfile;
      
      // 🛡️ PROTECTION: Preserve important existing data
      const protectedUpdates = { ...updates };
      
      // Don't allow overwriting with empty/default values if real data exists
      if (existingData.handle && existingData.handle !== '' && (!updates.handle || updates.handle.match(/^user_\d+$/))) {
        console.warn('🛡️ PROTECTION: Refusing to overwrite real handle with auto-generated one');
        delete protectedUpdates.handle;
      }
      
      if (existingData.displayName && existingData.displayName !== 'User' && (!updates.displayName || updates.displayName === 'User')) {
        console.warn('🛡️ PROTECTION: Refusing to overwrite real display name with default');
        delete protectedUpdates.displayName;
      }
      
      if (existingData.bio && existingData.bio !== '' && updates.bio === '') {
        console.warn('🛡️ PROTECTION: Refusing to clear existing bio');
        delete protectedUpdates.bio;
      }
      
      if (existingData.isCreator === true && updates.isCreator === false) {
        console.warn('🛡️ PROTECTION: Refusing to downgrade creator status');
        delete protectedUpdates.isCreator;
      }
      
      // Preserve theme and social links if they exist and updates are empty
      if (existingData.theme && (!updates.theme || Object.keys(updates.theme).length === 0)) {
        delete protectedUpdates.theme;
      }
      
      if (existingData.socialLinks && Object.keys(existingData.socialLinks).length > 0 && 
          (!updates.socialLinks || Object.keys(updates.socialLinks).length === 0)) {
        delete protectedUpdates.socialLinks;
      }
      
      // Filter out undefined values for Firestore
      const cleanUpdates = Object.fromEntries(
        Object.entries(protectedUpdates).filter(([_, value]) => value !== undefined)
      );
      
      if (Object.keys(cleanUpdates).length === 0) {
        console.log('🛡️ PROTECTION: No valid updates after protection checks');
        return;
      }
      
      console.log('✅ Applying protected updates:', cleanUpdates);
      console.log('📄 Existing data preserved:', {
        handle: existingData.handle,
        displayName: existingData.displayName,
        isCreator: existingData.isCreator,
        hasBio: !!existingData.bio,
        hasTheme: !!existingData.theme,
        hasSocialLinks: Object.keys(existingData.socialLinks || {}).length > 0
      });
      
      await updateDoc(userRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Check if handle is available
  async isHandleAvailable(handle: string): Promise<boolean> {
    try {
      const profile = await this.getUserByHandle(handle);
      return profile === null;
    } catch (error) {
      console.error('Error checking handle availability:', error);
      return false;
    }
  },

  // Setup creator profile - SAFELY
  async setupCreatorProfile(dynamicUserId: string, creatorData: {
    bio: string;
    profileImage?: string;
  }): Promise<void> {
    // Use the protected updateUser method
    await this.updateUser(dynamicUserId, {
      ...creatorData,
      isCreator: true
    });
  }
}; 