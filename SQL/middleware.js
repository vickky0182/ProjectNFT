//SETUP

const express = require("express");
const bodyParser = require("body-parser");
const {createPool}= require('mysql');

const app=  express();
const upload = require("express-fileupload");
const e = require("express");

app.use(upload());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');


const pool= createPool({
    host:"localhost",
    user:"root",
    password:"aasil",
    database:"nftDB",
    connectionLimit: 10
});



//--------------------------------------------------------------------------------------------------------------------------
var queryData;

var uid =1023121;

pool.query(`select * from user where user_id =?`,[uid],(err,res,fields)=>{
    if(err){
        return console.log(err);
    }
    userdata=JSON.parse(JSON.stringify(res));
    console.log("TEST PRINT user data " ) ;
    console.log (userdata);

    return ;
})


app.get("/profile", function(req,res){
    var size;
    app.use(express.static(__dirname + '/html/css'));
    app.use(express.static(__dirname +'/html'));
    
    pool.query(`select * from nft where nft_id in (select nft_id from portfolio where user_id =?)`,[uid],(err,resq,fields)=>{
        if(err){
            return console.log(err);
        }
        queryData=JSON.parse(JSON.stringify(resq));
        
        console.log("TEST PRINT " ) ;
        console.log (queryData);
        
        size=queryData.length;   
        res.render("profile",{query:queryData, siz:size,userdata:userdata});

        return ;
    })

    
  
});


app.get("/createnft", function(req,res){
    app.use(express.static(__dirname + '/html/css'));
    app.use(express.static(__dirname +'/html'));
           
       res.render("createnft",{userdata:userdata});
    });



app.post("/createnft",(req,res)=>{


    //update nft, portfolio, nft_features
    var name  = req.body.name;
    var genre  = req.body.genre;
    var celebrity  = req.body.celebrity;
    var desc = req.body.desc;
    var price = req.body.price;
    var features= req.body.features;
    
    var blockchain = req.body.blockchain;
  
    var newFilename="Default";

   pool.query(`select max(nft_id) as max from nft;`,async (err,resq,fields)=>{
        
        if(err){
            return console.log(err);
        }
        newid=JSON.parse(JSON.stringify(resq));
        console.log("\nTEST PRINT NEW id" ) ;
        newFilename=parseInt(newid[0].max)+1;

        newNFTid=newFilename;
        newFilename=newNFTid.toString()+".jpg";
        
        mulfiles=req.files.file;
        if (mulfiles.length==undefined)
        {
            file.mv('./html/nft_resources/nft/'+i.toString()+".jpg")
        }
        else if (mulfiles){
            numOfNFTs= mulfiles.length;
            console.log(mulfiles);
            console.log("Number of files: ",numOfNFTs);

            var i =newNFTid;
            const promises=mulfiles.map((file)=>{
                const savePath=    ('./html/nft_resources/nft/'+i.toString()+".jpg");
                i++;
                return file.mv(savePath);
            })
            
            await Promise.all(promises);


            const featureArray = features.split(",");
            // console.log(featureArray);

            console.log(name,genre, celebrity, desc, price, features, blockchain   );
            
            

            var idIncrementedq1=newNFTid;
            var idIncrementedq2=newNFTid;
            var idIncrementedq3=newNFTid;
            
            for (var i=0 ; i<mulfiles.length; i++){

            pool.query(`insert into nft values(?,?,?,?,?,?,?)`,[idIncrementedq1++,(name +" #"+(idIncrementedq1-1).toString()),genre,celebrity,desc,price,blockchain],(err,resq,fields)=>{
                
                if(err){
                    return console.log(err);
                }
                
                pool.query(`insert into portfolio values(?,?)`,[uid,idIncrementedq2++],(err,resq,fields)=>{
                
                    if(err){
                        return console.log(err);
                    }
                    // return ;
                })
              
                return;
            })
        }
        
        var sql = "INSERT INTO nft_features (NFT_id,  features) VALUES ?";
        var values = [];
        var n = numOfNFTs;
        var ii=0;
        for (var ii=0; ii< n; ii++)
        {
            for (var i=0 ; i< featureArray.length; i++){ 
            values.push([newNFTid+ii,featureArray[i]]);  
        }
        
        }
        console.log(values);
        
            pool.query(sql, [values],(err,resq,fields)=>{
                if(err){
                    return console.log(err);
                }
                return;                          
            })
            res.render("nftcreated");

       
        }
        

        return ;
    });

});





app.listen(3000, function(){
    console.log ("server started on port 3000");
}); 