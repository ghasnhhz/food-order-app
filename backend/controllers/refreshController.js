const jwt = require("jsonwebtoken")
const RefreshToken = require("../models/RefreshToken")
const User = require("../models/User")

async function handleRefreshToken(req, res) {
  const cookies = req.cookies

  if (!cookies?.refreshToken) {
    return res.status(401).json({message: "No refresh token provided"})
  }

  const oldRefreshToken = cookies.refreshToken

  const tokenInDB = await RefreshToken.findOne({ token: oldRefreshToken })
  
  if(!tokenInDB) return res.status(403).json({message: "Invalid or expired refresh token"})

  jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" })
    
    const user = await User.findById(decoded.id)

    if (!user) return res.sendStatus(403)
    
    await RefreshToken.deleteOne({ token: oldRefreshToken })
    
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    
    await RefreshToken.create({ token: newRefreshToken, userId: user._id })
    
    const newAccessToken = jwt.sign({ id: user._id, username: user.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2m' })
    
    res.status(200).json({accessToken: newAccessToken})
  })
}

module.exports = {handleRefreshToken}