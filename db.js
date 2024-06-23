const mysql = require('mysql2/promise.js');

    const connectionSettings= {
        host:'database-1.cx44w4ii80ob.us-east-1.rds.amazonaws.com',
        user:'admin',
        database:'branddb',
        password:'password'
        
    
    }
    const connectPool =  mysql.createPool(connectionSettings)
    

module.exports = connectPool



