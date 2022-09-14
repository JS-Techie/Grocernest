const db = require("../../models");

const Task = db.TaskModel;
const User = db.UserModel;

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll();

    if (tasks.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no available tasks",
      });
    }

    const promises = tasks.map(async (current) => {
      const currentUser = await User.findOne({
        where: { id: current.user_id },
      });

      return {
        currentUser,
        current,
      };
    });

    const resolved = await Promise.all(promises);

    console.log(promises);

    return res.status(200).send({
      success: true,
      data: resolved,
      message: "",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getTaskById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({
      where: { id },
    });

    if (!task) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested task could not be found",
      });
    }

    const currentUser = await User.findOne({
      where: { id: task.user_id },
    });

    return res.status(200).send({
      success: true,
      data: {
        task,
        currentUser,
      },
      message: "Found requested task",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getTaskByStatus = async (req, res, next) => {
  const { status } = req.params;
  try {
    const tasks = await Task.findAll({
      where: { status },
    });

    if (tasks.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: `There are no ${status} leaves`,
      });
    }

    const promises = tasks.map(async (current) => {
      const currentUser = await User.findOne({
        where: { id: current.user_id },
      });

      return {
        current,
        currentUser,
      };
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: resolved,
      message: `Found all ${status} tasks`,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const createTask = async (req, res, next) => {
  const { start_date, end_date, description, user_id, no_of_days } = req.body;

  try {
    if (!start_date || !end_date) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter correct dates",
      });
    }

    const newTask = await Task.create({
      start_date,
      end_date,
      description,
      user_id,
      no_of_days,
      status: "Pending",
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newTask,
      message: "Successfully created new task",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editTask = async (req, res, next) => {
  const { start_date, end_date, description, user_id, no_of_days } = req.body;
  const { id } = req.params;

  try {
    const currentTask = await Task.findOne({
      where: { id },
    });

    if (!currentTask) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Task not found for current user",
      });
    }

    const editedTask = await Task.update(
      {
        start_date,
        end_date,
        description,
        user_id,
        no_of_days,
      },
      {
        where: { id },
      }
    );

    const updatedTask = await Task.findOne({
      where: { id },
    });

    return res.status(201).send({
      success: true,
      data: {
        oldTask: currentTask,
        noOfRowsUpdated: updatedTask,
        editedTask,
      },
      message: "Successfully updated details of task",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editTaskStatus = async (req, res, next) => {
  const { status, id } = req.params;
  try {
    const currentTask = await Task.findOne({
      where: { id },
    });

    if (!currentTask) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested task not found",
      });
    }

    const updateTask = await Task.update(
      {
        status,
      },
      {
        where: { id },
      }
    );

    const updatedTask = await Task.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldTask: currentTask,
        noOfRowsUpdated: updateTask,
        newTask: updatedTask,
      },
      message: "Updated status of task successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    const currentTask = await Task.findOne({
      where: { id },
    });

    if (!currentTask) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Could not fetch requested task",
      });
    }

    const deletedTask = await Task.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        deletedTask: currentTask,
        noOfRowsUpdated: deletedTask,
      },
      message: "Requested task deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  getTaskByStatus,
  createTask,
  editTask,
  editTaskStatus,
  deleteTask,
};
