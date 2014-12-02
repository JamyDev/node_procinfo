var usage = require('usage');
var cores = require("os").cpus().length;

function UnixProcInfo (pid) {
    var $pInfo = this;
    $pInfo.pid = pid;
    $pInfo.closed = false;

    $pInfo.data = "";
}

UnixProcInfo.prototype.getCurrentCPU = function (callback) {
    this.getAllStats(function (err, res) {
        if (err) {
            callback("Failed to get CPU: "+err, 0);
        } else {
            var cpu = res.cpu;
            callback(null, cpu);
        }
    });
};

UnixProcInfo.prototype.getCurrentMemory = function (callback) {
    this.getAllStats(function (err, res) {
        if (err) {
            callback("Failed to get mem: "+err, 0);
        } else {
            var mem = res.mem;
            callback(null, mem);
        }
    });
};

UnixProcInfo.prototype.getCurrentDiskIO = function (callback) {
    this.getAllStats(function (err, res) {
        if (err) {
            callback("Failed to get disk: "+err, 0);
        } else {
            // var disk = res.IODataBytesPersec;
            callback(null, 0);
        }
    });
};

UnixProcInfo.prototype.getAllStats = function (callback) {
    usage.lookup(this.pid, {keepHistory: true}, function (err, res) {
        if (err) {
            callback("Failed to get stats: "+err, 0);
        } else {
            var all = {
                cpu: Math.round(res.cpu / cores),
                mem: res.memory,
                // disk: res.IODataBytesPersec
            };
            callback(null, all);
        }
    });
};

UnixProcInfo.prototype.close = function () {
    this.closed = true;
};

module.exports = UnixProcInfo;
