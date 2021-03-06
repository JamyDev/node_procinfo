var exec        = require("child_process").exec,
    spawn       = require("child_process").spawn,
    properties  = require("properties"),
    _           = require("lodash")
    numCPUs     = require("os").cpus().length;


function Win32ProcInfo (pid) {
    var $pInfo = this;
    $pInfo.pid = pid;
    
    $pInfo.spawnWMIC();
}

Win32ProcInfo.prototype.getCurrentCPU = function (callback) {
    this.fireWMIC("path Win32_PerfFormattedData_PerfProc_Process where IDProcess=" + this.pid + " get PercentProcessorTime", function (err, res) {
        if (err) {
            callback("Failed to get CPU: "+err, 0);
        } else {
            var cpu = ((res.PercentProcessorTime || 0) / numCPUs);
            callback(null, cpu);
        }
    });
};

Win32ProcInfo.prototype.getCurrentMemory = function (callback) {
    this.fireWMIC("path Win32_PerfFormattedData_PerfProc_Process where IDProcess=" + this.pid + " get WorkingSet", function (err, res) {
        if (err) {
            callback("Failed to get Mem: "+err, 0);
        } else {
            var mem = res.WorkingSet || 0;
            callback(null, mem);
        }
    });
};

Win32ProcInfo.prototype.getCurrentDiskIO = function (callback) {
    this.fireWMIC("path Win32_PerfFormattedData_PerfProc_Process where IDProcess=" + this.pid + " get IODataBytesPersec", function (err, res) {
        if (err) {
            callback("Failed to get Disk: "+err, 0);
        } else {
            var disk = res.IODataBytesPersec || 0;
            callback(null, disk);
        }
    });
};

Win32ProcInfo.prototype.getAllStats = function (callback) {
    this.fireWMIC("path Win32_PerfFormattedData_PerfProc_Process where IDProcess=" + this.pid + " get PercentProcessorTime,WorkingSet,IODataBytesPersec", function (err, res) {
        if (err) {
            callback("Failed to get Disk: "+err, 0);
        } else {
            var all = {
                cpu: ((res.PercentProcessorTime || 0) / numCPUs),
                mem: res.WorkingSet || 0,
                disk: res.IODataBytesPersec || 0
            };
            callback(null, all);
        }
    });
};


Win32ProcInfo.prototype.fireWMIC = function (command, callback) {
    var $pInfo = this;
    this.wmic.stdout.removeAllListeners("message");
    this.wmic.stdout.once("message", function (stdout) {
        properties.parse(stdout, callback);
    });

    if ($pInfo.wmic.killed) {
        $pInfo.spawnWMIC();
    }
    setImmediate(function () {
        $pInfo.wmic.stdin.write(new Buffer(command + " /FORMAT:LIST\n", "UTF8"));
    });
};

Win32ProcInfo.prototype.WMICMessage = _.throttle(function () {
    var $pInfo = this;
    clearTimeout($pInfo.timeout);
    $pInfo.timeout = setTimeout(function () {
        if (!$pInfo.wmic.killed) {
            $pInfo.wmic.kill();
        }
    }, 60000);
    var d = this.data;
    this.data = "";
    this.wmic.stdout.emit("message", d);
}, 10, {leading: false, trailing: true});

Win32ProcInfo.prototype.close = function () {
    var $pInfo = this;
    $pInfo.closed = true;
    if (!$pInfo.wmic.killed) {
        $pInfo.wmic.kill();
        clearTimeout($pInfo.timeout);
    }
};

Win32ProcInfo.prototype.spawnWMIC = function () {
    var $pInfo = this;

    $pInfo.wmic = spawn("wmic", [], {detached: true});

    $pInfo.wmic.stdout.on("data", function (data) {
        $pInfo.data += data.toString("UTF8").replace("wmic:root\\cli>", "");
        if ($pInfo.data.length > 3)
            $pInfo.WMICMessage();
    });

    $pInfo.data = "";

    $pInfo.timeout = setTimeout(function () {
        if (!$pInfo.wmic.killed) {
            $pInfo.wmic.kill();
        }
    }, 60000);
}

// Command for all: wmic path Win32_PerfFormattedData_PerfProc_Process where IDProcess=7872 get IDProcess,Name,IODataBytesPersec,WorkingSet,PercentProcessorTime

module.exports = Win32ProcInfo;