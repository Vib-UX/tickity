// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityPOAP.sol";
import "../src/IUSDT.sol";

/**
 * @title TestTxOriginDebug
 * @dev Test script to debug user address issue with tx.origin
 */
contract TestTxOriginDebug is Script {
    // Updated contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x166028CF5dbb113b44451A6205e119E8119A6F16;
    address constant TICKITY_NFT = 0xee1E6B5918f02fc106d146460A32Ea20B3CE0bC8;
    address constant TICKITY_POAP = 0x0Ad7485fb4Fe6bADe19BB6892804cd31392A34cB;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing tx.origin Debugging");
        console.log("===========================");
        console.log("");

        // Event address from the deployment
        address eventAddress = 0x60A87004B1148e80ec944489AB09308a35b50889;
        
        Event testEvent = Event(payable(eventAddress));
        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        IUSDT usdt = IUSDT(USDT_CONTRACT);

        console.log("Event Address:", eventAddress);
        console.log("Event Name:", testEvent.name());
        console.log("Event ID:", testEvent.eventId());
        console.log("POAP Contract Address:", testEvent.poapContract());
        console.log("");

        // Step 1: Purchase a ticket
        console.log("Step 1: Purchasing Ticket...");
        uint256 ticketPrice = testEvent.ticketPrices(0);
        console.log("Ticket Price:", ticketPrice, "USDT (6 decimals)");
        
        usdt.approve(eventAddress, ticketPrice);
        testEvent.purchaseTicket(0);
        console.log("[SUCCESS] Ticket purchased successfully!");
        console.log("");

        // Step 2: Use the ticket to see tx.origin debugging
        console.log("Step 2: Using Ticket with tx.origin Debugging...");
        
        uint256 ticketId = 1; // First ticket purchased
        try testEvent.useTicket(ticketId) {
            console.log("[SUCCESS] Ticket used successfully!");
            console.log("Check the debugging output above for msg.sender vs tx.origin");
        } catch Error(string memory reason) {
            console.log("[ERROR] Ticket usage failed:", reason);
            return;
        }
        console.log("");

        // Step 3: Verify POAP minting
        console.log("Step 3: Verifying POAP Minting...");
        address user = msg.sender;
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

        vm.stopBroadcast();
        
        console.log("tx.origin Debug Test Complete!");
        console.log("==============================");
        console.log("Check the debugging output above to understand the address issue");
    }
} 