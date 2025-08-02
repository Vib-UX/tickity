// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateFitnessEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Web3 Fitness Challenge Event...");
        console.log("Deployer:", deployer);

        // Event details for an affordable fitness challenge
        string memory eventName = "Web3 Fitness Challenge & Wellness Festival";
        string memory eventDescription = "Join our affordable Web3 fitness challenge and get fit while earning crypto rewards! Participate in virtual fitness challenges, compete with others worldwide, and earn NFT achievements for your accomplishments. This event combines traditional fitness with blockchain technology, featuring workout sessions, wellness workshops, and gamified fitness tracking. Perfect for fitness enthusiasts, crypto lovers, and anyone looking to stay healthy while earning rewards!";
        string memory eventLocation = "Virtual Fitness Studio & Global Challenges";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 14); // 14 days from now (2-week challenge)

        // Ticket types for the fitness challenge with very affordable pricing (0.01-0.09 USDT range)
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Basic Participant";
        ticketTypes[1] = "Fitness Enthusiast";
        ticketTypes[2] = "Challenge Competitor";
        ticketTypes[3] = "Wellness Coach";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 1e4;    // Basic Participant - 0.01 USDT
        ticketPrices[1] = 3e4;    // Fitness Enthusiast - 0.03 USDT
        ticketPrices[2] = 6e4;    // Challenge Competitor - 0.06 USDT
        ticketPrices[3] = 9e4;    // Wellness Coach - 0.09 USDT

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 5000; // Basic Participant - unlimited
        ticketQuantities[1] = 1000; // Fitness Enthusiast - limited
        ticketQuantities[2] = 300;  // Challenge Competitor - limited
        ticketQuantities[3] = 50;   // Wellness Coach - very limited

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

        console.log("SUCCESS: Web3 Fitness Challenge Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(14 days from now)");
        console.log("Location:", eventLocation);
        console.log("Ticket Price Range: 0.01-0.09 USDT (Super Affordable!)");
        console.log("Highlights: Fitness Challenges, Crypto Rewards, NFT Achievements");
        console.log("Special Features: Virtual Workouts, Wellness Workshops, Gamified Tracking");

        vm.stopBroadcast();
    }
} 