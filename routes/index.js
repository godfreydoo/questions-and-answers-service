const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');
const { Logger } = require("../logs/logger");
const controller = require("./controller");
const router = express.Router();


// Middleware
router.use(responseTime(function (req, res, time) {
  var stat = (req.method + req.url).toLowerCase();
  Logger.request(stat, time);
}))
router.use(express.json());


// Routes
router.get('/:apiName/:path', (req, res) => {
  controller.getQuestions(req, res);
})

router.get('/:apiName/:path/:id/answers', (req, res) => {
  controller.getAnswers(req, res);
})

router.post('/:apiName/:path/:id/answers', (req, res) => {
  controller.postAnswer(req, res);
})

router.post('/:apiName/:path', (req, res) => {
  controller.postQuestion(req, res);
})

router.put('/:apiName/:path/:id/helpful', (req, res) => {
  controller.putQuestionHelpful(req, res);
})

router.put('/:apiName/:path/:id/report', (req, res) => {
  controller.putQuestionReport(req, res);
})

router.put('/:apiName/:path/:id/helpful', (req, res) => {
  controller.putAnswerHelpful(req, res);
})

router.put('/:apiName/:path/:id/report', (req, res) => {
  controller.putAnswerReport(req, res);
})

module.exports = router;