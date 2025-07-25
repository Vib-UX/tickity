// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/TickityNFT.sol";

/**
 * @title TestTickets
 * @dev Testing script for ticket minting, purchasing, and marketplace functionality
 */
contract TestTickets is Script {
    // Deployed contract addresses
    address constant EVENT_FACTORY = 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74;
    address constant MARKETPLACE = 0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf;
    address constant TICKITY_NFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Ticket Testing on Etherlink Testnet");
        console.log("=============================================");

        // Initialize contract instances
        EventFactory factory = EventFactory(EVENT_FACTORY);
        TickityMarketplace marketplace = TickityMarketplace(payable(MARKETPLACE));
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);

        // Step 1: Create a test event
        console.log("Creating Test Event...");
        address eventAddress = createTestEvent(factory);

        // Step 1.5: Set event ID and register event in NFT contract
        console.log("Setting Event ID and registering event...");
        Event eventContract = Event(payable(eventAddress));
        
        // Register the event in the NFT contract first
        nftContract.createEvent(
            eventAddress,
            "Test Event for Ticket Testing",
            "A test event to verify ticket minting and purchasing functionality",
            1753479375, // startTime
            1753493775, // endTime
            "Test Arena"
        );
        
        // Set the event ID to match the NFT contract event ID (1)
        eventContract.setEventId(1);

        // Create event in NFT contract
        nftContract.createEvent(
            eventAddress,
            "Test Event for Ticket Testing",
            "A test event to verify ticket minting and purchasing functionality",
            1753479375, // startTime
            1753493775, // endTime
            "Test Arena"
        );

        console.log("  Event registered in NFT contract");
        console.log("");

        // Create event with dynamic minting
        string memory eventName2 = "Dynamic Minting Event";
        string memory eventDescription2 = "An event with dynamic ticket minting - no predetermined limits!";
        uint256 startTime2 = block.timestamp + 10 days;
        uint256 endTime2 = startTime2 + 6 hours;
        string memory location2 = "Dynamic Arena";
        
        string[] memory ticketTypes2 = new string[](2);
        ticketTypes2[0] = "VIP Pass";
        ticketTypes2[1] = "General Admission";
        
        uint256[] memory ticketPrices2 = new uint256[](2);
        ticketPrices2[0] = 0.05 ether;
        ticketPrices2[1] = 0.02 ether;
        
        uint256[] memory ticketQuantities2 = new uint256[](2);
        ticketQuantities2[0] = 100; // Limited VIP tickets
        ticketQuantities2[1] = 0;   // Unlimited general tickets

        address eventAddress2 = factory.createEvent(
            eventName2,
            eventDescription2,
            startTime2,
            endTime2,
            location2,
            ticketTypes2,
            ticketPrices2,
            ticketQuantities2,
            TICKITY_NFT
        );

        console.log("  Dynamic Event created at:", eventAddress2);
        console.log("  VIP Tickets: Limited to", ticketQuantities2[0]);
        console.log("  General Tickets: Unlimited");
        console.log("");

        // Create event in NFT contract
        nftContract.createEvent(
            eventAddress2,
            eventName2,
            eventDescription2,
            startTime2,
            endTime2,
            location2
        );

        // Step 2: Test ticket purchasing
        console.log("Testing Ticket Purchasing...");
        testTicketPurchasing(eventContract, nftContract);

        // Step 3: Test marketplace listing
        console.log("Testing Marketplace Listing...");
        testMarketplaceListing(marketplace, nftContract);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All ticket tests completed successfully!");
    }

    function createTestEvent(EventFactory factory) internal returns (address) {
        string memory eventName = "Test Event for Ticket Testing";
        string memory eventDescription = "A test event to verify ticket minting and purchasing functionality";
        uint256 startTime = block.timestamp + 7 days;
        uint256 endTime = startTime + 4 hours;
        string memory location = "Test Arena";
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Test Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.001 ether; // Low price for testing
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 100; // Limited to 100 tickets

        address eventAddress = factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            location,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("  Test Event created at:", eventAddress);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", ticketQuantities[0]);
        console.log("");

        return eventAddress;
    }

    function testTicketPurchasing(Event eventContract, TickityNFT nftContract) internal {
        uint256 ticketPrice = eventContract.ticketPrices(0); // Get first ticket type price
        uint256 ticketsToBuy = 3;

        console.log("  Purchasing", ticketsToBuy, "tickets...");
        console.log("  Total cost:", ticketPrice * ticketsToBuy);

        // Purchase tickets (ticket type index 0)
        for (uint256 i = 0; i < ticketsToBuy; i++) {
            eventContract.purchaseTicket{value: ticketPrice}(0);
            console.log("  Ticket", i + 1, "purchased successfully");
        }

        // Check ticket balance from NFT contract
        uint256 balance = nftContract.balanceOf(msg.sender);
        console.log("  Total tickets owned:", balance);
        console.log("");
    }

    function testMarketplaceListing(TickityMarketplace marketplace, TickityNFT nftContract) internal {
        console.log("  Testing marketplace listing functionality...");
        
        // Get the first token ID (assuming we have tickets)
        uint256 tokenId = 1;
        
        // Check if we own the token
        if (nftContract.ownerOf(tokenId) == msg.sender) {
            console.log("  Token", tokenId, "owned by deployer");
            
            // Approve marketplace to transfer token
            nftContract.approve(address(marketplace), tokenId);
            console.log("  Approved marketplace for token", tokenId);
            
            // List token for sale
            uint256 listingPrice = 0.002 ether; // 2x original price
            marketplace.listTicket(tokenId, listingPrice);
            console.log("  Listed token", tokenId, "for", listingPrice);
            
        } else {
            console.log("  No tokens owned by deployer for marketplace testing");
        }
        
        console.log("");
    }
} 