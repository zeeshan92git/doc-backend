import {v2 as cloudinary} from 'cloudinary';

const connectCloudinary = async()=>{

    cloudinary.config({
        cloud_name : process.env.CLOUDINARY_NAME,
        api_key : process.env.CLOUDINARY_APIKEY,
        api_secret : process.env.CLOUDINARY_SECRETKEY
    })
}

export default connectCloudinary;