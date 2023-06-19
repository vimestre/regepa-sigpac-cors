const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const FormData = require('form-data');
const fetch = require("node-fetch");




const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get('/Regepa/:NIF', (async (req, res) => {

    const urlRegepa = 'https://www.mapa.gob.es/app/regepa/ResBusCon.aspx?id=es'
    const DNI = req.params.NIF;

    const body = new FormData();
    body.append('TxtCodigoIdentificacion', '')
    body.append('TxtDNI', DNI)
    body.append('bt_matr1', 'Buscar')

    const resp = await fetch(urlRegepa, {
        method: 'POST',
        body: body
    });

    const data = await resp.text();

    try {
        let start = data.search(`<td headers="ID0EDBA1" class="colu1_tabla3" style="border-left-width:0px;">`);
        if (start > 0) {
            let sub = data.substring(start, start + 200)
            start = sub.search(`<span class="tabla_texto_normal" style="float:left;">`) + `<span class="tabla_texto_normal" style="float:left;">`.length;
            console.log(start + " -> " + sub);
            console.log(sub.substring(start, start + 10));
            res.send(sub.substring(start, start + 10))
        } else {
            console.log('No encontrado');
            res.send('NOT_FOUND');
        }
    } catch (err) {
        console.log(err)
    }

}));


var server = app.listen(80, function () {
    //app.use(cors())
    console.log("El servidor funciona en el puerto 80");
});
