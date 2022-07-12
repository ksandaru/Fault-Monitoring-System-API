const Joi = require("joi");
const validateWith = require("../middleware/validation");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const passwordGenerator = require("generate-password");
const verifyToken = require("../middleware/verifyToken");
const nodemailer = require("nodemailer");
const querystring = require("querystring");
const multer = require("multer");
const fs = require("fs");
const customEmail = require("./email");

const dayjs = require("dayjs");
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const ROLE = require("../config/roleEnum");
const imgHelper = require("../helpers/imageFilter");

const {
  uploadAvatar,
  deleteAvatar,
  deleteAllAvatar,
} = require("../services/firebase");

const Multer = multer({
  storage: multer.memoryStorage(),
  limits: 1024 * 1024 * 5,
  fileFilter: imgHelper.imageFilter,
});

const db = require("../models");
const Login = db.login;
const UserProfile = db.userProfile;
const Division = db.division;

const schema = Joi.object({
  fullName: Joi.string(),
  status:Joi.string(),
  nic: Joi.string(),
  district: Joi.string(),
  city: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string(),
  avatar: Joi.any(),
});

//changed
const rfid_tagSchema = Joi.object({
  divisionId: Joi.number().required(),
  fullName: Joi.string().required(),
  city: Joi.string().required(),
  status:Joi.string().required(),
});

const schemaRegisterStep1 = Joi.object({
  divisionID: Joi.number().required(),
  nic: Joi.string().min(10),
  email: Joi.string().email(),
});

const signOutSchema = Joi.object({
  email: Joi.string().email().required(),
});

//Sign out
router.post(
  "/signout",
  verifyToken,
  validateWith(signOutSchema),
  async (req, res) => {
    const { email } = req.body;
    const user = await Login.findOne({ where: { email: email } });
    if (user) {
      //Update status,lastLogin
      user.set({
        lastLogin: Date.now(),
        status: "offline",
      });
      await user.save();
      return res.status(200).send({ data: `${email} Signed out` });
    }
    /*
    cannot manually expire a token after it has been created.
    Thus, you cannot log out with JWT on the server-side as you do with sessions.
    JWT is stateless, meaning that you should store everything you need in the payload
    and skip performing a DB query on every request.
    */
    return res
      .status(400)
      .send({ error: "A user with the given email not exists." });
  }
);

//Sign Up step 01 - admin make account
router.post(
  "/makeAccount/:role",
  validateWith(schemaRegisterStep1),
  async (req, res) => {
    const role = req.params.role;
    const { nic, email, divisionID } = req.body;

    //Validate Role
    switch (role) {
      case ROLE.OPERATOR:
        break;
      case ROLE.RFID_TAG:
        break;
      case ROLE.ADMIN:
        break;
      default:
        return res.status(400).send({ error: "Error! Invalid user type" });
    }

    //Check division already exists
    const di_res = await Division.findOne({
      where: { id: divisionID },
    });
    if (!di_res)
      return res.status(400).send({
        error: `There are No divisions found for given ID`,
      });

    //Check email already exists
    const lo_res = await Login.findOne({
      where: { email: email },
    });
    if (lo_res)
      return res.status(400).send({
        error: `Account already exits for given email address: ${email}`,
      });
    //Check NIC already exists
    const lo_userP = await UserProfile.findOne({
      where: { nic: nic },
    });
    if (lo_userP)
      return res.status(400).send({
        error: `Account already exits for given NIC: ${nic}`,
      });

    //Genarate random password
    const userPassword = passwordGenerator.generate({
      length: 7,
      numbers: true,
    });

    //Default/Initial avatar
    let imageFile = "uploads\\userempty.png"; //req.file.path;

    //store in Db
    encryptedPassword = await bcrypt.hash(userPassword, 5);
    let uData = {
      userProfile: {
        fullName: "",
        nic: nic,
        district: "",
        city: "",
        divisionId: divisionID,
        login: {
          username: "",
          email: email,
          password: encryptedPassword,
          role: "",
          avatar: imageFile,
        },
      },
    };

    switch (role) {
      case ROLE.OPERATOR:
        uData.userProfile.login.role = ROLE.OPERATOR;
        break;
      case ROLE.ADMIN:
        uData.userProfile.login.role = ROLE.ADMIN;
        break;
      case ROLE.RFID_TAG:
        uData.userProfile.login.role = ROLE.RFID_TAG;
        break;
      default:
        return res.status(400).send({ error: "Error! Invalid user type" });
    }

    //status , lastLogin has default values no need to set here
    //Create user
    newUser = await UserProfile.create(uData.userProfile, {
      include: [Login],
    });

    if (!newUser)
      return res
        .status(400)
        .send({ error: "Error! Server having some troubles" });

    const tempuser = {
      email: email, //Email that send with request.
      name: nic,
      password: userPassword, // tempory password
    };

    /** Two things do before send emails:
       1. Enable Less secure app access 
          https://myaccount.google.com/lesssecureapps

      2.Allow access to your Google account   
          https://accounts.google.com/b/0/DisplayUnlockCaptcha
    */
    sendMail(tempuser, "new-account", "WIRELESS-FAULT-MONITORING Account!", (info) => {
      return res.status(200).send({
        data: `Done! Account Created for ${nic} and email has been sent to ${email}`,
      });
    });
  }
);

