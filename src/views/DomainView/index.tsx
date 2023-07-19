
import React, { FC, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { useSigningClient } from '../../context/cosmwasm'

export const DomainView: FC = ({ }) => {

  const [currentDomainName, setCurrentDomainName] = useState("");
  const [currentBetPrice, setCurrentPrice] = useState(10);
  const [duration, setCurrentDuration] = useState(1);

  const {
    walletAddress,
    signingClient,
    nativeBalance,
    executeRegister
  } = useSigningClient()

  useEffect(() => {
  }, [])


  return (
    <div className="flex flex-col justify-center items-center pt-[150px] mb-[20px] sm:mb-[10px]">
      <h1 className="text-white text-[90px] sm:text-[56px] px-20 w-fit-content">
        My Domains
      </h1>

    </div>
  );
};
