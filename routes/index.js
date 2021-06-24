const express = require('express');
const axios = require('axios');
const router = express.Router();
const path = require('path');
const registry = require('./registry.json');

router.all('/:apiName/:path', (req, res) => {

  if (registry.services[req.params.apiName]) {
    axios({
      method: req.method,
      url: registry.services[req.params.apiName].url + req.params.path,
      headers: req.headers,
      data: req.body
    })
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