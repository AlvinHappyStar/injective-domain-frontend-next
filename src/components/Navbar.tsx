import React from "react";
import ConnectWallet from "./ConnectWallet";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className='fixed bg-[#00000080] w-full h-20 z-10'>
      <div className="h-full flex flex-row items-center justify-between px-4">
        <div className = "flex h-[50px] sm:px-4">
          <img alt="" src="./logo192.png"/>
        </div>
        <ConnectWallet />
      </div>
    </div>
  );
};

export default Navbar;
