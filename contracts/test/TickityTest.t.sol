// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityMarketplace.sol";
import "./MockUSDT.sol";

/**
 * @title TickityTest
 * @dev Test suite for Tickity contracts
 */
contract TickityTest is Test {
    TickityNFT public nftContract;
    EventFactory public factoryContract;
    TickityMarketplace public marketplaceContract;
    Event public eventContract;
    MockUSDT public usdtContract;
    
    address public owner = address(1);
    address public organizer = address(2);
    address public buyer = address(3);
    address public buyer2 = address(4);
    
    string[] public ticketTypes;
    uint256[] public ticketPrices;
    uint256[] public ticketQuantities;
    
    function setUp() public {
        // Setup accounts
        vm.label(owner, "Owner");
        vm.label(organizer, "Organizer");
        vm.label(buyer, "Buyer");
        vm.label(buyer2, "Buyer2");
        
        // Deploy contracts first
        vm.startPrank(owner);
        usdtContract = new MockUSDT();
        nftContract = new TickityNFT();
        factoryContract = new EventFactory(address(usdtContract));
        marketplaceContract = new TickityMarketplace(address(nftContract), address(usdtContract));
        // Transfer NFT ownership to factory for tests
        nftContract.transferOwnership(address(factoryContract));
        vm.stopPrank();
        
        // Fund test accounts with USDT after deployment
        vm.startPrank(owner);
        usdtContract.transfer(organizer, 1000000000); // 1000 USDT
        usdtContract.transfer(buyer, 1000000000);     // 1000 USDT
        usdtContract.transfer(buyer2, 1000000000);    // 1000 USDT
        vm.stopPrank();
        
        // Setup ticket types
        ticketTypes = new string[](2);
        ticketTypes[0] = "VIP";
        ticketTypes[1] = "General";
        
        ticketPrices = new uint256[](2);
        ticketPrices[0] = 100000; // 0.1 USDT (6 decimals)
        ticketPrices[1] = 50000;  // 0.05 USDT (6 decimals)
        
        ticketQuantities = new uint256[](2);
        ticketQuantities[0] = 10;
        ticketQuantities[1] = 50;
    }
    
    function test_DeployContracts() public {
        assertEq(nftContract.owner(), address(factoryContract));
        assertEq(factoryContract.owner(), owner);
        assertEq(marketplaceContract.owner(), owner);
        assertEq(marketplaceContract.nftContract(), address(nftContract));
    }
    
    function test_CreateEvent() public {
        vm.startPrank(organizer);
        
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        
        Event newEventContract = Event(payable(eventAddress));
        assertEq(newEventContract.name(), "Test Event");
        assertEq(newEventContract.organizer(), organizer);
        
        vm.stopPrank();
    }
    
    function test_PurchaseTicket() public {
        // Create event
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event newEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        // Purchase ticket
        vm.startPrank(buyer);
        uint256 initialBalance = usdtContract.balanceOf(buyer);
        
        // Approve USDT spending
        usdtContract.approve(address(newEventContract), 50000);
        newEventContract.purchaseTicket(1); // General ticket
        
        assertEq(usdtContract.balanceOf(buyer), initialBalance - 50000);
        assertEq(newEventContract.soldTickets(), 1);
        
        vm.stopPrank();
    }
    
    function test_UseTicket() public {
        // Setup event and purchase ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event testEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(testEventContract), 50000);
        testEventContract.purchaseTicket(1);
        
        // Try to use ticket before event starts (should fail)
        vm.expectRevert();
        testEventContract.useTicket(1);
        
        // Fast forward to event time
        vm.warp(block.timestamp + 1 days + 1 hours);
        
        // Use ticket
        testEventContract.useTicket(1);
        assertTrue(testEventContract.isTicketUsed(1));
        
        vm.stopPrank();
    }
    
    function test_MarketplaceListTicket() public {
        // Setup event and purchase ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event marketplaceEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(marketplaceEventContract), 50000);
        marketplaceEventContract.purchaseTicket(1);
        
        // List ticket on marketplace
        nftContract.approve(address(marketplaceContract), 1);
        usdtContract.approve(address(marketplaceContract), 1000000); // 1 USDT listing fee
        marketplaceContract.listTicket(1, 80000); // 0.08 USDT
        
        (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 listedAt, uint256 expiresAt) = marketplaceContract.listings(1);
        assertTrue(isActive);
        assertEq(price, 80000);
        
        vm.stopPrank();
    }
    
    function test_MarketplacePurchaseTicket() public {
        // Setup and list ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event purchaseEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(purchaseEventContract), 50000);
        purchaseEventContract.purchaseTicket(1);
        nftContract.approve(address(marketplaceContract), 1);
        usdtContract.approve(address(marketplaceContract), 1000000); // 1 USDT listing fee
        marketplaceContract.listTicket(1, 80000); // 0.08 USDT
        vm.stopPrank();
        
        // Purchase from marketplace
        vm.startPrank(buyer2);
        uint256 initialBalance = usdtContract.balanceOf(buyer2);
        
        usdtContract.approve(address(marketplaceContract), 80000);
        marketplaceContract.purchaseTicket(1);
        
        assertEq(usdtContract.balanceOf(buyer2), initialBalance - 80000);
        assertEq(nftContract.ownerOf(1), buyer2);
        
        vm.stopPrank();
    }
    
    function test_MarketplaceMakeOffer() public {
        // Setup and purchase ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event offerEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
                // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(offerEventContract), 50000);
        offerEventContract.purchaseTicket(1);
        vm.stopPrank();
        
        // Make offer
        vm.startPrank(buyer2);
        uint256 initialBalance = usdtContract.balanceOf(buyer2);
        
        usdtContract.approve(address(marketplaceContract), 60000);
        marketplaceContract.makeOffer(1, 60000);
        
        assertEq(usdtContract.balanceOf(buyer2), initialBalance - 60000);
        assertTrue(marketplaceContract.getOffer(1, buyer2).isActive);
        
        vm.stopPrank();
    }
    
    function test_RefundTicket() public {
        // Setup and purchase ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event refundEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(refundEventContract), 50000);
        refundEventContract.purchaseTicket(1);
        
        // Refund ticket
        nftContract.refundTicket(1);
        
        TickityNFT.Ticket memory ticket = nftContract.getTicket(1);
        assertTrue(ticket.isRefunded);
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_PurchaseAfterSoldOut() public {
        // Create event with only 1 ticket for VIP type
        uint256[] memory limitedQuantities = new uint256[](2);
        limitedQuantities[0] = 1;
        limitedQuantities[1] = 0; // Unlimited general tickets
        
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            limitedQuantities,
            address(nftContract)
        ));
        Event soldOutEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        // Purchase first VIP ticket
        vm.startPrank(buyer);
        usdtContract.approve(address(soldOutEventContract), 100000);
        soldOutEventContract.purchaseTicket(0);
        vm.stopPrank();
        
        // Try to purchase second VIP ticket (should fail)
        vm.startPrank(buyer2);
        usdtContract.approve(address(soldOutEventContract), 100000);
        vm.expectRevert();
        soldOutEventContract.purchaseTicket(0);
        vm.stopPrank();
        
        // But should be able to purchase unlimited general tickets
        vm.startPrank(buyer2);
        usdtContract.approve(address(soldOutEventContract), 50000);
        soldOutEventContract.purchaseTicket(1);
        vm.stopPrank();
    }
    
    function test_RevertWhen_UseTicketTwice() public {
        // Setup and purchase ticket
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location",
            ticketTypes,
            ticketPrices,
            ticketQuantities,
            address(nftContract)
        ));
        Event doubleUseEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        vm.startPrank(buyer);
        usdtContract.approve(address(doubleUseEventContract), 50000);
        doubleUseEventContract.purchaseTicket(1);
        
        // Fast forward to event time
        vm.warp(block.timestamp + 1 days + 1 hours);
        
        // Use ticket first time
        doubleUseEventContract.useTicket(1);
        
        // Try to use ticket again (should fail)
        vm.expectRevert();
        doubleUseEventContract.useTicket(1);
        
        vm.stopPrank();
    }

    function test_DynamicMinting() public {
        // Create event with unlimited tickets (quantity = 0 means unlimited)
        uint256[] memory unlimitedQuantities = new uint256[](2);
        unlimitedQuantities[0] = 0; // Unlimited VIP tickets
        unlimitedQuantities[1] = 0; // Unlimited general tickets
        
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Dynamic Event",
            "An event with unlimited ticket minting",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Dynamic Arena",
            ticketTypes,
            ticketPrices,
            unlimitedQuantities,
            address(nftContract)
        ));
        Event dynamicEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        // Purchase many tickets to test unlimited minting
        vm.startPrank(buyer);
        uint256 ticketsToBuy = 10;
        
        for (uint256 i = 0; i < ticketsToBuy; i++) {
            usdtContract.approve(address(dynamicEventContract), 50000);
            dynamicEventContract.purchaseTicket(1); // General ticket
        }
        
        assertEq(dynamicEventContract.soldTickets(), ticketsToBuy);
        assertEq(nftContract.balanceOf(buyer), ticketsToBuy);
        
        vm.stopPrank();
        
        // Test that we can still buy more tickets (unlimited)
        vm.startPrank(buyer2);
        usdtContract.approve(address(dynamicEventContract), 50000);
        dynamicEventContract.purchaseTicket(1);
        assertEq(dynamicEventContract.soldTickets(), ticketsToBuy + 1);
        vm.stopPrank();
    }
    
    function test_MixedTicketLimits() public {
        // Create event with mixed limits: limited VIP, unlimited general
        uint256[] memory mixedQuantities = new uint256[](2);
        mixedQuantities[0] = 5;  // Only 5 VIP tickets
        mixedQuantities[1] = 0;  // Unlimited general tickets
        
        vm.startPrank(organizer);
        address payable eventAddress = payable(factoryContract.createEvent(
            "Mixed Limits Event",
            "An event with mixed ticket limits",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Mixed Arena",
            ticketTypes,
            ticketPrices,
            mixedQuantities,
            address(nftContract)
        ));
        Event mixedEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        // Event is already registered in NFT contract by the factory
        
        // Buy all VIP tickets
        vm.startPrank(buyer);
        for (uint256 i = 0; i < 5; i++) {
            usdtContract.approve(address(mixedEventContract), 100000);
            mixedEventContract.purchaseTicket(0); // VIP ticket
        }
        vm.stopPrank();
        
        // Try to buy one more VIP ticket (should fail)
        vm.startPrank(buyer2);
        usdtContract.approve(address(mixedEventContract), 100000);
        vm.expectRevert();
        mixedEventContract.purchaseTicket(0);
        vm.stopPrank();
        
        // But should be able to buy unlimited general tickets
        vm.startPrank(buyer2);
        for (uint256 i = 0; i < 10; i++) {
            usdtContract.approve(address(mixedEventContract), 50000);
            mixedEventContract.purchaseTicket(1); // General ticket
        }
        assertEq(mixedEventContract.soldTickets(), 15); // 5 VIP + 10 General
        vm.stopPrank();
    }
} 