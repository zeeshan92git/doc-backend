import express from  'express';
import {sendEmail} from '../controllers/email.js';

const Email_Router = express.Router();

Email_Router.post('/send-email',sendEmail);

export default Email_Router;