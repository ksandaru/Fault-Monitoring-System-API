const express = require("express"); //require("express") return an method. we assign as express
const cors = require("cors");
const logSymbols = require('log-symbols');
const bodyValidation = require("./middleware/bodyValidation");


// const auth = require("./controllers/authController");
// const user = require("./controllers/usersController");
// const division = require("./controllers/divisionController");
// const disaster = require("./controllers/disasterController");
const auth = require("./controllers/authController");
const user = require("./controllers/usersController");
const division = require("./controllers/divisionController");
const fault = require("./controllers/faultController");
const uhfTag = require("./controllers/uhfTagController")


const app = express(); // express() return object. we assign it as app

const PORT = process.env.PORT || 8081;
var corOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders:
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With",
};

// middlewares...........
app.use(cors(corOptions));

//This belogns to requesat posessing pipe line. so we handling req and res by JSON format.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyValidation);

app.use("/uploads", express.static("uploads")); //make uploads folder public & static to route that has url/uploads

// app.use("/api/auth", auth);
// app.use("/api/users", user);
// app.use("/api/divisions", division);
// app.use("/api/disasters", disaster);
app.use("/api/auth", auth);
app.use("/api/uhftags", uhfTag);
app.use("/api/users", user);
app.use("/api/divisions", division);
app.use("/api/faults", fault);
// middlewares end.................

//Testing api
app.get("/", (req, res) => {
  res.json({ messagge: "Hello from API" });
});

//server . this start listing on the given port
app.listen(PORT, () => {
  console.log(
    logSymbols.success + "\x1b[36m%s\x1b[0m",
    ` Server is runing on port ${PORT}`
  );

});
