const express = require('express');
const routes = require('./routes/index');
const app = express();
const PORT = 3000;
require('dotenv').config();


// For testing
app.get(`/${process.env.LOADER_PATH}`, (req, res) => {
  res.end(process.env.LOADER_DATA);
})


// Middleware
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}`)
})