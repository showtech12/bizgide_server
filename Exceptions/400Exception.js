module.exports = function BadRequest400(msg) {
    this.status = 400;
    this.message = msg;
    
  }
  