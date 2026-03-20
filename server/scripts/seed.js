import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
        if (!mongoUrl) {
            throw new Error('MONGO_URL or MONGO_URI is not defined in .env');
        }

        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        const dummyCourses = [
            {
                title: 'Full Stack Web Development',
                description: 'Learn MERN stack from scratch. Build real-world projects.',
                category: 'Development',
                price: 499,
                createdBy: 'Admin',
                thumbnail: {
                    public_id: 'dummy_thumb_1',
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
                }
            },
            {
                title: 'Data Science with Python',
                description: 'Master data analysis, visualization and machine learning.',
                category: 'Data Science',
                price: 699,
                createdBy: 'Admin',
                thumbnail: {
                    public_id: 'dummy_thumb_2',
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
                }
            },
            {
                title: 'Mobile App with React Native',
                description: 'Build cross-platform mobile apps for iOS and Android.',
                category: 'App Development',
                price: 599,
                createdBy: 'Admin',
                thumbnail: {
                    public_id: 'dummy_thumb_3',
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
                }
            }
        ];

        // Clear existing courses (Optional)
        // await Course.deleteMany({}); 

        for (const courseData of dummyCourses) {
            const exists = await Course.findOne({ title: courseData.title });
            if (!exists) {
                await Course.create(courseData);
                console.log(`Created: ${courseData.title}`);
            } else {
                console.log(`Skipped (already exists): ${courseData.title}`);
            }
        }

        console.log('Database seeding process completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
