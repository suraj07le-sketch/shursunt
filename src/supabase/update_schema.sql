-- 1. Reset Data
truncate table public.indian_stocks;
truncate table public.crypto_coins;

-- 2. Ensure Unique Constraints for Upsert
alter table public.indian_stocks drop constraint if exists indian_stocks_symbol_key;
alter table public.indian_stocks add constraint indian_stocks_symbol_key unique (symbol);

-- Assuming crypto_coins table exists (implied by previous code)
-- If not, we should create it, but for now let's just add constraint if it exists
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'crypto_coins') then
    alter table public.crypto_coins drop constraint if exists crypto_coins_symbol_key;
    alter table public.crypto_coins add constraint crypto_coins_symbol_key unique (symbol);
  end if;
end $$;
