// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/EventFactory.sol";
import "../../src/POAP.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

contract CreateRoboticsEvent is Script {
    // Contract addresses from latest deployment (with msg.sender fix)
    address constant EVENT_FACTORY = 0xa3e46640755727Ddf917Bd9F1430308d5Facc6EF;
    address constant TICKITY_NFT = 0xBA90Fddf9AC55d2BE1A7bE92058e2c54B80899bA;
    address constant POAP_CONTRACT = 0x679FA9d4830238913213b8ae49DcCdC95A43AcFC;
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B; // USDT contract from latest deployment

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Creating Robotics Innovation Summit 2025 Event...");
        console.log("Deployer:", deployer);

        // Event details with yellow cute robot mascot theme
        string memory eventName = "Robotics Innovation Summit 2025";
        string memory eventDescription = "Join us for the most exciting robotics event of the year! Meet our adorable yellow robot mascot 'Buzzy' and explore the future of robotics technology. This summit brings together robotics enthusiasts, engineers, researchers, and innovators from around the world. Features include robot demonstrations, AI workshops, coding competitions, and networking opportunities. Our cute yellow robot mascot will be your guide throughout this amazing journey into the world of robotics!";
        string memory eventLocation = "Tech Innovation Center, San Francisco";
        
        // Event timing (Future dates for testing)
        uint256 startTime = block.timestamp + 86400; // Tomorrow
        uint256 endTime = block.timestamp + (86400 * 3); // 3 days from now

        // Ticket types for the robotics event
        string[] memory ticketTypes = new string[](5);
        ticketTypes[0] = "Student Pass";
        ticketTypes[1] = "General Admission";
        ticketTypes[2] = "VIP Experience";
        ticketTypes[3] = "Workshop Access";
        ticketTypes[4] = "Robot Builder Pass";

        uint256[] memory ticketPrices = new uint256[](5);
        ticketPrices[0] = 25e6;   // Student - 25 USDT
        ticketPrices[1] = 75e6;   // General - 75 USDT
        ticketPrices[2] = 150e6;  // VIP - 150 USDT
        ticketPrices[3] = 100e6;  // Workshop - 100 USDT
        ticketPrices[4] = 200e6;  // Robot Builder - 200 USDT

        uint256[] memory ticketQuantities = new uint256[](5);
        ticketQuantities[0] = 200;  // Student - limited
        ticketQuantities[1] = 500;  // General - more available
        ticketQuantities[2] = 100;  // VIP - limited
        ticketQuantities[3] = 150;  // Workshop - limited
        ticketQuantities[4] = 50;   // Robot Builder - very limited

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

        console.log("SUCCESS: Robotics Innovation Summit 2025 Event created successfully!");
        console.log("Event Name:", eventName);
        console.log("Start Time:", startTime, "(Tomorrow)");
        console.log("End Time:", endTime, "(3 days from now)");
        console.log("Location:", eventLocation);
        console.log("Mascot: Buzzy the Yellow Cute Robot");
        console.log("Highlights: Robot Demos, AI Workshops, Coding Competitions");
        console.log("Special Features: Meet & Greet with Buzzy, Robot Building Workshops");

        vm.stopBroadcast();
    }
} 