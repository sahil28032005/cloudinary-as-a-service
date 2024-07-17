const express = require('express')
const multer = require("multer");
const path = require("node:path");
const app = express()
const port = 3000;
const connectToclouDinary = require('./config/cloudinary');
const cloudinary = require('cloudinary').v2;

//starter configuration methids fro cinnections
connectToclouDinary();
app.get('/', (req, res) => {
    res.send('Hello World!')
})
const storageConfig = multer.diskStorage({
    // destinations is uploads folder 
    // under the project directory
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, res) => {
        // file name is prepended with current time
        // in milliseconds to handle duplicate file names
        res(null, Date.now() + "-" + file.originalname);
    },
});
const fileFilterConfig = function (req, file, cb) {
    if (file.mimetype === "image/jpeg"
        || file.mimetype === "image/png" || file.mimetype === "video/mp4") {
        // calling callback with true
        // as mimetype of file is image
        cb(null, true);
    } else {
        // false to indicate not to store the file
        cb(null, false);
    }
};
const upload = multer({
    // applying storage and file filter
    storage: storageConfig,
    // limits: {
    //     // limits file size to 5 MB
    //     fileSize: 1024 * 1024 * 5
    // },
    fileFilter: fileFilterConfig,
});
//make controller for uplodaing single  image
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const fileData = req.file;
        if (!fileData) {
            return res.status(400).send('No file uploaded.');
        }
        console.log("fileData", fileData);//filedata.path gives local path to send as template to clodinary
        //code to uplload on cloud
        const uploadResult = await cloudinary.uploader
            .upload(
                fileData.path, {
                public_id: fileData.filename,
            }
            )
            .catch((error) => {
                console.log(error);
            });
        console.log(uploadResult);
        //image optimization and url retrival 
        const optimizeUrl = await cloudinary.url(fileData.filename, {
            fetch_format: 'auto',
            quality: 'auto'
        });
        res.status(201).send({
            success: true,
            message: 'image upload with optimizations',
            url: optimizeUrl
        });
    }
    catch (err) {
        res.status(404).send({
            success: false,
            message: err.message
        });
    }


});
//contoerller for uploading multiple images
app.post("/multiple-upload", upload.array('file', 10), async (req, res) => {
    var file = await req.files;
    console.log('filedata', file);
    const optimizedUrls = [];
    for (const image in file) {
        // console.log('filedata', file[image].path);
        const result = await cloudinary.uploader.upload(file[image].path);
        const optimizeUrl = await cloudinary.url(file[image].filename, {
            fetch_format: 'auto',
            quality: 'auto'
        });
        optimizedUrls.push(optimizeUrl);
    }
    res.send(JSON.stringify(optimizedUrls));
});
//connteoller for video uploads
app.post("/upload-video", upload.single("video"), async (req, res) => {
    try {
        const video = req.file;
        console.log(video.path);
        //cloudinary uploader endpoints
        await cloudinary.uploader
            .upload(video.path,
                {
                    resource_type: "video", public_id: video.filename,
                    overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"
                })
            .then(result => console.log(result));

    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})