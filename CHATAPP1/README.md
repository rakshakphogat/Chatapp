# ChatApp

A real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features

- Real-time messaging with Socket.io
- User authentication with JWT
- File sharing with Cloudinary
- Responsive design with Tailwind CSS
- Modern UI components with DaisyUI

## Project Structure

```
CHATAPP1/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── lib/           # Utility libraries
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── index.js       # Server entry point
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── vercel.json        # Vercel deployment config
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # State management
│   │   ├── lib/           # Utility functions
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── vercel.json        # Vercel deployment config
│   └── tailwind.config.js # Tailwind CSS config
└── README.md              # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account for file uploads

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

The server will start on http://localhost:5001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on http://localhost:5173

## Deployment

### Vercel Deployment

1. **Backend**: Deploy the `backend` folder to Vercel
2. **Frontend**: Deploy the `frontend` folder to Vercel

Both folders have their own `vercel.json` configuration files for proper deployment.

### Environment Variables for Production

Make sure to set the following environment variables in your Vercel dashboard:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Common Issues and Solutions

### Vercel Deployment Issues

1. **Frontend not showing**: Ensure `vercel.json` has proper rewrites for SPA routing
2. **CORS errors**: Update the backend CORS configuration with your frontend domain
3. **Build failures**: Check that all dependencies are properly listed in `package.json`

### Development Issues

1. **Socket.io connection issues**: Ensure backend is running before starting frontend
2. **Database connection**: Verify MongoDB URI and network access
3. **File upload issues**: Check Cloudinary credentials

## Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, DaisyUI, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **File Upload**: Cloudinary
- **State Management**: Zustand
- **Deployment**: Vercel
