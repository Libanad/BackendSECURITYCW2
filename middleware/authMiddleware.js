// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.header('Authorization');

//     if (!token) {
//         return res.status(401).json({ message: 'Authorization token not found' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Ensure this is used in your app

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Extract token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Authorization token not found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
