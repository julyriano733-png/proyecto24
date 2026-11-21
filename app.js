const botonMas = document.getElementById('boton-mas');
const inputImagen = document.getElementById('input-imagen');
const listaHistorias = document.getElementById('lista-historias');
const visor = document.getElementById('visor');
const contenedorBarras = document.getElementById('barras');
const imagenVisor = document.getElementById('imagen-visor');
const botonCerrar = document.getElementById('boton-cerrar');
const zonaIzquierda = document.getElementById('zona-izquierda');
const zonaDerecha = document.getElementById('zona-derecha');

let historias = [];        
let indiceActual = 0;      
let progreso = 0;          
let reloj;              
let visorAbierto = false;  
let inicioX = 0;           

const horas24 = 24 * 60 * 60 * 1000;

function cargarHistorias() {
  const guardado = localStorage.getItem('historias');
  if (guardado) {
    historias = JSON.parse(guardado);
  }
}

function guardarHistorias() {
  try {
    localStorage.setItem('historias', JSON.stringify(historias));
    return true;
  } catch (error) {
    return false;
  }
}


function borrarVencidas() {
  const ahora = Date.now();
  const vigentes = [];

  for (let i = 0; i < historias.length; i++) {
    if (ahora - historias[i].fecha < horas24) {
      vigentes.push(historias[i]);
    }
  }

  if (vigentes.length !== historias.length) {
    historias = vigentes;
    guardarHistorias();
    mostrarLista();
  }
}

botonMas.onclick = function () {
  inputImagen.click();
};

inputImagen.onchange = function () {
  const archivo = inputImagen.files[0];

  if (!archivo) {
    return;
  }
  const lector = new FileReader();
  lector.onload = function () {
    cargarImagen(lector.result);
  };
  lector.readAsDataURL(archivo);

  inputImagen.value = '';
};

function cargarImagen(texto) {
  const imagen = new Image();

  imagen.onload = function () {
    agregarHistoria(imagen);
  };

  imagen.onerror = function () {
    alert('No se pudo leer la imagen.');
  };

  imagen.src = texto;
}

function agregarHistoria(imagen) {
  const base64 = achicarImagen(imagen);

  historias.push({ imagen: base64, fecha: Date.now() });

  const seGuardo = guardarHistorias();

  if (seGuardo === false) {
    historias.pop();
    alert('No hay espacio para más historias.');
    return;
  }

  mostrarLista();
}

function achicarImagen(imagen) {
  let ancho = imagen.width;
  let alto = imagen.height;

  if (ancho > 1080) {
    alto = alto * 1080 / ancho;
    ancho = 1080;
  }

  if (alto > 1920) {
    ancho = ancho * 1920 / alto;
    alto = 1920;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(ancho);
  canvas.height = Math.round(alto);
  const contexto = canvas.getContext('2d');

  contexto.fillStyle = 'white';
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.7);
}


function mostrarLista() {
  listaHistorias.innerHTML = '';

  for (let i = 0; i < historias.length; i++) {
    const boton = document.createElement('button');
    boton.className = 'circulo-historia';

    const imagen = document.createElement('img');
    imagen.src = historias[i].imagen;
    boton.appendChild(imagen);

    boton.onclick = function () {
      abrirVisor(i);
    };

    listaHistorias.appendChild(boton);
  }
}



function abrirVisor(indice) {
  indiceActual = indice;
  visorAbierto = true;
  crearBarras();
  visor.classList.remove('oculto');
  mostrarHistoria();
}

function cerrarVisor() {
  clearInterval(reloj);  
  visor.classList.add('oculto');
  visorAbierto = false;
}

function crearBarras() {
  contenedorBarras.innerHTML = '';

  for (let i = 0; i < historias.length; i++) {
    const barra = document.createElement('div');
    barra.className = 'barra';

    const relleno = document.createElement('div');
    relleno.className = 'relleno';

    barra.appendChild(relleno);
    contenedorBarras.appendChild(barra);
  }
}

function mostrarHistoria() {
  imagenVisor.src = historias[indiceActual].imagen;
  progreso = 0;
  actualizarBarras();

  clearInterval(reloj);
  reloj = setInterval(avanzarProgreso, 30);
}

function avanzarProgreso() {
  progreso = progreso + 1;

  if (progreso >= 100) {
    siguienteHistoria();
  } else {
    actualizarBarras();
  }
}

function actualizarBarras() {
  const rellenos = contenedorBarras.querySelectorAll('.relleno');

  for (let i = 0; i < rellenos.length; i++) {
    if (i < indiceActual) {
      rellenos[i].style.width = '100%';
    } else if (i === indiceActual) {
      rellenos[i].style.width = progreso + '%';
    } else {
      rellenos[i].style.width = '0%';
    }
  }
}

function siguienteHistoria() {
  if (indiceActual < historias.length - 1) {
    indiceActual = indiceActual + 1;
    mostrarHistoria();
  } else {
    cerrarVisor();  
  }
}

function anteriorHistoria() {
  if (indiceActual > 0) {
    indiceActual = indiceActual - 1;
  }
  mostrarHistoria();
}



botonCerrar.onclick = cerrarVisor;
zonaIzquierda.onclick = anteriorHistoria;  // tocar la izquierda: atrás
zonaDerecha.onclick = siguienteHistoria;   // tocar la derecha: adelante

visor.ontouchstart = function (evento) {
  inicioX = evento.touches[0].clientX;
};

visor.ontouchend = function (evento) {
  const finX = evento.changedTouches[0].clientX;
  const diferencia = finX - inicioX;

  if (diferencia < -50) {
    siguienteHistoria();   
  } else if (diferencia > 50) {
    anteriorHistoria();    
  }
};


cargarHistorias();  
borrarVencidas();    
mostrarLista();      

setInterval(function () {
  if (visorAbierto === false) {
    borrarVencidas();
  }
}, 60000);