import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'User role is not authorized' })
      return
    }
    next()
  }
}

export const hasPermission = (permission) => {
  return (req, res, next) => {
    // SuperAdmin and Admin have all permissions
    if (req.user.role === 'superAdmin' || req.user.role === 'admin') {
      return next()
    }
    
    // Check if user has the specific permission
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next()
    }
    
    res.status(403).json({ message: 'User does not have permission to access this resource' })
  }
}

