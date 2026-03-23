# Inventra - Inventory Management System Frontend

A modern React-based inventory management system with real-time WebSocket communication, AI assistant, presence tracking, and multi-tenant support.

## Tech Stack

- **React 19** - Frontend framework
- **Material-UI (MUI) v6** - Component library and icons
- **MUI X Date Pickers v7** - Date/time picker components
- **Recharts v2** - Charts and data visualization
- **Axios v1** - HTTP client with interceptors
- **React Router v7** - Client-side routing
- **STOMP.js v7 + SockJS** - WebSocket real-time communication
- **date-fns** - Date manipulation
- **emoji-picker-react** - Emoji picker in chat
- **Emotion** - CSS-in-JS styling engine

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   └── AIAssistant.js            # Floating AI chat assistant (side panel)
│   ├── auth/
│   │   ├── Login.js                  # User login page
│   │   ├── CompanyRegister.js        # Company + admin registration
│   │   ├── Register.js               # User registration
│   │   └── AuthTest.js               # Auth testing component
│   ├── categories/
│   │   └── CategoryList.js           # Category management (CRUD)
│   ├── chat/
│   │   ├── ChatList.js               # List of conversations
│   │   ├── ChatDetail.js             # Individual chat view with emoji picker
│   │   ├── ChatNavIcon.js            # Navbar chat icon with unread badge
│   │   ├── Message.js                # Chat message component
│   │   └── NewChatDialog.js          # Create new chat dialog
│   ├── common/
│   │   ├── ProtectedRoute.js         # Route protection wrapper
│   │   ├── Unauthorized.js           # 403 unauthorized page
│   │   └── EmptyState.js             # Empty state placeholder
│   ├── dashboard/
│   │   └── Dashboard.js              # Main dashboard with stats & charts
│   ├── inventory/
│   │   └── InventoryList.js          # Inventory management (CRUD)
│   ├── layout/
│   │   └── Navbar.js                 # Main navigation bar
│   ├── notifications/
│   │   └── NotificationsSystem.js    # Notifications dropdown
│   ├── products/
│   │   ├── ProductList.js            # Product list with search/filter
│   │   ├── ProductDetail.js          # Product details page
│   │   └── ProductForm.js            # Create/edit product form
│   ├── suppliers/
│   │   └── SupplierList.js           # Supplier management (CRUD)
│   ├── transactions/
│   │   ├── TransactionList.js        # Transaction history
│   │   ├── TransactionDetail.js      # Transaction details
│   │   └── TransactionForm.js        # Create transaction form
│   └── users/
│       ├── UserList.js               # User management (admin only)
│       └── UserProfile.js            # User profile page
├── context/
│   ├── AuthContext.js                # Authentication context provider
│   └── PresenceContext.js            # Real-time online presence tracking
├── services/
│   ├── AIService.js                  # AI assistant API calls
│   ├── ApiService.js                 # Base API configuration
│   ├── AuthHeader.js                 # JWT token header helper
│   ├── AuthService.js                # Authentication API calls
│   ├── AxiosInterceptor.js           # Axios request/response interceptors
│   ├── ChatService.js                # Chat API calls
│   ├── InventoryService.js           # Inventory API calls
│   ├── NotificationService.js        # Notification API calls
│   ├── ProductService.js             # Product API calls
│   ├── TransactionService.js         # Transaction API calls
│   ├── UserService.js                # User API calls
│   └── WebSocketService.js           # STOMP WebSocket connection manager
├── types/
│   └── Transaction.ts                # Transaction TypeScript interface
├── App.js                            # Main app with routes
├── App.css                           # Global styles
└── index.js                          # Entry point
```

## Features

### Authentication & Authorization
- JWT-based authentication with token injection via Axios interceptors
- Role-based access control: **ADMIN**, **MANAGER**, **EMPLOYEE**
- Protected routes with role checking
- Company registration with admin account setup

### Dashboard
- Statistics cards with trend comparison vs previous day
- Inventory history area chart with Brush zoom/pan
- Product categories pie chart
- Low stock items alerts with auto-refresh (30s)
- Real-time update triggers via WebSocket

### Inventory Management
- Product CRUD with detail view and form-based create/edit
- Category management
- Supplier management
- Stock level tracking with reorder levels
- Low stock alerts

### Transactions
- Transaction types: PURCHASE, SALE, RETURN, ADJUSTMENT, TRANSFER
- Transaction history with detail view
- Reference number, unit price, and total amount tracking

### Real-time Chat
- One-on-one messaging between company users
- Emoji picker support
- Unread message badges in navbar
- Online/offline presence indicators
- 10-second message polling

### Presence System
- Real-time online user tracking via WebSocket STOMP
- Online users list via REST API
- User availability shown in chat interfaces
- `PresenceContext` provides company-scoped presence state

### Notification System
- Unread notification count in navbar
- Mark individual or all notifications as read
- Delete notifications
- Dropdown notification panel

### AI Assistant
- Floating button (bottom-right)
- Non-blocking side panel
- Quick suggestion chips:
  - "What products are low on stock?"
  - "Show inventory summary"
  - "List all suppliers"
  - "Show recent transactions"
- Session message history with typing indicators

### User Management (Admin)
- Create, edit, delete users
- Role assignment (ADMIN, MANAGER, EMPLOYEE)
- Password strength and email format validation

### Multi-Tenant Export
- Company-scoped data export functionality
- Cascade delete for products and associated data

## WebSocket Integration

The app uses STOMP over SockJS for real-time features:

| Topic | Purpose |
|-------|---------|
| `/topic/presence/{companyId}` | Online/offline presence updates |
| `/topic/updates/{companyId}` | Entity change notifications (products, inventory) |

**Connection endpoint:** `http://localhost:8080/ws`

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register-company`
- `POST /api/auth/register`

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `GET /api/admin/users` - List all users (admin)
- `POST /api/admin/users` - Create user (admin)
- `PUT /api/admin/users/{id}` - Update user (admin)
- `DELETE /api/admin/users/{id}` - Delete user (admin)

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/{id}`
- `DELETE /api/suppliers/{id}`

