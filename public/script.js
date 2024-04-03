document.addEventListener('DOMContentLoaded', function() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        // Сортируем задачи: приоритетные задачи в начале
        todos.sort((a, b) => {
            if (a.priority && !b.priority) {
                return -1;
            }
            if (!a.priority && b.priority) {
                return 1;
            }
            return 0;
        });

        todos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');

            const checkSquare = document.createElement("img");
            checkSquare.src = 'bird.png';
            checkSquare.classList.add("check-square");
            todoItem.appendChild(checkSquare);

            const capitalizedText = todo.text.charAt(0).toUpperCase() + todo.text.slice(1);
            const todoText = document.createElement('span');
            todoText.textContent = capitalizedText;
            todoText.classList.add('todo-text'); // Добавляем класс для стилизации текста
            todoItem.appendChild(todoText);

            const priorityStar = document.createElement('span');
            priorityStar.textContent = '☆';
            priorityStar.classList.add('priority-star');
            if (todo.priority) {
                priorityStar.textContent = '⭐';
                priorityStar.classList.add('priority');
            }
            priorityStar.addEventListener('click', function(event) {
                event.stopPropagation();
                togglePriority(index);
            });
            todoItem.appendChild(priorityStar);

            const editButton = document.createElement('button');
            editButton.textContent = '✏️';
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', function(event) {
                event.stopPropagation();
                editTodo(todoItem, index);
            });
            todoItem.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation(); // Остановить всплытие события
                confirmDelete(event, index);
            });
            todoItem.appendChild(deleteButton);

            if (todo.completed) {
                checkSquare.classList.add("completed");
                todoText.classList.add('completed'); // Применяем стиль только к тексту задачи
                completedList.appendChild(todoItem); // Перемещаем выполненные
            } else {
                todoList.appendChild(todoItem);
            }

            todoItem.addEventListener('click', function() {
                toggleCompleted(index);
            });
            // todoList.appendChild(todoItem);
        });
    }

    function addTodo(event) {
        event.preventDefault();
        const text = todoInput.value.trim();
        if (text !== '') {
            todos.push({ text: text, completed: false });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    }
    console.log('todos', todos)

    function togglePriority(index) {
        todos[index].priority = !todos[index].priority;
        saveTodos();
        renderTodos();
    }
    function toggleCompleted(index) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
    }
    function editTodo(todoItem, index) {
        const todoTextElement = todoItem.querySelector('.todo-text');
        const newText = prompt("Edit task:", todoTextElement.textContent);
        if (newText !== null) {
            todos[index].text = newText.trim();
            saveTodos();
            renderTodos();
        }
    }


    function confirmDelete(event, index) {
        const modal = document.getElementById("myModal");
        const confirmButton = document.querySelector(".confirm-button");
        const closeButton = document.querySelector(".close-button");
        const todoText = todos[index].text.substring(0, 20) + " ... ";

        document.querySelector('.modal-content p').textContent = `Delete:  ${todoText} `;

        modal.style.display = "block";

        closeButton.onclick = function() {
          modal.style.display = "none";
        }
        confirmButton.onclick = function() {
          modal.style.display = "none";
          deleteTodo(index);
        }

        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
    }

    function deleteTodo(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }

    todoForm.addEventListener('submit', addTodo);

    renderTodos();
});

document.getElementById('accept-cookies').addEventListener('click', function() {
  document.getElementById('cookie-message').style.display = 'none';
});
