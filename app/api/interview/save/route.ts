import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin-config';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, interviewData } = await request.json();

    if (!userId || !interviewData) {
      return NextResponse.json(
        { error: 'User ID and interview data are required' },
        { status: 400 }
      );
    }    const db = adminDb;
    
    // Save interview session
    const interviewRef = await db.collection('interviews').add({
      userId,
      ...interviewData,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    // Update user's credit balance
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;
    const creditsUsed = interviewData.questions?.length || 4;

    if (currentCredits < creditsUsed) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }    // Deduct credits
    await userRef.update({
      credits: FieldValue.increment(-creditsUsed),
      lastInterviewAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ 
      success: true, 
      interviewId: interviewRef.id,
      creditsUsed,
      remainingCredits: currentCredits - creditsUsed
    });

  } catch (error) {
    console.error('Error saving interview:', error);
    return NextResponse.json(
      { error: 'Failed to save interview' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }    const db = adminDb;
    
    const interviewsSnapshot = await db
      .collection('interviews')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const interviews = interviewsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().createdAt
    }));

    return NextResponse.json({ interviews });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
