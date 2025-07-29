// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title TestSimpleMultiplePOAPs
 * @dev Simple test script to verify multiple POAPs can be minted for the same user
 */
contract TestSimpleMultiplePOAPs is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0xC7A460ff2685B7C140B6a960aAAd38FB64b35F3F;
    address constant TICKITY_NFT = 0x63cf8c06E25F6fbE972F5de85C377Df7669fCaF7;
    address constant TICKITY_POAP = 0xd85612C44d575c00DA13eBb62dF2816CF7C22ACe;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing Simple Multiple POAPs");
        console.log("============================");
        console.log("");

        // Use the existing future event
        address eventAddress = 0x0ba78eD63B6478273Bb2E01DAB695aDA325Ae2Eb;
        
        Event testEvent = Event(payable(eventAddress));
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);
        address user = vm.addr(deployerPrivateKey);

        console.log("Event Address:", eventAddress);
        console.log("Event ID:", testEvent.eventId());
        console.log("User:", user);
        console.log("");

        // Step 1: Check initial POAP count using existing function
        console.log("Step 1: Checking Initial POAP Status...");
        bool hasClaimed = poapContract.hasUserClaimedPOAP(3, user);
        console.log("Has claimed POAP (should be false):", hasClaimed);
        
        uint256[] memory initialPOAPs = poapContract.getUserPOAPs(user);
        console.log("Initial total POAPs owned:", initialPOAPs.length);
        console.log("");

        // Step 2: Purchase a ticket
        console.log("Step 2: Purchasing Ticket...");
        uint256 ticketPrice = testEvent.ticketPrices(0);
        console.log("Ticket Price:", ticketPrice, "USDT (6 decimals)");
        
        usdt.approve(eventAddress, ticketPrice);
        testEvent.purchaseTicket(0);
        console.log("Ticket purchased successfully!");
        console.log("");

        // Step 3: Get the ticket ID
        console.log("Step 3: Getting Ticket ID...");
        uint256[] memory userTickets = testEvent.getUserTickets(user);
        uint256 ticketId = userTickets[userTickets.length - 1];
        console.log("Ticket ID:", ticketId);
        console.log("");

        // Step 4: Use the ticket to mint POAP
        console.log("Step 4: Using Ticket to Mint POAP...");
        
        try testEvent.useTicket(ticketId) {
            console.log("[SUCCESS] Ticket used successfully!");
            console.log("POAP should be minted!");
        } catch Error(string memory reason) {
            console.log("[ERROR] Failed to use ticket:", reason);
            return;
        }
        console.log("");

        // Step 5: Check if POAP was minted
        console.log("Step 5: Verifying POAP Minting...");
        uint256[] memory finalPOAPs = poapContract.getUserPOAPs(user);
        console.log("Final total POAPs owned:", finalPOAPs.length);
        
        if (finalPOAPs.length > initialPOAPs.length) {
            console.log("[SUCCESS] POAP successfully minted!");
            console.log("POAPs gained:", finalPOAPs.length - initialPOAPs.length);
            
            // Show the latest POAP details
            uint256 latestPOAP = finalPOAPs[finalPOAPs.length - 1];
            console.log("Latest POAP ID:", latestPOAP);
        } else {
            console.log("[ERROR] No POAP was minted");
        }
        console.log("");

        // Step 6: Try to use the same ticket again (should fail)
        console.log("Step 6: Testing Ticket Reuse (should fail)...");
        try testEvent.useTicket(ticketId) {
            console.log("[ERROR] Ticket was used twice - this shouldn't happen!");
        } catch Error(string memory reason) {
            console.log("[EXPECTED] Ticket reuse failed:", reason);
        }
        console.log("");

        // Step 7: Purchase another ticket and try to mint another POAP
        console.log("Step 7: Testing Multiple POAPs...");
        console.log("Purchasing another ticket...");
        
        usdt.approve(eventAddress, ticketPrice);
        testEvent.purchaseTicket(0);
        console.log("Second ticket purchased successfully!");
        
        uint256[] memory userTickets2 = testEvent.getUserTickets(user);
        uint256 ticketId2 = userTickets2[userTickets2.length - 1];
        console.log("Second Ticket ID:", ticketId2);
        
        console.log("Using second ticket...");
        try testEvent.useTicket(ticketId2) {
            console.log("[SUCCESS] Second ticket used successfully!");
            
            uint256[] memory finalPOAPs2 = poapContract.getUserPOAPs(user);
            console.log("Final total POAPs after second ticket:", finalPOAPs2.length);
            
            if (finalPOAPs2.length > finalPOAPs.length) {
                console.log("[SUCCESS] Multiple POAPs feature is working!");
                console.log("Additional POAPs gained:", finalPOAPs2.length - finalPOAPs.length);
            } else {
                console.log("[ERROR] Second POAP was not minted");
            }
        } catch Error(string memory reason) {
            console.log("[ERROR] Failed to use second ticket:", reason);
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("Simple Multiple POAPs Test Complete!");
        console.log("===================================");
        console.log("Summary:");
        console.log("- Initial POAPs:", initialPOAPs.length);
        console.log("- Final POAPs:", poapContract.getUserPOAPs(user).length);
        console.log("- POAPs gained:", poapContract.getUserPOAPs(user).length - initialPOAPs.length);
    }
} 