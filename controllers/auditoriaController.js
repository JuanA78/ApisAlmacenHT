const Auditoria = require("../models/Auditoria");

// CREATE
const crearAuditoria = async (req, res) => {
    try {

        const {
            usuarioId,
            usuario,
            rol,
            accion,
            modulo,
            descripcion,
            referenciaId,
            datos
        } = req.body;

        const auditoria = new Auditoria({
            usuarioId,
            usuario,
            rol,
            accion,
            modulo,
            descripcion,
            referenciaId: referenciaId || null,
            datos: datos || {}
        });

        const nuevaAuditoria = await auditoria.save();

        res.status(201).json({
            mensaje: "Registro de auditoría creado correctamente",
            auditoria: nuevaAuditoria
        });

    } catch (error) {

        console.error("Error al crear auditoría:", error);

        res.status(500).json({
            mensaje: "Error al crear registro de auditoría",
            error: error.message
        });
    }
};


// GET ALL
const obtenerAuditorias = async (req, res) => {
    try {

        const auditorias = await Auditoria.find()
            .sort({ fecha: -1 });

        res.status(200).json(auditorias);

    } catch (error) {

        console.error("Error al obtener auditorías:", error);

        res.status(500).json({
            mensaje: "Error al obtener registros de auditoría",
            error: error.message
        });
    }
};


// GET BY ID
const obtenerAuditoriaPorId = async (req, res) => {
    try {

        const { id } = req.params;

        const auditoria = await Auditoria.findById(id);

        if (!auditoria) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json(auditoria);

    } catch (error) {

        console.error("Error al obtener auditoría:", error);

        res.status(500).json({
            mensaje: "Error al obtener registro de auditoría",
            error: error.message
        });
    }
};


// UPDATE
const actualizarAuditoria = async (req, res) => {
    try {

        const { id } = req.params;

        const auditoriaActualizada =
            await Auditoria.findByIdAndUpdate(
                id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!auditoriaActualizada) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Registro de auditoría actualizado correctamente",
            auditoria: auditoriaActualizada
        });

    } catch (error) {

        console.error("Error al actualizar auditoría:", error);

        res.status(500).json({
            mensaje: "Error al actualizar registro de auditoría",
            error: error.message
        });
    }
};


// DELETE
const eliminarAuditoria = async (req, res) => {
    try {

        const { id } = req.params;

        const auditoriaEliminada =
            await Auditoria.findByIdAndDelete(id);

        if (!auditoriaEliminada) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Registro de auditoría eliminado correctamente",
            auditoria: auditoriaEliminada
        });

    } catch (error) {

        console.error("Error al eliminar auditoría:", error);

        res.status(500).json({
            mensaje: "Error al eliminar registro de auditoría",
            error: error.message
        });
    }
};


module.exports = {
    crearAuditoria,
    obtenerAuditorias,
    obtenerAuditoriaPorId,
    actualizarAuditoria,
    eliminarAuditoria
};