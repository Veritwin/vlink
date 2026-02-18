"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { parseUnits } from "viem";
import { Transaction, PublicKey } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn, formatCurrency } from "@/lib/utils";
import { ChainIcon, chainData, type ChainId } from "@/components/icons";
import { TokenIcon, tokenData, type TokenId } from "@/components/icons";
import {
  getChainId,
  getTokenAddress,
  TOKEN_METADATA,
  erc20Abi,
} from "@/lib/chains/contracts";
import {
  getSolanaTokenMint,
  getAssociatedTokenAddress,
  SOLANA_TOKEN_METADATA,
} from "@/lib/chains/solana";
import {
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string> | null;
  status: string;
  expiresAt: string;
  merchant: {
    name: string;
    logoUrl?: string;
  };
}

interface PresaleMetadata {
  tokenName: string;
  pricePerToken: string;
  tokenQuantity: string;
}

type PaymentStatus = "loading" | "ready" | "connecting" | "confirming" | "processing" | "success" | "error" | "expired";

const SUPPORTED_CHAINS: ChainId[] = ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "bnb", "solana"];
const SUPPORTED_TOKENS: TokenId[] = ["usdc", "usdt", "dai", "frax", "pyusd", "tusd"];

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const intentId = params.intentId as string;
  const isPopupMode = searchParams.get("mode") === "popup";

  // State
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [error, setError] = useState<string>("");
  const [selectedChain, setSelectedChain] = useState<ChainId>("base");
  const [selectedToken, setSelectedToken] = useState<TokenId>("usdc");
  const [isChainOpen, setIsChainOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  // EVM wallet
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const evmChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: writeData, isPending: isWritePending } = useWriteContract();

  // Solana wallet
  const { publicKey, connected: isSolanaConnected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Wait for EVM transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Determine if using Solana
  const isSolana = selectedChain === "solana";
  const isConnected = isSolana ? isSolanaConnected : isEvmConnected;
  const walletAddress = isSolana ? publicKey?.toBase58() : evmAddress;

  // Extract presale metadata
  const presale: PresaleMetadata | null = paymentIntent?.metadata?.presale
    ? (typeof paymentIntent.metadata.presale === "string"
        ? JSON.parse(paymentIntent.metadata.presale)
        : paymentIntent.metadata.presale as unknown as PresaleMetadata)
    : null;

  // Send postMessage to parent in popup mode
  const sendToOpener = useCallback((type: string, data?: Record<string, unknown>) => {
    if (!isPopupMode || !window.opener) return;
    try {
      window.opener.postMessage({ type, data }, "*");
    } catch {
      // opener may have been closed
    }
  }, [isPopupMode]);

  // Send close message on unmount in popup mode
  useEffect(() => {
    if (!isPopupMode) return;
    return () => {
      sendToOpener("vlink:payment_close");
    };
  }, [isPopupMode, sendToOpener]);

  // Fetch payment intent
  useEffect(() => {
    async function fetchIntent() {
      try {
        const response = await fetch(`/api/payments/${intentId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error?.message || "Payment not found");
          setStatus("error");
          return;
        }

        setPaymentIntent(data.data);

        if (data.data.status === "expired") {
          setStatus("expired");
        } else if (data.data.status === "confirmed") {
          setStatus("success");
        } else {
          setStatus("ready");
        }
      } catch (err) {
        setError("Failed to load payment details");
        setStatus("error");
      }
    }

    fetchIntent();
  }, [intentId]);

  // Check expiration
  useEffect(() => {
    if (!paymentIntent) return;

    const checkExpiry = () => {
      if (new Date(paymentIntent.expiresAt) < new Date()) {
        setStatus("expired");
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [paymentIntent]);

  // Handle EVM transaction confirmation
  useEffect(() => {
    if (isConfirmed && writeData) {
      confirmPayment(writeData);
    }
  }, [isConfirmed, writeData]);

  // Confirm payment with backend
  const confirmPayment = useCallback(async (hash: string) => {
    setStatus("processing");
    try {
      const response = await fetch(`/api/payments/${intentId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain: selectedChain,
          token: selectedToken,
          senderAddress: walletAddress,
          transactionHash: hash,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.status === "confirmed") {
        setStatus("success");
        setTxHash(hash);
        sendToOpener("vlink:payment_success", {
          paymentId: data.data.id,
          intentId: data.data.intentId,
          transactionHash: hash,
          chainId: data.data.chainId,
          tokenId: data.data.tokenId,
        });
      } else {
        // Still processing - poll for confirmation
        pollForConfirmation(hash);
      }
    } catch (err) {
      setError("Failed to confirm payment");
      setStatus("error");
      sendToOpener("vlink:payment_error", { code: "CONFIRM_FAILED", message: "Failed to confirm payment" });
    }
  }, [intentId, selectedChain, selectedToken, walletAddress, sendToOpener]);

  // Poll for confirmation
  const pollForConfirmation = useCallback(async (hash: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`/api/payments/${intentId}`);
        const data = await response.json();

        if (data.data?.status === "confirmed") {
          setStatus("success");
          setTxHash(hash);
          sendToOpener("vlink:payment_success", {
            paymentId: data.data.payment?.id,
            intentId,
            transactionHash: hash,
          });
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError("Payment confirmation timed out. Please check your transaction.");
          setStatus("error");
          sendToOpener("vlink:payment_error", { code: "TIMEOUT", message: "Payment confirmation timed out" });
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    poll();
  }, [intentId, sendToOpener]);

  // Handle EVM payment
  const handleEvmPayment = useCallback(async () => {
    if (!paymentIntent || !evmAddress) return;

    // Get token address
    const tokenAddress = getTokenAddress(selectedToken, selectedChain);
    if (!tokenAddress) {
      setError(`${selectedToken.toUpperCase()} not available on ${chainData[selectedChain].name}`);
      return;
    }

    // Check if on correct chain
    const targetChainId = getChainId(selectedChain);
    if (targetChainId && evmChainId !== targetChainId) {
      switchChain?.({ chainId: targetChainId });
      return;
    }

    // Get token decimals and calculate amount
    const decimals = TOKEN_METADATA[selectedToken]?.decimals || 6;
    const amount = parseUnits((paymentIntent.amount / 100).toString(), decimals);

    // Send to merchant's configured receiving address
    const recipientAddress = (paymentIntent as any).merchant?.receivingAddress || evmAddress;

    setStatus("confirming");

    try {
      writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, amount],
      });
    } catch (err) {
      setError("Transaction failed");
      setStatus("ready");
    }
  }, [paymentIntent, evmAddress, selectedToken, selectedChain, evmChainId, switchChain, writeContract]);

  // Handle Solana payment
  const handleSolanaPayment = useCallback(async () => {
    if (!paymentIntent || !publicKey) return;

    const mint = getSolanaTokenMint(selectedToken);
    if (!mint) {
      setError(`${selectedToken.toUpperCase()} not available on Solana`);
      return;
    }

    // Get token decimals and calculate amount
    const decimals = SOLANA_TOKEN_METADATA[selectedToken]?.decimals || 6;
    const amount = BigInt(Math.floor((paymentIntent.amount / 100) * Math.pow(10, decimals)));

    // Send to merchant's configured receiving address (Solana)
    const recipientAddress = (paymentIntent as any).merchant?.receivingAddress
      ? new PublicKey((paymentIntent as any).merchant.receivingAddress)
      : publicKey;

    setStatus("confirming");

    try {
      const senderAta = getAssociatedTokenAddressSync(mint, publicKey);
      const recipientAta = getAssociatedTokenAddressSync(mint, recipientAddress);

      const instruction = createTransferInstruction(
        senderAta,
        recipientAta,
        publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      confirmPayment(signature);
    } catch (err) {
      console.error("Solana transaction error:", err);
      setError("Transaction failed");
      setStatus("ready");
    }
  }, [paymentIntent, publicKey, selectedToken, connection, sendTransaction, confirmPayment]);

  // Handle payment
  const handlePayment = () => {
    if (isSolana) {
      handleSolanaPayment();
    } else {
      handleEvmPayment();
    }
  };

  // Time remaining
  const getTimeRemaining = () => {
    if (!paymentIntent) return "";
    const diff = new Date(paymentIntent.expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Popup mode wrapper
  const pageClass = isPopupMode
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4"
    : "min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4";

  // Loading state
  if (status === "loading") {
    return (
      <div className={pageClass}>
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className={pageClass}>
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center shadow-soft">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Payment Error
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  // Expired state
  if (status === "expired") {
    return (
      <div className={pageClass}>
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center shadow-soft">
          <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Payment Expired
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            This payment link has expired. Please request a new one from the merchant.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className={pageClass}>
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center shadow-soft">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Payment Complete
          </h1>
          {presale ? (
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              You purchased {Number(presale.tokenQuantity).toLocaleString()} {presale.tokenName} Tokens
            </p>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {formatCurrency((paymentIntent?.amount || 0) / 100)} paid to {paymentIntent?.merchant.name}
            </p>
          )}
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-500 hover:underline"
            >
              View transaction <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {isPopupMode && (
            <p className="text-xs text-neutral-400 mt-4">This window will close automatically...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            Pay {paymentIntent?.merchant.name}
          </h1>
          {presale ? (
            <p className="text-neutral-500 dark:text-neutral-400">
              Purchasing {Number(presale.tokenQuantity).toLocaleString()} {presale.tokenName} Tokens
            </p>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              {paymentIntent?.description || "Complete your payment"}
            </p>
          )}
        </div>

        {/* Payment Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-soft">
          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency((paymentIntent?.amount || 0) / 100)}
            </p>
            {presale && (
              <p className="text-sm font-medium text-amber-500 mt-1">
                {Number(presale.tokenQuantity).toLocaleString()} {presale.tokenName} @ ${presale.pricePerToken}
              </p>
            )}
            <p className="text-sm text-neutral-500 flex items-center justify-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              Expires in {getTimeRemaining()}
            </p>
          </div>

          {/* Chain Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Network
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsChainOpen(!isChainOpen)}
                className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-accent-300 dark:hover:border-accent-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ChainIcon chainId={selectedChain} size={24} />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {chainData[selectedChain].name}
                  </span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-neutral-400 transition-transform", isChainOpen && "rotate-180")} />
              </button>

              {isChainOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-medium z-50 overflow-hidden">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <button
                        key={chain}
                        type="button"
                        onClick={() => { setSelectedChain(chain); setIsChainOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                          chain === selectedChain ? "bg-accent-50 dark:bg-accent-900/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                        )}
                      >
                        <ChainIcon chainId={chain} size={20} />
                        <span className="font-medium text-neutral-900 dark:text-white text-sm">
                          {chainData[chain].name}
                        </span>
                        {chain === selectedChain && <Check className="w-4 h-4 text-accent-500 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Pay with
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTokenOpen(!isTokenOpen)}
                className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-accent-300 dark:hover:border-accent-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <TokenIcon tokenId={selectedToken} size={24} />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {tokenData[selectedToken].symbol}
                  </span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-neutral-400 transition-transform", isTokenOpen && "rotate-180")} />
              </button>

              {isTokenOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-medium z-50 overflow-hidden">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {SUPPORTED_TOKENS.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => { setSelectedToken(token); setIsTokenOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                          token === selectedToken ? "bg-accent-50 dark:bg-accent-900/20" : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                        )}
                      >
                        <TokenIcon tokenId={token} size={20} />
                        <span className="font-medium text-neutral-900 dark:text-white text-sm">
                          {tokenData[token].symbol}
                        </span>
                        {token === selectedToken && <Check className="w-4 h-4 text-accent-500 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connect / Pay Button */}
          {!isConnected ? (
            <div className="space-y-3">
              {isSolana ? (
                <WalletMultiButton className="w-full !bg-primary-500 !rounded-xl !h-14" />
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full btn-primary py-4 text-lg"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={status === "confirming" || status === "processing" || isWritePending || isConfirming}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(status === "confirming" || isWritePending) && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirm in wallet...
                </>
              )}
              {(status === "processing" || isConfirming) && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              )}
              {status === "ready" && !isWritePending && !isConfirming && (
                <>Pay {formatCurrency((paymentIntent?.amount || 0) / 100)}</>
              )}
            </button>
          )}

          {/* Connected Address */}
          {isConnected && walletAddress && (
            <p className="text-xs text-neutral-500 text-center mt-4">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 mt-4">
          Powered by VLink
        </p>
      </div>
    </div>
  );
}
