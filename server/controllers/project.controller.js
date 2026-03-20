import Project from "../models/project.model.js";
import AppError from "../Utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({});
        res.status(200).json({
            success: true,
            message: 'All projects',
            projects,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const createProject = async (req, res, next) => {
    try {
        const { title, description, category, createdBy, price } = req.body;

        if (!title || !description || !category || !createdBy || !price) {
            return next(new AppError('All fields are required', 400));
        }

        const project = await Project.create({
            title,
            description,
            category,
            createdBy,
            price,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy',
            },
        });

        if (!project) {
            return next(new AppError('Project could not be created, please try again', 400));
        }

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms', // keeping folder name for now or changing to projects
                });
                if (result) {
                    project.thumbnail.public_id = result.public_id;
                    project.thumbnail.secure_url = result.secure_url;
                }
                fs.rm(`uploads/${req.file.filename}`);
            } catch (e) {
                return next(new AppError(e.message, 500));
            }
        }

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project created successfully',
            project,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndUpdate(
            id,
            { $set: req.body },
            { runValidators: true, new: true }
        );

        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return next(new AppError('Project not found', 404));
        }

        await Project.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
};