### Inventory
- `GET /api/inventory`
- `GET /api/inventory/low-stock`
- `GET /api/inventory-history/recent`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/{id}`

### Chat
- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/recent`
- `GET /api/chats/unread-count`
- `GET /api/chats/{id}/messages`
- `POST /api/chats/{id}/messages`

### Notifications
- `GET /api/notifications`
- `GET /api/notifications/count-unread`
- `PUT /api/notifications/{id}/mark-read`
- `DELETE /api/notifications/{id}`

### Presence
- `GET /api/presence/online`

### Stats
- `GET /api/stats/previous`
- `POST /api/stats/snapshot`

### AI
- `POST /api/ai/ask`
- `GET /api/ai/health`

## Form Validation

### Company Registration
- Company name: Required, min 2 characters
- CUI: Required, format `RO12345678`
- Admin name: Required, min 2 characters
- Email: Valid email format
- Password: Min 8 chars, uppercase, lowercase, number

### User Creation (Admin)
- Name: Required, 2-50 characters
- Email: Valid email format
- Password: Min 8 chars, uppercase, lowercase, number
- Role: ADMIN, MANAGER, or EMPLOYEE

## Environment Configuration

The app connects to a backend at `http://localhost:8080`. To change this, update the base URL in the relevant service files:
- `src/services/ApiService.js`
- `src/services/AuthService.js`
- `src/services/ChatService.js`
- `src/services/WebSocketService.js`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Key Components

### Dashboard.js
Main dashboard (~1400 lines). Contains:
- 4 stat cards with trend indicators (30s auto-refresh)
- Inventory history AreaChart with Brush zoom control
- Product categories PieChart
- Low stock items list
- WebSocket-triggered data refreshes

### Navbar.js
Navigation with:
- Logo and branding
- Role-based navigation links
- Notifications dropdown
- Chat icon with unread badge
- User menu with logout
- Mobile-responsive drawer

### AIAssistant.js
Floating AI chat:
- Bottom-right floating button
- Non-modal side panel
- Quick suggestion chips
- Session message history

### AuthContext.js
Authentication state:
- Current user and company info
- Login/logout functions
- JWT token management
- Role checking helpers

### PresenceContext.js
Real-time presence state:
- Online users list (company-scoped)
- WebSocket STOMP subscription
- Exposes helpers for checking if a user is online

### WebSocketService.js
STOMP WebSocket manager:
- Connect/disconnect lifecycle
- Topic subscriptions
- Reconnect logic

## Styling

- MUI `sx` prop for inline responsive styling
- Custom fonts: Poppins, Roboto, Montserrat
- Color scheme: Blues (#3498db, #2980b9), Greens (#2ecc71, #27ae60), Reds (#e74c3c)
- Consistent border radius: 8px–12px
- Gradient backgrounds on cards and buttons

## User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full access including user management and admin operations |
| MANAGER | Inventory, products, categories, suppliers, transactions |
| EMPLOYEE | Limited read/basic operations on inventory |

## Multi-Tenancy

- Each company has fully isolated data
- Users belong to one company
- Company ID is embedded in the JWT token
- WebSocket subscriptions are scoped per company ID
- Export and cascade delete operations are company-scoped

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.0.0 | UI framework |
| @mui/material | 6.4.7 | Component library |
| @mui/icons-material | 6.4.7 | Material icons |
| @mui/x-date-pickers | 7.27.3 | Date/time pickers |
| recharts | 2.15.1 | Charts |
| axios | 1.8.2 | HTTP client |
| react-router-dom | 7.3.0 | Routing |
| @stomp/stompjs | 7.2.1 | WebSocket STOMP |
| sockjs-client | 1.6.1 | WebSocket fallback |
| date-fns | 2.29.3 | Date utilities |
| emoji-picker-react | 4.15.1 | Emoji picker |
| @emotion/react | 11.14.0 | CSS-in-JS |

## Browser Support

Modern browsers: Chrome, Firefox, Safari, Edge. Responsive layout for mobile, tablet, and desktop.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev server at http://localhost:3000 |
| `npm test` | Jest test runner |
| `npm run build` | Production build to `/build` |
| `npm run eject` | Eject from CRA (irreversible) |

---

Last updated: March 2026
