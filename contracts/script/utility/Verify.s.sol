// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

/**
 * @title Verify
 * @dev Verification script for Tickity contracts on Etherlink
 */
contract Verify is Script {
    function run() external {
        // Contract addresses from deployment
        address tickityNFT = 0xF99b791257ab50be7F235BC825E7d4B83942cf38;
        address eventFactory = 0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74;
        address marketplace = 0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf;

        console.log("Verifying contracts on Etherlink testnet...");
        
        // Verify TickityNFT (no constructor args)
        console.log("Verifying TickityNFT at:", tickityNFT);
        
        // Verify EventFactory (no constructor args)
        console.log("Verifying EventFactory at:", eventFactory);
        
        // Verify TickityMarketplace (with constructor arg)
        console.log("Verifying TickityMarketplace at:", marketplace);
        console.log("Constructor arg (TickityNFT address):", tickityNFT);
        
        console.log("Verification commands:");
        console.log("forge verify-contract", tickityNFT, "src/TickityNFT.sol:TickityNFT --chain etherlink-testnet --etherscan-api-key $ETHERLINK_TESTNET_API_KEY");
        console.log("forge verify-contract", eventFactory, "src/EventFactory.sol:EventFactory --chain etherlink-testnet --etherscan-api-key $ETHERLINK_TESTNET_API_KEY");
        console.log("forge verify-contract", marketplace, "src/TickityMarketplace.sol:TickityMarketplace --chain etherlink-testnet --etherscan-api-key $ETHERLINK_TESTNET_API_KEY --constructor-args", tickityNFT);
    }
} 