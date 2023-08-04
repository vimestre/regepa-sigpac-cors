# Servidor Node + Express para realizar consultas a datos del SigPac y del Regepa y evitar el CORS

Es un pequeño servidor para poder obtener datos del SigPac y del Regepa desde una aplicación cliente
Corre sobre Node y utiliza los paquetes: express, cors, body-parser, form-data (para interactuar con el Regepa) y node-fetch

## GET -> /Municipio/:provinciaId/:municipioId

Devuelve el BoindingBox (las coordenadas noroeste y sureste) del municipio proporcionado

## GET -> /Regepa/:NIF

Devuelve el código Regepa para el NIF proporcionado

## GET -> /Coord/:lat/:lng

Devuelve la parcela a la que pertenecen las coordenadas proporcionadas
