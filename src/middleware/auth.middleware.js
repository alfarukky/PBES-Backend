import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  console.log('Auth Middleware');

  // Extract token from Authorization header
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const [bearer, token] = authorizationHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ message: 'Invalid Authorization header format' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized', error: err });
    }
    req.user = decoded;
    next();
  });
};
