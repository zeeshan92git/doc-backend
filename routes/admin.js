import express from 'express';
import { addDoctor , adminlogin , getAllDoctors , getAllAppointments , Appointmentcancel , adminDashboard} from '../controllers/admin.js';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authadmin.js';
import { changeAvailability } from '../controllers/doctor.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/login',adminlogin);
adminRouter.post('/all-doctors',authAdmin,getAllDoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability);
adminRouter.post('/appointments',authAdmin,getAllAppointments);
adminRouter.post('/appointment-cancel',authAdmin,Appointmentcancel);
adminRouter.post('/dashboard',authAdmin,adminDashboard);
export default adminRouter;