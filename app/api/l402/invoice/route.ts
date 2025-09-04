import { NextRequest, NextResponse } from 'next/server';
import { createRestLightningClient, createMockLightningClient } from 'next-l402';

// Use real Lightning client if credentials are provided, otherwise use mock
const lightningClient = process.env.LND_MACAROON 
  ? createRestLightningClient({
      host: process.env.LND_REST_HOST || 'https://localhost:8080',
      macaroon: process.env.LND_MACAROON,
      cert: process.env.LND_CERT,
      rejectUnauthorized: false,
    })
  : createMockLightningClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, memo } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a number' },
        { status: 400 }
      );
    }

    const invoice = await lightningClient.createInvoice(amount, memo);

    return NextResponse.json({
      paymentHash: invoice.paymentHash,
      paymentRequest: invoice.paymentRequest,
      amountSats: invoice.amountSats,
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}