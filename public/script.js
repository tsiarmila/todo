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

            const deadlineTime = document.createElement('input');
            deadlineTime.setAttribute('type', 'text');
            deadlineTime.setAttribute('placeholder', '🕒');
            deadlineTime.classList.add('deadline-date');

            flatpickr(deadlineTime, {
              disableMobile: true,
              enableTime: true,
              noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true,
                defaultDate: todo.deadlineTime, // Восстанавливаем сохраненную дату
                allowInput: true,
                onChange: function(selectedDates, dateStr) {
                    todos[index].deadlineTime = dateStr; // Сохраняем выбранную дату в объекте задачи
                    saveTodos();
                }
            });
            todoItem.appendChild(deadlineTime);

            const deadlineDate = document.createElement('input');
            deadlineDate.setAttribute('type', 'text');
            deadlineDate.setAttribute('placeholder', '📆');
            deadlineDate.classList.add('deadline-date');

            flatpickr(deadlineDate, {
              disableMobile: "true",
              // minDate: "today",
                dateFormat: 'd M',
                allowInput: true,
                defaultDate: todo.deadLine, // Восстанавливаем сохраненную дату
                onChange: function(selectedDates, dateStr) {
                    todos[index].deadLine = dateStr; // Сохраняем выбранную дату в объекте задачи
                    saveTodos();
                }
            });
            todoItem.appendChild(deadlineDate);

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
                editTodo(todoItem, index);
            });
            checkSquare.addEventListener('click', function() {
                toggleCompleted(index);
            });
        });
    }

    function addTodo(event) {
        event.preventDefault();
        const text = todoInput.value.trim();
        if (text !== '') {
          const todo = {
              text: text,
              completed: false,
              priority: false,
              deadLine: null,
              deadlineTime: null
          };
          todos.push(todo);
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
        todoTextElement.contentEditable = true; // Разрешаем редактирование текста
        todoTextElement.addEventListener('input', function() {
            todos[index].text = todoTextElement.textContent; // Обновляем текст задачи в объекте todos
            saveTodos();
        });
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
