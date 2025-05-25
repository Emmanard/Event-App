const mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(process.env.MONGODB_URI, {})

    .then((conn) => {
      console.log(`mongodb connection: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log(`db connection error: ${err.message}`);
    });
};
