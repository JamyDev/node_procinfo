var exec = require("child_process").exec;

if (process.platform !== 'win32') {
    exec('npm install procinfo', function () {
        //
    });
}
