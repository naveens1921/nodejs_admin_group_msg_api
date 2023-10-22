const jwt = require('jsonwebtoken');
const config = require('../config/env')
// const authenticateUser = (req, res, next) => {
//     const token = req.header('x-auth-token'); // Assuming you send the token in the header
//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//     try {
//         const decoded = jwt.verify(token, config.JWT_SECRET); // Replace with your secret key
//         req.user = decoded;
//         next();
//     } catch (ex) {
//         res.status(400).json({ message: 'Invalid token.' });
//     }
// };


// User Authentication Middleware
const  authenticateUser = (req, res, next) => {
    // Get the token from the request headers
    const token = req.header('Authorization');

    // Check if the token is present
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify the token using your JWT secret key
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Attach the decoded user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route
        next();
    } catch (error) {
        return res.status(401).json({ message: config.JWT_SECRET, });
    }
}



const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user; // Assuming you attach the user object to the request
        if (user && user.role === role) {
            next(); // User has the required role, proceed to the route handler
        } else {
            res.status(403).json({ message: 'Access denied.' }); // User does not have the required role
        }
    };
};

module.exports = { requireRole,authenticateUser};