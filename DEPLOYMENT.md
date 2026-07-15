# Free deployment guide

## Recommended free stack
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas free tier
- File storage: Cloudinary free tier

## 1) Backend on Render
1. Create a new Web Service on Render using the server folder.
2. Set the build command to `npm install && npm run build`.
3. Set the start command to `npm run start`.
4. Add environment variables from server/.env.example.
5. Use the generated Render URL as your backend base URL.

## 2) Frontend on Vercel
1. Import the client folder into Vercel.
2. Set environment variables:
   - NEXT_PUBLIC_API_URL=https://<your-render-url>/api
   - NEXT_PUBLIC_SOCKET_URL=https://<your-render-url>
3. Deploy.

## 3) MongoDB Atlas
1. Create a free MongoDB Atlas cluster.
2. Copy the connection string to DATABASE_URL.

## 4) Cloudinary
1. Create a free Cloudinary account.
2. Add the cloud name and upload preset to the frontend env values.

## Health check
- Backend health endpoint: https://<your-render-url>/health
