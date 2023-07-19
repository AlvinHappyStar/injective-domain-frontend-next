import { ChainGrpcWasmApi } from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { MsgBroadcaster, Wallet, WalletStrategy } from "@injectivelabs/wallet-ts";
import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";

export const NETWORK = Network.TestnetK8s;
export const ENDPOINTS = getNetworkEndpoints(NETWORK);

export const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);

const ALCHEMY_GOERLI_KEY = process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_KEY;

const alchemyRpcEndpoint = `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`;
const alchemyWsRpcEndpoint = `wss://eth-goerli.ws.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`;

const walletStrategy = new WalletStrategy({
  chainId: ChainId.Testnet,
  ethereumOptions: {
    ethereumChainId: EthereumChainId.Goerli,
    rpcUrl: alchemyRpcEndpoint,
  },
  wallet: Wallet.Keplr,
});

export const msgBroadcastClient = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
});
