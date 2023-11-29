//SETUP

const express = require("express");
const bodyParser = require("body-parser");
const {createPool}= require('mysql');

const app=  express();
const upload = require("express-fileupload");

app.use(upload());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');


const pool= createPool({
    host:"localhost",
    user:"root",
    password:"password",
    database:"nftDB",
    connectionLimit: 10
});



//--------------------------------------------------------------------------------------------------------------------------
var queryData;

var UID =1023121;

pool.query(`select * from user where user_id =?`,[UID],(err,res,fields)=>{
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
    
    pool.query(`select * from nft where nft_id in (select nft_id from portfolio where user_id =?)`,[UID],(err,resq,fields)=>{
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
    var collectioncheck  = req.body.collectioncheck;
    console.log(collectioncheck)
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
        
        
        if (collectioncheck=="singlenft")
        {
            console.log("SINGLE NFT ")
            if (req.files){
                // console.log(req.files);
                const featureArray = features.split(",");
            
                console.log(featureArray);
            
                console.log(name,genre, celebrity, desc, price, features, blockchain   );
                
                var file= req.files.file;
                var filename= file.name;
                console.log(filename);
            
                file.mv('./html/nft_resources/nft/'+newFilename, function(err){
                    if (err){
                        res.send(err);
                    }else {
            
                        pool.query(`insert into nft values(?,?,?,?,?,?,?,0)`,[parseInt(newNFTid),name,genre,celebrity,desc,price,blockchain],(err,resq,fields)=>{
                            
                            if(err){
                                return console.log(err);
                            }
                            pool.query(`insert into portfolio values(?,?)`,[UID,parseInt(newNFTid)],(err,resq,fields)=>{
                            
                                if(err){
                                    return console.log(err);
                                }
                                for (var i =0 ; i<featureArray.length; i++)
                            {
                                pool.query(`insert into nft_features values(?,?)`,[parseInt(newNFTid),featureArray[i]],(err,resq,fields)=>{
                                    if(err){
                                        return console.log(err);
                                    }
                                    return ;
                                })
                            }
                                return ;
                            })
                            return ;
                        })
                    }
                })
            
            }
        }
        else{
            mulfiles=req.files.file;
         if (mulfiles){
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
            
            for (var i=0 ; i<mulfiles.length; i++){

            pool.query(`insert into nft values(?,?,?,?,?,?,?,0)`,[idIncrementedq1++,(name +" #"+(idIncrementedq1-1).toString()),genre,celebrity,desc,price,blockchain],(err,resq,fields)=>{
                
                if(err){
                    return console.log(err);
                }
                
                pool.query(`insert into portfolio values(?,?)`,[UID,idIncrementedq2++],(err,resq,fields)=>{
                
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

       
        }
    }
        res.render("nftcreated");


        return ;
    });

});


app.post("/listnft",(req,res)=>{
    var nft_id  = req.body.id;
    var nftname  = req.body.nftname;
    var onsale= req.body.onsale;

    console.log(nft_id,nftname)
    
    if(onsale==1){
        res.render("alreadyonsale");
    }
    else{
    res.render("listnft",{nftname:nftname,nft_id:nft_id, userid:UID});
    }
});

app.post("/sell",(req,res)=>{
    var nft_id  = req.body.id;
    var price= req.body.price;
    var duration= req.body.duration;
  
    // res.send(nft_id+"<br>"+selloption+"<br>"+price+"<br>"+duration)
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy+'-'+mm+'-'+dd;
    console.log(today);

    pool.query(`insert into onsale values(?,?,?,?)`,[nft_id,price,duration,today],(err,resq,fields)=>{
        if(err){
            return console.log(err);
        }
        pool.query(`update nft set onsale =1 where nft_id=(?)`,[nft_id],(err,resq,fields)=>{
            if(err){
                return console.log(err);
            }
            
            res.render ("nftlisted");
    
            return ;
        })
        return ;
    })
});

// app.get("/buynft",(req,res)=>{
    
//     let nft_id= req.query['nftid'];

//     console.log("nftid="+nft_id);

//     pool.query(`select price from onsale where nft_id=(?)`,[nft_id],(err,resq,fields)=>{
//     if(err){
//         return console.log(err);
//     }
    

//     priceData=JSON.parse(JSON.stringify(resq));

//     var newprice= priceData[0].price;
    
// // pool.query(`delete from onsale where nft_id=(?)`,[nft_id],(err,resq,fields)=>{
// //     if(err){
// //         return console.log(err);
// //     }
// //     pool.query(`delete from portfolio where nft_id=(?)`,[nft_id],(err,resq,fields)=>{
// //         if(err){
// //             return console.log(err);
// //         }
// //         pool.query(`insert into portfolio values(?,?)`,[UID,nft_id],(err,resq,fields)=>{
// //             if(err){
// //                 return console.log(err);
// //             }
            
// //             pool.query(`update nft set price=? where nft_id=(?,?)`,[newprice,nft_id],(err,resq,fields)=>{
// //                 if(err){
// //                     return console.log(err);
// //                 }
                
// //                 res.render ("nftpurchased");
        
// //                 return ;
// //             })
    
// //             return ;
// //         })

// //         return ;
// //     })
// //     return ;
// // })


//     // return ;
// })    

    
// });

app.post("/aboutnft",(req,res)=>{
    var nft_id  = parseInt(req.body.id);
    app.use(express.static(__dirname + '/html/css'));
    app.use(express.static(__dirname +'/html'));
   
    // res.send(nft_id+"<br>"+selloption+"<br>"+price+"<br>"+duration)

    pool.query(`select * from nft where nft_id =?`,[nft_id],(err,resq,fields)=>{
        var featureData=""
        if(err){
            return console.log(err);
        }
        queryData=JSON.parse(JSON.stringify(resq));
        
        console.log("TEST PRINT " ) ;
        console.log (queryData);
        
        pool.query(`select * from nft_features where nft_id=?`,[nft_id],(err,resq,fields)=>{
            if(err){
                return console.log(err);
            }
            featureData=JSON.parse(JSON.stringify(resq));
            console.log(featureData);

            pool.query(`select * from onsale where nft_id=?`,[nft_id],(err,resq,fields)=>{
                if(err){
                    return console.log(err);
                }
                saleData=JSON.parse(JSON.stringify(resq));
                console.log(saleData);

                var today = new Date();
                var dd = parseInt(String(today.getDate()).padStart(2, '0'));
                var mm = parseInt(String(today.getMonth() + 1).padStart(2, '0')); //January is 0!
                currday= ((mm-1)*30)+dd;

                sdd=parseInt(saleData[0].startdate.slice(8,10));
                smm=parseInt(saleData[0].startdate.slice(5,7));
                startday= ((smm-1)*30)+sdd;
                
                daystaken= parseInt(currday)-parseInt(startday);

                var remainingTime=saleData[0].duration- daystaken;

                res.render("aboutnft",{Q:queryData,S:saleData,F:featureData,remainingTime:remainingTime});
    
    
            })
    

        })

        return ;
    })
});


app.listen(3000, function(){
    console.log ("server started on port 3000");
}); 