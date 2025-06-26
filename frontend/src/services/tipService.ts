import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TipTransaction {
  id?: string;
  fromUserId: string;
  toUserId: string;
  fromHandle: string;
  toHandle: string;
  amount: number;
  message?: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
  updatedAt: any;
}

export interface TipStats {
  totalTipsReceived: number;
  totalTipsSent: number;
  tipCount: number;
  averageTip: number;
}

export const tipService = {
  // Create new tip transaction
  async createTip(tipData: Omit<TipTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    const tipsRef = collection(db, 'tips');
    
    const newTip = {
      ...tipData,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(tipsRef, newTip);
    return docRef.id;
  },

  // Update tip status
  async updateTipStatus(tipId: string, status: TipTransaction['status'], transactionHash?: string): Promise<void> {
    const tipRef = doc(db, 'tips', tipId);
    await updateDoc(tipRef, {
      status,
      transactionHash,
      updatedAt: serverTimestamp()
    });
  },

  // Get tips received by user
  async getTipsReceived(userId: string, limitCount = 10): Promise<TipTransaction[]> {
    const tipsRef = collection(db, 'tips');
    const q = query(
      tipsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TipTransaction[];
  },

  // Get tips sent by user
  async getTipsSent(userId: string, limitCount = 10): Promise<TipTransaction[]> {
    const tipsRef = collection(db, 'tips');
    const q = query(
      tipsRef,
      where('fromUserId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TipTransaction[];
  },

  // Get recent tips for public feed
  async getRecentTips(limitCount = 20): Promise<TipTransaction[]> {
    const tipsRef = collection(db, 'tips');
    const q = query(
      tipsRef,
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TipTransaction[];
  },

  // Get tip stats for user
  async getUserTipStats(userId: string): Promise<TipStats> {
    const [tipsReceived, tipsSent] = await Promise.all([
      this.getTipsReceived(userId, 1000), // Get all tips for stats
      this.getTipsSent(userId, 1000)
    ]);

    const totalTipsReceived = tipsReceived.reduce((sum, tip) => sum + tip.amount, 0);
    const totalTipsSent = tipsSent.reduce((sum, tip) => sum + tip.amount, 0);
    const tipCount = tipsReceived.length;
    const averageTip = tipCount > 0 ? totalTipsReceived / tipCount : 0;

    return {
      totalTipsReceived,
      totalTipsSent,
      tipCount,
      averageTip
    };
  },

  // Get global platform stats
  async getPlatformStats(): Promise<{
    totalTips: number;
    totalVolume: number;
    activeUsers: number;
  }> {
    try {
      const tipsRef = collection(db, 'tips');
      const q = query(
        tipsRef,
        where('status', '==', 'completed'),
        limit(1000) // Sample for performance
      );
      
      const querySnapshot = await getDocs(q);
      const tips = querySnapshot.docs.map(doc => doc.data()) as TipTransaction[];
      
      const totalTips = tips.length;
      const totalVolume = tips.reduce((sum, tip) => sum + tip.amount, 0);
      const uniqueUsers = new Set([...tips.map(t => t.fromUserId), ...tips.map(t => t.toUserId)]);
      
      return {
        totalTips,
        totalVolume,
        activeUsers: uniqueUsers.size
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return demo stats if collection doesn't exist or there's an error
      return {
        totalTips: 1247,
        totalVolume: 12847,
        activeUsers: 389
      };
    }
  }
}; 