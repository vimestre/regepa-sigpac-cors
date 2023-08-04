const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const FormData = require('form-data');
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));


app.get('/Municipio/:provinciaId/:municipioId', (async (req, res) => {
    let provinciaId = req.params.provinciaId;
    let municipioId = req.params.municipioId;

    const urlSigPac = `https://sigpac.mapama.gob.es/fega/serviciosvisorsigpac/query/municipiobox/${provinciaId}/${municipioId}.geojson`
    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });
        const data = (await resp.json()).features;
        res.send(data);
    } catch (err) {
        console.log(err);
        res.send('ERROR')
    }

}))

app.get('/ParcelasSigpac/:x/:y', (async (req, res) => {
    let x = req.params.x;
    let y = req.params.y;
    console.log('hola')

    const urlSigPac = `https://sigpac.mapama.gob.es/vectorsdg/vector/parcela@3857/15.${x}.${y}.geojson`
    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });
        const data = (await resp.json());
        console.log(data);
        res.send(JSON.stringify(data));
    } catch (err) {
        console.log(err);
        res.send('ERROR')
    }
}))

app.get('/Parcela/:provinciaId/:municipioId/:poligono/:parcela', (async (req, res) => {
    let provinciaId = req.params.provinciaId;
    let municipioId = req.params.municipioId;
    let poligono = req.params.poligono;
    let parcela = req.params.parcela;

    const urlSigPac = `https://sigpac.mapama.gob.es/fega/serviciosvisorsigpac/query/parcelabox/${provinciaId}/${municipioId}/0/0/${poligono}/${parcela}.geojson`
    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });
        const data = (await resp.json()).features;
        res.send(data);
    } catch (err) {
        console.log(err);
        res.send('ERROR')
    }

}))

app.get('/Coord/:lat/:lng', (async (req, res) => {
    //https://sigpac.mapama.gob.es/vectorsdg/vector/parcela@3857/15.16377.20234.geojson

    let lat = req.params.lat;
    let lng = req.params.lng;

    var ij = LatLng2IJ(lat, lng);
    const urlSigPac = `https://sigpac.mapama.gob.es/vectorsdg/vector/parcela@3857/15.${ij.i}.${ij.j}.geojson`;

    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });
        const data = (await resp.json()).features;

        const point = LatLng2XY(lat, lng);
        let result = data?.filter(d => {
            var pol = d.geometry.coordinates;
            return isPointInsidePolygon(point, pol)
        }) || []

        result.forEach(a => {
            a.geometry.coordinates = a.geometry.coordinates.map(cc => cc.map(c => c = XYToLatLng(c)))
        });

        res.send(JSON.stringify(result));

    } catch (err) {
        console.log(err);
        res.send('ERROR')
    }
}))

app.get('/Parcelas/:ProvinciaId/:MunicipioId/:PoligonoId', (async (req, res) => {
    const MunicipioId = req.params.MunicipioId;
    const ProvinciaId = req.params.ProvinciaId;
    const Poligono = req.params.PoligonoId;
    const urlSigPac = `https://sigpac.mapama.gob.es/fega/serviciosvisorsigpac/query/parcelas/${ProvinciaId}/${MunicipioId}/0/0/${Poligono}.geojson`

    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });

        const data = (await resp.json()).features;
        const result = [];
        for (var i = 0; i < data.length; i++) {
            result.push(data[i].properties)
        }
        res.send(JSON.stringify(result));

    } catch (err) {
        console.log(err)
        res.send('ERROR');
    }
}));

app.get('/Poligonos/:ProvinciaId/:MunicipioId', (async (req, res) => {
    const MunicipioId = req.params.MunicipioId;
    const ProvinciaId = req.params.ProvinciaId;
    const urlSigPac = `https://sigpac.mapama.gob.es/fega/serviciosvisorsigpac/query/poligonos/${ProvinciaId}/${MunicipioId}/0/0.geojson`

    try {
        const resp = await fetch(urlSigPac, {
            method: 'GET'
        });

        const data = (await resp.json()).features;
        const result = [];
        for (var i = 0; i < data.length; i++) {
            result.push(data[i].properties)
        }

        res.send(JSON.stringify(result));

    } catch (err) {
        console.log(err)
        res.send('ERROR');
    }


}));

app.get('/Regepa/:NIF', (async (req, res) => {

    const urlRegepa = 'https://www.mapa.gob.es/app/regepa/ResBusCon.aspx?id=es'
    const DNI = req.params.NIF;

    const body = new FormData();
    body.append('TxtCodigoIdentificacion', '')
    body.append('TxtDNI', DNI)
    body.append('bt_matr1', 'Buscar')

    try {

        const resp = await fetch(urlRegepa, {
            method: 'POST',
            body: body
        });

        const data = await resp.text();

        let start = data.search(`<td headers="ID0EDBA1" class="colu1_tabla3" style="border-left-width:0px;">`);
        if (start > 0) {
            let sub = data.substring(start, start + 200)
            start = sub.search(`<span class="tabla_texto_normal" style="float:left;">`) + `<span class="tabla_texto_normal" style="float:left;">`.length;
            res.send(sub.substring(start, start + 10))
        } else {
            res.send('NOT_FOUND');
        }
    } catch (err) {
        console.log(err)
        res.send('ERROR');
    }

}));


var isPointInsidePolygon = function (punto, poligono) {
    var x = punto.x, y = punto.y;

    var vs = poligono[0];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];


        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);


        if (intersect) inside = !inside;
    }

    if (inside) {
        for (var k = 1; k < poligono.length; k++) {

            vs = poligono[k];

            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i][0], yi = vs[i][1];
                var xj = vs[j][0], yj = vs[j][1];

                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) {
                    return false;
                }
            }
        }
    }

    return inside;
};

var LatLng2XY = function (lat, lng) {
    var y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 6378137;
    var x = (lng / 180) * 6378137 * Math.PI;
    return { x: x, y: y }
}

var XYToLatLng = function (xy) {
    //console.log(xy);
    var lat = (180 / Math.PI) * (Math.atan(Math.exp(xy[1] / 6378137)) * 2 - Math.PI / 2);
    var lng = (180 / Math.PI) * (xy[0] / 6378137);
    //console.log(xy, lat, lng)
    return [lng, lat];
}

var LatLng2IJ = function (lat, lng) {
    var y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 6378137;
    var x = (lng / 180) * 6378137 * Math.PI;

    var e = Math.pow(2, 15);
    var i = Math.floor((x - (-20037508.3427892)) / ((20037508.3427892 - (-20037508.3427892)) / (e * 1)));
    var j = Math.floor((y - (-20037508.3427892)) / ((20037508.3427892 - (-20037508.3427892)) / (e * 1)));
    return { i: i, j: j };
}

var server = app.listen(88, function () {
    console.log("El servidor funciona en el puerto 80");
});
