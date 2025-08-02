// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateEtherlinkHackathon is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Etherlink Encode Club Summer of Code 2025 Event...");
        console.log("Deployer:", deployer);

        // Event details
        string memory eventName = "Etherlink Encode Club Summer of Code 2025";
        string memory eventDescription = "A global, fully virtual hackathon focused on building innovative projects on the Etherlink platform - a fast, EVM-compatible Layer 2 blockchain using Tezos Smart Rollup technology. The event runs from July 3 to August 3, 2025 and is organized by Encode Club with support from Trilitech (Tezos R&D), Goldsky, Sequence, Thirdweb, and Redstone.";
        string memory eventLocation = "Virtual (Online)";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 32); // 32 days from now

        // Ticket types for the hackathon
        string[] memory ticketTypes = new string[](4);
        ticketTypes[0] = "Early Bird Registration";
        ticketTypes[1] = "Standard Registration";
        ticketTypes[2] = "VIP Registration";
        ticketTypes[3] = "Mentor Pass";

        uint256[] memory ticketPrices = new uint256[](4);
        ticketPrices[0] = 0;      // Early bird - free
        ticketPrices[1] = 50e6;   // Standard - 50 USDT
        ticketPrices[2] = 100e6;  // VIP - 100 USDT
        ticketPrices[3] = 0;      // Mentor - free

        uint256[] memory ticketQuantities = new uint256[](4);
        ticketQuantities[0] = 100;  // Early bird - limited
        ticketQuantities[1] = 500;  // Standard - more available
        ticketQuantities[2] = 50;   // VIP - limited
        ticketQuantities[3] = 20;   // Mentor - very limited

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

        console.log("SUCCESS: Etherlink Encode Club Summer of Code 2025 Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(32 days from now)");
        console.log("Location:", eventLocation);
        console.log("Total Prize Pool: $30,000 - $40,000");
        console.log("Tracks: DeFi, Gaming, Social/Creative, Vibecode");
        console.log("Technology: Etherlink L2 with Tezos Smart Rollup");

        vm.stopBroadcast();
    }
} 