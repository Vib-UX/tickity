// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityNFT.sol";

/**
 * @title CreateRealEvents
 * @dev Script to create real events with actual data for comprehensive testing
 */
contract CreateRealEvents is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xFb7528ecc9d55B44b5818ed75541D656D94eE3a5;
    address constant TICKITY_NFT = 0xc9e507467acE9A921efA4f4CE0DeCb6E5F64dDc6;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Real Events with Actual Data");
        console.log("=====================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create multiple real events
        createMusicFestival(factory);
        createTechConference(factory);
        createSportsChampionship(factory);
        createArtExhibition(factory);
        createComedyShow(factory);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All real events created successfully!");
        console.log("Ready for comprehensive testing and demonstration!");
    }

    function createMusicFestival(EventFactory factory) internal {
        console.log("Creating Etherlink Music Festival 2024...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "VIP Platinum Pass";
        ticketTypes[1] = "VIP Gold Pass";
        ticketTypes[2] = "General Admission";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 0.15 ether;  // 0.15 ETH
        prices[1] = 0.08 ether;  // 0.08 ETH
        prices[2] = 0.03 ether;  // 0.03 ETH
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 50;   // Limited VIP Platinum
        quantities[1] = 200;  // Limited VIP Gold
        quantities[2] = 0;    // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Music Festival 2024",
            "Experience the biggest blockchain music festival featuring top artists from around the world! 3-day festival with multiple stages, exclusive NFT merchandise, and VIP experiences.",
            block.timestamp + 45 days,
            block.timestamp + 45 days + 72 hours, // 3 days
            "Etherlink Arena & Festival Grounds",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Music Festival created at:", eventAddress);
        console.log("   VIP Platinum: 50 tickets @ 0.15 ETH");
        console.log("   VIP Gold: 200 tickets @ 0.08 ETH");
        console.log("   General Admission: Unlimited @ 0.03 ETH");
        console.log("");
    }

    function createTechConference(EventFactory factory) internal {
        console.log("Creating Etherlink DevCon 2024...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Developer Pass";
        ticketTypes[1] = "Student Pass";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 0.05 ether;  // 0.05 ETH
        prices[1] = 0.02 ether;  // 0.02 ETH
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 500;  // Limited Developer Pass
        quantities[1] = 100;  // Limited Student Pass

        address eventAddress = factory.createEvent(
            "Etherlink DevCon 2024",
            "Join the most innovative developers and blockchain enthusiasts for 2 days of workshops, hackathons, and networking. Learn about the latest in DeFi, NFTs, and blockchain technology.",
            block.timestamp + 30 days,
            block.timestamp + 30 days + 48 hours, // 2 days
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Tech Conference created at:", eventAddress);
        console.log("   Developer Pass: 500 tickets @ 0.05 ETH");
        console.log("   Student Pass: 100 tickets @ 0.02 ETH");
        console.log("");
    }

    function createSportsChampionship(EventFactory factory) internal {
        console.log("Creating Etherlink Championship Finals...");
        
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Championship Box";
        ticketTypes[1] = "Premium Seating";
        ticketTypes[2] = "Standard Seating";
        ticketTypes[3] = "Standing Room";
        
        uint256[] memory prices = new uint256[](4);
        prices[0] = 0.25 ether;  // 0.25 ETH
        prices[1] = 0.12 ether;  // 0.12 ETH
        prices[2] = 0.06 ether;  // 0.06 ETH
        prices[3] = 0.02 ether;  // 0.02 ETH
        
        uint256[] memory quantities = new uint256[](4);
        quantities[0] = 20;   // Limited Championship Box
        quantities[1] = 100;  // Limited Premium Seating
        quantities[2] = 1000; // Limited Standard Seating
        quantities[3] = 0;    // Unlimited Standing Room

        address eventAddress = factory.createEvent(
            "Etherlink Championship Finals 2024",
            "Witness the most exciting sports championship with unlimited excitement! Championship game featuring top teams with exclusive VIP experiences and championship merchandise.",
            block.timestamp + 15 days,
            block.timestamp + 15 days + 4 hours,
            "Etherlink Stadium",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Sports Championship created at:", eventAddress);
        console.log("   Championship Box: 20 tickets @ 0.25 ETH");
        console.log("   Premium Seating: 100 tickets @ 0.12 ETH");
        console.log("   Standard Seating: 1000 tickets @ 0.06 ETH");
        console.log("   Standing Room: Unlimited @ 0.02 ETH");
        console.log("");
    }

    function createArtExhibition(EventFactory factory) internal {
        console.log("Creating Etherlink Digital Art Exhibition...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Curator Pass";
        ticketTypes[1] = "General Admission";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 0.08 ether;  // 0.08 ETH
        prices[1] = 0.015 ether; // 0.015 ETH
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 75;  // Limited Curator Pass
        quantities[1] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Digital Art Exhibition 2024",
            "Explore the intersection of blockchain and digital art. Featuring exclusive NFT collections, live art creation, and interactive installations from world-renowned digital artists.",
            block.timestamp + 20 days,
            block.timestamp + 20 days + 168 hours, // 1 week
            "Etherlink Art Gallery",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Art Exhibition created at:", eventAddress);
        console.log("   Curator Pass: 75 tickets @ 0.08 ETH");
        console.log("   General Admission: Unlimited @ 0.015 ETH");
        console.log("");
    }

    function createComedyShow(EventFactory factory) internal {
        console.log("Creating Etherlink Comedy Night...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "VIP Table";
        ticketTypes[1] = "Premium Seating";
        ticketTypes[2] = "General Admission";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 0.06 ether;  // 0.06 ETH
        prices[1] = 0.04 ether;  // 0.04 ETH
        prices[2] = 0.02 ether;  // 0.02 ETH
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 10;  // Limited VIP Table
        quantities[1] = 50;  // Limited Premium Seating
        quantities[2] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Comedy Night",
            "A night of laughter with top comedians from the crypto and tech world. Intimate venue with food and drinks included for VIP tables. Perfect for networking and entertainment!",
            block.timestamp + 10 days,
            block.timestamp + 10 days + 3 hours,
            "Etherlink Comedy Club",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Comedy Show created at:", eventAddress);
        console.log("   VIP Table: 10 tickets @ 0.06 ETH");
        console.log("   Premium Seating: 50 tickets @ 0.04 ETH");
        console.log("   General Admission: Unlimited @ 0.02 ETH");
        console.log("");
    }
} 