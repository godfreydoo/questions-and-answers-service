const express = require('express');
const axios = require('axios');
const router = express.Router();
const path = require('path');
const registry = require('./registry.json');
const responseTime = require('response-time');
const { Logger } = require("../logs/logger");

router.use(responseTime(function (req, res, time) {
  var stat = (req.method + req.url).toLowerCase();
  Logger.request(stat, time);
}))


///////////////
// QUESTIONS //
///////////////
router.all('/:apiName/:path', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}`;
  console.log(url);
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.query })
      .then(response => {
        res.status(200).json(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.status(404).end()
      })
  } else {
    res.send('API does not exist');
  }
})


/////////////
// ANSWERS //
/////////////
router.all('/:apiName/:path/:id/answers', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}/${req.params.id}/answers`;
  console.log(url);
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.query, query: req.params})
      .then(response => {
        res.status(200).json(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.status(404).end()
      })
  } else {
    res.send('API does not exist');
  }
})

////////////////////
// UPDATE HELPFUL //
////////////////////
router.put('/:apiName/:path/:id/helpful', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}/${req.params.id}/helpful`;
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.params })
      .then(() => {
        res.status(204).end()
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.status(404).end()
      })
  } else {
    res.send('API does not exist');
  }
})

///////////////////
// UPDATE REPORT //
///////////////////
router.put('/:apiName/:path/:id/report', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}/${req.params.id}/report`;
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.params })
      .then(() => {
        res.status(204).end();
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.status(404).end()
      })
  } else {
    res.send('API does not exist');
  }
})

/////////////////////
// CREATE QUESTION //
/////////////////////
router.post('/:apiName/:path', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}`;
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.params })
      .then(() => {
        res.status(204).end();
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.status(404).end()
      })
  } else {
    res.send('API does not exist');
  }
})

module.exports = router;