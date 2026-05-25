const jwt = require("jsonwebtoken");
const UserService = require("./persons/persons.controller");

module.exports = async (req, res, next) => {
  //console.log(req.headers["cookie"]);
  //console.log(req.headers)
  // console.log(req.cookies.MySessionIDCool)

  try {
    let accessToken = "";
    //   const authHeader = req.headers["cookie"];

    //     //  console.log(authHeader)
    //   //if (!authHeader) return res.status(403);
    //   if(!authHeader) return res.redirect("/login");
    //   const cookie = authHeader.split(";")[1];
    //   const accessToken = cookie.split('=')[1];
    //  // console.log(accessToken);
    //   //if(!cookie){ return res.send({message:"Unauthorized"})}

    //========================================

    // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTgsImlhdCI6MTcyMTY1MzA1NH0.iSH-DumdxTeH_1j46nJo-Y6i-7wBigBb-P_ANRw4fl0

    //=========================================

    accessToken =
      req.cookies.MySessionIDCool || res.cookies.MySessionIDCREDITOR
      req.headers["authorization"]?.split(" ")[1];

    //  if (req.headers['authorization']){
    //  // =============Using Bearer Token and Authurazaion========

    //  const authHeader = req.headers['authorization'];
    //   if (!authHeader ) {
    //       return res.status(200).send({
    //           success:"false",
    //           message: "Not Authorized 111",
    //       })
    //    }

    //    accessToken = authHeader.split(' ')[1];
    // console.log(accessToken);
    // console.log("hello");

    //  //==========================================================
    //   }else{
    //==================Using Cookies============

    // accessToken = req.cookies['MySessionIDCool'];

    if (!accessToken) {
      return res.status(200).send({
        success: "false",
        message: "Not Authorized",
      });
      // res.status(400).json({message:"Not Authorized"})
    }
    console.log(accessToken);
    //============================

    //}
    //console.log(authHeader);
    //console.log(accessToken);

    //  if (authHeader) {
    //     const accessToken = authHeader.split(' ')[1];
    //     //console.log("Bearer Token:", accessToken);
    //    // res.send(`Received Bearer token: ${token}`);
    // } else {
    //    // res.status(401).send('Authorization header not found');
    //     return res.redirect("/login")
    // }

    const result = jwt.verify(accessToken, "EP4ssWard");
    //console.log(result.id)

    //   let options = {
    //     maxAge: 1 * 60 * 1000, // would expire in 20minutes
    //     httpOnly: true, // The cookie is only accessible by the web server
    //     secure: true,
    //     sameSite: "None",
    // };

    //    res.cookie("MySessionIDCool", accessToken, options);

// if(MySessionIDCool){const userD = await UserService.getUser(result.id);}
// if(MySessionIDCreditor){const userD = await PersonService.getPerson(result.id);}

    const userD = await UserService.getUser(result.id);
    //console.log(userD);
    req.userDtl = userD;
    req.currentToken = accessToken;
  } catch (error) {
    console.log(error);
    return res.redirect("/logout");
  }
  next();
};
