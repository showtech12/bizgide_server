const getNowDate = ()=>{
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    //console.log(year+"-"+month+"-"+day);
    return year+"-"+month+"-"+day;

}

const getUID = ()=>{
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    //console.log(year+"-"+month+"-"+day);
    return year+"-"+month+"-"+day;

}

const  getUniqueId =()=> {
    // Get current timestamp
    const timestamp = new Date().getTime();

    const randomNumber = Math.floor(Math.random() * 10000 + 1);

   // const uniqueId = `${timestamp}${randomNumber}`;
   // const uniqueId = `${timestamp}`;
    const uniqueId = `${randomNumber}`;
   // console.log(uniqueId)
    return uniqueId;
}

module.exports ={
    getNowDate,
    getUniqueId
}