// Sign Up step 02 - user continue registration
// OR can use to Update user's details
router.patch(
  "/register",
  Multer.single("avatar"),
  uploadAvatar,
  async (req, res) => {
    //Check admin make account for this user
    const lo_343 = await UserProfile.findOne({
      where: { nic: req.body.nic },
      attributes: ["id"],
      include: {
        model: Login,
        attributes: ["id", "avatar", "isActive"],
        where: { email: req.body.email },
      },
    });

    if (!lo_343) {
      //Remove uploaded image
      // ....todo...
      //Send error
      return res.status(400).send({
        error: `Already Registered for given NIC: ${req.body.nic} and given email ${req.body.email}`,
      });
    }

    //store in Db
    // encript new password
    encryptedPassword = await bcrypt.hash(req.body.password, 5);

    //If user doesn't provide file or uplaoded error Set default avatar already in bucket
    const avatar = req.file
      ? req.file.firebaseUrl
      : "http://storage.googleapis.com/gfod-app.appspot.com/avatars/default-avatar.png";

    let uData = {
      fullName: req.body.fullName,
      nic: req.body.nic,
      district: req.body.district,
      city: req.body.city,
      email: req.body.email,
      avatar: avatar,
    };

    // Managed transactions (Committing and rolling back the transaction done automatically) : https://sequelize.org/master/manual/transactions.html

    //Begin Unmanaged Transaction (Committing and rolling back the transaction done manually):::::::::::::::::::::::::::::::::::::::::::::
    const t = await db.sequelize.transaction();
    try {
      //Set UserProfile data
      newUserProf = await UserProfile.findOne({
        where: { nic: uData.nic },
      });
//------------------------
      newUserProf.set({
        fullName: uData.fullName,
        district: uData.district,
        city: uData.city,
      });
      await newUserProf.save();

      //Set new Login password
      newUserLog = await Login.findOne({
        where: { email: uData.email },
      });

      newUserLog.set({
        username: uData.fullName,
        password: encryptedPassword,
        avatar: uData.avatar,
        isActive: true,
      });
      await newUserLog.save();

      if (!newUserLog) {
        await t.rollback(); //End & rollback the transaction.
        return res
          .status(400)
          .send({ error: "Error! Server having some troubles" });
      }

      await t.commit(); // End & commit the transaction.
      const tempuser = {
        email: uData.email, //Email that send with request.
        name: newUserLog.username,
        password: req.body.password,
      };

      return res.status(200).send({
        data: `${tempuser.email} (${uData.nic}) has been registered as a ${newUserLog.role}`,
      });
    } catch (error) {
      await t.rollback(); //End & rollback the transaction.
      console.log(error);
      //Remove uploaded file from ./uploads folder
      //code :
      //file removed success
      return res
        .status(400)
        .send({ error: "Error! Data didn`t saved, Try again" });
    }
    // END transaction :::::::::::::::::::::::::::::::::::::::::::::

    /* Simulate slow N/W
      setTimeout(() => { todo()
        }, 1000);
  */
  }
);
//changed
router.post(
  "/add-rfid-tag",
  checkDivision,
  validateWith(rfid_tagSchema),
  async (req, res) => {
    let data = req.body;
    // IF div returned from checkDivision
    //   const division = res.division;
    const findRfid_tag = await UserProfile.findOne({
      where: { fullName: data.fullName },
    });
    //changed
    if (findRfid_tag)
      return res
        .status(400)
        .send({ error: "RFID Tag already exist with given NIC number" });

    const loginData = {
      username: "-",
      email: "-",
      password: "-",
      nic:"-",
      role: ROLE.RFID_TAG,//changed
      avatar:
        "https://storage.googleapis.com/wfm-ugp.appspot.com/avatars/default-avatar.png",
    };
    data.login = loginData;

    const saveRfid_tag = await UserProfile.create(data, {
      include: [Login],
    });
    if (!saveRfid_tag)
      return res.status(400).send({ error: "Error! Couldn't save RFID Tag" });
    return res.status(201).send({ data: "RFID Tag saved successfully!" });
  }
);

