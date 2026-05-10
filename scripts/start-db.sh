#!/bin/bash
echo "Starting PostgreSQL 15..."
sudo /Library/PostgreSQL/15/bin/pg_ctl start -D /Library/PostgreSQL/15/data -l /Library/PostgreSQL/15/data/pg_log/startup.log
echo "Done. Checking connection..."
sleep 2
sudo /Library/PostgreSQL/15/bin/psql -U postgres -d travel_aggregator -c "SELECT 'DB OK' as status;"
