async function createCalendar ({locale, year, zona}) {

    /** Se usa el spread ... para crear el array [0,1,2,3,4,5,6] */
    const weekDays = [...Array(7).keys()];
    const months   = [...Array(12).keys()];
    
    var festivos = await cargarFestivos(zona, year); 

    /** Se cargan los cumpleaños*/
    const cumpleanos = await cargarCumpleanos();

    /** Se define el idioma con locale y weekday define el formato */
    const intlWeekDay = new Intl.DateTimeFormat(locale, {weekday: 'short'});
    const intlMonths  = new Intl.DateTimeFormat(locale, {month: 'long'});
    
    let nFestivosElement = document.getElementById("festivity-count");
    nFestivosElement.textContent = festivos.length;

    /** 
     * Contiene un array de objetos al recorrer los meses por cada mes la funcion flecha
     * devuelve un objeto
     * @returns {object} Cada objeto es un mes que contiene los parametros:
     * @param {String} monthName Nombre del mes según el año y el mes que empieza en 0
     * @param {number} daysOfMonth Número de días del mes getdate() lo hace si le pones dia 0 pues te deja en el ultimo dia del mes anterio
     * @param {number} monthKey De 0 a 11 en los dias del mes se hace +1 pues día 0 lo pasa al mes anterior
     * @param {number} startsOn Posicion deempiece del primer día del mes, de domingo 1 a sabado 7 
     * (para arreglarlo se le hace +6 se calcula el resto de divir entre 7 y se le suma 1
     * asi queda de lunes 1 a domingo 7)
    */
    const calendar = months.map(monthKey => {
        return {
            monthName: intlMonths.format(new Date(year, monthKey)),
            daysOfMonth: new Date(year, monthKey + 1, 0).getDate(),
            startsOn: (new Date(year, monthKey, 1).getDay() + 6) % 7 + 1,
            monthKey: monthKey
        }
    });

    /**
     * El 1 de enero de 2024 cae en lunes al recorrer weekDays genera los dias, ejemplos:
     * [lun,mar,mie,jue,vie,sab,dom] localizacion definida como es.
     * [月,火,水,木,金,土,日] localizacion definida como ja.
    */
    const weekDaysNames = weekDays.map(weekdayIndex => {
        const weekDayName = intlWeekDay.format(new Date(2024, 0, weekdayIndex + 1));
        return weekDayName
    });

    /** 
     * Se generan los elementos de la lista que después serán insertados en el ol 
     * se usa el template `` para insertar variables y el .join("") para quitar las comas
    */
    const renderedWeekDays = weekDaysNames.map(weekDayName => 
        `<li class="day-name">${weekDayName}</li>`).join("");

    /**
     * Se recorren los meses y se crea el html necesario para pintarlos
     *  @param {object} mes Contiene datos referente al mes 
    */
    const html = calendar.map(({monthKey, daysOfMonth, monthName, startsOn}) => {

        const days = [...Array(daysOfMonth).keys()];   
        
        /** Se crea un array con los festivos y cumples filtrando solo los de este mes */
        let fMes = festivos.filter(festividad => monthKey === new Date(festividad.date).getMonth())
        .concat(cumpleanos.filter(cumpleaños => monthKey === new Date(cumpleaños.date).getMonth()));
        
        /** Se crean los elementos de la lista (dias del mes) con los estilos de cada dia */
        const renderedDays = days.map((day, index) => {
            
            /** Busca dentro del array los festivos que trae, el find devuelve el primer elemento coincidente */
            const esFestivo = fMes.find(festivo => new Date(festivo.date).getDate() === index+1);
            
            const cumpleaneros = fMes.filter(cumple => 
                cumple.municipalityEs ==="Cumpleanos" && 
                cumple.WorkplaceName === "VITORIA" && 
                new Date(cumple.date).getDate() === index + 1);
                
            let firstDayColumn = index === 0 ? `style = '--first-day-start: ${startsOn}'` : '';
            let nombreFestividad = '';
            let clases = [];
            
            if(firstDayColumn) clases.push('first-day');
            
            if(esFestivo){
                /** a la izquierda el valor del json a la derecha el selector de css que utilizara con los colores correspondientes */
                const tipoFestividadMap = {
                    "CAE": "festivo nacional",
                    "Zamudio": "festivo local",
                    "Vitoria-Gasteiz": "festivo local",
                    "Álava - Araba": "festivo autonomico"
                }

                // Si es festivo, asignar la descripción y añadir la clase correspondiente
                nombreFestividad = esFestivo.descripcionEs ? `🎉 ${esFestivo.descripcionEs},` : '';
    
                /** Si el array devuelve valor pondra el selector si no devuelve valor coge 'laboral' por defecto */                
                clases.push(tipoFestividadMap[esFestivo.municipalityEs] || 'laboral');               
            }

           // Si el tipo es cumpleaños, añades un estilo especial
            if (cumpleaneros.length){
                                
                nombreFestividad += cumpleaneros.map(c => `🎂 ${c.NombreCompleto}`).join(', ');
                clases.push('cumpleanos');
            }
                        
            /** Se crea un string con los estilos de cada dia */
            let estilo = `class='${clases.join(' ')}' ${firstDayColumn} data-festividad='${nombreFestividad}' title='${nombreFestividad}'`.trim();
          
            let fechaFestividad = `data-date= '${new Date(year, monthKey, day+1).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })}'`;

            return `<li ${fechaFestividad} ${estilo}>${day + 1}</li>`
            
        }).join('');
        
        /** Los elementos creados se añaden a una lista ordenada dentro de cada seccion*/
        return `<section>
                    <h1>${monthName}</h1>
                    <ol>
                        ${renderedWeekDays} 
                        ${renderedDays}
                    </ol>
                </section>`
    }).join("")
        
    /** Se inserta el html en el contenedor */
    document.querySelector(".container").innerHTML = html;
}

