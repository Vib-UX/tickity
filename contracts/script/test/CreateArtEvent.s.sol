// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateArtEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating NFT Art Exhibition Event...");
        console.log("Deployer:", deployer);

        // Event details for an affordable art exhibition
        string memory eventName = "Digital Art & NFT Exhibition 2025";
        string memory eventDescription = "Experience the future of art at our affordable digital art and NFT exhibition! Discover amazing digital artworks, meet talented artists, and explore the world of blockchain art. This exhibition showcases cutting-edge digital art, interactive installations, and exclusive NFT collections. Perfect for art enthusiasts, collectors, and anyone curious about the intersection of art and technology!";
        string memory eventLocation = "Digital Art Gallery, Metaverse";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 5); // 5 days from now

        // Ticket types for the art exhibition with very affordable pricing (0.01-0.08 USDT range)
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Virtual Viewer";
        ticketTypes[1] = "Art Enthusiast";
        ticketTypes[2] = "Collector Pass";
        ticketTypes[3] = "Artist Workshop";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 1e4;    // Virtual Viewer - 0.01 USDT
        ticketPrices[1] = 4e4;    // Art Enthusiast - 0.04 USDT
        ticketPrices[2] = 6e4;    // Collector - 0.06 USDT
        ticketPrices[3] = 8e4;    // Workshop - 0.08 USDT

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 2000; // Virtual Viewer - unlimited
        ticketQuantities[1] = 300;  // Art Enthusiast - limited
        ticketQuantities[2] = 150;  // Collector - limited
        ticketQuantities[3] = 50;   // Workshop - very limited

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

        console.log("SUCCESS: Digital Art & NFT Exhibition Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(5 days from now)");
        console.log("Location:", eventLocation);
        console.log("Ticket Price Range: 0.01-0.08 USDT (Super Affordable!)");
        console.log("Highlights: Digital Art, NFT Collections, Artist Meetups");
        console.log("Special Features: Virtual Gallery, Interactive Installations, Art Workshops");

        vm.stopBroadcast();
    }
} 