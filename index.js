const express = require('express')
const multer = require("multer");
const path = require("node:path");
const app = express()
const port = 3000;
const connectToclouDinary=require('./config/cloudinary');

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
        || file.mimetype === "image/png") {
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
    limits: {
        // limits file size to 5 MB
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilterConfig,
});
//make controller for uplodaing single  image
app.post("/upload", upload.single("file"), (req, res) => {
    try {
        const fileData = req.file;
        if (!fileData) {
            return res.status(400).send('No file uploaded.');
        }
        console.log('filedata', fileData);

        res.status(201).send('Image uploaded successfully!');
    }
    catch (err) {
        res.status(404).send({
            success: false,
            message: err.message
        });
    }


});
//contoerller for uploading multiple images
app.post("/multiple-upload", upload.array('file', 10), (req, res) => {
    var file = req.body;
    res.end();
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})