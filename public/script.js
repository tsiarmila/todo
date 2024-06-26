window.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('loggedIn');
  const saveTodoButton = document.getElementById('save-todo-button');
  const logoutButton = document.getElementById('logout-button');
  const historyTodoList = document.getElementById('history-todo-list');
  const greeting = document.querySelector('h1');

  if (isLoggedIn) {
    if (saveTodoButton && logoutButton && historyTodoList && greeting) {
        saveTodoButton.style.display = 'none';
        logoutButton.style.display = 'block';
        historyTodoList.style.display = "block";
        greeting.textContent = "ToDo Today";
    }
  } else {
    if (saveTodoButton && logoutButton && historyTodoList) {
        saveTodoButton.style.display = 'block';
        logoutButton.style.display = 'none';
        historyTodoList.style.display = "none";
    }
  }
});

document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  localStorage.removeItem('gender');
  const saveTodoButton = document.getElementById('save-todo-button');
  const historyTodoList = document.getElementById('history-todo-list');
  if (saveTodoButton && historyTodoList) {
      saveTodoButton.style.display = 'block';
      document.getElementById('logout-button').style.display = 'none';
      historyTodoList.style.display = "none";
  }
});

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
      }
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
                deleteButton.style.display = 'none';
                completedList.appendChild(todoItem); // Перемещаем выполненные
            } else {
                todoList.appendChild(todoItem);
            }

            const currentDate = new Date();
            if (todo && todo.completedAt !== null) {
                const completionDate = new Date(todo.completedAt);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                // console.log("completionDate", completionDate, "yesterday", yesterday);

                const completionDateOnly = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
                const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                // console.log("completionDateOnly", completionDateOnly.getTime(), "yesterdayOnly", yesterdayOnly.getTime());

                if (completionDateOnly.getTime() <= yesterdayOnly.getTime()) {
                    // Удаляем элемент из localStorage
                    try {
                        deleteTodo(index)
                    } catch (error) {
                        console.error('Ошибка при удалении элемента из localStorage:', error);
                    }
                }
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
    setInterval(renderTodos, 12 * 60 * 1000);

    function addTodo(event) {
        event.preventDefault();
        const text = todoInput.value.trim();
        if (text !== '') {
          const todo = {
              text: text,
              completed: false,
              priority: false,
              deadLine: null,
              deadlineTime: null,
              focus: false,
              attention: false,
              completedAt: null
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

        if (todos[index].completed) {
            todos[index].completedAt = new Date().toISOString().split("T")[0];
        } else {
            todos[index].completedAt = null;
        }
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

function formValidation() {
  const email = document.registration.email.value;
    if(ValidateEmail(email)) {
      return true;
    }
  return false;
}
function ValidateEmail(email) {
  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(mailformat)) {
    return true;
  } else {
    alert("You have entered an invalid email address!");
    return false;
  }
}
// saveTodoButton
document.addEventListener('DOMContentLoaded', () => {
    const saveTodoButton = document.getElementById('save-todo-button');
    const modalSaveTodo = document.getElementById('register');

    saveTodoButton.addEventListener('click', () => {
        modalSaveTodo.style.display = 'block';
    });

    window.onclick = function(event) {
      if (event.target == modalSaveTodo) {
        modalSaveTodo.style.display = "none";
      }
    }
});

document.getElementById("register-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  if (formValidation() === true) {
    const form = event.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const name = form.elements.name.value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                name: name
            })
        });

        if (!response.ok) {
            throw new Error("Sending request error.");
        }

        const data = await response.json();
        const userName = data.name;
        const gender = data.gender;
        console.log("data in response", data);

        if (data.emailExists) {
              alert("Email already exists. Please LogIn");
              document.getElementById('register').style.display = 'none';
              const logInModal = document.getElementById('logIn');
              logInModal.style.display = 'block';
              const logInForm = document.getElementById('login-form');
              logInForm.elements.email.value = email;

        } else if (data.success && data.redirectTo) {
              window.location.href = data.redirectTo;
              localStorage.setItem('loggedIn', 'true');
              localStorage.setItem('email', email);
              localStorage.setItem('name', userName);
              localStorage.setItem('gender', gender);
              console.log("name gender", gender);
        } else {
              // Если не удалось перенаправить, выводим сообщение об успешной обработке
              console.log("Form data received successfully!");
        }

    } catch (error) {
        console.error("Error:", error);
    }
  } else {
    console.log("Form validation failed!");
  }
});

