# ShopEase Pro — CodeAlpha Task 1

ShopEase Pro is a complete full-stack e-commerce website built for the CodeAlpha Task 1 submission. It includes a responsive storefront, product search and category filtering, product details, wishlist, cart, checkout, order history, JWT authentication, bcrypt password hashing, image uploads with Multer, MongoDB/Mongoose persistence, and an admin dashboard for products, orders, and users.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt
- File Uploads: Multer


  ## Screenshots

screenshots of the Home, Shop, Product Details, Cart, Checkout, Orders, and Admin Dashboard pages here.
Home:
<img width="1764" height="910" alt="image" src="https://github.com/user-attachments/assets/5879aa95-e3d8-46a7-9155-6dbcf076e86f" />
Shop:
<img width="1857" height="913" alt="image" src="https://github.com/user-attachments/assets/6d23287b-6ea3-4769-931f-1fb162b9be65" />
Product Details:
<img width="1662" height="897" alt="image" src="https://github.com/user-attachments/assets/3c561e07-b730-435c-886c-bb9c764f7553" />
Cart:
<img width="1716" height="902" alt="image" src="https://github.com/user-attachments/assets/45796092-b784-4531-8b5a-00a0b78cdb0d" />
Checkout:
<img width="1752" height="899" alt="image" src="https://github.com/user-attachments/assets/b2b9e5c3-fc03-4c31-a2b8-393f55d6d583" />
Orders:
<img width="1722" height="910" alt="image" src="https://github.com/user-attachments/assets/34ac4498-a7d6-4e0d-8589-438548358e86" />
<img width="1633" height="887" alt="image" src="https://github.com/user-attachments/assets/2f0e5b52-bafa-46b5-a0af-638fe27f5ada" />
Admin Dashboard pages:
<img width="1679" height="878" alt="image" src="https://github.com/user-attachments/assets/7a055f24-db80-4162-9fbb-7cbabec9c3af" /> 
<img width="1597" height="906" alt="image" src="https://github.com/user-attachments/assets/c5708e65-cb8f-49c8-bbd3-d9c84bdc1042" />
order status:
<img width="1731" height="899" alt="image" src="https://github.com/user-attachments/assets/86617ee8-ab76-4e85-83ce-28f34f02d4a5" />




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
