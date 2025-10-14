const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error.message);
    process.exit(1); // Detener la app si falla la conexión
  }
};

module.exports = connectDB;
