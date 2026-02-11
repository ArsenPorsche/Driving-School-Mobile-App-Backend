# Driving School API

Backend for a driving school management app. Handles authentication, lesson booking, payments, real-time chat, and push notifications.

## Tech Stack
Node.js, Express 5, MongoDB (Mongoose), Socket.io, JWT authentication, Expo push notifications, node-cron for scheduled tasks.

## Setup
npm install

Create .env file:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/driving-school
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

Run the server:
npx nodemon server.js

Seed the database:
node seed/seedInstructors.js
node seed/seedProducts.js
node seed/seedTests.js

## API Endpoints

### Auth
POST /api/auth/register - Register new user
POST /api/auth/login - Login
POST /api/auth/refresh - Refresh access token
GET /api/auth/validate - Validate current token
GET /api/auth/users - Get all users (admin)
DELETE /api/auth/users/:id - Delete user (admin)
PATCH /api/auth/users/:id/activate - Activate user (admin)

### Products
GET /api/products - Get available products
GET /api/products/all - Get all products (admin)
GET /api/products/balance - Get user balance
GET /api/products/orders - Get user orders
POST /api/products/orders - Create order
POST /api/products - Create product (admin)
PUT /api/products/:code - Update product (admin)
DELETE /api/products/:code - Delete product (admin)

### Lessons
GET /api/lessons - Get available slots
POST /api/lessons/book - Book a lesson
GET /api/lessons/student - Get student's lessons
GET /api/lessons/instructor - Get instructor's lessons
GET /api/lessons/history - Lesson history
POST /api/lessons/:id/cancel - Cancel lesson
POST /api/lessons/:id/rate - Rate lesson
POST /api/lessons/:id/exam-result - Set exam result (instructor)

### Instructors
GET /api/instructors - List instructors
GET /api/instructors/:id/rating - Get rating

### Chats
GET /api/chats - Get user's chats
GET /api/chats/:chatId/messages - Get messages
POST /api/chats/:chatId/messages - Send message
POST /api/chats/:chatId/read - Mark as read

### Tests
GET /api/tests/categories - Get categories
GET /api/tests/:category - Get test questions

## WebSocket
Socket.io handles real-time chat. Events: connection, join, leave, newMessage, messagesRead.

## User Roles
student - Book lessons, buy packages, chat, take tests
instructor - View schedule, chat with students, set exam results
admin - Manage users and products

## Screenshots
Add screenshots here showing API testing in Postman and database collections in MongoDB Compass.

## License
ISC
