import http from 'k6/http';
import { group, sleep } from "k6";
import { Trend } from 'k6/metrics';

let groupDuration = Trend("groupDuration");

/*
k6 run k6script.js
*/

export let options = {
  thresholds: {
    'groupDuration{groupName:individualRequests}': ['avg < 2000'],
    http_req_failed: ['rate < 0.01'],
    http_reqs:['rate > 100']
  },
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
};

var idx = __VU;
var answersUrl = `http://localhost:3000/qa/questions/${idx}/answers`;
var questionsUrl = 'http://localhost:3000/qa/questions/'

var answersPayload = JSON.stringify({
  body: "Does this work testing testing",
  answerer_name: "godfrey",
  answerer_email: "g@g.com",
  photos:["oogie boogie", "oogie boogie"]
});
var questionsPayload = JSON.stringify({
  product_id: __VU,
  body: "Does this work testing testing",
  answerer_name: "godfrey",
  answerer_email: "g@g.com",
});

var params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

function groupWithDurationMetric(name, group_function) {
  let start = new Date();
  group(name, group_function);
  let end = new Date();
  groupDuration.add(end - start, {groupName: name})
}

export default function () {

  groupWithDurationMetric('individualRequests', function () {
    http.get(`http://localhost:3000/qa/questions?product_id=${idx}`);
    http.get(`http://localhost:3000/qa/questions/${idx}/answers`);
    http.post(answersUrl, answersPayload, params);
    http.post(questionsUrl, questionsPayload, params);
    http.put(`http://localhost:3000/qa/questions/${idx}/helpful`);
    http.put(`http://localhost:3000/qa/answers/${idx}/helpful`);
    http.put(`http://localhost:3000/qa/questions/${idx}/report`);
    http.put(`http://localhost:3000/qa/answers/${idx}/report`);
  });

  sleep(1);

}