import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "naman",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_country where user_id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
async function getUser(){
  const user = await db.query("select * from users");
  return user.rows;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const users = await getUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: "teal",
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name = $1",
      [input]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_country (user_id,country_code) VALUES ($1,$2)",
        [currentUserId,countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name
  const color = req.body.color
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html

  try{
    const result = await db.query("INSERT INTO users (name,color) VALUES ($1,$2) RETURNING *;",[name,color]);
    currentUserId = result.rows[0].id
    res.redirect("/")
  }catch(err){
    console.log(err)
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
