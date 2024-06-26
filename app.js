const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const validator = require('validator');
const cors = require('cors');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Подключаем библиотеку для HTTP-запросов
const dotenv = require('dotenv');
const date = require(__dirname + "/date.js");
const path = require('path');

const app = express();
let items = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000");
})

dotenv.config({ path: 'C:\\data\\.env' });
// dotenv.config({ path: path.resolve(__dirname, 'data', '.env') });
// dotenv.config();

const MONGOATLASPASSWORD = process.env.MONGOATLASPASSWORD;

mongoose.connect(`mongodb+srv://admin-milatsiar:${MONGOATLASPASSWORD}@cluster0.yhdmafz.mongodb.net/todoDB`);

userSchema = new mongoose.Schema({
  name: String,
  gender: String,
  email: String,
  password: String,
  savedHistory: {
      type: Map,
      of: [String] // массив строк (todoText)
  }
});
const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){

  let day = date.getDate();
  let dayMonth = date.getDay();

  res.render('index', {kindOfDay: day, items: items, dayMonth: dayMonth});

});

app.post("/", function(req, res) {

  let newItem = req.body.todo;
  items.push(newItem);

  res.redirect("/");
});

app.post('/register', async function(req, res) {
    // const formData = req.body;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    try {
        const response = await axios.get(`https://api.genderize.io/?name=${name}`);
        const gender = response.data.gender;
        console.log("gender", gender);
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, salt);

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          return res.json({ emailExists: true });
        }

        const user = new User ({
          name: name,
          gender: gender,
          email: email,
          password: hashedPassword,
          savedHistory: new Map()
        });

      await user.save();
      return res.json({ success: true, message: "New user registered", redirectTo: "/", name: name, gender: gender });
    } catch (error) {
      console.error("Registration error:", error);
      return res.json({ success: false, message: "Registration error defined." });
    }
});

app.post('/login', async function(req, res) {

  const email = req.body.email;
  const password = req.body.password;
  console.log("Received", email, password);

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    const validPassword = await bcrypt.compare(password, existingUser.password);
    const name = await existingUser.name;
    const gender = await existingUser.gender;
    if (validPassword) {
      return res.json({ success: true, user: existingUser, redirectTo: "/", name: name, gender: gender  });
    } else {
      return res.json({ success: false, message: "Invalid Password" });
    }
  } else {
    return res.json({ success: false, message: "The user doesn't exist" });
  }
});

app.post('/savehistory', async function(req, res) {

  const email = req.body.email;
  const completedDate = req.body.completedDate;
  const todoText = req.body.todoText;
  console.log("Received", email, completedDate, todoText);

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.savedHistory.has(completedDate) && user.savedHistory.get(completedDate).includes(todoText)) {
      return res.status(400).json({ error: "Todo already exists" });
    }

    if (!user.savedHistory.has(completedDate)) {
      user.savedHistory.set(completedDate, [todoText]);
    } else {
        // Если запись уже существует, добавляем todoText в массив для этой даты
        user.savedHistory.get(completedDate).push(todoText);
    }
    await user.save();
    console.log("History saved:", user.savedHistory);

    // Отправляем ответ клиенту, чтобы он знал, что данные были успешно сохранены
    res.status(200).json({ message: "History saved successfully" });
  } catch (error) {
      // Если возникла ошибка, отправляем клиенту сообщение об ошибке
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred while saving history" });
  }

});

app.post('/deletetask', async function(req, res) {

  const email = req.body.email;
  const completedDate = req.body.completedDate;
  const todoText = req.body.todoText;
  console.log("Received", email, completedDate, todoText);

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("User not found");
    }

    let taskDeleted = false;

    if (user.savedHistory.has(completedDate) && user.savedHistory.get(completedDate).includes(todoText)) {
      user.savedHistory.get(completedDate).splice(user.savedHistory.get(completedDate).indexOf(todoText), 1);
      taskDeleted = true;
    }

    if (!taskDeleted) {
      throw new Error("Task not found");
    }

    await user.save();
    console.log("Task deleted");

    // Отправляем ответ клиенту, чтобы он знал, что данные были успешно сохранены
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
      // Если возникла ошибка, отправляем клиенту сообщение об ошибке
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred while deleting task" });
  }

});

app.post("/tasks", async function(req, res) {
  let history;

  if (req.body.email) {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email: email });
      console.log("email user", email, user);

      if (!user) {
        res.status(404).json({ error: "User not found" }); // Если пользователь не найден, возвращаем ошибку 404
        return;
      } else {
        history = Array.from(user.savedHistory.entries());
        res.json({ history: history });
      }
    } catch (e) {
      console.error("Error:", e);
      res.status(500).send("An error occurred while fetching user data");
    }
  } else {
    res.status(500).send("Error");
  }

});
