async function createCalendar ({locale, year, zona}) {

    /** Se usa el spread ... para crear el array [0,1,2,3,4,5,6] */
    const weekDays = [...Array(7).keys()];
    const months   = [...Array(12).keys()];
    
    var festivos = await cargarFestivos(zona); 

    // Cargar los cumpleaños reales en lugar de los de prueba
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
        


        /** Se crea un array con los festivos filtrando solo los de este mes */
        //let fMes = festivos.filter(festividad => monthKey === new Date(festividad.date).getMonth());


        let fMes = festivos.filter(festividad => monthKey === new Date(festividad.date).getMonth())
        .concat(cumpleanos.filter(cumpleaños => monthKey === new Date(cumpleaños.FechaNacimiento).getMonth()));
   

        /** Se crean los elementos de la lista (dias del mes) con los estilos de cada dia */
        const renderedDays = days.map((day, index) => {
            
            /** Busca dentro del array los festivos que trae, el find devuelve el primer elemento coincidente */
            const esFestivo = fMes.find(festivo => new Date(festivo.date).getDate() === index+1);
            //const esCumple = cumpleanos.find(cumple => new Date(cumple.FechaNacimiento).getDate() === index + 1 && cumple.WorkplaceName === "VITORIA");

            let nombreFestividad = '';
            let estilo = "class='laboral'";
            
            if(esFestivo) {
                /** a la izquierda el valor del json a la derecha el selector de css que utilizara con los colores correspondientes */
                const tipoFestividadMap = {
                    "CAE": "festivo nacional",
                    "Zamudio": "festivo local",
                    "Vitoria-Gasteiz": "festivo local",
                    "Álava - Araba": "festivo autonomico"
                }

                nombreFestividad = esFestivo.descripcionEs;
                /** Si el array devuelve valor pondra el selector si no devuelve valor coge 'laboral' por defecto */
                let tipoFestividad = tipoFestividadMap[esFestivo.municipalityEs] || 'laboral';
                estilo = `class='${tipoFestividad}' data-festividad='${nombreFestividad}' title='${nombreFestividad} 🎉'`;

                console.log(fMes);
                
                // Si el tipo es cumpleaños, añades un estilo especial
               /* if (esCumple) {
                    nombreFestividad = `${esCumple.NombreCompleto} (Cumpleaños)`;
                    estilo = `class='cumpleanos' data-festividad='${nombreFestividad}'`;
                }*/


            }



            if(index === 0){
                /** Se le pasa al css la columna del grid donde debe colocar el dia 1 */
                let styleFirstDay = `style="--first-day-start: ${startsOn}"`
                estilo = esFestivo? `class='first-day festivo nacional' data-festividad='${nombreFestividad}' ${styleFirstDay}`:`class='first-day' ${styleFirstDay}`
            }
   
            return `<li ${estilo}>${day + 1}</li>`
            
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
    
    /** 
     * Se crea un array de objetos cada objeto es un dia festivo
     * @returns {object} festivos de la lista contiene los parametros:
     * @param {string} festivity_date fecha de la festividad YYYY-MM-DD
     * @param {string} festivity_name_es nombre de la festividad en castellano
     * @param {string} festivity_name_eu nombre de la festividad en euskera
     * @param {string} geo_code codigo del territorio (provincia)
     * @param {string} latwgs84 latitud es null cuando es de toda la comunidad
     * @param {string} location_es ubicacion de la festividad en castellano
     * @param {string} location_eu ubicacion de la festividad en euskera
     * @param {string} lonwgs84 longintud es null cuando es de toda la comunidad
     * @param {string} territory_name nombre de la provincia (si es de comunidad:"Todas/denak")
    */ 
    async function cargarFestivos(zona) {
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
                (festividad.municipalityEs === "CAE" || festividad.municipalityEs === zona || festividad.municipalityEs === "Álava - Araba")
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

    async function cargarCumpleanos() {
        try {
            const url = "https://raw.githubusercontent.com/sirloco/Calendario/refs/heads/master/data/cump.json";
            console.log(url);
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
    

    /** Se inserta el html en el contenedor */
    document.querySelector(".container").innerHTML = html;


    // Inicializar los tooltips de los festivos y cumpleaños
    /*document.querySelectorAll(".festivo, .cumpleanos").forEach(element => {
        tippy(element, {
            content: element.getAttribute("data-festividad"), // Usa el atributo personalizado para el texto
            placement: "top",  // Posición del tooltip
            animation: "fade", // Animación suave
            theme: "tomato",    // Tema claro
        });
    });*/
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
 * Muestra el texto del nombre del festivo en la cabecera
 * @param {*} event desencadenador del evento al notar el raton encima
*/
function mostrarTextoFestivo(event){
    let target = event.target;    
    if (target.classList.contains("festivo")) {
      let cartel = document.getElementById("festivity-name");
      cartel.textContent = target.dataset.festividad;
    }
}

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

createCalendar({year: currYear, locale: 'es', zona: selectedZone});
