// import express from 'express';
import app from './app.js';
// import { fileURLToPath } from 'url';
import connectionToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';
// import path from 'path';
// import path from 'path';

const PORT = process.env.PORT || 5000;

cloudinary.configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// for uploading in local storage---------->
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// for razorpay payment gateway (Moved to config/razorpayConfig.js)
const startServer = async () => {
    try {
        await connectionToDB();
        app.listen(PORT, () => {
            console.log(`Server is listening at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
};  
startServer();