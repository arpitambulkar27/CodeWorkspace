const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Workspace title is required"],
      trim: true,
      default: "Untitled Project",
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "java", "cpp"],
      default: "javascript",
    },
    code: {
      type: String,
      default: "",
    },
    customInput: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Workspace", workspaceSchema);
