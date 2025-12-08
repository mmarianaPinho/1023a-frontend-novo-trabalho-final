import { 
  useStripe, 
  useElements, 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement 
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api/api";

export default function CartaoPagamento() {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const total = location.state?.total;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const pagar = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      
      const { data } = await api.post("/pagamento", {
        amount: Math.round(Number(total) * 100), 
      });

      const { clientSecret } = data;

      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      });

      if (result.error) {
        setStatus("Erro: " + result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        setStatus("Pagamento aprovado! Limpando carrinho...");

        try {
         
          await api.delete("/carrinho");

          
          localStorage.removeItem("filtrosCarrinho");
        } catch (e) {
          console.error("Erro ao limpar carrinho:", e);
        }

        
        setTimeout(() => navigate("/carrinho"), 2000);
      }
    } catch (e) {
      setStatus("Erro no pagamento.");
    }

    setLoading(false);
  };

  if (!total) {
    return <p>Erro: nenhum valor recebido do carrinho.</p>;
  }

  return (
    <div className="carrinho-container">
      <button onClick={() => navigate('/carrinho')}>Voltar</button>
      <h2>Pagar R$ {total}</h2>

      <div className="pagamento-container">
        <label>Número do cartão</label>
        <div className="card-element">
          <CardNumberElement
            options={{
              showIcon: true,
              placeholder: "0000 0000 0000 0000",
            }}
          />
        </div>

        <label>Validade</label>
        <div className="card-element">
          <CardExpiryElement />
        </div>

        <label>CVC</label>
        <div className="card-element">
          <CardCvcElement />
        </div>
      </div>

      <button onClick={pagar} disabled={loading}>
        {loading ? "Processando..." : "Confirmar pagamento"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
