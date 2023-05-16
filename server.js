const http = require('http');
const fs = require('fs');
const url = require('url');
const _path = require('path');
const UserLogin = require('./UserLogin');
const { type } = require('os');
const mimeTypesLookup = require('mime-types').lookup;
let folderName = '';
let LoginSuccess = false;


const server = http.createServer((request, response) => {
    let file = '';
    let mimeType = '';
    let filePath = '';
    let body = '';

    let _URL = url.parse(request.url);
    let path = _URL.path.replace(/^\/+|\/+$/g,"");

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
    
    // if(path == 'UserLogin')
    // {
    //     let user = '';
    //     console.log('User Attempting To Login...');
    //     const { headers, method, url } = request;
    //     request.on('error', (err) => {
    //       console.error(err);
    //     }).on('data', (chunk) => {
    //       body += (chunk);
    //     }).on('end', () => {
    //       body = JSON.parse(body);
    //       console.log(body);//IDK why but i need this to access the props??
    //       console.log(body.username);
    //       console.log(body.password);

    //       user = {username: body.username, password: body.password};
    //       console.log(user);

    //     UserLogin.GetUserByUserName(user.username)
    //     .then( (val) =>{

    //         console.log(val);

    //         let dbResult = val[0];

    //         console.log(dbResult.username);
    //         console.log(dbResult.password);

    //         if(body.username == dbResult.username)
    //         {
    //             if(body.password == dbResult.password)
    //             {
    //                 console.log('USER NAME AND PASSWORD MATCH..');
    //                 LoginSuccess = true;
    //             }
    //         }
    //     })
    //     .catch(err => console.log(err));
    //     });
    // }



    mimeType = mimeTypesLookup(path);

    console.log(filePath);

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
