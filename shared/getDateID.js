const sequelize = require("../config/database");
//const moment = require("moment");

module.exports = async (req, res, next) => {

    //let currentDate = moment();
    let currentDate = new Date();
    console.log(currentDate);
        let Dated = currentDate.toISOString().split("T")[0]
        let year = currentDate.getFullYear();
        let monthNum = String(currentDate.getMonth() + 1).padStart(2 ,"0"); // Months are 0-based, so add 1
        let quarter = Math.ceil(monthNum / 3);
        let monthName = monthNum+" "+ currentDate.toLocaleString("en-US", { month: "long" });
        let dayName = currentDate.toLocaleString("en-US", { weekday: "long" });
        let isWeekend = currentDate.getDay() === 6 || currentDate.getDay() === 0; // 6 = Saturday, 0 = Sunday
        let isMonthEnd = new Date(year, monthNum, 0).getDate() === currentDate.getDate();
        let isWorkingDay = !isWeekend;

        var IsWeekd = ""
        if(isWeekend == 0){IsWeekd="NO"}else(IsWeekd = "YES")
        var IsMnthed = ""
        if(isMonthEnd == 0){IsMnthed="NO"}else(IsMnthed = "YES")

        var Iswking = ""
        if(isWorkingDay == 0){Iswking="NO"}else(Iswking = "YES")
       
        var qrter =""
        if(quarter == 1){
            qrter = "1st Quarter"
        }else if(quarter == 2){
            qrter = "2nd Quarter"
        }else if(quarter == 2){
            qrter = "3rd Quarter"
        }else if(quarter == 4){
            qrter = "4th Quarter"
        }

        //var qry =``


    await sequelize.query(
        `INSERT INTO tbltimes 
        (Dated, Year, Quarter, Month_Name, Day_Name, Is_Week_End, Is_Month_End, is_working_days, Month_Num ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            Dated, year,qrter, monthName, dayName, IsWeekd, IsMnthed, Iswking,
            monthNum
          ],
          type: sequelize.QueryTypes.INSERT
        }
     )
    .then((results) => {

        req.body.DateID = 1
        

        


   // next();
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        //   res.status(200).json({
        //   success:false,
        //   data:""
        //   })

    })

}