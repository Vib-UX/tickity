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

        // Check POAP event details for event ID 5
        console.log("POAP Event Details for Event ID 5:");
        try poapContract.getPOAPEvent(2) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("Event ID:", eventId);
            console.log("Name:", name);
            console.log("Event Contract:", eventContract);
            console.log("Is Active:", isActive);
            console.log("POAPs Minted:", minted);
            console.log("");
            
            // Check if addresses match
            console.log("Address Verification:");
            console.log("Event Address:", eventAddress);
            console.log("POAP Event Contract:", eventContract);
            console.log("Addresses Match:", eventAddress == eventContract ? "YES" : "NO");
        } catch {
            console.log("Error getting POAP event details");
        }
        console.log("");

        // Check if user has claimed POAP for event ID 5
        address user = msg.sender;
        bool hasClaimed = poapContract.hasUserClaimedPOAP(5, user);
        console.log("User has claimed POAP for event ID 5:", hasClaimed ? "YES" : "NO");
        console.log("");

        // Check user's POAPs
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

        // Check again if user has claimed POAP
        hasClaimed = poapContract.hasUserClaimedPOAP(5, user);
        console.log("User has claimed POAP for event ID 5 (after ticket usage):", hasClaimed ? "YES" : "NO");
        
        userPOAPs = poapContract.getUserPOAPs(user);
        console.log("User's POAPs (after ticket usage):", userPOAPs.length);
        console.log("");

        vm.stopBroadcast();
        
        console.log("Address Verification Complete!");
        console.log("=============================");
    }
} 