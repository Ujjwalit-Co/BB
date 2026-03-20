import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const check = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        const courses = await Course.find({}, 'title price');
        console.log(JSON.stringify(courses, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

check();
