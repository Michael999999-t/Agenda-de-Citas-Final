//Array con los nombres de los meses(para mostrar en el calendario)
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//Array para almacenar los trabajadores creados
let workers = [];
//Objeto para guardat los horarios
let schedules = {}; 
//Variable para guardar el día seleccionado
let selectedDay = null;
//Se ejecuta automáticamente cuando la página termina de cargar
window.onload = () => {
    //Obtiene el selector de meses del HTML
    const selector = document.getElementById('monthSelect');
    //Recorre todos los meses y los agrega como opciones al selector
    months.forEach((m, i) => {
        let opt = document.createElement('option'); //Crea un <option>
        opt.value = i;//indice del mes (0-11)
        opt.innerHTML = m;//Texto visible del mes
        selector.appendChild(opt);//Lo añade al select
    });
    selector.value = new Date().getMonth();
    renderCalendar();
};
//Funcion para añadir un calendario
function addWorker() {
    const name = document.getElementById('workerName').value.trim();
    if (!name) return;
    workers.push(name);
    updateWorkerUI();
    document.getElementById('workerName').value = '';
}
//Funcion para borrar un trabajador
function deleteWorker(index) {
    workers.splice(index, 1);
    updateWorkerUI();
}
//Funcion para actualizar el UI de los trabajadores 
function updateWorkerUI() {
    const list = document.getElementById('workerList');
    const dropdown = document.getElementById('workerDropdown');
    list.innerHTML = "";
    dropdown.innerHTML = "";
    
    workers.forEach((w, index) => {
        //Crea el elemento de la lista con el nombre del trabajador y un botón para eliminarlo
        let li = document.createElement('li');
        li.innerHTML = `
            <span>${w}</span>
            <button class="del-btn" onclick="deleteWorker(${index})">×</button>
        `;
        list.appendChild(li);
        //Crea una opción para el dropdown del modal con el nombre del trabajador
        let opt = document.createElement('option');
        opt.value = w;
        opt.textContent = w;
        dropdown.appendChild(opt);
    });
}
//Funcion que muestra el calendario en pantalla
function renderCalendar() {
    const monthIndex = parseInt(document.getElementById('monthSelect').value);
    const year = 2026; 
    const grid = document.getElementById('calendarGrid');
    const display = document.getElementById('currentMonthDisplay');
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    display.innerText = `${months[monthIndex]} ${year}`;
    grid.innerHTML = "";

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
       
        const dateObj = new Date(year, monthIndex, i);
        const dayName = dayNames[dateObj.getDay()];

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.onclick = (e) => {
            if (e.target.className !== 'shift-tag') openModal(i);
        };
        
        const dateKey = `${monthIndex}-${i}`;
        
        let shiftsHtml = (schedules[dateKey] || []).map((s, shiftIdx) => {
            
            const start12 = formatTwelveHour(s.shiftStart);
            const end12 = formatTwelveHour(s.shiftEnd);
            
            return `<div class="shift-tag" onclick="removeShift('${dateKey}', ${shiftIdx})">
                ${s.workerName} (${start12} - ${end12})
            </div>`;
        }).join('');

        //Contenido HTML de cada celda del calendario, mostrando el día y los turnos asignados
        cell.innerHTML = `
            <div class="day-header">
                <span class="day-label">${dayName}</span>
                <span class="day-num">${i}</span>
            </div>
            <div class="shift-container">${shiftsHtml}</div>
        `;
        //Agrega la celda al grid del calendario
        grid.appendChild(cell);
    }
}
//Abre el modal para asignar turnos a un día específico, mostrando el día seleccionado en el título del modal
function openModal(day) {
    if (workers.length === 0) {
        alert("Please add a worker in the sidebar first.");
        return;
    }
    selectedDay = day;
    document.getElementById('selectedDateText').innerText = `Schedule for Day ${day}`;
    document.getElementById('scheduleModal').style.display = 'block';
}
//Cierra el modal de asignación de turnos
function closeModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}
//Guarda el turno asignado al día seleccionado, añadiendo el nuevo turno al arreglo de turnos del día sin eliminar los anteriores
function saveShift() {
    const month = document.getElementById('monthSelect').value;
    const name = document.getElementById('workerDropdown').value;
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    const key = `${month}-${selectedDay}`;

    if (!schedules[key]) schedules[key] = [];
    schedules[key].push({ name, start, end });

    closeModal();
    renderCalendar();
}



// Funcion para exportar los datos de los turnos en formato JSON, creando un enlace de descarga con el contenido del objeto schedules convertido a JSON
function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "work_schedule.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
//Guarda el turno asignado al día seleccionado, añadiendo el nuevo turno al arreglo de turnos del día sin eliminar los anteriores. Cada turno se guarda como un objeto con el nombre del trabajador, hora de inicio, hora de fin y un timestamp para referencia.
function saveShift() {
    const month = document.getElementById('monthSelect').value;
    const name = document.getElementById('workerDropdown').value;
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    const key = `${month}-${selectedDay}`;

   
    if (!schedules[key]) schedules[key] = [];
    
    schedules[key].push({
        workerName: name,
        shiftStart: start,
        shiftEnd: end,
        timestamp: new Date().toISOString()
    });

    closeModal();
    renderCalendar();
}
//Función para eliminar un turno específico
function removeShift(key, index) {
    schedules[key].splice(index, 1);
    renderCalendar();
}
//Función para convertir el formato de hora de 24h a 12h 
function formatTwelveHour(timeString) {
    let [hours, minutes] = timeString.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}