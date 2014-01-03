// This is the riscv-gcc compileserver for ANGEL's Write C functionality
// It takes the posted content and compiles it using riscv-gcc
// [todo] - add support for varying filenames to support multiple users
// aka don't use a.out

var http = require('http');

http.createServer(function (req, res) {
    switch(req.url) {
        case '/':
            if (req.method == 'POST') {
                recstr = "";
                req.on('data', function(chunk) {
                    recstr += chunk.toString();
                });
                req.on('end', function() {
                    var sys = require('util')
                    var exec = require('child_process').exec
                    var child;

                    var binname = Math.floor(Math.random()*1000).toString() + (new Date).getTime().toString();

                    // run riscv-gcc on the user C code
                    child = exec("echo " + recstr + " | riscv-gcc -o binaries/" + binname + " -xc - > gccresults/" + binname + " 2>&1", function (error, stdout, stderr) {
                        // don't console.log / output anything
                        //sys.print('stdout: ' + stdout + "\n");
                        //sys.print('stderr: ' + stderr + "\n");
                        //if (error !== null) {
                        //    console.log('exec error: ' + error);
                        //}

                        res.writeHead(200, "OK", {'Content-Type': 'text/plain', 'charset': 'x-user-defined', 'Access-Control-Allow-Origin': '*'});
                        res.end(binname);

                    });
                });
            }
            break;
    }
}).listen('40000', '0.0.0.0');

console.log("riscv-gcc compileserver running at: localhost:40000");