router.patch(
  "/update-rfid-tag/:profileId",//changed
  async (req, res) => {
    const profileId = req.params.profileId;
    const reqData = req.body;

    const result = await UserProfile.findOne({
      where: { id: profileId},
    });
    if (!result)
      return res.status(400).send({
        error: "Tag not found for given Profile ID and division ID",
      });
//---------------------
    result.set({
      fullName: reqData.fullName,
      status:reqData.status,
      city: reqData.city,
    });
    updateC = await result.save();

    if (!updateC)
      return res
        .status(400)
        .send({ error: "Error! Server having some troubles" });

    return res.status(200).send({
      data: `Tag has been updated successfuly`,
    });
  }
);

router.get("/get", async (req, res) => {
  const users = await UserProfile.findAll({
    attributes: { exclude: ["loginId", "createdAt", "updatedAt"] },
    include: {
      model: Login,
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    },
  });

  if (users) res.status(200).send({ data: users });
});

router.get("/get/:id", async (req, res) => {
  const loginId = req.params.id;

  const users = await UserProfile.findOne({
    where: {
      loginId: loginId,
    },
    include: [
      {
        model: Login,
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      },
      {
        model: Division,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });
  if (!users) return res.status(400).send({ error: "No any user found." });

  res.status(200).send(users);
});

router.get("/getByProfId/:id", async (req, res) => {
  const profileId = req.params.id;

  const user = await UserProfile.findOne({
    where: {
      id: profileId,
    },
    include: [
      {
        model: Login,
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      },
      {
        model: Division,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });
  if (!user) return res.status(400).send({ error: "No any user found." });

  let obj = {
    id: "",
    fullName: "",
    status: "",
    nic: "",
    district: "",
    city: "",
    voteEligible: "",
    age:"",
    createdAt: "",
    updatedAt: "",
    loginId: "",
    divisionId: "",
    login: {},
  };

  obj.id = user.id;
  obj.fullName = user.fullName;
  obj.status = user.status;
  obj.nic = user.nic;
  obj.district = user.district;
  obj.city = user.city;
  obj.createdAt = user.createdAt;
  obj.updatedAt = user.updatedAt;
  obj.loginId = user.loginId;
  obj.divisionId = user.divisionId;
  obj.login = user.login;
  obj.division = user.division;


  res.status(200).send(obj);
});

router.get("/getByRole/:role/:voteEli/:divId", async (req, res) => {
  const role = req.params.role;
  const voteEliList = req.params.voteEli;
  const divId = req.params.divId;

  let divWhere = {};
  if (divId != "all") divWhere = { status: divId };

  //Validate Role
  switch (role) {
    case ROLE.OPERATOR:
      break;
    case ROLE.ADMIN:
      break;
    case ROLE.RFID_TAG:
      break;
    default:
      return res.status(400).send({ error: "Error! Invalid user type" });
  }
  const getPlainData = (records) =>
    records != null ? records.map((record) => record.get({ plain: true })) : [];

  let users = await UserProfile.findAll({
    where: divWhere,
    include: {
      model: Login,
      where: {
        role: role,
      },
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    },
  }).then(getPlainData);
  if (!users) return res.status(400).send({ error: "No any user found." });

  // Add new properteis
  // users.forEach(function (o) {
  //   (o.age = "0"), (o.voteEligible = "No");
  // });

  // users.map((o) => {
  // users.map((o) => {
  //   o.age = dayjs(o.dob).from(dayjs(dayjs.utc().format()), true);
  //   o.voteEligible = "No";
  //   if (o.age.includes("years") && o.age.replace("years", "").trim() >= 20)
  //     o.voteEligible = "Yes";
  //   else o.voteEligible = "No";
  // });

  let abc = [];

  switch (voteEliList) {
    case "all":
      abc = users;
      break;
    case "true":
      abc = users.filter((o) => o.voteEligible == "Yes");
      break;
    case "false":
      abc = users.filter((o) => o.voteEligible == "No");
      break;
  }

  res.status(200).send({ data: abc });
});

router.get("/my-user-profile-id/:loginId", async (req, res) => {
  const loginId = req.params.loginId;
  const user = await UserProfile.findOne({
    where: {
      loginId: loginId,
    },
  });
  if (!user) return res.status(400).send({ error: "No any user found." });

  return res.status(200).send({ userProfileId: user.id });
});

router.post("/sendmail", (req, res) => {
  console.log("request came");
  let user = req.body;
  sendMail(user, "e-verify", "Test subject", (info) => {
    console.log(`The mail has been send 😃 and the id is ${info.messageId}`);
    res.send(info);
  });
});

router.get("/e-verify/:loginId", async (req, res) => {
  const loginId = req.params.loginId;

  const user = await Login.findOne({ where: { id: loginId } });
  if (!user) return res.status(400).send({ error: "Invalid user LoginID" });

  //Update last login
  user.set({
    isActive: 1,
  });

  await user.save();
  return res.status(200).send(customEmail(0, user.name, "", "acc-activated"));
  //return res.status(200).send({ data: `${user.email} Account Activated` });
});

//Forget Password
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const user = await Login.findOne({ where: { email: email } });
  if (!user)
    /*Do not nofify invaid user mail provided, thus,:-*/ return res
      .status(200)
      .send({ data: "Password will be Rest soon...!" });

  const newPsw = passwordGenerator.generate({
    length: 7,
    numbers: true,
  });

  encryptedPws = await bcrypt.hash(newPsw, 4);

  //Update last login
  user.set({
    password: encryptedPws,
    isPasswordReset: true,
  });
  await user.save();

  const tempuser = {
    email: email, //Email that send with request.
    name: user.username,
    password: newPsw, // tempory password
  };

  sendMail(tempuser, "reset-psw", "Password reset succussfully!", (info) => {
    return res.status(200).send({
      data: "password has been reset Succussfully",
    });
  });
});

//Update Password
router.post("/update-password", async (req, res) => {
  const { loginId, oldPsw, newPsw } = req.body;

  const user = await Login.findOne({ where: { id: loginId } });
  if (!user) return res.status(400).send({ data: "Invalid loginID" });

  //Verify old password
  bcrypt.compare(oldPsw, user.password, async (err, result) => {
    if (result === false)
      return res.status(400).send({ error: "Previouse password not valid!" });

    encryptedPws = await bcrypt.hash(newPsw, 4);

    //Update last login
    user.set({
      password: encryptedPws,
      isPasswordReset: false,
    });
    await user.save();

    return res.status(200).send({ data: "Password updated successfully" });
  });
});

router.get("/count", async (req, res) => {
  let RFIDtags = 0; //changed
  let Operators = 0;
  let divisions = 0;

  await Login.count({
    where: {
      role: "Rfid_tag",
    },
  }).then((c) => {
    RFIDtags = c;
  });

  await Login.count({
    where: {
      role: "Operator",
    },
  }).then((c) => {
    Operators = c;
  });
  await Division.count().then((c) => {
    divisions = c;
  });
  res
    .status(200)
    .send({ RFIDtagCount: RFIDtags, OperatorCount: Operators, DivisionsCount: divisions });
});

router.get("/getMyDivisionId/:loginId", async (req, res) => {
  const loginId = req.params.loginId;

  const user = await Login.findOne({ where: { id: loginId } });
  if (!user) return res.status(400).send({ error: "Invalid user LoginID" });

  const result = await UserProfile.findOne({
    where: {
      loginId: loginId,
    },
    attributes: ["divisionId"],
  });

  if (!result) return res.status(400).send({ error: "Can't find user" });
  return res.status(200).send({ divisionId: result.divisionId });
});

router.delete("/allAvatars", deleteAllAvatar, async (req, res) => {
  return res.status(200).send({ data: "Delete all avatars successfully" });
});

async function sendMail(user, mailType, subject, callback) {
  // create reusable transporter object using the default SMTP transport

  /** Two things do before send emails:
     1. Enable Less secure app access 
        https://myaccount.google.com/lesssecureapps

     2.Allow access to your Google account : go following link and press continue  
        https://accounts.google.com/b/0/DisplayUnlockCaptcha
    */
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: "ugp.mailer@gmail.com",
      pass: "kanishka1234",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "ugp.mailer@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: subject, // Subject line
    html: customEmail(user.id, user.name, user.password, mailType),
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}

//Middleware
async function checkDivision(req, res, next) {
  //if next() executed it call next function. ( this -> (req, res))
  try {
    const div = await Division.findByPk(req.body.divisionId);
    if (!div) return res.status(400).send({ error: "Invalid Division ID" });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
  // res.division = div
  next();
}

module.exports = router;
