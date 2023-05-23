const sql = require('msnodesqlv8');
const bcrypt = require('bcrypt');
const connectionString = 'server=KYLEP\\SQLEXPRESS;Database=BibleApp;Trusted_Connection=Yes;Driver={SQL Server}';

async function AddUser(username,password)
{
    const hashedPassword = await EncryptPassword(password);
    return new Promise( (resolve, reject) =>{
        sql.query(connectionString,
            `INSERT INTO dbo.USERS (username, password)
             VALUES ('${username}','${hashedPassword}');`
        , (error, results) =>
        {
            if(error) return reject(error);
            return resolve(results);
        })
    })

};

async function RegisterUser(username,password){
    let result = await AddUser(username,password);
    console.log(result);
}

async function EncryptPassword(password){
    //Encrypt Password using BCrypt
    try{
        let salt = await bcrypt.genSalt();
        let hashedPassword = await bcrypt.hash(password,salt);
        return hashedPassword;
    }catch(error){
        throw error;
    }

}

module.exports = {RegisterUser};

