import type { FormEvent } from 'react'
import { useState } from 'react'
import api from '../../api/api'

interface FormularioProdutoProps {
  onSucesso?: () => void
}

interface NovoProduto {
  nome: string
  descricao: string
  preco: string
  urlfoto: string
  estoque: string
}

export default function FormularioCadastroProduto({ onSucesso }: FormularioProdutoProps) {
  const [formData, setFormData] = useState<NovoProduto>({
    nome: '',
    descricao: '',
    preco: '',
    urlfoto: '',
    estoque: ''
  })

  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validação para campos numéricos
    if ((name === 'preco' || name === 'estoque') && value && parseFloat(value) < 0) {
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErro(null)
    setSucesso(false)

    // Validação básica
    if (!formData.nome.trim() || !formData.preco.trim()) {
      setErro('Nome e preço são obrigatórios')
      return
    }

    if (parseFloat(formData.preco) <= 0) {
      setErro('Preço deve ser maior que zero')
      return
    }

    if (formData.estoque && parseInt(formData.estoque) < 0) {
      setErro('Estoque não pode ser negativo')
      return
    }

    setCarregando(true)

    try {
      const dadosProduto = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: parseFloat(formData.preco),
        urlfoto: formData.urlfoto.trim(),
        estoque: formData.estoque ? parseInt(formData.estoque) : 0
      }

      await api.post('/produtos', dadosProduto)

      setSucesso(true)
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        urlfoto: '',
        estoque: ''
      })

      // Aguardar 2 segundos antes de chamar callback
      setTimeout(() => {
        onSucesso?.()
      }, 2000)
    } catch (error: any) {
      const mensagem = error?.response?.data?.mensagem || 
                      error?.message || 
                      'Erro ao cadastrar produto'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0 }}>Cadastrar Novo Produto</h2>

      {erro && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          borderLeft: '4px solid #c00'
        }}>
          ⚠️ {erro}
        </div>
      )}

      {sucesso && (
        <div style={{
          backgroundColor: '#efe',
          color: '#060',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          borderLeft: '4px solid #060'
        }}>
          ✅ Produto cadastrado com sucesso!
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Nome do Produto *
        </label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Ex: Bolo de Chocolate"
          required
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Descrição
        </label>
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o produto..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Preço (R$) *
          </label>
          <input
            type="number"
            name="preco"
            value={formData.preco}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Estoque
          </label>
          <input
            type="number"
            name="estoque"
            value={formData.estoque}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px', marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          URL da Imagem
        </label>
        <input
          type="url"
          name="urlfoto"
          value={formData.urlfoto}
          onChange={handleChange}
          placeholder="https://exemplo.com/imagem.jpg"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {formData.urlfoto && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Prévia da imagem:</p>
          <img 
            src={formData.urlfoto} 
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '4px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: carregando ? '#999' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: carregando ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {carregando ? 'Cadastrando...' : 'Cadastrar Produto'}
      </button>
    </form>
  )
}
