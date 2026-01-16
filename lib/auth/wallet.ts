import { SiweMessage } from "siwe";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "@/lib/db";
import type { ChainType } from "@prisma/client";

const NONCE_EXPIRY_MINUTES = 10;

// Store nonces temporarily (in production, use Redis)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

/**
 * Generate a nonce for wallet authentication
 */
export function generateNonce(): string {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  return nonce;
}

/**
 * Store nonce for verification
 */
export function storeNonce(address: string, nonce: string): void {
  const normalizedAddress = address.toLowerCase();
  nonceStore.set(normalizedAddress, {
    nonce,
    expiresAt: Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000,
  });
}

/**
 * Get stored nonce for address
 */
export function getNonce(address: string): string | null {
  const normalizedAddress = address.toLowerCase();
  const entry = nonceStore.get(normalizedAddress);

  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    nonceStore.delete(normalizedAddress);
    return null;
  }

  return entry.nonce;
}

/**
 * Clear nonce after use
 */
export function clearNonce(address: string): void {
  nonceStore.delete(address.toLowerCase());
}

/**
 * Create SIWE message for EVM wallets
 */
export function createSiweMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  domain?: string;
  uri?: string;
}): string {
  const message = new SiweMessage({
    domain: params.domain || "vlink.veritwin.com",
    address: params.address,
    statement: "Sign in to VLink with your Ethereum wallet",
    uri: params.uri || "https://vlink.veritwin.com",
    version: "1",
    chainId: params.chainId,
    nonce: params.nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(
      Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000
    ).toISOString(),
  });

  return message.prepareMessage();
}

/**
 * Verify EVM wallet signature (SIWE)
 */
export async function verifyEvmSignature(params: {
  message: string;
  signature: string;
  nonce: string;
}): Promise<{
  success: boolean;
  address?: string;
  chainId?: number;
  error?: string;
}> {
  try {
    const siweMessage = new SiweMessage(params.message);

    // Verify the message
    const fields = await siweMessage.verify({
      signature: params.signature,
      nonce: params.nonce,
    });

    if (!fields.success) {
      return { success: false, error: "Invalid signature" };
    }

    return {
      success: true,
      address: siweMessage.address,
      chainId: siweMessage.chainId,
    };
  } catch (error) {
    console.error("EVM signature verification error:", error);
    return { success: false, error: "Signature verification failed" };
  }
}

/**
 * Create message for Solana wallet signing
 */
export function createSolanaMessage(params: {
  address: string;
  nonce: string;
  domain?: string;
}): string {
  const domain = params.domain || "vlink.veritwin.com";
  const timestamp = new Date().toISOString();

  return `${domain} wants you to sign in with your Solana account:
${params.address}

Sign in to VLink

Nonce: ${params.nonce}
Issued At: ${timestamp}`;
}

/**
 * Verify Solana wallet signature
 */
export function verifySolanaSignature(params: {
  message: string;
  signature: string;
  publicKey: string;
}): { success: boolean; error?: string } {
  try {
    // Decode the signature and public key from base58
    const signatureBytes = bs58.decode(params.signature);
    const publicKeyBytes = bs58.decode(params.publicKey);

    // Message needs to be encoded
    const messageBytes = new TextEncoder().encode(params.message);

    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    return { success: true };
  } catch (error) {
    console.error("Solana signature verification error:", error);
    return { success: false, error: "Signature verification failed" };
  }
}

/**
 * Verify wallet signature and create/update user
 */
export async function authenticateWallet(params: {
  address: string;
  chainId: string;
  chainType: ChainType;
  signature: string;
  message: string;
  nonce: string;
}): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  // Verify the stored nonce matches
  const storedNonce = getNonce(params.address);
  if (!storedNonce || storedNonce !== params.nonce) {
    return { success: false, error: "Invalid or expired nonce" };
  }

  // Verify signature based on chain type
  let verified = false;

  if (params.chainType === "EVM") {
    const result = await verifyEvmSignature({
      message: params.message,
      signature: params.signature,
      nonce: params.nonce,
    });
    if (result.success && result.address?.toLowerCase() === params.address.toLowerCase()) {
      verified = true;
    } else {
      return { success: false, error: result.error || "Address mismatch" };
    }
  } else if (params.chainType === "SOLANA") {
    const result = verifySolanaSignature({
      message: params.message,
      signature: params.signature,
      publicKey: params.address,
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    verified = true;
  }

  if (!verified) {
    return { success: false, error: "Unsupported chain type" };
  }

  // Clear used nonce
  clearNonce(params.address);

  // Find existing wallet
  const wallet = await prisma.wallet.findUnique({
    where: {
      address_chainId: {
        address: params.address.toLowerCase(),
        chainId: params.chainId,
      },
    },
    include: { user: true },
  });

  if (wallet) {
    // Existing wallet - update verification status
    if (!wallet.isVerified) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { isVerified: true, verifiedAt: new Date() },
      });
    }
    return { success: true, userId: wallet.userId };
  }

  // New wallet - create user and wallet
  const user = await prisma.user.create({
    data: {
      role: "CONSUMER",
      wallets: {
        create: {
          address: params.address.toLowerCase(),
          chainId: params.chainId,
          chainType: params.chainType,
          isDefault: true,
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  return { success: true, userId: user.id };
}

/**
 * Link wallet to existing user
 */
export async function linkWallet(params: {
  userId: string;
  address: string;
  chainId: string;
  chainType: ChainType;
  signature: string;
  message: string;
  nonce: string;
}): Promise<{
  success: boolean;
  walletId?: string;
  error?: string;
}> {
  // Verify the stored nonce
  const storedNonce = getNonce(params.address);
  if (!storedNonce || storedNonce !== params.nonce) {
    return { success: false, error: "Invalid or expired nonce" };
  }

  // Verify signature
  let verified = false;

  if (params.chainType === "EVM") {
    const result = await verifyEvmSignature({
      message: params.message,
      signature: params.signature,
      nonce: params.nonce,
    });
    verified = result.success && result.address?.toLowerCase() === params.address.toLowerCase();
  } else if (params.chainType === "SOLANA") {
    const result = verifySolanaSignature({
      message: params.message,
      signature: params.signature,
      publicKey: params.address,
    });
    verified = result.success;
  }

  if (!verified) {
    return { success: false, error: "Signature verification failed" };
  }

  clearNonce(params.address);

  // Check if wallet already exists
  const existingWallet = await prisma.wallet.findUnique({
    where: {
      address_chainId: {
        address: params.address.toLowerCase(),
        chainId: params.chainId,
      },
    },
  });

  if (existingWallet) {
    if (existingWallet.userId === params.userId) {
      return { success: true, walletId: existingWallet.id };
    }
    return { success: false, error: "Wallet already linked to another account" };
  }

  // Create wallet
  const wallet = await prisma.wallet.create({
    data: {
      userId: params.userId,
      address: params.address.toLowerCase(),
      chainId: params.chainId,
      chainType: params.chainType,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  return { success: true, walletId: wallet.id };
}
