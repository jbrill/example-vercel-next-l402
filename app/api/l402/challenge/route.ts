import { NextRequest } from 'next/server';
import { createChallengeHandler, createRestLightningClient } from 'next-l402/dist';
import { L402_CONFIG } from '../../../../config';

const lightningClient = createRestLightningClient({
  host: L402_CONFIG.LND_REST_HOST,
  macaroon: process.env.LND_MACAROON!,
  cert: process.env.LND_CERT!,
  rejectUnauthorized: false,
});

const challengeHandler = createChallengeHandler({
  lightning: lightningClient,
  priceSats: L402_CONFIG.DEFAULT_PRICE_SATS,
  secretKey: L402_CONFIG.SECRET_KEY,
  location: L402_CONFIG.LOCATION,
});

export async function GET(req: NextRequest) {
  return challengeHandler(req);
}