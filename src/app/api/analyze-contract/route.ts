import { NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/pdf-utils';
import { analyzeContract } from '@/lib/contract-reader';
import mammoth from 'mammoth';

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await extractText(file);

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract sufficient text from the document' }, { status: 400 });
    }

    const analysis = analyzeContract(text);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Contract analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}
