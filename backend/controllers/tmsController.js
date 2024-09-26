const query = require("../config/database");

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
    const result = await query(`SELECT * 
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

const editApplication = async (req, res) => {
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
    const result = await query(
      `UPDATE application 
      SET App_Description = ?, App_Rnumber = ?, App_startDate = ? ,
          App_endDate = ? , App_permit_Create = ?, App_permit_Open = ?, App_permit_toDoList = ?,
          App_permit_Doing = ?, App_permit_Done = ?
          WHERE App_Acronym = ?`,
      [
        appDescription,
        appRNumber,
        appStartDate,
        appEndDate,
        appPermitCreate,
        appPermitOpen,
        appPermitToDo,
        appPermitDoing,
        appPermitDone,
        appAcronym,
      ]
    );

    if (result.affectedRow > 0)
      return res
        .status(200)
        .json({ success: "Successfully updated application" });
  } catch (error) {
    console.error("Error modifying data in database.", error);
    return res
      .status(500)
      .json({ message: "Unable to modify data in database" });
  }
};

const createPlan = async (req, res) => {
  const {
    Plan_MVP_name,
    Plan_app_Acronym,
    Plan_startDate,
    Plan_endDate,
    Plan_color,
  } = req.body;

  try {
    await query(
      `INSERT INTO plan(Plan_MVP_name, Plan_app_Acronym, Plan_startDate, Plan_endDate, Plan_color)
        VALUES(?, ?, ?, ?, ?)`,
      [
        Plan_MVP_name,
        Plan_app_Acronym,
        Plan_startDate,
        Plan_endDate,
        Plan_color,
      ]
    );

    return res.status(201).json({ success: "Successfully created plan" });
  } catch (error) {
    console.error("Error inserting data into database.", error);
    return res
      .status(500)
      .json({ message: "Unable to insert data into database" });
  }
};

const getApplicationPlans = async (req, res) => {
  const appAcronym = req.params.appAcronym;

  try {
    const result = await query(
      `SELECT * 
      FROM plan
      WHERE Plan_app_Acronym = ?`,
      [appAcronym]
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error querying data from database.", error);
    return res
      .status(500)
      .json({ message: "Unable to query data from database" });
  }
};

const createTask = async (req, res) => {
  const {
    Task_id,
    Task_plan,
    Task_app_Acronym,
    Task_name,
    Task_description,
    Task_notes,
    Task_state,
    Task_creator,
    Task_owner,
    Task_createDate,
  } = req.body;

  try {
    await query(
      `INSERT INTO task(Task_id, Task_plan, Task_app_Acronym, Task_name, 
    Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Task_id,
        Task_plan,
        Task_app_Acronym,
        Task_name,
        Task_description,
        Task_notes,
        Task_state,
        Task_creator,
        Task_owner,
        Task_createDate,
      ]
    );

    return res.status(200).status({ success: "Successfully created task" });
  } catch (error) {
    console.error("Error inserting data into database", error);
    return res.status(500).json({ message: "Unable to create new task" });
  }
};

const getAppRNumber = async (req, res) => {
  try {
    const appAcronym = req.params.appAcronym;

    const [App_RNumber] = await query(
      `SELECT App_RNumber
      FROM Application 
      WHERE App_Acronym = ?`,
      [appAcronym]
    );

    const [rNumberIncrementByAppAcronym] = await query(
      `SELECT COUNT(*) as count
      FROM task
      WHERE Task_app_Acronym = ?`,
      [appAcronym]
    );

    let currentRNumber = App_RNumber.App_RNumber + rNumberIncrementByAppAcronym.count;
    console.log(currentRNumber);
    return res.status(200).json(currentRNumber);
  } catch (error) {
    console.error("Error getting current RNumber from database", error);
    return res.status(500).json({ message: "Unable to get current appRNumber from database." });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const results = await query(
      `SELECT *
      FROM task`
    );

    res.status(200).json(results);

  }catch(error) {
    console.error("Error fetching all tasks from database", error);
    return res.status(500).json({ message: "Unable to fetch all tasks from database." });
  }
}

module.exports = {
  createApplication,
  showAllApplications,
  editApplication,
  createPlan,
  getApplicationPlans,
  createTask,
  getAppRNumber,
  getAllTasks,
};
