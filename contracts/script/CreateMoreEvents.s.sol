// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityNFT.sol";

/**
 * @title CreateMoreEvents
 * @dev Script to create additional diverse events for comprehensive platform testing
 */
contract CreateMoreEvents is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xf8B4f97d5AD7f3754a0d67E674b9692AA518514F;
    address constant TICKITY_NFT = 0x632654Be7eA0625DEa3D12857887Acb76dc3AE1b;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Additional Diverse Events");
        console.log("==================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create various types of events
        createGamingTournament(factory);
        createWorkshop(factory);
        createNetworkingEvent(factory);
        createCharityGala(factory);
        createHackathon(factory);
        createMeetup(factory);
        createWebinar(factory);
        createExhibition(factory);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All additional events created successfully!");
        console.log("Platform now has a diverse range of events for testing!");
    }

    function createGamingTournament(EventFactory factory) internal {
        console.log("Creating Etherlink Gaming Championship...");
        
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
            "Etherlink Gaming Championship 2024",
            "Join the ultimate blockchain gaming tournament! Compete in popular games, win prizes, and network with fellow gamers. Features include exclusive gaming NFTs, prize pools, and live streaming.",
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
        console.log("Creating Blockchain Development Workshop...");
        
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
            "Advanced Smart Contract Development Workshop",
            "Learn advanced Solidity development, security best practices, and DeFi protocol design. Hands-on coding sessions, code reviews, and networking with industry experts.",
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
        console.log("Creating Crypto Networking Mixer...");
        
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
            "Crypto & Blockchain Networking Mixer",
            "Connect with blockchain entrepreneurs, developers, and investors. Enjoy drinks, appetizers, and meaningful conversations. Perfect for job seekers and startup founders.",
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

    function createCharityGala(EventFactory factory) internal {
        console.log("Creating Blockchain Charity Gala...");
        
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Diamond Sponsor";
        ticketTypes[1] = "Gold Sponsor";
        ticketTypes[2] = "Silver Sponsor";
        ticketTypes[3] = "General Admission";
        
        uint256[] memory prices = new uint256[](4);
        prices[0] = 500000;  // 0.5 USDT (6 decimals)
        prices[1] = 250000;  // 0.25 USDT (6 decimals)
        prices[2] = 100000;  // 0.1 USDT (6 decimals)
        prices[3] = 50000;   // 0.05 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](4);
        quantities[0] = 10;  // Limited Diamond
        quantities[1] = 20;  // Limited Gold
        quantities[2] = 50;  // Limited Silver
        quantities[3] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Blockchain for Good Charity Gala",
            "Join us for an elegant evening supporting blockchain education initiatives. Enjoy fine dining, live entertainment, and auctions. All proceeds go to blockchain education programs.",
            block.timestamp + 40 days,
            block.timestamp + 40 days + 6 hours,
            "Etherlink Grand Ballroom",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Charity Gala created at:", eventAddress);
        console.log("   Diamond Sponsor: 10 tickets @ 0.5 USDT");
        console.log("   Gold Sponsor: 20 tickets @ 0.25 USDT");
        console.log("   Silver Sponsor: 50 tickets @ 0.1 USDT");
        console.log("   General Admission: Unlimited @ 0.05 USDT");
        console.log("");
    }

    function createHackathon(EventFactory factory) internal {
        console.log("Creating DeFi Hackathon...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "Hacker Pass";
        ticketTypes[1] = "Mentor Pass";
        ticketTypes[2] = "Observer Pass";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 20000;  // 0.02 USDT (6 decimals)
        prices[1] = 10000;  // 0.01 USDT (6 decimals)
        prices[2] = 5000;   // 0.005 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 100; // Limited Hacker
        quantities[1] = 20;  // Limited Mentor
        quantities[2] = 0;   // Unlimited Observer

        address eventAddress = factory.createEvent(
            "DeFi Innovation Hackathon",
            "Build the next generation of DeFi protocols! 48-hour hackathon with mentorship, workshops, and $50K in prizes. Network with VCs and industry leaders.",
            block.timestamp + 18 days,
            block.timestamp + 18 days + 48 hours, // 2 days
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Hackathon created at:", eventAddress);
        console.log("   Hacker Pass: 100 tickets @ 0.02 USDT");
        console.log("   Mentor Pass: 20 tickets @ 0.01 USDT");
        console.log("   Observer Pass: Unlimited @ 0.005 USDT");
        console.log("");
    }

    function createMeetup(EventFactory factory) internal {
        console.log("Creating Monthly Blockchain Meetup...");
        
        string[] memory ticketTypes = new string[](2);
        ticketTypes[0] = "Premium Member";
        ticketTypes[1] = "Regular Member";
        
        uint256[] memory prices = new uint256[](2);
        prices[0] = 15000;  // 0.015 USDT (6 decimals)
        prices[1] = 8000;   // 0.008 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](2);
        quantities[0] = 40;  // Limited Premium
        quantities[1] = 0;   // Unlimited Regular

        address eventAddress = factory.createEvent(
            "Monthly Blockchain Meetup - December 2024",
            "Monthly gathering for blockchain enthusiasts. This month's topic: 'The Future of Layer 2 Solutions'. Includes networking, Q&A session, and refreshments.",
            block.timestamp + 8 days,
            block.timestamp + 8 days + 3 hours,
            "Etherlink Community Center",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Meetup created at:", eventAddress);
        console.log("   Premium Member: 40 tickets @ 0.015 USDT");
        console.log("   Regular Member: Unlimited @ 0.008 USDT");
        console.log("");
    }

    function createWebinar(EventFactory factory) internal {
        console.log("Creating NFT Masterclass Webinar...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "Premium Access";
        ticketTypes[1] = "Standard Access";
        ticketTypes[2] = "Student Access";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 25000;  // 0.025 USDT (6 decimals)
        prices[1] = 15000;  // 0.015 USDT (6 decimals)
        prices[2] = 8000;   // 0.008 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 50;  // Limited Premium
        quantities[1] = 0;   // Unlimited Standard
        quantities[2] = 0;   // Unlimited Student

        address eventAddress = factory.createEvent(
            "NFT Masterclass: From Creation to Marketplace",
            "Learn everything about NFTs in this comprehensive webinar. Topics include: NFT creation, smart contracts, marketplace integration, and monetization strategies.",
            block.timestamp + 5 days,
            block.timestamp + 5 days + 2 hours,
            "Virtual Event (Zoom)",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Webinar created at:", eventAddress);
        console.log("   Premium Access: 50 tickets @ 0.025 USDT");
        console.log("   Standard Access: Unlimited @ 0.015 USDT");
        console.log("   Student Access: Unlimited @ 0.008 USDT");
        console.log("");
    }

    function createExhibition(EventFactory factory) internal {
        console.log("Creating Metaverse Art Exhibition...");
        
        string[] memory ticketTypes = new string[](3);
        ticketTypes[0] = "Curator Experience";
        ticketTypes[1] = "VIP Access";
        ticketTypes[2] = "General Admission";
        
        uint256[] memory prices = new uint256[](3);
        prices[0] = 80000;  // 0.08 USDT (6 decimals)
        prices[1] = 40000;  // 0.04 USDT (6 decimals)
        prices[2] = 20000;  // 0.02 USDT (6 decimals)
        
        uint256[] memory quantities = new uint256[](3);
        quantities[0] = 15;  // Limited Curator
        quantities[1] = 60;  // Limited VIP
        quantities[2] = 0;   // Unlimited General

        address eventAddress = factory.createEvent(
            "Metaverse Art Exhibition: Digital Renaissance",
            "Experience the future of art in our immersive metaverse exhibition. Featuring digital artists, VR installations, and interactive NFT galleries. A blend of technology and creativity.",
            block.timestamp + 22 days,
            block.timestamp + 22 days + 120 hours, // 5 days
            "Etherlink Metaverse Gallery",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT
        );

        console.log("   Exhibition created at:", eventAddress);
        console.log("   Curator Experience: 15 tickets @ 0.08 USDT");
        console.log("   VIP Access: 60 tickets @ 0.04 USDT");
        console.log("   General Admission: Unlimited @ 0.02 USDT");
        console.log("");
    }
} 