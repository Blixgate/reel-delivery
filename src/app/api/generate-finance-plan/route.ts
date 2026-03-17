import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import {
  generateFinancePlan,
  parseSalesEstimates,
  parseSalesAgencyAgreement,
} from '@/lib/finance-generator';
import { extractPdfText } from '@/lib/pdf-utils';
import { getBestIncentivesForBudget, calculateEstimatedCredit } from '@/lib/tax-incentives';
import { FinancePlan, TaxIncentive } from '@/lib/types';

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (filename.endsWith('.pdf')) {
    return extractPdfText(buffer);
  } else if (filename.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const salesEstimatesFile = formData.get('salesEstimates') as File;
    const salesAgencyFile = formData.get('salesAgency') as File | null;
    const title = formData.get('title') as string;
    const budget = parseFloat(formData.get('budget') as string);
    const location = formData.get('shootLocation') as string;

    if (!salesEstimatesFile || !title || isNaN(budget) || !location) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: salesEstimates, title, budget, shootLocation',
        },
        { status: 400 }
      );
    }

    // Parse sales estimates
    const salesEstimatesText = await extractText(salesEstimatesFile);
    const salesEstimates = parseSalesEstimates(salesEstimatesText);

    // Parse sales agency agreement if provided
    let salesAgentCommission = 15; // Default
    if (salesAgencyFile) {
      try {
        const salesAgencyText = await extractText(salesAgencyFile);
        const agencyData = parseSalesAgencyAgreement(salesAgencyText);
        salesAgentCommission = agencyData.commissionRate;
      } catch (e) {
        console.warn('Failed to parse sales agency agreement:', e);
      }
    }

    // Get applicable tax incentives for location
    const applicablePrograms = getBestIncentivesForBudget(budget, location);

    // Calculate tax incentives
    const taxIncentives: TaxIncentive[] = applicablePrograms
      .slice(0, 3)
      .map((program) => {
        const creditCalc = calculateEstimatedCredit(program.id, budget * 0.75);
        return {
          id: program.id,
          jurisdiction: program.jurisdiction,
          country: program.country,
          programName: program.programName,
          creditType: program.creditType,
          percentage: program.basePercentage,
          qualifyingSpend: budget * 0.75,
          estimatedCredit: creditCalc.estimatedCredit,
          requirements: program.qualifyingExpenses,
          capAmount: program.capPerProject,
          minimumSpend: program.minimumSpend,
          residencyRequired: program.residencyRequirements.length > 0,
          applicationDeadline: undefined,
          notes: creditCalc.notes,
        };
      });

    // Generate finance plan
    const financePlan: FinancePlan = generateFinancePlan({
      filmTitle: title,
      totalBudget: budget,
      salesEstimates,
      taxIncentives,
      salesAgentCommission,
    });

    return NextResponse.json(financePlan, { status: 200 });
  } catch (error) {
    console.error('Finance plan generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate finance plan',
      },
      { status: 500 }
    );
  }
}
