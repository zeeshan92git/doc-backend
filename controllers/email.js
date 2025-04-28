import { sendEmailUtil } from '../utils/send-email.js';

const sendEmail = async (req, res) => {
    console.log(req.body);
    const { name, email, subject, message } = req.body;

    const emailSubject = 'Thanks for contacting DocCure!';
    const emailText = `
Hello ${name},
Thank you for reaching out to DocCure!
------------------------------------

You'r Subject : ${subject}
You'r Message : ${message}

-------------------------------------
We'll get back to you shortly.
Best Wishes,
The DocCure Team
`;

    try {
        const info = await sendEmailUtil({
            to: email,
            subject: emailSubject,
            text: emailText
        });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send email' });
    }
};

export { sendEmail };
