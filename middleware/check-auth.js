const jwt = require('jsonwebtoken');

const createTokens = (user) => {
    const accessToken = jwt.sign({ email: user.email}, process.env.JWT_SECRET, {expiresIn: "24h"});

    return accessToken;
}

const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"];
  
    if (!accessToken)
      return res.status(400).json({ error: "User not Authenticated!" });
  
    try {
      const validToken = jwt.verify(accessToken, "jwtsecretplschange");
      if (validToken) {
        req.authenticated = true;
        return next();
      }
    } catch (err) {
      return res.status(400).json({ error: err });
    }
};


module.exports = {createTokens, validateToken};