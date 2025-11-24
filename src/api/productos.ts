import api from './axios';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types/producto';

// GET - Obtener todos los productos
export const getProductos = async (): Promise<Producto[]> => {
   const response = await api.get<{ mensaje: string; data: Producto[] }>('Productos');
  return response.data.data;
};

// GET - Obtener un producto por ID
export const getProductoById = async (id: number): Promise<Producto> => {
  const response = await api.get<Producto>(`Productos/${id}`);
  return response.data;
};

// POST - Crear un nuevo producto
export const createProducto = async (producto: CreateProductoDto): Promise<Producto> => {
  const response = await api.post<Producto>('Productos', producto);
  return response.data;
};

// PUT - Actualizar un producto existente
export const updateProducto = async (producto: UpdateProductoDto): Promise<Producto> => {
  const response = await api.put<Producto>(`Productos/${producto.id}`, producto);
  return response.data;
};

// DELETE - Eliminar un producto
export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`Productos/${id}`);
};

/**
 * Descontar stock de un producto (usado al registrar una venta)
 * @param producto Producto con todos sus datos
 * @param cantidad Cantidad a descontar
 * @returns El producto actualizado
 */
export const descontarStockProducto = async (producto: Producto, cantidad: number): Promise<Producto> => {
  try {
    // Calcular nuevo stock
    const nuevoStock = Math.max(0, producto.stock - cantidad);
    
    // Actualizar producto con nuevo stock
    const productoActualizado = await updateProducto({
      id: producto.id,
      nombre: producto.nombre,
      categoriaId: producto.categoriaId,
      precio: producto.precio,
      stock: nuevoStock,
      stockMinimo: producto.stockMinimo,
      fechaVencimiento: producto.fechaVencimiento,
    });
    
    return productoActualizado;
  } catch (error) {
    console.error(`Error al descontar stock del producto ${producto.id}:`, error);
    throw error;
  }
};
