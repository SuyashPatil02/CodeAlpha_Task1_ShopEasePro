# ShopEase Pro — CodeAlpha Task 1

ShopEase Pro is a complete full-stack e-commerce website built for the CodeAlpha Task 1 submission. It includes a responsive storefront, product search and category filtering, product details, wishlist, cart, checkout, order history, JWT authentication, bcrypt password hashing, image uploads with Multer, MongoDB/Mongoose persistence, and an admin dashboard for products, orders, and users.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt
- File Uploads: Multer

## Demo Accounts

- Admin: `admin@shopeasepro.com` / `admin123`
- User: `user@shopeasepro.com` / `user123`

## Quick Start

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Open `http://localhost:5000` in your browser.

## Project Structure

```text
CodeAlpha_Task1_ShopEasePro/
├── backend/
│   ├── config/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── public/uploads/
│   ├── routes/
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── admin/
│   ├── css/
│   ├── js/
│   └── *.html
├── .env.example
├── package.json
└── documentation files
```

## Catalog

The seed script creates exactly 60 realistic products: 10 Fashion, 10 Electronics, 10 Footwear, 10 Accessories, 10 Beauty, and 10 Home & Living products. Product discounts are not stored as hardcoded percentages; badges are calculated dynamically from `oldPrice` and `price`.
