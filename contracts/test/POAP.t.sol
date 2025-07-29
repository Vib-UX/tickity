// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TickityPOAP.sol";

/**
 * @title POAPSimpleTest
 * @dev Simple test suite for the POAP contract
 */
contract POAPSimpleTest is Test {
    TickityPOAP public poapContract;
    
    function setUp() public {
        poapContract = new TickityPOAP();
    }
    
    function test_POAPDeployment() public {
        assertEq(poapContract.name(), "Tickity POAP");
        assertEq(poapContract.symbol(), "TPOAP");
    }
    
    function test_POAPEventCreation() public {
        uint256 eventId = 1;
        address eventContract = address(0x123);
        address organizer = address(0x456);
        
        uint256 poapEventId = poapContract.createPOAPEvent(
            eventId,
            eventContract,
            organizer,
            "Test POAP",
            "Test Description",
            "https://test.com/image",
            "https://test.com"
        );
        
        assertEq(poapEventId, 1);
        
        (uint256 returnedEventId, string memory name, , , , bool isActive, , , , ) = poapContract.getPOAPEvent(poapEventId);
        
        assertEq(returnedEventId, eventId);
        assertEq(name, "Test POAP");
        assertTrue(isActive);
    }
    
    function test_POAPMinting() public {
        uint256 eventId = 1;
        address eventContract = address(0x123);
        address organizer = address(0x456);
        address attendee = address(0x789);
        
        // Create POAP event
        uint256 poapEventId = poapContract.createPOAPEvent(
            eventId,
            eventContract,
            organizer,
            "Test POAP",
            "Test Description",
            "https://test.com/image",
            "https://test.com"
        );
        
        // Mint POAP
        vm.prank(eventContract);
        uint256 poapTokenId = poapContract.mintPOAP(eventId, attendee, 123);
        
        assertEq(poapTokenId, 1);
        assertEq(poapContract.ownerOf(poapTokenId), attendee);
        assertTrue(poapContract.hasUserClaimedPOAP(eventId, attendee));
    }
} 