const query = require("../config/database");
const { generateJWT } = require("../services/authService");

const createApplication = async (req, res) => {
  const {
    appAcronym,
    appRNumber,
    appDesc,
    appStartDate,
    appEndDate,
    appPermitCreate,
    appPermitOpen,
    appPermitToDo,
    appPermitDoing,
    appPermitDone,
  } = req.body;

  console.log(req.body);

  // convert date to epoch timestamp
  const startDate = new Date(appStartDate);
  const epochStartDate = Math.floor(startDate.getTime() / 1000);

  const endDate = new Date(appEndDate);
  const epochEndDate = Math.floor(endDate.getTime() / 1000);

  console.log("epochStartDate", epochStartDate);
  console.log("epochEndDate", epochEndDate);

  try {
    await query(
      `INSERT INTO application
                (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate,
                App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing,
                App_permit_Done) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appAcronym,
        appDesc,
        appRNumber,
        epochStartDate,
        epochEndDate,
        appPermitCreate,
        appPermitOpen,
        appPermitToDo,
        appPermitDoing,
        appPermitDone,
      ]
    );

    return res.status(201).json({ success: "New application created" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error querying database" });
  }
};
const showAllApplications = async (req, res) => {
  try {
    const result =
    await query(`SELECT appAcronym, appDesc, epochStartDate, epochEndDate 
                FROM application`);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error querying data from datbase.", error);
    return res.status(500).json({message: "Unable to get application list from database."});
  }
};

module.exports = {
  createApplication,
  showAllApplications,
};
