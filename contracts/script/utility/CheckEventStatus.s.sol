// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityPOAP.sol";

/**
 * @title CheckEventStatus
 * @dev Check the status of the event and factory
 */
contract CheckEventStatus is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x3F260AB005fDABC9a5666dBd2F7B14F0Fc12Ecb8;
    address constant TICKITY_POAP = 0xB17936a921f284C0690db92a30035B14D6600b33;

    function run() external {
        console.log("Checking Event and Factory Status");
        console.log("================================");
        console.log("");

        EventFactory factory = EventFactory(EVENT_FACTORY);
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);

        console.log("Factory Address:", EVENT_FACTORY);
        console.log("POAP Contract:", TICKITY_POAP);
        console.log("");

        // Step 1: Check factory status
        console.log("Step 1: Factory Status");
        console.log("=====================");
        uint256 eventCount = factory.eventCount();
        console.log("Total Events Created:", eventCount);
        console.log("");

        // Step 2: Check POAP contract ownership
        console.log("Step 2: POAP Contract Ownership");
        console.log("===============================");
        address poapOwner = poapContract.owner();
        console.log("POAP Contract Owner:", poapOwner);
        console.log("Factory Address:", EVENT_FACTORY);
        console.log("Are they the same?", poapOwner == EVENT_FACTORY);
        console.log("");

        // Step 3: Check if there are any events
        if (eventCount > 0) {
            console.log("Step 3: Event Details");
            console.log("====================");
            
            for (uint256 i = 1; i <= eventCount; i++) {
                address eventAddress = factory.getEventAddress(i);
                console.log("Event ID:", i);
                console.log("Event Address:", eventAddress);
                console.log("");
            }
        } else {
            console.log("Step 3: No Events Found");
            console.log("======================");
            console.log("No events have been created yet.");
            console.log("");
        }

        console.log("Status Check Complete!");
        console.log("=====================");
    }
} 