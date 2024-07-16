const cloudinary = require('cloudinary').v2;
//connecotr function to cloudnary
const connectToclouDinary = async function (req, res) {
    try {
        await cloudinary.config({
            cloud_name: 'dmnsvpzzu',
            api_key: '829623268746184',
            api_secret: '0Zj3_mHn8z8xYo7NNEmcPiYENNY' // Click 'View Credentials' below to copy your API secret
        });
        console.log("cloudinary connection made successfully!");
    }
    catch (err) {
        res.send("error: " + err.message);
    }
}
module.exports = connectToclouDinary;