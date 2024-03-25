async function createCalendar ({locale, year, zona}) {
    
    const weekDays = [...Array(7).keys()]// dias de la semana del 0 al 6
    const intlWeekDay = new Intl.DateTimeFormat(locale, {weekday: 'short'})

    const festivos = await cargarFestivos();
    
/*    festivos.forEach(festividad => {
        console.log(new Date(festividad.festivity_date).getMonth());
        console.log("Fecha de Festividad:", festividad.festivity_date);
        console.log("Nombre de Festividad (Español):", festividad.festivity_name_es);
        console.log("Ubicación (Español):", festividad.location_es);
        console.log("--------------------");
    });*/

    
    // el uno de enero de 2024 cae en lunes al recorrer el mapa genera los dias
    const weekDaysNames = weekDays.map(weekdayIndex => {
        const weekDayName = intlWeekDay.format(new Date(2024, 0, weekdayIndex + 1))
        return weekDayName
    })

    const renderedWeekDays = weekDaysNames.map(weekDayName => 
        `<li class="day-name">${weekDayName}</li>`).join("")

    const months = [...Array(12).keys()]// meses del 0 al 11
    const intl = new Intl.DateTimeFormat(locale, {month: 'long'})

    const calendar = months.map(monthKey => {
        const monthName = intl.format(new Date(year, monthKey))
        const nextmMonthIndex = monthKey + 1
        const daysOfMonth = new Date(year, nextmMonthIndex, 0).getDate()
        let startsOn = new Date(year, monthKey, 1).getDay()//getday() de domingo a sabado 0..6
        startsOn = (startsOn+6)%7+1// Esto hace que la semana empiece en lunes no domingo 1..7
        return {
            monthKey,
            monthName,
            daysOfMonth,
            startsOn
        }
    })

    // Función para cargar los festivos
    async function cargarFestivos() {
        try {
            const alava = "01"
            const vitoria = "01059";
            const zamudio = "48905";
            const bizkaia = "48";

            const festivosVitoria = festivosPaisVasco(alava, vitoria);
            const festivosZamudio = festivosPaisVasco(bizkaia, zamudio);
            const response = await fetch(festivosVitoria);
            const festivos = await response.json();
            return festivos;
        } catch (error) {
            console.error("Error al cargar los festivos:", error);
            return [];
        }
    }

    function festivosPaisVasco(territorio, municipio){
        return "https://api-calendario-laboral.online/api/v1/festivities/bylocation/"+territorio+"/"+municipio+"/bydate/"+year;
    }
    
    //const firstDayAttributes = `class='first-day' style='--first-day-start: ${calendar[0].startsOn}'`; 

    const html = calendar.map(({monthKey, daysOfMonth, monthName, startsOn}) => {
        const days = [...Array(daysOfMonth).keys()]      

        const titleMonth = `<h1>${monthName}</h1>`

        // se crea un array con los festivos de este mes
        let fMes = festivos.filter(festividad => monthKey === new Date(festividad.festivity_date).getMonth());
        //console.log("Mes: ",monthKey,fMes);

        const renderedDays = days.map((day, index) => {
                        
            //Busca dentro del array los festivos que trae
            const esFestivo = fMes.find(festivo => new Date(festivo.festivity_date).getDate() === index+1);
            
            let estilo = esFestivo? `class='festivo'` : `class='active'`;
            
            if(index === 0) 
                estilo = `class='first-day' style='--first-day-start: ${startsOn}'`;
            
            if(esFestivo && index === 0)
                estilo = `class='first-day-festivo' style='--first-day-start: ${startsOn}'`;
            
            return `<li ${estilo}>${day + 1}</li>`
            
        }).join('');

        return `<div>${titleMonth}<ol>${renderedWeekDays} ${renderedDays}</ol></div>`
    }).join("")

    document.querySelector(".container").innerHTML = html;
}

const selectYear = ({year}) => {
    // Obtener el elemento select
    var yearSelect = document.getElementById("year-select");
    
    const minYear = 1900;
    const maxYear = 2100;
    
    for (var i = minYear; i <= maxYear; i++) {
        var option = document.createElement("option");
        option.text = i;
        option.value = i;
        yearSelect.add(option);
      }
    
    // Establecer el año actual como la opción predeterminada seleccionada
    yearSelect.value = year;

    
}

let date = new Date(),
currYear = date.getFullYear()
selectYear({year:currYear})
createCalendar({year: currYear, locale: 'es', zona:""})


   // var yearSelected = document.getElementById("year-select").value;
   // console.log("año" + yearSelected)
   // createCalendar({year: yearSelected, locale: 'es'})



/////////////////////////////////////////////

/*const daysTag = document.querySelector(".days"),
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
    currentDate.innerText = `${months[currMonth]}`; 
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
});*/