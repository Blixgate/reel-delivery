import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { classifyDocument, matchDocumentToDeliveryItems } from '@/lib/gap-analyzer';
import { extractPdfText } from '@/lib/pdf-utils';
import { UploadedDocument, DeliveryItem, ExtractedContractData } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const deliveryItemsStr = formData.get('deliveryItems') as string;

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

    // Classify document
    const documentType = classifyDocument(filename, text);

    // Parse delivery items if provided
    let deliveryItems: DeliveryItem[] = [];
    if (deliveryItemsStr) {
      try {
        deliveryItems = JSON.parse(deliveryItemsStr);
      } catch (e) {
        console.warn('Failed to parse delivery items:', e);
      }
    }

    // Match document to delivery items
    const matchedDeliveryItems = matchDocumentToDeliveryItems(
      {
        id: uuid(),
        filename: file.name,
        fileType: file.type,
        documentType,
        uploadedAt: new Date().toISOString(),
        extractedData: null,
        fulfills: [],
        fileSize: file.size,
      },
      deliveryItems
    );

    // Extract contract data (basic parsing)
    const extractedData: ExtractedContractData | null = text.length > 100
      ? {
          parties: [],
          dealTerms: [],
          rawSummary: text.substring(0, 500),
        }
      : null;

    return NextResponse.json(
      {
        documentType,
        extractedData,
        matchedDeliveryItems,
        filename: file.name,
        fileSize: file.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Document classification error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to classify document',
      },
      { status: 500 }
    );
  }
}
