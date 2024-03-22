const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
let items = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){

  let day = date.getDate(); //or let day = date.getDay();

  res.render('index', {kindOfDay: day, items: items});

});

app.post("/", function(req, res) {

  let newItem = req.body.todo;
  items.push(newItem);

  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000");
})
