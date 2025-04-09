export interface Usuario {
    id?: number;       // Usar ? indica que es opcional
    email: string;
    password: string;
    rol: string;
    // Agrega otros campos según sea necesario
}

export interface Person {
    id?: number;       // Usar ? indica que es opcional
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    correoElectronico: string;
    telefono: number;
    id_usuario: number;

    // Agrega otros campos según sea necesario
}