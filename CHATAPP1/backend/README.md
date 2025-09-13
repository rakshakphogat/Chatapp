# ChatApp Backend

A complete backend implementation for the ChatApp real-time messaging application.

## Features

- **User Authentication**: Signup, Login, Logout with JWT tokens
- **Real-time Messaging**: Socket.IO integration for instant messaging
- **Image Upload**: Cloudinary integration for profile pictures and message images
- **User Management**: Profile updates and user listing
- **Security**: Password hashing, JWT authentication, CORS protection
- **Database**: MongoDB with Mongoose ODM

## Technologies Used

- **Node.js** & **Express.js**: Server framework
- **MongoDB** & **Mongoose**: Database and ODM
- **Socket.IO**: Real-time communication
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Cloudinary**: Image storage and processing
- **CORS**: Cross-origin resource sharing

## Project Structure

```
backend-new/
├── src/
│   ├── controllers/
│   │   ├── auth.js          # Authentication logic
│   │   └── message.js       # Message handling
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Message.js       # Message schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── message.js       # Message routes
│   ├── lib/
│   │   ├── db.js            # Database connection
│   │   ├── socket.js        # Socket.IO configuration
│   │   ├── cloudinary.js    # Cloudinary configuration
│   │   └── utils.js         # Utility functions
│   └── index.js             # Main server file
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel deployment config
└── README.md               # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update user profile (protected)
- `GET /api/auth/check` - Check authentication status (protected)

### Messages

- `GET /api/messages/users` - Get all users for sidebar (protected)
- `GET /api/messages/:id` - Get messages with specific user (protected)
- `POST /api/messages/send/:id` - Send message to user (protected)

### Health Check

- `GET /health` - Server health status

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation and Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Configure Environment**:

   - Copy your `.env` file with all required variables
   - Ensure MongoDB is accessible
   - Verify Cloudinary credentials

3. **Development Mode**:

   ```bash
   npm run dev
   ```

4. **Production Mode**:
   ```bash
   npm start
   ```

## Key Improvements Made

### 🔒 Security Enhancements

- Enhanced input validation and sanitization
- Improved error handling with proper status codes
- Better JWT token management
- Secure cookie configuration
- CORS protection with specific origins

### 🚀 Performance Optimizations

- Database indexing for better query performance
- Efficient message retrieval with proper sorting
- Connection pooling and error handling
- Graceful shutdown handling

### 📱 Real-time Features

- Socket.IO integration for instant messaging
- Online user tracking
- Real-time message delivery
- Connection management

### 🛠 Code Quality

- Modular and organized structure
- Comprehensive error handling
- Detailed logging and monitoring
- Environment validation
- Clean separation of concerns

### 🔧 DevOps Ready

- Health check endpoint
- Vercel deployment configuration
- Environment-specific configurations
- Graceful error handling and logging

## Socket.IO Events

### Client to Server

- `connection` - User connects
- `disconnect` - User disconnects

### Server to Client

- `newMessage` - New message received
- `getOnlineUsers` - Updated list of online users

## Error Handling

The backend includes comprehensive error handling:

- Input validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return consistent JSON responses with success status and message.

## Testing

Test the backend using:

1. **Health Check**: `GET /health`
2. **Postman/Thunder Client** for API testing
3. **Frontend integration** for full functionality

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy using the included `vercel.json` configuration

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write descriptive commit messages
5. Test thoroughly before submitting

## License

This project is licensed under the ISC License.
