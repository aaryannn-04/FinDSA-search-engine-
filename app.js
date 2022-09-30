const express = require("express");
const morgan = require("morgan");
var fs = require("fs");
TfIdf = require("tf-idf-search");
tf_idf = new TfIdf();

//instantiate corpus
const pathArray = [];
for (let i = 1; i <= 1955; i++) {
  pathArray.push(`./problems/problem${i}.txt`);
  
}
var corpus = tf_idf.createCorpusFromPathArray(pathArray);

//arrays of url's and corresponding titles
const purl = fs.readFileSync("problem_urls.txt").toString().split("\n");
const ptitle = fs.readFileSync("problem_titles.txt").toString().split("\n");

// express app
const app = express();

app.listen(3000);

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// routes
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

//listen for query
app.get("/search", (req, res) => {
  // console.log(req.query.query);
  const queryString = req.query.query;
  // Rank documents relative to a query containing a String of keywords and keeping only top 5 results
  var search_result = tf_idf.rankDocumentsByQuery(queryString).slice(0, 5);

  const data = [];
  for (let i = 0; i < 5; i++) {
    data.push({
      index: search_result[i].index,
      title: ptitle[search_result[i].index],
      url: purl[search_result[i].index],
    });
  }
  // console.log(data);
  //update result.ejs
  res.render("result", { title: "Results", data });
});

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
