const express = require('express');
const app = express();
const PORT = 3001;
const { Pool } = require('pg');
require('dotenv').config({path: '../.env'});

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
    name: 'get questions',
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
    name: 'get answers',
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

// curl --header "Content-Type: application/json" --request POST --data '{"question_id":532,"body":"Does this work testing testing","answerer_name":"godfrey","answerer_email":"g@g.com","photos":["oogie boogie"]}' http://localhost:3000/qa/questions/532/answers
app.post('/questions/:id/answers', async (req, res) => {
  const getLatestAnswerId = 'select id from qa.answers order by id desc limit 1;'
  const getLatestPhotoId = 'select id from qa.answers order by id desc limit 1;'
  try {
    console.time('post answer');
    let answerId = await pool.query(getLatestAnswerId);
    const answerConfig = {
      name: 'post-answer',
      text: 'insert into qa.answers (id, question_id, body, answerer_name, answerer_email) values ($1, $2, $3, $4, $5) returning id;',
      values: [answerId.rows[0].id + 1, req.body.question_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    var response = await pool.query(answerConfig);

    let latestAnswerId = response.rows[0].id
    let photoId = await pool.query(getLatestPhotoId);
    await req.body.photos.forEach(async (value, index) => {
      let photoConfig = {
        name: 'post-photo',
        text: 'insert into qa.photos (id, answer_id, url) values ($1, $2, $3);',
        values: [photoId.rows[0].id + (index + 1), latestAnswerId, value],
      }
      let response = await pool.query(photoConfig);
    })

    console.log(response);
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
    console.log(response);
    console.timeEnd('post question')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl -X PUT http://localhost:3000/qa/questions/523/helpful
app.put('/questions/:id/helpful', async (req, res) => {
  const config = {
    name: 'put-question-helpful',
    text: 'update qa.questions set helpful = helpful + 1 where id = $1;',
    values: [req.query.id],
  }
  try {
    console.time('put-question-helpful');
    let data = await pool.query(config)
    console.log(data);
    console.timeEnd('put-question-helpful')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl -X PUT http://localhost:3000/qa/answers/18/helpful
app.put('/answers/:id/helpful', async (req, res) => {
  const config = {
    name: 'put-answer-helpful',
    text: 'update qa.answers set helpful = helpful + 1 where id = $1;',
    values: [req.query.id],
  }
  try {
    console.time('put-answer-helpful');
    let data = await pool.query(config)
    console.log(data);
    console.timeEnd('put-answer-helpful')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl -X PUT http://localhost:3000/qa/questions/523/report
app.put('/questions/:id/report', async (req, res) => {
  const config = {
    name: 'put-question-report',
    text: 'update qa.questions set reported = true where id = $1;',
    values: [req.query.id],
  }
  const check = {
    name: 'confirm-put-question-report',
    text: 'select reported from qa.questions where id = $1;',
    values: [req.query.id],
  }
  try {
    console.time('put-question-report');
    let response = await pool.query(config);
    let data = await pool.query(check);
    console.log(data.rows[0].reported === true);
    console.timeEnd('put-question-report')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});

// curl -X PUT http://localhost:3000/qa/answers/18/report
app.put('/answers/:id/report', async (req, res) => {
  const config = {
    name: 'put-answer-report',
    text: 'update qa.answers set reported = true where id = $1;',
    values: [req.query.id],
  }
  const check = {
    name: 'confirm-put-answer-report',
    text: 'select reported from qa.answers where id = $1;',
    values: [req.query.id],
  }
  try {
    console.time('put-answer-report');
    let response = await pool.query(config);
    let data = await pool.query(check);
    console.log(data.rows[0].reported === true);
    console.timeEnd('put-answer-report')
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});










const server = app.listen(PORT, () => {
  pool.connect(() => {
    console.log(`Database is connected on ${PORT}`);
  });
  console.log(`API server listening on ${PORT}`);
})