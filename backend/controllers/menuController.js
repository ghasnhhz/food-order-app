const mongoose = require("mongoose")
const Menu = require("../models/Menu")

async function getMenu(req, res, next) {
  try {
    const { name } = req.query
  
    if (name) {
      const foods = await Menu.find({ name })

      if (foods.length === 0) {
        const error = new Error("No foods found with that name") // new Error() === error.message
        error.statusCode = 200

        return next(error)
      }

      res.status(200).json(foods)
    } else {
      const menu = await Menu.find({}, {__v: 0})
    
      if (menu.length === 0) {
        const error = new Error("No foods are available yet")
        error.statusCode = 200
        return next(error)
      }

      res.status(200).json(menu)
    }
  } catch (err) {
    next(err)
  }
}

async function getFoodById(req, res, next) {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400
      return next(error)
    }

    const food = await Menu.findById(id)
    
    if (!food) {
      const error = new Error("No food found")
      error.statusCode = 404
      return next(error)
    }

    res.status(200).json(food)
  } catch (err) {
    next(err)
  }
}

async function addFood(req, res, next) {
  try {
    const newFood = req.body

    if (!newFood.name || !newFood.price) {
      const error = new Error("No food provided")
      error.statusCode = 400
      return next(error)
    }

    const result = await Menu.create(newFood)

    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function editFood(req, res, next) {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400

      return next(error)
    }
    const editedFood = req.body
    
    const updatedFood = await Menu.findByIdAndUpdate(id, editedFood, { new: true })

    if (!updatedFood) {
      return res.status(404).json({message: "Food not found"});
    }
    
    res.status(200).json({message: "Food is updated successfully", updatedFood})
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

async function deleteFood(req, res, next) {
  try {
    const { id } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400

      return next(error)
    }

    const deletedFood = await Menu.findById(id)

    await Menu.findByIdAndDelete(id)

    res.status(200).json({message: "Food successfully deleted", deletedFood})
  } catch (err) {
    next(err)
  }
}



module.exports = {getMenu, getFoodById, addFood, editFood, deleteFood}