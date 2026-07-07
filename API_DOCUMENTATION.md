# API Documentation

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/register` — register user
- `POST /auth/login` — login and receive JWT
- `GET /auth/me` — current authenticated user
- `PUT /auth/profile` — update profile

## Products

- `GET /products` — list products; supports `search`, `category`, `sort`, `featured`
- `GET /products/categories` — list categories
- `GET /products/:slug` — product details and reviews
- `POST /products` — admin create product
- `PUT /products/:id` — admin update product
- `PATCH /products/:id/stock` — admin update stock
- `DELETE /products/:id` — admin delete product
- `POST /products/upload` — admin image upload with Multer

## Wishlist

- `GET /users/wishlist` — current user's wishlist
- `POST /users/wishlist/:productId` — toggle wishlist item

## Orders

- `POST /orders` — create order from cart
- `GET /orders` — current user's orders
- `GET /orders/all` — admin order list
- `GET /orders/:id` — order details
- `PUT /orders/:id/status` — admin update order status

## Admin Users

- `GET /users/stats` — dashboard stats
- `GET /users` — admin user list
- `PUT /users/:id/role` — admin update role
- `DELETE /users/:id` — admin delete user
