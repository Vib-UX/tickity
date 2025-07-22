import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useEvents, TicketType } from "../hooks/useEvents";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createNewEvent, loading } = useEvents();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    totalTickets: "",
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "", price: "", quantity: 0, sold: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.totalTickets || parseInt(formData.totalTickets) <= 0) {
      newErrors.totalTickets = "Total tickets must be greater than 0";
    }

    const now = Math.floor(Date.now() / 1000);
    const startTime = new Date(formData.startTime).getTime() / 1000;
    const endTime = new Date(formData.endTime).getTime() / 1000;

    if (startTime <= now)
      newErrors.startTime = "Start time must be in the future";
    if (endTime <= startTime)
      newErrors.endTime = "End time must be after start time";

    // Validate ticket types
    let totalQuantity = 0;
    ticketTypes.forEach((type, index) => {
      if (!type.name.trim())
        newErrors[`ticketType${index}`] = "Ticket type name is required";
      if (!type.price || parseFloat(type.price) < 0)
        newErrors[`ticketPrice${index}`] = "Valid price is required";
      if (!type.quantity || type.quantity <= 0)
        newErrors[`ticketQuantity${index}`] = "Quantity must be greater than 0";
      totalQuantity += type.quantity;
    });

    if (totalQuantity !== parseInt(formData.totalTickets)) {
      newErrors.totalTickets = "Total quantities must match total tickets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const startTime = Math.floor(
        new Date(formData.startTime).getTime() / 1000
      );
      const endTime = Math.floor(new Date(formData.endTime).getTime() / 1000);

      // Convert prices to wei (assuming 18 decimals)
      const ticketTypesWithPrices = ticketTypes.map((type) => ({
        ...type,
        price: (parseFloat(type.price) * 1e18).toString(),
      }));

      await createNewEvent({
        name: formData.name,
        description: formData.description,
        startTime,
        endTime,
        location: formData.location,
        totalTickets: parseInt(formData.totalTickets),
        ticketTypes: ticketTypesWithPrices,
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
      totalTickets: "",
    });
    setTicketTypes([{ name: "", price: "", quantity: 0, sold: 0 }]);
    setErrors({});
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", price: "", quantity: 0, sold: 0 },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1A1A1A] border border-[#333333] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#FFFFFF]">
                Create New Event
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#AAAAAA]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] placeholder-[#AAAAAA] focus:outline-none focus:border-[#00FF7F] ${
                      errors.name ? "border-red-500" : "border-[#333333]"
                    }`}
                    placeholder="Enter event name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] placeholder-[#AAAAAA] focus:outline-none focus:border-[#00FF7F] ${
                      errors.location ? "border-red-500" : "border-[#333333]"
                    }`}
                    placeholder="Enter event location"
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] placeholder-[#AAAAAA] focus:outline-none focus:border-[#00FF7F] ${
                    errors.description ? "border-red-500" : "border-[#333333]"
                  }`}
                  placeholder="Describe your event"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] focus:outline-none focus:border-[#00FF7F] ${
                      errors.startTime ? "border-red-500" : "border-[#333333]"
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] focus:outline-none focus:border-[#00FF7F] ${
                      errors.endTime ? "border-red-500" : "border-[#333333]"
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.endTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                    Total Tickets *
                  </label>
                  <input
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, totalTickets: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-[#333333]/50 border rounded-lg text-[#FFFFFF] focus:outline-none focus:border-[#00FF7F] ${
                      errors.totalTickets
                        ? "border-red-500"
                        : "border-[#333333]"
                    }`}
                    placeholder="0"
                    min="1"
                  />
                  {errors.totalTickets && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.totalTickets}
                    </p>
                  )}
                </div>
              </div>

              {/* Ticket Types */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#FFFFFF]">
                    Ticket Types
                  </h3>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="flex items-center gap-2 px-3 py-2 bg-[#00FF7F] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#00E676] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Type
                  </button>
                </div>

                <div className="space-y-4">
                  {ticketTypes.map((ticketType, index) => (
                    <div key={index} className="bg-[#333333]/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-[#FFFFFF]">
                          Ticket Type {index + 1}
                        </h4>
                        {ticketTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketType(index)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-[#AAAAAA] mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={ticketType.name}
                            onChange={(e) =>
                              updateTicketType(index, "name", e.target.value)
                            }
                            className={`w-full px-3 py-2 bg-[#333333]/50 border rounded text-[#FFFFFF] placeholder-[#AAAAAA] focus:outline-none focus:border-[#00FF7F] text-sm ${
                              errors[`ticketType${index}`]
                                ? "border-red-500"
                                : "border-[#333333]"
                            }`}
                            placeholder="e.g., VIP, General"
                          />
                          {errors[`ticketType${index}`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`ticketType${index}`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-[#AAAAAA] mb-1">
                            Price (XTZ)
                          </label>
                          <input
                            type="number"
                            value={ticketType.price}
                            onChange={(e) =>
                              updateTicketType(index, "price", e.target.value)
                            }
                            className={`w-full px-3 py-2 bg-[#333333]/50 border rounded text-[#FFFFFF] focus:outline-none focus:border-[#00FF7F] text-sm ${
                              errors[`ticketPrice${index}`]
                                ? "border-red-500"
                                : "border-[#333333]"
                            }`}
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                          />
                          {errors[`ticketPrice${index}`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`ticketPrice${index}`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-[#AAAAAA] mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={ticketType.quantity}
                            onChange={(e) =>
                              updateTicketType(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full px-3 py-2 bg-[#333333]/50 border rounded text-[#FFFFFF] focus:outline-none focus:border-[#00FF7F] text-sm ${
                              errors[`ticketQuantity${index}`]
                                ? "border-red-500"
                                : "border-[#333333]"
                            }`}
                            placeholder="0"
                            min="1"
                          />
                          {errors[`ticketQuantity${index}`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`ticketQuantity${index}`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-[#333333] text-[#FFFFFF] rounded-lg hover:bg-[#333333]/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#00FF7F] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;
