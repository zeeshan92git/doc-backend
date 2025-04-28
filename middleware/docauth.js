import jwt from "jsonwebtoken";

//doc auth .. middleware
const authDoc = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const dtoken = authHeader && authHeader.split(' ')[1];
        console.log("Token received from headers in authDoc.js file on backend: ",dtoken);
        if (!dtoken) {
            return res.json({ success: false, message: "Not Auth. Login Again" });
        }

        try {
            const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
            req.body.docId = token_decode.id;
            //console.log(" req.body.userId", req.body.docId);
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
export default authDoc;
