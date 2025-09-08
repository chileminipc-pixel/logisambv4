import { supabase } from '../lib/supabase'
import { Usuario, Cliente, GuiaResiduos, FacturaImpaga } from '../types'

export class DataService {
  // Autenticación de usuarios
  static async authenticateUser(username: string, password: string): Promise<Usuario | null> {
    try {
      console.log(`🔍 Autenticando usuario: ${username}`)
      
      // Primero intentar con Supabase
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usu_login', username)
        .eq('usu_pwd', password)
        .eq('usu_activo', 'SI')
        .single()

      if (error) {
        console.warn('⚠️ Error en Supabase, intentando con datos locales:', error.message)
        return await this.authenticateFromLocalData(username, password)
      }

      console.log('✅ Usuario autenticado con Supabase:', usuarios.nombre)
      return usuarios
    } catch (error) {
      console.error('❌ Error en autenticación:', error)
      return await this.authenticateFromLocalData(username, password)
    }
  }

  // Fallback: autenticación con datos locales (JSON)
  static async authenticateFromLocalData(username: string, password: string): Promise<Usuario | null> {
    try {
      console.log('🔍 Cargando usuarios desde archivo JSON externo...')
      const response = await fetch('/data/usuarios.json')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const usuarios: Usuario[] = await response.json()
      
      const foundUser = usuarios.find(u => 
        u.usu_login === username && 
        u.usu_pwd === password && 
        u.usu_activo === 'SI'
      )
      
      if (foundUser) {
        console.log('✅ Usuario autenticado con datos locales:', foundUser.nombre)
      } else {
        console.log('❌ Usuario no encontrado en datos locales')
      }
      
      return foundUser || null
    } catch (error) {
      console.error('❌ Error cargando datos locales:', error)
      return null
    }
  }

  // Obtener cliente por ID
  static async getClienteById(clienteId: number): Promise<Cliente | null> {
    try {
      // Primero intentar con Supabase
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (error) {
        console.warn('⚠️ Error en Supabase, usando datos locales para cliente')
        return await this.getClienteFromLocalData(clienteId)
      }

      return cliente
    } catch (error) {
      console.error('❌ Error obteniendo cliente:', error)
      return await this.getClienteFromLocalData(clienteId)
    }
  }

  static async getClienteFromLocalData(clienteId: number): Promise<Cliente | null> {
    try {
      const response = await fetch('/data/clientes.json')
      if (!response.ok) throw new Error('Error cargando clientes')
      
      const clientes: Cliente[] = await response.json()
      return clientes.find(c => c.id === clienteId) || null
    } catch (error) {
      console.error('❌ Error cargando clientes locales:', error)
      return null
    }
  }

  // Obtener guías por cliente
  static async getGuiasByCliente(clienteId: number): Promise<GuiaResiduos[]> {
    try {
      // Primero intentar con Supabase
      const { data: guias, error } = await supabase
        .from('guias')
        .select('*')
        .eq('clienteId', clienteId)
        .order('fecha', { ascending: false })

      if (error) {
        console.warn('⚠️ Error en Supabase, usando datos locales para guías')
        return await this.getGuiasFromLocalData(clienteId)
      }

      return guias || []
    } catch (error) {
      console.error('❌ Error obteniendo guías:', error)
      return await this.getGuiasFromLocalData(clienteId)
    }
  }

  static async getGuiasFromLocalData(clienteId: number): Promise<GuiaResiduos[]> {
    try {
      const response = await fetch('/data/guias.json')
      if (!response.ok) throw new Error('Error cargando guías')
      
      const guias: GuiaResiduos[] = await response.json()
      return guias.filter(g => g.clienteId === clienteId)
    } catch (error) {
      console.error('❌ Error cargando guías locales:', error)
      return []
    }
  }

  // Obtener facturas impagas por cliente
  static async getFacturasByCliente(clienteId: number): Promise<FacturaImpaga[]> {
    try {
      // Primero intentar con Supabase
      const { data: facturas, error } = await supabase
        .from('facturas_impagas')
        .select('*')
        .eq('clienteId', clienteId)
        .order('dias_mora', { ascending: false })

      if (error) {
        console.warn('⚠️ Error en Supabase, usando datos locales para facturas')
        return await this.getFacturasFromLocalData(clienteId)
      }

      return facturas || []
    } catch (error) {
      console.error('❌ Error obteniendo facturas:', error)
      return await this.getFacturasFromLocalData(clienteId)
    }
  }

  static async getFacturasFromLocalData(clienteId: number): Promise<FacturaImpaga[]> {
    try {
      const response = await fetch('/data/facturas-impagas.json')
      if (!response.ok) throw new Error('Error cargando facturas')
      
      const facturas: FacturaImpaga[] = await response.json()
      return facturas.filter(f => f.clienteId === clienteId)
    } catch (error) {
      console.error('❌ Error cargando facturas locales:', error)
      return []
    }
  }

  // Sincronización con Supabase (para migrar datos JSON a la base de datos)
  static async syncLocalDataToSupabase(): Promise<void> {
    try {
      console.log('🔄 Iniciando sincronización de datos locales a Supabase...')
      
      // Cargar datos locales
      const [usuarios, clientes, guias, facturas] = await Promise.all([
        fetch('/data/usuarios.json').then(r => r.json()),
        fetch('/data/clientes.json').then(r => r.json()),
        fetch('/data/guias.json').then(r => r.json()),
        fetch('/data/facturas-impagas.json').then(r => r.json())
      ])

      // Sincronizar clientes
      const { error: clientesError } = await supabase
        .from('clientes')
        .upsert(clientes, { onConflict: 'id' })

      if (clientesError) throw clientesError

      // Sincronizar usuarios  
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .upsert(usuarios, { onConflict: 'id' })

      if (usuariosError) throw usuariosError

      // Sincronizar guías
      const { error: guiasError } = await supabase
        .from('guias')
        .upsert(guias, { onConflict: 'id' })

      if (guiasError) throw guiasError

      // Sincronizar facturas
      const { error: facturasError } = await supabase
        .from('facturas_impagas')
        .upsert(facturas, { onConflict: 'id' })

      if (facturasError) throw facturasError

      console.log('✅ Sincronización completada exitosamente')
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      throw error
    }
  }
}