const http = require('http');
const fs = require('fs');
const url = require('url');
const _path = require('path');
//installed MIME type library to avoid manually setting content types
const mimeTypesLookup = require('mime-types').lookup;
//Make Folder Name Global so that it does not change each time server runs
let folderName = '';


const server = http.createServer((request, response) => {

    //Define Variables
    let file = '';
    let mimeType = '';
    let filePath = '';

    //Handle Requests and Send Static Files
    let _URL = url.parse(request.url);
    //strip leading and trailing slashes
    let path = _URL.path.replace(/^\/+|\/+$/g,"");

    if(path == '' || path == 'login'){
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
        console.log('Fetching Resources - ' + file);
    }else
    {
        console.log('Path Does Not Exist - ' + filePath);
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
