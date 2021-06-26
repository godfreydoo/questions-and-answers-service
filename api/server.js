require('newrelic');
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
  idleTimeoutMillis: 500000,
  connectionTimeoutMillis: 5000,
})

app.use(express.json());

/*
EXPLAIN ANALYZE SELECT row_to_json(questions) AS questions
           FROM (SELECT json_agg(results) AS results
                FROM (SELECT id AS question_id, body AS question_body, date_written AS question_date, asker_name, helpful AS question_helpfulness, reported, (SELECT row_to_json(questions) AS questions
                    FROM (SELECT array_agg(results) AS results
                          FROM (SELECT a.id AS answer_id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, (SELECT array_agg(url) AS url FROM qa.photos WHERE answer_id = a.id) AS photos
                                FROM qa.answers a
                                WHERE question_id = 532 GROUP BY a.id
                                ORDER BY a.helpful)
                          AS results)
                    AS questions) AS answers
                      FROM qa.questions
                      WHERE product_id = 532
                      GROUP BY id
                      ORDER BY helpful)
                AS results)
           AS questions;

-- look into join instead of select sub-query
-- look into not using join and doing any data manipulation on server-side
*/

// curl -s http://localhost:3000/qa/questions/532 > /dev/null
app.get('/questions/:id', async (req, res) => {
  const answers = '(SELECT row_to_json(questions) AS questions\
                    FROM (SELECT array_agg(results) AS results\
                          FROM (SELECT a.id AS answer_id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, (SELECT array_agg(url) AS url FROM qa.photos WHERE answer_id = a.id) AS photos\
                                FROM qa.answers a\
                                WHERE question_id = $1 AND reported = false\
                                ORDER BY a.helpful DESC)\
                          AS results)\
                    AS questions)';

  const questionConfig = {
    name: 'get questions',
    text: `SELECT row_to_json(questions) AS questions\
           FROM (SELECT json_agg(results) AS results\
                FROM (SELECT id AS question_id, body AS question_body, date_written AS question_date, asker_name, helpful AS question_helpfulness, reported, ${answers} AS answers\
                      FROM qa.questions\
                      WHERE product_id = $1 AND reported = false\
                      GROUP BY id\
                      ORDER BY helpful DESC)\
                AS results)\
           AS questions;`,
    values: [req.query.id],
  }
  try {
    // console.time('get questions');
    let questionData = await pool.query(questionConfig);
    let result = {
      product_id: req.query.id,
      results: questionData.rows[0].questions.results
    }
    res.status(200).json(result);
    // console.log(result.results);
    // console.log(result.results[0].answers);
    // console.timeEnd('get questions')
  } catch (err) {
    console.error(e.stack);
    res.status(404).end();
  }
});

// curl -s http://localhost:3000/qa/questions/222/answers > /dev/null
app.get('/questions/:id/answers', async (req, res) => {
  const answersConfig = {
    name: 'get answers',
    text: 'SELECT row_to_json(questions) AS questions\
           FROM (SELECT json_agg(results) AS results\
                 FROM (SELECT a.id AS answer_id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, (SELECT array_agg(url) AS url FROM qa.photos WHERE answer_id = a.id) AS photos\
                       FROM qa.answers a\
                       WHERE question_id = $1 AND reported = false\
                       ORDER BY a.helpful DESC)\
                 AS results)\
           AS questions;',
    values: [req.query.id],
  }
  try {
    // console.time('get answers');
    let data = await pool.query(answersConfig);

    let results = {
      question: Number(req.query.id),
      results: data.rows[0].questions.results
    }
    // console.log(results);
    // console.timeEnd('get answers')
    res.status(200).json(data);
  } catch (err) {
    console.error(e.stack);
    res.status(404).end()
  }
});

// curl --header "Content-Type: application/json" --request POST --data '{"question_id":532,"body":"Does this work testing testing","answerer_name":"godfrey","answerer_email":"g@g.com","photos":["oogie boogie"]}' http://localhost:3000/qa/questions/532/answers
app.post('/questions/:id/answers', async (req, res) => {
  const getLatestAnswerId = 'select id from qa.answers order by id desc limit 1;'
  const getLatestPhotoId = 'select id from qa.answers order by id desc limit 1;'
  try {
    // console.time('post answer');
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
    // console.log(response);
    // console.timeEnd('post answer')
    res.status(201).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});

// curl --header "Content-Type: application/json" --request POST --data '{"product_id":17067,"body":"Does this work testing testing","answerer_name":"godfrey","answerer_email":"g@g.com"}' http://localhost:3000/qa/questions/
app.post('/questions', async (req, res) => {
  const getLatestId = 'select id from qa.questions order by id desc limit 1;'
  try {
    // console.time('post question');
    let data = await pool.query(getLatestId)
    const config = {
      name: 'post-question',
      text: 'insert into qa.questions (id, product_id, body, asker_name, asker_email) values ($1, $2, $3, $4, $5);',
      values: [data.rows[0].id + 1, req.body.product_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    let response = await pool.query(config);
    // console.log(response);
    // console.timeEnd('post question')
    res.status(201).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
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
    // console.time('put-question-helpful');
    let data = await pool.query(config)
    // console.log(data);
    // console.timeEnd('put-question-helpful')
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
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
    // console.time('put-answer-helpful');
    let data = await pool.query(config)
    // console.log(data);
    // console.timeEnd('put-answer-helpful')
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
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
    // console.time('put-question-report');
    let response = await pool.query(config);
    let data = await pool.query(check);
    // console.log(data.rows[0].reported === true);
    // console.timeEnd('put-question-report')
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
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
    // console.time('put-answer-report');
    let response = await pool.query(config);
    let data = await pool.query(check);
    // console.log(data.rows[0].reported === true);
    // console.timeEnd('put-answer-report');
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});










const server = app.listen(PORT, () => {
  pool.connect(() => {
    console.log(`Database is connected on ${PORT}`);
  });
  console.log(`API server listening on ${PORT}`);
})