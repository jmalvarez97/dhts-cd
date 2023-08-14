import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
const cors = require('cors')
const pool = new pg.Pool();

function convertTimestampToFormattedDate() {
  const offsetGMT = -3; // GMT -3
  const date = new Date()

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based, so adding 1
  const year = date.getFullYear() % 100; // Get last two digits of the year

  const hours   = ((date.getHours() - 3) >= 10) ? date.getHours() : "0" + date.getHours().toString();
  const minutes = (date.getMinutes() >= 10)     ? date.getMinutes() : "0" + date.getMinutes().toString()
  const seconds = (date.getSeconds() >= 10)     ? date.getSeconds() : "0" + date.getSeconds().toString()

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

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

app.post("/api", async (req, res) => {
  const dataFromBody = req.body;

  console.log(dataFromBody)
  const query = 'INSERT INTO mediciones (s1h, s1t, s2h, s2t, date) VALUES ($1, $2, $3, $4, $5)';
  const values = [dataFromBody.s1h, dataFromBody.s1t, dataFromBody.s2h, dataFromBody.s2t, convertTimestampToFormattedDate()];

  try {
    const result = await pool.query(query, values);
    console.log('Fila agregada correctamente');
    res.status(200).send('Fila agregada correctamente');
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    res.status(500).send('Error al agregar la fila en la base de datos');
  }
} )

app.get("/api/lastMeasurement", (req, res) => {
  const query = 'SELECT * FROM mediciones ORDER BY id DESC LIMIT 1';
  pool.query(query)
  .then(result => {
      res.send(result.rows[0]);
    })
    .catch(err => {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).send('Error al agregar la fila en la base de datos');
    });
})

app.get("/api/measurement", (req, res) => {
  const query = 'SELECT * FROM mediciones';
  pool.query(query)
  .then(result => {
      res.send(result.rows);
  })
  .catch(err => {
    console.error('Error al ejecutar la consulta:', err);
    res.status(500).send('Error al agregar la fila en la base de datos');
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
