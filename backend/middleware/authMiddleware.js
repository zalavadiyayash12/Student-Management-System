const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('token');

    if (!token) {
        return res.send("Access Denied");
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.send("Invalid Token");
    }
};

module.exports = authMiddleware;