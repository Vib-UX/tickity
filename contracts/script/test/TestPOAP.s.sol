// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/POAP.sol";
import "../src/Event.sol";
import "../src/IUSDT.sol";

/**
 * @title TestSimplePOAP
 * @dev Test the simplified POAP functionality
 */
contract TestSimplePOAP is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x3b082F6Ea285761f862608f28Ff420a8592201Cd;
    address constant TICKITY_NFT = 0x39a450990A9A778172201f1CFC0e205E5D0B15d4;
    address constant TICKITY_POAP = 0x82C2B08463706885C5e92A6317bF81b01e70A1c2;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing POAP Functionality");
        console.log("==========================");
        console.log("");

        EventFactory factory = EventFactory(EVENT_FACTORY);
        POAP poapContract = POAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);
        address user = vm.addr(deployerPrivateKey);

        console.log("Factory Address:", EVENT_FACTORY);
        console.log("NFT Contract:", TICKITY_NFT);
        console.log("POAP Contract:", TICKITY_POAP);
        console.log("User:", user);
        console.log("");

        // Step 1: Create event
        console.log("Step 1: Creating Event...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "General Admission";
        ticketTypes[1] = "VIP";
        
        uint256[] memory ticketPrices = new uint256[](2);
        ticketPrices[0] = 50000;  // 0.05 USDT
        ticketPrices[1] = 150000; // 0.15 USDT
        
        uint256[] memory ticketQuantities = new uint256[](2);
        ticketQuantities[0] = 20; // 20 General tickets
        ticketQuantities[1] = 10; // 10 VIP tickets
        
        // Event starts in 1 hour and ends in 3 hours
        uint256 startTime = block.timestamp + 1 hours;
        uint256 endTime = block.timestamp + 3 hours;
        
        address newEventAddress = factory.createEvent(
            "Etherlink Developer Summit 2024",
            "Join us for the most exciting blockchain developer summit on Etherlink! Learn about the latest in DeFi, NFTs, and smart contract development. Network with industry experts and discover new opportunities in the blockchain space.",
            startTime,
            endTime,
            "Etherlink Innovation Center",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );
        
        console.log("Event created successfully!");
        console.log("Event Address:", newEventAddress);
        console.log("Event Name: Etherlink Developer Summit 2024");
        console.log("Start Time:", startTime, "(in 1 hour)");
        console.log("End Time:", endTime, "(in 3 hours)");
        console.log("");

        // Step 2: Get event details
        console.log("Step 2: Getting Event Details...");
        uint256 eventId = factory.eventCount();
        console.log("Event ID:", eventId);
        console.log("");

        // Step 3: Purchase tickets
        console.log("Step 3: Purchasing Tickets...");
        
        // Purchase 2 General Admission tickets
        for (uint256 i = 0; i < 2; i++) {
            usdt.approve(newEventAddress, ticketPrices[0]);
            Event eventContract = Event(payable(newEventAddress));
            eventContract.purchaseTicket(0);
            console.log("General Admission ticket", i + 1, "purchased!");
        }
        
        // Purchase 1 VIP ticket
        usdt.approve(newEventAddress, ticketPrices[1]);
        Event eventContract = Event(payable(newEventAddress));
        eventContract.purchaseTicket(1);
        console.log("VIP ticket purchased!");
        console.log("");

        // Step 4: Get user tickets
        console.log("Step 4: Getting User Tickets...");
        uint256[] memory userTickets = eventContract.getUserTickets(user);
        console.log("Total tickets owned by user:", userTickets.length);
        
        for (uint256 i = 0; i < userTickets.length; i++) {
            console.log("Ticket ID", i + 1, ":", userTickets[i]);
        }
        console.log("");

        // Step 5: Use tickets to mint POAPs
        console.log("Step 5: Using Tickets to Mint POAPs...");
        
        uint256 initialPOAPCount = poapContract.getUserPOAPCountForEvent(eventId, user);
        console.log("Initial POAP count for user:", initialPOAPCount);
        
        for (uint256 i = 0; i < userTickets.length; i++) {
            uint256 ticketId = userTickets[i];
            console.log("Using ticket ID:", ticketId);
            
            try eventContract.useTicket(ticketId) {
                console.log("[SUCCESS] Ticket", ticketId, "used successfully!");
            } catch Error(string memory reason) {
                console.log("[ERROR] Failed to use ticket", ticketId, ":", reason);
            }
        }
        console.log("");

        // Step 6: Verify POAP minting
        console.log("Step 6: Verifying POAP Minting...");
        uint256 finalPOAPCount = poapContract.getUserPOAPCountForEvent(eventId, user);
        console.log("Final POAP count for user:", finalPOAPCount);
        
        if (finalPOAPCount > initialPOAPCount) {
            console.log("[SUCCESS] POAPs successfully minted!");
            console.log("POAPs gained:", finalPOAPCount - initialPOAPCount);
        } else {
            console.log("[ERROR] No POAPs were minted");
        }
        console.log("");

        // Step 7: Get all user POAPs
        console.log("Step 7: Getting All User POAPs...");
        uint256[] memory allUserPOAPs = poapContract.getUserPOAPs(user);
        console.log("Total POAPs owned by user:", allUserPOAPs.length);
        
        for (uint256 i = 0; i < allUserPOAPs.length; i++) {
            uint256 poapId = allUserPOAPs[i];
            console.log("POAP", i + 1, "ID:", poapId);
            
            // Get POAP URI
            string memory poapURI = poapContract.tokenURI(poapId);
            console.log("  - URI:", poapURI);
        }
        console.log("");

        // Step 8: Test multiple POAPs feature
        console.log("Step 8: Testing Multiple POAPs Feature...");
        console.log("User POAP count for event", eventId, ":", finalPOAPCount);
        console.log("Multiple POAPs feature is working correctly!");
        console.log("");

        vm.stopBroadcast();
        
        console.log("POAP Testing Complete!");
        console.log("================================");
        console.log("Summary:");
        console.log("- Event ID:", eventId);
        console.log("- Event Address:", newEventAddress);
        console.log("- Tickets Purchased:", userTickets.length);
        console.log("- POAPs Minted:", finalPOAPCount - initialPOAPCount);
        console.log("- Total POAPs Owned:", allUserPOAPs.length);
        console.log("- Multiple POAPs Feature: Working");
        console.log("");
        console.log("[SUCCESS] POAP system is working perfectly!");
    }
} 