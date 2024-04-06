document.addEventListener('DOMContentLoaded', function() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function checkDeadlineStatus(todoItem, todo) {
      const currentTime = new Date();
      let deadlineDateTime;

      if (!todo.deadlineTime && !todo.deadLine) {
          return todoItem;
      }
      // Если установлено только время, берем сегодняшнюю дату
      if (todo.deadlineTime && !todo.deadLine) {
          const today = new Date();
          deadlineDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(todo.deadlineTime.split(':')[0]), parseInt(todo.deadlineTime.split(':')[1]));
      }
      // Если установлена только дата, берем время 00:00
      else if (!todo.deadlineTime && todo.deadLine) {
          deadlineDateTime = new Date(todo.deadLine + ' 00:00');
      }
      // Если установлены и время, и дата
      else {
          deadlineDateTime = new Date(todo.deadLine + ' ' + todo.deadlineTime);
      }

      const timeDifference = deadlineDateTime - currentTime;
      console.log("deadlineDateTime", deadlineDateTime);
      console.log("currentTime", currentTime);
      if (timeDifference <= 60 * 60 * 1000 && timeDifference > 0) {
          todoItem.classList.remove('attention');
          todoItem.classList.add('focus');
          todo.focus = true; // Сохраняем статус
      } else if (timeDifference < 0) {
          todoItem.classList.remove('focus');
          todoItem.classList.add('attention');
          todo.focus = false;
      } else {
          todoItem.classList.remove('focus', 'attention');
          todo.focus = false;
          todo.attention = false;
      } console.log('diff', timeDifference);
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
                    checkDeadlineStatus(todoItem, todo);
                    saveTodos();
                }
            });
            todoItem.appendChild(deadlineTime);

            const deadlineDate = document.createElement('input');
            deadlineDate.setAttribute('type', 'text');
            deadlineDate.setAttribute('placeholder', 'Today');
            deadlineDate.classList.add('deadline-date');

            flatpickr(deadlineDate, {
              disableMobile: "true",
              // minDate: "today",
                dateFormat: 'd M Y',
                allowInput: true,
                defaultDate: todo.deadLine, // Восстанавливаем сохраненную дату
                onChange: function(selectedDates, dateStr) {
                    todos[index].deadLine = dateStr; // Сохраняем выбранную дату в объекте задачи
                    checkDeadlineStatus(todoItem, todo);
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
                todoItem.classList.add('completed-item');
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

            checkDeadlineStatus(todoItem, todo);

        });
    }
    setInterval(renderTodos, 1 * 60 * 1000);

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

if (localStorage.getItem('cookiesAccepted')) {
  document.getElementById('cookie-message').style.display = 'none';
}

document.getElementById('accept-cookies').addEventListener('click', function() {
  localStorage.setItem('cookiesAccepted', true);
  document.getElementById('cookie-message').style.display = 'none';
});
