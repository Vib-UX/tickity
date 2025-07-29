// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title PurchaseAndUseTicket
 * @dev Script to purchase a ticket and then use it to test POAP minting
 */
contract PurchaseAndUseTicket is Script {
    // New contract addresses from deployment with POAP integration
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Purchasing and Using Ticket for POAP Integration Test");
        console.log("===================================================");
        console.log("");

        // 30-Second POAP Event address
        address eventAddress = 0xc427501a238010581E6764D0307bdf97CBa1ad20;
        
        Event testEvent = Event(payable(eventAddress));
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);

        console.log("Event Address:", eventAddress);
        console.log("Event Name:", testEvent.name());
        console.log("Event Start Time:", testEvent.startTime());
        console.log("Event End Time:", testEvent.endTime());
        console.log("Current Block Time:", block.timestamp);
        console.log("Event Active:", testEvent.isActive());
        console.log("POAP Contract Address:", testEvent.poapContract());
        console.log("");

        // Check if event is active
        if (!testEvent.isActive()) {
            console.log("ERROR: Event is not active yet!");
            console.log("Please wait for the event to start before running this script.");
            return;
        }

        // Check if POAP contract is set
        if (testEvent.poapContract() == address(0)) {
            console.log("ERROR: POAP contract not set in Event!");
            console.log("This indicates the Event was created without POAP integration.");
            return;
        }

        // Step 1: Purchase a ticket
        console.log("Step 1: Purchasing Ticket...");
        
        // Approve USDT spending
        IUSDT usdt = IUSDT(USDT_CONTRACT);
        uint256 ticketPrice = testEvent.ticketPrices(0);
        usdt.approve(eventAddress, ticketPrice);
        
        // Purchase ticket
        testEvent.purchaseTicket(0);
        
        console.log("   Ticket purchased successfully!");
        console.log("   Ticket price:", ticketPrice, "USDT (6 decimals)");
        console.log("");

        // Step 2: Use the ticket (this should trigger POAP minting)
        console.log("Step 2: Using Ticket to Trigger POAP Minting...");
        
        // Get the latest ticket ID (assuming it's the next one)
        uint256 ticketId = 1; // We'll try this first
        
        try testEvent.useTicket(ticketId) {
            console.log("   [SUCCESS] Ticket used successfully!");
            console.log("   POAP should be automatically minted");
        } catch Error(string memory reason) {
            console.log("   [ERROR] Ticket usage failed:", reason);
            console.log("   Trying with ticket ID 2...");
            
            // Try with ticket ID 2
            try testEvent.useTicket(2) {
                console.log("   [SUCCESS] Ticket used successfully!");
                console.log("   POAP should be automatically minted");
                ticketId = 2;
            } catch Error(string memory reason2) {
                console.log("   [ERROR] Ticket usage failed again:", reason2);
                return;
            }
        }
        console.log("");

        // Step 3: Verify POAP minting
        console.log("Step 3: Verifying POAP Minting...");
        
        // Check if POAP was minted (event ID 1 for the 30-second test)
        bool hasClaimed = poapContract.hasUserClaimedPOAP(1, msg.sender);
        if (hasClaimed) {
            console.log("   [SUCCESS] POAP successfully minted for user!");
            
            // Get user's POAPs
            uint256[] memory userPOAPs = poapContract.getUserPOAPs(msg.sender);
            console.log("   User has", userPOAPs.length, "POAPs total");
            
            if (userPOAPs.length > 0) {
                uint256 latestPOAP = userPOAPs[userPOAPs.length - 1];
                console.log("   Latest POAP ID:", latestPOAP);
                
                // Get POAP details
                (uint256 poapEventId, uint256 eventId, uint256 ticketTokenId, address attendee, uint256 mintedAt, string memory metadataURI) = poapContract.getPOAP(latestPOAP);
                console.log("   POAP Event ID:", poapEventId);
                console.log("   Event ID:", eventId);
                console.log("   Ticket Token ID:", ticketTokenId);
                console.log("   Attendee:", attendee);
                console.log("   Minted At:", mintedAt);
                console.log("   Metadata URI:", metadataURI);
            }
        } else {
            console.log("   [ERROR] POAP not found for user");
            console.log("   This indicates an issue with the POAP integration");
        }
        console.log("");

        // Step 4: Show POAP event details
        console.log("Step 4: POAP Event Details...");
        (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) = poapContract.getPOAPEvent(1);
        
        console.log("   POAP Event ID: 1");
        console.log("   Name:", name);
        console.log("   Description:", description);
        console.log("   Image URI:", imageURI);
        console.log("   POAP URI:", poapURI);
        console.log("   Is Active:", isActive);
        console.log("   Event Contract:", eventContract);
        console.log("   Organizer:", organizer);
        console.log("   POAPs Minted:", minted);
        console.log("   Created At:", createdAt);
        console.log("");

        vm.stopBroadcast();
        
        console.log("POAP Integration Test Completed!");
        console.log("================================");
        if (hasClaimed) {
            console.log("[SUCCESS] POAP integration working correctly!");
            console.log("The complete POAP flow is now functional!");
        } else {
            console.log("[ERROR] POAP integration failed");
            console.log("Please check the Event contract POAP integration");
        }
    }
} 