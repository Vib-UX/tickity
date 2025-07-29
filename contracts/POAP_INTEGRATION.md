# 🎫 Tickity POAP Integration

## Overview

The Tickity platform now includes an integrated POAP (Proof of Attendance Protocol) system that automatically mints POAP NFTs when event tickets are used. This provides attendees with verifiable proof of their participation in events.

## 🏗️ Architecture

### Core Components

1. **TickityPOAP Contract** (`src/TickityPOAP.sol`)

   - ERC721 NFT contract for POAP tokens
   - Manages POAP events and minting
   - Generates metadata for each POAP

2. **Event Contract** (`src/Event.sol`)

   - Modified to include POAP contract reference
   - Automatically triggers POAP minting when tickets are used

3. **EventFactory Contract** (`src/EventFactory.sol`)
   - Updated to accept POAP parameters during event creation
   - Creates POAP events alongside Tickity events

## 🔄 POAP Flow

### 1. Event Creation with POAP

```solidity
// Event organizer creates event with POAP details
factory.createEvent(
    "Event Name",
    "Event Description",
    startTime,
    endTime,
    "Location",
    ticketTypes,
    prices,
    quantities,
    nftContract,
    "POAP Name",           // POAP event name
    "POAP Description",    // POAP description
    "POAP Image URI",      // POAP image
    "POAP Metadata URI"    // POAP external link
);
```

### 2. Ticket Purchase

- User purchases ticket using USDT
- Ticket NFT is minted with event details

### 3. Ticket Usage & POAP Minting

```solidity
// When user uses ticket
event.useTicket(tokenId);

// This automatically:
// 1. Marks ticket as used
// 2. Mints POAP NFT for attendee
// 3. Generates unique metadata
```

### 4. POAP NFT

- Each POAP is a unique ERC721 token
- Contains event-specific metadata
- Links to original ticket
- Includes attendance timestamp

## 📋 POAP Features

### ✅ Automatic Minting

- POAPs are minted automatically when tickets are used
- No manual claiming process required
- One POAP per ticket usage

### ✅ Event-Specific POAPs

- Each event has its own unique POAP design
- Customizable name, description, and image
- Event-specific metadata and attributes

### ✅ Unlimited Supply

- No maximum supply limits
- POAPs minted on-demand based on ticket usage
- Scalable for any event size

### ✅ Rich Metadata

- Event name and description
- Ticket ID reference
- Minting timestamp
- Custom attributes
- External links

### ✅ Organizer Controls

- Update POAP details
- Deactivate POAP events
- Manage POAP metadata

## 🛠️ Implementation Details

### POAP Event Structure

```solidity
struct POAPEvent {
    uint256 eventId;           // Tickity event ID
    string name;               // POAP event name
    string description;        // POAP description
    string imageURI;          // POAP image
    string poapURI;           // External metadata URI
    bool isActive;            // POAP event status
    address eventContract;    // Event contract address
    address organizer;        // Event organizer
    uint256 minted;           // Number of POAPs minted
    uint256 createdAt;        // Creation timestamp
}
```

### POAP Token Structure

```solidity
struct POAP {
    uint256 poapEventId;      // POAP event ID
    uint256 eventId;          // Tickity event ID
    uint256 ticketTokenId;    // Original ticket ID
    address attendee;         // Attendee address
    uint256 mintedAt;         // Minting timestamp
    string metadataURI;       // Token metadata URI
}
```

### Metadata Generation

Each POAP includes rich metadata with:

- **Name**: Event-specific POAP name
- **Description**: Event description
- **Image**: Event-specific image
- **External URL**: Event website/link
- **Attributes**:
  - Event name
  - Ticket ID
  - POAP Event ID
  - Minting timestamp

## 🚀 Usage Examples

### Creating Events with POAP

```solidity
// Music Festival with POAP
factory.createEvent(
    "Etherlink Music Festival 2024",
    "Biggest blockchain music festival",
    block.timestamp + 45 days,
    block.timestamp + 45 days + 72 hours,
    "Etherlink Arena",
    ["VIP", "General"],
    [150000, 30000], // 0.15, 0.03 USDT
    [50, 0],
    nftContract,
    "Etherlink Music Festival 2024 POAP",
    "Proof of attendance for the biggest blockchain music festival",
    "https://ipfs.io/ipfs/QmMusicFestivalImage",
    "https://etherlink.com/events/music-festival"
);
```

### Using Tickets (Triggers POAP)

```solidity
// User uses ticket
event.useTicket(ticketId);

// Automatically mints POAP with metadata:
// {
//   "name": "Etherlink Music Festival 2024 POAP",
//   "description": "Proof of attendance...",
//   "image": "https://ipfs.io/ipfs/QmMusicFestivalImage",
//   "external_url": "https://etherlink.com/events/music-festival",
//   "attributes": [
//     {"trait_type": "Event", "value": "Etherlink Music Festival 2024"},
//     {"trait_type": "Ticket ID", "value": "123"},
//     {"trait_type": "POAP Event ID", "value": "1"},
//     {"trait_type": "Minted At", "value": "1703123456"}
//   ]
// }
```

## 📊 POAP Management

### Organizer Functions

```solidity
// Update POAP details
poap.updatePOAPEvent(
    poapEventId,
    "New Name",
    "New Description",
    "New Image URI",
    "New Metadata URI"
);

// Deactivate POAP event
poap.deactivatePOAPEvent(poapEventId, "Event cancelled");
```

### Query Functions

```solidity
// Get POAP event details
poap.getPOAPEvent(poapEventId);

// Get user's POAPs
poap.getUserPOAPs(userAddress);

// Check if user claimed POAP
poap.hasUserClaimedPOAP(eventId, userAddress);

// Get POAP details
poap.getPOAP(poapTokenId);
```

## 🔧 Deployment

### 1. Deploy Contracts

```bash
forge script script/Deploy.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast --verify
```

### 2. Create Events with POAP

```bash
forge script script/CreateEventsWithPOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

### 3. Test POAP Flow

```bash
forge script script/TestPOAPFlow.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 🎯 Benefits

### For Event Organizers

- ✅ Automated POAP distribution
- ✅ Customizable POAP designs
- ✅ No additional infrastructure needed
- ✅ Built-in attendance tracking

### For Attendees

- ✅ Automatic POAP minting
- ✅ Verifiable attendance proof
- ✅ Rich metadata and attributes
- ✅ Collectible NFT memories

### For the Platform

- ✅ Seamless integration
- ✅ Enhanced user engagement
- ✅ Unique value proposition
- ✅ Scalable architecture

## 🔮 Future Enhancements

### Potential Features

- **POAP Collections**: Group related POAPs
- **POAP Trading**: Marketplace for POAPs
- **POAP Rewards**: Loyalty programs
- **POAP Analytics**: Attendance insights
- **POAP Verification**: Enhanced security

### Integration Possibilities

- **Social Media**: Share POAPs
- **Gaming**: POAP-based rewards
- **DeFi**: POAP staking
- **DAO**: POAP-based governance

## 📝 Notes

- POAPs are minted only when tickets are actually used
- Each ticket can only generate one POAP
- POAP metadata is generated on-chain
- No gas fees for POAP minting (included in ticket usage)
- POAPs are transferable ERC721 tokens

---

_The integrated POAP system enhances the Tickity platform by providing automatic, verifiable proof of attendance while maintaining the simplicity and efficiency of the existing ticket system._
