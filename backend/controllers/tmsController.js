const query = require("../config/database");
const { generateJWT } = require("../services/authService");

const createApplication = async (req, res) => {
  const {
    appAcronym,
    appRNumber,
    appDescription,
    appStartDate,
    appEndDate,
    appPermitCreate,
    appPermitOpen,
    appPermitToDo,
    appPermitDoing,
    appPermitDone,
  } = req.body;

  try {
    await query(
      `INSERT INTO application
                (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate,
                App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing,
                App_permit_Done) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appAcronym,
        appDescription,
        appRNumber,
        appStartDate,
        appEndDate,
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
      await query(`SELECT * 
                  FROM application`);

    const result_mapped = result.map((app) => ({
      appAcronym: app.App_Acronym,
      appDescription: app.App_Description,
      appRNumber: app.App_Rnumber,
      appStartDate: app.App_startDate,
      appEndDate: app.App_endDate,
      appPermitCreate: app.App_permit_Create,
      appPermitOpen: app.App_permit_Open,
      appPermitToDo: app.App_permit_toDoList,
      appPermitDoing: app.App_permit_Doing,
      appPermitDone: app.App_permit_Done,
    }));

    return res.status(200).json(result_mapped);
  } catch (error) {
    console.error("Error querying data from database.", error);
    return res
      .status(500)
      .json({ message: "Unable to get application list from database." });
  }
};

module.exports = {
  createApplication,
  showAllApplications,
};