document.getElementById("login-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  // if (formValidation() === true) {
    const form = event.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
      });

      if (!response.ok) {
          throw new Error("Sending request error: " + response.status);
      }
      const data = await response.json();
      const userName = data.name;
      const gender = data.gender;

      if (data.success) {
      // Пользователь успешно вошел
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('email', email);
          localStorage.setItem('name', userName);
          localStorage.setItem('gender', gender);
        }
      } else {
        // Ошибка при входе
        alert(data.message);
      }

    } catch (error) {
      console.error("Error:", error);
      // Обработка ошибки при отправке запроса
      if (error instanceof TypeError) {
        alert("Sending request error. Please check your internet connection.");
      } else {
        alert("An error has occurred. Please try again later.");
      }
    }
  // } else {
  //   console.log("Form validation failed!"); // Добавляем обработку неудачной валидации
  // }
});
//showLoginModalLink
document.addEventListener('DOMContentLoaded', function() {
    const showLoginModalLink = document.getElementById('show-login-modal');
    const modalLogin = document.getElementById('logIn');

    showLoginModalLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('register').style.display = 'none';
        document.getElementById('logIn').style.display = 'block';

        window.onclick = function(event) {
          if (event.target == modalLogin) {
            modalLogin.style.display = "none";
          }
        }
    });
});
// showRegisterModalLink
document.addEventListener('DOMContentLoaded', function() {
    const showRegisterModalLink = document.getElementById('show-register-modal');
    const modalRegister = document.getElementById('register');

    showRegisterModalLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('logIn').style.display = 'none';
        document.getElementById('register').style.display = 'block';

        window.onclick = function(event) {
          if (event.target == modalRegister) {
            modalRegister.style.display = "none";
          }
        }
    });
});

