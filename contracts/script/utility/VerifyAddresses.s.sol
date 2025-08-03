// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/Event.sol";
import "../../src/POAP.sol";

/**
 * @title VerifyAddresses
 * @dev Script to verify addresses and debug POAP minting
 */
contract VerifyAddresses is Script {
    // New contract addresses from deployment with POAP integration
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Verifying Addresses and POAP Minting");
        console.log("====================================");
        console.log("");

        // Event address from the new 30-second event
        address eventAddress = 0x4e373bb270A9c5f79E2149075D23456C013fEb22;
        
        Event testEvent = Event(payable(eventAddress));
        POAP poapContract = POAP(TICKITY_POAP);

        console.log("Event Address:", eventAddress);
        console.log("Event ID:", testEvent.eventId());
        console.log("POAP Contract Address:", testEvent.poapContract());
        console.log("");

        // Check POAP contract details
        console.log("POAP Contract Details:");
        console.log("Total POAPs minted:", poapContract.totalPOAPs());
        console.log("");
        
        // Check user's POAPs
        address user = msg.sender;
        uint256[] memory userPOAPs = poapContract.getUserPOAPs(user);
        console.log("User's POAPs:", userPOAPs.length);
        console.log("");

        // Try to use ticket again to see if POAP gets minted
        console.log("Attempting to use ticket again...");
        try testEvent.useTicket(1) {
            console.log("[SUCCESS] Ticket used successfully!");
        } catch Error(string memory reason) {
            console.log("[ERROR] Ticket usage failed:", reason);
        }
        console.log("");

        // Check user's POAPs after ticket usage
        uint256[] memory userPOAPsAfter = poapContract.getUserPOAPs(user);
        console.log("User's POAPs (after ticket usage):", userPOAPsAfter.length);
        console.log("");

        vm.stopBroadcast();
        
        console.log("Address Verification Complete!");
        console.log("=============================");
    }
} 