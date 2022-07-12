const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  try {
    const payload = jwt.verify(token, "jwtPrivateKey");
    req.user = payload;
    next();
  } catch (err) {
    res.status(400).send({ error: "Invalid token." });
  }
}

module.exports = verifyToken;
