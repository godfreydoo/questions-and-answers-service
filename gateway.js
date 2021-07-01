const express = require('express');
const router = require('./routes/index');
const { pool } = require('./db/index');
const fs = require('fs');

const app = express();
const PORT = 3000;

// For loader io testing
app.get(`/${process.env.LOADER_FILE}`, async (req, res) => {
  try {
    const data = fs.readFileSync(`.${process.env.LOADER_FILE}`, 'utf8')
    res.end(data);
  } catch (err) {
    console.error(err);
    res.end();
  }
})



// Middleware
app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  pool.connect(() => {
    console.log(`Database is connected on ${PORT}`);
  });

  console.log(`Gateway listening on ${PORT}`)
})
