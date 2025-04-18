const tasksContainer = document.getElementById('tasks');
const newTaskForm = document.getElementById('new-task-form');
const taskNameInput = document.getElementById('task-name-input');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const fileInput = document.getElementById('file-input');
const refreshBtn = document.getElementById('refresh-btn');

let tasks = [];

// Load tasks from localStorage on page load
function loadFromLocalStorage() {
  const saved = localStorage.getItem('taskProgressData');
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch {
      tasks = [];
    }
  }
}

// Save tasks to localStorage
function saveToLocalStorage() {
  localStorage.setItem('taskProgressData', JSON.stringify(tasks));
}

function updateProgressBarColor(progressBar, progress) {
  // Smooth color transition from red (0%) to green (100%) using HSL interpolation
  // Red hue: 0, Green hue: 120
  const hue = (progress * 120) / 100; // 0 to 120
  progressBar.style.backgroundColor = `hsl(${hue}, 75%, 50%)`;
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  tasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';

    const taskNameDiv = document.createElement('div');
    taskNameDiv.className = 'task-name';
    taskNameDiv.textContent = task.name;

    // Calculate remaining days
    const remainingDays = Math.ceil(task.days * (1 - task.progress / 100));
    const remainingDaysSpan = document.createElement('span');
    remainingDaysSpan.style.marginLeft = '10px';
    remainingDaysSpan.style.fontWeight = '600';
    remainingDaysSpan.style.color = '#007bff';
    remainingDaysSpan.textContent = `(${remainingDays} days left)`;

    taskNameDiv.appendChild(remainingDaysSpan);
    taskDiv.appendChild(taskNameDiv);

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = task.progress + '%';
    updateProgressBarColor(progressBar, task.progress);

    const progressPercent = document.createElement('span');
    progressPercent.textContent = task.progress + '%';
    progressPercent.style.marginLeft = '10px';
    progressPercent.style.fontWeight = '600';
    progressPercent.style.color = '#555';
    progressPercent.style.verticalAlign = 'middle';

    progressBarContainer.appendChild(progressBar);
    taskDiv.appendChild(progressBarContainer);
    taskDiv.appendChild(progressPercent);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'progress-controls';

    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+Progress';
    increaseBtn.onclick = () => {
      if (task.progress < 100) {
        const increment = 100 / (task.days || 1);
        task.progress = Math.min(100, task.progress + increment);
        renderTasks();
        saveToLocalStorage();
      }
    };

    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '-Progress';
    decreaseBtn.onclick = () => {
      if (task.progress > 0) {
        const decrement = 100 / (task.days || 1);
        task.progress = Math.max(0, task.progress - decrement);
        renderTasks();
        saveToLocalStorage();
      }
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.backgroundColor = '#e74c3c';
    removeBtn.style.marginLeft = '8px';
    removeBtn.onclick = () => {
      tasks.splice(index, 1);
      renderTasks();
      saveToLocalStorage();
    };

    controlsDiv.appendChild(increaseBtn);
    controlsDiv.appendChild(decreaseBtn);
    controlsDiv.appendChild(removeBtn);

    taskDiv.appendChild(controlsDiv);

    tasksContainer.appendChild(taskDiv);
  });
  saveToLocalStorage();
}

newTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskName = taskNameInput.value.trim();
  const taskDaysInput = document.getElementById('task-days-input');
  const days = parseInt(taskDaysInput.value, 10);
  if (taskName && days > 0) {
    tasks.push({ name: taskName, progress: 0, days: days });
    taskNameInput.value = '';
    taskDaysInput.value = '';
    renderTasks();
    saveToLocalStorage();
  }
});

//Remove save button event listener to disable manual save
saveBtn.addEventListener('click', () => {
    if (tasks.length === 0) {
        alert('No tasks to save.');
        return;
    }
  let csvContent = 'Task,Progress\n';
  tasks.forEach(task => {
    csvContent += task.name.replace(/"/g, '""') + ',' + task.progress + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'task_progress.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Remove load button event listener to disable manual load
loadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    const lines = text.trim().split('\n');
    const loadedTasks = [];
    for (let i = 1; i < lines.length; i++) {
      const [name, progress] = lines[i].split(',');
      if (name && !isNaN(progress)) {
        loadedTasks.push({ name: name.trim(), progress: Math.min(100, Math.max(0, Number(progress.trim()))), days: 1 });
      }
    }
    tasks = loadedTasks;
    renderTasks();
    saveToLocalStorage();
  };
  reader.readAsText(file);
  fileInput.value = '';
});

// Add event listener for refresh button to clear localStorage and tasks
refreshBtn.addEventListener('click', () => {
  localStorage.removeItem('taskProgressData');
  tasks = [];
  renderTasks();
});

loadFromLocalStorage();
renderTasks();
