// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";

/**
 * @title TestUserAddress
 * @dev Simple test to verify user address
 */
contract TestUserAddress is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing User Address");
        console.log("===================");
        console.log("");
        
        address user = msg.sender;
        console.log("Script msg.sender (user):", user);
        console.log("");

        // Event address from the deployment
        address eventAddress = 0xFc2057d74aE0383c521053D3ac180Be93ae4a263;
        Event testEvent = Event(payable(eventAddress));
        
        console.log("Event Address:", eventAddress);
        console.log("Event Name:", testEvent.name());
        console.log("Event ID:", testEvent.eventId());
        console.log("");

        // Try to call a simple function to see what msg.sender is
        console.log("Calling event function to check msg.sender...");
        try testEvent.name() {
            console.log("Successfully called event function");
        } catch Error(string memory reason) {
            console.log("Error calling event function:", reason);
        }

        vm.stopBroadcast();
        
        console.log("");
        console.log("User Address Test Complete!");
    }
} 