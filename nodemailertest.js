var sendmail = require('sendmail')();
 
sendmail({
    from: 'nodemailer-bot',
    to: 'scg104020@utdallas.edu',
    subject: 'test sendmail',
    html: 'Mail of test sendmail ',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});