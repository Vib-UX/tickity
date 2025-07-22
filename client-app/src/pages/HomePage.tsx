import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Shield, Sparkles, Camera } from "lucide-react";
import Navbar from "../components/Navbar";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "../config/thirdweb";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-[#00FF7F]" />,
      title: "NFT Ticketing",
      description:
        "Secure ERC-721 tickets with dynamic QR codes and anti-scalping protection",
    },
    {
      icon: <Camera className="w-8 h-8 text-[#00FF7F]" />,
      title: "AR Experience",
      description:
        "Immersive augmented reality activation and venue navigation",
    },
    {
      icon: <Shield className="w-8 h-8 text-[#00FF7F]" />,
      title: "Secure Access",
      description:
        "Multi-layer authentication with social login and geo-verification",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-[#00FF7F]" />,
      title: "POAP Collection",
      description: "Instant gasless minting of Proof of Attendance tokens",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FF7F]/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-[#FFFFFF]">The </span>
              <span className="text-[#00FF7F]">fast, fair</span>
              <span className="text-[#FFFFFF]"> and </span>
              <span className="text-[#00FF7F]">(nearly) free</span>
              <span className="text-[#FFFFFF]"> ticketing</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#AAAAAA]">
              Bridge assets, swap instantly, and explore events all with low
              fees and fast transactions on Etherlink
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ConnectButton client={client} wallets={wallets} />
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-4 border-2 border-[#00FF7F] text-[#FFFFFF] hover:bg-[#00FF7F] hover:text-[#1A1A1A] rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Explore Events
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#FFFFFF]">
              Why Choose Tickity?
            </h2>
            <p className="text-xl text-[#AAAAAA] max-w-2xl mx-auto">
              Experience the future of event ticketing with blockchain
              technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6 hover:border-[#00FF7F] transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-[#FFFFFF]">
                  {feature.title}
                </h3>
                <p className="text-[#AAAAAA]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#00FF7F]/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-[#FFFFFF]">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-[#AAAAAA] mb-8">
              Join thousands of event enthusiasts already using Tickity for
              seamless, secure, and immersive event experiences.
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-8 py-4 bg-[#00FF7F] text-[#1A1A1A] hover:bg-[#00E676] rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#333333]/20 backdrop-blur-sm py-12 px-6 border-t border-[#333333]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-[#00FF7F] rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#1A1A1A]" />
            </div>
            <span className="text-xl font-bold text-[#FFFFFF]">Tickity</span>
          </div>
          <p className="text-[#AAAAAA]">
            Built with ❤️ for the future of event experiences on Etherlink
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
