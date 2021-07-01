const { pool } = require('./index.js');
const etl = require('etl');
const fs = require('fs');

execute();

async function execute() {
  var client = await pool.connect();
  console.log('Client connected');
  try {
    console.time('ETL finished');
    await Promise.allSettled([uploadPhoto(), uploadAnswers(), uploadQuestions()]);
    console.log('Data loaded...');
    console.log('Data sanitizing...');
    console.time('Sequence values finished');
    await Promise.allSettled([updateQuestionsSeqValues(), updateAnswersSeqValues(), updatePhotosSeqValues()]);
    console.timeEnd('Sequence values finished');
    // console.log('Transforming time columns...')
    // await Promise.allSettled([updateTimeForQuestions(), updateTimeForAnswers()]);
    console.timeEnd('ETL finished');
  } catch (err) {
    console.error(err);
  } finally {
    await client.release();
    console.log('Client released');
  }
}



async function updateTimeForQuestions () {
  try {
    console.time('Transform time column for questions');

    await pool.query("UPDATE qa.questions SET time_holder = data.new_value FROM (SELECT TO_CHAR(TO_TIMESTAMP(date_written/1000), 'YYYY/MM/DD HH24:MI:SS') AS new_value FROM qa.questions WHERE id > 0) data WHERE id > 0;");
    await pool.query("ALTER TABLE qa.questions DROP column date_written;");
    await pool.query("ALTER TABLE qa.questions RENAME time_holder TO date_written;");
    await pool.query("ALTER TABLE qa.questions ALTER COLUMN date_written SET DEFAULT now();");

    console.timeEnd('Transform time column for questions');
  } catch (err) {
    console.error('Error updating time for questions: ', err);
  }
}

async function updateTimeForAnswers () {
  try {
    console.time('Transform time column for answers');

    await pool.query("UPDATE qa.answers SET time_holder = data.new_value FROM (SELECT TO_CHAR(TO_TIMESTAMP(date_written/1000), 'YYYY/MM/DD HH24:MI:SS') AS new_value FROM qa.answers WHERE id > 0) data WHERE id > 0;");
    await pool.query("ALTER TABLE qa.answers DROP column date_written;");
    await pool.query("ALTER TABLE qa.answers RENAME time_holder TO date_written;");
    await pool.query("ALTER TABLE qa.answers ALTER COLUMN date_written SET DEFAULT now();");

    console.timeEnd('Transform time column for answers');
  } catch (err) {
    console.error('Error updating time for answers: ', err);
  }
}

function updateQuestionsSeqValues () {
  return new Promise((resolve) => {
    pool
      .query("SELECT setval('qa.questions_id_seq', max(id)) FROM qa.questions;")
      .then(res => {
        resolve();
      })
      .catch(err => {
        console.error('Error max values for questions: ', err);
        reject();
      })
  })
}

function updateAnswersSeqValues () {
  return new Promise((resolve) => {
    pool
      .query("SELECT setval('qa.answers_id_seq', max(id)) FROM qa.answers;")
      .then(res => {
        resolve();
      })
      .catch(err => {
        console.error('Error max values for answers: ', err);
        reject();
      })
  })
}

function updatePhotosSeqValues () {
  return new Promise((resolve) => {
    pool
      .query("SELECT setval('qa.photos_id_seq', max(id)) FROM qa.photos;")
      .then(res => {
        resolve();
      })
      .catch(err => {
        console.error('Error max values for photos: ', err);
        reject();
      })
  })
}


function uploadPhoto() {
  return new Promise((resolve, reject) => {
    console.time('answers_photos.csv finished');
    console.log('Extracting answers_photos data...')
    fs.createReadStream('db/answers_photos.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'photos', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('answers_photos.csv finished');
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
    console.time('answers.csv finished');
    console.log('Extracting answers data...')
    fs.createReadStream('db/answers.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'answers', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('answers.csv finished');
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
    console.time('questions.csv finished');
    console.log('Extracting questions data...')
    fs.createReadStream('db/questions.csv')
      .pipe(etl.csv())
      .pipe(etl.postgres.script(pool, 'qa', 'questions', {pushResult: true}))
      .pipe(etl.postgres.execute(pool, 10))
      .promise()
      .then(() => {
        console.timeEnd('questions.csv finished');
        resolve();
      })
      .catch(error => {
        console.error(error);
        reject();
      });
  })
}
