// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateEtherlinkHackathon is Script {
    // Contract addresses from latest deployment
    address constant EVENT_FACTORY = 0x3b082F6Ea285761f862608f28Ff420a8592201Cd;
    address constant TICKITY_NFT = 0x39a450990A9A778172201f1CFC0e205E5D0B15d4;
    address constant POAP_CONTRACT = 0x82C2B08463706885C5e92A6317bF81b01e70A1c2;
    address constant USDT_CONTRACT = 0x4b0bfE8F6391F5F3187008B5b8C38C3d3A2b8bD1; // Mock USDT on Etherlink

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