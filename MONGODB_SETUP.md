# MongoDB Setup

## Local MongoDB

1. Install MongoDB Community Server.
2. Start MongoDB.
3. Use this connection string in `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shopeasepro
```

## MongoDB Atlas

1. Create a free cluster.
2. Create a database user.
3. Allow your IP address.
4. Copy the connection string into `.env` as `MONGO_URI`.
5. Run `npm run seed`.
