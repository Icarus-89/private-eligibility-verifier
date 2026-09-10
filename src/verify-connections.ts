/**
 * API Connection Verification Script
 * 
 * Tests all Midnight Network API connections:
 * 1. Indexer API (GraphQL)
 * 2. Midnight Node (JSON-RPC)
 * 3. Proof Server
 * 
 * Usage: npx tsx src/verify-connections.ts [network]
 * Networks: undeployed, preview, preprod
 */

import { resolveNetwork, NETWORK_CONFIGS, type NetworkId } from './network';

interface ConnectionResult {
  name: string;
  url: string;
  status: 'success' | 'error';
  latencyMs: number;
  error?: string;
  data?: any;
}

async function testIndexerApi(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __typename }',
      }),
      signal: AbortSignal.timeout(10000),
    });

    const latencyMs = Date.now() - start;
    
    if (!response.ok) {
      return {
        name: 'Indexer API',
        url,
        status: 'error',
        latencyMs,
        error: HTTP : ,
      };
    }

    const data = await response.json();
    return {
      name: 'Indexer API',
      url,
      status: 'success',
      latencyMs,
      data: data.data,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Indexer API',
      url,
      status: 'error',
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testNodeRpc(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'system_chain',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const latencyMs = Date.now() - start;
    
    if (!response.ok) {
      return {
        name: 'Midnight Node',
        url,
        status: 'error',
        latencyMs,
        error: HTTP : ,
      };
    }

    const data = await response.json();
    return {
      name: 'Midnight Node',
      url,
      status: 'success',
      latencyMs,
      data: data.result,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Midnight Node',
      url,
      status: 'error',
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testProofServer(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    const latencyMs = Date.now() - start;
    
    // Proof server may return various status codes, but connection is successful
    return {
      name: 'Proof Server',
      url,
      status: 'success',
      latencyMs,
      data: HTTP ,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Proof Server',
      url,
      status: 'error',
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testIndexerWebSocket(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  
  return new Promise((resolve) => {
    try {
      const ws = new (require('ws'))(url, { 
        handshakeTimeout: 10000 
      });
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          name: 'Indexer WebSocket',
          url,
          status: 'error',
          latencyMs: Date.now() - start,
          error: 'Connection timeout',
        });
      }, 10000);

      ws.on('open', () => {
        clearTimeout(timeout);
        const latencyMs = Date.now() - start;
        ws.close();
        resolve({
          name: 'Indexer WebSocket',
          url,
          status: 'success',
          latencyMs,
          data: 'Connected',
        });
      });

      ws.on('error', (error: Error) => {
        clearTimeout(timeout);
        const latencyMs = Date.now() - start;
        resolve({
          name: 'Indexer WebSocket',
          url,
          status: 'error',
          latencyMs,
          error: error.message,
        });
      });
    } catch (error) {
      const latencyMs = Date.now() - start;
      resolve({
        name: 'Indexer WebSocket',
        url,
        status: 'error',
        latencyMs,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

async function main() {
  const networkArg = process.argv[2] as NetworkId | undefined;
  const { network, config } = resolveNetwork({ argv: process.argv });
  
  console.log('\n?? Midnight Network API Connection Verification');
  console.log('?'.repeat(50));
  console.log(Network: );
  console.log('');

  const tests = [
    testIndexerApi(config.indexer),
    testNodeRpc(config.node),
    testProofServer(config.proofServer),
    testIndexerWebSocket(config.indexerWS),
  ];

  const results = await Promise.all(tests);

  console.log('\n?? Results:\n');
  
  let allPassed = true;
  for (const result of results) {
    const icon = result.status === 'success' ? '?' : '?';
    const statusText = result.status === 'success' ? 'OK' : 'FAILED';
    
    console.log(${icon} : );
    console.log(   URL: );
    console.log(   Latency: ms);
    
    if (result.error) {
      console.log(   Error: );
      allPassed = false;
    }
    
    if (result.data) {
      console.log(   Data: );
    }
    console.log('');
  }

  console.log('?'.repeat(50));
  
  if (allPassed) {
    console.log('? All connections successful!');
    console.log('\nNext steps:');
    console.log('  1. Run 
pm run deploy to deploy the contract');
    console.log('  2. Or run 
pm run cli to interact with the deployed contract');
  } else {
    console.log('? Some connections failed. Check the errors above.');
    console.log('\nTroubleshooting:');
    console.log('  1. For local devnet: Run docker compose up -d');
    console.log('  2. For public networks: Check network status and faucet');
    console.log('  3. Ensure proof server is running: docker compose up proof-server');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
