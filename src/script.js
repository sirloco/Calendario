async function createCalendar ({locale, year, zona}) {
    
    const weekDays = [...Array(7).keys()]// dias de la semana del 0 al 6
    const intlWeekDay = new Intl.DateTimeFormat(locale, {weekday: 'short'})

    const festivos = await cargarFestivos();
        
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
    // Obtener el elemento span (botonera)
    var urteSelect = document.getElementById("current-year");
    // Establecel el año actual como predeterminado entre los botones
    urteSelect.textContent = year;
}


// Función para avanzar un año
function avanzarAnio() {
    // Obtener el elemento del año actual
    const currentYearElement = document.getElementById("current-year");
    // Obtener el año actual
    let currentYear = parseInt(currentYearElement.textContent);
    // Incrementar el año
    currentYear++;
    // Actualizar el año en el elemento
    currentYearElement.textContent = currentYear;
    // Llamar a createCalendar() con el nuevo año
    createCalendar({ year: currentYear, locale: 'es', zona: "" });
}

// Función para retroceder un año
function retrocederAnio() {
    // Obtener el elemento del año actual
    const currentYearElement = document.getElementById("current-year");
    // Obtener el año actual
    let currentYear = parseInt(currentYearElement.textContent);
    // Decrementar el año
    currentYear--;
    // Actualizar el año en el elemento
    currentYearElement.textContent = currentYear;
    // Llamar a createCalendar() con el nuevo año
    createCalendar({ year: currentYear, locale: 'es', zona: "" });
}

// Agregar eventos de clic a los botones de navegación de año
document.getElementById("prev-year").addEventListener("click", retrocederAnio);
document.getElementById("next-year").addEventListener("click", avanzarAnio);

let date = new Date(),
currYear = date.getFullYear()
selectYear({year:currYear})
createCalendar({year: currYear, locale: 'es', zona:""})