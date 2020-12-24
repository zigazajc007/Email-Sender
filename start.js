const fs = require('fs');
const nodemailer = require('nodemailer');

var transporter;
var settings;

var emails = [];

console.log("\x1b[34m\n","███████╗███╗   ███╗ █████╗ ██╗██╗         ███████╗███████╗███╗   ██╗██████╗ ███████╗██████╗ ");
console.log("\x1b[34m","██╔════╝████╗ ████║██╔══██╗██║██║         ██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗");
console.log("\x1b[34m","█████╗  ██╔████╔██║███████║██║██║         ███████╗█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝");
console.log("\x1b[34m","██╔══╝  ██║╚██╔╝██║██╔══██║██║██║         ╚════██║██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗");
console.log("\x1b[34m","███████╗██║ ╚═╝ ██║██║  ██║██║███████╗    ███████║███████╗██║ ╚████║██████╔╝███████╗██║  ██║");
console.log("\x1b[34m","╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝    ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝\n");

fs.readFile('./settings.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading json file: ${err}`);
    } else {

        settings = JSON.parse(data);

        console.log("\x1b[34m", "Email will be sent to: \n")

        for(var i = 0; i < settings["receivers"].length; i++){
            console.log("\x1b[34m", settings["receivers"][i])
            emails.push(settings["receivers"][i]);
        }

        console.log();

        transporter = nodemailer.createTransport({
            service: settings["email"]["service"],
            auth: {
              user: settings["email"]["auth"]["user"],
              pass: settings["email"]["auth"]["pass"]
            }
        });

        const interval = setInterval(function() {
            send_email();
        }, settings["send_interval"]*1000);

    }

});

function send_email(){
    if(emails[0] != null){
        transporter.sendMail(getMailOptions(emails[0]), function(error, info){
            if (error){
                console.log("\x1b[31m", "[" + new Date().toLocaleString() + "] Error: Email can't be sent. Please check if your username and password are correct and also if you have enabled access for less secure applications in Gmail.");
                console.log("\x1b[31m", "Link: https://support.google.com/mail/?p=BadCredentials");
            }else{
                console.log("\x1b[34m", "[" + new Date().toLocaleString() + "] Email to " + emails[0] + " is sent!");
                emails.splice(0, 1);
            }
        });
    }else{
        console.log("\x1b[33m", "All emails has been sent.");
    }
}

function getMailOptions(receiver){
    return mailOptions = {
        from: settings["email"]["options"]["from"],
        to: settings["email"]["options"]["to"].replace("{email}", receiver),
        subject: settings["email"]["options"]["subject"],
        html: settings["email"]["options"]["text"]
    };
}
