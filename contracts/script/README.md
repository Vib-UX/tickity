# Script Organization

This directory contains all Foundry scripts organized by their purpose and functionality.

## 📁 Directory Structure

```
script/
├── deploy/          # Contract deployment scripts
├── test/           # Testing and interaction scripts
├── debug/          # Debugging and troubleshooting scripts
└── utility/        # Utility and verification scripts
```

## 🚀 Deploy Scripts (`deploy/`)

Scripts for deploying contracts to the blockchain.

### Current Deploy Scripts:

- **`Deploy.s.sol`** - Original deployment script
- **`DeployPOAP.s.sol`** - Basic POAP deployment
- **`DeployWithPOAP.s.sol`** - Deployment with POAP integration
- **`DeployUpdatedContracts.s.sol`** - Updated contract deployment
- **`DeployFixedContracts.s.sol`** - Fixed version deployment
- **`DeployPOAP.s.sol`** - **LATEST** - POAP deployment

### Usage:

```bash
# Deploy the latest contracts
forge script script/deploy/DeployPOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 🧪 Test Scripts (`test/`)

Scripts for testing contract functionality and interactions.

### Categories:

#### **POAP Testing**

- **`TestPOAP.s.sol`** - **LATEST** - Complete POAP functionality test
- **`TestMultiplePOAPs.s.sol`** - Multiple POAPs per user test
- **`TestMultiplePOAPs.s.sol`** - Multiple POAPs functionality
- **`TestFutureEventPOAP.s.sol`** - Future event POAP testing
- **`TestFreshEventPOAP.s.sol`** - Fresh event POAP testing
- **`TestFreshPOAP.s.sol`** - Fresh POAP testing
- **`TestImmediatePOAP.s.sol`** - Immediate POAP minting test
- **`TestPOAPIntegration.s.sol`** - POAP integration testing
- **`TestPOAPFlow.s.sol`** - POAP flow testing
- **`FinalPOAPTest.s.sol`** - Final POAP test

#### **Event Creation**

- **`CreateAndTestEvent.s.sol`** - Create and test events
- **`CreatePOAPEvent.s.sol`** - Create POAP events
- **`CreatePOAPEventThroughFactory.s.sol`** - Create POAP events via factory
- **`CreateRealEventWithPOAP.s.sol`** - Create real events with POAP
- **`CreateFuturePOAPEvent.s.sol`** - Create future POAP events
- **`CreateNewPOAPEvent.s.sol`** - Create new POAP events
- **`CreateNew30SecEvent.s.sol`** - Create 30-second events
- **`Create30SecPOAPEvent.s.sol`** - Create 30-second POAP events
- **`Create30SecEvent.s.sol`** - Create 30-second events
- **`CreateQuickEvent.s.sol`** - Create quick events
- **`CreateEventsWithPOAP.s.sol`** - Create events with POAP
- **`CreateUSDTEvents.s.sol`** - Create USDT events
- **`CreateMoreEvents.s.sol`** - Create multiple events
- **`CreateRealEvents.s.sol`** - Create real events

#### **Ticket Operations**

- **`UseNewTicket.s.sol`** - Use new tickets
- **`UseTicketPOAP.s.sol`** - Use tickets with POAP
- **`UseTicket.s.sol`** - Use tickets
- **`PurchaseAndUseTicket.s.sol`** - Purchase and use tickets
- **`ManualPOAPMint.s.sol`** - Manual POAP minting

#### **General Testing**

- **`TestEvents.s.sol`** - General event testing
- **`TestMarketplace.s.sol`** - Marketplace testing
- **`TestPurchaseTicket.s.sol`** - Ticket purchase testing
- **`TestSingleEvent.s.sol`** - Single event testing
- **`TestTickets.s.sol`** - Ticket testing
- **`TestUSDT.s.sol`** - USDT testing
- **`TestUSDTTicketPurchase.s.sol`** - USDT ticket purchase testing

#### **Debug Testing**

- **`TestTxOriginDebug.s.sol`** - Transaction origin debugging
- **`TestUserAddress.s.sol`** - User address testing

### Usage:

```bash
# Test the latest POAP functionality
forge script script/test/TestPOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 🐛 Debug Scripts (`debug/`)

Scripts for debugging and troubleshooting issues.

### Current Debug Scripts:

- **`DebugPOAPIssue.s.sol`** - Debug POAP-related issues

### Usage:

```bash
# Debug POAP issues
forge script script/debug/DebugPOAPIssue.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 🔧 Utility Scripts (`utility/`)

Scripts for utility functions like verification and status checking.

### Current Utility Scripts:

- **`CheckEventStatus.s.sol`** - Check event status
- **`VerifyAddresses.s.sol`** - Verify contract addresses
- **`RegisterEvents.s.sol`** - Register events
- **`Verify.s.sol`** - Contract verification

### Usage:

```bash
# Check event status
forge script script/utility/CheckEventStatus.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 📋 Script Naming Convention

Scripts follow a clear naming convention:

- **Deploy\*** - Deployment scripts
- **Test\*** - Testing scripts
- **Create\*** - Event creation scripts
- **Use\*** - Ticket usage scripts
- **Debug\*** - Debugging scripts
- **Check\*** - Status checking scripts
- **Verify\*** - Verification scripts

## 🎯 Recommended Scripts

### For Production Deployment:

```bash
# Deploy simplified contracts
forge script script/deploy/DeploySimplePOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast

# Test the deployment
forge script script/test/TestSimplePOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

### For Development Testing:

```bash
# Test POAP functionality
forge script script/test/TestSimplePOAP.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast

# Test multiple POAPs
forge script script/test/TestMultiplePOAPs.s.sol --rpc-url https://node.ghostnet.etherlink.com --broadcast
```

## 📝 Notes

- **LATEST** scripts are marked and represent the most current implementation
- All scripts are tested on Etherlink testnet
- Scripts include comprehensive logging for debugging
- Error handling is implemented in most scripts
- Scripts are designed to be run sequentially for proper state management

## 🔄 Script Evolution

The scripts have evolved from complex implementations to simplified, production-ready versions:

1. **Original** - Basic deployment and testing
2. **Updated** - Fixed issues and improvements
3. **Current** - **CURRENT** - Clean, production-ready implementation

The latest scripts focus on reliability and ease of use while maintaining full functionality.
