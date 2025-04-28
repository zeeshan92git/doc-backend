import validator from "validator";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctor.js";
import appointmentModel from "../models/appointment.js";
import userModel from "../models/user.js";
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary
import jwt from 'jsonwebtoken';

// adding doctor

const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fee, address } = req.body;
        const imagefile = req.file;

        if (!imagefile) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        }

        console.log({ name, email, password, speciality, degree, experience, about, fee, address });

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fee || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        //validate email=format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong (8-character)password" });
        }

        //hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedpswrd = await bcrypt.hash(password, salt);


        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imagefile.path);
        const imageUrl = uploadResult.secure_url;

        const doctordata = {
            name,
            email,
            password: hashedpswrd,
            speciality,
            degree,
            experience,
            about,
            fee,
            image: imageUrl, // Save Cloudinary URL
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctordata);
        await newDoctor.save();

        res.status(200).json({ message: "Doctor added successfully", success: true });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }

};

const adminlogin = (req, res) => {
    try {
        const { email, password } = req.body;
        //console.log("Email & password received from user:", email, "&", password);

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET); // Include email in the token payload
            console.log("Value of token is: ", token);
            return res.json({ success: true, token });
        } else {
            return res.json({ success: false, message: "Invalid Credentials" }); // Correct status code
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// get all doctors
const getAllDoctors = async (req, res) => {

    try {
        const docotors = await doctorModel.find({}).select('-password');
        return res.json({ success: true, message: "All Dcotors Data", data: docotors })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

// get all  booked appointments data

const getAllAppointments = async (req, res) => {
    try {
        const appointmets = await appointmentModel.find({});
        if (!appointmets) {
            return res.json({ messag: "Appointments didn't Fetch..", success: false });
        }
        return res.status(200).json({ messag: "Appointments Fetched.", success: true, data: appointmets });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ messag: "Internal Server Error" });
    }
};

// to cancel appointment

const Appointmentcancel = async  (req, res) => {
    try {
        const { appointmentId } = req.body;
        //console.log(appointmentId);
        const appointmentData = await appointmentModel.findById(appointmentId);
        //console.log(appointmentData);
        //cancelled:false --> true
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
        console.log({docId, slotDate, slotTime});
        const docData = await doctorModel.findById(docId).select('-password');
        let slots_booked = docData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        return res.json({ success: true, message: "Appointment Cancelled." });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//dashBoard data

const adminDashboard = async (req,res) => {
    try{
        const doctor = await doctorModel.find({});
        if(!doctor){
            return res.json({success:false , message :"Docdata not fetched."})
        }
        const user = await userModel.find({});
        if(!user){
            return res.json({success:false , message :"Userdata not fetched."})
        }
        const appointment = await appointmentModel.find({});
        if(!appointment){
            return res.json({success:false , message :"Appointment data not fetched."})
        }

        const dashData =  {
            doctors : doctor.length,
            appointments : appointment.length,
            users : user.length,
            latestAppointments : appointment.reverse().slice(0,5)
        }

        return res.status(200).json({ success:true , message:"DashData Fetched." , data : dashData});
    }
    catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
export { addDoctor, adminlogin, getAllDoctors, getAllAppointments , Appointmentcancel , adminDashboard };