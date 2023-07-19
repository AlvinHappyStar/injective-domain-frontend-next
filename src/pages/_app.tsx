import Layout from "@/components/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SigningCosmWasmProvider } from '../context/cosmwasm'

import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SigningCosmWasmProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer autoClose={3000} />
    </SigningCosmWasmProvider>
    
  );
}
