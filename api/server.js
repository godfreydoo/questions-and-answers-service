const express = require('express');
const app = express();
const PORT = 3001;
const { Pool } = require('pg');
require('dotenv').config({path: '../.env'});


// Database and queries
const { getQuestions, getQuestionIdAnswers, postQuestion, putAnswerHelpful, putAnswerReport, putQuestionHelpful, putQuestionReport } = require('../db/queries');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 100,
  idleTimeoutMillis: 50000,
  connectionTimeoutMillis: 5000,
})

app.use(express.json());

// curl http://localhost:3000/qa/questions/532
app.get('/questions/:id', async (req, res) => {
  const params = [req.query.id]
  try {
    console.time('get questions');
    let data = await pool.query(getQuestions, params);
    console.table(data.rows);
    console.timeEnd('get questions')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl http://localhost:3000/qa/questions/532/answers
app.get('/questions/:id/answers', async (req, res) => {
  const params =[req.query.id];
  try {
    console.time('get answers');
    let data = await pool.query(getQuestionIdAnswers, params);
    console.table(data.rows);
    console.timeEnd('get answers')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl -X POST http://localhost:3000/qa/questions/532/answers
app.post('/questions/:id/answers', async (req, res) => {
  res.send('Hello from post /answer for id')
});

// curl -X POST http://localhost:3000/qa/questions
app.post('/questions', (req, res) => {
  res.send('Hello from post /questions')
});

// curl -X PUT http://localhost:3000/qa/questions/523/helpful
app.put('/questions/:id/helpful', (req, res) => {
  res.send('Hello from put /questions helpful')
});

// curl -X PUT http://localhost:3000/qa/answers/523/helpful
app.put('/answers/:id/helpful', (req, res) => {
  res.send('Hello from put /answers helpful')
});

// curl -X PUT http://localhost:3000/qa/questions/523/report
app.put('/questions/:id/report', (req, res) => {
  res.send('Hello from put /questions report')
});

// curl -X PUT http://localhost:3000/qa/answers/523/report
app.put('/answers/:id/report', (req, res) => {
  res.send('Hello from put /answers report')
});










const server = app.listen(PORT, () => {
  pool.connect(() => {
    console.log(`Database is connected on ${PORT}`);
  });
  console.log(`API server listening on ${PORT}`);
})