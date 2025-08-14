const app = require("./app")
const connectDB = require("./db/connect")

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`App is listening on: http://localhost:${PORT}`)
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

start()