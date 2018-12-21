var path = require('path');
var fs = require('fs');

var certsPath = path.join(__dirname, 'ssl_certificate', 'server');
var caCertsPath = path.join(__dirname, 'ssl_certificate', 'ca');

module.exports.ssl_options = {
  /*---ssl certificate---*/
  key: fs.readFileSync(path.join(certsPath, 'server.key')),
  cert: fs.readFileSync(path.join(certsPath, 'server-thaicbr.crt')),
  ca: fs.readFileSync(path.join(caCertsPath, 'ca-thaicbr.crt')),
  requestCert: false,
  rejectUnauthorized: true
  /*---ssl certificate---*/
};
