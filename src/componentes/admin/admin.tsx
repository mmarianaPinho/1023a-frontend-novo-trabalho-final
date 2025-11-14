import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormularioCadastroProduto from './FormularioCadastroProduto'
import api from '../../api/api'

interface Produto {
  _id: string
  nome: string
  preco: number
  descricao: string
  urlfoto: string
  estoque?: number
}

interface UsuarioPerfil {
  _id: string
  nome: string
  email: string
  papel: 'admin' | 'user'
}

interface Usuario {
  _id: string
  nome: string
  email: string
  papel: 'admin' | 'user'
  dataCriacao?: string
}

interface ItemCarrinho {
  _id: string
  produto: {
    _id: string
    nome: string
    preco: number
  }
  quantidade: number
}

interface Carrinho {
  _id: string
  usuarioId: string
  usuario?: {
    _id: string
    nome: string
    email: string
  }
  itens: ItemCarrinho[]
  total?: number
}

export default function Admin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carrinhos, setCarrinhos] = useState<Carrinho[]>([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<'cadastro' | 'produtos' | 'usuarios' | 'carrinhos'>('cadastro')
  const [carrinhoSelecionado, setCarrinhoSelecionado] = useState<string | null>(null)

  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await api.get<UsuarioPerfil>('/usuarios/perfil')
        
        if (response.data.papel !== 'admin') {
          navigate('/')
          return
        }

        setUsuario(response.data)
      } catch (error) {
        console.error('Erro ao verificar admin:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    verificarAdmin()
  }, [navigate])

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos')
      setProdutos(response.data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    if (usuario) {
      carregarProdutos()
      carregarUsuarios()
      carregarCarrinhos()
    }
  }, [usuario])

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios')
      setUsuarios(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const carregarCarrinhos = async () => {
    try {
      const response = await api.get('/carrinhos')
      setCarrinhos(response.data)
    } catch (error) {
      console.error('Erro ao carregar carrinhos:', error)
    }
  }

  const deletarProduto = async (produtoId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return
    }

    try {
      await api.delete(`/produtos/${produtoId}`)
      setProdutos(produtos.filter(p => p._id !== produtoId))
      alert('Produto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      alert('Erro ao deletar produto')
    }
  }

  const deletarUsuario = async (usuarioId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário? Todos os carrinhos também serão deletados!')) {
      return
    }

    try {
      await api.delete(`/usuarios/${usuarioId}`)
      setUsuarios(usuarios.filter(u => u._id !== usuarioId))
      // Recarregar carrinhos para remover os do usuário deletado
      carregarCarrinhos()
      alert('Usuário deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      alert('Erro ao deletar usuário')
    }
  }

  const deletarCarrinho = async (carrinhoId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este carrinho?')) {
      return
    }

    try {
      await api.delete(`/carrinhos/${carrinhoId}`)
      setCarrinhos(carrinhos.filter(c => c._id !== carrinhoId))
      setCarrinhoSelecionado(null)
      alert('Carrinho deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar carrinho:', error)
      alert('Erro ao deletar carrinho')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🔧 Painel de Administração</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Bem-vindo, {usuario.nome}
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 15px',
              marginRight: '10px',
              backgroundColor: '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Voltar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              navigate('/login')
            }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navegação de abas */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #ddd',
        display: 'flex',
        gap: '0',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setAbaAtiva('cadastro')}
          style={{
            padding: '15px 20px',
            backgroundColor: abaAtiva === 'cadastro' ? '#007bff' : 'transparent',
            color: abaAtiva === 'cadastro' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: abaAtiva === 'cadastro' ? 'bold' : 'normal',
            borderBottom: abaAtiva === 'cadastro' ? '3px solid #007bff' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap'
          }}
        >
          📝 Cadastrar Produto
        </button>
        <button
          onClick={() => setAbaAtiva('produtos')}
          style={{
            padding: '15px 20px',
            backgroundColor: abaAtiva === 'produtos' ? '#007bff' : 'transparent',
            color: abaAtiva === 'produtos' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: abaAtiva === 'produtos' ? 'bold' : 'normal',
            borderBottom: abaAtiva === 'produtos' ? '3px solid #007bff' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap'
          }}
        >
          📦 Produtos ({produtos.length})
        </button>
        <button
          onClick={() => setAbaAtiva('usuarios')}
          style={{
            padding: '15px 20px',
            backgroundColor: abaAtiva === 'usuarios' ? '#007bff' : 'transparent',
            color: abaAtiva === 'usuarios' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: abaAtiva === 'usuarios' ? 'bold' : 'normal',
            borderBottom: abaAtiva === 'usuarios' ? '3px solid #007bff' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap'
          }}
        >
          � Clientes ({usuarios.length})
        </button>
        <button
          onClick={() => setAbaAtiva('carrinhos')}
          style={{
            padding: '15px 20px',
            backgroundColor: abaAtiva === 'carrinhos' ? '#007bff' : 'transparent',
            color: abaAtiva === 'carrinhos' ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: abaAtiva === 'carrinhos' ? 'bold' : 'normal',
            borderBottom: abaAtiva === 'carrinhos' ? '3px solid #007bff' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap'
          }}
        >
          🛒 Carrinhos ({carrinhos.length})
        </button>
      </nav>

      {/* Conteúdo */}
      <main style={{ padding: '20px' }}>
        {abaAtiva === 'cadastro' && (
          <FormularioCadastroProduto onSucesso={carregarProdutos} />
        )}

        {abaAtiva === 'produtos' && (
          <div>
            <h2>Produtos Cadastrados</h2>
            {produtos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                Nenhum produto cadastrado ainda.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                {produtos.map(produto => (
                  <div
                    key={produto._id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                  >
                    {produto.urlfoto && (
                      <img
                        src={produto.urlfoto}
                        alt={produto.nome}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0' }}>{produto.nome}</h3>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
                        {produto.descricao}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', margin: '10px 0' }}>
                        R$ {produto.preco.toFixed(2)}
                      </p>
                      {produto.estoque !== undefined && (
                        <p style={{ color: produto.estoque > 0 ? '#060' : '#c00', margin: '10px 0' }}>
                          Estoque: {produto.estoque}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button
                          onClick={() => navigate(`/admin/editar/${produto._id}`)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => deletarProduto(produto._id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'usuarios' && (
          <div>
            <h2>Clientes Cadastrados</h2>
            {usuarios.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                Nenhum cliente cadastrado ainda.
              </p>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginTop: '20px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Nome</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Papel</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(user => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px' }}>{user.nome}</td>
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: user.papel === 'admin' ? '#007bff' : '#28a745',
                            color: 'white'
                          }}>
                            {user.papel === 'admin' ? '👑 Admin' : '👤 Usuário'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => deletarUsuario(user._id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            🗑️ Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'carrinhos' && (
          <div>
            <h2>Carrinhos dos Clientes</h2>
            {carrinhos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                Nenhum carrinho criado ainda.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {carrinhos.map(carrinho => (
                  <div
                    key={carrinho._id}
                    style={{
                      backgroundColor: carrinhoSelecionado === carrinho._id ? '#e3f2fd' : 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: carrinhoSelecionado === carrinho._id ? '2px solid #007bff' : '2px solid transparent'
                    }}
                    onClick={() => setCarrinhoSelecionado(carrinhoSelecionado === carrinho._id ? null : carrinho._id)}
                  >
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0' }}>
                        {carrinho.usuario?.nome || 'Cliente desconhecido'}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
                        📧 {carrinho.usuario?.email || 'Sem email'}
                      </p>
                      <p style={{ margin: '10px 0', fontSize: '14px' }}>
                        <strong>Itens:</strong> {carrinho.itens.length}
                      </p>
                      {carrinho.itens.length > 0 && (
                        <div style={{
                          maxHeight: carrinhoSelecionado === carrinho._id ? '500px' : '0',
                          overflow: 'hidden',
                          transition: 'max-height 0.3s',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          padding: carrinhoSelecionado === carrinho._id ? '10px' : '0',
                          marginBottom: '10px'
                        }}>
                          {carrinho.itens.map(item => (
                            <div key={item._id} style={{
                              padding: '8px',
                              borderBottom: '1px solid #eee',
                              fontSize: '13px'
                            }}>
                              <strong>{item.produto.nome}</strong><br />
                              Qtd: {item.quantidade} × R$ {item.produto.preco.toFixed(2)}
                            </div>
                          ))}
                          <div style={{
                            marginTop: '10px',
                            paddingTop: '10px',
                            borderTop: '2px solid #ddd',
                            fontWeight: 'bold',
                            color: '#007bff'
                          }}>
                            Total: R$ {(carrinho.itens.reduce((t, i) => t + (i.produto.preco * i.quantidade), 0)).toFixed(2)}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => deletarCarrinho(carrinho._id)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginTop: '10px'
                        }}
                      >
                        🗑️ Deletar Carrinho
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
