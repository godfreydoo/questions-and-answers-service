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
  const config = {
    name: 'fetch-questions',
    text: 'select * from qa.questions where product_id = $1 group by questions.id order by sum(helpful) desc;',
    values: [req.query.id],
  }
  try {
    console.time('get questions');
    let data = await pool.query(config);
    console.table(data.rows);
    console.timeEnd('get questions')
    res.end();
  } catch (err) {
    console.error(e.stack);
    res.end();
  }
});

// curl http://localhost:3000/qa/questions/532/answers
app.get('/questions/:id/answers', async (req, res) => {
  const config = {
    name: 'fetch-questionId-answers',
    text: 'select * from qa.answers where question_id = $1 group by answers.id order by sum(helpful) desc;',
    values: [req.query.id],
  }
  try {
    console.time('get answers');
    let data = await pool.query(config);
    console.table(data.rows);
    console.timeEnd('get answers')
    res.end();
  } catch (err) {
    console.error(e.stack);
    res.end();
  }
});

// curl --header "Content-Type: application/json" --request POST --data '{"question_id":532,"body":"Does this work testing testing","answerer_name":"godfrey","answerer_email":"g@g.com"}' http://localhost:3000/qa/questions/532/answers
app.post('/questions/:id/answers', async (req, res) => {
  const getLatestId = 'select id from qa.answers order by id desc limit 1;'
  try {
    console.time('post answer');
    let data = await pool.query(getLatestId)
    const config = {
      name: 'post-answer',
      text: 'insert into qa.answers (id, question_id, body, answerer_name, answerer_email) values ($1, $2, $3, $4, $5);',
      values: [data.rows[0].id + 1, req.body.question_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    let response = await pool.query(config);
    console.table(response);
    console.timeEnd('post answer')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl --header "Content-Type: application/json" --request POST --data '{"product_id":17067,"body":"Does this work testing testing","answerer_name":"godfrey","answerer_email":"g@g.com"}' http://localhost:3000/qa/questions/
app.post('/questions', async (req, res) => {
  const getLatestId = 'select id from qa.questions order by id desc limit 1;'
  try {
    console.time('post question');
    let data = await pool.query(getLatestId)
    const config = {
      name: 'post-question',
      text: 'insert into qa.questions (id, product_id, body, asker_name, asker_email) values ($1, $2, $3, $4, $5);',
      values: [data.rows[0].id + 1, req.body.product_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    let response = await pool.query(config);
    console.table(response);
    console.timeEnd('post question')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
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