const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
    lowercase: true,
  },
  apartmentNo: {
    type: Number,
    required: true,
    min: 0,
  }, 
  telNo: {
    type: Number,
    required: true,
    min: 9,
  }
})

const ordersSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  address: addressSchema,
})

module.exports = mongoose.model("order", ordersSchema)