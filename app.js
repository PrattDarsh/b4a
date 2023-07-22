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
  cover: String,
  author: String,
  age: String,
  likes: Number,
  pages: [
    {
      page: {
        data: Buffer,
        contentType: String,
      },
    },
  ],
});

const Book = new mongoose.model("Book", bookSchema);

const storage = multer.memoryStorage();

// const upload = multer({ storage: storage });
const upload = multer({ storage });

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/upload", upload.array("pages"), async (req, res) => {
  const books = new Book({
    book_name: req.body.name,
    cover: req.body.cover,
    author: req.body.author,
    age: req.body.age,
    likes: 0,
    pages: req.files.map((file) => ({
      page: {
        data: file.buffer,
        contentType: file.mimetype,
      },
    })),
  });

  books.save();
  return res.redirect("/");

  // res.send("done");
});

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
      pages: foundBook.pages,
      book_likes: foundBook.likes,
    });
  });
});

app.post("/likes", (req, res) => {
  Book.updateOne(
    { book_name: req.body.book_name },
    { $inc: { likes: 1 } }
  ).exec();
  res.redirect("/books/" + req.body.book_name);
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server Running");
});
