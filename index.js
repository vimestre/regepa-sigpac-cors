const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const FormData = require('form-data');
const fetch = require("node-fetch");




const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));




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


var server = app.listen(88, function () {
    //app.use(cors())
    console.log("El servidor funciona en el puerto 80");
});
