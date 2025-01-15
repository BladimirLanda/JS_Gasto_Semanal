//SIMULADOR GASTOS SEMANALES

//Selección HTML
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
const restanteDiv = document.querySelector('#presupuesto > div:nth-child(2)');
const btnMain = formulario.querySelector('button[type="submit"]');

//Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    //<-->//
    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto]
        this.calcularRestante();
    }

    //<-->//
    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }

    //<-->//
    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidadGasto, 0);
        this.restante = this.presupuesto - gastado;
    }
}

//--//
class InterfaceUser {
    insertarPresupuesto(cantidades) {
        const { presupuesto, restante } = cantidades;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    //<-->//
    imprimirAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert'); //Bootstrap clases

        if(tipo === "error") {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje;
        document.querySelector('.primario').insertBefore(divMensaje, formulario)

        setTimeout(() => {
            divMensaje.remove();
        }, 2000);
    }

    //<-->//
    mostrarGastos(gastos) {
        limpiarHtml(gastoListado);

        gastos.forEach(gasto => {
            const { nombreGasto, cantidadGasto, id } = gasto;

            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id; //.dateset: Establece el atributo 'data' y su tipo '.tipo' = 'data-tipo'.
            nuevoGasto.innerHTML = `${nombreGasto} <span class="badge badge-primary badge-pill">$ ${cantidadGasto}</span>`;

            const btnBorrar = document.createElement('button');
            btnBorrar.innerHTML = 'Borrar &times;'
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.onclick = () => {
                eliminarGasto(id); //Ambito Global
            }

            nuevoGasto.appendChild(btnBorrar);
            gastoListado.appendChild(nuevoGasto);
        });
    }

    //<-->//
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    //<-->//
    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;

        //Comprobar 75%
        if(restante < presupuesto * 0.25) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        //Comprobar 50%
        } else if(restante < presupuesto * 0.5) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        if(restante <= 0) {
            this.imprimirAlerta('El presupuesto se ha agotado', 'error')
            btnMain.disabled = true;
            return;
        }

        btnMain.disabled = false;
    }
}

//Instancia
const interfaceUser = new InterfaceUser();
let presupuesto;

//Eventos
cargarEventos();

function cargarEventos() {
    document.addEventListener('DOMContentLoaded', () => preguntarPresupuesto());
    formulario.addEventListener('submit', e => agregarGasto(e));
}

//Funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cúal es tu presupuesto?');

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        /*
        La propiedad .location se utiliza para obtener la dirección (URL) de la página actual.
        El método .reload() recarga el URL actual.
        */
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);

    interfaceUser.insertarPresupuesto(presupuesto);
}

//--//
function agregarGasto(e) {
    e.preventDefault();

    const nombreGasto = document.querySelector('#gasto').value;
    const cantidadGasto = Number(document.querySelector('#cantidad').value);


    if(nombreGasto === '' || cantidadGasto === '') {
        interfaceUser.imprimirAlerta('Ambos campos son obligatorio', 'error');
        return
    }
    if(cantidadGasto <= 0 || isNaN(cantidadGasto)) {
        interfaceUser.imprimirAlerta('Cantidad no valida', 'error');
        return;
    }
    if(!isNaN(nombreGasto)) {
        interfaceUser.imprimirAlerta('Formato de Gasto no valido ', 'error');
        return;
    }

    /*
    Object Literal Enhancement.
    Se utiliza para agrupar variables del ámbito global y transformarlas 
    en propiedades de Objeto. Es el proceso de reestructuración inverso.
    */
    const gasto = {
        nombreGasto, 
        cantidadGasto, 
        id: Date.now()
    }

    presupuesto.nuevoGasto(gasto);
    interfaceUser.imprimirAlerta('Gasto Agregado', 'correcto');

    const { gastos, restante } = presupuesto;
    interfaceUser.mostrarGastos(gastos);
    interfaceUser.actualizarRestante(restante);
    interfaceUser.comprobarPresupuesto(presupuesto);

    formulario.reset();
}

//--//
function eliminarGasto(id) {
    const alerta = document.querySelector('.alert');
    alerta?.remove();

    presupuesto.eliminarGasto(id);

    interfaceUser.imprimirAlerta('Gasto Eliminado', 'exito');

    const { gastos, restante } = presupuesto;
    interfaceUser.mostrarGastos(gastos);
    interfaceUser.actualizarRestante(restante);
    interfaceUser.comprobarPresupuesto(presupuesto);
}

//--//
function limpiarHtml(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}