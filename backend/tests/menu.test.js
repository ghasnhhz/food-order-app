process.env.NODE_ENV = "test"
require("dotenv").config({ path: ".env.test", quiet: true })
const mongoose = require("mongoose")
const request = require("supertest")
const app = require("../app")
const Menu = require("../models/Menu")

// When using testOrder._id, convert the _id to string
// since it is an ObjectId, and returned response._id is a string
let testFood

beforeAll(async () => {
  try {
    const mongoURI = process.env.MONGO_COMPASS_URI

    if (!mongoURI) {
      throw new Error("MONGO_COMPASS_URI not defined in test environment")
    }
    
    await mongoose.connect(mongoURI)
  } catch (err) {
    throw err
  }
}, 10000)

beforeEach(async () => {
  await Menu.deleteMany({})
  testFood = await Menu.create({name: "Cheese", price: "$ 7.00"})
}, 10000)

afterEach(async () => {
  await Menu.deleteMany({})
}, 10000)

afterAll(async () => {
  await mongoose.connection.close()
}, 10000)

describe("MENU ROUTES", () => {
  describe("GET /menu", () => {
    it("should get the menu", async () => {
      const response = await request(app).get("/menu").expect(200)
      expect(Array.isArray(response.body)).toBeTruthy()
    })

    it("should return an error message if no foods found", async () => {
      await Menu.deleteMany({})

      const response = await request(app).get("/menu").expect(200)
      expect(response.body.message).toContain("No foods are available yet")
    })
  })

  describe("GET /menu/:id", () => {
    it("should get a food by its id", async () => {
      const id = testFood._id
      const response = await request(app).get(`/menu/${id}`).expect(200)
      expect(response.body.name).toBe("Cheese")
    })

    it("should respond with 400 statusCode for invalidIDs", async () => {
      const id = "invalid2025"

      const response = await request(app).get(`/menu/${id}`).expect(400)
      expect(response.body.message).toContain("Invalid ID")
    })

    it("should respond with 404 statusCode for non-existent food", async () => {
      const nonExistenId = new mongoose.Types.ObjectId()
      const response = await request(app).get(`/menu/${nonExistenId}`).expect(404)
      expect(response.body.message).toContain("No food found")
    })
  })

  describe("POST /menu", () => {
    it("should add and return the new food", async () => {
      const response = await request(app).post("/menu").send({
        name: 'Burger',
        price: "$ 6.00"
      }).expect(201)
      expect(response.body).toMatchObject({
        name: "Burger",
        price: "$ 6.00"
      })
      expect(response.body.name).toBe("Burger")

      const food = await Menu.findById(response.body._id)
      expect(food).toBeTruthy()
    })

    it("should respond with 400 statusCode for missing required fields", async () => {
      const response = await request(app).post("/menu").send({}).expect(400)
      expect(response.body.message).toContain("No food provided")      
    })
  })

  describe("PUT /menu/:id", () => {
    it("should uptade the food", async () => {
      const updatedFood = {
        name: "Cheese",
        price: "$ 7.20"
      }
        
      const response = await request(app).put(`/menu/${testFood._id}`).send(updatedFood).expect(200)
      expect(response.body).toHaveProperty('updatedFood')
      expect(response.body.updatedFood.name).toBe(updatedFood.name)
    })

    it("should respond with 400 statusCode for invalid ObjectId", async () => {
      const invalidId = 'abcsdf'

      const response = await request(app).put(`/menu/${invalidId}`).send(testFood).expect(400)
      expect(response.body).toHaveProperty("message")
    })

    it("should respond with 404 statusCode for non-existent", async () => {
      const nonExistenId = new mongoose.Types.ObjectId()

      const response = await request(app).put(`/menu/${nonExistenId}`).expect(404)
      expect(response.body.message).toContain("Food not found")
    })
  })

  describe("DELETE /menu/:id", () => {
    it("should delete and return the deleted food", async () => {
      const response = await request(app).delete(`/menu/${testFood._id}`).expect(200)
      expect(response.body.message).toContain("Food successfully deleted")
      expect(response.body).toHaveProperty('deletedFood')
    }
    )

    it("should respond with 400 statusCode for invalidIDs", async () => {
      const invalidId = "anfssa2394"

      const response = await request(app).delete(`/menu/${invalidId}`).expect(400)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain("Invalid ID")
    })
  })
})