async function saveCompletedTaskToHistory(email, completedDate, todoText) {
    try {
        const response = await fetch("/savehistory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                completedDate: completedDate,
                todoText: todoText,
                synced: true
            })
        });

        // if (!response.ok) {
        //     throw new Error("Sending request error");
        // }

        const data = await response.json();
        console.log("Task saved to history:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteCompletedTaskFromHistory(email, completedDate, todoText, synced) {
    try {
        if (!synced) {
            console.log("Task was not synced with history, skipping deletion.");
            return;
        }
        const response = await fetch("/deletetask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                completedDate: completedDate,
                todoText: todoText
            })
        });

        // if (!response.ok) {
        //     throw new Error("Deleting request error");
        // }

        const data = await response.json();
        if (data.deleted) {
            console.log("Task deleted from history:", data);
        } else {
            console.log("Task not found in history:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function checkCompletedTasks() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const userEmail = localStorage.getItem('email');

    for (let index = 0; index < todos.length; index++) {
        const todo = todos[index];
        if (todo.completed && todo.completedAt) {
            saveCompletedTaskToHistory(userEmail, todo.completedAt, todo.text);
        } else if (!todo.completed && todo.completedAt === null) {
            deleteCompletedTaskFromHistory(userEmail, todo.completedAt, todo.text);
        }
    }
}
// checkCompletedTasks
document.addEventListener('DOMContentLoaded', function() {
    checkCompletedTasks();
    // Запускаем функцию checkCompletedTasks каждый час
    setInterval(checkCompletedTasks, 1 * 60 * 60 * 1000);
});
// Вызываем функцию checkCompletedTasks при загрузке страницы
window.addEventListener('load', checkCompletedTasks);
//history todo list
document.addEventListener('DOMContentLoaded', async function() {
  const isLoggedIn = localStorage.getItem('loggedIn');
  const historyTodoList = document.getElementById('history-todo-list');
  let greeting = document.querySelector('h1');

  if (isLoggedIn) {
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const gender = localStorage.getItem('gender');
    console.log("name logged", name);
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (!response.ok) {
        throw new Error("Sending email error.");
      }

      const data = await response.json();

      // Отображение данных на странице
      if (historyTodoList && data.history && data.history.length > 0) {
        data.history.reverse().forEach(item => {
          const date = item[0];
          const tasks = item[1];
          const today = new Date();
          const dateString = new Date(date);
          const dayOfWeek = dateString.toLocaleDateString('en-US', { weekday: 'long' });

          let dateHeaderText;
          if (isSameDay(dateString, today)) {
            return; // Пропускаем сегодняшний день
          } else if (isYesterday(dateString, today)) {
            dateHeaderText = "Done Yesterday";
          } else {
            dateHeaderText = `${dayOfWeek}, ${date}`;
          }

          const dateContainer = document.createElement('div');
          dateContainer.classList.add('container-history');

          const dateHeader = document.createElement('h4');
          dateHeader.textContent = dateHeaderText;
          dateContainer.appendChild(dateHeader);

          const tasksList = document.createElement('ul');
          tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.textContent = task;
            taskItem.classList.add('todo-item');
            tasksList.appendChild(taskItem);
          });

          dateContainer.appendChild(tasksList);
          historyTodoList.appendChild(dateContainer);
        });
      }
      function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
      }

      function isYesterday(date1, date2) {
        const yesterday = new Date(date2);
        yesterday.setDate(date2.getDate() - 1);
        return isSameDay(date1, yesterday);
      }

      // Добавляем обработчик событий для каждого dateHeader
      const dateHeaders = document.querySelectorAll('.container-history h4');
      dateHeaders.forEach(dateHeader => {
        const expandSign = document.createElement('span');
        expandSign.classList.add('expand-sign');
        expandSign.textContent = 'ᐯ';
        dateHeader.appendChild(expandSign);

          dateHeader.addEventListener('click', () => {
              const tasksList = dateHeader.nextElementSibling; // Получаем следующий элемент после dateHeader, который является tasksList
              tasksList.style.display = tasksList.style.display === 'none' ? 'block' : 'none'; // Переключаем видимость tasksList
              expandSign.textContent = tasksList.style.display === 'none' ? 'ᐯ' : 'ᐱ';
          });
      });

      // Изначально скрываем все tasksList
      const tasksLists = document.querySelectorAll('.container-history ul');
      tasksLists.forEach(tasksList => {
          tasksList.style.display = 'none';
      });

      // Добавляем цветы в зависимости от пола пользователя
      if (gender === "female") {
        addFlowers();
        greeting.textContent = `${capitalize(name)}, What are we doing today?`;
      } else if (gender === "male") {
        greeting.textContent = `${capitalize(name)}, What are we doing today?`;
      } else {
        greeting.textContent = `${capitalize(name)}, What are we doing today?`;
      }

    } catch (e) {
      console.error("Error:", e);
    }
  } else {
    // Если пользователь не залогинен, скрываем список задач
    if (historyTodoList) {
      historyTodoList.style.display = "none";
    }
    if (greeting) {
      greeting.textContent = "ToDo Today";
    }

  }
});

function addFlowers() {
  let p = document.querySelector('#logout-button'),
  p_width = p.getBoundingClientRect().width,
  fc = ['red','purple','#5F7FFF','violet','blue','DarkTurquoise','DodgerBlue']

  for(var i=0;i<3;i++) {
    let b = document.createElement('div')
    b.className = 'flower'
    b.style.bottom = (Math.random() * 90 - 50) + '%'
    b.style.left = (i * 45) - 205 + '%'
    b.style.setProperty('--color-flower', fc[Math.floor(Math.random()*fc.length)])
    b.style.animationDelay = 4 * Math.random() + 's'
    p.appendChild(b)
  }
}

function capitalize(str) {
  return str.replace(/\b\w/g, function(char) {
    return char.toUpperCase();
  });
}


//
// if (userName && userSex) {
//     let greeting = "";
//     if (userSex === "male") {
//         greeting = `Привет, ${userName}! Добро пожаловать на наш сайт.`;
//     } else if (userSex === "female") {
//         greeting = `Привет, ${userName}! Добро пожаловать на наш сайт.`;
//     } else {
//         greeting = `Привет, ${userName}! Добро пожаловать на наш сайт.`;
//     }
//     console.log(greeting);
// } else {
//     console.log("Не удалось загрузить данные пользователя.");
// }
