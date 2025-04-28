import jwt from "jsonwebtoken";

//admin auth.. middleware

const authAdmin = async (req, res, next) => {
    try {
        //const {atoken} = req.headers;
        //console.log("All Headers:", req.headers);
        const authHeader = req.headers.authorization;
        const atoken = authHeader && authHeader.split(' ')[1];
        console.log("Token received from headers in authadmin.js file on backend: ", atoken);
        if (!atoken) {
            return res.json({ success: false, message: "Not Auth. Login Again" });
        }
        try {
            const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
            // Compare the decoded token's email with the expected admin email
            if (token_decode.email !== process.env.ADMIN_EMAIL) {
                return res.status(403).json({ success: false, message: "Not Auth. Login Again" });
            }
            next();
        }
        catch (jwtError) {
            // Handle invalid token errors
            console.error("JWT Verification Error:", jwtError);
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
export default authAdmin;