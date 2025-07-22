import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// TODO: Migrate wallet hooks to new thirdweb/react SDK
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Ticket,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useEvents, Event } from "../hooks/useEvents";

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // TODO: Migrate wallet hooks to new thirdweb/react SDK
  const { events, purchaseTicket, loading } = useEvents();
  const [selectedTicketType, setSelectedTicketType] = useState<number | null>(
    null
  );
  const [purchasing, setPurchasing] = useState(false);

  const event = events.find((e) => e.id === parseInt(id || "0"));

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string) => {
    return `${parseFloat(price) / 1e18} XTZ`;
  };

  const handlePurchaseTicket = async () => {
    if (!event || selectedTicketType === null) return;

    const ticketType = event.ticketTypes[selectedTicketType];
    if (!ticketType) return;

    setPurchasing(true);
    try {
      await purchaseTicket(event.address, selectedTicketType, ticketType.price);
      setSelectedTicketType(null);
      // Show success message or redirect
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      // Show error message
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
        <Navbar />
        <div className="pt-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF7F]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
        <Navbar />
        <div className="pt-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#FFFFFF]">
              Event Not Found
            </h1>
            <p className="text-xl text-[#AAAAAA] mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-3 bg-[#00FF7F] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#00E676] transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOrganizer = false; // address?.toLowerCase() === event.organizer.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const isUpcoming = event.startTime > now;
  const isActive = event.isActive && isUpcoming;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
      <Navbar />

      <div className="pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-[#AAAAAA] hover:text-[#FFFFFF] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>

          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#333333]/50 backdrop-blur-sm border border-[#333333] rounded-xl p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 text-[#FFFFFF]">
                  {event.name}
                </h1>
                <p className="text-lg text-[#AAAAAA] mb-6">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#00FF7F]" />
                    <div>
                      <p className="text-sm text-[#AAAAAA]">Start Time</p>
                      <p className="text-[#FFFFFF]">
                        {formatDate(event.startTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#00FF7F]" />
                    <div>
                      <p className="text-sm text-[#AAAAAA]">End Time</p>
                      <p className="text-[#FFFFFF]">
                        {formatDate(event.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#00FF7F]" />
                    <div>
                      <p className="text-sm text-[#AAAAAA]">Location</p>
                      <p className="text-[#FFFFFF]">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#00FF7F]" />
                    <div>
                      <p className="text-sm text-[#AAAAAA]">Tickets Sold</p>
                      <p className="text-[#FFFFFF]">
                        {event.soldTickets} / {event.totalTickets}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </div>
                {isOrganizer && (
                  <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                    Organizer
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Ticket Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#333333]/50 backdrop-blur-sm border border-[#333333] rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-[#FFFFFF]">
              Available Tickets
            </h2>

            {!isActive ? (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-[#AAAAAA]">
                  This event is not active for ticket sales
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {event.ticketTypes.map((ticketType, index) => {
                  const isAvailable = ticketType.sold < ticketType.quantity;
                  const isSelected = selectedTicketType === index;

                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-[#00FF7F] bg-[#00FF7F]/10"
                          : isAvailable
                          ? "border-[#333333] bg-[#333333]/30 hover:border-[#00FF7F]/50"
                          : "border-[#333333] bg-[#333333]/20 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        isAvailable && setSelectedTicketType(index)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Ticket className="w-5 h-5 text-[#00FF7F]" />
                            <h3 className="text-lg font-semibold text-[#FFFFFF]">
                              {ticketType.name}
                            </h3>
                            {!isAvailable && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                Sold Out
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-[#AAAAAA]">Price</p>
                              <p className="text-[#FFFFFF] font-medium">
                                {formatPrice(ticketType.price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#AAAAAA]">Available</p>
                              <p className="text-[#FFFFFF] font-medium">
                                {ticketType.quantity - ticketType.sold} /{" "}
                                {ticketType.quantity}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#AAAAAA]">Sold</p>
                              <p className="text-[#FFFFFF] font-medium">
                                {ticketType.sold}
                              </p>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-[#00FF7F]" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {selectedTicketType !== null && (
                  <div className="mt-6 p-6 bg-[#00FF7F]/10 border border-[#00FF7F] rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#FFFFFF]">
                        Purchase Summary
                      </h3>
                      <DollarSign className="w-5 h-5 text-[#00FF7F]" />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[#AAAAAA]">Ticket Price:</span>
                      <span className="text-[#FFFFFF] font-semibold">
                        {formatPrice(
                          event.ticketTypes[selectedTicketType].price
                        )}
                      </span>
                    </div>

                    <button
                      onClick={handlePurchaseTicket}
                      disabled={purchasing}
                      className="w-full py-3 bg-[#00FF7F] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing ? "Processing..." : "Purchase Ticket"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
