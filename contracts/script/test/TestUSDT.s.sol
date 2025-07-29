// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/TickityNFT.sol";
import "../../src/EventFactory.sol";
import "../../src/TickityMarketplace.sol";
import "../../src/Event.sol";
import "../../src/IUSDT.sol";

/**
 * @title TestUSDT
 * @dev Test script for USDT integration
 */
contract TestUSDT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Testing USDT Integration...");
        console.log("===========================");

        // USDT contract address on Etherlink testnet
        address usdtContract = 0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B;
        IUSDT usdt = IUSDT(usdtContract);
        
        console.log("USDT contract address:", usdtContract);
        console.log("USDT total supply:", usdt.totalSupply());
        console.log("Deployer USDT balance:", usdt.balanceOf(vm.addr(deployerPrivateKey)));

        // Deploy contracts
        TickityNFT nftContract = new TickityNFT();
        EventFactory factory = new EventFactory(usdtContract);
        TickityMarketplace marketplace = new TickityMarketplace(address(nftContract), usdtContract);
        
        console.log("NFT contract deployed at:", address(nftContract));
        console.log("Factory deployed at:", address(factory));
        console.log("Marketplace deployed at:", address(marketplace));

        // Create a test event
        string[] memory ticketTypes = new string[](1);
        ticketTypes[0] = "Test Ticket";
        
        uint256[] memory prices = new uint256[](1);
        prices[0] = 10000; // 0.01 USDT
        
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 10; // 10 tickets

        address payable eventAddress = payable(factory.createEvent(
            "USDT Test Event",
            "Testing USDT integration",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            prices,
            quantities,
            address(nftContract)
        ));

        Event testEvent = Event(payable(eventAddress));
        console.log("Test event created at:", eventAddress);
        console.log("Event organizer:", testEvent.organizer());
        console.log("Event USDT contract:", testEvent.usdtContract());

        vm.stopBroadcast();
        
        console.log("");
        console.log("USDT Integration Test Complete!");
    }
} 