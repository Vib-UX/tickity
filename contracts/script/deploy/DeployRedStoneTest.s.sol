// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/RedStonePriceTest.sol";

contract DeployRedStoneTest is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Deploying RedStone Price Test Contract ===");
        console.log("Deployer:", deployer);
        console.log("Network: Etherlink Testnet");
        console.log("RedStone Service: Primary Production");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the test contract
        RedStonePriceTest priceTest = new RedStonePriceTest();
        
        vm.stopBroadcast();
        
        console.log("\n--- Deployment Results ---");
        console.log("RedStone Price Test Contract:", address(priceTest));
        
        console.log("\n--- Available Functions ---");
        console.log("- getXTZPrice() - Get XTZ/USD price");
        console.log("- getETHPrice() - Get ETH/USD price");
        console.log("- getBTCPrice() - Get BTC/USD price");
        console.log("- getMultiplePrices() - Get all prices at once");
        console.log("- testPriceFeeds() - Log prices to console");
        
        console.log("\n--- Testing Instructions ---");
        console.log("1. Use forge script to call testPriceFeeds()");
        console.log("2. Or use cast to call individual price functions");
        console.log("3. All prices are returned in 8 decimals precision");
        
        console.log("\n=== Deployment Complete ===");
        console.log("Contract ready for RedStone price feed testing!");
    }
} 