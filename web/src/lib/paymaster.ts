import { arbitrumSepolia, baseSepolia } from "viem/chains";

/**
 * @notice Pimlico API configuration key
 */
export const PIMLICO_API_KEY =
  process.env.NEXT_PUBLIC_PIMLICO_API_KEY || "pim_demo_api_key_placeholder";

/**
 * @notice Returns the network subdomain slug corresponding to Pimlico's standard endpoints
 */
function getPimlicoNetworkSlug(chainId: number): string | null {
  switch (chainId) {
    case arbitrumSepolia.id:
      return "arbitrum-sepolia";
    case baseSepolia.id:
      return "base-sepolia";
    default:
      return null;
  }
}

/**
 * @notice Generates the Pimlico ERC-4337 Bundler RPC endpoint
 */
export function getPimlicoBundlerRpcUrl(chainId: number): string | null {
  const network = getPimlicoNetworkSlug(chainId);
  if (!network) return null;
  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${PIMLICO_API_KEY}`;
}

/**
 * @notice Generates the Pimlico Paymaster sponsorship RPC endpoint
 */
export function getPimlicoPaymasterRpcUrl(chainId: number): string | null {
  const network = getPimlicoNetworkSlug(chainId);
  if (!network) return null;
  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${PIMLICO_API_KEY}`;
}

/**
 * @notice Checks if gasless meta-transactions are enabled for the current chain
 */
export function isGaslessSupported(chainId?: number): boolean {
  if (!chainId) return false;
  return chainId === arbitrumSepolia.id || chainId === baseSepolia.id;
}

/**
 * @notice Mock or real Paymaster sponsorship payload builder
 * @dev Used by useGaslessAction hook to sponsor UserOperations or execute gasless relayed transactions
 */
export interface GaslessSponsorshipRequest {
  sender: string;
  targetContract: string;
  callData: string;
  chainId: number;
}

export interface GaslessSponsorshipResponse {
  sponsored: boolean;
  sponsorTxHash?: string;
  userOpHash?: string;
  errorMessage?: string;
}

/**
 * @notice Submits a gasless sponsorship intent to the Paymaster service
 */
export async function requestGaslessSponsorship(
  request: GaslessSponsorshipRequest
): Promise<GaslessSponsorshipResponse> {
  const paymasterUrl = getPimlicoPaymasterRpcUrl(request.chainId);

  if (!paymasterUrl) {
    return {
      sponsored: false,
      errorMessage: `Gasless transactions are not supported on chainId ${request.chainId}`,
    };
  }

  try {
    // If running in development without a live Pimlico API key, gracefully simulate sponsorship
    if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY) {
      console.warn(
        "[Paymaster] NEXT_PUBLIC_PIMLICO_API_KEY not configured. Running in simulated Gasless mode."
      );
      return {
        sponsored: true,
        sponsorTxHash: "0xsimulated_paymaster_sponsorship_hash",
      };
    }

    const response = await fetch(paymasterUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "pm_sponsorUserOperation",
        params: [
          {
            sender: request.sender,
            target: request.targetContract,
            data: request.callData,
          },
          {
            entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032", // ERC-4337 v0.7 EntryPoint
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        sponsored: false,
        errorMessage: data.error.message || "Paymaster rejected sponsorship request",
      };
    }

    return {
      sponsored: true,
      userOpHash: data.result?.paymasterAndData || "0x",
    };
  } catch (error: any) {
    return {
      sponsored: false,
      errorMessage: error.message || "Failed to communicate with Paymaster service",
    };
  }
}