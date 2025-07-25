// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TickityNFT.sol";
import "../src/EventFactory.sol";
import "../src/Event.sol";
import "../src/TickityMarketplace.sol";

/**
 * @title TickityTest
 * @dev Test suite for Tickity contracts
 */
contract TickityTest is Test {
    TickityNFT public nftContract;
    EventFactory public factoryContract;
    TickityMarketplace public marketplaceContract;
    Event public eventContract;
    
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
        
        // Fund test accounts
        vm.deal(owner, 100 ether);
        vm.deal(organizer, 100 ether);
        vm.deal(buyer, 100 ether);
        vm.deal(buyer2, 100 ether);
        
        // Deploy contracts
        vm.startPrank(owner);
        nftContract = new TickityNFT();
        factoryContract = new EventFactory();
        marketplaceContract = new TickityMarketplace(address(nftContract));
        vm.stopPrank();
        
        // Setup ticket types
        ticketTypes = new string[](2);
        ticketTypes[0] = "VIP";
        ticketTypes[1] = "General";
        
        ticketPrices = new uint256[](2);
        ticketPrices[0] = 0.1 ether;
        ticketPrices[1] = 0.05 ether;
        
        ticketQuantities = new uint256[](2);
        ticketQuantities[0] = 10;
        ticketQuantities[1] = 50;
    }
    
    function test_DeployContracts() public {
        assertEq(nftContract.owner(), owner);
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
        
        // Set event ID in NFT contract
        vm.prank(owner);
        nftContract.createEvent(
            address(newEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        // Purchase ticket
        vm.startPrank(buyer);
        uint256 initialBalance = buyer.balance;
        
        newEventContract.purchaseTicket{value: 0.05 ether}(1); // General ticket
        
        assertEq(buyer.balance, initialBalance - 0.05 ether);
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(testEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        testEventContract.purchaseTicket{value: 0.05 ether}(1);
        
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(marketplaceEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        marketplaceEventContract.purchaseTicket{value: 0.05 ether}(1);
        
        // List ticket on marketplace
        nftContract.approve(address(marketplaceContract), 1);
        marketplaceContract.listTicket{value: 0.001 ether}(1, 0.08 ether);
        
        (address seller, uint256 tokenId, uint256 price, bool isActive, uint256 listedAt, uint256 expiresAt) = marketplaceContract.listings(1);
        assertTrue(isActive);
        assertEq(price, 0.08 ether);
        
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(purchaseEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        purchaseEventContract.purchaseTicket{value: 0.05 ether}(1);
        nftContract.approve(address(marketplaceContract), 1);
        marketplaceContract.listTicket{value: 0.001 ether}(1, 0.08 ether);
        vm.stopPrank();
        
        // Purchase from marketplace
        vm.startPrank(buyer2);
        uint256 initialBalance = buyer2.balance;
        
        marketplaceContract.purchaseTicket{value: 0.08 ether}(1);
        
        assertEq(buyer2.balance, initialBalance - 0.08 ether);
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(offerEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        offerEventContract.purchaseTicket{value: 0.05 ether}(1);
        vm.stopPrank();
        
        // Make offer
        vm.startPrank(buyer2);
        uint256 initialBalance = buyer2.balance;
        
        marketplaceContract.makeOffer{value: 0.06 ether}(1);
        
        assertEq(buyer2.balance, initialBalance - 0.06 ether);
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(refundEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        refundEventContract.purchaseTicket{value: 0.05 ether}(1);
        
        // Refund ticket
        nftContract.refundTicket(1);
        
        TickityNFT.Ticket memory ticket = nftContract.getTicket(1);
        assertTrue(ticket.isRefunded);
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_PurchaseAfterSoldOut() public {
        // Create event with only 1 ticket for VIP type
        ticketQuantities[0] = 1;
        ticketQuantities[1] = 0; // Unlimited general tickets
        
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
        Event soldOutEventContract = Event(payable(eventAddress));
        vm.stopPrank();
        
        vm.prank(owner);
        nftContract.createEvent(
            address(soldOutEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        // Purchase first VIP ticket
        vm.startPrank(buyer);
        soldOutEventContract.purchaseTicket{value: 0.1 ether}(0);
        vm.stopPrank();
        
        // Try to purchase second VIP ticket (should fail)
        vm.startPrank(buyer2);
        vm.expectRevert();
        soldOutEventContract.purchaseTicket{value: 0.1 ether}(0);
        vm.stopPrank();
        
        // But should be able to purchase unlimited general tickets
        vm.startPrank(buyer2);
        soldOutEventContract.purchaseTicket{value: 0.05 ether}(1);
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(doubleUseEventContract),
            "Test Event",
            "A test event",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Test Location"
        );
        
        vm.startPrank(buyer);
        doubleUseEventContract.purchaseTicket{value: 0.05 ether}(1);
        
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(dynamicEventContract),
            "Dynamic Event",
            "An event with unlimited ticket minting",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Dynamic Arena"
        );
        
        // Purchase many tickets to test unlimited minting
        vm.startPrank(buyer);
        uint256 ticketsToBuy = 10;
        
        for (uint256 i = 0; i < ticketsToBuy; i++) {
            dynamicEventContract.purchaseTicket{value: 0.05 ether}(1); // General ticket
        }
        
        assertEq(dynamicEventContract.soldTickets(), ticketsToBuy);
        assertEq(nftContract.balanceOf(buyer), ticketsToBuy);
        
        vm.stopPrank();
        
        // Test that we can still buy more tickets (unlimited)
        vm.startPrank(buyer2);
        dynamicEventContract.purchaseTicket{value: 0.05 ether}(1);
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
        
        vm.prank(owner);
        nftContract.createEvent(
            address(mixedEventContract),
            "Mixed Limits Event",
            "An event with mixed ticket limits",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            "Mixed Arena"
        );
        
        // Buy all VIP tickets
        vm.startPrank(buyer);
        for (uint256 i = 0; i < 5; i++) {
            mixedEventContract.purchaseTicket{value: 0.1 ether}(0); // VIP ticket
        }
        vm.stopPrank();
        
        // Try to buy one more VIP ticket (should fail)
        vm.startPrank(buyer2);
        vm.expectRevert();
        mixedEventContract.purchaseTicket{value: 0.1 ether}(0);
        vm.stopPrank();
        
        // But should be able to buy unlimited general tickets
        vm.startPrank(buyer2);
        for (uint256 i = 0; i < 10; i++) {
            mixedEventContract.purchaseTicket{value: 0.05 ether}(1); // General ticket
        }
        assertEq(mixedEventContract.soldTickets(), 15); // 5 VIP + 10 General
        vm.stopPrank();
    }
} 