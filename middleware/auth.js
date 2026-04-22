module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.session && req.session.adminId) {
            return next();
        }
        return res.redirect('/login');
    },
    isAdmin: (req, res, next) => {
        if (req.session && req.session.adminId) {
            // Further checks could be added here if there were multiple roles
            return next();
        }
        return res.status(403).send('Forbidden: Admins only');
    }
};
