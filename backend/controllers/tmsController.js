const query = require("../config/database");

const createApplication = async (req, res) => {
  const {
    App_Acronym,
    App_Rnumber,
    App_Description,
    App_startDate,
    App_endDate,
    App_permit_Create,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
  } = req.body;

  try {
    await query(
      `INSERT INTO application
                (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate,
                App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing,
                App_permit_Done) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        App_Acronym,
        App_Description,
        App_Rnumber,
        App_startDate,
        App_endDate,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done,
      ]
    );

    return res.status(201).json({ success: "New application created" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ message: "Error inserting data into database" });
  }
};

const getUserApplicationByPermit = async (req, res) => {
  try {
    const { username } = req.body;

    const result = await query(
      `SELECT DISTINCT A.*
      FROM Application A
      JOIN User_group U
      ON U.usergroup = A.App_permit_Create
      OR U.usergroup = A.App_permit_Open
      OR U.usergroup = A.App_permit_toDoList
      OR U.usergroup = A.App_permit_Doing
      OR U.usergroup = A.App_permit_Done
      WHERE username = ?`,
      [username]
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error querying data from database.", error);
    return res
      .status(500)
      .json({ message: "Unable to get application list from database." });
  }
};

const editApplication = async (req, res) => {
  const {
    App_Acronym,
    App_Description,
    App_Rnumber,
    App_startDate,
    App_endDate,
    App_permit_Create,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
  } = req.body;

  try {
    const result = await query(
      `UPDATE application 
      SET App_Description = ?, App_Rnumber = ?, App_startDate = ? ,
          App_endDate = ? , App_permit_Create = ?, App_permit_Open = ?, App_permit_toDoList = ?,
          App_permit_Doing = ?, App_permit_Done = ?
          WHERE App_Acronym = ?`,
      [
        App_Description,
        App_Rnumber,
        App_startDate,
        App_endDate,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done,
        App_Acronym,
      ]
    );

    if (result.affectedRow > 0) {
      return res
        .status(200)
        .json({ success: "Successfully updated application" });
    }
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
    //fetch app permits
    const appPermitsResults = await query(
      `SELECT App_permit_Create, App_permit_Open, App_permit_toDoList,
      App_permit_Doing, App_permit_Done
      FROM Application
      WHERE App_Acronym = ?`,
      [Task_app_Acronym]
    );

    const appPermits = appPermitsResults[0];

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
          FROM user_group
          WHERE username = ?`,
      [Task_creator]
    );

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    // Determine which permit to check based on task state
    let requiredPermit = "";
    switch (Task_state) {
      case "Open":
        requiredPermit = appPermits.App_permit_Open;
        break;
      case "To do":
        requiredPermit = appPermits.App_permit_toDoList;
        break;
      case "Doing":
        requiredPermit = appPermits.App_permit_Doing;
        break;
      case "Done":
        requiredPermit = appPermits.App_permit_Done;
        break;
      default:
        return res.status(400).json({ message: "Invalid task state" });
    }

    // check if user has required group to create task
    if (!UserGroup.includes(requiredPermit)) {
      return res.status(403).json({
        message: "Unauthorised",
      });
    }

    // // check if user has required group to create task
    // if (!UserGroup.includes(appPermits.App_permit_Create)) {
    //   return res.status(403).json({
    //     message: "Unauthorised",
    //   });
    // }

    //////// query if usergroup matches

    const result = await query(
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

    if (result.affectedRows > 0) {
      // increment app RNumber
      await query(
        `UPDATE application
      SET App_Rnumber = App_Rnumber + 1
      WHERE App_Acronym = ?`,
        [Task_app_Acronym]
      );

      return res.status(200).json({ success: "Successfully created task" });
    }
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

    return res.status(200).json(App_RNumber.App_RNumber);
  } catch (error) {
    console.error("Error getting current RNumber from database", error);
    return res
      .status(500)
      .json({ message: "Unable to get current appRNumber from database." });
  }
};

const getAllAppTasks = async (req, res) => {
  try {
    const { App_Acronym } = req.body;

    const tasks = await query(
      `SELECT *
      FROM task
      WHERE Task_app_Acronym = ?`,
      [App_Acronym]
    );

    // loop through task and fetch its respective plan color
    for (let task of tasks) {
      const findPlanColorUsingTaskPlan = await query(
        `SELECT Plan_color
        FROM plan
        WHERE Plan_MVP_Name = ?`,
        [task.Task_plan]
      );

      // attach the corresponding plan color to task else if no color set to null
      task.Plan_color = findPlanColorUsingTaskPlan[0]
        ? findPlanColorUsingTaskPlan[0].Plan_color
        : null;
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks from database", error);
    return res
      .status(500)
      .json({ message: "Unable to fetch all tasks from database." });
  }
};

const updateTask = async (req, res) => {
  const {
    Task_id,
    Task_plan,
    Task_notes,
    Task_state,
    Task_app_Acronym,
    username,
  } = req.body;
  console.log("req.body", req.body);

  try {
    //fetch app permits
    const appPermitsResults = await query(
      `SELECT App_permit_Open, App_permit_toDoList,
     App_permit_Doing, App_permit_Done
    FROM Application
    WHERE App_Acronym = ?`,
      [Task_app_Acronym]
    );

    const appPermits = appPermitsResults[0];

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
      FROM user_group
      WHERE username = ?`,
      [username]
    );

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    // Determine which permit to check based on task state
    let requiredPermit = "";
    switch (Task_state) {
      case "Open":
        requiredPermit = appPermits.App_permit_Open;
        break;
      case "To do":
        requiredPermit = appPermits.App_permit_toDoList;
        break;
      case "Doing":
        requiredPermit = appPermits.App_permit_Doing;
        break;
      case "Done":
        requiredPermit = appPermits.App_permit_Done;
        break;
      default:
        return res.status(400).json({ message: "Invalid task state" });
    }

    // check if user has required group to create task
    if (!UserGroup.includes(requiredPermit)) {
      return res.status(403).json({
        message: "Unauthorised",
      });
    }

    //////// query if usergroup matches////////////////
    await query(
      `UPDATE task
      SET Task_plan = ?, Task_notes = ?
      WHERE Task_id = ?`,
      [Task_plan, Task_notes, Task_id]
    );

    return res.status(200).json({ success: "Successfully updated task" });
  } catch (error) {
    console.error("Error updating data in database", error);
    return res
      .status(500)
      .json({ message: "Unable to update task in database." });
  }
};

const changeTaskState = async (req, res) => {
  const {
    Task_id,
    Task_state,
    Task_plan,
    Task_notes,
    Task_owner,
    Task_app_Acronym,
    username,
    stateBeforeStateChange,
  } = req.body;

  try {
    //fetch app permits
    const appPermitsResults = await query(
      `SELECT App_permit_Open, App_permit_toDoList,
     App_permit_Doing, App_permit_Done
    FROM Application
    WHERE App_Acronym = ?`,
      [Task_app_Acronym]
    );

    const appPermits = appPermitsResults[0];

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
      FROM user_group
      WHERE username = ?`,
      [username]
    );

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    // Determine which permit to check based on task state
    let requiredPermit = "";
    switch (stateBeforeStateChange) {
      case "Open":
        requiredPermit = appPermits.App_permit_Open;
        break;
      case "To do":
        requiredPermit = appPermits.App_permit_toDoList;
        break;
      case "Doing":
        requiredPermit = appPermits.App_permit_Doing;
        break;
      case "Done":
        requiredPermit = appPermits.App_permit_Done;
        break;
      default:
        return res.status(400).json({ message: "Invalid task state" });
    }

    // check if user has required group to create task
    if (!UserGroup.includes(requiredPermit)) {
      return res.status(403).json({
        message: "Unauthorised",
      });
    }

    //////// Query if usergroup matches app permit

    await query(
      `UPDATE task
    SET Task_state = ?, Task_notes = ?, Task_plan = ?, Task_owner = ?
    WHERE Task_id = ?`,
      [Task_state, Task_notes, Task_plan, Task_owner, Task_id]
    );

    return res
      .status(200)
      .json({ success: "Successfully changed task state." });
  } catch (error) {
    console.error("Error updating task's state in database", error);
    return res
      .status(500)
      .json({ message: "Unable to update task's state in database." });
  }
};

// get
const getAppPermitsAndUserGroup = async (req, res) => {
  try {
    const { App_Acronym, username } = req.body;

    // get application permits
    const appPermits = await query(
      `SELECT App_permit_Create, App_permit_Open, App_permit_toDoList,
    App_permit_Doing, App_permit_Done
    FROM Application
    WHERE App_Acronym = ?`,
      [App_Acronym]
    );

    if (appPermits.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
      FROM user_group
      WHERE username = ?`,
      [username]
    );

    if (getUserGroup.length === 0) {
      return res.status(404).json({ message: "Usergroup not found" });
    }

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    return res
      .status(200)
      .json({ appPermits: appPermits, userGroup: getUserGroup });
  } catch (error) {
    console.error("Error querying application permits in database", error);
    return res
      .status(500)
      .json({ message: "Unable to query application permits from database." });
  }
};

module.exports = {
  createApplication,
  getUserApplicationByPermit,
  editApplication,
  createPlan,
  getApplicationPlans,
  createTask,
  getAppRNumber,
  getAllAppTasks,
  updateTask,
  changeTaskState,
  getAppPermitsAndUserGroup,
};
