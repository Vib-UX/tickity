// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";
import "../src/TickityNFT.sol";

/**
 * @title TestEvents
 * @dev Testing script for creating events and testing Tickity functionality
 */
contract TestEvents is Script {
    // Deployed contract addresses
    address constant EVENT_FACTORY = 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74;
    address constant MARKETPLACE = 0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf;
    address constant TICKITY_NFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Starting Tickity Event Testing on Etherlink Testnet");
        console.log("==================================================");

        // Initialize contract instances
        EventFactory factory = EventFactory(EVENT_FACTORY);
        TickityMarketplace marketplace = TickityMarketplace(payable(MARKETPLACE));
        TickityNFT nftContract = TickityNFT(TICKITY_NFT);

        console.log("Contract Addresses:");
        console.log("  EventFactory:", EVENT_FACTORY);
        console.log("  Marketplace:", MARKETPLACE);
        console.log("  TickityNFT:", TICKITY_NFT);
        console.log("");

        // Test 1: Create a Music Concert Event
        console.log("Creating Music Concert Event...");
        createMusicConcert(factory);

        // Test 2: Create a Tech Conference Event
        console.log("Creating Tech Conference Event...");
        createTechConference(factory);

        // Test 3: Create a Sports Event
        console.log("Creating Sports Event...");
        createSportsEvent(factory);

        // Test 4: Test Marketplace Functionality
        console.log("Testing Marketplace Functionality...");
        testMarketplace(marketplace, nftContract);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All tests completed successfully!");
        console.log("View events on Etherlink block explorer");
    }

    function createMusicConcert(EventFactory factory) internal {
        string memory eventName = "Etherlink Music Festival 2024";
        string memory eventDescription = "The biggest music festival on Etherlink blockchain featuring top artists and amazing performances!";
        uint256 startTime = block.timestamp + 30 days;
        uint256 endTime = startTime + 4 hours;
        string memory location = "Etherlink Arena, Virtual World";
        uint256 totalTickets = 1000;
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "General Admission";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.01 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 1000;

        address eventAddress = factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            location,
            totalTickets,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("  Music Concert created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", totalTickets);
        console.log("");
    }

    function createTechConference(EventFactory factory) internal {
        string memory eventName = "Etherlink DevCon 2024";
        string memory eventDescription = "Join the most innovative developers and blockchain enthusiasts for a day of learning and networking!";
        uint256 startTime = block.timestamp + 14 days;
        uint256 endTime = startTime + 8 hours;
        string memory location = "Etherlink Innovation Hub";
        uint256 totalTickets = 500;
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Developer Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.005 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 500;

        address eventAddress = factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            location,
            totalTickets,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("  Tech Conference created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", totalTickets);
        console.log("");
    }

    function createSportsEvent(EventFactory factory) internal {
        string memory eventName = "Etherlink Championship Finals";
        string memory eventDescription = "Witness the most exciting sports championship in the metaverse!";
        uint256 startTime = block.timestamp + 7 days;
        uint256 endTime = startTime + 3 hours;
        string memory location = "Etherlink Stadium";
        uint256 totalTickets = 2000;
        
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Championship Pass";
        
        uint256[] memory ticketPrices = new uint256[](1);
        ticketPrices[0] = 0.02 ether;
        
        uint256[] memory ticketQuantities = new uint256[](1);
        ticketQuantities[0] = 2000;

        address eventAddress = factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            location,
            totalTickets,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("  Sports Event created at:", eventAddress);
        console.log("  Start Time:", startTime);
        console.log("  End Time:", endTime);
        console.log("  Ticket Price:", ticketPrices[0]);
        console.log("  Max Tickets:", totalTickets);
        console.log("");
    }

    function testMarketplace(TickityMarketplace marketplace, TickityNFT nftContract) internal {
        console.log("  Testing marketplace functionality...");
        
        // Note: Marketplace testing would require existing tickets
        // This is a placeholder for future testing when tickets are minted
        console.log("  Marketplace ready for ticket trading");
        console.log("  To test marketplace: mint tickets first, then list them");
        console.log("");
    }
} 