# Supabase Database Guidelines

Never edit `schema.sql` after it has been run. For every database change, create a new numbered file in `migrations/` (`002_...`, `003_...`), run it in the Supabase SQL Editor, then commit it.

## Structure:
- `schema.sql`: Initial base schema (tables, triggers, views, and strict RLS policies). Run once on new database setup.
- `seed.sql`: Starter sample data (10 products, 5 purchases, 5 sales) linked to your authenticated user account. Run after creating your first user.
- `migrations/`: Incremental schema updates (`002_*.sql`, `003_*.sql`, etc.).
