// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Event.sol";
import "../src/TickityNFT.sol";

/**
 * @title TestPurchaseTicket
 * @dev Test script to demonstrate ticket purchasing functionality
 */
contract TestPurchaseTicket is Script {
    // Contract addresses from latest successful deployment
    address constant EVENT_FACTORY = 0xFb7528ecc9d55B44b5818ed75541D656D94eE3a5;
    address constant TICKITY_NFT = 0xc9e507467acE9A921efA4f4CE0DeCb6E5F64dDc6;
    
    // Event addresses from latest successful deployment
    address constant MUSIC_FESTIVAL = 0xFdf6FeE6D9A014C02C97fcb5f52d3a545b38792E;
    address constant TECH_CONFERENCE = 0x6bD3818301460c5Dd6014009b3c81acB7fb3c6c2;
    address constant SPORTS_EVENT = 0xDeB1476646Ec073ACe317CC77D973a0E6C8Be2fb;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing Ticket Purchase Functionality");
        console.log("=====================================");
        console.log("");

        // Test purchasing tickets from Music Festival
        testMusicFestivalTickets();
        
        // Test purchasing tickets from Tech Conference
        testTechConferenceTickets();
        
        // Test purchasing tickets from Sports Event
        testSportsEventTickets();

        vm.stopBroadcast();
        
        console.log("");
        console.log("Ticket purchase testing completed!");
    }

    function testMusicFestivalTickets() internal {
        console.log("Testing Music Festival Ticket Purchases");
        console.log("Event Address:", MUSIC_FESTIVAL);
        console.log("");

        Event musicEvent = Event(payable(MUSIC_FESTIVAL));
        
        // Get event name (public variable)
        string memory name = musicEvent.name();
        console.log("Event Name:", name);
        
        // Get event details
        string memory description = musicEvent.description();
        uint256 startTime = musicEvent.startTime();
        uint256 endTime = musicEvent.endTime();
        string memory location = musicEvent.location();
        
        console.log("Description:", description);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Location:", location);
        console.log("");
        
        // Test VIP Pass purchase (0.05 ETH)
        console.log("Attempting to purchase VIP Pass (0.05 ETH)...");
        try musicEvent.purchaseTicket(0) {
            console.log("SUCCESS: VIP Pass purchased!");
            
            // Check ticket count
            uint256 vipSold = musicEvent.soldByType(0);
            console.log("VIP tickets sold:", vipSold);
            
            // Check if user has tickets
            uint256[] memory userTickets = musicEvent.getUserTickets(msg.sender);
            console.log("User tickets count:", userTickets.length);
            
        } catch Error(string memory reason) {
            console.log("Purchase failed with reason:", reason);
        } catch (bytes memory) {
            console.log("Purchase failed with low level error");
        }
        
        console.log("");
        
        // Test General Admission purchase (0.02 ETH)
        console.log("Attempting to purchase General Admission (0.02 ETH)...");
        try musicEvent.purchaseTicket(1) {
            console.log("SUCCESS: General Admission purchased!");
            
            // Check ticket count
            uint256 generalSold = musicEvent.soldByType(1);
            console.log("General tickets sold:", generalSold);
            
            // Check if user has tickets
            uint256[] memory userTickets = musicEvent.getUserTickets(msg.sender);
            console.log("User tickets count:", userTickets.length);
            
        } catch Error(string memory reason) {
            console.log("Purchase failed with reason:", reason);
        } catch (bytes memory) {
            console.log("Purchase failed with low level error");
        }
        
        console.log("");
        console.log("----------------------------------------");
        console.log("");
    }

    function testTechConferenceTickets() internal {
        console.log("Testing Tech Conference Ticket Purchases");
        console.log("Event Address:", TECH_CONFERENCE);
        console.log("");

        Event techEvent = Event(payable(TECH_CONFERENCE));
        
        // Get event name (public variable)
        string memory name = techEvent.name();
        console.log("Event Name:", name);
        
        // Test Developer Pass purchase (0.01 ETH)
        console.log("Attempting to purchase Developer Pass (0.01 ETH)...");
        try techEvent.purchaseTicket(0) {
            console.log("SUCCESS: Developer Pass purchased!");
            
            // Check ticket count
            uint256 devPassSold = techEvent.soldByType(0);
            console.log("Developer Passes sold:", devPassSold);
            
            // Check if user has tickets
            uint256[] memory userTickets = techEvent.getUserTickets(msg.sender);
            console.log("User tickets count:", userTickets.length);
            
        } catch Error(string memory reason) {
            console.log("Purchase failed with reason:", reason);
        } catch (bytes memory) {
            console.log("Purchase failed with low level error");
        }
        
        console.log("");
        console.log("----------------------------------------");
        console.log("");
    }

    function testSportsEventTickets() internal {
        console.log("Testing Sports Event Ticket Purchases");
        console.log("Event Address:", SPORTS_EVENT);
        console.log("");

        Event sportsEvent = Event(payable(SPORTS_EVENT));
        
        // Get event name (public variable)
        string memory name = sportsEvent.name();
        console.log("Event Name:", name);
        
        // Test Championship Pass purchase (0.03 ETH)
        console.log("Attempting to purchase Championship Pass (0.03 ETH)...");
        try sportsEvent.purchaseTicket(0) {
            console.log("SUCCESS: Championship Pass purchased!");
            
            // Check ticket count
            uint256 championshipSold = sportsEvent.soldByType(0);
            console.log("Championship Passes sold:", championshipSold);
            
            // Check if user has tickets
            uint256[] memory userTickets = sportsEvent.getUserTickets(msg.sender);
            console.log("User tickets count:", userTickets.length);
            
        } catch Error(string memory reason) {
            console.log("Purchase failed with reason:", reason);
        } catch (bytes memory) {
            console.log("Purchase failed with low level error");
        }
        
        console.log("");
        console.log("----------------------------------------");
        console.log("");
    }
} 