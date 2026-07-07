# Installation Guide

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Community Server or MongoDB Atlas
- VS Code

## Steps

```bash
cd CodeAlpha_Task1_ShopEasePro
npm install
cp .env.example .env
npm run seed
npm run dev
```

The root `package.json` installs the required Express, Mongoose, JWT, bcrypt, Multer, and development dependencies.
