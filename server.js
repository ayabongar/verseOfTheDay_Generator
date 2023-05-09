const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDirectory = path.join(__dirname, 'app');

const server = http.createServer((request, response) => {
    if (request.url.startsWith('/api/')) {
        if (request.method === 'GET') {
            if (request.url === '/api/users') {
                const users = [
                    { id: 1, username: 'testUser', password: 'password1', hasVoted: false }
                ]

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.write(JSON.stringify(users));
                response.end();
            } else {
                response.writeHead(404);
                response.write('API Endpoint not found');
                response.end();
            }
        } else {
            response.writeHead(405);
            response.write('Method not allowed');
            response.end();
        }
    } else {
        const filePath = path.join(__dirname, 'app/pages', request.url);

        fs.exists(filePath, function (exists) {
            if (!exists) {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('404 Not Found');
                return;
            }

            fs.readFile(filePath, function (err, data) {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'text/html' });
                    response.end('500 Internal Server Error');
                    return;
                }

                let contentType = 'text/html';
                if (request.url.endsWith('.css')) {
                    contentType = 'text/css';
                } else if (request.url.endsWith('.js')) {
                    contentType = 'text/javascript';
                }

                response.writeHead(200, { 'Content-Type': contentType });
                response.write(data);
                response.end();
            });
        });
    }
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});