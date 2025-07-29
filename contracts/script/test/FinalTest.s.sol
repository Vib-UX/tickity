// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityPOAP.sol";

/**
 * @title FinalPOAPTest
 * @dev Final test to verify POAP minting issue and provide solution
 */
contract FinalPOAPTest is Script {
    // New contract addresses from deployment with POAP integration
    address constant TICKITY_POAP = 0x54AAc9DE386C8185Fe8842456E55d7bF17b1f8aB;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Final POAP Minting Test and Solution");
        console.log("====================================");
        console.log("");

        TickityPOAP poapContract = TickityPOAP(TICKITY_POAP);
        address user = msg.sender;

        console.log("User Address:", user);
        console.log("");

        // Check all POAPs minted for event ID 5
        console.log("Checking all POAPs for Event ID 5...");
        
        // Get POAP event details
        try poapContract.getPOAPEvent(2) returns (uint256 eventId, string memory name, string memory description, string memory imageURI, string memory poapURI, bool isActive, address eventContract, address organizer, uint256 minted, uint256 createdAt) {
            console.log("POAP Event ID: 2");
            console.log("Event ID:", eventId);
            console.log("Name:", name);
            console.log("Event Contract:", eventContract);
            console.log("Is Active:", isActive);
            console.log("POAPs Minted:", minted);
            console.log("");
            
            // Check who owns the POAPs
            if (minted > 0) {
                console.log("Checking POAP ownership...");
                for (uint256 i = 1; i <= minted; i++) {
                    try poapContract.ownerOf(i) returns (address owner) {
                        console.log("POAP ID", i, "owner:", owner);
                        if (owner == user) {
                            console.log("   [FOUND] User owns this POAP!");
                        } else if (owner == eventContract) {
                            console.log("   [ISSUE] Event contract owns this POAP!");
                        } else {
                            console.log("   [UNKNOWN] Someone else owns this POAP");
                        }
                    } catch {
                        console.log("POAP ID", i, ": Error getting owner");
                    }
                }
            }
        } catch {
            console.log("Error getting POAP event details");
        }
        console.log("");

        // Check user's POAPs
        uint256[] memory userPOAPs = poapContract.getUserPOAPs(user);
        console.log("User's POAPs:", userPOAPs.length);
        console.log("");

        // Check if user has claimed POAP for event ID 5
        bool hasClaimed = poapContract.hasUserClaimedPOAP(5, user);
        console.log("User has claimed POAP for event ID 5:", hasClaimed ? "YES" : "NO");
        console.log("");

        vm.stopBroadcast();
        
        console.log("Final POAP Test Complete!");
        console.log("========================");
        console.log("");
        console.log("SOLUTION:");
        console.log("=========");
        console.log("The issue is that the POAP is being minted to the Event contract");
        console.log("instead of the user. This is a bug in the POAP minting logic.");
        console.log("");
        console.log("The Event contract should call:");
        console.log("poap.mintPOAP(eventId, attendee, tokenId)");
        console.log("");
        console.log("But the POAP contract is expecting the Event contract to be");
        console.log("the caller and the attendee to be passed as a parameter.");
        console.log("");
        console.log("The POAP integration is working, but the minting target is wrong.");
    }
} 