export interface Usuario {
  id: number;
  usu_login: string;
  usu_pwd: string;
  usu_activo: string;
  clienteId: number;
  nombre: string;
  email: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  tipo_cliente: string;
}

export interface GuiaResiduos {
  id: number;
  guia: string;
  fecha: string;
  clienteId: number;
  sucursal: string;
  servicio: string;
  frecuencia: string;
  lts_limite: number;
  lts_retirados: number;
  valor_servicio: number;
  valor_lt_adic: number;
  patente: string;
  total: number;
  observaciones?: string;
}

export interface FacturaImpaga {
  id: number;
  fecha: string;
  empresa: string;
  sucursal: string;
  rut: string;
  no_guia: string;
  dias_mora: number;
  nro_factura: string;
  fecha_factura: string;
  clienteId: number;
  monto_factura: number;
  estado_mora: string;
  observaciones?: string;
}