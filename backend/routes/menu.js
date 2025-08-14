const express = require("express")
const { getMenu, getFoodById, addFood, editFood, deleteFood } = require("../controllers/menuController")
const { authenticateToken } = require("../middlewares/authMiddleware")
const router = express.Router()

//express().use(authenticateToken)

router.get("/", getMenu)
router.get("/:id", getFoodById)
router.post("/", addFood)
router.put("/:id", editFood)
router.delete("/:id", deleteFood)

module.exports = router