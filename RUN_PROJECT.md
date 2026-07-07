# Run Project

1. Install Node.js 18+ and MongoDB.
2. Open the folder in VS Code.
3. Run:

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

4. Visit `http://localhost:5000`.

If MongoDB uses a different URL, edit `MONGO_URI` in `.env` before running the seed command.
