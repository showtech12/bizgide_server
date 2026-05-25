// roleMiddleware.js
function authorizeRoles(...permittedRoles) {
    return (req, res, next) => {
       // console.log(req.userDtl.position)
       console.log(permittedRoles)
      const userRole = req.userDtl.position; 
      console.log(userRole)
      if (permittedRoles.includes(userRole)) {
        //console.log("yes")
        return next(); // If the user's role is permitted, proceed to the route
      }
      return res.status(400).json({ message: 'You are not authorized on this page' }); 
     // return res.status(200).json({ success:false, message: 'Access denied to this page' }); 
    };
  }
  
  module.exports = authorizeRoles;
  