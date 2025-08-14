require("../models/Menu")
const mongoose = require("mongoose")
const Orders = require("../models/Order")

async function getOrders(req, res, next) {
  try {
    const orders = await Orders.find()
      .select("-__v -createdAt -updatedAt")
      .populate({
        path: "menuItem",
        select: "-__v -createdAt -updatedAt"
      })
    if (orders.length === 0) {
      const error = new Error("No orders found")
      error.statusCode = 200

      return next(error)
    }

    res.status(200).json(orders)
  } catch (err) {
    next(err)
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params
   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400

      return next(error)
    }

    const order = await Orders.findById(id)
      .select("-__v -createdAt -updatedAt")
      .populate({
      path: "menuItem",
      select: "_id name price"
    })

    res.status(200).json(order)
  } catch (err) {
    next(err)
  }
}

async function addOrder(req, res, next) {
  try {
    const order = req.body

    if (!order) {
      const error = new Error("Order is not complete")
      error.statusCode = 400
      return next(error)
    }

    const result = await Orders.create(order)
    res.status(201).json({
      message: "Your food is successfully added to the orders queue.",
      orderId: result._id
    })
  } catch (err) {
    next(err)
  }
}

async function editOrder(req, res, next) {
  try {
    const { id } = req.params
    const editedOrder = req.body
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400
      return next(error)
    }

    const updatedOrder = await Orders.findByIdAndUpdate(id, editedOrder, { new: true })
    
    res.status(200).json({message: "Order successfully updated", updatedOrder})
  } catch (err) {
    next(err)
  }
}

async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID")
      error.statusCode = 400
      return next(error)
    }

    const deletedOrder = await Orders.findById(id)

    await Orders.findByIdAndDelete(id)

    res.status(200).json({message: "Order successfully deleted", deletedOrder})
  } catch (err) {
    next(err)
  }
}
module.exports = {getOrders, getOrderById, addOrder, editOrder, deleteOrder}