# Chiryani POS - Restaurant Management System

A modern, comprehensive Point of Sale (POS) system built with Next.js, Supabase, and Tailwind CSS. Perfect for restaurants, food courts, and delivery businesses.

## Features

### 🍽️ POS System
- Modern, intuitive interface for order taking
- Menu grid with item selection
- Smart cart management with quantity controls
- Size selection for items that require it
- Real-time order calculation with tax

### 📊 Dashboard & Analytics
- Today's orders and revenue tracking
- Monthly revenue analytics
- Order source breakdown (Zomato, Swiggy, Call Orders, Dine-in)
- Real-time order status management
- Performance metrics and insights

### 📋 Order Management
- Complete order history with search functionality
- Order status tracking (Pending → Preparing → Ready → Delivered)
- Filter orders by source, status, and date
- Detailed order view with customer information
- Bill search and management

### 🚀 Multi-Platform Support  
- **Dine-in Orders**: For restaurant table service
- **Zomato Integration**: Track Zomato delivery orders
- **Swiggy Integration**: Manage Swiggy orders
- **Phone Orders**: Handle direct customer calls
- Customer name tracking for all order types

### 💾 Database Features
- Real-time data synchronization with Supabase
- Automated daily statistics collection
- Order history with full details
- Revenue tracking and reporting
- Scalable PostgreSQL database

### 🖨️ Thermal Printer Support
- **Bluetooth, USB, and Serial** connection support
- **ESC/POS compatible** printers (EPSON, Star Micronics, Citizen, Bixolon)
- **Auto-print receipts** after order confirmation
- **Professional receipt format** with restaurant branding
- **Cash drawer integration** for connected drawers
- **Configurable print settings** (paper width, cutting, etc.)

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with modern gradients
- **Components**: Radix UI components
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm package manager
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chiryani-pos
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your URL and anon key
   - Run the SQL commands from `database/schema.sql` in your Supabase SQL editor

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application uses Supabase as the backend database. The schema includes:

### Tables

1. **orders** - Stores all order information
   - Order number, customer details, items, amounts
   - Order source (dine-in, zomato, swiggy, call)
   - Status tracking throughout order lifecycle

2. **daily_stats** - Aggregated daily statistics
   - Total orders and revenue per day
   - Breakdown by order source
   - Automated statistics calculation

### Setup Instructions

1. Create a new Supabase project
2. Run the SQL commands from `database/schema.sql`
3. The tables will be created with proper indexes and triggers
4. Sample data will be inserted for testing

## Usage Guide

### POS Interface
1. **Menu Selection**: Click on menu items to add to cart
2. **Cart Management**: Adjust quantities, remove items
3. **Checkout Process**: Select order source and add customer name
4. **Receipt Generation**: Automatic receipt with order number

### Dashboard
1. **View Analytics**: Monitor today's performance and monthly trends
2. **Order Management**: Track order status and update as needed
3. **Search Orders**: Find specific orders using order number or customer name

### Order History
1. **Complete History**: View all past orders with full details
2. **Advanced Filtering**: Filter by source, status, date range
3. **Status Updates**: Update order status in real-time
4. **Detailed View**: Click to see complete order information

## Order Flow

```
New Order → Pending → Preparing → Ready → Delivered
                   ↘ Cancelled (if needed)
```

## Payment Integration Options

The system is designed to work with multiple order sources:

- **Dine-in**: Direct restaurant orders
- **Zomato**: Integration ready for Zomato orders
- **Swiggy**: Integration ready for Swiggy orders  
- **Phone Orders**: Direct customer phone orders

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   - Add your Supabase URL and API key in Vercel dashboard
   - Under Settings > Environment Variables

3. **Deploy**
   - Automatic deployment on git push
   - Production-ready with edge functions

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Features in Detail

### Order Sources
- **Dine-in**: 🍽️ Restaurant table service
- **Zomato**: 🚚 Food delivery platform integration
- **Swiggy**: 🛵 Food delivery platform integration  
- **Call Orders**: 📞 Direct customer phone orders

### Status Management
- **Pending**: Order received, waiting to start
- **Preparing**: Kitchen is preparing the order
- **Ready**: Order ready for pickup/delivery
- **Delivered**: Order completed successfully
- **Cancelled**: Order cancelled (if needed)

### Analytics Features
- Real-time revenue tracking
- Order source performance
- Daily/monthly comparisons
- Customer behavior insights

## Customization

### Menu Items
Update menu items in `components/menu-grid.tsx`:
```typescript
const menuItems = [
  {
    id: "1",
    name: "Your Item Name", 
    price: 250,
    image: "/your-image.jpg",
    requiresSize: false // or true for items with size options
  }
  // Add more items...
]
```

### Styling
- Tailwind CSS classes for easy customization
- Modern gradient themes
- Responsive design for all devices
- Dark mode ready (can be easily added)

## API Endpoints

The application uses Supabase for all database operations:

- **Orders**: CRUD operations for order management
- **Statistics**: Automated daily stats calculation
- **Real-time**: Live updates using Supabase subscriptions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Check the documentation
- Review the code examples
- Open an issue on GitHub

## License

This project is available for commercial use. Perfect for restaurants, food courts, and delivery businesses.

---

**Built with ❤️ for the food service industry**
# chiryani-pos
