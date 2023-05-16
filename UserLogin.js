const sql = require('msnodesqlv8');

const connectionString = 'server=MIKHAILG\\SQLEXPRESS;Database=BibleApp;Trusted_Connection=Yes;Driver={SQL Server}';
const query_all = 'SELECT * FROM [BibleApp].[dbo].[USERS]';
const query_byUserName = 'SELECT u.username, u.password FROM [BibleApp].[dbo].[USERS] u WHERE u.username='

let Users = {name: '', password: '', createdAt: ''};
let UserArray = [];

async function FetchUsers()
{
    return new Promise( (resolve, reject) =>{
        sql.query(connectionString, query, (error, results) =>
        {
            if(error) return reject(error);
            return resolve(results);
        })
    })

};

async function GetUserByUserName(username)
{
    return new Promise( (resolve, reject) =>{
        sql.query(connectionString,
            `SELECT u.username, u.password FROM [BibleApp].[dbo].[USERS] u WHERE u.username='${username}'`
             , (error, results) =>
        {
            if(error) return reject(error);
            return resolve(results);
        })
    })

};

module.exports = {FetchUsers, GetUserByUserName};