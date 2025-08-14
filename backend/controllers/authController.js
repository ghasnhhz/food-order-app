const jwt = require("jsonwebtoken")
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken")

async function register(req, res, next) {
  try {
    const { username, password } = req.body
  
    if (!username || !password) {
      const error = new Error("username and password are required")
      error.statusCode = 400
      return next(error)
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      const error = new Error("Username is already taken")
      error.statusCode = 409
      return next(error)
    }

    // Create user
    const newUser = await User.create({ username, password })
    
    // AUTO-LOGIN: Generate tokens immediately after registration
    const accessToken = jwt.sign(
      { id: newUser._id, username: newUser.username }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '10m' }
    )
    
    const refreshToken = jwt.sign(
      { id: newUser._id}, 
      process.env.REFRESH_TOKEN_SECRET, 
      { expiresIn: '7d' }
    )
    
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Save refresh token to database
    await RefreshToken.create({
      token: refreshToken,
      userId: newUser._id
    })

    // Return tokens and user info (same as login)
    res.status(201).json({
      message: "User registered and logged in successfully",
      token: accessToken,
      user: {
        _id: newUser._id,
        username: newUser.username,
        role: newUser.role 
      }
    })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body
  
    if (!username || !password) {
      const error = new Error("username and password are required")
      error.statusCode = 400

      next(error)
    }

    const user = await User.findOne({ username })

    if (!user) {
      const error = new Error("Invalid credentials")
      error.statusCode = 401

      next(error)
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      const error = new Error("Invalid credentials")
      error.statusCode = 401

      next(error)
    }

    const accessToken = jwt.sign({ id: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
    const refreshToken = jwt.sign({ id: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id
    })

    res.status(200).json({
      message: "Successful login",
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role 
      }
    })
  } catch (err) {
    next(err)
  }
}


module.exports = {register, login}