import React from "react";
import Navbar from "../components/Navbar";

const MyTicketsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
      <Navbar />
      <div className="pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#FFFFFF]">My Tickets</h1>
          <p className="text-xl text-[#AAAAAA]">
            View and manage your NFT tickets
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyTicketsPage;
