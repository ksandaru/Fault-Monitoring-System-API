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

const db = require("../models");
const { uhfTag } = require("../models");
const Login = db.login;
const UserProfile = db.userProfile;
const Division = db.division;
const UhfTag = db.uhfTag;

const schema = Joi.object({
    uhfId: Joi.string(),
    status:Joi.string(),
    locationId: Joi.string(),
  });


const uhf_tagSchema = Joi.object({
    divisionId: Joi.number().required(),
    uhfId: Joi.string().required(),
    status:Joi.string().required(),
    locationId:Joi.string().required(),
  });

  router.get("/", async (req, res) => {
    const result = await UhfTag.findAll();
  
    if (!result) return res.status(400).send({ error: "Not Found" });
  
    return res.status(200).send({ data: result });
  });

  // router.get("/get-by-user-id/:login_id", async (req, res) => {

  //   const login_id = req.params.login_id;
  //   const reqData = req.body;

  //   const user_result = await UserProfile.findOne({
  //     where: { loginId: login_id},
  //   });
  //   if (!user_result)
  //   return res.status(400).send({
  //     error: "Invalid user ID",
  //   });
  
  //  const uhf_result = await UhfTag.findAll({
  //   where:{divisionId:user_result.divisionId}
  //  });

  //  if (!uhf_result)
  //  return res.status(400).send({
  //    error: "Error while getting UHF List",
  //  });
  
  //   return res.status(200).send({ data: uhf_result });
  // });


  router.post(
    "/add-uhf-tag",
    checkDivision,
    validateWith(uhf_tagSchema),
      async (req, res) => {
      let data = req.body;
      // IF div returned from checkDivision
      //   const division = res.division;
      const findUhf_tag = await UhfTag.findOne({
        where: { uhfId: data.uhfId },
      });


//changed
if (findUhf_tag)
return res
  .status(400)
  .send({ error: "UHF Tag already exist with given EPC number" });      
  

const saveUhf_tag = await UhfTag.create(data);

if (!saveUhf_tag)
return res.status(400).send({ error: "Error! Couldn't save RFID Tag" });
return res.status(201).send({ data: "RFID Tag saved successfully!" });         
    }
  );

router.patch("/update-uhf-tag/:profileId",//changed
    async (req, res) => {
      const profileId = req.params.profileId;
      const reqData = req.body;
  
      const result = await UhfTag.findOne({
        where: { id: profileId},
      });
      if (!result)
        return res.status(400).send({
          error: "Tag not found for given Profile ID and division ID",
        });
  //---------------------
      result.set({
        uhfId: reqData.uhfId,
        status:reqData.status,
        locationId: reqData.locationId,
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