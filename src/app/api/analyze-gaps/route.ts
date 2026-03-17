import { NextRequest, NextResponse } from 'next/server';
import { analyzeGaps } from '@/lib/gap-analyzer';
import { DeliverySchedule, UploadedDocument, GapReport } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schedule, documents } = body as {
      schedule: DeliverySchedule;
      documents: UploadedDocument[];
    };

    if (!schedule || !documents) {
      return NextResponse.json(
        { error: 'Missing schedule or documents in request body' },
        { status: 400 }
      );
    }

    const gapReport: GapReport = analyzeGaps(schedule, documents);

    return NextResponse.json(gapReport, { status: 200 });
  } catch (error) {
    console.error('Gap analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze gaps',
      },
      { status: 500 }
    );
  }
}
