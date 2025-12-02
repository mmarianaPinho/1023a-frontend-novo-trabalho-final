import { useEffect, useState } from "react";
import api from './api/api';
import { useNavigate } from 'react-router-dom';
import SecaoFiltros from './componentes/SecaoFiltros';
import './App.css';

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
    setFiltro({ nome: '', precoMin: '', precoMax: '', quantidade: '' });
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
      .catch(() => setErro("Erro ao atualizar quantidade"));
  };

  const removerItem = (itemId: string) => {
    api.delete(`/carrinho/${itemId}`)
      .then(() => {
        setItens(itens.filter(item => item.produto._id !== itemId));
      })
      .catch(() => setErro("Erro ao remover item"));
  };

  const limparCarrinho = () => {
    if (!window.confirm("Tem certeza que deseja limpar o carrinho?")) return;

    api.delete("/carrinho")
      .then(() => {
        setItens([]);
        setItensFiltrados([]);
        setFiltro({ nome: '', precoMin: '', precoMax: '', quantidade: '' });
      })
      .catch(() => setErro("Erro ao limpar carrinho"));
  };

  const handlePagamento = () => {
    const total = calcularTotal();
    navigate("/cartao", { state: { total } });
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

                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) => atualizarQuantidade(item.produto._id, Number(e.target.value))}
                />

                <button onClick={() => removerItem(item.produto._id)}>Remover</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, padding: 15, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Total: R$ {calcularTotal()}</h3>

            <button onClick={limparCarrinho}>🗑 Limpar Carrinho</button>

            <button onClick={handlePagamento}>💳 Finalizar Compra</button>
          </div>
        </>
      )}
    </div>
  );
}