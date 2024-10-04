const query = require("../config/database");
const bcryptjs = require("bcryptjs");
const msgCode = require("../constants/msgCode");

const createTask = async (req, res) => {
  const {
    username,
    password,
    appAcronym,
    taskName,
    taskDescription,
    taskNotes,
    taskPlan,
  } = req.body;

  console.log(req.body);

  if (!username || !password) {
    return res.status(401).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (!appAcronym || !taskName) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (taskName.length < 1 || taskName.length > 255) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  try {
    const [accountQuery] = await query(
      `SELECT * FROM accounts
      WHERE username = ?`,
      [username]
    );
    // catch invalid username
    if (!accountQuery) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    if (accountQuery.accountStatus == "Disabled") {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    passwordMatch = await bcryptjs.compare(password, accountQuery.password);

    if (!passwordMatch) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    // fetch app permits
    const [appPermits] = await query(
      `SELECT App_permit_Create, App_permit_Open, App_permit_toDoList,
        App_permit_Doing, App_permit_Done
        FROM Application
        WHERE App_Acronym = ?`,
      [appAcronym]
    );

    // Application does not have corresponding app acronym
    if (!appPermits) {
      return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
    }

    if (!appPermits.App_permit_Create) {
      return res.status(404).json({ msgCode: msgCode.INVALID_STATE_CHANGE });
    }

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
            FROM user_group
            WHERE username = ?`,
      [username]
    );

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    // check if user has required group to create task
    if (!UserGroup.includes(appPermits.App_permit_Create)) {
      return res.status(400).json({
        msgCode: msgCode.NOT_AUTHORIZED,
      });
    }

    // Query app RNumber
    const [appRNumberQuery] = await query(
      `
      SELECT App_Rnumber
      FROM Application
      WHERE App_Acronym = ?`,
      [appAcronym]
    );

    // initialise other variables to populate the tables
    const taskState = "Open";
    const taskCreator = username;
    const taskOwner = username;
    const taskId = `${appAcronym}_${appRNumberQuery.App_Rnumber}`;

    let currentDate = new Date();
    const taskCreateDate = Math.floor(currentDate.getTime() / 1000);
    

    // check if state open is in Open
    if (taskState !== "Open") {
      return res.status(400).json({ msgCode: msgCode.INVALID_STATE_CHANGE });
    }

    const [planExistQuery] = await query(
      `SELECT *
      FROM plan
      WHERE Plan_MVP_Name = ? AND Plan_app_Acronym = ?`,
      [taskPlan, appAcronym]
    );

    console.log("planExistQuery", planExistQuery);

    if (!planExistQuery) {
      return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
    }



    //  query if usergroup matches
    const result = await query(
      `INSERT INTO task(Task_id, Task_plan, Task_app_Acronym, Task_name,
      Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        taskPlan,
        appAcronym,
        taskName,
        taskDescription,
        taskNotes,
        taskState,
        taskCreator,
        taskOwner,
        taskCreateDate,
      ]
    );

    if (result.affectedRows > 0) {
      // increment app RNumber
      await query(
        `UPDATE application
        SET App_Rnumber = App_Rnumber + 1
        WHERE App_Acronym = ?`,
        [appAcronym]
      );
    }

    return res.status(200).json({ msgCode: msgCode.SUCCESS });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msgCode: msgCode.ENTRY_EXISTS });
    }
    return res.status(500).json({msgCode: msgCode.INTERNAL });
  }
};

const getTaskByState = async (req, res) => {};

const promoteTask2Done = async (req, res) => {};

module.exports = {
  createTask,
  getTaskByState,
  promoteTask2Done,
};
