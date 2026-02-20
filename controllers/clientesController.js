const Cliente = require('../models/Cliente');
const Empresa = require('../models/Empresa');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().populate('empresa');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate('empresa');
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

// Crear nuevo cliente
const createCliente = async (req, res) => {
  const { operador, unidad, kilometraje, empresa } = req.body;

  if (!operador || !unidad || !kilometraje || !empresa) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // validar que la empresa exista
    const empresaExiste = await Empresa.findById(empresa);
    if (!empresaExiste) {
      return res.status(400).json({ error: 'La empresa no existe' });
    }

    const nuevoCliente = new Cliente({
      operador,
      unidad,
      kilometraje,
      empresa
    });

    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

// Actualizar cliente por ID
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    res.json({ message: 'Cliente actualizado correctamente', cliente });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// Eliminar cliente por ID
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};
