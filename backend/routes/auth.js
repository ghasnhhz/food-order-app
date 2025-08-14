const express = require("express")
const { register, login } = require("../controllers/authController")
const { handleRefreshToken } = require("../controllers/refreshController")
const {logout} = require("../controllers/logoutController")
const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/refresh", handleRefreshToken)
router.post("/logout", logout)

module.exports = router