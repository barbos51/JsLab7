const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');
let todos = [];

function todo({ text, id, checked }) {
  return `
    <li class="list-group-item">
      <input type="checkbox" class="form-check-input me-2" id="${id}" ${checked ? 'checked' : ''} onclick="checkTodo('${id}')" />
      <label for="${id}">
        <span class="${checked ? 'text-decoration-line-through text-success' : ''}">${text}</span>
      </label>
      <button onclick="deleteTodo('${id}')" class="btn btn-danger btn-sm float-end">delete</button>
    </li>
  `;
}

function newTodo() {
  const text = prompt('Введіть завдання');
  if (!text) return;
  const todo = { text: text, checked: false };
  addTodo(todo);
}

function addTodo(todo) {
  fetch('https://lab7-3b670-default-rtdb.firebaseio.com/todos.json', {
    method: 'POST',
    body: JSON.stringify({ text: todo.text, checked: todo.checked }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      todo.id = data.name;
      todos.push(todo);
      SetToJson();
      render();
    })
    .catch(() => showError("Помилка при додаванні todo в БД."));
}

function fetchTodosFromDB() {
  showLoading(true);
  fetch('https://lab7-3b670-default-rtdb.firebaseio.com/todos.json')
    .then(res => res.json())
    .then(data => {
      todos = [];
      for (let key in data) {
        todos.push({ id: key, ...data[key] });
      }
      SetToJson();
      render();
    })
    .catch(() => showError("Не вдалося завантажити дані з БД."))
    .finally(() => showLoading(false));
}

function deleteTodo(id) {
  fetch(`https://lab7-3b670-default-rtdb.firebaseio.com/todos/${id}.json`, {
    method: 'DELETE'
  })
    .then(() => {
      todos = todos.filter(todo => todo.id !== id);
      SetToJson();
      render();
    })
    .catch(() => showError("Помилка при видаленні."));
}

function checkTodo(id) {
  const todoI = todos.find(todo => todo.id == id);
  if (todoI) {
    todoI.checked = !todoI.checked;
    fetch(`https://lab7-3b670-default-rtdb.firebaseio.com/todos/${id}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ checked: todoI.checked }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        SetToJson();
        render();
      })
      .catch(() => showError("Помилка при оновленні."));
  }
}

function render() {
  list.innerHTML = todos.map(todoObj => todo(todoObj)).join('');
  updateCounter();
}

function updateCounter() {
  itemCountSpan.textContent = todos.length;
  uncheckedCountSpan.textContent = todos.filter(todo => !todo.checked).length;
}

function SetToJson() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(msg) {
  const error = document.getElementById('error');
  error.textContent = msg;
  error.style.display = 'block';
  setTimeout(() => error.style.display = 'none', 3000);
}

window.onload = function () {
  fetchTodosFromDB();
}
