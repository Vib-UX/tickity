// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title TestFreshEventPOAP
 * @dev Test script to purchase ticket from fresh event and use it for POAP testing
 */
contract TestFreshEventPOAP is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0xC7A460ff2685B7C140B6a960aAAd38FB64b35F3F;
    address constant TICKITY_NFT = 0x63cf8c06E25F6fbE972F5de85C377Df7669fCaF7;
    address constant TICKITY_POAP = 0xd85612C44d575c00DA13eBb62dF2816CF7C22ACe;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing POAP Minting with Fresh Event");
        console.log("====================================");
        console.log("");

        // Fresh event address from the latest creation
        address freshEventAddress = 0x8E5DB588A737F937E95386F2d85DBEe4F749D831;
        
        Event freshEvent = Event(payable(freshEventAddress));
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);

        console.log("Fresh Event Address:", freshEventAddress);
        console.log("Event Name:", freshEvent.name());
        console.log("Event ID:", freshEvent.eventId());
        console.log("POAP Contract Address:", freshEvent.poapContract());
        console.log("");

        // Step 1: Purchase a ticket from the fresh event
        console.log("Step 1: Purchasing Ticket from Fresh Event...");
        uint256 ticketPrice = freshEvent.ticketPrices(0);
        console.log("Ticket Price:", ticketPrice, "USDT (6 decimals)");
        
        usdt.approve(freshEventAddress, ticketPrice);
        freshEvent.purchaseTicket(0);
        console.log("[SUCCESS] Ticket purchased successfully!");
        console.log("");

        // Step 2: Get the new ticket ID
        console.log("Step 2: Getting New Ticket ID...");
        address user = vm.addr(deployerPrivateKey);
        uint256[] memory userTickets = freshEvent.getUserTickets(user);
        uint256 newTicketId = userTickets[userTickets.length - 1];
        console.log("New Ticket ID:", newTicketId);
        console.log("");

        // Step 3: Use the ticket to trigger POAP minting
        console.log("Step 3: Using Ticket to Trigger POAP Minting...");
        console.log("(This should automatically mint a POAP)");
        
        try freshEvent.useTicket(newTicketId) {
            console.log("[SUCCESS] Ticket used successfully!");
            console.log("POAP should be automatically minted with debugging output");
        } catch Error(string memory reason) {
            console.log("[ERROR] Ticket usage failed:", reason);
            return;
        }
        console.log("");

        // Step 4: Verify POAP minting
        console.log("Step 4: Verifying POAP Minting...");
        bool hasClaimed = poapContract.hasUserClaimedPOAP(2, user); // Event ID 2
        
        if (hasClaimed) {
            console.log("[SUCCESS] POAP successfully minted for user!");
            uint256[] memory userPOAPs = poapContract.getUserPOAPs(user);
            console.log("User has", userPOAPs.length, "POAPs total");
            
            if (userPOAPs.length > 0) {
                uint256 latestPOAP = userPOAPs[userPOAPs.length - 1];
                console.log("Latest POAP ID:", latestPOAP);
                
                // Get POAP details
                try poapContract.getPOAP(latestPOAP) returns (uint256 poapEventId, uint256 eventId, uint256 ticketTokenId, address attendee, uint256 mintedAt, string memory metadataURI) {
                    console.log("POAP Event ID:", poapEventId);
                    console.log("Event ID:", eventId);
                    console.log("Ticket Token ID:", ticketTokenId);
                    console.log("Attendee:", attendee);
                    console.log("Minted At:", mintedAt);
                    console.log("Metadata URI:", metadataURI);
                } catch {
                    console.log("Error getting POAP details");
                }
            }
        } else {
            console.log("[ERROR] POAP not found for user");
            console.log("This indicates an issue with the POAP integration");
        }
        console.log("");

        // Step 5: Check POAP event details
        console.log("Step 5: POAP Event Details...");
        try poapContract.getPOAPEvent(2) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("POAP Event ID: 2");
            console.log("Name:", name);
            console.log("Description:", description);
            console.log("Event Contract:", eventContract);
            console.log("Is Active:", isActive);
            console.log("POAPs Minted:", minted);
            console.log("Created At:", createdAt);
        } catch {
            console.log("Error getting POAP event details");
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("Fresh Event POAP Test Complete!");
        console.log("===============================");
        if (hasClaimed) {
            console.log("[SUCCESS] POAP integration working correctly!");
            console.log("The complete POAP flow is now functional!");
            console.log("");
            console.log("Summary:");
            console.log("- Event ID: 2");
            console.log("- Ticket ID:", newTicketId);
            console.log("- POAP Event ID: 2");
            console.log("- User:", user);
            console.log("- POAP successfully minted!");
        } else {
            console.log("[ERROR] POAP integration failed");
            console.log("Check the debugging output above for details");
        }
    }
} 