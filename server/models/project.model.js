import { model, Schema } from 'mongoose';

const projectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please enter project title'],
        minLength: [5, 'Project title must be at least 5 characters long'],
        maxLength: [100, 'Project title must not exceed 100 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter project description'],
        minLength: [10, 'Project description must be at least 10 characters long'],
        maxLength: [500, 'Project description must not exceed 500 characters'],
    },
    category: {
        type: String,
        required: [true, 'Please enter project category'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter project price'],
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Project = model('Project', projectSchema);

export default Project;
