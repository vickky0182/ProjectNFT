const {createPool}= require('mysql');

const pool= createPool({
    host:"localhost",
    user:"root",
    password:"aasil",
    database:"nftDB",
    connectionLimit: 10
});

var uid =1023121;


pool.query(`select * from nft where nft_id in (select nft_id from portfolio where user_id =?)`,[uid],(err,res,fields)=>{
    if(err){
        return console.log(err);
    }
    return console.log(res);
})
