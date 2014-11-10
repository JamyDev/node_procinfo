var exec = require("child_process").exec;
console.log("POST")

if (process.platform !== 'win32') {
    exec('npm install procinfo', function () {
        //
    });
}
