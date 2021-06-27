const fs = require("fs");
const path = require('path');
const Logger = (exports.Logger = {});
const totalRequestStream = fs.createWriteStream(path.join(__dirname, 'httpRequest.txt'));
const dbQueryStream = fs.createWriteStream(path.join(__dirname, 'dbQuery.txt'));

Logger.request = function(stat, time) {
  var message = `${stat} ${time} \n`;
  totalRequestStream.write(message);
};

Logger.dbQuery = function(stat, time) {
  var message = `${time} \n`;
  dbQueryStream.write(message);
};