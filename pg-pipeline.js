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

pool.connect(() => {
  console.log('Database is connected');
})

uploadPhoto = () => {
  console.time('photos');
  console.log('Uploading answers_photos data...')
  fs.createReadStream('answers_photos.csv')
    .pipe(etl.csv())
    .pipe(etl.postgres.script(pool, 'qa', 'photo', {pushResult: true}))
    .pipe(etl.postgres.execute(pool, 10))
    .promise()
    .then(async () => {
      console.timeEnd('photos');
      console.log("Call to upload answers_photos.csv finished");
    })
    .catch(error => console.error(error));
}
uploadPhoto();


uploadAnswers = () => {
  console.time('answers');
  console.log('Uploading answers data...')
  fs.createReadStream('answers.csv')
  .pipe(etl.csv())
  .pipe(etl.postgres.script(pool, 'qa', 'answer', {pushResult: true}))
  .pipe(etl.postgres.execute(pool, 10))
  .promise()
  .then(async () => {
    console.timeEnd('answers');
    console.log("Call to upload answers.csv finished");
  })
  .catch(error => console.error(error));
}
uploadAnswers();


uploadQuestions = () => {
  console.time('questions');
  console.log('Uploading questions data...')
  fs.createReadStream('questions.csv')
  .pipe(etl.csv())
  .pipe(etl.postgres.script(pool, 'qa', 'question', {pushResult: true}))
  .pipe(etl.postgres.execute(pool, 10))
  .promise()
  .then(async () => {
    console.timeEnd('questions');
    console.log("Call to upload questions.csv finished");
  })
  .catch(error => console.error(error));
}
uploadQuestions();
