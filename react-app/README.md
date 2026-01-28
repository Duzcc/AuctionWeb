# VPA React Application - README

## 📝 Project Overview

This is a modern React application for the **Vietnam Plate Auction (VPA)** platform, migrated from vanilla JavaScript to React + Vite for improved performance, maintainability, and developer experience.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd react-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run at `http://localhost:5173`

---

## 📁 Project Structure

```
react-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components (Modal, BackToTop, etc.)
│   │   ├── layout/          # Layout components (Header, Footer, Layout)
│   │   ├── auction/         # Auction-specific components
│   │   ├── assets/          # Asset-related components
│   │   ├── profile/         # Profile components
│   │   └── modals/          # Modal components
│   │
│   ├── pages/               # Page components
│   │   ├── Home/
│   │   ├── News/
│   │   ├── Auction/
│   │   ├── Assets/
│   │   ├── Payment/
│   │   ├── Auth/
│   │   └── User/
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/               # Utility functions
│   │   ├── validation.js    # Form validation
│   │   ├── format.js        # Data formatting
│   │   ├── storage.js       # LocalStorage helpers
│   │   └── helpers.js       # General utilities
│   │
│   ├── data/                # Mock data and constants
│   │   ├── constants.js
│   │   ├── newsData.js
│   │   ├── assetData.js
│   │   └── auctionData.js
│   │
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

---

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **LocalStorage** - Data persistence

---

## 🔑 Key Features

### Pages (16+)
- **Home**: Landing page with featured auctions
- **News**: News list and detail pages
- **Auctions**: Car and motorbike auction listings
- **Assets**: Asset auction grid and detail pages
- **Payment Flow**: Cart → Checkout → Payment → Success/Failure
- **User Management**: Login/Register, Profile, Documents

### Components (21+)
- Reusable UI components (Header, Footer, Modal, etc.)
- Auction-specific components (AuctionTable, FilterSidebar)
- Modal components (Registration, Bidding, Deposit, PlateDetail)
- Profile components (ProfileSidebar)

### Contexts
- **AuthContext**: User authentication and profile management
- **CartContext**: Shopping cart and order management
- **ThemeContext**: Dark/light mode (prepared)

### Utilities
- **Validation**: Email, phone, ID card, tax code validation
- **Formatting**: Currency, dates, numbers, plate numbers
- **Storage**: Safe localStorage/sessionStorage wrappers
- **Helpers**: Debounce, throttle, clipboard, scroll utilities

---

## 🛣️ Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page |
| `/about` | AboutPage | Company information |
| `/news` | NewsPage | News and notifications list |
| `/news/:id` | NewsDetailPage | News article detail |
| `/notifications/:id` | NotificationDetailPage | Notification detail |
| `/car-auction` | CarAuctionPage | Car plate auctions |
| `/motorbike-auction` | MotorbikeAuctionPage | Motorbike plate auctions |
| `/assets` | AssetListPage | Asset auction grid |
| `/assets/:id` | AssetDetailPage | Asset detail |
| `/auction-history` | AuctionHistoryPage | User's auction history |
| `/cart` | CartPage | Shopping cart |
| `/checkout` | CheckoutPage | Order review |
| `/payment` | PaymentPage | Payment processing |
| `/payment-success` | PaymentSuccessPage | Success confirmation |
| `/payment-failure` | PaymentFailurePage | Failure handling |
| `/login` | LoginPage | Login/Register |
| `/profile` | ProfilePage | User profile editing |
| `/documents` | DocumentsPage | Document management |

---

## 🎯 Context APIs

### AuthContext
```javascript
{
  user,              // Current user object
  isAuthenticated,   // Boolean auth status
  login,             // (email, password) => result
  register,          // (userData) => result
  logout,            // () => void
  updateProfile      // (profileData) => result
}
```

### CartContext
```javascript
{
  cartItems,              // Array of cart items
  currentOrder,          // Pending checkout order
  addToCart,              // (item) => void
  removeFromCart,         // (id) => void
  markItemsAsPaid,        // (ids) => void
  refundCartItem,         // (id) => void
  createPendingOrder,     // (items) => void
  clearCurrentOrder       // () => void
}
```

---

## 🎨 Styling

The project uses **Tailwind CSS** with custom configurations:

- **Primary Color**: `#AA8C3C` (Antique Gold)
- **Custom Animations**: fadeIn, scaleIn, slideIn, bounce
- **Utility Classes**: `.btn-primary`, `.card`, `.badge-*`, etc.
- **Responsive Design**: Mobile-first approach

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting (if configured)
npm run lint         # Run ESLint
```

---

## 🔧 Configuration

### Path Aliases (@/)
Configured in `vite.config.js`:
```javascript
'@': path.resolve(__dirname, './src'),
'@components': path.resolve(__dirname, './src/components'),
'@contexts': path.resolve(__dirname, './src/contexts'),
'@pages': path.resolve(__dirname, './src/pages'),
'@utils': path.resolve(__dirname, './src/utils'),
'@data': path.resolve(__dirname, './src/data')
```

### Tailwind CSS
Theme customization in `tailwind.config.js`

---

## 🚧 Development Notes

### Mock Data
Currently using mock data stored in `/src/data/`. To connect to real APIs:
1. Create API service files in `/src/services/`
2. Replace mock data imports with API calls
3. Update contexts to handle async data

### Authentication
Using localStorage for demo purposes. For production:
- Implement JWT tokens
- Add refresh token logic
- Secure sensitive data

### Testing
- Add unit tests with Jest/Vitest
- Add E2E tests with Playwright/Cypress
- Test responsive design on various devices

---

## 📝 Migration Status

✅ **Completed Phases:**
- Phase 1-3: Core Infrastructure (Contexts, Router, Components)
- Phase 4: News & Notifications (3 pages)
- Phase 5: Auctions & Assets (5 pages)
- Phase 6: Payment Flow (5 pages)
- Phase 7: User Management (3 pages)
- Phase 8: Modal Components (5 modals)
- Phase 9: Utility Functions (4 modules)
- Phase 10: Styling & CSS

**Total: 21+ components fully migrated and functional!**

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

Proprietary - Vietnam Plate Auction Platform

---

## 📞 Support

- **Hotline**: 1900 0000
- **Email**: support@vpa.vn
- **Website**: https://vpa.vn

---

**Last Updated**: December 2025
