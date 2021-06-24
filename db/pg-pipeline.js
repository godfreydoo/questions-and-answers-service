const { Pool } = require('pg');
const etl = require('etl');
const fs = require('fs');

require('dotenv').config();


// Database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

execute();

async function execute() {
  try {
    pool.connect()
    console.log('Database connected...');
    await Promise.allSettled([uploadPhoto(), uploadAnswers(), uploadQuestions()]);
    pool.end();
    console.log('Database closed...')
  } catch (err) {
    console.error(err);
  }
}

function uploadPhoto() {
  return new Promise((resolve, reject) => {
    console.time('photos');
    console.log('Uploading answers_photos data...')
    fs.createReadStream('db/answers_photos.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'photos', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('photos');
        console.log("Call to upload answers_photos.csv finished");
        resolve();
      })
      .catch(error => {
        console.error(error);
        reject();
      });
  })
}


function uploadAnswers() {
  return new Promise((resolve, reject) => {
    console.time('answers');
    console.log('Uploading answers data...')
    fs.createReadStream('db/answers.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'answers', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('answers');
        console.log("Call to upload answers.csv finished");
        resolve();
      })
      .catch(error => {
        console.error(error);
        reject();
      });
  })
}


function uploadQuestions() {
  return new Promise((resolve, reject) => {
    console.time('questions');
    console.log('Uploading questions data...')
    fs.createReadStream('db/questions.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'questions', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('questions');
        console.log("Call to upload questions.csv finished");
        resolve();
      })
      .catch(error => {
        console.error(error);
        reject();
      });
  })
}
