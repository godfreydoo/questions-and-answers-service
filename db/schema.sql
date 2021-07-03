CREATE SCHEMA IF NOT EXISTS qa;

DROP TABLE IF EXISTS qa.questions CASCADE;
DROP TABLE IF EXISTS qa.photos CASCADE;
DROP TABLE IF EXISTS qa.answers CASCADE;


CREATE TABLE IF NOT EXISTS qa.questions (
  id serial primary key,
  product_id int,
  body varchar(1000),
  date_written bigint,
  asker_name varchar(60),
  asker_email varchar(60),
  reported boolean default false,
  helpful int default 0,
  unique(id)
);

-- \copy qa.questions(id, product_id, body, date_written, asker_name, asker_email, reported, helpful) FROM '~/questions.csv' WITH (FORMAT CSV, HEADER)

-- COPY questions(id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
-- FROM '/questions.csv'
-- DELIMITER ','
-- CSV HEADER;

CREATE TABLE IF NOT EXISTS qa.answers (
  id serial primary key,
  question_id int,
  body varchar(1000),
  date_written bigint,
  answerer_name varchar(60),
  answerer_email varchar(60),
  reported boolean default false,
  helpful int default 0,
  unique(id),
  foreign key (question_id) references qa.questions(id)
);

-- \copy qa.answers(id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) FROM '~/answers.csv' WITH (FORMAT CSV, HEADER)

-- COPY answers(id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
-- FROM '/answers.csv'
-- DELIMITER ','
-- CSV HEADER;


CREATE TABLE IF NOT EXISTS qa.photos (
  id serial primary key,
  answer_id int,
  url varchar(256),
  foreign key (answer_id) references qa.answers(id)
);

-- \copy qa.photos(id, answer_id, url) FROM '~/answers_photos.csv' WITH (FORMAT CSV, HEADER)

-- COPY photos(id, answer_id, url)
-- FROM '/answers_photos.csv'
-- DELIMITER ','
-- CSV HEADER;

-- ALTER TABLE qa.questions ADD COLUMN time_holder TEXT;
-- ALTER TABLE qa.answers ADD COLUMN time_holder TEXT;

CREATE UNIQUE INDEX question_id_qidx ON qa.questions (id);
CREATE INDEX product_id_qidx ON qa.questions (product_id, reported); -- multi-column indexes in the where clause
CREATE INDEX helpful_qidx ON qa.questions (helpful DESC);
-- CREATE INDEX date_qidx ON qa.questions (date_written);


CREATE UNIQUE INDEX answer_id_aidx ON qa.answers (id);
CREATE INDEX question_id_aidx ON qa.answers (question_id, reported); -- multi-column indexes in the where clause
CREATE INDEX helpful_aidx ON qa.answers (helpful DESC);
-- CREATE INDEX date_aidx ON qa.questions (date_written);


CREATE INDEX answer_id_pidx ON qa.photos (answer_id);
