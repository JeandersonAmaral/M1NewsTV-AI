const mongoose = require("mongoose");
// ========================================
// MODELO DE USUÁRIO
// ========================================
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "editor"],
            default: "editor"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);