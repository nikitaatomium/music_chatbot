var mysql = require('mysql');
var informations = require('../info/informations.js');
var Utility = require('../utility/utility.js');
var crypto = require('crypto'),
    algorithm = 'aes-128-ctr',
    iv = 'a2xhcgAAAAAAAAAA';

var resultAdd;
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'mysql_user',
    password: 'mysql_pass',
    database: 'mysql_db_name'
});

async function MakeQuery(query) {
    return new Promise(function(resolve, reject) {
    	connection.query(query, function(error, results, fields) {
		if(error) reject(error);
		resolve(results);
	});
    });
}

function encrypt(text){
  var cipher = crypto.createCipheriv(algorithm, informations.info, iv);
  var crypted = cipher.update(text + "",'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipheriv(algorithm, informations.info, iv);
  var dec = decipher.update(text + "",'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}


