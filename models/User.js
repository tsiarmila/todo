const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    savedHistory: {
        type: Map,
        of: [String] // массив строк (todoText)
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
