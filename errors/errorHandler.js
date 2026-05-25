module.exports = (err,req,res,next)=>{
    //console.log(err)
    return res.status(err.status).send({message: err.message})
  }