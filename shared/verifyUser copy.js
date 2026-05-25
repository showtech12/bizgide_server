const jwt = require('jsonwebtoken');
const UserService = require("../users/users.controller")

module.exports = async (req, res, next) => {

   // console.log(req.headers["cookie"]);
  
    try {

        //const authHeader = req.headers["cookie"]; // get the session cookie from request header
        const authHeader = req.headers["cookie"];
        //console.log("Hello2222");
          //  console.log(authHeader)
        //if (!authHeader) return res.status(403);
        if(!authHeader) return res.redirect("/login");
        const cookie = authHeader.split(";")[1];
        const accessToken = cookie.split('=')[1];
       // console.log(accessToken);
        //if(!cookie){ return res.send({message:"Unauthorized"})}

       const result =  jwt.verify(accessToken, "EP4ssWard");
      //console.log(result.id)

      let options = {
        maxAge: 3 * 60 * 1000, // would expire in 20minutes
        httpOnly: true, // The cookie is only accessible by the web server
        secure: true,
        sameSite: "None",
    };
  
       res.cookie("SessionID", accessToken, options); 

       const userD = await UserService.getUser(result.id);
       console.log(userD);
       req.userDtl = userD;
        

    } catch (error) {
      console.log(error);
      return res.redirect("/logout");
    
    }
    next();
}