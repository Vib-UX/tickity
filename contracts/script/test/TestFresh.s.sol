// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/Event.sol";
import "../../src/POAP.sol";
import "../../src/IUSDT.sol";

/**
 * @title TestFreshPOAP
 * @dev Test script to purchase a fresh ticket and use it for POAP testing
 */
contract TestFreshPOAP is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0xC7A460ff2685B7C140B6a960aAAd38FB64b35F3F;
    address constant TICKITY_NFT = 0x63cf8c06E25F6fbE972F5de85C377Df7669fCaF7;
    address constant TICKITY_POAP = 0xd85612C44d575c00DA13eBb62dF2816CF7C22ACe;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing Fresh POAP Minting");
        console.log("==========================");
        console.log("");

        // Event address from the deployment
        address eventAddress = 0xFc2057d74aE0383c521053D3ac180Be93ae4a263;
        
        Event testEvent = Event(payable(eventAddress));
        POAP poapContract = POAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);

        console.log("Event Address:", eventAddress);
        console.log("Event Name:", testEvent.name());
        console.log("Event ID:", testEvent.eventId());
        console.log("POAP Contract Address:", testEvent.poapContract());
        console.log("");

        // Step 1: Purchase a fresh ticket
        console.log("Step 1: Purchasing Fresh Ticket...");
        uint256 ticketPrice = testEvent.ticketPrices(0);
        console.log("Ticket Price:", ticketPrice, "USDT (6 decimals)");
        
        usdt.approve(eventAddress, ticketPrice);
        testEvent.purchaseTicket(0);
        console.log("[SUCCESS] Fresh ticket purchased successfully!");
        console.log("");

        // Step 2: Get the new ticket ID (should be the next available one)
        console.log("Step 2: Getting New Ticket ID...");
        address user = vm.addr(deployerPrivateKey);
        uint256[] memory userTickets = testEvent.getUserTickets(user);
        uint256 newTicketId = userTickets[userTickets.length - 1];
        console.log("New Ticket ID:", newTicketId);
        console.log("");

        // Step 3: Use the fresh ticket
        console.log("Step 3: Using Fresh Ticket...");
        console.log("(No event start time restriction - can use immediately)");
        
        try testEvent.useTicket(newTicketId) {
            console.log("[SUCCESS] Fresh ticket used successfully!");
            console.log("POAP should be automatically minted with debugging output");
        } catch Error(string memory reason) {
            console.log("[ERROR] Ticket usage failed:", reason);
            return;
        }
        console.log("");

        // Step 4: Verify POAP minting
        console.log("Step 4: Verifying POAP Minting...");
        bool hasClaimed = poapContract.hasUserClaimedPOAP(1, user); // Event ID 1
        
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
        try poapContract.getPOAPEvent(1) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("POAP Event ID: 1");
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
        
        console.log("Fresh POAP Test Complete!");
        console.log("=========================");
        if (hasClaimed) {
            console.log("[SUCCESS] POAP integration working correctly!");
            console.log("The complete POAP flow is now functional!");
        } else {
            console.log("[ERROR] POAP integration failed");
            console.log("Check the debugging output above for details");
        }
    }
} 