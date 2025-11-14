interface ItemCarrinhoProp {
  _id: string
  produto: {
    _id: string
    nome: string
    preco: number
    urlfoto: string
  }
  quantidade: number
  onQuantidadeChange: (id: string, novaQtd: number) => void
  onRemover: (produtoId: string) => void
}

export default function ItemCarrinho({
  _id,
  produto,
  quantidade,
  onQuantidadeChange,
  onRemover
}: ItemCarrinhoProp) {
  return (
    <div
      className="item-carrinho"
      style={{
        display: 'flex',
        gap: '15px',
        padding: '15px',
        borderBottom: '1px solid #eee',
        alignItems: 'center'
      }}
    >
      <img
        src={produto.urlfoto}
        alt={produto.nome}
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover',
          borderRadius: '4px'
        }}
      />
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{produto.nome}</h3>
        <p style={{ margin: '0 0 8px 0', color: '#666' }}>
          Preço: R$ {produto.preco.toFixed(2)}
        </p>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Subtotal: R$ {(produto.preco * quantidade).toFixed(2)}
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor={`qtd-${_id}`} style={{ marginRight: '5px' }}>
            Quantidade:
          </label>
          <input
            id={`qtd-${_id}`}
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => onQuantidadeChange(_id, Number(e.target.value))}
            style={{
              width: '60px',
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={() => onRemover(produto._id)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}
