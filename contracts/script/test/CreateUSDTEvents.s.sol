// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/Event.sol";
import "../../src/TickityNFT.sol";

/**
 * @title CreateUSDTEvents
 * @dev Script to create events with proper USDT pricing (6 decimals)
 */
contract CreateUSDTEvents is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xf8B4f97d5AD7f3754a0d67E674b9692AA518514F;
    address constant TICKITY_NFT = 0x632654Be7eA0625DEa3D12857887Acb76dc3AE1b;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Events with Proper USDT Pricing");
        console.log("=========================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create events with proper USDT pricing
        createMusicFestival(factory);
        createTechConference(factory);
        createSportsChampionship(factory);
        createArtExhibition(factory);
        createComedyShow(factory);
        createGamingTournament(factory);
        createWorkshop(factory);
        createNetworkingEvent(factory);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All USDT-priced events created successfully!");
        console.log("All ticket prices are now in USDT with 6 decimals!");
    }

    function createMusicFestival(EventFactory factory) internal {
        console.log("Creating Etherlink Music Festival 2024 (USDT)...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "VIP Platinum Pass";
        ticketTypes[1] = "VIP Gold Pass";
        ticketTypes[2] = "General Admission";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 150000;  // 0.15 USDT (6 decimals)
        prices[1] = 80000;   // 0.08 USDT (6 decimals)
        prices[2] = 30000;   // 0.03 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 50;   // Limited VIP Platinum
        quantities[1] = 200;  // Limited VIP Gold
        quantities[2] = 0;    // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Music Festival 2024 (USDT)",
            "Experience the biggest blockchain music festival featuring top artists from around the world! 3-day festival with multiple stages, exclusive NFT merchandise, and VIP experiences. All prices in USDT.",
            block.timestamp + 45 days,
            block.timestamp + 45 days + 72 hours, // 3 days
            "Etherlink Arena & Festival Grounds",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Music Festival created at:", eventAddress);
        console.log("   VIP Platinum: 50 tickets @ 0.15 USDT");
        console.log("   VIP Gold: 200 tickets @ 0.08 USDT");
        console.log("   General Admission: Unlimited @ 0.03 USDT");
        console.log("");
    }

    function createTechConference(EventFactory factory) internal {
        console.log("Creating Etherlink DevCon 2024 (USDT)...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Developer Pass";
        ticketTypes[1] = "Student Pass";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 50000;  // 0.05 USDT (6 decimals)
        prices[1] = 20000;  // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 500;  // Limited Developer Pass
        quantities[1] = 100;  // Limited Student Pass

        address eventAddress = factory.createEvent(
            "Etherlink DevCon 2024 (USDT)",
            "Join the most innovative developers and blockchain enthusiasts for 2 days of workshops, hackathons, and networking. Learn about the latest in DeFi, NFTs, and blockchain technology. All prices in USDT.",
            block.timestamp + 30 days,
            block.timestamp + 30 days + 48 hours, // 2 days
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Tech Conference created at:", eventAddress);
        console.log("   Developer Pass: 500 tickets @ 0.05 USDT");
        console.log("   Student Pass: 100 tickets @ 0.02 USDT");
        console.log("");
    }

    function createSportsChampionship(EventFactory factory) internal {
        console.log("Creating Etherlink Championship Finals (USDT)...");
        
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Championship Box";
        ticketTypes[1] = "Premium Seating";
        ticketTypes[2] = "Standard Seating";
        ticketTypes[3] = "Standing Room";
        
        uint256[] memory prices = new uint256[](4);
        prices[0] = 250000;  // 0.25 USDT (6 decimals)
        prices[1] = 120000;  // 0.12 USDT (6 decimals)
        prices[2] = 60000;   // 0.06 USDT (6 decimals)
        prices[3] = 20000;   // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](4);
        quantities[0] = 20;   // Limited Championship Box
        quantities[1] = 100;  // Limited Premium Seating
        quantities[2] = 1000; // Limited Standard Seating
        quantities[3] = 0;    // Unlimited Standing Room

        address eventAddress = factory.createEvent(
            "Etherlink Championship Finals 2024 (USDT)",
            "Witness the most exciting sports championship with unlimited excitement! Championship game featuring top teams with exclusive VIP experiences and championship merchandise. All prices in USDT.",
            block.timestamp + 15 days,
            block.timestamp + 15 days + 4 hours,
            "Etherlink Stadium",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Sports Championship created at:", eventAddress);
        console.log("   Championship Box: 20 tickets @ 0.25 USDT");
        console.log("   Premium Seating: 100 tickets @ 0.12 USDT");
        console.log("   Standard Seating: 1000 tickets @ 0.06 USDT");
        console.log("   Standing Room: Unlimited @ 0.02 USDT");
        console.log("");
    }

    function createArtExhibition(EventFactory factory) internal {
        console.log("Creating Etherlink Digital Art Exhibition (USDT)...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Curator Pass";
        ticketTypes[1] = "General Admission";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 80000;  // 0.08 USDT (6 decimals)
        prices[1] = 15000;  // 0.015 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 75;  // Limited Curator Pass
        quantities[1] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Digital Art Exhibition 2024 (USDT)",
            "Explore the intersection of blockchain and digital art. Featuring exclusive NFT collections, live art creation, and interactive installations from world-renowned digital artists. All prices in USDT.",
            block.timestamp + 20 days,
            block.timestamp + 20 days + 168 hours, // 1 week
            "Etherlink Art Gallery",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Art Exhibition created at:", eventAddress);
        console.log("   Curator Pass: 75 tickets @ 0.08 USDT");
        console.log("   General Admission: Unlimited @ 0.015 USDT");
        console.log("");
    }

    function createComedyShow(EventFactory factory) internal {
        console.log("Creating Etherlink Comedy Night (USDT)...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "VIP Table";
        ticketTypes[1] = "Premium Seating";
        ticketTypes[2] = "General Admission";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 60000;  // 0.06 USDT (6 decimals)
        prices[1] = 40000;  // 0.04 USDT (6 decimals)
        prices[2] = 20000;  // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 10;  // Limited VIP Table
        quantities[1] = 50;  // Limited Premium Seating
        quantities[2] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Comedy Night (USDT)",
            "A night of laughter with top comedians from the crypto and tech world. Intimate venue with food and drinks included for VIP tables. Perfect for networking and entertainment! All prices in USDT.",
            block.timestamp + 10 days,
            block.timestamp + 10 days + 3 hours,
            "Etherlink Comedy Club",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Comedy Show created at:", eventAddress);
        console.log("   VIP Table: 10 tickets @ 0.06 USDT");
        console.log("   Premium Seating: 50 tickets @ 0.04 USDT");
        console.log("   General Admission: Unlimited @ 0.02 USDT");
        console.log("");
    }

    function createGamingTournament(EventFactory factory) internal {
        console.log("Creating Etherlink Gaming Championship (USDT)...");
        
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Champion Pass";
        ticketTypes[1] = "Player Pass";
        ticketTypes[2] = "Spectator VIP";
        ticketTypes[3] = "General Spectator";
        
        uint256[] memory prices = new uint256[](4);
        prices[0] = 100000;  // 0.1 USDT (6 decimals)
        prices[1] = 50000;   // 0.05 USDT (6 decimals)
        prices[2] = 30000;   // 0.03 USDT (6 decimals)
        prices[3] = 10000;   // 0.01 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](4);
        quantities[0] = 16;   // Limited Champion Pass
        quantities[1] = 64;   // Limited Player Pass
        quantities[2] = 100;  // Limited Spectator VIP
        quantities[3] = 0;    // Unlimited General

        address eventAddress = factory.createEvent(
            "Etherlink Gaming Championship 2024 (USDT)",
            "Join the ultimate blockchain gaming tournament! Compete in popular games, win prizes, and network with fellow gamers. Features include exclusive gaming NFTs, prize pools, and live streaming. All prices in USDT.",
            block.timestamp + 25 days,
            block.timestamp + 25 days + 48 hours, // 2 days
            "Etherlink Gaming Arena",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Gaming Tournament created at:", eventAddress);
        console.log("   Champion Pass: 16 tickets @ 0.1 USDT");
        console.log("   Player Pass: 64 tickets @ 0.05 USDT");
        console.log("   Spectator VIP: 100 tickets @ 0.03 USDT");
        console.log("   General Spectator: Unlimited @ 0.01 USDT");
        console.log("");
    }

    function createWorkshop(EventFactory factory) internal {
        console.log("Creating Blockchain Development Workshop (USDT)...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Full Workshop Pass";
        ticketTypes[1] = "Audit Pass";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 40000;  // 0.04 USDT (6 decimals)
        prices[1] = 20000;  // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 30;  // Limited Full Workshop
        quantities[1] = 20;  // Limited Audit Pass

        address eventAddress = factory.createEvent(
            "Advanced Smart Contract Development Workshop (USDT)",
            "Learn advanced Solidity development, security best practices, and DeFi protocol design. Hands-on coding sessions, code reviews, and networking with industry experts. All prices in USDT.",
            block.timestamp + 35 days,
            block.timestamp + 35 days + 8 hours, // 1 day
            "Etherlink Innovation Center",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Workshop created at:", eventAddress);
        console.log("   Full Workshop Pass: 30 tickets @ 0.04 USDT");
        console.log("   Audit Pass: 20 tickets @ 0.02 USDT");
        console.log("");
    }

    function createNetworkingEvent(EventFactory factory) internal {
        console.log("Creating Crypto Networking Mixer (USDT)...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "VIP Networking";
        ticketTypes[1] = "Standard Pass";
        ticketTypes[2] = "Student Pass";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 60000;  // 0.06 USDT (6 decimals)
        prices[1] = 30000;  // 0.03 USDT (6 decimals)
        prices[2] = 15000;  // 0.015 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 25;  // Limited VIP
        quantities[1] = 75;  // Limited Standard
        quantities[2] = 50;  // Limited Student

        address eventAddress = factory.createEvent(
            "Crypto & Blockchain Networking Mixer (USDT)",
            "Connect with blockchain entrepreneurs, developers, and investors. Enjoy drinks, appetizers, and meaningful conversations. Perfect for job seekers and startup founders. All prices in USDT.",
            block.timestamp + 12 days,
            block.timestamp + 12 days + 4 hours,
            "Etherlink Social Hub",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Networking Event created at:", eventAddress);
        console.log("   VIP Networking: 25 tickets @ 0.06 USDT");
        console.log("   Standard Pass: 75 tickets @ 0.03 USDT");
        console.log("   Student Pass: 50 tickets @ 0.015 USDT");
        console.log("");
    }
} 