// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";

/**
 * @title CreatePOAPEventThroughFactory
 * @dev Create a POAP event through the factory
 */
contract CreatePOAPEventThroughFactory is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x3F260AB005fDABC9a5666dBd2F7B14F0Fc12Ecb8;
    address constant TICKITY_POAP = 0xB17936a921f284C0690db92a30035B14D6600b33;
    address constant EVENT_ADDRESS = 0xD618a49c86E9fd6771EF03fBeee8B0DE84D266e5;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating POAP Event Through Factory");
        console.log("==================================");
        console.log("");

        EventFactory factory = EventFactory(EVENT_FACTORY);
        POAP poapContract = POAP(TICKITY_POAP);
        Event eventContract = Event(payable(EVENT_ADDRESS));
        address organizer = vm.addr(deployerPrivateKey);

        console.log("Factory Address:", EVENT_FACTORY);
        console.log("POAP Contract:", TICKITY_POAP);
        console.log("Event Address:", EVENT_ADDRESS);
        console.log("Organizer:", organizer);
        console.log("");

        // Step 1: Get event details
        console.log("Step 1: Getting Event Details...");
        uint256 eventId = eventContract.eventId();
        string memory eventName = eventContract.name();
        string memory eventDescription = eventContract.description();
        
        console.log("Event ID:", eventId);
        console.log("Event Name:", eventName);
        console.log("Event Description:", eventDescription);
        console.log("");

        // Step 2: Check if POAP event already exists
        console.log("Step 2: Checking POAP Event Status...");
        uint256 existingPOAPEventId = poapContract.getPOAPEventId(eventId);
        console.log("Existing POAP Event ID:", existingPOAPEventId);
        
        if (existingPOAPEventId > 0) {
            console.log("POAP event already exists!");
            console.log("POAP Event ID:", existingPOAPEventId);
        } else {
            console.log("No POAP event exists yet.");
            console.log("We need to create one through the factory.");
        }
        console.log("");

        // Step 3: Check factory ownership
        console.log("Step 3: Checking Factory Ownership...");
        address poapOwner = poapContract.owner();
        console.log("POAP Contract Owner:", poapOwner);
        console.log("Factory Address:", EVENT_FACTORY);
        console.log("Are they the same?", poapOwner == EVENT_FACTORY);
        console.log("");

        // Step 4: Since the factory owns the POAP contract, we need to add a function to the factory
        // For now, let's just verify the setup is correct
        console.log("Step 4: Verifying Setup...");
        console.log("The factory owns the POAP contract, so it can create POAP events.");
        console.log("However, the current factory doesn't have a function to create POAP events.");
        console.log("The POAP event needs to be created manually or through a factory upgrade.");
        console.log("");

        vm.stopBroadcast();
        
        console.log("POAP Event Creation Analysis Complete!");
        console.log("=====================================");
        console.log("Summary:");
        console.log("- Event ID:", eventId);
        console.log("- Event Address:", EVENT_ADDRESS);
        console.log("- POAP Contract:", TICKITY_POAP);
        console.log("- Factory Owner:", poapOwner);
        console.log("- POAP Event Exists:", existingPOAPEventId > 0);
        console.log("");
        console.log("Issue: POAP event needs to be created for POAP minting to work.");
        console.log("Solution: Add POAP event creation function to factory or create manually.");
    }
} 