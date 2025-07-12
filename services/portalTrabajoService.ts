import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { OnboardingMatchData } from './onboardingMatchService';

export class PortalTrabajoService {
  static async getUserMatches(userId: string): Promise<OnboardingMatchData | null> {
    try {
      const matchDoc = await getDoc(doc(db, 'onboarding_matches', userId));
      
      if (matchDoc.exists()) {
        return matchDoc.data() as OnboardingMatchData;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo matches del usuario:', error);
      return null;
    }
  }
}
