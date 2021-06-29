require('newrelic');
const express = require('express');
const app = express();
const PORT = 3001;
const { Pool } = require('pg');
const responseTime = require('response-time');
const { Logger } = require("../logs/logger");
const bunyan = require('bunyan');

require('dotenv').config({path: '../.env'});

app.use(responseTime(function (req, res, time) {
  var stat = 'db';
  Logger.dbQuery(stat, time);
}))

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 90,
  idleTimeoutMillis: 2500,
  connectionTimeoutMillis: 0,
})

app.get('/questions', async (req, res) => {
  const pageSize = 5;
  var count = Math.min(Number(req.query.count), 200) || 5;
  var page = Number(req.query.page) || 1;
  var offset;

  if (page === 1) {
    offset = 0;
  } else {
    offset = page * pageSize;
  }


  const questionConfig = {
    name: 'get questions',
    text: `SELECT row_to_json(questions) AS questions\
             FROM (SELECT json_agg(results) AS results\
                   FROM (SELECT id AS question_id, body AS question_body, date_written AS question_date, asker_name, helpful AS question_helpfulness, reported, answer.details AS answers\
                         FROM qa.questions\
                         LEFT JOIN LATERAL (SELECT row_to_json(details) AS details\
                                            FROM (SELECT array_agg(results) AS results\
                                                  FROM (SELECT a.id AS answer_id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, photo.url AS photos\
                                                        FROM qa.answers a\
                                                        LEFT JOIN LATERAL (SELECT array_agg(url) AS url
                                                                           FROM qa.photos
                                                                           WHERE answer_id = a.id) photo ON true\
                                                        WHERE question_id = qa.questions.id AND reported = false\
                                                        ORDER BY a.helpful DESC\
                                                        LIMIT $2)\
                                                  AS results)\
                                            AS details) AS answer ON true\
                         WHERE product_id = $1 AND reported = false\
                         ORDER BY qa.questions.helpful DESC\
                         LIMIT $2\
                         OFFSET $3)\
                   AS results)\
            AS questions;`,
    values: [req.query.product_id, count, offset],
  }
  try {
    let questionData = await pool.query(questionConfig);
    let result = {
      product_id: req.query.product_id,
      results: questionData.rows[0].questions.results || [],
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(404).end();
  }
});

app.get('/questions/:id/answers', async (req, res) => {
  const pageSize = 5;
  var count = Math.min(Number(req.query.count), 200) || 5;
  var page = Number(req.query.page) || 1;
  var offset;

  if (page === 1) {
    offset = 0;
  } else {
    offset = page * pageSize;
  }

  const answersConfig = {
    name: 'get answers',
    text: 'SELECT row_to_json(questions) AS questions\
           FROM (SELECT json_agg(results) AS results\
                 FROM (SELECT a.id AS answer_id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, photo.url AS photos\
                       FROM qa.answers a\
                       LEFT JOIN LATERAL (SELECT array_agg(url) AS url\
                                          FROM qa.photos\
                                          WHERE answer_id = a.id) photo ON true\
                       WHERE question_id = $1 AND reported = false\
                       ORDER BY a.helpful DESC\
                       LIMIT $2\
                       OFFSET $3)\
                 AS results)\
           AS questions;',
    values: [req.params.id, count, offset],
  }
  try {
    let data = await pool.query(answersConfig);
    let result = {
      question: req.params.id,
      page: page,
      count: count,
      results: data.rows[0].questions.results || [],
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.post('/questions/:id/answers', async (req, res) => {

  try {
    const answerConfig = {
      name: 'post-answer',
      text: 'insert into qa.answers (question_id, body, answerer_name, answerer_email) values ($1, $2, $3, $4) returning id;',
      values: [req.body.question_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    var response = await pool.query(answerConfig);
    await req.body.photos.forEach(async (value, index) => {
      let photoConfig = {
        name: 'post-photo',
        text: 'insert into qa.photos (answer_id, url) values ($1, $2);',
        values: [response.rows[0].id, value],
      }
      await pool.query(photoConfig);
    })
    res.status(201).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.post('/questions', async (req, res) => {
  try {
    const config = {
      name: 'post-question',
      text: 'insert into qa.questions (product_id, body, asker_name, asker_email) values ($1, $2, $3, $4);',
      values: [req.body.product_id, req.body.body, req.body.answerer_name, req.body.answerer_email],
    }
    await pool.query(config);
    res.status(201).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.put('/questions/:id/helpful', async (req, res) => {
  const config = {
    name: 'put-question-helpful',
    text: 'update qa.questions set helpful = helpful + 1 where id = $1;',
    values: [req.query.id],
  }
  try {
    await pool.query(config)
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.put('/answers/:id/helpful', async (req, res) => {
  const config = {
    name: 'put-answer-helpful',
    text: 'update qa.answers set helpful = helpful + 1 where id = $1;',
    values: [req.query.id],
  }
  try {
    await pool.query(config)
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.put('/questions/:id/report', async (req, res) => {
  const config = {
    name: 'put-question-report',
    text: 'update qa.questions set reported = true where id = $1;',
    values: [req.query.id],
  }
  try {
    await pool.query(config);
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


app.put('/answers/:id/report', async (req, res) => {
  const config = {
    name: 'put-answer-report',
    text: 'update qa.answers set reported = true where id = $1;',
    values: [req.query.id],
  }
  try {
    await pool.query(config);
    res.status(204).end()
  } catch (err) {
    console.error(err);
    res.status(404).end()
  }
});


// Connect to server and database to prevent connection frequency with each query
const server = app.listen(PORT, () => {
  pool.connect(() => {
    console.log(`Database is connected on ${PORT}`);
  });
  console.log(`API server listening on ${PORT}`);
})