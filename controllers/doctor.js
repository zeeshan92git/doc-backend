import doctorModel from "../models/doctor.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointment.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;
        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        return res.json({ success: true, message: "Availability Changed" });

    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const docData = await doctorModel.find({}).select(['-password', '-email']);
        if (!docData) {
            return res.json({ success: false, message: "Failed to get data" })
        }
        return res.json({ success: true, message: "Doctors Data Fetched Successfully.", data: docData });

    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// login as doctor
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });
        //console.log(doctor);
        if (!doctor) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
        return res.json({ success: true, message: "Token created", token });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

//  get appointments for  doctor panel 
const appointmentsBooked = async (req, res) => {
    try {
        const { docId } = req.body;
        //console.log("DocId" , docId);
        const appointment = await appointmentModel.find({ docId });
        //console.log(appointment);
        console.log(Array.isArray(appointment)); // true
        if (appointment.length == 0) {
            return res.json({ success: false, message: "Appointments not found" });
        }
        return res.json({ success: true, data: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// mark completed true
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        console.log("docId , appointmentId", { docId, appointmentId });
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: "Appointment  marked." });
        }
        return res.json({ success: false, message: "Appointment not marked." });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
// cancel appointment by  panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        console.log("docId , appointmentId", { docId, appointmentId });
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            return res.json({ success: true, message: "Appointment  cancelled." });
        }
        return res.json({ success: false, message: "Cancellation failed." });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// dashData for doctor
const docDashboard = async (req, res) => {
    try {
        const { docId } = req.body;

        const appointments = await appointmentModel.find({ docId });
        if (!appointments) {
            return res.json({ success: false, message: "Appointments not fetched." })
        }

        let earning = 0;
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earning += item.docData.fee;
            }
        })

        let patient = [];
        appointments.map((item) => {
            if (!patient.includes(item.userId)) {
                patient.push(item.userId);
            }
        });

        const dashData = {
            earning,
            appointments: appointments.length,
            patient: patient.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        return res.status(200).json({ success: true, message: "docDashData Fetched.", data: dashData });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// doc-profile
const docProfile = async (req, res) => {
    try {

        const { docId } = req.body;
        const profileData = await doctorModel.findById(docId).select('-password');
        if (!profileData) {
            return res.json({ success: false, message: "Doc Profile Data not found." })
        }
        return res.json({ success: true, data : profileData  , message : "Doctor Profile Data Fetched."});

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const updatedocProfile = async (req, res) => {
    try {

        const { docId, fee, available, address } = req.body;
        await doctorModel.findByIdAndUpdate(docId, { fee, available, address });
        return res.json({ success: true, message: "Profile Updated." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export {
     changeAvailability, getAllDoctors, 
     loginDoctor, appointmentsBooked, 
     appointmentComplete, appointmentCancel,
      docDashboard , updatedocProfile,
      docProfile};