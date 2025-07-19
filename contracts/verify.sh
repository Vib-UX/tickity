#!/bin/bash

# Contract verification script for Tickity on Etherlink testnet
set -e

echo "🔍 Verifying Tickity contracts on Etherlink testnet..."

# Use DUMMY API key for testing
ETHERLINK_TESTNET_API_KEY=${ETHERLINK_TESTNET_API_KEY:-"DUMMY"}
echo "🔑 Using API key: $ETHERLINK_TESTNET_API_KEY"

# Contract addresses
TICKITY_NFT="0xF99b791257ab50be7F235BC825E7d4B83942cf38"
EVENT_FACTORY="0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74"
MARKETPLACE="0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf"

echo "📋 Contract addresses:"
echo "  TickityNFT: $TICKITY_NFT"
echo "  EventFactory: $EVENT_FACTORY"
echo "  TickityMarketplace: $MARKETPLACE"
echo ""

# Verify TickityNFT
echo "🔍 Verifying TickityNFT..."
forge verify-contract $TICKITY_NFT src/TickityNFT.sol:TickityNFT \
    --chain etherlink-testnet \
    --etherscan-api-key $ETHERLINK_TESTNET_API_KEY

# Verify EventFactory
echo "🔍 Verifying EventFactory..."
forge verify-contract $EVENT_FACTORY src/EventFactory.sol:EventFactory \
    --chain etherlink-testnet \
    --etherscan-api-key $ETHERLINK_TESTNET_API_KEY

# Verify TickityMarketplace (with constructor args)
echo "🔍 Verifying TickityMarketplace..."
forge verify-contract $MARKETPLACE src/TickityMarketplace.sol:TickityMarketplace \
    --chain etherlink-testnet \
    --etherscan-api-key $ETHERLINK_TESTNET_API_KEY \
    --constructor-args $TICKITY_NFT

echo "✅ All contracts verified successfully!"
echo "🌐 View contracts on Etherlink block explorer:"
echo "  https://testnet.explorer.etherlink.com/address/$TICKITY_NFT"
echo "  https://testnet.explorer.etherlink.com/address/$EVENT_FACTORY"
echo "  https://testnet.explorer.etherlink.com/address/$MARKETPLACE"
echo ""
echo "📊 Chain Information:"
echo "  Testnet Chain ID: 128123"
echo "  Mainnet Chain ID: 42793"
echo "  API URL: https://testnet.explorer.etherlink.com/api" 