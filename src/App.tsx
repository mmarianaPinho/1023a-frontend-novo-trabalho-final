import { useEffect, useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ import correto

import "./App.css";

type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
};

type DecodedToken = {
  nome: string;
  tipo: string;
  exp: number;
};

function App() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState<{ nome: string; tipo: string } | null>(null);

  // 🔹 Atualiza o token e decodifica o usuário
  useEffect(() => {
    const atualizarToken = () => {
      const t = localStorage.getItem("token");
      setToken(t);

      if (t) {
        try {
          const decoded: DecodedToken = jwtDecode(t);
          setUsuario({ nome: decoded.nome, tipo: decoded.tipo });
        } catch (err) {
          console.error("Erro ao decodificar token:", err);
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    };

    atualizarToken();
    window.addEventListener("storage", atualizarToken);
    return () => window.removeEventListener("storage", atualizarToken);
  }, []);

  // 🔹 Buscar produtos
  useEffect(() => {
    api
      .get("/produtos")
      .then((res) => setProdutos(res.data))
      .catch(() => alert("Erro ao carregar produtos"));
  }, []);

  // 🔹 Adicionar item ao carrinho
  const adicionarItemCarrinho = async (produtoId: string) => {
    if (!token) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/adicionarItem",
        { produtoId, quantidade: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Produto adicionado ao carrinho!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login");
      } else {
        alert("Erro ao adicionar ao carrinho.");
      }
    }
  };

  // 🔹 Logout
  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
  }

  // 🔹 Estado e cadastro de novo produto
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    descricao: "",
    urlfoto: "",
  });

  async function cadastrarProduto(e: React.FormEvent) {
    e.preventDefault();

    if (!novoProduto.nome || !novoProduto.preco) {
      alert("Preencha ao menos o nome e o preço!");
      return;
    }

    try {
      await api.post("/produtos", novoProduto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Produto cadastrado com sucesso!");

      // Atualiza lista
      const res = await api.get("/produtos");
      setProdutos(res.data);

      // Limpa o formulário
      setNovoProduto({ nome: "", preco: "", descricao: "", urlfoto: "" });
    } catch (err) {
      alert("Erro ao cadastrar produto.");
    }
  }
  

  return (
    <div className="App">
      <header className="topo">
        <div className="usuario-info">
          {usuario ? (
            <p>
              👤 <strong>{usuario.nome}</strong> ({usuario.tipo})
            </p>
          ) : (
            <p>Não logado</p>
          )}
        </div>

        <div className="botoes-topo">
          {!token ? (
            <button onClick={() => navigate("/login")}>🔐 Fazer Login</button>
          ) : (
            <>
              <button onClick={() => navigate("/carrinho")}>🛒 Ver Carrinho</button>
              <button onClick={handleLogout}>🚪 Sair</button>
            </>
          )}
        </div>
      </header>

      <h1>🍰 Produtos Disponíveis</h1>

      {token && (
        <div className="cadastro-produto">
          <h2>📦 Cadastrar Novo Produto</h2>
          <form onSubmit={cadastrarProduto}>
            <input
              type="text"
              placeholder="Nome"
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            />
            <input
              type="number"
              placeholder="Preço"
              value={novoProduto.preco}
              onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            />
            <input
              type="text"
              placeholder="Descrição"
              value={novoProduto.descricao}
              onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
            />
            <input
              type="text"
              placeholder="URL da Foto"
              value={novoProduto.urlfoto}
              onChange={(e) => setNovoProduto({ ...novoProduto, urlfoto: e.target.value })}
            />
            <button type="submit">Cadastrar Produto</button>
          </form>
        </div>
      )}

      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <img src={produto.urlfoto} alt={produto.nome} />
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p>
              <strong>R$ {produto.preco}</strong>
            </p>

            {token && (
              <button onClick={() => adicionarItemCarrinho(produto._id)}>
                Adicionar ao Carrinho
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;