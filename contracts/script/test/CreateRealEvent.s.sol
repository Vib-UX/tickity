// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title CreateRealEventWithPOAP
 * @dev Create a real event with proper values and POAP integration
 */
contract CreateRealEventWithPOAP is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x3F260AB005fDABC9a5666dBd2F7B14F0Fc12Ecb8;
    address constant TICKITY_NFT = 0x8222655347248730fa7ef83dd21cD00Ef421c6b3;
    address constant TICKITY_POAP = 0xB17936a921f284C0690db92a30035B14D6600b33;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Real Event with POAP Integration");
        console.log("========================================");
        console.log("");

        EventFactory factory = EventFactory(EVENT_FACTORY);
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        address organizer = vm.addr(deployerPrivateKey);

        console.log("Factory Address:", EVENT_FACTORY);
        console.log("NFT Contract:", TICKITY_NFT);
        console.log("POAP Contract:", TICKITY_POAP);
        console.log("Organizer:", organizer);
        console.log("");

        // Step 1: Create event with real values
        console.log("Step 1: Creating Real Event...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "Early Bird";
        ticketTypes[1] = "Regular";
        ticketTypes[2] = "VIP";
        
        uint256[] memory ticketPrices = new uint256[](3);
        ticketPrices[0] = 50000;  // 0.05 USDT (50,000 with 6 decimals)
        ticketPrices[1] = 100000; // 0.1 USDT (100,000 with 6 decimals)
        ticketPrices[2] = 250000; // 0.25 USDT (250,000 with 6 decimals)
        
        uint256[] memory ticketQuantities = new uint256[](3);
        ticketQuantities[0] = 50;  // 50 Early Bird tickets
        ticketQuantities[1] = 100; // 100 Regular tickets
        ticketQuantities[2] = 25;  // 25 VIP tickets
        
        // Event starts in 2 hours and ends in 4 hours
        uint256 startTime = block.timestamp + 2 hours;
        uint256 endTime = block.timestamp + 4 hours;
        
        address newEventAddress = factory.createEvent(
            "Etherlink Developer Conference 2024",
            "Join us for the biggest blockchain developer conference on Etherlink! Learn about the latest in DeFi, NFTs, and smart contract development. Network with industry experts and discover new opportunities in the blockchain space.",
            startTime,
            endTime,
            "Etherlink Convention Center, Paris",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );
        
        console.log("Event created successfully!");
        console.log("Event Address:", newEventAddress);
        console.log("Event Name: Etherlink Developer Conference 2024");
        console.log("Start Time:", startTime, "(in 2 hours)");
        console.log("End Time:", endTime, "(in 4 hours)");
        console.log("Location: Etherlink Convention Center, Paris");
        console.log("");

        // Step 2: Get the event ID
        console.log("Step 2: Getting Event ID...");
        uint256 eventId = factory.eventCount();
        console.log("Event ID:", eventId);
        console.log("");

        // Step 3: Create POAP event
        console.log("Step 3: Creating POAP Event...");
        
        uint256 poapEventId = poapContract.createPOAPEvent(
            eventId,
            newEventAddress,
            organizer,
            "Etherlink DevCon 2024 POAP",
            "Proof of Attendance for Etherlink Developer Conference 2024. This POAP commemorates your participation in the biggest blockchain developer conference on Etherlink.",
            "https://ipfs.io/ipfs/QmEtherlinkDevCon2024Image",
            "https://etherlink.com/events/devcon-2024/poap-metadata"
        );
        
        console.log("POAP Event created successfully!");
        console.log("POAP Event ID:", poapEventId);
        console.log("POAP Name: Etherlink DevCon 2024 POAP");
        console.log("");

        // Step 4: Verify POAP event creation
        console.log("Step 4: Verifying POAP Event...");
        try poapContract.getPOAPEvent(poapEventId) returns (uint256 poapEventId_, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer_, uint256 minted, uint256 createdAt) {
            console.log("POAP Event Verification:");
            console.log("- POAP Event ID:", poapEventId_);
            console.log("- Name:", name);
            console.log("- Description:", description);
            console.log("- Image URI:", imageURI);
            console.log("- POAP URI:", poapURI);
            console.log("- Is Active:", isActive);
            console.log("- Event Contract:", eventContract);
            console.log("- Organizer:", organizer_);
            console.log("- Minted Count:", minted);
            console.log("- Created At:", createdAt);
        } catch Error(string memory reason) {
            console.log("Error getting POAP event details:", reason);
        }
        console.log("");

        // Step 5: Display ticket information
        console.log("Step 5: Ticket Information");
        console.log("==========================");
        for (uint256 i = 0; i < ticketTypes.length; i++) {
            console.log("Ticket Type", i + 1, ":", ticketTypes[i]);
            console.log("  - Price:", ticketPrices[i], "USDT (6 decimals)");
            console.log("  - Quantity:", ticketQuantities[i]);
            console.log("  - Price in USDT:", ticketPrices[i] / 1000000, ".", (ticketPrices[i] % 1000000) / 100000);
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("Real Event Creation Complete!");
        console.log("=============================");
        console.log("Summary:");
        console.log("- Event Address:", newEventAddress);
        console.log("- Event ID:", eventId);
        console.log("- POAP Event ID:", poapEventId);
        console.log("- Total Tickets Available:", ticketQuantities[0] + ticketQuantities[1] + ticketQuantities[2]);
        console.log("- Event Duration: 2 hours");
        console.log("- Multiple POAPs enabled for testing");
        console.log("");
        console.log("Next: Test ticket purchase and POAP minting!");
    }
} 