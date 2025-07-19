# Tickity Smart Contracts

This directory contains the smart contracts for the Tickity NFT ticketing platform, built with Foundry and designed for the Etherlink blockchain.

## Overview

Tickity is a decentralized NFT ticketing platform that allows event organizers to create, sell, and manage event tickets as NFTs. The platform includes features for primary ticket sales, secondary marketplace trading, and AR experiences.

## Contract Architecture

### Core Contracts

1. **TickityNFT** (`src/TickityNFT.sol`)

   - Main NFT contract implementing ERC721 standard
   - Manages ticket minting, validation, and metadata
   - Handles ticket usage and refunds
   - Stores event and ticket information

2. **EventFactory** (`src/EventFactory.sol`)

   - Factory contract for creating individual event contracts
   - Manages event creation and organization
   - Tracks events by organizer

3. **Event** (`src/Event.sol`)

   - Individual event contract for each event
   - Handles ticket sales and pricing
   - Manages event-specific logic and validation
   - Integrates with NFT contract for ticket minting

4. **TickityMarketplace** (`src/TickityMarketplace.sol`)
   - Secondary marketplace for ticket trading
   - Supports listing, purchasing, and offering tickets
   - Includes platform fees and escrow functionality

## Features

### Primary Ticket Sales

- Event organizers can create events with multiple ticket types
- Dynamic pricing and quantity management
- Secure payment processing with ETH
- Automatic NFT minting upon purchase

### Secondary Market

- Ticket holders can list tickets for resale
- Support for direct purchases and offers
- Platform fee collection (2.5% default)
- Escrow functionality for secure trading

### Ticket Management

- Ticket validation and usage tracking
- Refund functionality before event start
- Metadata storage for AR experiences
- Integration with Thirdweb for frontend

### Security Features

- Reentrancy protection
- Access control with Ownable pattern
- Pausable functionality for emergency stops
- Input validation and error handling

## Getting Started

### Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- Node.js and npm/yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tickity/contracts
```

2. Install dependencies:

```bash
forge install
```

3. Set up environment variables:

```bash
cp env.example .env
# Edit .env with your private key and RPC URLs
```

### Compilation

```bash
forge build
```

### Testing

```bash
# Run all tests
forge test

# Run specific test
forge test --match-test test_PurchaseTicket

# Run tests with verbose output
forge test -vvv
```

### Deployment

1. Set your private key in environment:

```bash
export PRIVATE_KEY=your_private_key_here
```

2. Deploy to Etherlink testnet:

```bash
forge script script/Deploy.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast --verify
```

3. Deploy to Etherlink mainnet:

```bash
forge script script/Deploy.s.sol --rpc-url https://node.mainnet.etherlink.com --broadcast --verify
```

## Contract Addresses

After deployment, the following contracts will be deployed:

- **TickityNFT**: Main NFT contract
- **EventFactory**: Factory for creating events
- **TickityMarketplace**: Secondary marketplace

## Usage Examples

### Creating an Event

```solidity
// Through EventFactory
address eventAddress = factoryContract.createEvent(
    "Concert Night",
    "Amazing live music event",
    block.timestamp + 7 days,
    block.timestamp + 8 days,
    "Music Hall",
    1000,
    ["VIP", "General"],
    [0.1 ether, 0.05 ether],
    [100, 900],
    address(nftContract)
);
```

### Purchasing a Ticket

```solidity
// Through Event contract
eventContract.purchaseTicket{value: 0.05 ether}(1); // General ticket
```

### Listing on Marketplace

```solidity
// Approve marketplace
nftContract.approve(address(marketplaceContract), tokenId);

// List ticket
marketplaceContract.listTicket{value: 0.001 ether}(tokenId, 0.08 ether);
```

## Testing

The test suite covers:

- Contract deployment
- Event creation and management
- Ticket purchasing and validation
- Marketplace functionality
- Security scenarios
- Edge cases and error conditions

Run tests with:

```bash
forge test
```

**Current Status**: ✅ All 10 tests passing

## Security Considerations

- All contracts use OpenZeppelin's battle-tested libraries
- Reentrancy protection on all external calls
- Access control for sensitive functions
- Input validation and bounds checking
- Emergency pause functionality
- Comprehensive test coverage

## Gas Optimization

- Efficient storage patterns
- Optimized loops and data structures
- Minimal external calls
- Batch operations where possible

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For questions and support:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation

## Roadmap

- [ ] Multi-chain support
- [ ] Advanced pricing models
- [ ] Royalty distribution
- [ ] Governance token
- [ ] Mobile app integration
- [ ] Advanced AR features
