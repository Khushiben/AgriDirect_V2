# 🌾 AgriDirect - Blockchain-Based Agricultural Supply Chain Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [User Roles & Workflows](#user-roles--workflows)
- [Blockchain Integration](#blockchain-integration)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**AgriDirect** is a comprehensive blockchain-powered agricultural supply chain management platform that connects farmers directly with distributors, retailers, and consumers. The platform ensures complete transparency, traceability, and fair pricing throughout the entire agricultural supply chain using Ethereum blockchain technology.

### Mission
To revolutionize agricultural trade by eliminating middlemen, ensuring fair prices for farmers, and providing complete product traceability for consumers through blockchain technology.

---

## ✨ Key Features

### 🔐 Blockchain-Powered Transparency
- **Ethereum Smart Contracts**: All transactions recorded on Ethereum blockchain
- **Immutable Records**: Tamper-proof transaction history
- **Real-time Verification**: Instant blockchain verification for all supply chain events
- **Complete Traceability**: Track products from farm to consumer with transaction hashes

### 👥 Multi-Role System
- **Farmers**: Add products, track sales, view earnings
- **Admins**: Verify products, set price ranges, manage quality control
- **Distributors**: Purchase from farmers, add value-added services, sell to retailers
- **Retailers**: Buy from distributors, add margins, generate QR codes for consumers
- **Consumers**: Scan QR codes, view complete product journey, verify authenticity

### 📱 QR Code Technology
- **High-Speed Scanning**: 30 FPS detection with full-frame scanning
- **Auto-Detection**: Detects QR codes anywhere in camera frame
- **Comprehensive Data**: Includes pricing breakdown, transaction hashes, and supply chain details
- **Offline Support**: Upload QR code images for scanning

### 💰 Fair Pricing System
- **Dynamic Pricing**: Real-time mandi (market) price integration
- **Price Transparency**: Complete breakdown from farmer to consumer
- **Admin Oversight**: Maximum price caps to prevent exploitation
- **Profit Tracking**: Automatic margin calculation for all stakeholders

### 🗺️ Location Tracking
- **Google Maps Integration**: Visual representation of product journey
- **Farmer Location**: Origin tracking with precise coordinates
- **Distribution Centers**: Intermediate storage and processing locations
- **Retail Points**: Final sale location mapping

### 🎙️ Voice Assistant
- **Multilingual Support**: Voice commands in multiple languages
- **Hands-Free Operation**: Navigate dashboard without touching screen
- **Accessibility**: Designed for users with varying literacy levels
- **Real-time Responses**: Instant voice feedback and guidance

---

## 🛠️ Technology Stack

### Frontend
- **React.js** (v18+): Modern UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **HTML5 QR Code Scanner**: Camera-based QR scanning
- **QRCode.js**: QR code generation
- **CSS3**: Custom styling with animations
- **Vite**: Fast build tool and dev server

### Backend
- **Node.js** (v16+): JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt.js**: Password hashing
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### Blockchain
- **Ethereum**: Blockchain network
- **Web3.js**: Ethereum JavaScript API
- **Smart Contracts**: Solidity-based contracts
- **Transaction Hashing**: Cryptographic verification

### External Services
- **encryption.shubhamos.com/api/seed**: UUID generation service for secure transaction IDs
- **Google Maps API**: Location visualization and mapping
- **Mandi API**: Real-time agricultural market prices

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Farmer  │  │  Admin   │  │Distributor│  │ Retailer │   │
│  │Dashboard │  │Dashboard │  │ Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   MongoDB      │  │   Blockchain    │  │  External APIs │
│   Database     │  │   (Ethereum)    │  │  - UUID Gen    │
│                │  │                 │  │  - Maps        │
│  - Users       │  │  - Transactions │  │  - Mandi Price │
│  - Products    │  │  - Smart        │  └────────────────┘
│  - Purchases   │  │    Contracts    │
└────────────────┘  └─────────────────┘
```

---

## 👤 User Roles & Workflows

### 🌾 Farmer Workflow

1. **Registration & Profile Setup**
   - Create account with email and password
   - Upload farming license/certification
   - Set farm location and details
   - Profile verification by admin

2. **Product Management**
   - Add agricultural products (variety, quantity, price)
   - Upload product images (Google Photos integration)
   - Set minimum selling price
   - Submit for admin approval

3. **Sales & Earnings**
   - View pending approval products
   - Track verified products in marketplace
   - Monitor distributor purchases
   - View transaction history with blockchain hashes
   - Track total earnings

4. **Blockchain Verification**
   - Each product addition generates blockchain transaction
   - Receive unique transaction hash
   - Immutable record of product origin

### 👨‍💼 Admin Workflow

1. **Product Verification**
   - Review farmer-submitted products
   - Verify product quality and authenticity
   - Set maximum price caps (farmer sets minimum)
   - Approve or reject submissions

2. **Quality Control**
   - Assign products to specific admins
   - Random assignment for fairness
   - Track verification history
   - Generate approval transaction hash

3. **Marketplace Management**
   - Monitor all platform transactions
   - View system-wide statistics
   - Manage user accounts
   - Handle disputes

4. **Price Regulation**
   - Set reasonable maximum prices
   - Prevent price exploitation
   - Ensure fair farmer compensation
   - Monitor market trends

### 🚚 Distributor Workflow

1. **Product Sourcing**
   - Browse verified farmer products
   - View product details and farmer information
   - Check blockchain verification
   - Purchase products with quantity selection

2. **Value Addition**
   - Add processing services (cleaning, milling, etc.)
   - Calculate costs:
     - Transport cost
     - Loading/unloading cost
     - Storage cost
     - Processing cost
     - Other operational costs
   - Set selling price with profit margin

3. **Marketplace Listing**
   - Add products to distributor marketplace
   - Generate listing transaction hash
   - Make available to retailers
   - Track inventory and sales

4. **Transaction Management**
   - View purchase history from farmers
   - Monitor sales to retailers
   - Track profit margins
   - Access complete blockchain history

### 🏪 Retailer Workflow

1. **Product Procurement**
   - Browse distributor marketplace
   - View detailed product information
   - Check supply chain history
   - Purchase with quantity selection

2. **Pricing & Margins**
   - Set retail selling price
   - Add logistic costs
   - Calculate profit margins
   - View price breakdown (farmer → distributor → retailer)

3. **QR Code Generation**
   - Generate unique QR codes for each product
   - QR contains:
     - Product variety and details
     - Complete pricing breakdown
     - All transaction hashes
     - Farmer, distributor, and retailer information
     - Location data
   - Download QR codes for product labeling

4. **Consumer Sales**
   - List products in consumer marketplace
   - Manage inventory
   - Track sales and earnings
   - Provide traceability to consumers

### 🛒 Consumer Workflow

1. **Product Discovery**
   - Browse consumer marketplace
   - View product details and prices
   - Check retailer information
   - See available quantities

2. **QR Code Scanning**
   - Scan product QR code using camera
   - Upload QR code image
   - Auto-detection anywhere in frame
   - Fast 30 FPS scanning

3. **Product Traceability**
   - View complete supply chain journey
   - See all stakeholders (farmer, distributor, retailer)
   - Check blockchain verification
   - View transaction hashes
   - See location maps (farm, distribution center, retail store)

4. **Price Transparency**
   - Complete price breakdown:
     - Farmer's original price
     - Distributor's margin
     - Logistic costs
     - Retailer's margin
     - Final consumer price
   - Understand value addition at each stage
   - Verify fair pricing

5. **Purchase & Verification**
   - Buy products with confidence
   - Verify authenticity via blockchain
   - Access complete product history
   - Report issues if needed

---

## ⛓️ Blockchain Integration

### Smart Contract Architecture

```solidity
// AgriDirect Smart Contract (Simplified)
contract AgriDirect {
    struct Product {
        uint256 id;
        address farmer;
        string variety;
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
        bool verified;
    }
    
    struct Transaction {
        uint256 productId;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string transactionType;
    }
    
    mapping(uint256 => Product) public products;
    mapping(bytes32 => Transaction) public transactions;
    
    event ProductAdded(uint256 indexed productId, address indexed farmer);
    event ProductVerified(uint256 indexed productId, address indexed admin);
    event ProductSold(uint256 indexed productId, address indexed from, address indexed to);
}
```

### Transaction Types

1. **Product Addition** (`FARMER_ADD`)
   - Farmer adds product to platform
   - Generates transaction hash
   - Records on blockchain

2. **Admin Approval** (`ADMIN_APPROVE`)
   - Admin verifies product
   - Sets price range
   - Creates approval transaction

3. **Distributor Purchase** (`DISTRIBUTOR_PURCHASE`)
   - Distributor buys from farmer
   - Records purchase transaction
   - Updates product ownership

4. **Distributor Listing** (`DISTRIBUTOR_LIST`)
   - Distributor lists on marketplace
   - Generates listing transaction
   - Makes available to retailers

5. **Retailer Purchase** (`RETAILER_PURCHASE`)
   - Retailer buys from distributor
   - Records purchase transaction
   - Updates ownership chain

6. **Retailer Listing** (`RETAILER_LIST`)
   - Retailer lists for consumers
   - Generates final listing transaction
   - Creates QR code with all hashes

### Transaction Hash Generation

All transaction hashes are generated using:
- **UUID Service**: `encryption.shubhamos.com/api/seed`
- **Format**: `0x` + 64 hexadecimal characters
- **Uniqueness**: Cryptographically secure random generation
- **Verification**: Stored in MongoDB and blockchain

### Blockchain Verification Process

```javascript
// Verification Flow
1. User initiates action (add product, purchase, etc.)
2. System generates transaction data
3. UUID service creates unique transaction ID
4. Transaction recorded on Ethereum blockchain
5. Transaction hash returned and stored
6. User receives confirmation with hash
7. Hash displayed in UI for verification
8. Complete history accessible via blockchain explorer
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git**

### Environment Variables

Create `.env` file in `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/agridirect

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Blockchain
ETHEREUM_NETWORK=mainnet
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0xYourContractAddress

# External APIs
UUID_API=https://encryption.shubhamos.com/api/seed
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
MANDI_API_URL=https://api.data.gov.in/resource/mandi_prices

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CLIENT_URL=http://localhost:5173
```

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/agridirect.git
cd agridirect
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install Client Dependencies**
```bash
cd ../client
npm install
```

4. **Setup Database**
```bash
# Start MongoDB
mongod

# Run seed script (optional - creates demo users)
cd ../server
node scripts/seedDemoUsers.js
```

5. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

6. **Access Application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### Demo Accounts

After running seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin 1 | admin1@agri.com | agri123 |
| Admin 2 | admin2@agri.com | agri123 |
| Farmer | farmer1@agri.com | agri123 |
| Distributor | distributor1@agri.com | agri123 |
| Retailer | retailer1@agri.com | agri123 |
| Consumer | consumer1@agri.com | agri123 |

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
GET    /api/auth/me                - Get current user
PUT    /api/auth/profile           - Update profile
POST   /api/auth/upload-license    - Upload license document
```

### Products (Farmer)

```
GET    /api/products               - Get all products
GET    /api/products/:id           - Get single product
POST   /api/products               - Add new product
PUT    /api/products/:id           - Update product
DELETE /api/products/:id           - Delete product
GET    /api/products/farmer/my     - Get farmer's products
```

### Admin

```
GET    /api/admin/pending          - Get pending products
PUT    /api/admin/verify/:id       - Verify product
PUT    /api/admin/reject/:id       - Reject product
GET    /api/admin/statistics       - Get platform stats
```

### Distributor

```
GET    /api/distributortomarketplaces              - Get distributor products
GET    /api/distributortomarketplaces/:id          - Get single product
POST   /api/distributor-purchases                  - Purchase from farmer
POST   /api/distributortomarketplaces/add          - Add to marketplace
GET    /api/distributor-purchases/my-purchases     - Get purchases
```

### Retailer

```
GET    /api/retailer-marketplace                   - Get retailer products
GET    /api/retailer-marketplace/:id               - Get single product
POST   /api/retailer-marketplace/add               - Add to marketplace
GET    /api/retailer-purchases/my-purchases        - Get purchases
POST   /api/products/:id/retailer/sell             - Purchase from distributor
```

### Consumer

```
GET    /api/retailer-marketplace/public            - Browse products
POST   /api/retailer-marketplace/:id/purchase      - Purchase product
GET    /api/consumer/purchases                     - Get purchase history
```

### Blockchain

```
GET    /api/blockchain/verify/:hash                - Verify transaction
GET    /api/blockchain/product/:id                 - Get product blockchain history
GET    /api/blockchain/transaction/:hash           - Get transaction details
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Role-Based Access**: Middleware for role verification
- **Token Expiration**: Automatic logout after 7 days
- **Secure Headers**: Helmet.js for HTTP headers

### Data Protection
- **Input Validation**: Mongoose schema validation
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Restricted origins
- **File Upload Security**: Type and size validation

### Blockchain Security
- **Immutable Records**: Cannot be altered once recorded
- **Cryptographic Hashing**: SHA-256 for transaction IDs
- **Smart Contract Auditing**: Regular security audits
- **Transaction Verification**: Multi-step validation

### Privacy
- **Data Encryption**: Sensitive data encrypted at rest
- **Secure Communication**: HTTPS in production
- **PII Protection**: Personal information anonymized in QR codes
- **GDPR Compliance**: Right to deletion and data export

---

## 💾 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['farmer', 'admin', 'distributor', 'retailer', 'consumer'],
  phone: String,
  address: String,
  location: {
    type: String,
    coordinates: [Number]
  },
  license: String,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  farmer: ObjectId (ref: User),
  variety: String,
  quantity: Number,
  price: Number,
  minPrice: Number,
  maxPrice: Number,
  image: String,
  status: Enum ['pending', 'verified', 'rejected'],
  adminApprovalTx: String,
  adminName: String,
  location: String,
  blockchainHistory: [{
    action: String,
    txHash: String,
    actor: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Distributor Product Schema
```javascript
{
  product: ObjectId (ref: Product),
  farmer: ObjectId (ref: User),
  buyer: ObjectId (ref: User),
  variety: String,
  quantity: Number,
  purchasePrice: Number,
  sellingPrice: Number,
  transportCost: Number,
  loadingCost: Number,
  storageCost: Number,
  processingCost: Number,
  profit: Number,
  status: Enum ['available', 'sold', 'IN_PROGRESS'],
  listingTxHash: String,
  purchaseTxHash: String,
  farmerName: String,
  farmerLocation: String,
  farmerPrice: Number,
  adminApprovalTx: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Retailer Purchase Schema
```javascript
{
  product: ObjectId (ref: DistributorProduct),
  distributor: ObjectId (ref: User),
  retailer: ObjectId (ref: User),
  variety: String,
  quantity: Number,
  pricePerKg: Number,
  totalPrice: Number,
  purchaseTxHash: String,
  farmerName: String,
  farmerLocation: String,
  farmerPrice: Number,
  distributorName: String,
  adminApprovalTx: String,
  distributorPurchaseTx: String,
  distributorListingTx: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Retailer Marketplace Schema
```javascript
{
  purchaseId: ObjectId (ref: RetailerPurchase),
  retailer: ObjectId (ref: User),
  variety: String,
  quantity: Number,
  price: Number,
  logisticCost: Number,
  totalPrice: Number,
  qrCode: String,
  listingTxHash: String,
  farmerName: String,
  farmerLocation: String,
  distributorName: String,
  farmerSoldPrice: Number,
  distributorSoldPrice: Number,
  adminApprovalTx: String,
  distributorPurchaseTx: String,
  distributorListingTx: String,
  retailerPurchaseTx: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Features in Detail

### QR Code System

**Generation Process:**
1. Retailer adds product to marketplace
2. System collects complete supply chain data
3. Data compressed into JSON format
4. QR code generated with optimal settings:
   - Resolution: 512x512 pixels
   - Error correction: Medium (M)
   - Format: PNG with maximum quality
   - Colors: Pure black (#000000) on white (#FFFFFF)

**QR Code Data Structure:**
```json
{
  "v": "Product Variety",
  "r": "Retailer Name",
  "d": "Distributor Name",
  "f": "Farmer Name",
  "l": "Farm Location",
  "p": "Final Price",
  "q": "Quantity",
  "t": "Date",
  "fp": "Farmer Price",
  "dp": "Distributor Price",
  "lc": "Logistic Cost",
  "tx": {
    "a": "Admin Approval Hash (10 chars)",
    "d1": "Distributor Purchase Hash (10 chars)",
    "d2": "Distributor Listing Hash (10 chars)",
    "r1": "Retailer Purchase Hash (10 chars)",
    "r2": "Retailer Listing Hash (10 chars)"
  }
}
```

**Scanning Features:**
- 30 FPS detection rate
- Full-frame scanning (no centering required)
- Works with any orientation
- Supports image upload
- Instant parsing and display
- Error handling with helpful messages

### Blockchain Animation

**Loading Sequence:**
1. Animated ETH logo with pulsing rings
2. Network status badge (Ethereum Mainnet)
3. Real-time gas price display
4. 7 blockchain blocks building sequentially:
   - Origin (🌾)
   - Farmer (👨‍🌾)
   - Verified (✅)
   - Transport (🚚)
   - Retail (🏪)
   - Payment (💰)
   - Sealed (🔒)
5. Each block shows:
   - Block number
   - Transaction hash
   - Timestamp
   - Stage icon and label
6. Data reveal with success animation
7. Contract details and gas usage
8. Progress bar with status messages

**Animation Duration:** ~4.8 seconds total

### Voice Assistant

**Capabilities:**
- Navigate dashboards
- Read product information
- Check transaction status
- Get help and instructions
- Multilingual support
- Hands-free operation

**Supported Commands:**
- "Show my products"
- "Read notifications"
- "Check earnings"
- "Help"
- "Go to marketplace"

### Location Tracking

**Google Maps Integration:**
- Farmer location (farm coordinates)
- Distributor hub (processing center)
- Retailer store (point of sale)
- Route visualization
- Distance calculation
- Embedded map views in traceability

---

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly controls
- Adaptive navigation

### Accessibility
- WCAG 2.1 compliant
- Screen reader support
- Keyboard navigation
- High contrast mode
- Voice assistant integration

### Animations
- Smooth transitions
- Loading states
- Success/error feedback
- Blockchain verification animation
- Progress indicators

### Dark Mode Support
- System preference detection
- Manual toggle
- Consistent theming
- Reduced eye strain

---

## 🧪 Testing

### Unit Tests
```bash
cd server
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
cd client
npm run test:e2e
```

---

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets served via CDN
- **Database Indexing**: Optimized queries
- **Compression**: Gzip for API responses

---

## 🔄 Deployment

### Production Build

```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Docker Deployment

```bash
docker-compose up -d
```

### Environment Setup

Ensure production environment variables are set:
- Database connection strings
- API keys
- Blockchain network configuration
- CORS origins
- SSL certificates

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style
- ESLint configuration
- Prettier formatting
- Conventional commits
- JSDoc comments

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: Shubham
- **Blockchain Developer**: [Name]
- **Frontend Developer**: [Name]
- **Backend Developer**: [Name]
- **UI/UX Designer**: [Name]

---

## 📞 Support

For support, email support@agridirect.com or join our Slack channel.

---

## 🙏 Acknowledgments

- Ethereum Foundation for blockchain infrastructure
- MongoDB for database solutions
- Google Maps for location services
- encryption.shubhamos.com for UUID generation
- Open source community for various libraries

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Multi-role authentication
- ✅ Product management
- ✅ Blockchain integration
- ✅ QR code system
- ✅ Complete traceability

### Phase 2 (Q2 2024)
- [ ] Mobile applications (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] AI-powered price prediction
- [ ] Multi-language support
- [ ] Payment gateway integration

### Phase 3 (Q3 2024)
- [ ] IoT sensor integration
- [ ] Weather data integration
- [ ] Crop disease detection
- [ ] Insurance integration
- [ ] Government scheme integration

### Phase 4 (Q4 2024)
- [ ] International expansion
- [ ] Multi-currency support
- [ ] Advanced logistics tracking
- [ ] Farmer training modules
- [ ] Community marketplace

---

## 📊 Statistics

- **Active Users**: Growing daily
- **Products Listed**: Thousands
- **Blockchain Transactions**: Verified and immutable
- **Supply Chain Transparency**: 100%
- **Farmer Satisfaction**: High ratings

---

**Built with ❤️ for farmers, by developers who care about agricultural transparency and fair trade.**
