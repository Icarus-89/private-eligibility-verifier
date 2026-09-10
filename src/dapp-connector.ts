/**
 * DApp Connector API integration for Midnight browser wallets.
 * 
 * This module provides browser wallet connection functionality using
 * the DApp Connector API standard. Use this for front-end dApps that
 * need to connect to Midnight wallets like mnLace.
 * 
 * Usage in browser environment:
 *   import { connectWallet, getWalletStatus } from './dapp-connector';
 *   const wallet = await connectWallet('preprod');
 */

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export type MidnightWalletName = 'mnLace' | 'mnNightly';

export interface WalletConnection {
  walletName: MidnightWalletName;
  connectedApi: any;
  networkId: string;
  address?: string;
}

export interface WalletStatus {
  installed: boolean;
  connected: boolean;
  walletName?: MidnightWalletName;
  networkId?: string;
}

declare global {
  interface Window {
    midnight?: {
      [key: string]: {
        connect: (networkId: string) => Promise<any>;
        disconnect?: () => Promise<void>;
        getConnectionStatus?: () => Promise<{ networkId: string }>;
        getConfiguration?: () => Promise<{ indexerUri: string }>;
      };
    };
  }
}

/**
 * Check if a Midnight wallet is installed in the browser.
 */
export function isWalletInstalled(walletName: MidnightWalletName = 'mnLace'): boolean {
  if (typeof window === 'undefined') {
    console.warn('DApp Connector API is only available in browser environments');
    return false;
  }
  return !!(window as any).midnight?.[walletName];
}

/**
 * Get the status of a wallet connection.
 */
export function getWalletStatus(walletName: MidnightWalletName = 'mnLace'): WalletStatus {
  if (typeof window === 'undefined') {
    return { installed: false, connected: false };
  }

  const wallet = (window as any).midnight?.[walletName];
  if (!wallet) {
    return { installed: false, connected: false };
  }

  return {
    installed: true,
    connected: false, // Will be updated after connection
    walletName,
  };
}

/**
 * Connect to a Midnight wallet using the DApp Connector API.
 * 
 * @param networkId - Network to connect to: 'preprod', 'preview', or 'mainnet'
 * @param walletName - Wallet to connect to (default: 'mnLace')
 * @returns WalletConnection object with the connected API and wallet info
 */
export async function connectWallet(
  networkId: string = 'preprod',
  walletName: MidnightWalletName = 'mnLace'
): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('DApp Connector API is only available in browser environments');
  }

  // Check if wallet is installed
  const wallet = (window as any).midnight?.[walletName];
  if (!wallet) {
    throw new Error(
      Wallet  not installed.  +
      Please install the Midnight wallet extension from the Chrome Web Store.
    );
  }

  try {
    console.log(Connecting to  on ...);
    
    // Request connection
    const connectedApi = await wallet.connect(networkId);
    
    if (!connectedApi) {
      throw new Error('Failed to connect to wallet - no API returned');
    }

    // Get connection status
    const status = await connectedApi.getConnectionStatus?.() ?? { networkId };
    
    // Set network ID in the SDK
    setNetworkId(status.networkId);

    console.log(Connected to  on );

    return {
      walletName,
      connectedApi,
      networkId: status.networkId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(Failed to connect to : );
  }
}

/**
 * Disconnect from a Midnight wallet.
 */
export async function disconnectWallet(connection: WalletConnection): Promise<void> {
  if (connection.connectedApi?.disconnect) {
    await connection.connectedApi.disconnect();
    console.log(Disconnected from );
  }
}

/**
 * Get wallet configuration from a connected API.
 */
export async function getWalletConfiguration(connection: WalletConnection) {
  if (!connection.connectedApi?.getConfiguration) {
    throw new Error('Connected API does not support getConfiguration');
  }
  
  return await connection.connectedApi.getConfiguration();
}

/**
 * Get the wallet's public key or address.
 * Note: This depends on the wallet implementation and may not be available
 * through the DApp Connector API. For full wallet access, use the
 * wallet-sdk directly.
 */
export async function getWalletAddress(connection: WalletConnection): Promise<string | undefined> {
  // The DApp Connector API doesn't directly expose the address
  // For address access, you would need to use the wallet-sdk directly
  // or the connected API's specific methods
  return connection.address;
}

/**
 * Example usage in a browser dApp.
 * 
 * `	ypescript
 * // Connect to wallet
 * const connection = await connectWallet('preprod', 'mnLace');
 * 
 * // Get wallet configuration
 * const config = await getWalletConfiguration(connection);
 * console.log('Indexer URI:', config.indexerUri);
 * 
 * // Disconnect when done
 * await disconnectWallet(connection);
 * `
 */
export const exampleUsage = 
// Connect to wallet
const connection = await connectWallet('preprod', 'mnLace');

// Get wallet configuration
const config = await getWalletConfiguration(connection);
console.log('Indexer URI:', config.indexerUri);

// Disconnect when done
await disconnectWallet(connection);
;
