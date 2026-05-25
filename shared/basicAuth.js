const cUser = require("../services/user.controller")
//const bcrypt = require("bcrypt");

module.exports = async (req,res, next)=>{

    const auth = req.headers.authorization;
    
    if(auth){
        const encodeAuth = auth.substring(6);
        const decodedAuth = Buffer.from(encodeAuth,'base64').toString('ascii');
        [email,pass] = decodedAuth.split(":");
        const authUser =  await cUser.findByEmail(email)
        if(authUser){
            //return res.status(403).send({message:"Invalid Email"})
            //console.log(authUser.PassWord);
           // const isPassMatch = await bcrypt.compare(pass , authUser.PassWord);
            //console.log(isPassMatch)
            if(isPassMatch){
                req.authedUser = authUser
            }else{
                return res.status(403).send({message:"Invalid Password"})
            }
        }
    }
  
    next();
}