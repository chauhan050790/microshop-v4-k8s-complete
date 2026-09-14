# Database

Prisma schema is in `prisma/schema.prisma`.

For a dedicated migration workflow:
```bash
npx prisma migrate dev --schema database/prisma/schema.prisma
npx prisma generate --schema database/prisma/schema.prisma
```

Production:
```bash
npx prisma migrate deploy --schema database/prisma/schema.prisma
```
Run migrations as a controlled CI/CD job before application rollout.

