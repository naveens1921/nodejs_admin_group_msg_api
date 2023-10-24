const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { activeTokens } = require('../routes/auth');

const secretKey = config.JWT_SECRET;

// User Authentication Middleware
const authenticateUser = (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;

        if (activeTokens.has(token)) {
            next();
        } else {
            res.sendStatus(401).json({ message: 'Login required for performing this action' });
        }
    } catch (error) {
        return res.status(401).json({ message: config.JWT_SECRET, });
    }
}


//isAdmin role check iddleware
const isAdmin = (req, res, next) => {
    const token = req.get('Authorization');

    if (!token) {
        return res.status(401).send('Token is missing.');
    }

    try {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).send('Invalid token.');
            }

            const userRole = decoded.role;
            if (userRole === 'admin') {
                next();
            }
            else {
                return res.status(401).json({ message: 'User not have permission', });
            }

        });
    } catch (error) {
        return res.status(401).json({ message: 'User not have permission', });
    }

};

module.exports = { isAdmin, authenticateUser };