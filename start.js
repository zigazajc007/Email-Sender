require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');

//Email Server Settings
const host = process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT);
const secure = Boolean(process.env.EMAIL_SECURE);
const username = process.env.EMAIL_USERNAME;
const password = process.env.EMAIL_PASSWORD;

// Other Settings
var from = process.env.EMAIL_FROM;
const subject = process.env.EMAIL_SUBJECT;
const sendInterval = process.env.SEND_INTERVAL;

var message = "";
var receivers = [];

var transporter;

console.log("\x1b[34m\n","███████╗███╗   ███╗ █████╗ ██╗██╗         ███████╗███████╗███╗   ██╗██████╗ ███████╗██████╗ ");
console.log("\x1b[34m","██╔════╝████╗ ████║██╔══██╗██║██║         ██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗");
console.log("\x1b[34m","█████╗  ██╔████╔██║███████║██║██║         ███████╗█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝");
console.log("\x1b[34m","██╔══╝  ██║╚██╔╝██║██╔══██║██║██║         ╚════██║██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗");
console.log("\x1b[34m","███████╗██║ ╚═╝ ██║██║  ██║██║███████╗    ███████║███████╗██║ ╚████║██████╔╝███████╗██║  ██║");
console.log("\x1b[34m","╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝    ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝\n");

console.log("\x1b[32m", "Email Server Settings:\n");
console.log("\x1b[34m", "  Host: \x1b[35m" + host);
console.log("\x1b[34m", "  Port: \x1b[35m" + port);
console.log("\x1b[34m", "  Secure: \x1b[35m" + secure);
console.log("\x1b[34m", "  Username: \x1b[35m" + username);
console.log("\x1b[34m", "  Password: \x1b[35m********************\n");

console.log("\x1b[32m", "Other Settings:\n");
console.log("\x1b[34m", "  Send Interval: \x1b[35mEvery " + sendInterval + " seconds");
console.log("\x1b[34m", "  Email From: \x1b[35m" + from);
console.log("\x1b[34m", "  Email Subject: \x1b[35m" + subject + "\n");

from = '"' + from + '" ' + username;

fs.readFile('./settings/message.txt', 'utf8', (err, data) => {
	if(err){
		console.log("\x1b[34m", "Error while trying to get message from settings/message.txt file!");
		process.exit(1);
	}
	message = data;
	console.log("\x1b[32m", "Message:\n");
	console.log("\x1b[35m" + message + "\n");

	fs.readFile('./settings/receivers.txt', 'utf8', (err, data) => {
		if(err){
			console.log("\x1b[34m", "Error while trying to get receivers from settings/receivers.txt file!");
			process.exit(1);
		}
		receivers = data.split('\n');
		console.log("\x1b[32m", "Receivers (" + receivers.length + "):\n");
		console.log("\x1b[35m" + receivers + "\n");

		transporter = nodemailer.createTransport({
			host: host,
			port: port,
			secure: secure,
			auth: {
				user: username,
				pass: password,
			},
		});

		console.log("\x1b[33m", "\nEmail Sender will start sending messages in 10 seconds.\n");
		setTimeout(function() {
			setInterval(function() {
				sendEmail();
			}, sendInterval*1000);
		}, 10000);
	});

});

function sendEmail(){
	if(typeof(receivers[0]) != 'undefined' || receivers[0] != null){
		transporter.sendMail(getMailOptions(receivers[0]), function(error, info){
			if (error){
				console.log("\x1b[31m", "[" + new Date().toLocaleString() + "] Error: " + error);
			}else{
				console.log("\x1b[34m", "[" + new Date().toLocaleString() + "] Email to " + receivers[0] + " is sent!");
				receivers.splice(0, 1);
			}
		});
	}else{
		console.log("\n\x1b[33m All emails has been sent.\n");
		process.exit();
	}
}

function getMailOptions(receiver){
	return mailOptions = {
		from: from,
		to: receiver,
		subject: subject,
		text: message
	};
}