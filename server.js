const http = require('http');
const fs = require('fs');
const url = require('url');
const _path = require('path');
//installed MIME type library to avoid manually setting content types
const mimeTypesLookup = require('mime-types').lookup;


const server = http.createServer((request, response) => {

    //Define Variables
    let file = '';
    let folderName = '';
    let mimeType = '';

    //Handle Requests and Send Static Files
    let _URL = url.parse(request.url);

    //strip leading and trailing slashes
    let path = _URL.path.replace(/^\/+|\/+$/g,"");

    if(path == '' || path == 'login'){
        path = 'login.html';
    }
    //Resolve Folder and MIME Type
    folderName = handleFolderName(path);
    mimeType = mimeTypesLookup(path);

    if(fs.existsSync(__dirname + `/app/pages/${folderName}/`+path))
    {
        file = __dirname + `/app/pages/${folderName}/`+path;
        console.log('Fetching Resources - ' + file);
    }else
    {
        console.log('Path Does Not Exist - ' + __dirname + `/app/pages/${folderName}/`+path);
        file = __dirname + `/app/pages/error/error.html`;
    }
    
    fs.readFile(file, function(err, content){
        if(err){
            console.log(err);
            response.writeHead(404);
            response.end();
        }else{
            console.log(`Returning Path ${path}`);
            response.writeHead(200, {'Content-type':mimeType});
            response.end(content);
        }
    })
    
});

function handleFolderName(path){
    if(path.includes('.html'))
    {
        return path.replace('.html','');
    }
    else if(path.includes('.css'))
    {
       return path.replace('.css','');
    }
    else if(path.includes('.js'))
    {
       return path.replace('.js','');
    }

    return '';
}

server.listen(8080, 'localhost', () => {
    console.log('Server is listening on port 8080');
});

