require("dotenv").config();
const express = require("express");

const sequelize = require("./config/database");
const UsersRouter = require("./admin/users/users.routes");
const Products = require("./admin/products/products.routes");
const Orders = require("./admin/order/orders.routes");
const AuthRouter = require("./admin/auth/auth.routes");
const BackupRouter = require("./admin/backup/backup.routes");

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//const ErrorHandlers = require("./errors/errorHandler");
const fs = require("fs");
const path = require("path");

sequelize.sync().then(() => console.log("db Connected"));
const app = express();

express.urlencoded();


const allowedOrigins = [
 "https://demo.accusoftapp.com",
 'http://localhost:5173'
  
];

//const allowedOrigins = ['http://localhost:5173'];
//http://192.168.243.195:5173/
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

//app.use(cors());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// // Parse JSON bodies
app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.json());

//app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(Products);
app.use(UsersRouter);
app.use(Orders);
app.use(AuthRouter);
app.use(BackupRouter);

const PORT = 5005;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ACCUSOFT DEMO is running ${PORT}`);
});