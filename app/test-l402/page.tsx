'use client';

import { useState } from 'react';

interface L402Challenge {
  macaroon: string;
  invoice: string;
  paymentHash: string;
}

export default function TestL402Page() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<L402Challenge | null>(null);
  const [preimage, setPreimage] = useState('');

  const testProtectedEndpoint = async () => {
    setLoading(true);
    setChallenge(null);
    try {
      const res = await fetch('/api/protected/test');
      
      if (res.status === 402) {
        // Extract L402 challenge from headers
        const wwwAuth = res.headers.get('WWW-Authenticate');
        if (wwwAuth) {
          const macaroonMatch = wwwAuth.match(/macaroon="([^"]*)"/);
          const invoiceMatch = wwwAuth.match(/invoice="([^"]*)"/);
          
          if (macaroonMatch && invoiceMatch) {
            const challengeData = {
              macaroon: macaroonMatch[1],
              invoice: invoiceMatch[1],
              paymentHash: 'extracted-from-macaroon' // In real app, decode macaroon
            };
            setChallenge(challengeData);
            setResponse(`🔐 Payment Required (402)
            
Invoice: ${challengeData.invoice}
            
💡 In a real app, you would:
1. Pay this Lightning invoice with your wallet
2. Get the payment preimage
3. Use the preimage below to authenticate`);
            return;
          }
        }
        setResponse(`Payment Required (402) but couldn't parse challenge`);
      } else {
        const data = await res.text();
        setResponse(`Status: ${res.status}\nResponse: ${data}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithL402Token = async () => {
    if (!challenge) {
      setResponse('❌ No challenge available. Try "Test Protected Endpoint" first.');
      return;
    }

    if (!preimage) {
      setResponse('❌ Please enter a preimage (for demo, use any 64-char hex string)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/protected/test', {
        headers: {
          Authorization: `L402 ${challenge.macaroon}:${preimage}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setResponse(`✅ Success! Authenticated with L402 token
        
${JSON.stringify(data, null, 2)}

🎉 Payment flow completed successfully!`);
      } else {
        const errorText = await res.text();
        setResponse(`❌ Authentication failed (${res.status}): ${errorText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const generateMockInvoice = async () => {
    setLoading(true);
    try {
      const invoiceRes = await fetch('/api/l402/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, memo: 'Test payment' })
      });
      
      if (!invoiceRes.ok) {
        const errorText = await invoiceRes.text();
        setResponse(`Invoice Error (${invoiceRes.status}): ${errorText}`);
        return;
      }
      
      const invoiceData = await invoiceRes.json();
      setResponse(`⚡ Lightning Invoice Generated:

${JSON.stringify(invoiceData, null, 2)}

💡 This is a standalone invoice generation endpoint.
For the full L402 flow, use "Test Protected Endpoint" instead.`);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>⚡ L402 Demo - Lightning HTTP 402 Payment Required</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#495057' }}>Step 1: Test Protected Endpoint</h2>
        <p style={{ margin: '0 0 15px 0', color: '#666' }}>
          Try to access a protected resource. This should return a 402 Payment Required with a Lightning invoice.
        </p>
        <button 
          onClick={testProtectedEndpoint} 
          disabled={loading}
          style={{ 
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🔒 Test Protected Endpoint
        </button>
      </div>

      {challenge && (
        <div style={{ 
          background: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#856404' }}>Step 2: Enter Payment Preimage</h2>
          <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
            In a real app, you&apos;d pay the Lightning invoice and get a preimage. For demo purposes, 
            enter any 64-character hex string:
          </p>
          <input
            type="text"
            value={preimage}
            onChange={(e) => setPreimage(e.target.value)}
            placeholder="Enter 64-char hex preimage (e.g., 1234567890abcdef...)"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
          <button 
            onClick={testWithL402Token} 
            disabled={loading || !preimage}
            style={{ 
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !preimage) ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ✅ Authenticate with L402 Token
          </button>
        </div>
      )}

      <div style={{ 
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #b8daff'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#004085' }}>Optional: Generate Standalone Invoice</h2>
        <p style={{ margin: '0 0 15px 0', color: '#004085' }}>
          Test the invoice generation endpoint separately (not part of the L402 flow):
        </p>
        <button 
          onClick={generateMockInvoice} 
          disabled={loading}
          style={{ 
            padding: '12px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          ⚡ Generate Lightning Invoice
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Response:</h3>
        <pre style={{ 
          background: 'white', 
          padding: '15px', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px',
          margin: 0,
          minHeight: '100px'
        }}>
          {loading ? '⏳ Loading...' : (response || '👆 Click a button above to start testing')}
        </pre>
      </div>
    </div>
  );
}