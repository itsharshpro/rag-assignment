const jwtService = require('../services/auth/jwtService');
const responseService = require('../services/response/responseService');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = jwtService.extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json(responseService.formatErrorResponse('Access token required', 401));
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json(responseService.formatErrorResponse('Token has expired', 401));
    } else {
      return res.status(403).json(responseService.formatErrorResponse('Invalid token', 403));
    }
  }
};

module.exports = { authenticateToken };
