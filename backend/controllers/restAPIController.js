const query = require("../config/database");

const createTask = async (req, res) => {
    const {
      Task_id,
      Task_plan,
      Task_app_Acronym,
      Task_name,
      Task_description
    } = req.body;
    
    if (!Task_name) {
      return res.status(400).json({ message: "Please enter a task name" });
    }
  
    if (Task_name.length < 1 || Task_name.length > 255) {
      return res
        .status(400)
        .json({ message: "Plan name must be 1 - 255 characters" });
    }
  
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
  
      // check if user has required group to create task
      if (!UserGroup.includes(appPermits.App_permit_Create)) {
        return res.status(403).json({
          message: "Unauthorised",
        });
      }
  
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

const getTaskByState = async (req, res) => {};

const promoteTask2Done = async (req, res) => {};

module.exports = {
  createTask,
  getTaskByState,
  promoteTask2Done,
};
