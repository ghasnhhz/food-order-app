require("dotenv").config({quiet: true})
const express = require("express")
const authRoutes = require("./routes/auth")
const menu = require("./routes/menu") 
const orders = require("./routes/orders")
const errorHandler = require("./middlewares/errorHandler")
const cookieParser = require("cookie-parser")
const { authenticateToken } = require("./middlewares/authMiddleware")
const cors = require('cors');
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: 'https://food-order-with-clicks.netlify.app', // frontend URL
  credentials: true
}));

app.use("/auth", authRoutes)
app.use("/menu", authenticateToken, menu)
app.use("/orders", authenticateToken, orders)


app.use((req, res) => {
  res.status(404).json({error: "404 Not Found"})
})

app.use(errorHandler)

module.exports = app
