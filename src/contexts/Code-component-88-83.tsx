import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Usuario, Cliente } from '../types'
import { DataService } from '../services/DataService'

interface AuthContextType {
  usuario: Usuario | null
  cliente: Cliente | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser')
        const savedClient = localStorage.getItem('currentClient')
        
        if (savedUser && savedClient) {
          setUsuario(JSON.parse(savedUser))
          setCliente(JSON.parse(savedClient))
        }
      } catch (error) {
        console.error('Error verificando sesión existente:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('currentClient')
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Autenticar usuario
      const authenticatedUser = await DataService.authenticateUser(username, password)
      
      if (!authenticatedUser) {
        console.log('❌ Credenciales inválidas')
        return false
      }

      // Obtener información del cliente
      const clienteInfo = await DataService.getClienteById(authenticatedUser.clienteId)
      
      if (!clienteInfo) {
        console.error('❌ No se pudo obtener información del cliente')
        return false
      }

      // Guardar en estado y localStorage
      setUsuario(authenticatedUser)
      setCliente(clienteInfo)
      
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser))
      localStorage.setItem('currentClient', JSON.stringify(clienteInfo))

      console.log('✅ Login exitoso:', {
        usuario: authenticatedUser.nombre,
        cliente: clienteInfo.nombre
      })

      return true
    } catch (error) {
      console.error('❌ Error en login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUsuario(null)
    setCliente(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentClient')
    console.log('👋 Sesión cerrada')
  }

  const value: AuthContextType = {
    usuario,
    cliente,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}