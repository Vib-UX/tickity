// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/Event.sol";
import "../../src/TickityNFT.sol";
import "../../src/POAP.sol";

/**
 * @title CreateEventsWithPOAP
 * @dev Script to create events with integrated POAP functionality
 */
contract CreateEventsWithPOAP is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xf8B4f97d5AD7f3754a0d67E674b9692AA518514F;
    address constant TICKITY_NFT = 0x632654Be7eA0625DEa3D12857887Acb76dc3AE1b;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Events with Integrated POAP System");
        console.log("=============================================");
        console.log("");

        // Create EventFactory instance
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        // Create events with POAP integration
        createMusicFestivalWithPOAP(factory);
        createTechConferenceWithPOAP(factory);
        createGamingTournamentWithPOAP(factory);

        vm.stopBroadcast();
        
        console.log("");
        console.log("All events with POAP integration created successfully!");
        console.log("POAPs will be automatically minted when tickets are used!");
    }

    function createMusicFestivalWithPOAP(EventFactory factory) internal {
        console.log("Creating Etherlink Music Festival 2024 with POAP...");
        
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
            "Etherlink Music Festival 2024",
            "Experience the biggest blockchain music festival featuring top artists from around the world! 3-day festival with multiple stages, exclusive NFT merchandise, and VIP experiences.",
            block.timestamp + 45 days,
            block.timestamp + 45 days + 72 hours, // 3 days
            "Etherlink Arena & Festival Grounds",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT,
            "Etherlink Music Festival 2024 POAP",
            "Proof of attendance for the biggest blockchain music festival of 2024. This POAP commemorates your participation in this historic event featuring top artists, exclusive experiences, and the future of blockchain entertainment.",
            "https://ipfs.io/ipfs/QmMusicFestival2024Image",
            "https://etherlink.com/events/music-festival-2024"
        );

        console.log("   Music Festival with POAP created at:", eventAddress);
        console.log("   POAP: Etherlink Music Festival 2024 POAP");
        console.log("   VIP Platinum: 50 tickets @ 0.15 USDT");
        console.log("   VIP Gold: 200 tickets @ 0.08 USDT");
        console.log("   General Admission: Unlimited @ 0.03 USDT");
        console.log("");
    }

    function createTechConferenceWithPOAP(EventFactory factory) internal {
        console.log("Creating Etherlink DevCon 2024 with POAP...");
        
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
            "Etherlink DevCon 2024",
            "Join the most innovative developers and blockchain enthusiasts for 2 days of workshops, hackathons, and networking. Learn about the latest in DeFi, NFTs, and blockchain technology.",
            block.timestamp + 30 days,
            block.timestamp + 30 days + 48 hours, // 2 days
            "Etherlink Innovation Hub",
            ticketTypes,
            prices,
            quantities,
            TICKITY_NFT,
            "Etherlink DevCon 2024 POAP",
            "Proof of attendance for Etherlink DevCon 2024. This POAP represents your participation in the premier blockchain developer conference, featuring workshops, hackathons, and networking with industry leaders.",
            "https://ipfs.io/ipfs/QmDevCon2024Image",
            "https://etherlink.com/events/devcon-2024"
        );

        console.log("   Tech Conference with POAP created at:", eventAddress);
        console.log("   POAP: Etherlink DevCon 2024 POAP");
        console.log("   Developer Pass: 500 tickets @ 0.05 USDT");
        console.log("   Student Pass: 100 tickets @ 0.02 USDT");
        console.log("");
    }

    function createGamingTournamentWithPOAP(EventFactory factory) internal {
        console.log("Creating Etherlink Gaming Championship with POAP...");
        
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
            TICKITY_NFT,
            "Etherlink Gaming Championship 2024 POAP",
            "Proof of attendance for the Etherlink Gaming Championship 2024. This POAP commemorates your participation in the ultimate blockchain gaming tournament with exclusive prizes and networking opportunities.",
            "https://ipfs.io/ipfs/QmGamingChampionship2024Image",
            "https://etherlink.com/events/gaming-championship-2024"
        );

        console.log("   Gaming Tournament with POAP created at:", eventAddress);
        console.log("   POAP: Etherlink Gaming Championship 2024 POAP");
        console.log("   Champion Pass: 16 tickets @ 0.1 USDT");
        console.log("   Player Pass: 64 tickets @ 0.05 USDT");
        console.log("   Spectator VIP: 100 tickets @ 0.03 USDT");
        console.log("   General Spectator: Unlimited @ 0.01 USDT");
        console.log("");
    }
} 