/**
 * Carga los días festivos de una zona específica.
 *
 * @param {string} zona - El nombre de la zona para la cual se desean cargar los festivos.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de objetos que representan los días festivos filtrados.
 * @throws {Error} Si ocurre un error al cargar los festivos.
 */
async function cargarFestivos(zona, year) {
    /** Alava */
    var municipio = "Vitoria-Gasteiz";
    switch (zona) {
        case 'Vitoria-Gasteiz':
            municipio = "Vitoria-Gasteiz";
            break; 
        case 'Zamudio':
            municipio = "Zamudio";
            break;
    }

    try {
        const festivosZona = "https://opendata.euskadi.eus/contenidos/ds_eventos/calendario_laboral_"+year+"/opendata/calendario_laboral_"+year+".json";
        const response = await fetch(festivosZona);
        const festivos = await response.json();

        let festivosFiltrados = festivos.filter(festividad => 
            ["CAE", zona, "Álava - Araba"].includes(festividad.municipalityEs) 
        );

        // Añadir los días 24 y 31 de diciembre como festivos
        festivosFiltrados.push(
            {
                date: `${year}-12-24`,
                descripcionEs: "Festivo por convenio Art. 22, párr. 5",
                municipalityEs: "CAE"
            },
            {
                date: `${year}-12-31`,
                descripcionEs: "Festivo por convenio Art. 22, párr. 5",
                municipalityEs: "CAE"
            }
        );

        return festivosFiltrados;

    } catch (error) {
        console.error("Error al cargar los festivos:", error);
        return [];
    }
}

/**
 * Carga y filtra asincrónicamente los datos de cumpleaños desde un archivo JSON.
 *
 * Esta función obtiene los datos de cumpleaños desde una URL especificada, analiza la respuesta JSON,
 * y filtra los datos para incluir solo aquellas entradas donde el `WorkplaceName` sea "VITORIA".
 *
 * @returns {Promise<Array<Object>>} Una promesa que se resuelve en un array de objetos de cumpleaños
 *                                   filtrados por el nombre del lugar de trabajo "VITORIA". Si ocurre un error,
 *                                   la promesa se resuelve en un array vacío.
 *
 * @throws {Error} Si hay un problema al obtener o analizar los datos JSON.
 */
async function cargarCumpleanos() {
    try {
        const url = "https://raw.githubusercontent.com/sirloco/Calendario/refs/heads/master/data/cump.json";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error al cargar el archivo JSON de cumpleaños");
        }
        const cumpleaños = await response.json();

        // Filtrar solo los de Vitoria
        return cumpleaños.filter(c => c.WorkplaceName === "VITORIA");

    } catch (error) {
        console.error("Error al cargar los cumpleaños:", error);
        return [];
    }
}


async function cargaCumpleanos() {
    try {
        const url = "https://raw.githubusercontent.com/sirloco/Calendario/refs/heads/master/data/cump.json";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error al cargar el archivo JSON de cumpleaños");
        }
        cumpleanosData = await response.json(); // Guardamos los datos en la variable global
        cumpleanosData = cumpleanosData.filter(c => c.WorkplaceName === "VITORIA"); // Filtramos por Vitoria
    } catch (error) {
        console.error("Error al cargar los cumpleaños:", error);
    }
}




