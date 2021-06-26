CREATE SCHEMA IF NOT EXISTS qa;

DROP TABLE IF EXISTS qa.questions;
DROP TABLE IF EXISTS qa.photos;
DROP TABLE IF EXISTS qa.answers;


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

CREATE TABLE IF NOT EXISTS qa.answers (
  id serial primary key,
  question_id int,
  body varchar(1000),
  date_written bigint,
  answerer_name varchar(60),
  answerer_email varchar(60),
  reported boolean default false,
  helpful int default 0,
  unique(id)
);

CREATE TABLE IF NOT EXISTS qa.photos (
  id serial primary key,
  answer_id int,
  url varchar(256)
);

-- ALTER TABLE qa.answers ALTER helpful SET DEFAULT 0;
-- ALTER TABLE qa.questions ALTER helpful SET DEFAULT 0;
-- ALTER TABLE qa.answers ADD CONSTRAINT unique_id UNIQUE(id);

CREATE UNIQUE INDEX question_id_qidx ON qa.questions (id);
CREATE INDEX product_id_qidx ON qa.questions (product_id, reported); -- multi-column indexes in the where clause
CREATE INDEX helpful_qidx ON qa.questions (helpful DESC);
-- CREATE INDEX reported_qidx ON qa.questions (reported) WHERE reported IS FALSE; -- creates a partial index to flag in a batch


CREATE UNIQUE INDEX answer_id_aidx ON qa.answers (id);
CREATE INDEX question_id_aidx ON qa.answers (question_id, reported); -- multi-column indexes in the where clause
CREATE INDEX helpful_aidx ON qa.answers (helpful DESC);
-- CREATE INDEX reported_aidx ON qa.answers (reported) WHERE reported IS FALSE; -- creates a partial index to flag in a batch

CREATE INDEX answer_id_pidx ON qa.photos (answer_id);