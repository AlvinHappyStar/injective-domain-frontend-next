import React,{useState, useEffect} from "react";

import { useSigningClient } from '../context/cosmwasm'

type Props = {};

const ConnectWallet = (props: Props) => {
  const {
    walletAddress,
    connectWallet,
    signingClient,
    disconnect,
    getConfig,
    getBalances,
  } = useSigningClient()

  const btnText = walletAddress
    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-3)}`
    : "Connect Wallet";

  const handleConnect = () => {
    if (walletAddress.length === 0) {
      connectWallet(false)
    } else {
      disconnect()
    }
  }

  useEffect(() => {
    let account = localStorage.getItem("address")
    if (account != null) {
      connectWallet(true)
    }
  }, [])

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0)
      return
    getConfig()
    getBalances()
  }, [walletAddress, signingClient, ])

  return (
    <button
      onClick={handleConnect}
      className='btn'
    >
      {btnText}
    </button>
  );
};

export default ConnectWallet;
