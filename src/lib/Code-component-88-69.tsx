import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          usu_login: string
          usu_pwd: string
          usu_activo: string
          clienteId: number
          nombre: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usu_login: string
          usu_pwd: string
          usu_activo?: string
          clienteId: number
          nombre: string
          email: string
        }
        Update: {
          id?: number
          usu_login?: string
          usu_pwd?: string
          usu_activo?: string
          clienteId?: number
          nombre?: string
          email?: string
        }
      }
      clientes: {
        Row: {
          id: number
          nombre: string
          rut: string
          direccion: string
          telefono: string
          email: string
          tipo_cliente: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          rut: string
          direccion: string
          telefono: string
          email: string
          tipo_cliente: string
        }
        Update: {
          id?: number
          nombre?: string
          rut?: string
          direccion?: string
          telefono?: string
          email?: string
          tipo_cliente?: string
        }
      }
      guias: {
        Row: {
          id: number
          guia: string
          fecha: string
          clienteId: number
          sucursal: string
          servicio: string
          frecuencia: string
          lts_limite: number
          lts_retirados: number
          valor_servicio: number
          valor_lt_adic: number
          patente: string
          total: number
          observaciones: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          guia: string
          fecha: string
          clienteId: number
          sucursal: string
          servicio: string
          frecuencia: string
          lts_limite: number
          lts_retirados: number
          valor_servicio: number
          valor_lt_adic: number
          patente: string
          total: number
          observaciones?: string
        }
        Update: {
          id?: number
          guia?: string
          fecha?: string
          clienteId?: number
          sucursal?: string
          servicio?: string
          frecuencia?: string
          lts_limite?: number
          lts_retirados?: number
          valor_servicio?: number
          valor_lt_adic?: number
          patente?: string
          total?: number
          observaciones?: string
        }
      }
      facturas_impagas: {
        Row: {
          id: number
          fecha: string
          empresa: string
          sucursal: string
          rut: string
          no_guia: string
          dias_mora: number
          nro_factura: string
          fecha_factura: string
          clienteId: number
          monto_factura: number
          estado_mora: string
          observaciones: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          fecha: string
          empresa: string
          sucursal: string
          rut: string
          no_guia: string
          dias_mora: number
          nro_factura: string
          fecha_factura: string
          clienteId: number
          monto_factura: number
          estado_mora: string
          observaciones?: string
        }
        Update: {
          id?: number
          fecha?: string
          empresa?: string
          sucursal?: string
          rut?: string
          no_guia?: string
          dias_mora?: number
          nro_factura?: string
          fecha_factura?: string
          clienteId?: number
          monto_factura?: number
          estado_mora?: string
          observaciones?: string
        }
      }
    }
  }
}