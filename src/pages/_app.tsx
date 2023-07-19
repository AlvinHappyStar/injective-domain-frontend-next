import Layout from "@/components/Layout";
import CounterContextProvider from "@/context/CounterContextProvider";
import WalletContextProvider from "@/context/WalletContextProvider";

import { SigningCosmWasmProvider } from '../context/cosmwasm'

import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SigningCosmWasmProvider>
      <CounterContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CounterContextProvider>
    </SigningCosmWasmProvider>
  );
}
