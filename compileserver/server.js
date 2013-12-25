var http = require('http');
//var app = require('app');


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
                    res.writeHead(200, "OK", {'Content-Type': 'text/plain', 'charset': 'x-user-defined', 'Access-Control-Allow-Origin': '*'});
//                    res.end();
                    console.log(recstr);


                    var sys = require('util')
                    var exec = require('child_process').exec
                    var child;



                    child = exec("echo " + recstr + " | riscv-gcc -xc -" , function (error, stdout, stderr) {
                        sys.print('stdout: ' + stdout + "\n");
                        sys.print('stderr: ' + stderr + "\n");
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
//                        res.write(stdout);
//                        res.end();

                        /// TEST WRITING TO FILE
                        var fs = require('fs');                       

                        fs.readFile('a.out', function (err, data) {
                            if(err) throw err;
                            console.log(data);
                            res.write(data);
                            res.end();

                fs.writeFile("a.out2", data, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                }); 





                        });


                        /// END TEST WRITING TO FILE

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

