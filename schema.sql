CREATE SCHEMA IF NOT EXISTS qa;

CREATE TABLE IF NOT EXISTS qa.question (
  id serial primary key,
  product_id int,
  body varchar(1000),
  date_written bigint,
  asker_name varchar(60),
  asker_email varchar(60),
  reported boolean default false,
  helpful int
);

CREATE TABLE IF NOT EXISTS qa.answer (
  id serial primary key,
  question_id int,
  body varchar(1000),
  date_written bigint,
  answerer_name varchar(60),
  answerer_email varchar(60),
  reported boolean default false,
  helpful int
);

CREATE TABLE IF NOT EXISTS qa.photo (
  id serial primary key,
  answer_id int,
  url varchar(256)
);

