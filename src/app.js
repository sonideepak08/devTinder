require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const profileAuth = require("./routes/profile");
const requestAuth = require("./routes/request");
const userRoute = require("./routes/user");
const cors = require("cors");
const paymentRouter = require("./routes/payment");
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

require("./utils/cronjobs");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/", authRoute);
app.use("/", profileAuth);
app.use("/", requestAuth);
app.use("/", userRoute);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("connection successfully established!!!");
    server.listen(process.env.PORT, () => {
      console.log("server is listening at port 3000");
    });
  })
  .catch((err) => {
    console.error("connection unsuccessful", err.message);
  });
