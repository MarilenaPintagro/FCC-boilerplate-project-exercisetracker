const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require("mongoose");
let bodyParser = require('body-parser');


mongoose.connect("mongodb+srv://utente1:pippo@freecodecamp1.0uejngy.mongodb.net/freecodecamp1?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

//mongosetup
const userSchema = new mongoose.Schema({
  username: String,
  excercise: {
        username: String,
        description: String,
        duration: Number,
        date: Date 
    }
});

var User = mongoose.model("User", userSchema);


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
  console.log(us);
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
  var dat =req.body.date;
  console.log(dat);
  if (typeof dat === 'undefined') {
    dat = new Date()
  }
  console.log(desc + ' ' + dur + '  ' +dat);
        
  var ogg = {
          description: desc,
          duration: dur,
          date: dat,
        };
  var ut = new User();
  ut.exercise = ogg;
  console.log(req.params._id);
        
  var x = User.findOneAndUpdate({_id: req.params._id}, {exercise: ogg}, { new: true },               function(err, data){
    if (err) console.log(err);
                                   
       
                                 });
User.findById(req.params._id, function(err, data) {
    if (err) return console.log(err);
  console.log(data);
    res.send(data);
})
   
      
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
