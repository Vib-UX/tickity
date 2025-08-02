// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateGamingEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Web3 Gaming Tournament Event...");
        console.log("Deployer:", deployer);

        // Event details for an affordable gaming tournament
        string memory eventName = "Web3 Gaming Tournament & Esports Championship";
        string memory eventDescription = "Get ready for the ultimate Web3 gaming experience! Join our affordable gaming tournament featuring blockchain-based games, NFT rewards, and competitive esports action. Compete with players worldwide in various game categories, win exclusive NFT prizes, and be part of the future of gaming. Perfect for gamers, developers, and anyone interested in the intersection of gaming and blockchain technology!";
        string memory eventLocation = "Gaming Arena, Digital World";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 7); // 7 days from now (week-long tournament)

        // Ticket types for the gaming tournament with very affordable pricing (0.01-0.09 USDT range)
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Spectator Pass";
        ticketTypes[1] = "Player Entry";
        ticketTypes[2] = "Pro Gamer";
        ticketTypes[3] = "Tournament Judge";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 1e4;    // Spectator - 0.01 USDT
        ticketPrices[1] = 3e4;    // Player - 0.03 USDT
        ticketPrices[2] = 7e4;    // Pro - 0.07 USDT
        ticketPrices[3] = 9e4;    // Judge - 0.09 USDT

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 1000; // Spectator - unlimited
        ticketQuantities[1] = 500;  // Player - limited
        ticketQuantities[2] = 100;  // Pro - limited
        ticketQuantities[3] = 20;   // Judge - very limited

        // Create the event through factory
        EventFactory factory = EventFactory(EVENT_FACTORY);
        
        console.log("Creating event through factory...");
        factory.createEvent(
            eventName,
            eventDescription,
            startTime,
            endTime,
            eventLocation,
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            TICKITY_NFT
        );

        console.log("SUCCESS: Web3 Gaming Tournament Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(7 days from now)");
        console.log("Location:", eventLocation);
        console.log("Ticket Price Range: 0.01-0.09 USDT (Super Affordable!)");
        console.log("Highlights: Gaming Tournament, NFT Rewards, Esports Competition");
        console.log("Special Features: Blockchain Games, Competitive Prizes, Global Players");

        vm.stopBroadcast();
    }
} 