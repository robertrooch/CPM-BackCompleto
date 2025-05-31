const express = require('express');
const cors = require('cors');
const Pert = require('./services/pert');
const bodyParser = require('body-parser');
const app = express();
const ActividadCPM = require('./models/actividadCPM');
const Proyecto = require('./models/proyecto'); 

app.use(cors({ origin: 'http://localhost:4200' }));

app.use(bodyParser.json());

const pert = new Pert();

app.get('/actividades-cpm/:proyectoId', async (req, res) => {
    const { proyectoId } = req.params;

    try {
        // Obtener todas las actividades relacionadas con un proyecto
        const actividades = await ActividadCPM.findAll({
            where: {
                proyectoId: proyectoId
            }
        });

        if (actividades.length === 0) {
            return res.status(404).json({ error: 'No se encontraron actividades para este proyecto.' });
        }

        res.json(actividades);
    } catch (error) {
        console.error('Error al obtener actividades de proyecto:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/proyectos', async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll();
        res.json(proyectos);
    } catch (error) {
        console.error('Error al obtener proyectos:', error.message);
        res.status(500).json({ error: error.message });
    }
});


app.post('/proyectos', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        // Validación
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
        }

        // Crear el proyecto
        const proyecto = await Proyecto.create({ nombre, descripcion });

        res.status(201).json(proyecto);
    } catch (error) {
        console.error('Error al crear proyecto:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/guardar-cpm', async (req, res) => {
    try {
        const { actividades, proyectoId } = req.body; 
        console.log('Datos recibidos:', req.body);
        if (!actividades || actividades.length === 0) {
            return res.status(400).json({ error: 'No se recibieron actividades para guardar.' });
        }

        if (!proyectoId) {
            return res.status(400).json({ error: 'El ID del proyecto es obligatorio.' });
        }

        for (const actividad of actividades) {
            await ActividadCPM.create({
                nombre: actividad.nombre,
                duracion: actividad.duracion,
                estart: actividad.estart,
                efinish: actividad.efinish,
                lstart: actividad.lstart,
                lfinish: actividad.lfinish,
                htotal: actividad.htotal,
                hlibre: actividad.hlibre,
                es_critica: actividad.htotal === 0,
                predecesores: JSON.stringify(actividad.predecesores),
                sucesores: JSON.stringify(actividad.sucesores),
                proyectoId: proyectoId  
            });
        }

        res.json({ message: 'Actividades CPM guardadas exitosamente en la base de datos' });
    } catch (error) {
        console.error('Error al guardar actividades CPM:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/actividades-cpm', async (req, res) => {
    try {
        const actividades = await ActividadCPM.findAll();
        res.json(actividades);
    } catch (error) {
        console.error('Error al consultar actividades CPM:', error.message);
        res.status(500).json({ error: error.message });
    }
});


app.post('/nueva-actividad', (req, res) => {
    const { nombre, tiempoOptimista, tiempoMasProbable, tiempoPesimista, predecesores } = req.body;

    if (!nombre || tiempoOptimista === undefined || tiempoMasProbable === undefined || tiempoPesimista === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        pert.nuevaActividad(nombre, tiempoOptimista, tiempoMasProbable, tiempoPesimista, predecesores || '');
        res.status(201).json({ message: 'Actividad creada exitosamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/calcular-tiempos', (req, res) => {
    try {
        const resultado = pert.generarDiagrama();
        res.json({ actividades: resultado });
    } catch (error) {
        console.error('Error al generar tiempos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/limpiar-actividades', (req, res) => {
    try {
        pert.limpiarActividades();
        res.status(200).json({ message: 'Actividades limpiadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
