process.env.NODE_ENV = "test"
require("dotenv").config({ path: ".env.test", quiet: true })
const mongoose = require("mongoose")
const request = require("supertest")
const app = require("../app")
const RefreshToken = require("../models/RefreshToken")
const User = require("../models/User")

let testUser

beforeAll(async () => {
  const mongoURI = process.env.MONGO_COMPASS_URI

  if (!mongoURI) {
    throw new Error("MONGO_COMPASS_URI not defined in test")
  }

  await mongoose.connect(mongoURI)
})

beforeEach(async () => {
  await RefreshToken.deleteMany({})
  await User.deleteMany({})

  testUser = await User.create(
    {
      username: "Muhammad",
      password: "muhammad1212"
    }
  )
})

afterEach(async () => {
  await RefreshToken.deleteMany({})
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe("auth ROUTES", () => {
  describe("POST /api/register", () => {
    it("should return an error message for incomplete user", async () => {
      const newUser = {
        username: "Shahzod"
      }

      const response = await request(app).post("/api/register").send(newUser).expect(400)
      expect(response.body.message).toContain("username and password are required")
    })

    it("should create a new user and return a message", async () => {
      const newUser = {
        username: "Shahzod",
        password: "shahzodkar"
      }

      const response = await request(app).post("/api/register").send(newUser).expect(201)
      expect(response.body.message).toContain("User registered successfully")
    })
  })

  describe("POST /api/login", () => {
    it("should return an error message for incomplete user", async () => {
      const newUser = {
        username: "Shahzod"
      }

      const response = await request(app).post("/api/login").send(newUser).expect(400)
      expect(response.body.message).toContain("username and password are required")
    })

    it("should return 401 statusCode(Invalid credentials) if user not found in db(not registered yet)", async () => {
      const newUser = {
        username: "Shahzod",
        password: "shahzod111"
      }

      const response = await request(app).post("/api/login").send(newUser).expect(401)
      expect(response.body.message).toContain("Invalid credentials")
    })

    it("should return 401 statusCode(password doesnt match when compared)", async () => {
      const newUser = {
        username: "Muhammad",
        password: "muhammad1211"
      }

      const response = await request(app).post("/api/login").send(newUser).expect(401)
      expect(response.body.message).toContain("Invalid credentials")
    })

    it("should return 401 statusCode(password doesnt match when compared)", async () => {
      const newUser = {
        username: "Muhammad",
        password: "muhammad1212"
      }

      const response = await request(app).post("/api/login").send(newUser).expect(200)
      expect(response.body.message).toContain("Successful login")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user.username).toEqual(newUser.username)
      expect(response.body.user).toHaveProperty("role")
    })
  })

  describe("GET /api/refresh", () => {
    it("should return 401 statusCode if no access is provided", async () => {
      const response = await request(app).get("/api/refresh").expect(401)
      expect(response.body.message).toContain("No refresh token provided")
    })

    it("should return a new access token if refresh token is valid", async () => {
      const newUser = {
        username: "Muhammad",
        password: "muhammad1212"
      }

      const loginResponse = await request(app).post("/api/login").send(newUser).expect(200)

      const cookie = loginResponse.headers['set-cookie']

      const response = await request(app).get("/api/refresh").set('Cookie', cookie).expect(200)
      expect(response.body).toHaveProperty("accessToken")
    })
  })

  describe("POST /api/logout", () => {
    it("should return 401 statusCode if no refresh token is provided", async () => {
      const response = await request(app).post("/api/logout").expect(401)
      expect(response.body).toHaveProperty("message")
    })

    it("should return a new access token if refresh token is valid", async () => {
      const newUser = {
        username: "Muhammad",
        password: "muhammad1212"
      }

      const loginResponse = await request(app).post("/api/login").send(newUser).expect(200)

      const cookie = loginResponse.headers['set-cookie']

      const response = await request(app).post("/api/logout").set("Cookie", cookie).expect(200)
      expect(response.body).toHaveProperty("message", "Logged out successfully")
    })
  })
})