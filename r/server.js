const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const flash=require("connect-flash");
const uniqueValidator = require('mongoose-unique-validator');
const async = require("hbs/lib/async");
const { parse } = require("handlebars");
const { path, all } = require("express/lib/application");
const { is } = require("express/lib/request");
let json=express();
let isUser=true;
const userSchema = new Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true,unique:true },
    roles:[{
    nav:{type:String},
    kod:{type:Number},
    ed:{type:String},
    god:{type:Number},
    cena:{type:Number}
    }],
    enterprises:[{
     NameOfTheEnterprise:{type:String},
     phone:{type:String},
     address:{type:String},
     Status:{type:String}
    }],
    expenseAndIncomes:[{
        data:String,
        kol:Number,
        NumberDocument:Number,
        nav:String,
        kod:Number,
        cena:Number,
        dataPurchase:String
    }]
  });
  userSchema.plugin(uniqueValidator);
mongoose.connect("mongodb://localhost:27017/NewsUsersdb",{useUnifiedTopology: true, useNewUrlParser: true} );
  const User = mongoose.model("User", userSchema);
const db=mongoose.connection;

db.on("error",console.log.bind(console,"connection error"));

db.once("open",function(callback){
    console.log("connetction succeeded");
});

const app=express();
const Users=db.collection("details");
app.use(bodyParser.json());
app.use(express.static(__dirname+"/views"));
app.set("view engine", "hbs");
app.set("view engine", "ejs");
app.use(flash());
app.use(bodyParser.urlencoded({
   extended:true
}));
let Name="";
app.post('/sign_up',function (req,res){
    Name = req.body.name;
    const pass = req.body.password;
    const user=new User({name:Name,password:pass});
    Users.find({"name":Name,"password":pass}).toArray((err,doc)=>{
        if (doc && doc.length)
                {
                 
                     res.render("warehouse.hbs",{
                        User:isUser,
                        isn:"Пользователь существует"
                    });     
                }
                else
                {
                   db.collection("details").insertOne(user,function(err,client){
                       if(err) throw err;
                       res.render("add/add.hbs",{
                        title:Name
                    });
                   })           
               
              }
    })
});

app.post('/sign_in',(req,res)=>{
    Name = req.body.name;
    const pass = req.body.password;
    db.collection('details').find({"name":Name,"password":pass}).toArray((err,doc)=>{
        if (doc && doc.length) 
                {
                     res.render("add/add.hbs",{
                         title:Name,
                     });
                                  
                }
                else 
                { 
                    res.render("warehouse.hbs",{
                    User:isUser,
                    isn:"Пользователь  не существует"
                });
                     
              }
    })
})
let kod=0,
    navEnterprise="",
    cena=0;
app.post("/sklad",(req,res)=>{
    const name=Name;
     kod=req.body.kod;
     cena=req.body.cena 
    const t={
         nav:req.body.nav,
         ed:req.body.ed,
         kod:kod,
         cena:cena,
         god:req.body.god,
       
    }
    json=JSON.stringify(t);
    let pers=JSON.parse(json);

    db.collection("details").findOneAndUpdate({name},{$addToSet:{roles:json}}) 
    res.render("add/add.hbs",{
        title:Name
    });
  
})
app.post("/enteprise",(req,res)=>{
    const name=Name;
    navEnterprise=req.body.nav;
    const t={
        nav:navEnterprise,
         phone:req.body.tel,
         addres:req.body.address,
         status:req.body.status
    }
     json=JSON.stringify(t);
    let pers=JSON.parse(json);
    db.collection("details").findOneAndUpdate({name},{$push:{enterprises:json}})
    res.render("add/add.hbs",{
        title:Name
    })

})
app.post("/Income",(req,res)=>{
    const name=Name;
    const t={
    kod:kod,
    data:req.body.data,
    nav:navEnterprise,
    kol:req.body.kol,
    cena:cena,
    NumberDocument:req.body.NumberDocument,
    dataPurchase:req.body.dataPurchase
}
    json=JSON.stringify(t);
    let pers=JSON.parse(json);
    console.log(pers["nav"])
    db.collection("details").findOneAndUpdate({name},{$push:{expenseAndIncomes:json}})
    res.render("expenseAndIncome/expenseAndIncome.hbs",{
        title:name,
        kod:pers["kod"],
        nav:pers["nav"],
        kol:pers["kol"],
        data:pers["data"],
        cena:pers["cena"],
        dataPurchase:pers["dataPurchase"],
        NumberDocument:pers["NumberDocument"],
        sums:pers["kol"]*pers["cena"]
    })
    
        
});
app.get("/getdetails",(req,res,next)=>{
    const name=Name;
    Users.find({name}).toArray(function (err, allDetails) {
        json=JSON.stringify(allDetails);
        let pers=JSON.parse(json);

        if (err) {
            console.log(err);
        } else {
            res.render("lk/lk.ejs", { 
                details: pers,
                name:name,
                sum:0,
                sums:0,
                kol:1
            })
        }
    })
});
app.get("/main",(req,res)=>{
    const name=Name;
    res.render("add/add.hbs",{
        title:name
    });
})
app.get('/',function(req,res){
    res.set({
        'Access-control-Allow-Origin': '*'
        });
    return res.render('warehouse.hbs',{
        name:"Авторизация"
    });
    }).listen(3000)
    console.log("server listening at port 3000");

