
const sequelize = require("../config/database");
const getDateID = async () => {
    try {
        let currentDate = new Date();
        let Dated = currentDate.toISOString().split("T")[0];
        let year = currentDate.getFullYear();
        let monthNum = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure month is in "MM" format
        let quarter = Math.ceil((currentDate.getMonth() + 1) / 3); // Corrected
        let monthName = `${monthNum} ${currentDate.toLocaleString("en-US", { month: "long" })}`;
        let dayName = currentDate.toLocaleString("en-US", { weekday: "long" });
        let isWeekend = currentDate.getDay() === 6 || currentDate.getDay() === 0; // Saturday or Sunday
        let isMonthEnd = new Date(year, currentDate.getMonth() + 1, 0).getDate() === currentDate.getDate(); // Last day of month
        let isWorkingDay = !isWeekend;

        let IsWeekd = isWeekend ? "YES" : "NO";
        let IsMnthed = isMonthEnd ? "YES" : "NO";
        let Iswking = isWorkingDay ? "YES" : "NO";

        let qrter = "";
        if (quarter === 1) {
            qrter = "1st Quarter";
        } else if (quarter === 2) {
            qrter = "2nd Quarter";
        } else if (quarter === 3) { // Fixed typo
            qrter = "3rd Quarter";
        } else if (quarter === 4) {
            qrter = "4th Quarter";
        }

        // Insert into the database
        await sequelize.query(
            `INSERT INTO tbltimes 
            (Dated, Year, Quarter, Month_Name, Day_Name, Is_Week_End, Is_Month_End, is_working_days, Month_Num) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [Dated, year, qrter, monthName, dayName, IsWeekd, IsMnthed, Iswking, monthNum],
                type: sequelize.QueryTypes.INSERT
            }
        );

        // Fetch and return the last inserted ID
        const result = await sequelize.query(
            `SELECT MAX(id) AS id FROM tbltimes`,
            { type: sequelize.QueryTypes.SELECT }
        );

        return result[0].id; // Correct return of the ID
    } catch (error) {
        console.error("Error in getDateID:", error);
        throw error; // Ensure errors are properly thrown
    }
};


        


module.exports={
    getDateID
}