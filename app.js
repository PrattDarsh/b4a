const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const { dirname } = require("path");

const app = express();

//middlewares
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  "mongodb+srv://pratt:prateek221592@cluster0.iu8axcw.mongodb.net/?",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const imageSchema = new mongoose.Schema({
  name: String,
  image: {
    data: Buffer,
    contentType: String,
  },
});

const Image = new mongoose.model("Image", imageSchema);

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/upload", upload.single("book"), (req, res) => {
  const images = new Image({
    name: req.file.originalname,
    image: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  });
  images.save();

  res.send("done");
});

app.get("/", (req, res) => {
  Image.find().then((err, allImages) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        images: allImages,
      });
    }
  });
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server Running");
});
