const mongoose = require("mongoose");

const bookDemoSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    phone:   { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, required: true, trim: true },
    date:    { type: String, required: true },
    time:    { type: String, required: true },
    message: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookDemo", bookDemoSchema);
