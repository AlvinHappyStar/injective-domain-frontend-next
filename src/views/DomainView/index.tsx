
import React, { FC, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { useSigningClient } from '../../context/cosmwasm'

export const DomainView: FC = ({ }) => {

  const [domainlist, setDomainList] = useState([]);

  const {
    signingClient,
    walletAddress,
    fetchDomains,
    domains,
  } = useSigningClient()

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {      
      setDomainList([])
      return
    }
    
    fetchDomains(walletAddress);
  }, [signingClient, walletAddress])

  useEffect(() => {
    if (domains === null) {
      return
    }
    setDomainList(domains)
  }, [domains])

  type Props = {
    seconds: string;
};

  const DateCell = ({seconds}:Props) => {
    const [formattedDate, setFormattedDate] = useState('');
  
    useEffect(() => {
      const date = new Date(parseInt(seconds) * 1000);
  
      console.log("second", seconds)
      const formattedDate = date.toLocaleDateString();
  
      setFormattedDate(formattedDate);
    }, [seconds]);
  
    return <td className="py-3 text-center">{formattedDate}</td>;
  };

  return (
    <div className="flex flex-col justify-center items-center pt-[150px] mb-[20px] sm:mb-[10px]">
      <h1 className="text-white text-[90px] sm:text-[56px] px-20 w-fit-content">
        My Domains
      </h1>
      <div className="flex flex-col justify-center items-center pt-10 w-96 sm:mt-[40px] mb-[20px] sm:mb-[10px]">
        <table className="flex flex-col table-fixed w-full">
          <thead></thead>
          <tbody>
            {
              domainlist.map((s: any) => (
                <tr className="flex justify-between bg-[#00000080] text-white mb-2 px-5">
                  <td className="py-3 text-center">{s.name}</td>
                  <DateCell seconds={s.expired}/>
                </tr>
              ))
            }
          </tbody>

        </table>
      </div>
    </div>
  );
};
