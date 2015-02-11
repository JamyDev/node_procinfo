var exec = require("child_process").exec;

if (process.platform !== 'win32') {
    exec('npm install usage', function (err, stdout, stderr) {
        if (err) {
        	console.log(err, stdout, stderr);
        }
    });
}
