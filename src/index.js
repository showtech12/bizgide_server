require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/database");

const PORT = process.env.PORT || 3099;


(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();