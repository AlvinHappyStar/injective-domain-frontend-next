
import React, { FC, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { useSigningClient } from '../../context/cosmwasm'
import { useRouter } from "next/router";

const products = [
  { price: 10, duration: 1 },
  { price: 20, duration: 2 },
  { price: 50, duration: 5 },
  { price: 100, duration: 10 },
];

export const HomeView: FC = ({ }) => {

  const router = useRouter();

  const [currentDomainName, setCurrentDomainName] = useState("");
  const [currentBetPrice, setCurrentPrice] = useState(10);
  const [duration, setCurrentDuration] = useState(1);

  const {
    walletAddress,
    signingClient,
    nativeBalance,
    executeRegister
  } = useSigningClient()


  const handleRegister = async () => {
    console.log("register==>curretnDomainName:", currentDomainName);

    if (currentDomainName.length == 0) {
      toast.warning("Domain Name is required");
      return;
    }

    if (currentBetPrice <= 0) {
      toast.warning("Please select price.");
      return;
    }

    if (!signingClient || walletAddress.length === 0) {
      toast.error('Please connect wallet first');
      return
    }

    if (nativeBalance < currentBetPrice) {
      toast.error("Insufficient Funds");
      return
    }

    console.log("price:", currentBetPrice); 
    console.log("duration:", duration);
    await executeRegister(currentDomainName, duration, currentBetPrice);

    router.push('/domains');

  }  

  const handleDuration = (e: { target: { value: string }}) => {
    setCurrentDuration(parseInt(e.target.value));
  };

  useEffect(() => {
    for (let i = 0; i < products.length; i++) {
      if (products[i].duration === duration) {
        setCurrentPrice(products[i].price);
        break;
      }
    }
  }, [duration])


  return (
    <div className="flex flex-col justify-center items-center pt-[150px] mb-[20px] sm:mb-[10px]">
      <h1 className="text-white text-[90px] sm:text-[56px] px-20 w-fit-content">
        Injective Name Service
      </h1>
      <div className="flex justify-center items-center pt-10 sm:mt-[40px] mb-[20px] sm:mb-[10px]">
        <select
          className="bg-black px-10 rounded-md text-[16px] h-[40px] text-white mr-2 border-[#a0b0c0]"
          onChange={handleDuration}
          value={duration.toString()}>
          <option value="1">1 Year</option>
          <option value="2">2 Year</option>
          <option value="5">5 Year</option>
          <option value="10">10 Year</option>
        </select>
        <input
          type="text"
          placeholder="Search Domain Name"
          className="sm:w-[50px] md:w-[600px] h-[40px] text-[20px] sm:text-[16px] border-2 border-[#a0b0c0] rounded-sm text-[#a0b0c0] px-4 bg-transparent"
          value={currentDomainName}
          onChange={(e) => setCurrentDomainName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRegister();
            }
          }}
        />
        <button className="ml-2 btn">
          Register
        </button>
      </div>

    </div>
  );
};
