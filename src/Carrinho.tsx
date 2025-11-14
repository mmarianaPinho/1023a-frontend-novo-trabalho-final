import { useEffect, useState } from "react";
import api from './api/api';
import { useNavigate } from 'react-router-dom';
import SecaoFiltros from './componentes/SecaoFiltros';
import ItemCarrinho from './componentes/ItemCarrinho';
import './App.css';

// Função de debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const carrinhoStyles = {
  carrinho_footer: {
    marginTop: '20px',
    padding: '15px',
    borderTop: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

type ItemCarrinho = {
  _id: string;
  produto: {
    _id: string;
    nome: string;
    preco: number;
    urlfoto: string;
  };
  quantidade: number;
};

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [itensFiltrados, setItensFiltrados] = useState<ItemCarrinho[]>([]);
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState(() => {
    const filtroSalvo = localStorage.getItem('filtrosCarrinho');
    return filtroSalvo ? JSON.parse(filtroSalvo) : {
      nome: '',
      precoMin: '',
      precoMax: '',
      quantidade: ''
    };
  });

  const filtroDebouncado = useDebounce(filtro, 300);

  const calcularTotal = () => {
    return itensFiltrados.reduce((total, item) =>
      total + (item.produto.preco * item.quantidade), 0
    ).toFixed(2);
  };

  const aplicarFiltros = () => {
    let itensFiltered = itens;

    if (filtro.nome) {
      itensFiltered = itensFiltered.filter(item =>
        item.produto.nome.toLowerCase().includes(filtro.nome.toLowerCase())
      );
    }

    if (filtro.precoMin) {
      itensFiltered = itensFiltered.filter(item =>
        item.produto.preco >= parseFloat(filtro.precoMin)
      );
    }

    if (filtro.precoMax) {
      itensFiltered = itensFiltered.filter(item =>
        item.produto.preco <= parseFloat(filtro.precoMax)
      );
    }

    if (filtro.quantidade) {
      itensFiltered = itensFiltered.filter(item =>
        item.quantidade >= parseInt(filtro.quantidade)
      );
    }

    setItensFiltrados(itensFiltered);
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtro.nome) count++;
    if (filtro.precoMin) count++;
    if (filtro.precoMax) count++;
    if (filtro.quantidade) count++;
    return count;
  };

  const limparFiltros = () => {
    setFiltro({
      nome: '',
      precoMin: '',
      precoMax: '',
      quantidade: ''
    });
    setItensFiltrados(itens);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa fazer login para ver o carrinho.");
      navigate("/login");
      return;
    }

    api.get("/carrinho")
      .then((res) => {
        setItens(res.data.itens);
        setItensFiltrados(res.data.itens);
      })
      .catch(() => setErro("Não foi possível carregar o carrinho."));
  }, [navigate]);

  useEffect(() => {
    aplicarFiltros();
    localStorage.setItem('filtrosCarrinho', JSON.stringify(filtro));
  }, [filtroDebouncado]);

  useEffect(() => {
    aplicarFiltros();
  }, [itens]);

  // ⭐ CORRIGIDO AQUI: usando produto._id
  const atualizarQuantidade = (id: string, novaQtd: number) => {
    if (novaQtd < 1) {
      setErro("Quantidade deve ser pelo menos 1");
      return;
    }

    api.put(`/carrinho/${id}`, { quantidade: novaQtd })
      .then(() => {
        setItens(itens.map(item =>
          item.produto._id === id ? { ...item, quantidade: novaQtd } : item
        ));
      })
      .catch((error) => {
        console.error("Erro ao atualizar quantidade:", error);
        setErro("Erro ao atualizar quantidade");
      });
  };

  // ⭐ CORRIGIDO: remover usando produto._id
  const removerItem = (itemId: string) => {
    api.delete(`/carrinho/${itemId}`)
      .then(() => {
        const novoItens = itens.filter(item => item.produto._id !== itemId);
        setItens(novoItens);
      })
      .catch((error) => {
        console.error("Erro ao remover item:", error);
        setErro("Erro ao remover item");
      });
  };

  const limparCarrinho = () => {
    if (!window.confirm("Tem certeza que deseja limpar o carrinho?")) {
      return;
    }
    
    api.delete("/carrinho")
      .then(() => {
        setItens([]);
        setItensFiltrados([]);
        setFiltro({
          nome: '',
          precoMin: '',
          precoMax: '',
          quantidade: ''
        });
        setErro(null);
      })
      .catch((error) => {
        console.error("Erro ao limpar carrinho:", error);
        setErro("Erro ao limpar carrinho");
      });
  };

  if (erro) return <p>{erro}</p>;

  return (
    <div className="carrinho-container">
      <h1>🛒 Meu Carrinho</h1>
      <button onClick={() => navigate("/")}>Voltar</button>

      <SecaoFiltros
        filtro={filtro}
        onFiltroChange={setFiltro}
        onLimpar={limparFiltros}
        filtrosAtivos={contarFiltrosAtivos()}
      />

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <p>Mostrando {itensFiltrados.length} de {itens.length} itens</p>

          {itensFiltrados.map((item) => (
            <div key={item._id} className="item-carrinho">
              <img src={item.produto.urlfoto} alt={item.produto.nome} />
              <div>
                <h3>{item.produto.nome}</h3>
                <p>Preço: R$ {item.produto.preco}</p>

                {/* ⭐ CORRIGIDO: usa item.produto._id */}
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) =>
                    atualizarQuantidade(item.produto._id, Number(e.target.value))
                  }
                />

                {/* ⭐ CORRIGIDO: usa item.produto._id */}
                <button onClick={() => removerItem(item.produto._id)}>
                  Remover
                </button>
              </div>
            </div>
          ))}

          <div style={carrinhoStyles.carrinho_footer}>
            <h3>Total: R$ {calcularTotal()}</h3>
            <button onClick={limparCarrinho}>🗑 Limpar Carrinho</button>
          </div>
        </>
      )}
    </div>
  );
}
