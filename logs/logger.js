const fs = require("fs");
const path = require('path');
const Logger = (exports.Logger = {});
const requestStream = fs.createWriteStream(path.join(__dirname, 'request.log'));

Logger.request = function(stat, time) {
  var message = `${stat} ${time} \n`;
  requestStream.write(message);
};
