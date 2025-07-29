// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title POAP
 * @dev POAP contract for Tickity events
 */
contract POAP is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    
    // Simple mapping to track POAPs per user per event
    mapping(uint256 => mapping(address => uint256)) public userPOAPCount; // eventId => user => count
    
    // Events
    event POAPMinted(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed attendee,
        string tokenURI,
        uint256 mintedAt
    );
    
    constructor() ERC721("POAP", "POAP") Ownable(msg.sender) {
        _tokenIds = 0;
    }
    
    /**
     * @dev Mint a POAP for an attendee
     * @param eventId The event ID
     * @param attendee The attendee address
     * @param tokenURI The POAP metadata URI
     */
    function mintPOAP(
        uint256 eventId,
        address attendee,
        string memory tokenURI
    ) external returns (uint256) {
        _tokenIds++;
        
        _safeMint(attendee, _tokenIds);
        _setTokenURI(_tokenIds, tokenURI);
        
        // Update user POAP count for this event
        userPOAPCount[eventId][attendee]++;
        
        emit POAPMinted(_tokenIds, eventId, attendee, tokenURI, block.timestamp);
        
        return _tokenIds;
    }
    
    /**
     * @dev Get count of POAPs a user has for a specific event
     * @param eventId The event ID
     * @param user The user address
     */
    function getUserPOAPCountForEvent(uint256 eventId, address user) external view returns (uint256) {
        return userPOAPCount[eventId][user];
    }
    
    /**
     * @dev Get all POAP token IDs owned by a user
     * @param user The user address
     */
    function getUserPOAPs(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory poaps = new uint256[](balance);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == user) {
                poaps[index] = i;
                index++;
                if (index == balance) break;
            }
        }
        
        return poaps;
    }
    
    /**
     * @dev Get total number of POAPs minted
     */
    function totalPOAPs() external view returns (uint256) {
        return _tokenIds;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 