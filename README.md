# L402 Demo App for Vercel

A complete Next.js application demonstrating L402 (Lightning HTTP 402) protocol implementation, ready for one-click deployment on Vercel. This app shows real-world implementation patterns for monetizing API endpoints with Lightning Network micropayments.

## Features

- 🚀 **One-click Deploy to Vercel** - Deploy instantly with environment variables
- ⚡ **Lightning Network Payments** - Mock mode for demo, real node support ready
- 🔒 **API Route Protection** - Uses `withL402` wrapper to protect endpoints
- 🎨 **Interactive Test UI** - Built-in page for testing the payment flow
- 💾 **Macaroon Authentication** - Cryptographic bearer tokens with restrictions
- ✅ **Payment Verification** - Validates payment proofs using preimages

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Ftest-l402-app)

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/test-l402](http://localhost:3000/test-l402) to test the flow

### Vercel Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables (optional - uses mock by default)
4. Deploy!

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `L402_SECRET_KEY` | 32-byte hex secret for signing macaroons | No | Auto-generated |
| `LND_REST_HOST` | Lightning node REST API URL | No | Mock client |
| `LND_MACAROON` | Admin macaroon in hex format | No | Mock client |
| `L402_PRICE_SATS` | Price in satoshis for protected routes | No | 1000 |

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

## Testing the Flow

### Using cURL

1. Make initial request (will get 402):
```bash
curl -i http://localhost:3000/api/protected/test
```

2. Extract the invoice from the WWW-Authenticate header and pay it

3. Use the L402 token:
```bash
curl -H "Authorization: L402 <macaroon>:<preimage>" \
  http://localhost:3000/api/protected/test
```

### Using Thunder Client or Postman

1. GET request to `http://localhost:3000/api/protected/test`
2. Copy the invoice from the 402 response headers
3. Pay the invoice with your Lightning wallet
4. Add Authorization header with L402 token
5. Resend the request

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── protected/
│   │   │   └── test/
│   │   │       └── route.ts      # Protected endpoint example
│   │   └── l402/
│   │       └── challenge/
│   │           └── route.ts      # Manual challenge generation
│   └── page.tsx                  # Landing page
├── config.ts                     # L402 configuration
├── .env.local                    # Environment variables
└── package.json
```

## Configuration Options

The `config.ts` file contains all L402 settings:

```typescript
{
  SECRET_KEY: Buffer,           // 32-byte key for signing macaroons
  LND_REST_HOST: string,        // Lightning node REST endpoint
  LND_MACAROON: string,         // Base64 encoded macaroon
  LND_CERT: string,             // Base64 encoded TLS cert
  DEFAULT_PRICE_SATS: number,   // Price in satoshis
  TOKEN_VALIDITY_HOURS: number, // Token expiration time
  LOCATION: string              // Service location URL
}
```

## Common Issues

### Connection Refused
- Ensure your Lightning node is running and accessible
- Check that the REST API is enabled on your node
- Verify firewall settings allow the connection

### Invalid Macaroon
- Ensure the macaroon is properly base64 encoded
- Check that you're using an admin macaroon with invoice permissions

### Payment Not Recognized
- Wait a few seconds for payment confirmation
- Ensure the preimage matches the payment hash
- Check that the Lightning node is synced

## L402 Protocol

L402 is an open protocol for Lightning Network payments over HTTP. When a client requests a protected resource:

1. **402 Payment Required**: Server returns Lightning invoice and macaroon
2. **Payment**: Client pays the Lightning invoice to get preimage
3. **Authorization**: Client sends `Authorization: L402 <macaroon>:<preimage>`
4. **Access Granted**: Server validates payment and grants access

## Learn More

- [L402 Protocol Specification](https://github.com/lightninglabs/L402)
- [next-l402 Library](https://github.com/jbrill/next-l402)
- [Lightning Network](https://lightning.network/)
- [Macaroons](https://research.google/pubs/pub41892/)

## License

MIT