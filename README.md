# L402 Test App

Example Next.js application demonstrating L402 (Lightning HTTP 402) authentication using the `next-l402` library.

## Features

- **API Route Protection**: Uses `withL402` wrapper to protect individual endpoints
- **Lightning Payments**: Generates real Lightning Network invoices
- **Macaroon Authentication**: Cryptographic bearer tokens with restrictions
- **Payment Verification**: Validates payment proofs using preimages

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```env
LND_MACAROON=<your_lnd_macaroon>
LND_CERT=<your_lnd_cert>
```

3. Start the development server:
```bash
npm run dev
```

4. Test the L402 flow:
   - Visit `/api/protected/test` → Get 402 Payment Required
   - Pay the Lightning invoice
   - Use the L402 token to access the endpoint

## Architecture

- **No middleware**: API routes handle their own L402 protection
- **Direct Lightning integration**: Each protected route connects to Lightning node
- **Stateless authentication**: No session storage needed in middleware layer

## API Routes

- `GET /api/protected/test` - Example protected endpoint
- `GET /api/l402/challenge` - Challenge generation (optional, routes auto-generate)

## Usage

```typescript
import { withL402, createRestLightningClient } from 'next-l402';

export const GET = withL402(async (req) => {
  return NextResponse.json({ message: "Payment successful!" });
}, {
  lightning: lightningClient,
  priceSats: 1000,
  secretKey: SECRET_KEY,
});
```

## L402 Protocol

L402 is an open protocol for Lightning Network payments over HTTP. When a client requests a protected resource:

1. **402 Payment Required**: Server returns Lightning invoice and macaroon
2. **Payment**: Client pays the Lightning invoice to get preimage
3. **Authorization**: Client sends `Authorization: L402 <macaroon>:<preimage>`
4. **Access Granted**: Server validates payment and grants access