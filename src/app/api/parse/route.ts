import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { parseDeliverySchedule } from '@/lib/parser';
import { extractPdfText } from '@/lib/pdf-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    if (filename.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (filename.endsWith('.pdf')) {
      text = await extractPdfText(buffer);
    } else if (filename.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please use .docx, .pdf, or .txt' },
        { status: 400 }
      );
    }

    // Parse the extracted text, passing filename for title extraction
    const schedule = parseDeliverySchedule(text, file.name);

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to parse file',
      },
      { status: 500 }
    );
  }
}
