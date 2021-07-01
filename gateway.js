require('dotenv').config();

const express = require('express');
const routes = require('./routes/index');
const fs = require('fs');
const { pool } = require('./db/index');

const app = express();
const PORT = 3000;


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

var server = app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}`)
})

process.on('SIGINT', () => {

  console.info(' <--> SIGINT signal received.');
  // Stops the server from accepting new connections and finishes existing connections.
  server.close(function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    pool.end(function () {
      console.log('Pool drained');
      process.exit(0);
    })
  })
})