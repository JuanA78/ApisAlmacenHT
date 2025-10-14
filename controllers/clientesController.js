const Cliente = require('../models/Cliente');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear cliente
const createCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar cliente por ID
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente actualizado correctamente', cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar cliente por ID
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente', cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClientes,
  createCliente,
  getClienteById,
  updateCliente,
  deleteCliente
};
