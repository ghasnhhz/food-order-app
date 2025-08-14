process.env.NODE_ENV = "test"
require("dotenv").config({ path: ".env.test", quiet: true })
const mongoose = require("mongoose")
const request = require("supertest")
const app = require("../app")
const Orders = require("../models/Order")

// When using testOrder._id, convert the _id to string
// since it is an ObjectId, and returned response._id is a string
let testOrder

beforeAll(async () => {
  const mongoURI = process.env.MONGO_COMPASS_URI

  if (!mongoURI) {
    throw new Error("MONGO_COMPASS_URI not defined in test environment")
  }
  
  await mongoose.connect(mongoURI)
}, 10000)

beforeEach(async () => {
  await Orders.deleteMany({})
  testOrder = await Orders.create(
    {
      menuItem:  new mongoose.Types.ObjectId(),
      count: 2,
      totalCost: "$ 8.00",
      address: {
        district: "Yunusobod",
        street: "Yunus5",
        apartmentNo: 8,
        telNo: 99891010101
      }
    }
  )
}, 10000)

afterEach(async () => {
  await Orders.deleteMany({})
}, 10000)

afterAll(async () => {
  await mongoose.connection.close()
}, 10000)

describe("ORDERS ROUTES", () => {
  describe("GET /orders", () => {
    it("should return all orders", async () => {
      const response = await request(app).get("/orders").expect(200)
      expect(response.body).toBeTruthy()
      expect(response.body).toHaveLength(1)
    })

    it("should return an error message if no orders are found", async () => {
      await Orders.deleteMany()

      const response = await request(app).get("/orders").expect(200)
      expect(response.body).toHaveProperty("message")
      expect(response.body.message).toContain("No orders found")
    })
  })

  describe("GET /orders/:id", () => {
    it("should return the order with its ID", async () => {
      const response = await request(app).get(`/orders/${testOrder._id}`).expect(200)
      expect(response.body._id).toBe(testOrder._id.toString())
      expect(response.body.count).toEqual(2)
    })

    it("should respond with 400 statusCode if the ID is invalid", async () => {
      const invalidID = "invalid123"

      const response = await request(app).get(`/orders/${invalidID}`).expect(400)
      expect(response.body.message).toContain("Invalid ID")
    })
  })

  describe("POST /orders", () => {
    it("should return the inserted order with status code: 201", async () => {
      const newOrder = {
        menuItem:  new mongoose.Types.ObjectId(),
        count: 3,
        totalCost: "$ 10.40",
        address: {
          district: "Yunusobod",
          street: "Ashab",
          apartmentNo: 13,
          telNo: 99891010101
        }
      }
  
      const response = await request(app).post("/orders").send(newOrder).expect(201)
      expect(response.body).toHaveProperty("message")
      expect(response.body.orderId).toBeTruthy()
    })

    it("should return 400 statusCode if the order is not complete", async () => {
      const response = await request(app).post("/orders").send().expect(400)
      expect(response.body).toHaveProperty("message")
      expect(response.body.message).toBe("Order is not complete")
    })
  })

  describe("PUT /orders/:id", () => {
    it("should repsond with 400 statusCode for invalidIDs", async () => {
      const invalidID = "invalid1234"

      const response = await request(app).put(`/orders/${invalidID}`).expect(400)
      expect(response.body.message).toContain("Invalid ID")
    })

    it("should return the editedOrder", async () => {
      const editedOrder = {
        menuItem: new mongoose.Types.ObjectId(),
        count: 3,
        totalCost: "$ 12.20",
        address: {
          district: "Yunusobod",
          street: "Yunus5",
          apartmentNo: 8,
          telNo: 99891010101
        }
      }

      const response = await request(app).put(`/orders/${testOrder._id}`).send(editedOrder).expect(200)
      expect(response.body).toHaveProperty("updatedOrder")
      expect(response.body.updatedOrder._id).toBe(testOrder._id.toString
        ())
    })
  })

  describe("DELETE /orders/:id", () => {
    it("should respond with 400 statusCode for invalidIDs", async () => {
      const invalidID = "invalid1234"

      const response = await request(app).delete(`/orders/${invalidID}`).expect(400)
      expect(response.body.message).toContain("Invalid ID")
    })

    it("should return the deletedorder", async () => {
      const response = await request(app).delete(`/orders/${testOrder._id}`).expect(200)
      expect(response.body.message).toContain("Order successfully deleted")
      expect(response.body.deletedOrder._id).toBe(testOrder._id.toString())
    })
  })
})
