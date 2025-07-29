// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/POAP.sol";

/**
 * @title ManualPOAPMint
 * @dev Script to manually test POAP minting
 */
contract ManualPOAPMint is Script {
    // New contract addresses from deployment with POAP integration
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Manual POAP Minting Test");
        console.log("========================");
        console.log("");

        POAP poapContract = POAP(TICKITY_POAP);
        address user = msg.sender;

        console.log("User Address:", user);
        console.log("");

        // Check current POAP count
        uint256[] memory userPOAPs = poapContract.getUserPOAPs(user);
        console.log("User's POAPs before minting:", userPOAPs.length);
        console.log("");

        // Try to manually mint a POAP for event ID 5 (our test event)
        console.log("Attempting to manually mint POAP...");
        console.log("Event ID: 5");
        console.log("User:", user);
        console.log("Ticket Token ID: 1");
        console.log("");

        try poapContract.mintPOAP(5, user, 1) {
            console.log("[SUCCESS] POAP minted manually!");
        } catch Error(string memory reason) {
            console.log("[ERROR] Manual POAP minting failed:", reason);
        }
        console.log("");

        // Check POAP count after minting
        userPOAPs = poapContract.getUserPOAPs(user);
        console.log("User's POAPs after minting:", userPOAPs.length);
        
        if (userPOAPs.length > 0) {
            uint256 latestPOAP = userPOAPs[userPOAPs.length - 1];
            console.log("Latest POAP ID:", latestPOAP);
            
            // Get POAP details
            try poapContract.getPOAP(latestPOAP) returns (uint256 poapEventId, uint256 eventId, uint256 ticketTokenId, address attendee, uint256 mintedAt, string memory metadataURI) {
                console.log("POAP Event ID:", poapEventId);
                console.log("Event ID:", eventId);
                console.log("Ticket Token ID:", ticketTokenId);
                console.log("Attendee:", attendee);
                console.log("Minted At:", mintedAt);
                console.log("Metadata URI:", metadataURI);
            } catch {
                console.log("Error getting POAP details");
            }
        }
        console.log("");

        // Check if user has claimed POAP for event ID 5
        bool hasClaimed = poapContract.hasUserClaimedPOAP(5, user);
        console.log("User has claimed POAP for event ID 5:", hasClaimed ? "YES" : "NO");
        console.log("");

        // Check POAP event details
        console.log("POAP Event Details for Event ID 5:");
        try poapContract.getPOAPEvent(2) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("Event ID:", eventId);
            console.log("Name:", name);
            console.log("Event Contract:", eventContract);
            console.log("Is Active:", isActive);
            console.log("POAPs Minted:", minted);
        } catch {
            console.log("Error getting POAP event details");
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("Manual POAP Minting Test Complete!");
        console.log("==================================");
    }
} 