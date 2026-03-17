import { NextRequest, NextResponse } from 'next/server';
import { searchIncentives } from '@/lib/tax-incentives';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const region = searchParams.get('region') || undefined;
    const minPercentageStr = searchParams.get('minPercentage');
    const minPercentage = minPercentageStr
      ? parseFloat(minPercentageStr)
      : undefined;

    const programs = searchIncentives(country, region, minPercentage);

    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error('Tax incentive search error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to search tax incentives',
      },
      { status: 500 }
    );
  }
}
