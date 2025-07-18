// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/TickityMarketplace.sol";

/**
 * @title Deploy
 * @dev Deployment script for Tickity contracts
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TickityNFT contract
        TickityNFT nftContract = new TickityNFT();
        console.log("TickityNFT deployed at:", address(nftContract));

        // Deploy EventFactory contract
        EventFactory factoryContract = new EventFactory();
        console.log("EventFactory deployed at:", address(factoryContract));

        // Deploy TickityMarketplace contract
        TickityMarketplace marketplaceContract = new TickityMarketplace(address(nftContract));
        console.log("TickityMarketplace deployed at:", address(marketplaceContract));

        // Transfer ownership of NFT contract to factory (optional)
        // nftContract.transferOwnership(address(factoryContract));

        vm.stopBroadcast();
    }
} 