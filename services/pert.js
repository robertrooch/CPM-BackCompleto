class Pert {
    constructor() {
        this.idActividad = 0;
        this.actividades = [];
    }

    nuevaActividad(nombre, duracion, predecesores) {
        this.idActividad += 1;
        const actividad = {
            id: this.idActividad,
            nombre,
            duracion: parseInt(duracion),
            predecesores: predecesores.split(',').map(e => e.trim()),
            sucesores: [],
            estart: 0,
            efinish: 0,
            lstart: 0,
            lfinish: 0,
            hlibre: -1,
            htotal: 0,
            nivel: 0
        };
        if (actividad.predecesores.includes(actividad.nombre)) {
            throw new Error(`La actividad ${actividad.nombre} no puede ser predecesora de sí misma`);
        }
        this.actividades.push(actividad);
    }

    eliminarActividad(id) {
        this.actividades = this.actividades.filter(act => act.id !== id);
    }

    locateRect(nombre) {
        return this.actividades.find(actividad => actividad.nombre === nombre) || null;
    }

    earlyFinish(actividad) {
        if (!actividad.predecesores[0]) {
            actividad.nivel = 1;
            actividad.efinish = actividad.duracion;
        } else {
            actividad.predecesores.forEach(predecesorNombre => {
                const predecesor = this.locateRect(predecesorNombre);
                predecesor.sucesores.push(actividad.nombre);
                if (!predecesor.efinish) this.earlyFinish(predecesor);
                actividad.estart = Math.max(actividad.estart, predecesor.efinish);
                actividad.nivel = Math.max(actividad.nivel, predecesor.nivel + 1);
            });
            actividad.efinish = actividad.estart + actividad.duracion;
        }
    }

    lateFinish(actividad, tiempoFinal) {
        if (!actividad.sucesores.length) {
            actividad.lfinish = tiempoFinal;
            actividad.hlibre = tiempoFinal - actividad.efinish;
        } else {
            actividad.sucesores.forEach(sucesorNombre => {
                const sucesor = this.locateRect(sucesorNombre);
                if (!sucesor.lfinish) this.lateFinish(sucesor, tiempoFinal);
                actividad.lfinish = actividad.lfinish > 0 ? Math.min(actividad.lfinish, sucesor.lstart) : sucesor.lstart;
                actividad.hlibre = actividad.hlibre > -1 ? Math.min(actividad.hlibre, sucesor.estart - actividad.efinish) : sucesor.estart - actividad.efinish;
            });
        }
        actividad.lstart = actividad.lfinish - actividad.duracion;
        actividad.htotal = actividad.lfinish - actividad.efinish;
    }

    generarDiagrama() {
        // Reseteamos el estado
        let tiempoFinal = 0;
        this.actividades.forEach(actividad => {
            if (!actividad.efinish) {
                this.earlyFinish(actividad);
                tiempoFinal = Math.max(tiempoFinal, actividad.efinish);
            }
        });

        this.actividades.forEach(actividad => {
            if (!actividad.lfinish) {
                this.lateFinish(actividad, tiempoFinal);
            }
        });

        return this.actividades;
    }
}

module.exports = Pert;
