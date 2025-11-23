export interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}

export interface CreateProductoDto {
  nombre: string;
  categoriaId: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento: string;
}

export interface UpdateProductoDto {
  id: number;
  nombre: string;
  categoriaId: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento: string;
}
