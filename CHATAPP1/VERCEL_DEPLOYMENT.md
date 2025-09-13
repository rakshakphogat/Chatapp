# Vercel Deployment Guide

## Backend Deployment

1. **Push your code to GitHub repository**

2. **Deploy to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `backend` folder as the root directory
   - Add environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-domain.vercel.app
     ```

3. **Deploy**

## Frontend Deployment

1. **Update environment variables:**

   - Create `.env.production` file:
     ```
     VITE_API_URL=https://your-backend-name.vercel.app/api
     ```

2. **Deploy to Vercel:**

   - Import your GitHub repository again
   - Select the `frontend` folder as the root directory
   - Vercel will automatically detect it's a Vite project
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-name.vercel.app/api
     ```

3. **Deploy**

## Important Notes

### For Backend:

- ✅ `vercel.json` is configured
- ✅ CORS is set up for Vercel domains
- ✅ Socket.IO CORS is configured
- ✅ Environment variables are validated

### For Frontend:

- ✅ `vercel.json` handles SPA routing
- ✅ Build configuration is ready
- ✅ Environment variables configured

### Potential Issues and Solutions:

1. **Socket.IO Connection Issues:**

   - Ensure WebSocket support is enabled
   - Use polling fallback: Add `transports: ["polling", "websocket"]` to Socket.IO client

2. **CORS Errors:**

   - Make sure both frontend and backend URLs are added to CORS origins
   - Update `FRONTEND_URL` environment variable in backend

3. **Database Connection:**

   - Use MongoDB Atlas for production
   - Whitelist Vercel's IP addresses or use 0.0.0.0/0

4. **Environment Variables:**
   - All required env vars must be set in Vercel dashboard
   - Frontend env vars must start with `VITE_`

## Testing Production Build Locally

### Backend:

```bash
cd backend
npm run build  # if you have a build script
npm start
```

### Frontend:

```bash
cd frontend
npm run build
npm run preview
```
