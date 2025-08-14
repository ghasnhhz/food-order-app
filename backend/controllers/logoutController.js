const RefreshToken = require("../models/RefreshToken")

async function logout(req, res) {
  const cookies = req.cookies
  if (!cookies?.refreshToken) return res.status(401).json({message: "No refresh token provided"})
  
  const refreshToken = cookies.refreshToken

  await RefreshToken.deleteOne({ token: refreshToken })
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === 'production'
  })

  res.status(200).json({message: "Logged out successfully"})
}

module.exports = {logout}