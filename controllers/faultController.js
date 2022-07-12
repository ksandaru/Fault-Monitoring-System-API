const Joi = require("joi");
const validateWith = require("../middleware/validation");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const querystring = require("querystring");
const multer = require("multer");
const fs = require("fs");

const ROLE = require("../config/roleEnum");
const imgHelper = require("../helpers/imageFilter");

//changed
const {
  uploadFaultImg,
  deleteFaultImg,
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
const Fault = db.fault;

const schema = Joi.object({
  divisionId: Joi.number().required(),
  fault: Joi.string().required(),
  description: Joi.string().required(),
  monthOccured: Joi.string().required(),
  yearOccured: Joi.string().required(),
  longitude: Joi.string().required(),
  latitude: Joi.string().required(),
});
//changed
router.get("/getById/:faultId", async (req, res) => {
  const faultId = req.params.faultId;

  const fault = await Fault.findOne({
    where: { id: faultId },
    attributes: { exclude: ["divisionId", "createdAt", "updatedAt"] },
    include: {
      model: Division,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  });
  if (!fault) return res.status(400).send({ error: "Not Found" });

  //changed
  const readerOperator = await UserProfile.findOne({
    where: {
      divisionId: fault.division.id,
    },
    include: [
      {
        model: Login,
        where: {
          role: ROLE.Operator,
        },
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      },
    ],
  });
  if (!readerOperator) return res.status(400).send({ error: "Not found." });

  return res.status(200).send({ fault, readerOperator });//changed
});

// divId => {number} or ''all'
router.get("/:year/:divId", async (req, res) => {
  const divId = req.params.divId;
  const year = req.params.year;

  let divWhere = { yearOccured: year };
  if (divId != "all") divWhere = { divisionId: divId, yearOccured: year };
//changed
  const result = await Fault.findAll({
    where: divWhere,
    order: [["createdAt", "DESC"]],
    attributes: { exclude: ["divisionId", "createdAt", "updatedAt"] },
    include: {
      model: Division,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  });

  if (!result) return res.status(400).send({ error: "Not Found" });

  return res.status(200).send({ data: result });
});

router.post(
  "/",
  Multer.single("image"),
  uploadFaultImg,
  async (req, res) => {
    // fileUrl: req.file.firebaseUrl, == full path
    // fileName: req.file.fileName

    imageUrl = req.file
      ? req.file.firebaseUrl
      : "https://storage.googleapis.com/wfm-ugp.appspot.com/faults/default-fault.png";

    imageFileName = req.file ? req.file.fileName : "default-fault.png";

    let uData = {
      fault: req.body.fault,
      description: req.body.description,
      monthOccured: req.body.monthOccured,
      yearOccured: req.body.yearOccured,
      divisionId: req.body.divisionId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      imageFileName: imageFileName,
      imageUrl: imageUrl,
    };

    const saveData = Fault.create(uData);
    if (!saveData) return res.status(400).send({ error: "Couln't save" });
    return res.status(201).send({ data: "Fault data saved successfully" });
  }
);

router.delete("/:faultId", deleteFaultImg, async (req, res) => {
  const faultId = req.params.faultId;

  const result = await Fault.findByPk(faultId);
  if (!result)
    return res.status(400).send({ error: "Fault not found for given ID" });

  const del = await result.destroy();
  if (!del)
    return res
      .status(400)
      .send({ error: "Cannot Delete Fault, Try again!" });

  return res.status(200).send({
    data: "fault deleted successfuly",
  });
});

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
