const sql = require('msnodesqlv8');
const bcrypt = require('bcrypt');
const connectionString = 'server=KYLEP\\SQLEXPRESS;Database=BibleApp;Trusted_Connection=Yes;Driver={SQL Server}';

async function GetUserByUserName(username)
{
    return new Promise( (resolve,reject) => {
        sql.query(connectionString,
            `SELECT u.username, u.password FROM USERS u WHERE u.username='${username}'`
            , (error, results) =>{
            if(error){
                reject(error);
            }else{
                resolve(results);
            }
        })
    });
};

async function VerifyLogin(username,password){
    let result = await GetUserByUserName(username);
    if(result.length !== 0)
    {
        let db_password = result[0].password;
        try{
            if(bcrypt.compare(password, db_password))
            {
                return true;
            }
        }catch(error){
            console.log(error);
        }   
    }

    return false;
}

module.exports = {GetUserByUserName, VerifyLogin};