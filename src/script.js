const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

// se guardan los meses en un array
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
              "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const renderCalendar = () => {
    // se guarda el primer dia del mes
    let firstDayofMonth = new Date(currYear, currMonth, 0).getDay(),
    // se guarda la ultima fecha del mes
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
    // se guarda el ultimo dia del mes
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
    // se guarda la fecha del mes anterior
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); 
    let liTag = "";

    // se crea la li de los dias del mes anterior
    for (let i = firstDayofMonth; i > 0; i--) { 
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    // se crea la li de todos los dias del mes actual
    for (let i = 1; i <= lastDateofMonth; i++) { 
        // se añade una class al li del dia actual si coincide con el dia el mes y el año
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                     && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`

    }

    // se pasa el texto del mes y el año actual al html
    currentDate.innerText = `${months[currMonth]} ${currYear}`; 
    // se pasan todos los li  de los dias al html
    daysTag.innerHTML = liTag;
}
renderCalendar();

prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});