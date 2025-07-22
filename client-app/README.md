# Tickity - NFT Event Ticketing Platform

A decentralized event ticketing platform built on Etherlink testnet with NFT tickets, AR experiences, and a secondary marketplace.

## Features

- 🎫 **NFT Ticketing**: Secure ERC-721 tickets with dynamic QR codes
- 🎭 **Event Management**: Create, manage, and discover events
- 🔄 **Secondary Marketplace**: Resell tickets with built-in royalties
- 📱 **AR Experience**: Immersive augmented reality activation
- 💰 **Instant Payments**: Direct payments to event organizers
- 🛡️ **Anti-Scalping**: Built-in protection against ticket scalping

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Blockchain**: Etherlink Testnet (Tezos EVM)
- **Web3**: Thirdweb SDK v4
- **UI**: Framer Motion, Radix UI, Lucide Icons
- **Build**: Craco, Webpack

## Quick Start

### Prerequisites

- Node.js 16+
- MetaMask browser extension
- Test XTZ tokens (get from [Etherlink Faucet](https://faucet.etherlink.com))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

### MetaMask Setup

1. **Install MetaMask** from [metamask.io](https://metamask.io/download/)
2. **Add Etherlink Testnet** to MetaMask:
   - Network Name: `Etherlink Testnet`
   - RPC URL: `https://node.ghostnet.teztnets.xyz`
   - Chain ID: `128123`
   - Currency Symbol: `XTZ`
   - Block Explorer: `https://testnet-explorer.etherlink.com`
3. **Get Test XTZ** from the [faucet](https://faucet.etherlink.com)
4. **Connect Wallet** using the Connect Wallet button

## Smart Contract Addresses

Deployed on Etherlink Testnet (Chain ID: 128123):

```javascript
EVENT_FACTORY: "0x56ef69e24c3bca5135c18574b403273f1eb2bd74";
TICKITY_NFT: "0xf99b791257ab50be7f235bc825e7d4b83942cf38";
MARKETPLACE: "0x8b6ce7068f22276f00d05eb73f2d4ddd21dedbef";
```

## Usage

### Creating Events

1. Connect your MetaMask wallet
2. Navigate to Events page
3. Click "Create Event"
4. Fill in event details:
   - Event name and description
   - Start and end times
   - Location
   - Ticket types and prices
5. Submit transaction

### Purchasing Tickets

1. Browse available events
2. Select an event to view details
3. Choose ticket type and quantity
4. Click "Purchase Ticket"
5. Confirm transaction in MetaMask

### Using Tickets

1. Navigate to "My Tickets"
2. Select a ticket to use
3. Click "Use Ticket"
4. Confirm transaction

## Troubleshooting

### MetaMask Connection Issues

If you're experiencing connection problems:

1. **Check the Troubleshooter**: Look for the "Connection Issues" panel in the bottom-left corner
2. **Follow the Guide**: See [METAMASK_TROUBLESHOOTING.md](./METAMASK_TROUBLESHOOTING.md) for detailed solutions
3. **Common Issues**:
   - Wrong network (switch to Etherlink Testnet)
   - MetaMask not installed or unlocked
   - Insufficient test XTZ (get from faucet)
   - RPC connection issues

### Development Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset MetaMask connection
# Go to MetaMask → Settings → Connected Sites → Remove localhost:3000

# Check console for errors
# Press F12 in browser to open developer tools
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar with wallet connection
│   ├── CreateEventModal.tsx  # Event creation form
│   └── MetaMaskTroubleshooter.tsx  # Connection debugging
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── EventsPage.tsx  # Event listing and creation
│   ├── EventDetailsPage.tsx  # Individual event view
│   └── ...
├── hooks/              # Custom React hooks
│   └── useEvents.ts    # Event and ticket management
├── config/             # Configuration files
│   └── thirdweb.ts     # Thirdweb and contract configuration
└── utils/              # Utility functions
    └── networkConfig.ts # MetaMask network helpers
```

## Development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_THIRDWEB_CLIENT_ID=your_client_id_here
```

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routing in `App.tsx`
2. **New Components**: Add to `src/components/` with TypeScript interfaces
3. **New Hooks**: Add to `src/hooks/` for reusable logic
4. **Contract Integration**: Update `src/config/thirdweb.ts` with new ABIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

1. Check the troubleshooting guide
2. Review browser console for errors
3. Open an issue with detailed error messages

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AR features
- [ ] Social features and sharing
- [ ] Analytics dashboard
- [ ] Multi-chain support
- [ ] Advanced ticket types (VIP, early access)
- [ ] Event recommendations
- [ ] Integration with calendar apps
