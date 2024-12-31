<?php

class Usuario {
    public static function find() {
        
    }
    public static function domicilioContains() {
        
    }
    public static function nombreStartsWith() {
        
    }
    public static function apellidoEndsWith() {
        
    }
}

class QueryEngine{
    public static function or() {
        
    }
}

/*Obtener usuario por ID. Convencional */
/* $sql = "SELECT * from usuario where id = 2"*/
/* Procesar consulta SQL */
/* $nombre = $resultado["usuario"]; // Quien desarrolla debe tipear correctamente
un atributo existente */

//Con framework:

$usuario = Usuario::find(2);
$nombre = $usuario->nombre;

/*Listar usuarios con criterios. Convencional*/
/* $sql = "SELECT * from usuarios where domicilio like '%9%' or nombre like 'ma%' or apellido like '%ez'" */
/* Procesar consulta SQL en un array */


//Con framework:

$lista_usuarios = QueryEngine::or(Usuario::domicilioContains('9'),Usuario::nombreStartsWith('ma'),Usuario::apellidoEndsWith('ez'));

?>