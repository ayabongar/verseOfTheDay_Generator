const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (req, res) {
    //Creating the file path for the specific html file we want to render
    const filePath = path.join(__dirname, 'pages', req.url);

    //Check if that page exists
    fs.exists(filePath, function(exists) {
        if(!exists) {
            res.writeHead(404, {'Content-Type' : 'text/html'});
            res.end('404 Not Found');
            return;
        }

        fs.readFile(filePath, function(err, data) {
            if(err) {
                res.writeHead(500, {'Content-Type' : 'text/html'});
                res.end('500 Internal Server Error');
                return;
            }

            let contentType = 'text/html';
            if(req.url.endsWith('.css')) {
                contentType = 'text/css';
            } else if(req.url.endsWith('.js')) {
                contentType = 'text/javascript';
            }

            res.writeHead(200, {'Content-Type' : contentType});
            res.write(data);
            res.end();
        });
    });

}).listen(8080);