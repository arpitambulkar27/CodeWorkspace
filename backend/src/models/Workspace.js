const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Workspace title is required"],
      trim: true,
      default: "Untitled Workspace",
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
    files: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ["file", "folder"], required: true },
        parentId: { type: String, default: null },
        content: { type: String, default: "" },
        language: { type: String, default: "javascript" },
      },
    ],
    customInput: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Workspace", workspaceSchema);
