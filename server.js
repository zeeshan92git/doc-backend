import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

import connectdb from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/admin.js";
import doctorRouter from "./routes/doctor.js";
import userRouter from "./routes/user.js";
import Email_Router from "./routes/email.js";


//app config
const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
connectdb();
connectCloudinary();
//middlewares
app.use(express.json());   


const allowedOrigins = [
    process.env.FRONTEND_CLIENT_URI,
    process.env.FRONTEND_ADMIN_URI,
    process.env.AL_SHIFA_URI
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins
}));



//api end points
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/email', Email_Router);

app.get('/', (req, res) => {
    res.send('API WORKING GREATLY');
});

app.listen(port, () => {
    console.log(`Server running on ${host}:${port}`);
});

