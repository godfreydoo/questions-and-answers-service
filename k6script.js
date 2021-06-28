import http from 'k6/http';
import { group, sleep } from "k6";
import { Trend } from 'k6/metrics';

let groupDuration = Trend("groupDuration");

/*
k6 run k6script.js
*/

export let options = {
  thresholds: {
    'groupDuration{groupName:individualRequests}': ['avg < 50'],
    'groupDuration{groupName:batchRequests}': ['avg < 50']
  },
  vus: 100,
  duration: '15s'
};

function groupWithDurationMetric(name, group_function) {
  let start = new Date();
  group(name, group_function);
  let end = new Date();
  groupDuration.add(end - start, {groupName: name})
}

export default function () {
  function randomAnswerIdx () {
    // return Math.floor(Math.random() * 6879307);
    return 1;
  }
  function randomQuestionIdx () {
    // return Math.floor(Math.random() * 3518964);
    return 1;
  }

  var answersUrl = 'http://localhost:3000/qa/questions/532/answers';
  var questionsUrl = 'http://localhost:3000/qa/questions/'
  var answersPayload = JSON.stringify({
    body: "Does this work testing testing",
    answerer_name: "godfrey",
    answerer_email: "g@g.com",
    photos:["oogie boogie", "oogie boogie"]
  });
  var questionsPayload = JSON.stringify({
    product_id: 532,
    body: "Does this work testing testing",
    answerer_name: "godfrey",
    answerer_email: "g@g.com",
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  groupWithDurationMetric('individualRequests', function () {
    // http.get(`http://localhost:3000/qa/questions?product_id=${randomQuestionIdx()}`); -- can perform 100vs per second under 50ms
    // http.get(`http://localhost:3000/qa/questions/${randomAnswerIdx()}/answers`); -- can perform 100vs per second under 50ms
    http.post(answersUrl, answersPayload, params);
    http.post(questionsUrl, questionsPayload, params);
    http.put(`http://localhost:3000/qa/questions/${randomQuestionIdx()}/helpful`);
    http.put(`http://localhost:3000/qa/answers/${randomAnswerIdx()}/helpful`);
    http.put(`http://localhost:3000/qa/questions/${randomQuestionIdx()}/report`);
    http.put(`http://localhost:3000/qa/answers/${randomAnswerIdx()}/report`);
  });

  groupWithDurationMetric('batchRequests', function () {
    http.batch([
      // ['GET', `http://localhost:3000/qa/questions?product_id=${randomQuestionIdx()}`], -- can perform 100vs per second under 50ms
      // ['GET', `http://localhost:3000/qa/questions/${randomAnswerIdx()}/answers`], -- can perform 100vs per second under 50ms
      ['POST', answersUrl, answersPayload, params],
      ['POST', questionsUrl, questionsPayload, params],
      ['PUT', `http://localhost:3000/qa/questions/${randomQuestionIdx()}/helpful`],
      ['PUT', `http://localhost:3000/qa/answers/${randomAnswerIdx()}/helpful`],
      ['PUT', `http://localhost:3000/qa/questions/${randomQuestionIdx()}/report`],
      ['PUT', `http://localhost:3000/qa/answers/${randomAnswerIdx()}/report`]
    ]);
  });

  sleep(1);
}