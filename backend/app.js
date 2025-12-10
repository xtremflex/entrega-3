const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const rouletteRoutes = require("./routes/roulette.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const frontendRoutes = require("./routes/frontend.routes");

const app = express();

// ===============================
//       Middleware global
// ===============================
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================
//     Servir Frontend completo
// ===============================
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));
app.use("/pages", express.static(path.join(__dirname, "../frontend/pages")));
app.use(frontendRoutes);

// ===============================
//            API
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/roulette", rouletteRoutes);
app.use("/api/transactions", transactionsRoutes);

// ===============================
//   Conexión a MongoDB
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error Mongo:", err));
// ===============================
//         Servidor
// ===============================
app.listen(80, "0.0.0.0", () => {
  console.log("Backend API escuchando en puerto 80");
});
