# Check DB

## Open `psql`

```bash
docker exec -it t-bank-postgres-1 psql -U tbank -d tbank
```

## One-shot query

```bash
docker exec -i t-bank-postgres-1 psql -U tbank -d tbank -c "select * from user_data limit 20;"
```

## Commands inside `psql`

```sql
\dt
```

```sql
\dt *user*
```

```sql
\d user_data
```

```sql
select * from user_data limit 20;
```

```sql
select id, login, first_name, second_name
from user_data
where login like 'qa_%'
limit 20;
```

## Notes

- user table: `user_data`
- e2e/smoke tests create `qa_*` users
