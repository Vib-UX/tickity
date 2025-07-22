import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text3D } from "@react-three/drei";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
// TODO: Migrate contract and wallet hooks to new thirdweb/react SDK
import { Camera, X, Sparkles, Award, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

// Webcam background component
const WebcamBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        toast.error("Could not access camera");
      }
    };

    startCamera();

    return () => {
      const currentVideoRef = videoRef.current;
      if (currentVideoRef && currentVideoRef.srcObject) {
        const stream = currentVideoRef.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="fixed top-0 left-0 w-full h-full object-cover z-0"
    />
  );
};

// 3D Ticket NFT Model
const TicketNFTModel: React.FC = () => {
  const modelRef = useRef<any>();
  const speed = 0.01;

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += speed;
    }
  });

  const scale: [number, number, number] =
    window.innerWidth < 768 ? [1.5, 1.5, 1.5] : [2, 2, 2];
  const position: [number, number, number] =
    window.innerWidth < 768 ? [0, 0, 0] : [0, 0, 0];

  return (
    <group ref={modelRef} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#00FF7F" />
      </mesh>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.02}
        position={[-1.2, 0.3, 0.06]}
      >
        TICKITY
        <meshStandardMaterial color="#1A1A1A" />
      </Text3D>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.2}
        height={0.02}
        position={[-1.2, -0.3, 0.06]}
      >
        NFT TICKET
        <meshStandardMaterial color="#1A1A1A" />
      </Text3D>
    </group>
  );
};

// POAP Model
const POAPModel: React.FC<{ visible: boolean }> = ({ visible }) => {
  const modelRef = useRef<any>();

  useFrame(() => {
    if (modelRef.current && visible) {
      modelRef.current.rotation.y += 0.02;
    }
  });

  if (!visible) return null;

  return (
    <group ref={modelRef} position={[3, 1, 0]} scale={[0.8, 0.8, 0.8]}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#00FF7F" />
      </mesh>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.15}
        height={0.02}
        position={[-0.4, 0, 0.81]}
      >
        POAP
        <meshStandardMaterial color="#1A1A1A" />
      </Text3D>
    </group>
  );
};

const ARExperiencePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  // TODO: Migrate contract and wallet hooks to new thirdweb/react SDK
  const address = "YOUR_WALLET_ADDRESS"; // Placeholder

  const [isScanning, setIsScanning] = useState(false);
  const [showPOAP, setShowPOAP] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Thirdweb contract hooks
  // TODO: Migrate contract and wallet hooks to new thirdweb/react SDK
  const { contract: poapContract } = { contract: null, error: null }; // Placeholder
  const { mutateAsync: mintPOAP } = { mutateAsync: async () => {} }; // Placeholder

  // Mock event data
  const eventData = {
    id: eventId,
    name: "Etherlink Conference 2024",
    location: "Convention Center",
    date: "2024-03-15",
  };

  // Handle QR code scanning
  const handleScan = async () => {
    setIsScanning(true);
    toast.success("Scanning QR code...");

    // Simulate QR code verification
    setTimeout(() => {
      setIsScanning(false);
      setShowPOAP(true);
      toast.success("QR code verified! POAP available.");
    }, 2000);
  };

  // Handle POAP minting
  const handleMintPOAP = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      toast.loading("Minting POAP...");

      // Call smart contract to mint POAP
      await mintPOAP({
        args: [address, eventId, "Event Attendance POAP"],
      });

      toast.success("POAP minted successfully!");
      setShowPOAP(false);
    } catch (error) {
      console.error("Error minting POAP:", error);
      toast.error("Failed to mint POAP");
    }
  };

  // Capture AR scene
  const capturePhoto = async () => {
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
      });

      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
      toast.success("Photo captured!");
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo");
    } finally {
      setIsCapturing(false);
    }
  };

  // Download captured image
  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.download = `tickity-ar-${eventId}-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1A1A1A]">
      <WebcamBackground />

      {/* AR Canvas */}
      <div className="ar-canvas">
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 75,
          }}
          style={{
            background: "transparent",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <directionalLight position={[-10, -10, -5]} intensity={1} />

          <TicketNFTModel />
          <POAPModel visible={showPOAP} />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
          />
        </Canvas>
      </div>

      {/* AR Overlay UI */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between items-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm border-b border-[#333333]">
          <div className="text-[#FFFFFF]">
            <h1 className="text-xl font-bold">{eventData.name}</h1>
            <p className="text-sm text-[#AAAAAA]">{eventData.location}</p>
          </div>
          <button
            onClick={() => navigate("/events")}
            className="p-2 rounded-full bg-[#333333] hover:bg-[#00FF7F] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-6 h-6 text-[#FFFFFF]" />
          </button>
        </div>

        {/* Center content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#FFFFFF]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#00FF7F]" />
              <p className="text-lg text-[#AAAAAA]">
                Point your camera at the QR code to unlock AR experience
              </p>
            </motion.div>

            {/* Scan button */}
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-6 py-3 bg-[#00FF7F] text-[#1A1A1A] hover:bg-[#00E676] rounded-lg font-semibold transition-all duration-300 mb-4"
            >
              {isScanning ? "Scanning..." : "Scan QR Code"}
            </button>

            {/* POAP notification */}
            {showPOAP && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#333333]/80 backdrop-blur-sm p-4 rounded-lg mb-4 border border-[#00FF7F]"
              >
                <Award className="w-8 h-8 text-[#00FF7F] mx-auto mb-2" />
                <p className="text-sm mb-3 text-[#FFFFFF]">
                  You've unlocked a POAP!
                </p>
                <button onClick={handleMintPOAP} className="btn-primary">
                  Mint POAP
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex justify-center space-x-4 p-4 bg-[#1A1A1A]/80 backdrop-blur-sm border-t border-[#333333]">
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="p-3 bg-[#333333] hover:bg-[#00FF7F] hover:text-[#1A1A1A] rounded-full transition-colors"
          >
            <Camera className="w-6 h-6 text-[#FFFFFF]" />
          </button>

          {capturedImage && (
            <>
              <button
                onClick={downloadImage}
                className="p-3 bg-[#333333] hover:bg-[#00FF7F] hover:text-[#1A1A1A] rounded-full transition-colors"
              >
                <Download className="w-6 h-6 text-[#FFFFFF]" />
              </button>
              <button
                onClick={() => {
                  /* Handle share */
                }}
                className="p-3 bg-[#333333] hover:bg-[#00FF7F] hover:text-[#1A1A1A] rounded-full transition-colors"
              >
                <Share2 className="w-6 h-6 text-[#FFFFFF]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Captured image preview */}
      {capturedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-[#1A1A1A]/90 flex items-center justify-center p-4"
        >
          <div className="bg-[#333333] rounded-lg p-4 max-w-md border border-[#00FF7F]">
            <img
              src={capturedImage}
              alt="Captured AR scene"
              className="w-full rounded"
            />
            <div className="flex justify-between mt-4">
              <button onClick={downloadImage} className="btn-primary">
                Download
              </button>
              <button
                onClick={() => setCapturedImage(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ARExperiencePage;
