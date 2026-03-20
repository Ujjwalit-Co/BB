import path from 'path';
import multer from 'multer';
import fs from 'fs'


if (!fs.existsSync("uploads/images")) fs.mkdirSync("uploads/images", { recursive: true });
if (!fs.existsSync("uploads/videos")) fs.mkdirSync("uploads/videos", { recursive: true });


// Image multer ----------------------
// Set storage engine
const imageStorage = multer.diskStorage({
    destination: 'uploads/images/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});



const videoStorage = multer.diskStorage({
    destination: 'uploads/videos/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});


// Check file type
function checkFileType(file, cb) {
    if (!file || !file.originalname) {
        return cb(new Error("Invalid file"));
    }
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}


// Check file type
function checkVideoFileType(req, file, cb) {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
}


const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req,file, cb)=>{
        checkFileType(file,cb);
    }
});


const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100*1024*1024 }, // 100MB limit
    fileFilter: checkVideoFileType
});




export{
    uploadImage,
    uploadVideo
};