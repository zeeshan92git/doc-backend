import express from  'express';
import { getAllDoctors , loginDoctor , appointmentsBooked , appointmentCancel , appointmentComplete , docDashboard , updatedocProfile,
      docProfile} from '../controllers/doctor.js';
import authDoc from '../middleware/docauth.js';
const doctorRouter = express.Router();

doctorRouter.get('/list',getAllDoctors);
doctorRouter.post('/login',loginDoctor);
doctorRouter.post('/appointment',authDoc,appointmentsBooked);
doctorRouter.post('/appointment-cancel',authDoc,appointmentCancel);
doctorRouter.post('/appointment-done',authDoc,appointmentComplete);
doctorRouter.post('/dashboard',authDoc,docDashboard);
doctorRouter.post('/profile',authDoc,docProfile);
doctorRouter.post('/update-profile',authDoc,updatedocProfile);

export default doctorRouter;
