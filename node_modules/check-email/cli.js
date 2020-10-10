#! /usr/bin/env node

'use strict';

var email = require('./check-email');
var multiline = require('multiline');
var emailData = require('./lib/emailData');

var userArgs = process.argv;
var searchParam = userArgs[2];
var passData = [];
var failData = [];
var regex = searchParam;

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 || searchParam === undefined) {
    return console.log(multiline.stripIndent(function () { /*
     Usage
     =====
     checkemail 'REGEXP' -p / --pass : show the pass email type
     checkemail 'REGEXP' -f / --fail : show the fail email type
     checkemail -h / --help : show the help message
     checkemail -v / --version : show the version

     github repo : https://github.com/easy-node/check-email

     */
    }));
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log('checkemail version : ' + require('./package').version);
}

var re = new RegExp(regex.replace(/\//g, ""));

for (var i = 0; i < emailData.length; i++) {
    if (re.test(emailData[i].value)) {
        passData.push(emailData[i]);
    } else {
        failData.push(emailData[i]);
    }
}

if (userArgs.indexOf('-p') !== -1 || userArgs.indexOf('--pass') !== -1) {
    return console.log(passData);
} else if (userArgs.indexOf('-f') !== -1 || userArgs.indexOf('--fail') !== -1) {
    return console.log(failData);
} else {
    return console.log(passData);
}