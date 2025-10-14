const Empresa = require('../models/Empresa');

// Obtener todas las empresas
const getEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.find();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las empresas' });
  }
};

// Obtener empresa por ID
const getEmpresaById = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id);
    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la empresa' });
  }
};

// Crear nueva empresa
const createEmpresa = async (req, res) => {
  const { nombre, rfc, domicilio, regimenFiscal, usoCFDI } = req.body;
  if (!nombre || !rfc || !domicilio || !regimenFiscal || !usoCFDI) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevaEmpresa = new Empresa({ nombre, rfc, domicilio, regimenFiscal, usoCFDI });
    await nuevaEmpresa.save();
    res.status(201).json(nuevaEmpresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la empresa' });
  }
};

// Actualizar empresa por ID
const updateEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
    res.json({ message: 'Empresa actualizada correctamente', empresa });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
};

// Eliminar empresa por ID
const deleteEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la empresa' });
  }
};

module.exports = {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
};
