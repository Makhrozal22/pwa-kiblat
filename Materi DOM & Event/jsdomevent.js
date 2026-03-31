const input = document.getElementById('taskinput');
const btn = document.getElementById('addBtn');
const list = document.getElementById('list');

//Ambil data dari localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function render(){
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;

        li.addEventListener('click', () => {
            deleteTask(index);
        });

        list.appendChild(li);
    });
}

function addTask(){
    if(input.value !== ''){
        tasks.push(input.value);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        input.value = '';
        render();
    }
}

function deleteTask(index){
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    render();
}

//Event Listener
btn.addEventListener('click', addTask);

//Render awal
render();


