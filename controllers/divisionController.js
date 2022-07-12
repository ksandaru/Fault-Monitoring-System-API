const Joi = require("joi");
const validateWith = require("../middleware/validation");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const querystring = require("querystring");

const ROLE = require("../config/roleEnum");

const db = require("../models");
const Login = db.login;
const UserProfile = db.userProfile;
const Division = db.division;

const schema = Joi.object({
  regNumber: Joi.string().required(),
  name: Joi.string().required(),
  district: Joi.string().required(),
  longitude: Joi.string().required(),
  latitude: Joi.string().required(),
});

const updateSchema = Joi.object({
  id: Joi.number().required(),
  regNumber: Joi.string().required(),
  name: Joi.string().required(),
  district: Joi.string().required(),
  longitude: Joi.string().required(),
  latitude: Joi.string().required(),
});

router.get("/", async (req, res) => {
  const result = await Division.findAll();

  if (!result) return res.status(400).send({ error: "Not Found" });

  return res.status(200).send({ data: result });
});

router.get("/:id", async (req, res) => {
  const divId = req.params.id;
  const GN_Division = await Division.findByPk(divId);

  if (!GN_Division) return res.status(400).send({ error: "Not Found" });

  return res.status(200).send(GN_Division);
});

router.post("/", validateWith(schema), async (req, res) => {
  const data = req.body;
  const result = await Division.create(data);
  if (!result) return res.status(400).send({ error: "Cannot save" });
  return res.status(200).send({ data: "Division created successfully" });
});

router.put("/", validateWith(updateSchema), async (req, res) => {
  const reqData = req.body;

  const result = await Division.findByPk(reqData.id);
  if (!result)
    return res.status(400).send({ error: "Division not found for given ID" });

  result.set({
    regNumber: reqData.regNumber,
    name: reqData.name,
    district: reqData.district,
    longitude: reqData.longitude,
    latitude: reqData.latitude,
  });
  updateC = await result.save();

  if (!updateC)
    return res.status(400).send({ error: "Error! Server having some trubles" });

  return res.status(200).send({
    data: `Division has been updated successfuly`,
  });
});

router.delete("/:id", async (req, res) => {
  const divId = req.params.id;

  const result = await Division.findByPk(divId);
  if (!result)
    return res.status(400).send({ error: "Division not found for given ID" });

  const del = await result.destroy();
  if (!del)
    return res
      .status(400)
      .send({ error: "Cannot Delete division, Try again!" });

  return res.status(200).send({
    data: "division deleted successfuly",
  });
});

module.exports = router;
