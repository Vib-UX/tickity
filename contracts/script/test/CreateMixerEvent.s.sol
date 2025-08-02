// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateMixerEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Web3 Community Mixer Event...");
        console.log("Deployer:", deployer);

        // Event details for an affordable mixer
        string memory eventName = "Web3 Community Mixer & Networking Night";
        string memory eventDescription = "Join us for an exciting evening of networking, collaboration, and community building in the Web3 space! This affordable mixer brings together developers, entrepreneurs, investors, and enthusiasts for an evening of meaningful connections. Enjoy refreshments, lightning talks, project showcases, and plenty of networking opportunities. Perfect for anyone looking to expand their network in the blockchain ecosystem!";
        string memory eventLocation = "Innovation Hub, Downtown";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 2); // 2 days from now (evening event)

        // Ticket types for the mixer with affordable pricing (1-5 USDT range)
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Early Bird";
        ticketTypes[1] = "Standard Entry";
        ticketTypes[2] = "Student Discount";
        ticketTypes[3] = "VIP Networking";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 1e6;    // Early Bird - 1 USDT
        ticketPrices[1] = 3e6;    // Standard - 3 USDT
        ticketPrices[2] = 2e6;    // Student - 2 USDT
        ticketPrices[3] = 5e6;    // VIP - 5 USDT

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 50;   // Early Bird - limited
        ticketQuantities[1] = 200;  // Standard - more available
        ticketQuantities[2] = 100;  // Student - limited
        ticketQuantities[3] = 30;   // VIP - very limited

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

        console.log("SUCCESS: Web3 Community Mixer Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(1 day from now)");
        console.log("Location:", eventLocation);
        console.log("Ticket Price Range: 1-5 USDT (Affordable!)");
        console.log("Highlights: Networking, Lightning Talks, Project Showcases");
        console.log("Special Features: Refreshments, Community Building, Web3 Connections");

        vm.stopBroadcast();
    }
} 