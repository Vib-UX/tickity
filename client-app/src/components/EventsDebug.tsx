import React from "react";
// TODO: Migrate contract hooks to new thirdweb/react SDK
import { CONTRACT_ADDRESSES, EVENT_FACTORY_ABI } from "../config/thirdweb";

const EventsDebug: React.FC = () => {
  // const { contract: eventFactory } = useContract(
  //   CONTRACT_ADDRESSES.EVENT_FACTORY,
  //   EVENT_FACTORY_ABI
  // );

  // const { data: eventCount, isLoading: countLoading } = useContractRead(
  //   eventFactory,
  //   "eventCount"
  // );

  // const { data: firstEventAddress, isLoading: addressLoading } =
  //   useContractRead(eventFactory, "getEventAddress", [1]);

  return (
    <div className="fixed top-4 right-4 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-sm text-[#FFFFFF] z-50 max-w-md">
      <h3 className="font-semibold mb-3 text-[#00FF7F]">Events Debug Info</h3>
      <div className="space-y-2">
        <div>
          <span className="text-[#AAAAAA]">Contract Address: </span>
          <span className="text-[#FFFFFF] text-xs break-all">
            {CONTRACT_ADDRESSES.EVENT_FACTORY}
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Event Factory: </span>
          <span
            className={/* eventFactory ? "text-[#00FF7F]" : "text-red-400" */}
          >
            {/* {eventFactory ? "Connected" : "Not Connected"} */}
            Not Connected (TODO: Migrate contract hooks)
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Event Count: </span>
          <span
            className={/* countLoading ? "text-yellow-400" : "text-[#FFFFFF]" */}
          >
            {/* {countLoading ? "Loading..." : eventCount?.toString() || "0"} */}
            Loading... (TODO: Migrate contract hooks)
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">First Event Address: </span>
          <span
            className={/* addressLoading
                ? "text-yellow-400"
                : "text-[#FFFFFF] text-xs break-all" */}
          >
            {/* {addressLoading ? "Loading..." : firstEventAddress || "None"} */}
            None (TODO: Migrate contract hooks)
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Status: </span>
          <span
            className={/* eventCount === 0
                ? "text-yellow-400"
                : eventCount && eventCount > 0
                ? "text-[#00FF7F]"
                : "text-red-400" */}
          >
            {/* {eventCount === 0
              ? "No events created yet"
              : eventCount && eventCount > 0
              ? `${eventCount} events found`
              : "Error loading events"} */}
            No events created yet (TODO: Migrate contract hooks)
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventsDebug;
