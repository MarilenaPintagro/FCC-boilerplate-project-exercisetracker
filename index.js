const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require("mongoose");
let bodyParser = require('body-parser');


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//mongosetup
const userSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String ,
  
});

var User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date 
}
);

var Exercise = mongoose.model("Exercise", userSchema);


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended: false}));


app.use(function middleware(req, res, next) {
       //console.log(req.method + " " + req.path +" - "+ req.ip );
    next();
}
       );


app.post("/api/users", function (req, res) {
  //console.log(Object.keys(req));
   us = req.body.username;
  //console.log(us);
  const utente = new User({username:us});
  utente.save((err,data)=>{
        
        var ogg = {
          username: data.username,
          _id: data.id
        };
        //console.log(ogg);
         res.json(ogg);
      })
    
});

app.get('/api/users',(req,res)=>{
  var cursor =  User.find({}, 'username _id', function (err, docs) {
    res.send(docs);
  });

 // res.send(cursor);
  /*var lista = [];
  for (let i = 0, len = cursor.length; i < len; i++) {
  lista.push({username: cursor[i]})
} */

});
/*You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
Failed:The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.*/

app.post("/api/users/:_id/exercises", function (req, res) {
  //console.log(Object.keys(req));
  var desc = req.body.description;
  var dur = req.body.duration;
  /*var dat =req.body.date;
  console.log(dat);
  if (typeof dat === 'undefined') {
    dat = new Date.now()
  }*/
  let dat = new Date(req.body.date);
  let dateStr = dat.toDateString();
  
  if(dateStr == 'Invalid Date'){
    dat = new Date(Date.now());
    dateStr = dat.toDateString();
  }
  //Formatto la data
let year = dat.getFullYear();
let month = dat.toLocaleDateString('en-US', {
    month: 'short',
  }) 
let day = ("0" + dat.getDate()).slice(-2);
let dayWeek = dat.toLocaleDateString('en-US', {
    weekday: 'short',
  })  


  //
 // console.log(desc + ' ' + dur + '  ' +dateStr);
        
  var x = User.findOneAndUpdate({_id: req.params._id}, {description: desc,
          duration: dur,
          date: dateStr}, { new: true }, function(err, data) {
   // console.log(data);
        const ese = new Exercise({
          username: data.username,
          description: data.description,
          duration: data.duration,
          date: data.date});
        ese.save(((err,data)=>{}));
        return res.json({
          username: data.username,
          description: data.description,
          duration: data.duration,
          date: data.date,
          _id: data._id

        });
});

   
      
});


app.get('/api/users/:_id/logs?',(req,res)=>{
    console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

      let utente = req.params._id;
      const from = req.query.from;
      const to = req.query.to;
      const limite = req.query.limit;
      var ogg = User.findOne({_id: utente},  function (err, doc){
        let nome = doc.username;
        //console.log(nome);
        var p = null;
        var c = 0;
        console.log(from +  "   " + to + "   " + limite);
        var query_find = {username: nome}
       /* if(!(from === undefined && to === undefined)){
          console.log("quiii");
          query_find = {username: nome, date:{$gte: from, $lte:to}};
        }
        var query_limit = 10000;
        if(! (limite === undefined)){
          console.log("quaaa");
          query_limit = Number(limite);
        }*/
        var x = Exercise.find(query_find).exec( function (err, res2){
          p = res2;
          if(req.query.from && req.query.to){
        p = p.filter((item)=>{
          new Date(item.date).getTime() >= new Date(req.query.from).getTime() && new Date(item.date).getTime() <= new Date(req.query.to).getTime()
        })}
      if(req.query.limit){
        p =p.filter((d,i)=> i < req.query.limit )
        
      }
          c= res2.length;
          console.log("res" + res2.length);
          console.log(p);
          return res.json({
          username: doc.username,
          description: doc.description,
          duration: doc.duration,
          date: doc.date,
          count: c,
          _id: doc._id,
            log: p
                 });
        });
    });
                                                        });


                                                        
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
