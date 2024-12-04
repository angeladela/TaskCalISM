import TareaGrupo from '../models/TareaGrupo.js';
import Grupo from '../models/Grupo.js';
import CategoriaGrupo from '../models/CategoriaGrupo.js';

import asyncHandler from 'express-async-handler'


// Tus rutas van aquí
    // GETS GENERICOS

///api/tasks?id_usuario=0
export const getTasks = asyncHandler(async(req, res) => { //que diferencia hay con el getTasksByCategoryGroup de categoryGroupController.js??
    try{
        const {id_categoria_grupo} = req.query
        const tasks = await TareaGrupo.find({id_categoria_grupo})
        res.status(200).json(tasks)

    }catch(error){
        res.status(500).json({ message: error.message });
    }
})
///api/tasks
export const createTask = asyncHandler(async (req, res) => { //CU11
    const { nombre, descripcion, fecha_vencimiento, estado, id_categoria_grupo } = req.body;

    try {
        // Verificar si el usuario asociado existe
        const grupoExistente = await Grupo.findById(id_grupo);
        if (!grupoExistente) {
            return res.status(404).json({ message: "El grupo asociado no existe" });
        }

        // Verificar si la categoría asociada existe
        const categoriaExistente = await CategoriaGrupo.findById(id_categoria_grupo);
        if (!categoriaExistente) {
            return res.status(404).json({ message: "La categoría asociada no existe" });
        }

        // Crear una nueva tarea
        const nuevaTarea = new Tarea({
            nombre,
            descripcion,
            fecha_vencimiento,
            estado,
            id_categoria_grupo,
        });

        // Guardar la tarea en la base de datos
        await nuevaTarea.save();
        res.status(201).json({ message: "La tarea ha sido creada correctamente", tarea: nuevaTarea });
    } catch (error) {
        // Capturar errores y enviar una respuesta adecuada
        res.status(500).json({ message: "Error al crear la tarea", error: error.message });
    }
});

///api/tasks/modify/:id
export const modifyTask = asyncHandler(async (req, res) => { //CU13
    const { id } = req.params; // ID de la tarea a modificar
    const { nombre, descripcion, fecha_vencimiento, estado, id_categoria_grupo } = req.body;

    try {
        // Verificar si la tarea existe
        const tarea = await TareaGrupo.findById(id);
        if (!tarea) {
            return res.status(404).json({ message: "La tarea no existe" });
        }

        // Actualizar los campos con los nuevos valores si están presentes
        tarea.nombre = nombre || tarea.nombre;
        tarea.descripcion = descripcion || tarea.descripcion;
        tarea.fecha_vencimiento = fecha_vencimiento || tarea.fecha_vencimiento;
        tarea.estado = estado !== undefined ? estado : tarea.estado;
        //tarea.id_categoria_grupo = id_categoria_usuario || tarea.id_categoria_usuario;
        //como se va a modificar un id???

        // Guardar los cambios
        const tareaActualizada = await tarea.save();
        res.status(200).json({ message: "La tarea ha sido actualizada correctamente", tarea: tareaActualizada });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la tarea", error: error.message });
    }
});

///api/tasks/delete/:id
export const deleteTask = asyncHandler(async (req, res) => { //CU14
    const { id } = req.params; // ID de la tarea a eliminar

    try {
        // Verificar si la tarea existe
        const tarea = await TareaGrupo.findById(id);
        if (!tarea) {
            return res.status(404).json({ message: "La tarea no existe" });
        }

        // Eliminar la tarea
        await tarea.deleteOne();
        res.status(200).json({ message: "La tarea ha sido eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la tarea", error: error.message });
    }
});
///api/tasks/gettask/:id
export const getTaskGroup = asyncHandler(async(req,res) => { //CU10
    const { id } = req.params;

    try{
        const tarea = await TareaGrupo.findById(id);
        if (!tarea) {
            return res.status(404).json({ message: "La tarea no existe" });
        }

        res.status(200).json(tarea);
    } catch (error){
        res.status(500).json({message: "Error al buscar la tarea."});
    }
})
///api/tasks/endtask/:id
export const endTaskGroup = asyncHandler(async(req,res) => {
    const { id } = req.params;
    try{
        const tarea = await TareaGrupo.findById(id);

        if (!tarea) {
            return res.status(404).json({ message: "La tarea no existe." });
        }

        if(!tarea.estado){
            tarea.estado = true;
            await tarea.save();
            res.status(200).json({ message: "La tarea se cambio a completada."});
        }
        else{
            res.status(200).json({ message: "La tarea ya estaba completada."});
        }       
    } catch (error){
        res.status(500).json({ message: "Error al encontrar la tarea."});
    }
});
///api/tasks/tasksToday/:id
export const tareasDiariasGroup = asyncHandler (async(req,res) => {
    const { id_categoria_grupo } = req.params;

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaActual.getDay() + 1);
    try{
        const tareas = await TareaGrupo.find({
            id_categoria_grupo: id_categoria_grupo, // Filtrar por el ID de la categoria
            fecha_vencimiento: { $gte: fechaActual, $lte: fechaLimite } // Fecha de vencimiento dentro del rango
        });
        res.status(200).json(tareas);
        } catch (error){
        res.status(500).json({message: "Error al buscar las tareas."})
    }
})
///api/tasks/calendar/:id
export const calendarioTareasGroup = asyncHandler (async(req,res) => {
    const { id_categoria_grupo } = req.params;

    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaActual.getMonth() + 1);
    try{
        const tareas = await TareaGrupo.find({
            id_usuario: id_categoria_grupo, // Filtrar por el ID de la categoria del grupo
            fecha_vencimiento: { $gte: fechaActual, $lte: fechaLimite } // Fecha de vencimiento dentro del rango
        });
        res.status(200).json(tareas);
        } catch (error){
        res.status(500).json({message: "Error al buscar las tareas."})
    }
})

export const assignMemberToATask = asyncHandler(async(req, res) => { //CU08

        //aqui usar tarea miembro
})