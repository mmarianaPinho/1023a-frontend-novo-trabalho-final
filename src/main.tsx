import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Carrinho from './Carrinho'
import Login from './componentes/login/login.tsx'
import ListaProdutos from './Listarprodutos.tsx'
import Cartao from './Cartao.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Elements
  stripe={stripePromise}
  options={{
    mode: "setup",
    currency: "brl",
    appearance: {
      theme: "stripe",
    },
    paymentMethodCreation: "manual",  // impede Link
  }}
>

      <BrowserRouter>
        <Routes>
            <Route path="/" element={<App/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/produtos" element={<ListaProdutos />} />
            <Route path="/cartao" element={<Cartao />} />
        </Routes>
      </BrowserRouter>
    </Elements>
  </StrictMode>,
)
