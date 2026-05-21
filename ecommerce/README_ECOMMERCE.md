Ecommerce setup notes

1. Database
- Open your Supabase project SQL editor and run `setup.sql` to create tables and seed products.
- `setup.sql` also adds a trigger to create a `profiles` row for each new `auth.users` entry and gives a starting balance of 10,000 currency units.

2. Environment
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel (or `.env.local` for local dev).

3. Admin role
- To make a user an admin, update the `profiles` table row and set `role = 'admin'` for that user's `id`.

4. Features added
- Product listing page at `/products` (reads from `products` table)
- Admin panel at `/admin` (requires admin role)
- Add product form in admin (client-side)
- Buy product action (server action) that creates an `orders` row, `order_items`, deducts stock, and decreases user `balance`.

5. Limitations
- Purchase flow is simple and not transactional; for production use add a Postgres transaction or RPC function to ensure atomicity.
