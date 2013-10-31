var http = require('http');

http.createServer(function (req, res) {
    switch(req.url) {
        case '/':
            if (req.method == 'POST') {
                console.log("POSTED");
                recstr = "";
                req.on('data', function(chunk) {
                    recstr += chunk.toString();
                });
                req.on('end', function() {
                    res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                    res.end();
                    console.log(recstr);


                    var sys = require('util')
                    var exec = require('child_process').exec
                    var child;



                    child = exec("echo " + recstr + " | gcc -xc -" , function (error, stdout, stderr) {
                        sys.print('stdout: ' + stdout + "\n");
                        sys.print('stderr: ' + stderr + "\n");
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }

                    });




                    setTimeout(runner, 3000);
                });
            }
            break;
    }
}).listen('40000', '0.0.0.0');

console.log("server running at: 40000");


function runner() {
var sys = require('util')
var exec = require('child_process').exec
var child;

child = exec("./a.out" , function (error, stdout, stderr) {
    sys.print('stdout: ' + stdout + "\n");
    sys.print('stderr: ' + stderr + "\n");
/*    if (error !== null) {
        console.log('\n exec error: ' + error);
    }*/




});


}

