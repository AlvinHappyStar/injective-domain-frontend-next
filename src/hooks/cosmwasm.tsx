import { useState } from 'react'
import { connectKeplr } from '../services/keplr'
import { SigningCosmWasmClient, CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import {
  convertMicroDenomToDenom,
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../util/conversion'

import { chainGrpcWasmApi, msgBroadcastClient } from '../services/injective'
import {
  MsgExecuteContractCompat,
  fromBase64,
  toBase64,
} from "@injectivelabs/sdk-ts";

import { toast } from "react-toastify";
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { coin } from '@cosmjs/launchpad'


export interface ISigningCosmWasmClientContext {
  walletAddress: string
  client: CosmWasmClient | null
  signingClient: SigningCosmWasmClient | null
  loading: boolean
  error: any
  connectWallet: Function,
  disconnect: Function,

  getConfig: Function,
  config: any,
  isAdmin: boolean,

  getBalances: Function,
  nativeBalanceStr: string,
  nativeBalance: number,

  executeRegister: Function,

  fetchName: Function,
  fetchDomains: Function,

  domains: any,

}

export const PUBLIC_CHAIN_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
export const PUBLIC_CHAIN_REST_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_REST_ENDPOINT || ''
export const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || ''
export const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'inj'
export const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export const defaultFee = {
  amount: [],
  gas: "400000",
}


export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [client, setClient] = useState<CosmWasmClient | null>(null)
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null)

  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [nativeBalanceStr, setNativeBalanceStr] = useState('')
  const [nativeBalance, setNativeBalance] = useState(0)

  const [config, setConfig] = useState({ owner: '', enabled: true, denom: null, treasury_amount: 0, flip_count: 0 })
  const [domains, setDomains] = useState([])

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    connect & disconnect   //////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const showNotification = false;
  const notify = (flag: boolean, str: String) => {
    if (!showNotification)
      return;

    if (flag)
      NotificationManager.success(str)
    else
      NotificationManager.error(str)
  }
  const connectWallet = async (inBackground: boolean) => {
    if (!inBackground)
      setLoading(true)

    try {
      await connectKeplr()

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID)

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSignerOnlyAmino(
        PUBLIC_CHAIN_ID
      )

      // make client
      setClient(
        await CosmWasmClient.connect(PUBLIC_CHAIN_RPC_ENDPOINT)
      )

      // make client
      setSigningClient(
        await SigningCosmWasmClient.connectWithSigner(
          PUBLIC_CHAIN_RPC_ENDPOINT,
          offlineSigner
        )
      )

      // get user address
      const [{ address }] = await offlineSigner.getAccounts()
      setWalletAddress(address)

      localStorage.setItem("address", address)

      if (!inBackground) {
        setLoading(false)
        notify(true, "Connected Successfully")
      }
    } catch (error) {
      notify(false, `Connect error : ${error}`)
      if (!inBackground) {
        setLoading(false)
      }
    }
  }

  const disconnect = () => {
    if (signingClient) {
      localStorage.removeItem("address")
      signingClient.disconnect()

    }
    setIsAdmin(false)
    setWalletAddress('')
    setSigningClient(null)
    setLoading(false)
    notify(true, `Disconnected successfully`)
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    global variables    /////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const getBalances = async () => {
    setLoading(true)
    try {
      const objectNative: JsonObject = await signingClient.getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      setNativeBalanceStr(`${convertMicroDenomToDenom(objectNative.amount)} ${convertFromMicroDenom(objectNative.denom)}`)
      setNativeBalance(convertMicroDenomToDenom(objectNative.amount))
      setLoading(false)
      notify(true, `Successfully got balances`)
    } catch (error) {
      setLoading(false)
      notify(false, `GetBalances error : ${error}`)
    }
  }

  const getConfig = async () => {

    setLoading(true)
    try {
      const response: JsonObject = await signingClient.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, {
        config: {}
      })
      setConfig(response)
      setIsAdmin(response.owner == walletAddress)
      setLoading(false)
      notify(true, `Successfully got config`)
    } catch (error) {
      setLoading(false)
      notify(false, `getConfig error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Execute Flip and Remove Treasury     ////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const executeRegister = async (name: string, duration: number, price: number) => {
    setLoading(true)
    const isExist = await fetchName(name);
    if (!isExist) {
      try {

        const msg = MsgExecuteContractCompat.fromJSON({
          contractAddress: PUBLIC_CONTRACT_ADDRESS,
          sender: walletAddress,
          msg: {
            register: {
              name: name,
              duration: duration,
            },
          },
          funds: {
            denom: PUBLIC_STAKING_DENOM,
            amount: convertDenomToMicroDenom(price),
          }
        });

        const result = await msgBroadcastClient.broadcast({
          msgs: msg,
          injectiveAddress: walletAddress,
        });

        setLoading(false)
        getBalances()
        if (result && result.txHash) {

          const response: JsonObject = result.rawLog;
          let log_json = JSON.parse(response)
          let wasm_events = log_json[0].events[5].attributes
          console.log(wasm_events[3].value);

          if (wasm_events[3].value === name)
            toast.success("Register Success:" + result.txHash);
        }

      } catch (error) {
        setLoading(false)
        notify(false, `Flip error : ${error}`)
        toast.error(error);
      }
    }
    else
      toast.warn("Name is Exist");
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Get History            //////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const fetchName = async (name: string) => {
    setLoading(true)
    try {
      const response = (await chainGrpcWasmApi.fetchSmartContractState(
        PUBLIC_CONTRACT_ADDRESS,
        toBase64({
          resolve_record: {
            name: name,
          }
        })
      )) as unknown as {data: string};

      const { address } = fromBase64(response.data) as { address: string };

      console.log("address:", address);

      setLoading(false);

      if (address)
        return true;
      else
        return false;

    } catch (e) {
      toast.error(e);
    }
  }

  const fetchDomains = async (addr: string) => {
    setLoading(true)
    try {
      const response = (await chainGrpcWasmApi.fetchSmartContractState(
        PUBLIC_CONTRACT_ADDRESS,
        toBase64({
          resolve_addr: {
            address: addr,
          }
        })
      )) as unknown as {data: string};

      const { list } = fromBase64(response.data) as { list : never[]};

      setDomains(list);

      console.log("list", list);
      console.log("domains", domains);
      setLoading(false);

      
    } catch (e) {
      toast.error(e);
    }
  }

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
    client,
    getConfig,
    config,
    isAdmin,


    getBalances,
    nativeBalanceStr,
    nativeBalance,

    executeRegister,

    fetchName,
    fetchDomains,

    domains,
  }
}