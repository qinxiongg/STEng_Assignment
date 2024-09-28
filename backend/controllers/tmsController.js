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

  console.log(req.body);

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
    return res.status(500).json({ message: "Error inserting data into database" });
  }
};

const getUserApplicationByPermit = async (req, res) => {
  try {
    const { username } = req.body;
    console.log(username);

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

      // attched the corresponding plan color to task
      task.Plan_color = findPlanColorUsingTaskPlan[0].Plan_color;
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
  const { Task_id, Task_plan, Task_notes } = req.body;

  try {
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
  const { Task_id, Task_state, Task_notes } = req.body;

  try {
    await query(
      `UPDATE task
    SET Task_state = ?, Task_notes = ?
    WHERE Task_id = ?`,
      [Task_state, Task_notes, Task_id]
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
};
