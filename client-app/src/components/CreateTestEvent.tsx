import React, { useState } from "react";
// TODO: Migrate wallet hooks to new thirdweb/react SDK
import { motion } from "framer-motion";
import { Plus, Calendar, MapPin, DollarSign } from "lucide-react";
import { useEvents, TicketType } from "../hooks/useEvents";
import toast from "react-hot-toast";

const CreateTestEvent: React.FC = () => {
  // const address = useAddress(); // Removed as per edit hint
  const { createNewEvent, loading } = useEvents();
  const [isCreating, setIsCreating] = useState(false);

  const testEvents = [
    {
      name: "Etherlink Conference 2024",
      description:
        "The biggest blockchain conference on Etherlink testnet. Join us for talks, workshops, and networking with industry leaders.",
      location: "Virtual Conference Center",
      ticketTypes: [
        {
          name: "General Admission",
          price: "1000000000000000000",
          quantity: 100,
          sold: 0,
        }, // 1 XTZ
        {
          name: "VIP Pass",
          price: "5000000000000000000",
          quantity: 20,
          sold: 0,
        }, // 5 XTZ
      ],
    },
    {
      name: "NFT Art Gallery Opening",
      description:
        "Exclusive opening of the first NFT art gallery on Etherlink. Featuring digital artists from around the world.",
      location: "Digital Art Museum",
      ticketTypes: [
        {
          name: "Standard Entry",
          price: "500000000000000000",
          quantity: 50,
          sold: 0,
        }, // 0.5 XTZ
        {
          name: "Artist Meet & Greet",
          price: "2000000000000000000",
          quantity: 10,
          sold: 0,
        }, // 2 XTZ
      ],
    },
    {
      name: "DeFi Workshop Series",
      description:
        "Learn about DeFi protocols, yield farming, and liquidity provision on Etherlink. Hands-on workshops included.",
      location: "Blockchain Academy",
      ticketTypes: [
        {
          name: "Basic Workshop",
          price: "300000000000000000",
          quantity: 30,
          sold: 0,
        }, // 0.3 XTZ
        {
          name: "Advanced Workshop",
          price: "1000000000000000000",
          quantity: 15,
          sold: 0,
        }, // 1 XTZ
      ],
    },
  ];

  const createTestEvent = async (eventData: (typeof testEvents)[0]) => {
    // if (!address) { // Removed as per edit hint
    //   toast.error("Please connect your wallet first");
    //   return;
    // }

    setIsCreating(true);
    try {
      // Set event times (start in 1 hour, end in 3 hours)
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600; // 1 hour from now
      const endTime = now + 10800; // 3 hours from now

      const totalTickets = eventData.ticketTypes.reduce(
        (sum, type) => sum + type.quantity,
        0
      );

      await createNewEvent({
        name: eventData.name,
        description: eventData.description,
        startTime,
        endTime,
        location: eventData.location,
        totalTickets,
        ticketTypes: eventData.ticketTypes,
      });

      toast.success(`Created event: ${eventData.name}`);
    } catch (error) {
      console.error("Error creating test event:", error);
      toast.error("Failed to create test event");
    } finally {
      setIsCreating(false);
    }
  };

  // if (!address) { // Removed as per edit hint
  //   return (
  //     <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6 mb-6">
  //       <h3 className="text-lg font-semibold mb-4 text-[#FFFFFF]">
  //         Create Test Events
  //       </h3>
  //       <p className="text-[#AAAAAA] mb-4">
  //         Connect your wallet to create test events for demonstration purposes.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-[#FFFFFF] flex items-center gap-2">
        <Plus className="w-5 h-5 text-[#00FF7F]" />
        Create Test Events
      </h3>
      <p className="text-[#AAAAAA] mb-4">
        Create sample events to test the platform functionality.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {testEvents.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#333333]/50 border border-[#333333] rounded-lg p-4"
          >
            <h4 className="font-semibold mb-2 text-[#FFFFFF]">{event.name}</h4>
            <p className="text-sm text-[#AAAAAA] mb-3 line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-[#AAAAAA]">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#AAAAAA]">
                <DollarSign className="w-3 h-3" />
                <span>
                  From {parseFloat(event.ticketTypes[0].price) / 1e18} XTZ
                </span>
              </div>
            </div>

            <button
              onClick={() => createTestEvent(event)}
              disabled={loading || isCreating}
              className="w-full px-3 py-2 bg-[#00FF7F] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading || isCreating ? "Creating..." : "Create Event"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CreateTestEvent;
