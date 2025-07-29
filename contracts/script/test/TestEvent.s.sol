// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/Event.sol";
import "../../src/TickityNFT.sol";

/**
 * @title TestSingleEvent
 * @dev Simple test script to create one event and test ticket purchasing
 */
contract TestSingleEvent is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xFb7528ecc9d55B44b5818ed75541D656D94eE3a5;
    address constant TICKITY_NFT = 0xc9e507467acE9A921efA4f4CE0DeCb6E5F64dDc6;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing Single Event Creation and Ticket Purchase");
        console.log("================================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        console.log("Creating a simple test event...");
        
        // Create a simple event
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "General Admission";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 0.01 ether;
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 0; // Unlimited tickets

        address eventAddress = factory.createEvent(
            "Test Event",
            "A simple test event for ticket purchasing",
            block.timestamp + 7 days,
            block.timestamp + 7 days + 4 hours,
            "Test Venue",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("Event created at:", eventAddress);
        console.log("");

        // Test ticket purchase
        Event testEvent = Event(payable(eventAddress));
        
        console.log("Attempting to purchase a ticket...");
        try testEvent.purchaseTicket(0) {
            console.log("SUCCESS: Ticket purchased!");
            
            // Check ticket count
            uint256 ticketsSold = testEvent.soldByType(0);
            console.log("Tickets sold:", ticketsSold);
            
            // Check if user has tickets
            uint256[] memory userTickets = testEvent.getUserTickets(msg.sender);
            console.log("User tickets count:", userTickets.length);
            
        } catch Error(string memory reason) {
            console.log("Purchase failed with reason:", reason);
        } catch (bytes memory) {
            console.log("Purchase failed with low level error");
        }

        vm.stopBroadcast();
        
        console.log("");
        console.log("Test completed!");
    }
} 