let admin = require("firebase-admin");
let serviceAccount = require("../config/firebase-key.json");

const Joi = require("joi");

const schema = Joi.object({
  divisionId: Joi.number().required(),
  fault: Joi.string().required(),
  description: Joi.string().required(),
  monthOccured: Joi.string().required(),
  yearOccured: Joi.string().required(),
  longitude: Joi.string().required(),
  latitude: Joi.string().required(),
});

const deleteSchema = Joi.object({
  fileName: Joi.string().required(),
});

const userSchema = Joi.object({
  fullName: Joi.string().required(),
  nic: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  avatar: Joi.any(),
});

const BUCKET = "gfod-app.appspot.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET,
});

const bucket = admin.storage().bucket();
const storage = admin.storage();

/** R E Q U I R E D
 * 1. goto project settings
 * 2. goto serive accounts tab
 * 3. select Node js
 * 4. genarate new private key - then a file will download
 * 5. create firebase-key.json file under config folder
 * 6. copy content of above downloaded file into firebase-key.json
 * Change Rules : storage -> rules
  https://console.firebase.google.com/u/1/project/gfod-app/storage/gfod-app.appspot.com/rules

  allow read, write: if true;

  https://www.youtube.com/watch?v=uR3Pb8XD5lE
*/

const deleteAvatar = async (req, res, next) => {
  const dir = "avatars";

  //Avoid deleting default image on bucket
  if (req.body.fileName == "default-avatar.png") return next();

  //Data Validation
  const { error, value } = deleteSchema.validate({
    fileName: req.body.fileName,
  });
  if (error) return res.status(400).send({ error: error.details[0].message });

  const filePath = `${dir}/${req.body.fileName}`;
  const file = bucket.file(filePath);

  file
    .delete()
    .then(() => {
      console.log(`Successfully deleted photo:`);
    })
    .catch((err) => {
      console.log(`Failed to remove photo, error: ${err}`);
    });

  next();
};

const deleteAllAvatar = async (req, res, next) => {
  const folderName = "avatars";

  await bucket.delete({
    prefix: `${folderName}`,
  });

  next();
};

const uploadAvatar = async (req, res, next) => {
  if (!req.file) return next();

  //Data Validation
  const { error, value } = userSchema.validate({
    fullName: req.body.fullName,
    nic: req.body.nic,
    district: req.body.district,
    city: req.body.city,
    email: req.body.email,
    password: req.body.password,
  });
  if (error) return res.status(400).send({ error: error.details[0].message });

  // if (!req.file) return res.status(400).send({ error: "File not provided" });
  const image = req.file;
  const dir = "avatars";

  const fileName = Date.now() + "." + image.originalname.split(".").pop();

  const file = bucket.file(`${dir}/${fileName}`);

  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/jpg", // image.mimetype
    },
  });

  stream.on("error", (e) => {
    console.error(e);
    return res.status(400).send({ error: "couldn't save file" });
  });

  stream.on("finish", async () => {
    try {
      // await file.makePublic();
      //Make all objects in a bucket publicly readable
      await storage.bucket(BUCKET).makePublic();

      req.file.firebaseUrl = `http://storage.googleapis.com/${BUCKET}/${dir}/${fileName}`;
      req.file.fileName = fileName;
      next();
    } catch (error) {
      console.error(error);
    }
  });

  stream.end(image.buffer);
};

const uploadFaultImg = async (req, res, next) => {
  if (!req.file) return next();

  //Data Validation
  const { error, value } = schema.validate({
    fault: req.body.fault,
    description: req.body.description,
    monthOccured: req.body.monthOccured,
    yearOccured: req.body.yearOccured,
    divisionId: req.body.divisionId,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
  });
  if (error) return res.status(400).send({ error: error.details[0].message });

  // if (!req.file) return res.status(400).send({ error: "File not provided" });
  const image = req.file;
  const dir = "faults";

  const fileName = Date.now() + "." + image.originalname.split(".").pop();

  const file = bucket.file(`${dir}/${fileName}`);

  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/jpg", // image.mimetype
    },
  });

  stream.on("error", (e) => {
    console.error(e);
    return res.status(400).send({ error: "couldn't save file" });
  });

  stream.on("finish", async () => {
    try {
      // await file.makePublic();
      //Make all objects in a bucket publicly readable
      await storage.bucket(BUCKET).makePublic();

      req.file.firebaseUrl = `http://storage.googleapis.com/${BUCKET}/${dir}/${fileName}`;
      req.file.fileName = fileName;
      next();
    } catch (error) {
      console.error(error);
    }
  });

  stream.end(image.buffer);
};

const deleteFaultImg = async (req, res, next) => {
  const dir = "faults";

  //Data Validation
  const { error, value } = deleteSchema.validate({
    fileName: req.body.fileName,
  });
  if (error) return res.status(400).send({ error: error.details[0].message });

  //Avoid deleting default image on bucket
  if (req.body.fileName == "default-fault.png") return next();

  const filePath = `${dir}/${req.body.fileName}`;
  const file = bucket.file(filePath);

  file
    .delete()
    .then(() => {
      console.log(`Successfully deleted photo:`);
    })
    .catch((err) => {
      console.log(`Failed to remove photo, error: ${err}`);
    });

  next();
};

module.exports = {
  uploadAvatar,
  deleteAvatar,
  deleteAllAvatar,
  uploadFaultImg,
  deleteFaultImg,
};
