exports.isAuthenticated = (req, res, next) => next();

exports.isMember = () => (req, res, next) => next();

exports.isAdmin = (req, res, next) => next();
