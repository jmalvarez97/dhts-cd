import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
const cors = require('cors')

const pool = new pg.Pool();

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));


app.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(`Hello, World! The time from the DB is ${rows[0].now}`);
});

app.post("/", async (req, res) => {
  const dataFromBody = req.body;

  const query = 'INSERT INTO mediciones (s1h, s1t, s2h, s2t, date) VALUES ($1, $2, $3, $4, $5)';
  const values = [dataFromBody.s1h, dataFromBody.s1t, dataFromBody.s2h, dataFromBody.s2t, Date.now()];

  try {
    const result = await pool.query(query, values);
    console.log('Fila agregada correctamente');
    res.status(200).send('Fila agregada correctamente');
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    res.status(500).send('Error al agregar la fila en la base de datos');
  }
} ) 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
