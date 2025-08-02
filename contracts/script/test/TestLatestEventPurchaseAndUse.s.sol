// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";
import "../../src/TickityNFT.sol";
import "../../src/POAP.sol";

contract TestLatestEventPurchaseAndUse is Script {
    // Latest contract addresses from fresh deployment (with msg.sender fix)
    address constant EVENT_ADDRESS = 0x9b22c8B8371c54D9CFebA5386Cb26103733BE7E4; // New Etherlink hackathon
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;

    function run() external {
        uint256 buyerPrivateKey = vm.envUint("PRIVATE_KEY");
        address buyer = vm.addr(buyerPrivateKey);

        vm.startBroadcast(buyerPrivateKey);

        console2.log("=== Testing Latest Event: Purchase & Use Ticket ===");
        console2.log("Buyer:", buyer);
        console2.log("Event Address:", EVENT_ADDRESS);
        console2.log("Event Factory:", EVENT_FACTORY);
        console2.log("NFT Contract:", TICKITY_NFT);
        console2.log("POAP Contract:", POAP_CONTRACT);
        console2.log("USDT Contract:", USDT_CONTRACT);

        Event eventContract = Event(payable(EVENT_ADDRESS));
        IUSDT usdt = IUSDT(USDT_CONTRACT);
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);
        POAP poapContract = POAP(POAP_CONTRACT);

        // Check event details
        console2.log("\n--- Event Details ---");
        console2.log("Event Name:", eventContract.name());
        console2.log("Event Description:", eventContract.description());
        console2.log("Event Location:", eventContract.location());
        console2.log("Start Time:", eventContract.startTime());
        console2.log("End Time:", eventContract.endTime());
        console2.log("Event Status:", eventContract.isActive() ? "Active" : "Inactive");

        // Check buyer's initial state
        console2.log("\n--- Initial Buyer State ---");
        uint256 buyerUSDTBalance = usdt.balanceOf(buyer);
        console2.log("USDT Balance:", buyerUSDTBalance);
        console2.log("USDT Balance (formatted):", buyerUSDTBalance / 1e6, "USDT");

        uint256[] memory initialTickets = eventContract.getUserTickets(buyer);
        console2.log("Initial Tickets Owned:", initialTickets.length);

        // Check ticket types available
        console2.log("\n--- Available Ticket Types ---");
        for (uint256 i = 0; i < 4; i++) {
            try eventContract.ticketTypes(i) returns (string memory ticketType) {
                uint256 price = eventContract.ticketPrices(i);
                uint256 quantity = eventContract.ticketQuantities(i);
                uint256 sold = eventContract.soldByType(i);
                console2.log("Type", i, ":", ticketType);
                console2.log("  Price:", price);
                console2.log("  Price (formatted):", price / 1e6, "USDT");
                console2.log("  Quantity:", quantity);
                console2.log("  Sold:", sold);
                console2.log("  Available:", quantity - sold);
            } catch {
                console2.log("Type", i, ": Not available");
            }
        }

        // Purchase a ticket (try Early Bird - free ticket)
        console2.log("\n--- Purchasing Ticket ---");
        uint256 ticketTypeToPurchase = 0; // Early Bird Registration (Free)
        
        try eventContract.purchaseTicket(ticketTypeToPurchase) {
            console2.log("SUCCESS: Ticket purchased successfully!");
            
            // Check updated buyer state
            uint256 newUSDTBalance = usdt.balanceOf(buyer);
            console2.log("New USDT Balance:", newUSDTBalance);
            console2.log("USDT Spent:", buyerUSDTBalance - newUSDTBalance);
            
            uint256[] memory newTickets = eventContract.getUserTickets(buyer);
            console2.log("New Tickets Owned:", newTickets.length);
            
            if (newTickets.length > initialTickets.length) {
                uint256 newTicketId = newTickets[newTickets.length - 1];
                console2.log("New Ticket ID:", newTicketId);
                
                // Get ticket details from NFT contract
                TickityNFT.Ticket memory ticket = nftContract.getTicket(newTicketId);
                console2.log("Ticket Event ID:", ticket.eventId);
                console2.log("Ticket Type Index:", ticket.ticketType);
                console2.log("Ticket Owner:", nftContract.ownerOf(newTicketId));
                
                // Check if ticket is used
                bool isUsed = eventContract.usedTickets(newTicketId);
                console2.log("Ticket Used:", isUsed ? "Yes" : "No");
                
                // Use the ticket (this should mint a POAP)
                console2.log("\n--- Using Ticket (Should Mint POAP) ---");
                try eventContract.useTicket(newTicketId) {
                    console2.log("SUCCESS: Ticket used successfully!");
                    
                    // Check if ticket is now used
                    bool isUsedAfter = eventContract.usedTickets(newTicketId);
                    console2.log("Ticket Used After:", isUsedAfter ? "Yes" : "No");
                    
                    // Check POAP minting
                    console2.log("\n--- Checking POAP Minting ---");
                    uint256 userPOAPCount = poapContract.getUserPOAPCountForEvent(ticket.eventId, buyer);
                    console2.log("User POAP Count for Event:", userPOAPCount);
                    
                    if (userPOAPCount > 0) {
                        console2.log("SUCCESS: POAP was minted!");
                        
                        // Get user's POAPs
                        uint256[] memory userPOAPs = poapContract.getUserPOAPs(buyer);
                        console2.log("Total User POAPs:", userPOAPs.length);
                        
                        if (userPOAPs.length > 0) {
                            uint256 latestPOAPId = userPOAPs[userPOAPs.length - 1];
                            console2.log("Latest POAP ID:", latestPOAPId);
                            console2.log("Latest POAP Owner:", poapContract.ownerOf(latestPOAPId));
                            
                            // Try to get POAP URI
                            try poapContract.tokenURI(latestPOAPId) returns (string memory uri) {
                                console2.log("Latest POAP URI:", uri);
                            } catch {
                                console2.log("Could not get POAP URI");
                            }
                        }
                    } else {
                        console2.log("WARNING: No POAP was minted");
                    }
                    
                } catch Error(string memory reason) {
                    console2.log("ERROR: Failed to use ticket -", reason);
                } catch {
                    console2.log("ERROR: Failed to use ticket - Unknown error");
                }
                
            } else {
                console2.log("WARNING: No new ticket found after purchase");
            }
            
        } catch Error(string memory reason) {
            console2.log("ERROR: Failed to purchase ticket -", reason);
        } catch {
            console2.log("ERROR: Failed to purchase ticket - Unknown error");
        }

        vm.stopBroadcast();
        
        console2.log("\n=== Test Complete ===");
    }
} 