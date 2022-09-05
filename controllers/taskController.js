const db = require("../models");

const Task = db.TaskModel;
const User = db.UserModel;

const getAllTasks = async (req, res, next) => {
  //Get current user from jWt
  const { user_id } = req;

  try {
    const tasks = await Task.findAll({
      where: { user_id },
    });

    const promises = tasks.map(async (currentTask) => {
      const currentUser = await User.findOne({
        where: { id: currentTask.user_id },
      });

      return {
        currentTask,
        currentUser,
      };
    });

    const resolved = await Promise.resolve(promises);

    if (tasks.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no tasks for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: resolved,
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const getTaskById = async (req, res, next) => {
  const { user_id } = req;
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: { user_id, id },
    });

    const currentUser = await User.findOne({
      where: { id: user_id },
    });

    if (!currentUser) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "There is no requested task for the current user",
      });
    }

    if (!task) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current user",
      });
    }
    return res.status(200).send({
      success: true,
      data: {
        task,
        currentUser,
      },
      message: "Found requested task for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const getTasksByStatus = async (req, res, next) => {
  const { user_id } = req;
  const { status } = req.params;

  try {
    const tasks = await Task.findAll({
      where: { user_id, status },
    });

    if (tasks.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current user",
      });
    }
    return res.status(200).send({
      success: true,
      data: tasks,
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const editTaskStatus = async (req, res, next) => {
  const { user_id } = req;
  const { status, id } = req.params;
  const { on_hold_reason } = req.body;

  try {
    const task = await Task.findOne({
      where: { user_id, id },
    });

    if (!task) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current user",
      });
    }

    if (status === "Hold" && !on_hold_reason) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter a reason to put your task on hold",
      });
    }

    const updateTaskStatus = await Task.update(
      {
        status,
        on_hold_reason,
      },
      {
        where: {
          user_id,
          id,
        },
      }
    );

    const updatedTask = await Task.findOne({
      where: { user_id, id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldTask: task,
        noOfUpdatedRows: updateTaskStatus,
        newTask: updatedTask,
      },
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

module.exports = { getAllTasks, getTaskById, getTasksByStatus, editTaskStatus };
