const http = require('http');
const fs = require('fs');
const url = require('url');
const _path = require('path');
var qs = require('querystring');
const mimeTypesLookup = require('mime-types').lookup;
let folderName = '';


const server = http.createServer((request, response) => {
    let file = '';
    let mimeType = '';
    let filePath = '';

    let _URL = url.parse(request.url);
    let path = _URL.path.replace(/^\/+|\/+$/g,"");

    if(path == 'UserLogin')
    {
        console.log('User Attempting To Login...');
        const { headers, method, url } = request;
        let body = [];
        request.on('error', (err) => {
          console.error(err);
        }).on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          console.log(body);
          // At this point, we have the headers, method, url and body, and can now
          // do whatever we need to in order to respond to this request.
        });

        if(body)
        {
            console.log('Body - ' + body);
        }
        else
        {
            console.log('Body Not Populated ' + body);
        }
    }

    if(path == ''){
        path = 'login.html';
    }

    if(path != undefined)
    {
        if(path.includes('.') && !path.includes('Images/'))
        {
            folderName = path.slice(0, path.indexOf('.'));
        }
    }

    mimeType = mimeTypesLookup(path);
    filePath = __dirname + `/app/pages/${folderName}/`+path;

    if(fs.existsSync(filePath))
    {
        file = filePath;
    }else
    {
        file = __dirname + `/app/pages/error/error.html`;
    }
    
    fs.readFile(file, function(err, content){
        if(err){
            console.log(err);
                response.writeHead(404);
                response.end();
        } else {
            console.log(`Returning Path ${path}`);
            response.writeHead(200, {'Content-type':mimeType});
            response.end(content);
        }
    })
});


server.listen(8080, 'localhost', () => {
    console.log('Server is listening on port 8080');
});
