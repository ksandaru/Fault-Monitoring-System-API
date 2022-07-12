const Joi = require("joi");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const validateWith = require("../middleware/validation");
const db = require("../models");
const { date } = require("joi");
const Login = db.login;
const UserProfile = db.userProfile;

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required().min(5),
});

router.post("/", validateWith(schema), async (req, res) => {
  const { username, password } = req.body;

  const user = await Login.findOne({ where: { email: username } });
  if (!user)
    return res.status(401).send({ error: "Invalid email or password." });

  bcrypt.compare(password, user.password, async (err, result) => {
    if (result === false)
      return res.status(401).send({ error: "Invalid email or password." });

    //check whether use is active < check registraion step 2 is complete or not
    if (user.isActive === false) {
      const getUser = await UserProfile.findOne({
        attributes: ["nic"],
        include: {
          model: Login,
          attributes: ["email"],
          where: { email: username },
        },
      });

      return res.status(402).send({
        message: "Please Complete the Registraion.",
        data: {
          nic: getUser.nic,
          email: getUser.login.email,
        },
      });
    }

    if (user.isPasswordReset === true) {
      const getUser = await UserProfile.findOne({
        attributes: ["nic"],
        include: {
          model: Login,
          attributes: ["email", "id"],
          where: { email: username },
        },
      });
      return res.status(403).send({
        message: "Please Update your password.",
        data: {
          loginId: getUser.login.id,
          nic: getUser.nic,
          email: getUser.login.email,
        },
      });
    }

    //Update last login
    user.set({
      lastLogin: Date.now(),
      // status: "online",
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      "jwtPrivateKey"
    );
    const response = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        
      },
      accessToken: token,
      tokenType: "x-access-token",
    };
    res.send(response);
  });
});

module.exports = router;
