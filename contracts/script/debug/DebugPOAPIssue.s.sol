// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/Event.sol";
import "../../src/POAP.sol";

/**
 * @title DebugPOAPIssue
 * @dev Script to debug the POAP minting issue
 */
contract DebugPOAPIssue is Script {
    // New contract addresses from deployment with POAP integration
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Debugging POAP Minting Issue");
        console.log("============================");
        console.log("");

        // Event address from the new 30-second event
        address eventAddress = 0x4e373bb270A9c5f79E2149075D23456C013fEb22;
        
        Event testEvent = Event(payable(eventAddress));
        POAP poapContract = POAP(TICKITY_POAP);

        console.log("Event Address:", eventAddress);
        console.log("Event Name:", testEvent.name());
        console.log("Event ID (from Event contract):", testEvent.eventId());
        console.log("POAP Contract Address:", testEvent.poapContract());
        console.log("");

        // Check all POAP events
        console.log("Checking POAP Events...");
        console.log("POAP Event ID 1:");
        try poapContract.getPOAPEvent(1) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("   Event ID:", eventId);
            console.log("   Name:", name);
            console.log("   Event Contract:", eventContract);
            console.log("   Is Active:", isActive);
            console.log("   POAPs Minted:", minted);
        } catch {
            console.log("   POAP Event 1 not found");
        }
        
        console.log("POAP Event ID 2:");
        try poapContract.getPOAPEvent(2) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("   Event ID:", eventId);
            console.log("   Name:", name);
            console.log("   Event Contract:", eventContract);
            console.log("   Is Active:", isActive);
            console.log("   POAPs Minted:", minted);
        } catch {
            console.log("   POAP Event 2 not found");
        }
        
        console.log("POAP Event ID 3:");
        try poapContract.getPOAPEvent(3) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("   Event ID:", eventId);
            console.log("   Name:", name);
            console.log("   Event Contract:", eventContract);
            console.log("   Is Active:", isActive);
            console.log("   POAPs Minted:", minted);
        } catch {
            console.log("   POAP Event 3 not found");
        }
        
        console.log("POAP Event ID 4:");
        try poapContract.getPOAPEvent(4) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("   Event ID:", eventId);
            console.log("   Name:", name);
            console.log("   Event Contract:", eventContract);
            console.log("   Is Active:", isActive);
            console.log("   POAPs Minted:", minted);
        } catch {
            console.log("   POAP Event 4 not found");
        }
        
        console.log("POAP Event ID 5:");
        try poapContract.getPOAPEvent(5) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("   Event ID:", eventId);
            console.log("   Name:", name);
            console.log("   Event Contract:", eventContract);
            console.log("   Is Active:", isActive);
            console.log("   POAPs Minted:", minted);
        } catch {
            console.log("   POAP Event 5 not found");
        }
        console.log("");

        // Check if user has claimed POAP for different event IDs
        console.log("Checking User POAP Claims...");
        address user = msg.sender;
        
        for (uint256 i = 1; i <= 5; i++) {
            bool hasClaimed = poapContract.hasUserClaimedPOAP(i, user);
            console.log("   Event ID", i, ":", hasClaimed ? "CLAIMED" : "NOT CLAIMED");
        }
        console.log("");

        // Check user's POAPs
        console.log("User's POAPs:");
        uint256[] memory userPOAPs = poapContract.getUserPOAPs(user);
        console.log("   Total POAPs:", userPOAPs.length);
        
        for (uint256 i = 0; i < userPOAPs.length; i++) {
            console.log("   POAP ID:", userPOAPs[i]);
            try poapContract.getPOAP(userPOAPs[i]) returns (uint256 poapEventId, uint256 eventId, uint256 ticketTokenId, address attendee, uint256 mintedAt, string memory metadataURI) {
                console.log("     POAP Event ID:", poapEventId);
                console.log("     Event ID:", eventId);
                console.log("     Ticket Token ID:", ticketTokenId);
                console.log("     Attendee:", attendee);
            } catch {
                console.log("     Error getting POAP details");
            }
        }
        console.log("");

        vm.stopBroadcast();
        
        console.log("Debug Complete!");
        console.log("==============");
    }
} 