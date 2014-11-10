var procinfo = require('procinfo');

function UnixProcInfo (pid) {
    var $pInfo = this;
    $pInfo.pid = pid;

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
            callback(null, disk);
        }
    });
};

UnixProcInfo.prototype.getAllStats = function (callback) {
    procinfo(this.pid, function (err, res) {
        if (err) {
            callback("Failed to get stats: "+err, 0);
        } else {
            var all = {
                cpu: res[0].pcpu,
                mem: res[0].pmem,
                // disk: res.IODataBytesPersec
            };
            callback(null, all);
        }
    });
};

module.exports = UnixProcInfo;
