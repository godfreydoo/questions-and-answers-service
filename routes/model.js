require('dotenv').config();
require('newrelic');
const { pool } = require('../db/index.js');

module.exports = {
  getQuestions: async function(method, headers, body, query, params) {
    const pageSize = 5;
    var count = Math.min(Number(query.count), 200) || 5;
    var page = Number(query.page) || 1;
    var offset;

    if (page === 1) {
      offset = 0;
    } else {
      offset = page * pageSize;
    }

    const questionConfig = {
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
      values: [query.product_id, count, offset],
    }
    try {
      let { rows } = await pool.query(questionConfig);
      let result = {
        product_id: query.product_id,
        results: rows[0].questions.results || [],
      }
      return result;
    } catch (err) {
      console.error(err);
    }
  },

  getAnswers: async function (method, headers, body, query, params) {
    const pageSize = 5;
    var count = Math.min(Number(query.count), 200) || 5;
    var page = Number(query.page) || 1;
    var offset;

    if (page === 1) {
      offset = 0;
    } else {
      offset = page * pageSize;
    }

    const answersConfig = {
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
      values: [params.id, count, offset],
    }
    try {
      let { rows } = await pool.query(answersConfig);
      let result = {
        question: params.id,
        page: page,
        count: count,
        results: rows[0].questions.results || [],
      }
      return result;
    } catch (err) {
      console.error(err);
    }
  },

  postAnswer: async function(method, headers, body, query, params) {
    try {
      console.time('testing testing');
      const answerConfig = {
        text: 'insert into qa.answers (question_id, body, answerer_name, answerer_email) values ($1, $2, $3, $4) returning id;',
        values: [params.id, body.body, body.answerer_name, body.answerer_email],
      }
      const { rows } = await pool.query(answerConfig);

      await body.photos.forEach((value) => {
        let photoConfig = {
          text: 'insert into qa.photos (answer_id, url) values ($1, $2);',
          values: [rows[0].id, value],
        }
        pool.query(photoConfig);
      });
      console.timeEnd('testing testing');
    } catch (err) {
      console.error(err);
    }
  },

  postQuestion: async function(method, headers, body, query, params) {
    try {
      const config = {
        text: 'insert into qa.questions (product_id, body, asker_name, asker_email) values ($1, $2, $3, $4);',
        values: [body.product_id, body.body, body.answerer_name, body.answerer_email],
      }
      await pool.query(config);
    } catch (err) {
      console.error(err);
    }
  },

  putQuestionHelpful: async function(method, headers, body, query, params) {
    const config = {
      text: 'update qa.questions set helpful = helpful + 1 where id = $1;',
      values: [query.id],
    }
    try {
      await pool.query(config)
    } catch (err) {
      console.error(err);
    }
  },

  putAnswerHelpful: async function(method, headers, body, query, params) {
    const config = {
      text: 'update qa.answers set helpful = helpful + 1 where id = $1;',
      values: [query.id],
    }
    try {
      await pool.query(config)
    } catch (err) {
      console.error(err);
    }
  },

  putQuestionReport: async function(method, headers, body, query, params) {
    const config = {
      text: 'update qa.questions set reported = true where id = $1;',
      values: [query.id],
    }
    try {
      await pool.query(config);
    } catch (err) {
      console.error(err);
    }
  },

  putQuestionHelpful: async function(method, headers, body, query, params) {
    const config = {
      text: 'update qa.answers set reported = true where id = $1;',
      values: [query.id],
    }
    try {
      await pool.query(config);
    } catch (err) {
      console.error(err);
    }
  }
}



