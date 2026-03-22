import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Start server
const startServer = async () => {
  try {
    await connectionToDB();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 BrainBazaar Server is running!                       ║
║                                                           ║
║   📡 Port: ${PORT}                                        ║
║   🔗 API: http://localhost:${PORT}/api/v1                 ║
║   🏥 Health: http://localhost:${PORT}/ping                ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
