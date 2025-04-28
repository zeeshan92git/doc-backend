import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from "../models/user.js";
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctor.js';
import appointmentModel from '../models/appointment.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


//user registration
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        if (!name, !email, !password) {
            return res.json({ success: false, message: "Missing Details" });
        }

        //validating email & password format
        if (!validator.isEmail(email))
            return res.json({ success: false, message: "Enter a valid email" });
        if (password.length < 8)
            return res.json({ success: false, message: "Enter a strong (8-character)password" });

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedpswrd = await bcrypt.hash(password, salt);

        const userData = { name, email, password: hashedpswrd };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        //creating token for auth...
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);// Include user id in the token payload
        return res.json({ success: true, token });

    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
//user login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }
        console.log(user);
        const isMatchedPW = await bcrypt.compare(password, user.password);
        if (isMatchedPW) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        }
        else {
            return res.json({ success: false, message: "Invalid Credentials" });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
//user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const data = await userModel.findById(userId).select('-password');
        if (!data) {
            return res.json({ success: false, message: "User data not found" });
        }
        return res.json({ success: true, data });
    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
//update profile
const updateuserProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imgFile = req.file;
        if (!name || !phone || !address || !dob || !gender) {
            return res.json({ success: false, message: "Missing Data" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });


        if (imgFile) {
            const imgUpload = await cloudinary.uploader.upload(imgFile.path, { resource_type: "image" });
            const imgURL = imgUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imgURL });
        }

        return res.json({ success: true, message: "Profile Updated" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}
//book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not available" });
        }

        let slotsBooked = docData.slots_booked;
        //slot_Availability
        if (slotsBooked[slotDate]) {
            if (slotsBooked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot not available" });
            }
            else {
                slotsBooked[slotDate].push(slotTime);
            }
        } else {
            slotsBooked[slotDate] = [];
            slotsBooked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select('-password');

        delete docData.slots_booked;

        const appointmentData = {
            userId, docId, userData, docData, amount: docData.fee,
            slotDate, slotTime, date: Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();
        await doctorModel.findByIdAndUpdate(docId, { slots_booked: slotsBooked });
        return res.json({ success: true, message: "Appointment Booked Successfully" })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
//getting user booked appointments
const listAppointments = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });
        if(appointments.length === 0){
            return res.json({ success: false, message : "Appointments not found."});
        }
        return res.json({ success: true, data : appointments , message : "Appointments found."});
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
//to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        //verify appointment user
        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: "Unauthorized Action." });
        }
        //cancelled:false --> true
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData;
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
//making payment via Stripe
const paymentViaStripe = async (req, res) => {

    const { amount, appointmentId ,  doctorname , slotDate , slotTime , phone} = req.body;
    console.log({amount, appointmentId ,  doctorname , slotDate , slotTime});
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // in cents
            currency: 'usd',
            metadata: { appointmentId , doctorname , slotDate , slotTime , phone},
            automatic_payment_methods: { enabled: true }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updatePaymentStatus = async (req,res) => {
    const {appointmentId , userId} = req.body;
    try{
        const appointmentData = await appointmentModel.findById(appointmentId);
        //verify appointment user
        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: "Unauthorized Action" });
        }
        //payment:false --> true
        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
        return res.json({success:true , message:"Payment Status Updated."});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser, userLogin, getProfile, updateuserProfile, bookAppointment, listAppointments, cancelAppointment, paymentViaStripe ,updatePaymentStatus};
