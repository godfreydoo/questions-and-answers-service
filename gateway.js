const express = require('express');
const routes = require('./routes/index');
const app = express();
const PORT = 3000;
const fs = require('fs');
require('dotenv').config();


// For testing
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
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}`)
})