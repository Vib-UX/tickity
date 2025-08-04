# 🎟️ Tickity

NFT ticketing platform with Geofencing, AR & AI integration built on Etherlink.

## Features

- **NFT Ticketing** - ERC-721 tickets with dynamic QR codes and anti-scalping protection
- **Secure Onboarding** - Social login and geo-location checks
- **AR Experience** - Camera-based AR activation and venue navigation
- **AI Recognition** - Real-time logo detection and context-aware POAP minting
- **Memory Generation** - Stylized photo filters with NFT collectible output
- **POAP Minting** - Instant gasless minting with smart retry logic
- **Marketplace** - In-app resale with onchain royalty enforcement
- **Organizer Dashboard** - Event management and analytics
- **Cross-Platform** - Discord/Telegram automation and deep linking

## User Flow

```mermaid
sequenceDiagram
    participant User as User
    participant App as Tickity App
    participant Auth as Auth Service
    participant Contract as Smart Contract
    participant AR as AR System
    participant AI as AI Service
    participant POAP as POAP Contract
    participant Market as Marketplace

    Note over User,Market: User Onboarding & Ticket Purchase
    User->>App: Open App
    App->>Auth: Social Login / Wallet Connect
    Auth->>User: Authentication Success

    User->>App: Browse Events
    App->>Contract: Get Event Details
    Contract->>App: Event Info + Pricing

    User->>App: Purchase Ticket
    App->>Contract: Mint NFT Ticket
    Contract->>User: NFT Ticket Delivered

    Note over User,Market: Event Day Experience
    User->>App: Arrive at Event
    App->>AR: Scan QR Code
    AR->>Contract: Verify Ticket
    Contract->>AR: Ticket Valid

    User->>AR: Activate AR Camera
    AR->>AI: Analyze Visual Cues
    AI->>AR: Logo/Brand Recognition
    AR->>POAP: Trigger POAP Mint
    POAP->>User: POAP Delivered

    User->>App: Take Photo
    App->>App: Apply Style Filters
    App->>Contract: Mint Memory NFT
    Contract->>User: Memory NFT Created

    Note over User,Market: Post-Event Activities
    User->>App: Access Marketplace
    App->>Market: List Ticket/NFT
    Market->>App: Listing Created

    User->>App: View Analytics
    App->>User: Event Stats & POAPs
```

<img width="3306" height="2122" alt="image" src="https://github.com/user-attachments/assets/b5f08079-6802-47f8-9cde-0f2a5f3960b0" />

## Tech Stack

- **Blockchain**: Etherlink (Tezos Layer 2)
- **Smart Contracts**: Thirdweb SDK/Foundry
- **Oracle Integration**: Redstone Protocol
- **Storage**: IPFS
- **Indexing**: Goldsky Subgraph
- **AR/AI**: Custom mobile implementation
- **Frontend**: Mobile-first React Native/Flutter

## SDK & Service Integrations

> **Thirdweb SDK Integration :**
>
> - Using official Thirdweb SDK for:
>   - Wallet connection and authentication ([thirdweb.ts](tickity-rn-app/constants/thirdweb.ts))
>   - Smart contract interactions ([useGetUserTickets.tsx](tickity-rn-app/hooks/useGetUserTickets.tsx))
>   - Batch Transactions [Approval USDT + Purchasing Ticket] ([sendBatchTxn](tickity-rn-app/app/%5Bevent%5D.tsx#L214))
>   - Chain configuration with etherlinkTestnet ([useGetUSDT.tsx](tickity-rn-app/hooks/useGetUSDT.tsx))
>   - Event creation and management ([ThirdwebScreen.tsx](tickity-rn-app/components/ThirdwebScreen.tsx))

> **Goldsky Subgraph Integration :**
>
> - Using Goldsky subgraph for:
>   - Event data indexing and querying ([subgraph.ts](tickity-rn-app/constants/subgraph.ts))
>   - Real-time event updates ([useGetEvents.tsx](tickity-rn-app/hooks/useGetEvents.tsx))
>   - User event management ([useGetUserEvents.tsx](tickity-rn-app/hooks/useGetUserEvents.tsx))
>   - Event filtering and search functionality ([EventsScreen.tsx](tickity-rn-app/components/EventsScreen.tsx))

> **Redstone Oracle Integration :**
>
> - Using Redstone Protocol for:
>   - Real-time price feeds ([EventFactoryWithPriceFeeds.sol](contracts/src/EventFactoryWithPriceFeeds.sol))
>   - USDT/XTZ price data integration ([TestRedStoneIntegration.s.sol](contracts/script/test/TestRedStoneIntegration.s.sol))
>   - Dynamic ticket pricing based on market conditions ([TestRedStoneXTZPrice.s.sol](contracts/script/test/TestRedStoneXTZPrice.s.sol))
>   - Oracle data validation and fallback mechanisms
