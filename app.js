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

const bookSchema = new mongoose.Schema({
  book_name: String,
  book_author: String,
  book_cover_address: String,
  book_address: String,
});

const Book = new mongoose.model("Book", bookSchema);

// const storage = multer.memoryStorage()
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "book_cover") {
      cb(null, "./public/book_covers");
    }
    if (file.fieldname === "book") {
      cb(null, "./public/books");
    }
  },
  filename: function (req, file, cb) {
    return cb(null, `${file.originalname}`);
  },
});

// const upload = multer({ storage: storage });
const upload = multer({ storage });

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post(
  "/upload",
  upload.fields([
    { name: "book_cover", maxCount: 1 },
    { name: "book", maxCount: 1 },
  ]),
  (req, res) => {
    const books = new Book({
      book_name: req.body.name,
      book_author: req.body.author,
      book_cover_address: "./book_covers/" + req.body.name + ".png",
      book_address: req.body.name + ".pdf",
    });

    books.save();
    return res.redirect("/");

    // res.send("done");
  }
);

app.get("/", (req, res) => {
  Book.find({}).then((allBooks) => {
    res.render("index", {
      allBooks: allBooks,
    });
  });
});

app.get("/books/:book_name", (req, res) => {
  console.log(req.body);
  Book.findOne({ book_name: req.params.book_name }).then((foundBook) => {
    res.render("book", {
      book_name: foundBook.book_name,
      book_address: foundBook.book_address,
    });
  });
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server Running");
});
