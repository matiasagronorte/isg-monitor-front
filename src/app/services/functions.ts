

export function obtenerFechaMasXDias(x: number): string {
    const hoy: Date = new Date(); // Obtiene la fecha de hoy
    const fechaMasXDias: Date = new Date(hoy.getTime() + x * 24 * 60 * 60 * 1000); // Suma X días a la fecha de hoy

    // Obtiene los componentes de la fecha
    const year: number = fechaMasXDias.getFullYear();
    const month: string = (fechaMasXDias.getMonth() + 1).toString().padStart(2, '0'); // El mes comienza desde 0, por eso se suma 1
    const day: string = fechaMasXDias.getDate().toString().padStart(2, '0');

    // Retorna la fecha en el formato 'yyyy-mm-dd'
    return `${year}-${month}-${day}`;
}

export function formatearFechaHora(fechahora: string) {

    let comps_fh = fechahora.split(" ")

    let hora = "";
    if (comps_fh.length > 1)
        hora = comps_fh[1]

    let fecha = comps_fh[0]

    let comps = fecha.split("-")
    return comps[2] + "/" + comps[1] + "/" + comps[0] + " " + hora
}

export function primeraFechaEsMenor(fecha1: string, fecha2: string) {
    // Convertir las cadenas de fecha en objetos Date
    const date1 = new Date(fecha1);
    const date2 = new Date(fecha2);

    // Verificar si la primera fecha es menor que la segunda fecha
    return date1 < date2;

}

export function formatearFechaHoraEstandar(fechahora: Date){

    const year = fechahora.getFullYear();
    const month = ('0' + (fechahora.getMonth() + 1)).slice(-2); // Añade un cero delante si es necesario
    const day = ('0' + fechahora.getDate()).slice(-2); // Añade un cero delante si es necesario
    const hours = ('0' + fechahora.getHours()).slice(-2); // Añade un cero delante si es necesario
    const minutes = ('0' + fechahora.getMinutes()).slice(-2); // Añade un cero delante si es necesario
    const seconds = ('0' + fechahora.getSeconds()).slice(-2); // Añade un cero delante si es necesario
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}