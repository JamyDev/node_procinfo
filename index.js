var Win32ProcInfo = require("./platforms/win32.js");

function ProcInfo (pid) {
    this.pid = pid;

    if (isProcessRunning(pid)) {
        if (process.platform === "win32") {
            return new Win32ProcInfo(pid);
        }
    } else {
        return false;
    }


}

function isProcessRunning (pid) {
    if (!pid) return 0;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (ex) {}
    return false;
}

module.exports = ProcInfo;