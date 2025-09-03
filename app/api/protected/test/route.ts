import { NextRequest, NextResponse } from 'next/server';
import { withL402, createRestLightningClient } from 'next-l402/dist';
import { L402_CONFIG } from '../../../../config';

const lightningClient = createRestLightningClient({
  host: L402_CONFIG.LND_REST_HOST,
  macaroon: process.env.LND_MACAROON!,
  cert: process.env.LND_CERT!,
  rejectUnauthorized: false,
});

async function protectedHandler(req: NextRequest) {
  return NextResponse.json({
    message: 'Success! L402 authentication works',
    authenticated: true,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withL402(protectedHandler, {
  lightning: lightningClient,
  priceSats: L402_CONFIG.DEFAULT_PRICE_SATS,
  secretKey: L402_CONFIG.SECRET_KEY,
  location: L402_CONFIG.LOCATION,
});