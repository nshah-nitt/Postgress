import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const app = express();
const port = process.env.port || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  database: "world",
  host: "localhost",
  password: process.env.password,
  port: 5432
})

db.connect();

app.get("/", async (req, res) => {
  //Write your code here.
  let countries = await getData();
  res.render("index.ejs",{
    countries:countries,
    total:countries.length
  })

});

app.post("/add",async (req,res)=>{
  const input = req.body['country']
  // const query1 = await db.query("SELECT country_code from countries where country_name = ($1)",[input])
  // console.log(query1.rows)
  // if(query1.rows.length !== 0){
  //   let code = query1.rows[0].country_code
  //   await db.query("INSERT INTO visited_country (country_code) VALUES ($1)",[code])
  // }
  // res.redirect("/")
  try {
    const query1 = await db.query("SELECT country_code from countries where country_name = $1",[input])
    let code = query1.rows[0].country_code
    try {
      await db.query("INSERT INTO visited_country (country_code) VALUES ($1)",[code])
      res.redirect("/")
    } catch (error) {
      let countries = await getData()
      res.render("index.ejs",{
        countries: countries,
        total: countries.length,
        error:"The entry already exist"
      })
    }
  } catch (error) {
    let countries = await getData();
    res.render("index.ejs",{
      countries:countries,
      total:countries.length,
      error:"The country doesn't exist please try again"
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

let getData = async ()=>{
  const query = await db.query("SELECT country_code from visited_country")
  let country = query.rows
  let countries = []
  country.forEach((code) => {
    countries.push(code['country_code'])
  })
  return countries
}