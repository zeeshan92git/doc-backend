import express from  'express';
import { getProfile, registerUser, updateuserProfile, userLogin , bookAppointment , listAppointments , cancelAppointment , paymentViaStripe , updatePaymentStatus} from '../controllers/user.js';
import authUser from '../middleware/authuser.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',userLogin);
userRouter.get('/get-profile',authUser, getProfile);
userRouter.post('/update-profile',upload.single('image'),authUser,updateuserProfile);
userRouter.post('/book-appointment',authUser,bookAppointment);
userRouter.get('/appointments',authUser,listAppointments);
userRouter.post('/cancel-appointment',authUser,cancelAppointment);
userRouter.post('/pay-appointment', authUser, paymentViaStripe);
userRouter.post('/update-payment', authUser, updatePaymentStatus);

export default userRouter;
