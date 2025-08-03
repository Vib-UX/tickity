// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/RedStonePriceTest.sol";

contract TestRedStonePriceFeeds is Script {
    // Contract address (replace with actual deployed address)
    address constant PRICE_TEST_CONTRACT = 0x5Aec29209AC94141A9DA96D3451175C98e254b31; // Deployed contract address
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Testing RedStone Production Price Feeds ===");
        console.log("Deployer:", deployer);
        console.log("Test Contract:", PRICE_TEST_CONTRACT);
        console.log("RedStone Service: Primary Production");
        console.log("Network: Etherlink Testnet");
        
        // Create contract instance
        RedStonePriceTest priceTest = RedStonePriceTest(PRICE_TEST_CONTRACT);
        
        console.log("\n--- Testing Individual Price Feeds ---");
        
        try priceTest.getXTZPrice() returns (uint256 xtzPrice) {
            console.log("SUCCESS XTZ Price (8 decimals):", xtzPrice);
            console.log("   XTZ Price (USD):", xtzPrice / 1e8);
        } catch Error(string memory reason) {
            console.log("FAILED XTZ Price failed:", reason);
        }
        
        try priceTest.getETHPrice() returns (uint256 ethPrice) {
            console.log("SUCCESS ETH Price (8 decimals):", ethPrice);
            console.log("   ETH Price (USD):", ethPrice / 1e8);
        } catch Error(string memory reason) {
            console.log("FAILED ETH Price failed:", reason);
        }
        
        try priceTest.getBTCPrice() returns (uint256 btcPrice) {
            console.log("SUCCESS BTC Price (8 decimals):", btcPrice);
            console.log("   BTC Price (USD):", btcPrice / 1e8);
        } catch Error(string memory reason) {
            console.log("FAILED BTC Price failed:", reason);
        }
        
        console.log("\n--- Testing Multiple Prices ---");
        
        try priceTest.getMultiplePrices() returns (uint256 xtzPrice, uint256 ethPrice, uint256 btcPrice) {
            console.log("SUCCESS Multiple Prices Retrieved:");
            console.log("   XTZ:", xtzPrice);
            console.log("   XTZ USD:", xtzPrice / 1e8);
            console.log("   ETH:", ethPrice);
            console.log("   ETH USD:", ethPrice / 1e8);
            console.log("   BTC:", btcPrice);
            console.log("   BTC USD:", btcPrice / 1e8);
        } catch Error(string memory reason) {
            console.log("FAILED Multiple prices failed:", reason);
        }
        
        console.log("\n--- Testing Console Log Function ---");
        
        try priceTest.testPriceFeeds() {
            console.log("SUCCESS Console log function executed successfully");
        } catch Error(string memory reason) {
            console.log("FAILED Console log function failed:", reason);
        }
        
        console.log("\n=== Test Complete ===");
        console.log("Note: These are view functions that don't require RedStone data injection");
        console.log("For actual transactions, you'll need to use WrapperBuilder on the frontend");
    }
} 