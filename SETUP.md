# Chiryani POS - Database Setup Instructions

## Step 1: Supabase Database Setup

Your environment variables are already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://abrjcicbsjkfcptzyhbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Run Database Schema

**Go to your Supabase project:**
1. Open https://supabase.com/dashboard
2. Go to your project: `abrjcicbsjkfcptzyhbc`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire content from `database/schema.sql` 
6. Click "Run" to execute the SQL

**What this will create:**
- `orders` table - stores all order information
- `daily_stats` table - tracks daily statistics 
- Sample data with 10 orders and 7 days of stats
- Proper indexes and triggers for performance
- Row Level Security policies

## Step 3: Verify Database Setup

After running the SQL, you should see:
- "Orders created: 10"
- "Daily stats created: 7"

You can also check the tables in Supabase:
1. Go to "Table Editor" in your Supabase dashboard
2. You should see `orders` and `daily_stats` tables
3. Each table should have sample data

## Step 4: Run the Application

```bash
# Start development server
pnpm run dev
```

The application will be available at http://localhost:3000

## Step 5: Test the Features

### POS System
- Navigate between POS, Dashboard, and History using the sidebar
- Add items to cart and create test orders
- Try different order sources (Dine-in, Zomato, Swiggy, Call)

### Dashboard
- View today's statistics
- See order source breakdown
- Monitor real-time data

### Order History
- Search orders by number or customer name
- Filter by source and status
- Update order status
- View detailed order information

## Sample Data Included

**Orders:**
- 10 sample orders with different sources
- Various statuses (pending, preparing, ready, delivered)
- Different time ranges (today, yesterday, etc.)
- Customer names and items

**Daily Stats:**
- 7 days of statistical data
- Revenue tracking
- Order source breakdown
- Performance metrics

## API Endpoints

The application uses Supabase for all database operations:

- **Create Order**: `POST /orders`
- **Get Orders**: `GET /orders`
- **Update Order Status**: `PATCH /orders/:id`
- **Search Orders**: `GET /orders?search=term`
- **Get Daily Stats**: `GET /daily_stats`

## Production Deployment

When deploying to Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automatically

## Troubleshooting

**Build Issues:**
- Ensure Node.js 20+ is being used
- Run `pnpm install` to ensure all dependencies are installed

**Database Issues:**
- Verify Supabase credentials in `.env.local`
- Check that SQL script ran successfully
- Ensure RLS policies are properly set

**Connection Issues:**
- Verify your Supabase URL and API key
- Check that your Supabase project is active
- Ensure database tables exist

## Next Steps

1. **Customize Menu Items**: Update `components/menu-grid.tsx`
2. **Modify Styling**: Adjust Tailwind classes
3. **Add More Features**: Extend dashboard analytics
4. **Authentication**: Add user login if needed
5. **Real-time Updates**: Enable Supabase subscriptions

Your POS system is now ready to use! 🚀
