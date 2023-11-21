import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import nodemailer from 'nodemailer';
import validator from 'validator';

dotenv.config();

const debug = (process.env.DEBUG_MODE === 'true');

//Email Server Settings
const host = process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT);
const secure = (process.env.EMAIL_SECURE === 'true');
const username = process.env.EMAIL_USERNAME;
const password = process.env.EMAIL_PASSWORD;

// Other Settings
var from = process.env.EMAIL_FROM;
const subject = process.env.EMAIL_SUBJECT;
const html = (process.env.EMAIL_HTML === 'true');
const sendInterval = parseInt(process.env.SEND_INTERVAL);
const batchSize = parseInt(process.env.BATCH_SIZE);

var message = "";
var receivers = [];
var providers = {};

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
console.log("\x1b[34m", "  HTML: \x1b[35m" + html);
console.log("\x1b[34m", "  Debug: \x1b[35m" + debug);
console.log("\x1b[34m", "  Batch Size: \x1b[35m" + batchSize);
console.log("\x1b[34m", "  Email From: \x1b[35m" + from);
console.log("\x1b[34m", "  Email Subject: \x1b[35m" + subject + "\n");

from = '"' + from + '" ' + username;

try{
	message = await fs.readFile('./settings/message.txt', 'utf-8');
	console.log("\x1b[32m", "Message:\n");
	console.log("\x1b[35m" + message + "\n");
}catch{
	console.log("\x1b[34m", "Error while trying to get message from settings/message.txt file!");
	process.exit(1);
}

try{
	receivers = await fs.readFile('./settings/receivers.txt', 'utf-8');
	receivers = receivers.split('\n');
}catch{
	console.log("\x1b[34m", "Error while trying to get receivers from settings/receivers.txt file!");
	process.exit(1);
}

let total = receivers.length;

// Receiver filtering
console.log("\x1b[32m", "Receivers:\n");
console.log("\x1b[34m", "  Initial Count (Before Filters): \x1b[35m" + total);
receivers = receivers.filter(receiver => validator.isEmail(receiver)).map(email => email.toLowerCase());;
console.log("\x1b[34m", "    - Invalid Filtered Out: \x1b[35m" + (total - receivers.length));
total = receivers.length;
receivers = [...new Set(receivers)];
console.log("\x1b[34m", "    - Duplicates Removed: \x1b[35m" + (total - receivers.length) + "\n");
console.log("\x1b[34m", "  Final Count (After Filters): \x1b[35m" + receivers.length + "\n");

// Providers
console.log("\x1b[32m", "Providers:\n");
receivers.forEach(receiver => {
	let domain = receiver.split('@')[1];
	if(!Array.isArray(providers[domain])) providers[domain] = [];
	providers[domain].push(receiver);
});

Object.keys(providers).forEach(domain => {
	console.log("\x1b[34m", "  " + domain + ": \x1b[35m" + providers[domain].length);
});
console.log('\n');

transporter = nodemailer.createTransport({
	host: host,
	port: port,
	secure: secure,
	auth: {
		user: username,
		pass: password,
	},
});

// Send Emails
logger("Countdown initiated! Your emails are set to launch in just 10 seconds! 🚀", '90');
await new Promise(resolve => setTimeout(resolve, 10000));

Object.keys(providers).forEach(async domain => {
	let addresses = providers[domain];
	const totalBatches = Math.ceil(addresses.length / batchSize);

	for (let i = 0; i < addresses.length; i += batchSize) {
		const batch = addresses.slice(i, i + batchSize);

		transporter.sendMail(getMailOptions(batch), (error, info) => {
			if (error) {
				logger(`Oops! Something went wrong while sending emails to ${batch.length} addresses hosted on ${domain} server. (${i / batchSize + 1}/${totalBatches})`, '31', error);
			} else {
				logger(`Successfully delivered emails to ${batch.length} addresses hosted on ${domain} server. (${i / batchSize + 1}/${totalBatches})`, '32', info.response);
			}
		});

		await new Promise(resolve => setTimeout(resolve, sendInterval * 1000));
	}

});

function logger(message, color, data){
	if(debug && data !== undefined){
		console.log("\x1b[" + color + "m", `[${new Date().toLocaleString()}] ${message}`, data);
	}else{
		console.log("\x1b[" + color + "m", `[${new Date().toLocaleString()}] ${message}`);
	}
}

function getMailOptions(addresses){
	let mailOptions = {
		from: from,
		bcc: addresses,
		subject: subject
	};

	if(html){
		mailOptions.html = message;
	}else{
		mailOptions.text = message;
	}

	return mailOptions;
}