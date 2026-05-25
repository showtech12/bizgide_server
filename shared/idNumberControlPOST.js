
//const InvalidIdException = require('../Exceptions/UserException');

module.exports =  (req,res,next) => {
    //const id = Number.parseInt(req.params.id);
    const id = Number.parseInt(req.body.id);
    //console.log(id);
    if(Number.isNaN(id)){
     // return res.status(400).send({message:"Invalid ID"})
    // throw new InvalidIdException();
        return res.status(400).json({
            code: 400,
            message: "Invalid ID",
         });
    }
    next();
   // console.log(id);
  }