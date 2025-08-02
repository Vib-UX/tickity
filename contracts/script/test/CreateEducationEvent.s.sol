// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateEducationEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Blockchain Education Summit Event...");
        console.log("Deployer:", deployer);

        // Event details for an affordable education summit
        string memory eventName = "Blockchain Education Summit & Learning Festival";
        string memory eventDescription = "Join our affordable blockchain education summit and expand your knowledge in the world of Web3! This comprehensive learning festival features workshops, tutorials, expert talks, and hands-on coding sessions. Learn about smart contracts, DeFi, NFTs, and blockchain development from industry experts. Perfect for beginners, developers, and anyone eager to learn about blockchain technology!";
        string memory eventLocation = "Virtual Learning Center";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 10); // 10 days from now (extended learning period)

        // Ticket types for the education summit with very affordable pricing (0.01-0.09 USDT range)
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Audit Pass";
        ticketTypes[1] = "Student Access";
        ticketTypes[2] = "Workshop Participant";
        ticketTypes[3] = "Premium Learning";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 1e4;    // Audit Pass - 0.01 USDT
        ticketPrices[1] = 2e4;    // Student - 0.02 USDT
        ticketPrices[2] = 5e4;    // Workshop - 0.05 USDT
        ticketPrices[3] = 9e4;    // Premium - 0.09 USDT

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 5000; // Audit Pass - unlimited
        ticketQuantities[1] = 1000; // Student - limited
        ticketQuantities[2] = 200;  // Workshop - limited
        ticketQuantities[3] = 100;  // Premium - limited

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

        console.log("SUCCESS: Blockchain Education Summit Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(10 days from now)");
        console.log("Location:", eventLocation);
        console.log("Ticket Price Range: 0.01-0.09 USDT (Super Affordable!)");
        console.log("Highlights: Workshops, Tutorials, Expert Talks, Coding Sessions");
        console.log("Special Features: Smart Contracts, DeFi, NFTs, Blockchain Development");

        vm.stopBroadcast();
    }
} 