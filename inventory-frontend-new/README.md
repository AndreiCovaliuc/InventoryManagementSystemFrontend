# Inventra - Inventory Management System Frontend

A modern React-based inventory management system with real-time notifications, AI assistant, and multi-tenant support.

## Tech Stack

- **React 18** - Frontend framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Charts and data visualization
- **Axios** - HTTP client
- **React Router v6** - Routing

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   └── AIAssistant.js        # Floating AI chat assistant
│   ├── auth/
│   │   ├── Login.js              # User login page
│   │   ├── CompanyRegister.js    # Company + admin registration
│   │   ├── Register.js           # Basic user registration
│   │   └── AuthTest.js           # Auth testing component
│   ├── categories/
│   │   └── CategoryList.js       # Category management (CRUD)
│   ├── chat/
│   │   ├── ChatList.js           # List of conversations
│   │   ├── ChatDetail.js         # Individual chat view
│   │   ├── ChatNavIcon.js        # Navbar chat icon with badge
│   │   ├── Message.js            # Chat message component
│   │   └── NewChatDialog.js      # Create new chat dialog
│   ├── common/
│   │   ├── ProtectedRoute.js     # Route protection wrapper
│   │   ├── Unauthorized.js       # 403 unauthorized page
│   │   └── EmptyState.js         # Empty state placeholder
│   ├── dashboard/
│   │   └── Dashboard.js          # Main dashboard with stats & charts
│   ├── inventory/
│   │   └── InventoryList.js      # Inventory management
│   ├── layout/
│   │   └── Navbar.js             # Main navigation bar
│   ├── notifications/
│   │   └── NotificationsSystem.js # Notifications dropdown
│   ├── products/
│   │   ├── ProductList.js        # Product list view
│   │   ├── ProductDetail.js      # Product details page
│   │   └── ProductForm.js        # Create/edit product form
│   ├── suppliers/
│   │   └── SupplierList.js       # Supplier management (CRUD)
│   ├── transactions/
│   │   ├── TransactionList.js    # Transaction history
│   │   ├── TransactionDetail.js  # Transaction details
│   │   └── TransactionForm.js    # Create transaction form
│   └── users/
│       ├── UserList.js           # User management (admin only)
│       └── UserProfile.js        # User profile page
├── context/
│   └── AuthContext.js            # Authentication context provider
├── services/
│   ├── AIService.js              # AI assistant API calls
│   ├── ApiService.js             # Base API configuration
│   ├── AuthHeader.js             # JWT token header helper
│   ├── AuthService.js            # Authentication API calls
│   ├── AxiosInterceptor.js       # Axios request/response interceptors
│   ├── ChatService.js            # Chat API calls
│   ├── InventoryService.js       # Inventory API calls
│   ├── NotificationService.js    # Notification API calls
│   ├── ProductService.js         # Product API calls
│   ├── TransactionService.js     # Transaction API calls
│   └── UserService.js            # User API calls
├── App.js                        # Main app with routes
├── App.css                       # Global styles
└── index.js                      # Entry point
```

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, MANAGER, EMPLOYEE)
- Protected routes with role checking
- Company registration with admin setup

### Dashboard
- Real-time statistics cards with trend indicators
- Inventory history chart with zoom/pan (Brush component)
- Product categories pie chart
- Low stock items alerts
- Recent suppliers and activity

### Inventory Management
- Product CRUD operations
- Category management
- Supplier management
- Stock level tracking
- Low stock alerts with reorder levels

### Transactions
- Stock in/out tracking
- Transaction history
- Detailed transaction records

### Communication
- Real-time chat between users
- Notification system
- Unread message badges

### AI Assistant
- Floating chat button (bottom-right)
- Side panel that doesn't block page interaction
- Contextual inventory questions

### User Management (Admin)
- Create/edit/delete users
- Role assignment
- Form validation (email, password strength)

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register-company` - Company registration

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `GET /api/admin/users` - List all users (admin)
- `POST /api/admin/users` - Create user (admin)
- `PUT /api/admin/users/{id}` - Update user (admin)
- `DELETE /api/admin/users/{id}` - Delete user (admin)

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Inventory
- `GET /api/inventory` - List inventory
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory-history/recent` - Get inventory history

### Stats
- `GET /api/stats/previous` - Get previous day stats snapshot
- `POST /api/stats/snapshot` - Create stats snapshot

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/count-unread` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read

### Chat
- `GET /api/chats` - List chats
- `GET /api/chats/recent` - Get recent chats
- `GET /api/chats/unread-count` - Get unread count
- `POST /api/chats` - Create chat
- `GET /api/chats/{id}/messages` - Get messages

### AI
- `POST /api/ai/ask` - Ask AI assistant
- `GET /api/ai/health` - AI health check

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

The app connects to a backend at `http://localhost:8080`. To change this, update the API URLs in the service files.

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
- 4 stat cards with trend indicators
- Inventory history chart (AreaChart with Brush)
- Product categories pie chart
- Low stock items list
- Recent suppliers

### Navbar.js
Navigation with:
- Logo and branding
- Navigation links based on role
- Notifications dropdown
- Chat icon with unread badge
- User menu

### AIAssistant.js
Floating AI chat:
- Bottom-right floating button
- Side panel (non-modal)
- Suggested questions
- Message history

### AuthContext.js
Authentication state management:
- Current user state
- Login/logout functions
- Token management
- Role checking helpers

## Styling

- Uses MUI's `sx` prop for inline styling
- Custom fonts: Poppins, Roboto, Montserrat
- Color scheme: Blues (#3498db, #2980b9), Greens (#2ecc71, #27ae60), Reds (#e74c3c)
- Consistent border radius: 8px-12px
- Gradient backgrounds on cards and buttons

## User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to all features including user management |
| MANAGER | Access to inventory, products, categories, suppliers, transactions |
| EMPLOYEE | Limited access to view inventory and basic operations |

## Known Issues / TODOs

1. **Profile Update 401 Error**: Backend needs to allow `PUT /api/users/{id}` for authenticated users
2. **Stats Snapshot Date**: Ensure backend creates snapshots with correct date

## Multi-Tenancy

The system supports multiple companies:
- Each company has isolated data
- Users belong to one company
- Company ID is derived from JWT token on backend

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
Ejects from Create React App (one-way operation)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile/tablet/desktop

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

---

Last updated: November 2025
