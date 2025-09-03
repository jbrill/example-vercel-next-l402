// L402 Configuration
export const L402_CONFIG = {
  // Secret key for signing macaroons - should be 32 bytes
  SECRET_KEY: process.env.L402_SECRET_KEY 
    ? Buffer.from(process.env.L402_SECRET_KEY, 'hex')
    : Buffer.from('L402-secret-key-exactly-32bytes!'),
  
  // Lightning node configuration
  LND_REST_HOST: process.env.LND_REST_HOST || 'https://localhost:8097',
  LND_MACAROON: process.env.LND_MACAROON,
  LND_CERT: process.env.LND_CERT,
  
  // L402 settings
  DEFAULT_PRICE_SATS: parseInt(process.env.L402_PRICE_SATS || '1000'),
  TOKEN_VALIDITY_HOURS: parseInt(process.env.L402_TOKEN_HOURS || '24'),
  LOCATION: process.env.L402_LOCATION || 'https://localhost:3000',
};