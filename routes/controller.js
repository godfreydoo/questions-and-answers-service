const model = require('./model');

module.exports = {
  getQuestions: async function (req, res) {
    try {
      let data = await model.getQuestions(req.method, req.headers, req.body, req.query, req.params);
      res.status(200).json(data);
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

  getAnswers: async function (req, res) {
    try {
      let data = await model.getAnswers(req.method, req.headers, req.body, req.query, req.params);
      res.status(200).json(data);
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

  postQuestion: async function (req, res) {
    try {
      let data = await model.postQuestion(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },


  postAnswer: async function (req, res) {
    try {
      let data = await model.postAnswer(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },


  putQuestionHelpful: async function (req, res) {
    try {
      let data = await model.putQuestionHelpful(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

  putQuestionReport: async function (req, res) {
    try {
      let data = await model.putQuestionReport(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

  putAnswerHelpful: async function (req, res) {
    try {
      let data = await model.putAnswerHelpful(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

  putAnswerReport: async function (req, res) {
    try {
      let data = await model.putAnswerReport(req.method, req.headers, req.body, req.query, req.params);
      res.status(204).end();
    } catch(err) {
      console.log(`Controller ${err}`);
      res.status(404).end()
    }
  },

}