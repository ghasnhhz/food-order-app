const jwt = require("jsonwebtoken")

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    const error = new Error("Access denied. No token provided")
    error.statusCode = 401

    next(error)
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = {authenticateToken}