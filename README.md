# Driving School API

Backend for a driving school management app. Handles authentication, lesson booking, payments, real-time chat, and push notifications.

See also: [Frontend (Mobile App)](https://github.com/xsllq/driving-school-frontend)

## Tech Stack

- Node.js
- Express 5
- MongoDB (Mongoose)
- Socket.io
- JWT authentication
- Expo push notifications
- node-cron for scheduled tasks

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

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/validate - Validate current token
- GET /api/auth/users - Get all users (admin)
- DELETE /api/auth/users/:id - Delete user (admin)
- PATCH /api/auth/users/:id/activate - Activate user (admin)

### Products

- GET /api/products - Get available products
- GET /api/products/all - Get all products (admin)
- GET /api/products/balance - Get user balance
- GET /api/products/orders - Get user orders
- POST /api/products/orders - Create order
- POST /api/products - Create product (admin)
- PUT /api/products/:code - Update product (admin)
- DELETE /api/products/:code - Delete product (admin)

### Lessons

- GET /api/lessons - Get available slots
- POST /api/lessons/book - Book a lesson
- GET /api/lessons/student - Get student's lessons
- GET /api/lessons/instructor - Get instructor's lessons
- GET /api/lessons/history - Lesson history
- POST /api/lessons/:id/cancel - Cancel lesson
- POST /api/lessons/:id/rate - Rate lesson
- POST /api/lessons/:id/exam-result - Set exam result (instructor)

### Instructors

- GET /api/instructors - List instructors
- GET /api/instructors/:id/rating - Get rating

### Chats

- GET /api/chats - Get user's chats
- GET /api/chats/:chatId/messages - Get messages
- POST /api/chats/:chatId/messages - Send message
- POST /api/chats/:chatId/read - Mark as read

### Tests

- GET /api/tests/categories - Get categories
- GET /api/tests/:category - Get test questions

## WebSocket

Socket.io handles real-time chat.

Events:

- connection
- join
- leave
- newMessage
- messagesRead

## User Roles

- student - Book lessons, buy packages, chat, take tests
- instructor - View schedule, chat with students, set exam results
- admin - Manage users and products

## Screenshots

Registration attempt without authentication - returns 401 error:

<img width="935" height="481" alt="register_unathorized" src="https://github.com/user-attachments/assets/07d70f16-d411-4e42-a73d-44ab3c917467" />

Successful registration with valid token:

<img width="1252" height="810" alt="register_autorized" src="https://github.com/user-attachments/assets/316a56fe-ff5c-4011-a605-d720d890f28f" />

Booking validation - insufficient balance error:

<img width="1263" height="470" alt="booking_failed_2" src="https://github.com/user-attachments/assets/2c644e59-c24a-4dd3-8c1e-cecf9dcc4bb7" />

Booking validation - time slot already taken:

<img width="768" height="501" alt="booking_failed" src="https://github.com/user-attachments/assets/2b8ab4bf-d636-497e-9868-57505207e6ac" />

Successful lesson booking response:

<img width="1267" height="949" alt="booking" src="https://github.com/user-attachments/assets/8dc3267b-5394-4919-b5f1-b7d359bb2a46" />


