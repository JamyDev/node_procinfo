var Win32 = require("../platforms/win32.js");

var w = new Win32(process.pid);


w.getAllStats(function (err, cpu) {
    console.log(cpu);
});