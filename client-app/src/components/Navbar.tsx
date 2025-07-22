import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sparkles, Ticket, Calendar, User } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "../config/thirdweb";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Events", path: "/events", icon: <Calendar className="w-4 h-4" /> },
    {
      name: "My Tickets",
      path: "/my-tickets",
      icon: <Ticket className="w-4 h-4" />,
    },
    { name: "Profile", path: "/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#00FF7F] rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#1A1A1A]" />
            </div>
            <span className="text-xl font-bold text-[#FFFFFF]">Tickity</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 text-[#AAAAAA] hover:text-[#FFFFFF] transition-colors duration-200"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            <ConnectButton client={client} wallets={wallets} />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#AAAAAA] hover:text-[#FFFFFF] hover:bg-[#333333] transition-colors duration-200"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-[#333333]"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-[#AAAAAA] hover:text-[#FFFFFF] hover:bg-[#333333] rounded-lg transition-colors duration-200"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="px-4 pt-4 border-t border-[#333333]">
                <ConnectButton client={client} wallets={wallets} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
