import { Router } from 'express';
import { getAllProjects, createProject, updateProject, deleteProject } from '../controllers/project.controller.js';
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/')
    .get(getAllProjects)
    .post(isLoggedIn, authorizedRoles('ADMIN'), uploadImage.single('thumbnail'), createProject);

router.route('/:id')
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateProject)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), deleteProject);

export default router;
