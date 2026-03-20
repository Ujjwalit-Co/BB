import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import dotenv from 'dotenv';
dotenv.config();

const projects = [
    {
        title: "AI Image Generator",
        description: "A full-stack AI image generation app using OpenAI DALL-E and React.",
        category: "Artificial Intelligence",
        price: 499,
        thumbnail: {
            public_id: "dummy_ai",
            secure_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
        },
        createdBy: "Admin"
    },
    {
        title: "E-commerce Platform",
        description: "A premium e-commerce site with product management and checkout.",
        category: "Web Development",
        price: 999,
        thumbnail: {
            public_id: "dummy_ecommerce",
            secure_url: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800"
        },
        createdBy: "Admin"
    },
    {
        title: "Crypto Portfolio Tracker",
        description: "Real-time cryptocurrency tracking dashboard with balance charts.",
        category: "Fintech",
        price: 299,
        thumbnail: {
            public_id: "dummy_crypto",
            secure_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800"
        },
        createdBy: "Admin"
    }
];

const seedProjects = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URL);
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for seeding projects...");

        await Project.deleteMany({});
        console.log("Deleted existing projects.");

        await Project.insertMany(projects);
        console.log("Seed projects added successfully!");

        process.exit();
    } catch (error) {
        console.error("Error seeding projects:", error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
};

seedProjects();
