function initializeTaskPlanner() {
  const form = document.querySelector("form");
  const taskInput = document.querySelector("#task-input");
  const addButton = document.querySelector("form button");
  const taskSection = document.querySelector("section[aria-label='Tasks']");

  if (!form || !taskInput || !addButton || !taskSection) {
    console.error("StudySprint could not find the task planner elements.");
    return;
  }

  const taskList = document.createElement("ul");
  taskList.setAttribute("aria-label", "Task list");
  taskList.style.listStyle = "none";
  taskList.style.margin = "0";
  taskList.style.padding = "0";
  taskSection.append(taskList);

  const tasks = [];
  const storageKey = "studysprint-tasks";

  // Save the current task list so it is available after a refresh.
  function saveTasks() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("StudySprint could not save tasks to local storage.", error);
    }
  }

  // Restore saved tasks and check that the stored data has the expected format.
  function loadTasks() {
    try {
      const savedTasks = localStorage.getItem(storageKey);

      if (savedTasks === null) {
        return;
      }

      const parsedTasks = JSON.parse(savedTasks);
      const isValid = Array.isArray(parsedTasks) && parsedTasks.every(function (task) {
        return task &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean";
      });

      if (!isValid) {
        throw new Error("Saved task data has an invalid format.");
      }

      tasks.push(...parsedTasks);
    } catch (error) {
      console.error("StudySprint could not load saved tasks.", error);
    }
  }

  // Show a helpful message whenever the task list is empty.
  function updateEmptyMessage() {
    let emptyMessage = taskSection.querySelector(".empty-message");

    if (tasks.length === 0) {
      if (!emptyMessage) {
        emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No tasks yet. Add one to get started!";
        taskSection.prepend(emptyMessage);
      }
    } else if (emptyMessage) {
      emptyMessage.remove();
    }
  }

  function renderTask(task) {
    const taskItem = document.createElement("li");
    const taskDetails = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskName = document.createElement("span");
    const deleteButton = document.createElement("button");

    taskItem.style.display = "flex";
    taskItem.style.alignItems = "center";
    taskItem.style.justifyContent = "space-between";
    taskItem.style.gap = "12px";
    taskItem.style.padding = "12px 0";

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as completed`);
    // Override the general text-input styling so this remains a compact checkbox.
    checkbox.style.flex = "0 0 auto";
    checkbox.style.width = "18px";
    checkbox.style.height = "18px";
    checkbox.style.margin = "0";
    checkbox.style.padding = "0";
    taskName.textContent = task.text;
    taskName.style.flex = "1";
    taskName.style.textDecoration = task.completed ? "line-through" : "";
    taskName.style.color = task.completed ? "#8b8da0" : "";
    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;
      taskName.style.textDecoration = checkbox.checked ? "line-through" : "";
      taskName.style.color = checkbox.checked ? "#8b8da0" : "";
      saveTasks();
    });

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);

    taskDetails.style.display = "flex";
    taskDetails.style.alignItems = "center";
    taskDetails.style.gap = "10px";
    taskDetails.style.flex = "1";
    taskDetails.append(checkbox, taskName);
    taskItem.append(taskDetails, deleteButton);
    taskList.append(taskItem);

    // Removing a task updates both the saved data and the empty-list message.
    deleteButton.addEventListener("click", function () {
      const taskIndex = tasks.indexOf(task);
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
      }
      taskItem.remove();
      saveTasks();
      updateEmptyMessage();
    });
  }

  function addTask() {
    const taskText = taskInput.value.trim();

    // Ignore blank input so empty tasks are never added.
    if (!taskText) {
      taskInput.focus();
      return;
    }

    const task = { text: taskText, completed: false };
    tasks.push(task);
    renderTask(task);
    saveTasks();
    taskInput.value = "";
    taskInput.focus();
    updateEmptyMessage();
  }

  addButton.addEventListener("click", addTask);

  // Support pressing Enter in the input as well as clicking the button.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    addTask();
  });

  loadTasks();
  tasks.forEach(renderTask);
  updateEmptyMessage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeTaskPlanner);
} else {
  initializeTaskPlanner();
}