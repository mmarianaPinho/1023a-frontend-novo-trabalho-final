import FiltroInput from './FiltroInput'

interface FiltroCarrinho {
  nome: string
  precoMin: string
  precoMax: string
  quantidade: string
}

interface SecaoFiltrosProps {
  filtro: FiltroCarrinho
  onFiltroChange: (novoFiltro: FiltroCarrinho) => void
  onLimpar: () => void
  filtrosAtivos: number
}

export default function SecaoFiltros({
  filtro,
  onFiltroChange,
  onLimpar,
  filtrosAtivos
}: SecaoFiltrosProps) {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>
          Filtros {filtrosAtivos > 0 && (
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '12px',
              marginLeft: '10px'
            }}>
              {filtrosAtivos}
            </span>
          )}
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <FiltroInput
          placeholder="Filtrar por nome"
          type="text"
          value={filtro.nome}
          onChange={(value) => onFiltroChange({ ...filtro, nome: value })}
        />
        <FiltroInput
          placeholder="Preço mínimo"
          type="number"
          value={filtro.precoMin}
          onChange={(value) => onFiltroChange({ ...filtro, precoMin: value })}
          onlyPositive={true}
        />
        <FiltroInput
          placeholder="Preço máximo"
          type="number"
          value={filtro.precoMax}
          onChange={(value) => onFiltroChange({ ...filtro, precoMax: value })}
          onlyPositive={true}
        />
        <FiltroInput
          placeholder="Quantidade mínima"
          type="number"
          value={filtro.quantidade}
          onChange={(value) => onFiltroChange({ ...filtro, quantidade: value })}
          onlyPositive={true}
        />
      </div>
      <button 
        onClick={onLimpar}
        style={{
          marginTop: '10px',
          padding: '8px 15px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Limpar Filtros
      </button>
    </div>
  )
}
