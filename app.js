const express        = require("express"),
      app            = express(),
      admin          = require("firebase-admin"),
      firebase       = require('firebase')
      require('firebase/auth'),
      serviceAccount = require("./notional-cirrus-228007-firebase-adminsdk-covxu-b262e29fbd.json");

//Firebase initialized
var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://notional-cirrus-228007.firebaseio.com"
});

//Declare a database
const db = admin.firestore();

//Rendering of ejs templates
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(require('body-parser').urlencoded({
  extended: true
}));

//Routes
app.get("/", (req, res, next) => {
  res.render("home");
});

app.get("/form", (req, res, next) => {
  res.render("form");
});

app.post("/form", (req, res, next) => {
  //Storing all the details in an object
  const newUser = ({
    name: req.body.name,
    dob: req.body.dob,
    branch: req.body.branch,
    year: req.body.year,
    sapid: req.body.sapid,
    email: req.body.email,
    pnum: req.body.pnum,
    wnum: req.body.wnum,
    address: req.body.address,
    membership: req.body.membership
  });

  storeData().then(result => {
    const userData = {
      Name: result.name,
      DOB: result.dob,
      Branch: result.branch,
      Year: result.year,
      SapID: result.sapid,
      Email: result.email,
      PhoneNumber: result.pnum,
      WhatsappNumber: result.wnum,
      Address: result.address,
      TypeOfMembership: result.membership
    }
    return db.collection('sampleData')
      .doc(userData.SapID)
      .set(userData)
      .then(() => {
        console.log('Data sent to firestore');
        res.redirect('/');
      })
      .catch((err) => {
        console.log('Error occured',err);
      })
  })
    .catch(err => {
      console.log("No data inserted");
      res.redirect("form");
    })

  //Promise
  function storeData() {
    console.log(newUser);
    return new Promise((resolve, reject) => {
      if (Object.entries(newUser).length === 0 && newUser.constructor === Object){
        reject(null);
      }
      else {
        resolve(newUser);
      }
    })
  }
});

app.get("/display", (req, res, next) => {
  const data = null;
  res.render("display",{data:data});
});

app.post("/display", (req, res, next) => {
  const User = ({
    sapid: req.body.sapid
  });

  fetchData().then((result) => {
    const userData = {
      sapid: result.sapid
    }

    return db.collection('sampleData')
      .doc(userData.sapid)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          res.status(404).send("<p>Data not found </p>");
        } else {
          console.log('Data found');
          const data = doc.data();
          res.render('display',{data:data});
        }
      })
      .catch((err) => {
        console.log('Error occured');
        process.exit();
      })
  })
  .catch(err => {
    console.log("No input provided");
    res.redirect("display");
  })

  function fetchData() {
    console.log(User);
    return new Promise((resolve, reject) => {
      if (User !== null) {
        resolve(User);
      } else {
        reject(null);
      }
    })
  }
})

//Start server
app.listen(3000, () => console.log("Server listening on port 3000"));