/**
 * Genera el calendario al avanzar un año
*/
function avanzarAnio() {
    // Obtener el elemento del año actual
    const currentYearElement = document.getElementById("current-year");
    var zoneSelect = document.getElementById("zone-select");
    var selectedZone = zoneSelect.value;

    // Obtener el año actual
    let currentYear = parseInt(currentYearElement.textContent);
    // Incrementar el año
    currentYear++;
    // Actualizar el año en el elemento
    currentYearElement.textContent = currentYear;
    // Llamar a createCalendar() con el nuevo año
    createCalendar({ year: currentYear, locale: 'es', zona: selectedZone});
}

/**
 * Genera el calendario al retroceder un año
*/
function retrocederAnio() {
    // Obtener el elemento del año actual
    const currentYearElement = document.getElementById("current-year");
    var zoneSelect = document.getElementById("zone-select");
    var selectedZone = zoneSelect.value;
    // Obtener el año actual
    let currentYear = parseInt(currentYearElement.textContent);
    // Decrementar el año
    currentYear--;
    // Actualizar el año en el elemento
    currentYearElement.textContent = currentYear;
    // Llamar a createCalendar() con el nuevo año
    createCalendar({ year: currentYear, locale: 'es', zona: selectedZone});
}

/**
 * Genera el calendario al seleccionar una zona diferente
*/
function cambioZona(){
    var currentYearElement = document.getElementById("current-year");
    var zoneSelect = document.getElementById("zone-select");
    let currentYear = parseInt(currentYearElement.textContent);
    var selectedZone = zoneSelect.value;
    createCalendar({year: currentYear, locale: 'es', zona: selectedZone});
}

/**
 * 
 * @param {*} event 
 */
function mostrarTextoFestivo(event) {
    let target = event.target;
    let festividad = target.dataset.festividad;
    let fechaFestividad = target.dataset.date;
    let cartelContainer = document.getElementById("festivity-name");

    if (festividad) {
        let festividadesArray = festividad.split(",");
        cartelContainer.innerHTML =`
        <p><strong>${fechaFestividad}</strong></p>
        <ul>${festividadesArray.map(f => `<li>${f}</li>`).join("")}</ul>`;
    }
}

// Añadir el evento mouseover a todos los días
let dias = document.querySelectorAll('#days-list .day');
dias.forEach(dia => {
    dia.addEventListener('mouseover', mostrarTextoFestivo);
});

// Restaurar texto por defecto al sacar el ratón
dias.forEach(dia => {
    dia.addEventListener('mouseout', () => {
        let cartelContainer = document.getElementById("festivity-name");
        //cartelContainer.textContent = "Pasa el ratón sobre un día para ver más detalles";  // Texto por defecto
    });
});

/**
 * Oculta el texto del nombre del festivo en la cabecera
 * @param {*} event desencadenador del evento al retirar el raton de encima
*/
function ocultarTextoFestivo(event) {
    let target = event.target;
    if (event.target.classList.contains("festivo")) {
        let cartel = document.getElementById("festivity-name");
        cartel.textContent = ""
    }
};

/*document.getElementById("search").addEventListener("input", function() {
    let query = this.value.trim().toLowerCase();
    let resultadosContainer = document.getElementById("resultados"); // Div donde se mostrarán los resultados

    if (query.length < 2) {
        resultadosContainer.innerHTML = ""; // No mostramos nada si tiene menos de 2 caracteres
        return;
    }

    let resultados = cumpleanosData.filter(persona => 
        persona.NombreCompleto.toLowerCase().includes(query)
    );

    if (resultados.length === 0) {
        resultadosContainer.innerHTML = "<p>No hay coincidencias</p>";
        return;
    }

    // Pintamos los resultados en la lista
    resultadosContainer.innerHTML = `
        <ul>${resultados.map(c => `<li>${c.NombreCompleto} - ${c.FechaNacimiento}</li>`).join("")}</ul>
    `;
});*/


/** Agregar eventos de clic a los botones de navegación de año y festivos*/
document.getElementById("prev-year").addEventListener("click", retrocederAnio);
document.getElementById("next-year").addEventListener("click", avanzarAnio);
document.getElementById("zone-select").addEventListener("click", cambioZona);
document.addEventListener("mouseover", (event) => mostrarTextoFestivo(event));
document.addEventListener("mouseout", (event) => ocultarTextoFestivo(event));

var urteSelect = document.getElementById("current-year");
var zoneSelect = document.getElementById("zone-select");

var selectedZone = zoneSelect.value;

let date = new Date();
let currYear = date.getFullYear();
urteSelect.textContent = currYear;

let cumpleanosData = [];
cargaCumpleanos();
createCalendar({year: currYear, locale: 'es', zona: selectedZone});
