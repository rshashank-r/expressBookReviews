const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Write the authenication mechanism here
    
    // 1. Check if the user has a session and an 'accessToken' property
    if(req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Retrieve the token from the session

        // 2. We use jwt.verify to confirm the token is valid (not expired, signature matches)
        // NOTE: The secret key 'access' must match the one used to sign the token during login.
        jwt.verify(token, "access", (err, user) => {
            if(!err){
                // If verification is successful, store the user info (from the token payload)
                // in the request object and proceed to the next handler.
                req.user = user; 
                next();
            }
            else{
                // If verification fails (e.g., expired or invalid token)
                return res.status(403).json({message: "User not authenticated or token expired"});
            }
         });
    } else {
        // 3. If no session or no authorization object exists, deny access.
        return res.status(403).json({message: "User not logged in"});
    }
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));