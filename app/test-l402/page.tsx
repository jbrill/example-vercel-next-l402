'use client';

import { useState } from 'react';

export default function TestL402Page() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testProtectedEndpoint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/protected/test');
      const data = await res.text();
      setResponse(`Status: ${res.status}\nResponse: ${data}`);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithL402Token = async () => {
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
      setResponse(`Invoice created:\n${JSON.stringify(invoiceData, null, 2)}`);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>L402 Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testProtectedEndpoint} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test Protected Endpoint (Should get 402)
        </button>
        
        <button 
          onClick={testWithL402Token} 
          disabled={loading}
          style={{ padding: '10px' }}
        >
          Get Invoice
        </button>
      </div>

      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        border: '1px solid #ddd',
        whiteSpace: 'pre-wrap'
      }}>
        {loading ? 'Loading...' : response}
      </pre>
    </div>
  );
}