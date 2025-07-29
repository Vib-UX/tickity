// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/IUSDT.sol";
import "../src/Event.sol";
import "../src/TickityMarketplace.sol";

/**
 * @title TestUSDTTicketPurchase
 * @dev Script to test USDT ticket purchases after deployment
 */
contract TestUSDTTicketPurchase is Script {
    // USDT contract address on Etherlink testnet
    address constant USDT_CONTRACT = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
    
    // Deployed contract addresses (update these after deployment)
    address constant NFT_CONTRACT = 0x632654Be7eA0625DEa3D12857887Acb76dc3AE1b;
    address constant FACTORY_CONTRACT = 0xf8B4f97d5AD7f3754a0d67E674b9692AA518514F;
    address constant MARKETPLACE_CONTRACT = 0xa52309eD1DE8781CBeECEF9d05B4B09B209B2493;
    
    // Test event addresses (update these after deployment)
    address constant MUSIC_EVENT = 0x17d9207E742E6e806123CB5cb8DF04e0513D55c4;
    address constant TECH_EVENT = 0x6Eca0faba1916fb1B164176F7b71DE088DAadF5e;
    address constant SPORTS_EVENT = 0xaa51ae81b06b939C0AA2f4651A3cB1180975DBf9;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing USDT Ticket Purchases...");
        console.log("=================================");

        IUSDT usdt = IUSDT(USDT_CONTRACT);
        Event musicEvent = Event(payable(MUSIC_EVENT));
        Event techEvent = Event(payable(TECH_EVENT));
        Event sportsEvent = Event(payable(SPORTS_EVENT));
        TickityMarketplace marketplace = TickityMarketplace(payable(MARKETPLACE_CONTRACT));

        // Check USDT balance
        uint256 balance = usdt.balanceOf(msg.sender);
        console.log("USDT Balance:", balance);
        console.log("USDT Balance (USDT):", balance / 1e6);

        // Test 1: Purchase VIP ticket from Music Festival (3.0 USDT)
        console.log("");
        console.log("Test 1: Purchasing VIP ticket from Music Festival (3.0 USDT)");
        console.log("-----------------------------------------------------------");
        
        uint256 vipPrice = 3000000; // 3.0 USDT
        console.log("VIP Ticket Price:", vipPrice, "wei (3.0 USDT)");
        
        // Approve USDT spending
        usdt.approve(address(musicEvent), vipPrice);
        console.log("USDT approved for Music Event");
        
        // Purchase ticket
        musicEvent.purchaseTicket(0); // VIP ticket (index 0)
        console.log("VIP ticket purchased successfully!");
        
        // Check updated balance
        uint256 newBalance = usdt.balanceOf(msg.sender);
        console.log("New USDT Balance:", newBalance / 1e6, "USDT");
        console.log("USDT spent:", (balance - newBalance) / 1e6, "USDT");

        // Test 2: Purchase General ticket from Music Festival (1.5 USDT)
        console.log("");
        console.log("Test 2: Purchasing General ticket from Music Festival (1.5 USDT)");
        console.log("----------------------------------------------------------------");
        
        uint256 generalPrice = 1500000; // 1.5 USDT
        console.log("General Ticket Price:", generalPrice, "wei (1.5 USDT)");
        
        // Approve USDT spending
        usdt.approve(address(musicEvent), generalPrice);
        console.log("USDT approved for Music Event");
        
        // Purchase ticket
        musicEvent.purchaseTicket(1); // General ticket (index 1)
        console.log("General ticket purchased successfully!");
        
        // Check updated balance
        balance = usdt.balanceOf(msg.sender);
        console.log("New USDT Balance:", balance / 1e6, "USDT");

        // Test 3: Purchase Developer Pass from Tech Conference (2.0 USDT)
        console.log("");
        console.log("Test 3: Purchasing Developer Pass from Tech Conference (2.0 USDT)");
        console.log("------------------------------------------------------------------");
        
        uint256 devPrice = 2000000; // 2.0 USDT
        console.log("Developer Pass Price:", devPrice, "wei (2.0 USDT)");
        
        // Approve USDT spending
        usdt.approve(address(techEvent), devPrice);
        console.log("USDT approved for Tech Event");
        
        // Purchase ticket
        techEvent.purchaseTicket(0); // Developer Pass (index 0)
        console.log("Developer Pass purchased successfully!");
        
        // Check updated balance
        balance = usdt.balanceOf(msg.sender);
        console.log("New USDT Balance:", balance / 1e6, "USDT");

        // Test 4: Purchase Championship Pass from Sports Event (4.0 USDT)
        console.log("");
        console.log("Test 4: Purchasing Championship Pass from Sports Event (4.0 USDT)");
        console.log("------------------------------------------------------------------");
        
        uint256 championshipPrice = 4000000; // 4.0 USDT
        console.log("Championship Pass Price:", championshipPrice, "wei (4.0 USDT)");
        
        // Approve USDT spending
        usdt.approve(address(sportsEvent), championshipPrice);
        console.log("USDT approved for Sports Event");
        
        // Purchase ticket
        sportsEvent.purchaseTicket(0); // Championship Pass (index 0)
        console.log("Championship Pass purchased successfully!");
        
        // Check final balance
        balance = usdt.balanceOf(msg.sender);
        console.log("Final USDT Balance:", balance / 1e6, "USDT");

        // Test 5: List ticket on marketplace
        console.log("");
        console.log("Test 5: Listing ticket on marketplace");
        console.log("-------------------------------------");
        
        // We need to approve the marketplace to transfer our NFT
        // This would require the NFT contract address and token ID
        console.log("Note: Marketplace listing test requires NFT contract interaction");
        console.log("This would be tested in a separate script with NFT contract calls");

        console.log("");
        console.log("USDT Ticket Purchase Tests Complete!");
        console.log("=====================================");
        console.log("All ticket purchases successful with USDT payments");

        vm.stopBroadcast();
    }
} 