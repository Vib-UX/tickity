#!/bin/bash

# Dry-run verification script for Tickity on Etherlink testnet
echo "🔍 Tickity Contract Verification (DRY RUN)"
echo "=========================================="

# Contract addresses
TICKITY_NFT="0xF99b791257ab50be7F235BC825E7d4B83942cf38"
EVENT_FACTORY="0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74"
MARKETPLACE="0x8b6cE7068F22276F00d05eb73F2D4dDD21DEDbEf"

echo "📋 Contract addresses:"
echo "  TickityNFT: $TICKITY_NFT"
echo "  EventFactory: $EVENT_FACTORY"
echo "  TickityMarketplace: $MARKETPLACE"
echo ""

echo "🔧 Verification Commands (to run manually):"
echo ""

echo "# 1. Verify TickityNFT"
echo "forge verify-contract $TICKITY_NFT src/TickityNFT.sol:TickityNFT \\"
echo "    --chain etherlink-testnet \\"
echo "    --etherscan-api-key YOUR_API_KEY_HERE"
echo ""

echo "# 2. Verify EventFactory"
echo "forge verify-contract $EVENT_FACTORY src/EventFactory.sol:EventFactory \\"
echo "    --chain etherlink-testnet \\"
echo "    --etherscan-api-key YOUR_API_KEY_HERE"
echo ""

echo "# 3. Verify TickityMarketplace (with constructor args)"
echo "forge verify-contract $MARKETPLACE src/TickityMarketplace.sol:TickityMarketplace \\"
echo "    --chain etherlink-testnet \\"
echo "    --etherscan-api-key YOUR_API_KEY_HERE \\"
echo "    --constructor-args $TICKITY_NFT"
echo ""

echo "🌐 View contracts on Etherlink block explorer:"
echo "  https://testnet.explorer.etherlink.com/address/$TICKITY_NFT"
echo "  https://testnet.explorer.etherlink.com/address/$EVENT_FACTORY"
echo "  https://testnet.explorer.etherlink.com/address/$MARKETPLACE"
echo ""

echo "📝 Notes:"
echo "  - Replace YOUR_API_KEY_HERE with your actual Etherlink API key"
echo "  - Get API key from: https://testnet.explorer.etherlink.com"
echo "  - Testnet Chain ID: 128123"
echo "  - Mainnet Chain ID: 42793"
echo "  - API URL: https://testnet.explorer.etherlink.com/api"
echo "  - Network: etherlink-testnet" 