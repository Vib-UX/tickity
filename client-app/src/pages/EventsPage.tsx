import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// TODO: Migrate wallet hooks to new thirdweb/react SDK
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useEvents, Event } from "../hooks/useEvents";
import CreateEventModal from "../components/CreateEventModal";
import CreateTestEvent from "../components/CreateTestEvent";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "../config/thirdweb";

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  // TODO: Migrate wallet hooks to new thirdweb/react SDK
  const { events, loading, error } = useEvents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "upcoming" | "my-events"
  >("all");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const now = Math.floor(Date.now() / 1000);

    switch (filterType) {
      case "upcoming":
        return event.startTime > now && event.isActive;
      case "my-events":
        // TODO: Migrate wallet hooks to new thirdweb/react SDK
        return (
          event.organizer.toLowerCase() === "your_address_here".toLowerCase()
        );
      default:
        return true;
    }
  });

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

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF]">
      <Navbar />

      <div className="pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[#FFFFFF]">Events</h1>
              <p className="text-xl text-[#AAAAAA]">
                Discover upcoming events and mint your NFT tickets
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              {/* TODO: Migrate wallet hooks to new thirdweb/react SDK */}
              {/* {address ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#00FF7F] text-[#1A1A1A] hover:bg-[#00E676] rounded-lg font-semibold transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>
              ) : (
                <ConnectButton client={client} wallets={wallets} />
              )} */}
              <ConnectButton client={client} wallets={wallets} />
            </div>
          </div>

          {/* Create Test Events Section */}
          <CreateTestEvent />

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AAAAAA] w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#333333]/50 border border-[#333333] rounded-lg text-[#FFFFFF] placeholder-[#AAAAAA] focus:outline-none focus:border-[#00FF7F] transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  filterType === "all"
                    ? "bg-[#00FF7F] text-[#1A1A1A]"
                    : "bg-[#333333]/50 text-[#AAAAAA] hover:bg-[#333333]/70"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterType("upcoming")}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  filterType === "upcoming"
                    ? "bg-[#00FF7F] text-[#1A1A1A]"
                    : "bg-[#333333]/50 text-[#AAAAAA] hover:bg-[#333333]/70"
                }`}
              >
                Upcoming
              </button>
              {/* TODO: Migrate wallet hooks to new thirdweb/react SDK */}
              {/* {address && (
                <button
                  onClick={() => setFilterType("my-events")}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    filterType === "my-events"
                      ? "bg-[#00FF7F] text-[#1A1A1A]"
                      : "bg-[#333333]/50 text-[#AAAAAA] hover:bg-[#333333]/70"
                  }`}
                >
                  My Events
                </button>
              )} */}
            </div>
          </div>

          {/* Events Grid */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-[#AAAAAA] text-lg mb-4">
                {searchTerm || filterType !== "all"
                  ? "No events match your search criteria"
                  : "No events available yet"}
              </div>
              {/* Wallet connect now handled by ConnectButton above */}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden hover:border-[#00FF7F] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-[#FFFFFF] line-clamp-2">
                        {event.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-[#AAAAAA] mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#AAAAAA]">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#AAAAAA]">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#AAAAAA]">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.soldTickets} / {event.totalTickets} tickets
                          sold
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#AAAAAA]">
                        From {formatPrice(event.ticketTypes[0]?.price || "0")}
                      </div>
                      <button className="px-4 py-2 bg-[#00FF7F] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#00E676] transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default EventsPage;
