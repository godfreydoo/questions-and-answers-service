const express = require('express');
const axios = require('axios');
const router = express.Router();
const path = require('path');
const registry = require('./registry.json');

/////////////
// ANSWERS //
/////////////
router.all('/:apiName/:path/:id/answers', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}/${req.params.id}/answers`;
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.params })
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.end();
      })
  } else {
    res.send('API does not exist');
  }
})

///////////////
// QUESTIONS //
///////////////
router.all('/:apiName/:path/:id', (req, res) => {
  const url = `${registry.services[req.params.apiName].url}${req.params.path}/${req.params.id}`;
  if (registry.services[req.params.apiName]) {
    axios({ method: req.method, url: url, headers: req.headers, data: req.body, params: req.params })
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.end();
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
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.end();
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
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.end();
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
      .then(response => {
        res.send(response.data);
      })
      .catch(err => {
        console.log(`Router ${err}`);
        res.end();
      })
  } else {
    res.send('API does not exist');
  }
})

module.exports = router;