import { NextRequest, NextResponse } from 'next/server';
import { withL402, createRestLightningClient, createMockLightningClient } from 'next-l402';
import { L402_CONFIG } from '../../../../config';

// Use real Lightning client if credentials are provided, otherwise use mock
const lightningClient = process.env.LND_MACAROON 
  ? createRestLightningClient({
      host: L402_CONFIG.LND_REST_HOST,
      macaroon: process.env.LND_MACAROON,
      cert: process.env.LND_CERT,
      rejectUnauthorized: false,
    })
  : createMockLightningClient();

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