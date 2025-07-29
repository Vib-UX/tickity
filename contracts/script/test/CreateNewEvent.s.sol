// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/IUSDT.sol";

/**
 * @title CreateNewPOAPEvent
 * @dev Create a new event with POAP integration for testing
 */
contract CreateNewPOAPEvent is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0xC7A460ff2685B7C140B6a960aAAd38FB64b35F3F;
    address constant TICKITY_NFT = 0x63cf8c06E25F6fbE972F5de85C377Df7669fCaF7;
    address constant TICKITY_POAP = 0xd85612C44d575c00DA13eBb62dF2816CF7C22ACe;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating New POAP Event for Testing");
        console.log("===================================");
        console.log("");

        EventFactory factory = EventFactory(EVENT_FACTORY);
        POAP poapContract = POAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);

        console.log("Event Factory Address:", EVENT_FACTORY);
        console.log("POAP Contract Address:", TICKITY_POAP);
        console.log("USDT Contract Address:", USDT_CONTRACT);
        console.log("");

        // Step 1: Create a new event
        console.log("Step 1: Creating New Event...");
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "POAP Test Ticket";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 50000; // 0.05 USDT (6 decimals)
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 10; // Limited to 10 tickets
        
        uint256 startTime = block.timestamp + 60; // Start in 1 minute
        uint256 endTime = block.timestamp + 3600; // End in 1 hour
        
        address newEventAddress = factory.createEvent(
            "Fresh POAP Test Event",
            "A new event specifically for testing POAP minting",
            startTime,
            endTime,
            "Virtual Event Space",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT // NFT contract address
        );
        
        console.log("[SUCCESS] New event created!");
        console.log("Event Address:", newEventAddress);
        console.log("");

        // Step 2: Get the event ID
        console.log("Step 2: Getting Event Details...");
        Event newEvent = Event(payable(newEventAddress));
        uint256 eventId = newEvent.eventId();
        console.log("Event ID:", eventId);
        console.log("Event Name:", newEvent.name());
        console.log("POAP Contract:", newEvent.poapContract());
        console.log("");

        // Step 3: Create POAP event in POAP contract
        console.log("Step 3: Creating POAP Event...");
        uint256 poapEventId = poapContract.createPOAPEvent(
            eventId,
            newEventAddress,
            vm.addr(deployerPrivateKey), // organizer
            "Fresh POAP Test Event",
            "POAP for the fresh test event",
            "https://example.com/poap-image.png",
            "https://example.com/poap-metadata.json"
        );
        console.log("[SUCCESS] POAP event created!");
        console.log("POAP Event ID:", poapEventId);
        console.log("");

        // Step 4: Verify POAP event creation
        console.log("Step 4: Verifying POAP Event...");
        try poapContract.getPOAPEvent(poapEventId) returns (uint256 poapEventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("POAP Event Details:");
            console.log("- Name:", name);
            console.log("- Description:", description);
            console.log("- Event Contract:", eventContract);
            console.log("- Organizer:", organizer);
            console.log("- Is Active:", isActive);
            console.log("- POAPs Minted:", minted);
            console.log("- Created At:", createdAt);
        } catch {
            console.log("Error getting POAP event details");
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("New POAP Event Creation Complete!");
        console.log("=================================");
        console.log("[SUCCESS] Fresh event with POAP integration created!");
        console.log("");
        console.log("Next steps:");
        console.log("1. Purchase a ticket from the new event");
        console.log("2. Use the ticket to trigger POAP minting");
        console.log("3. Verify the POAP was minted successfully");
        console.log("");
        console.log("Event Address:", newEventAddress);
        console.log("Event ID:", eventId);
        console.log("POAP Event ID:", poapEventId);
    }
} 