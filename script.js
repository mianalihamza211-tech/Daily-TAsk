/**
 * TaskFlow — To-Do List & Theme Manager
 * Handles tasks (add, delete, complete) and dark/light mode with localStorage persistence.
 */

(function () {
    'use strict';

    // ========== Storage Keys ==========
    const STORAGE_TASKS = 'taskflow_tasks';
    const STORAGE_THEME = 'taskflow_theme';

    // ========== DOM Elements ==========
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');
    const todoCount = document.getElementById('todoCount');
    const themeToggle = document.getElementById('themeToggle');

    // ========== State ==========
    let tasks = loadTasks();

    /**
     * Load tasks from localStorage. Returns array of { id, text, completed }.
     */
    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_TASKS);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('Could not load tasks from storage:', e);
            return [];
        }
    }

    /**
     * Save current tasks to localStorage.
     */
    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.warn('Could not save tasks:', e);
        }
    }

    /**
     * Generate a simple unique id for a task.
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    /**
     * Render the full task list and update the task count.
     */
    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach(function (task) {
            const li = document.createElement('li');
            li.className = 'todo-item' + (task.completed ? ' completed' : '');
            li.setAttribute('data-id', task.id);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = task.completed;
            checkbox.setAttribute('aria-label', 'Mark task as ' + (task.completed ? 'incomplete' : 'complete'));

            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'todo-delete';
            deleteBtn.setAttribute('aria-label', 'Delete task');
            deleteBtn.textContent = '×';

            checkbox.addEventListener('change', function () {
                toggleComplete(task.id);
            });
            deleteBtn.addEventListener('click', function () {
                deleteTask(task.id);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });

        const total = tasks.length;
        const completed = tasks.filter(function (t) { return t.completed; }).length;
        todoCount.textContent = total === 0 ? '0 tasks' : completed + ' / ' + total + ' completed';
    }

    /**
     * Add a new task from the input field.
     */
    function addTask() {
        const text = (todoInput.value || '').trim();
        if (!text) return;

        tasks.push({
            id: generateId(),
            text: text,
            completed: false
        });
        saveTasks();
        todoInput.value = '';
        todoInput.focus();
        renderTasks();
    }

    /**
     * Toggle completed state of a task by id.
     */
    function toggleComplete(id) {
        const task = tasks.find(function (t) { return t.id === id; });
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    /**
     * Remove a task by id.
     */
    function deleteTask(id) {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        saveTasks();
        renderTasks();
    }

    // ========== Theme ==========

    /**
     * Apply theme to document and optionally save to localStorage.
     */
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        try {
            localStorage.setItem(STORAGE_THEME, theme);
        } catch (e) {
            console.warn('Could not save theme:', e);
        }
    }

    /**
     * Get saved theme or detect system preference.
     */
    function getInitialTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_THEME);
            if (saved === 'dark' || saved === 'light') return saved;
        } catch (e) {}
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Toggle between dark and light and persist.
     */
    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(isDark ? 'light' : 'dark');
    }

    // ========== Event Listeners ==========

    addTodoBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addTask();
    });
    themeToggle.addEventListener('click', toggleTheme);

    // ========== Init ==========

    setTheme(getInitialTheme());
    renderTasks();
})();
