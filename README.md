# Volta a Portugal à Vela 2026 — Live

Protótipo profissional para uma aplicação pública de acompanhamento em direto das 8 etapas da Volta a Portugal à Vela 2026.

## O que já está incluído

- Página pública responsiva para computador e telemóvel.
- Identidade visual baseada no logótipo fornecido.
- Etapa 5 destacada: In-Port Cascais → Lisboa.
- Mapa ilustrativo sem dependências externas.
- Classificação na água e classificação corrigida estimada.
- Separação ORC e ANC.
- Fórmulas previstas nas Instruções de Regata:
  - ORC: `Tempo Real × Time on Time / All Purpose`
  - ANC: `Tempo Real × Rating ANC`
- Demonstração com vários barcos e ratings recebidos.
- Painel visual da organização.
- Servidor Node.js de demonstração com endpoint `/api/live`.
- Prompt mestre de desenvolvimento em `MASTER_PROMPT.md`.

## Arranque rápido — apenas HTML

Abrir `index.html` num browser. O protótipo funciona em modo demonstração sem instalar nada.

## Arranque com servidor local

```bash
cd server
cp .env.example .env
npm install
npm start
```

Depois abrir `http://localhost:4173`.

## Criar um repositório GitHub

```bash
git init
git add .
git commit -m "MVP Volta a Portugal à Vela Live"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

## O que falta para produção

1. Lista oficial de barcos, números de vela, classes e ratings válidos para cada etapa.
2. MMSI confirmado de cada embarcação.
3. Coordenadas oficiais da largada, desmarques, portas, encurtamentos e chegada.
4. Contrato e credenciais da API AIS/MarineTraffic/Kpler ou outro fornecedor autorizado.
5. Backend persistente com PostgreSQL/Supabase.
6. Autenticação da organização e registo de auditoria.
7. Regras de deteção de passagem de marcas e validação manual.
8. Domínio, alojamento, monitorização e política de privacidade.

## Estrutura

```text
volta-portugal-vela-live/
├── index.html
├── MASTER_PROMPT.md
├── README.md
├── assets/
│   └── logo-volta-portugal-2026.jpeg
├── src/
│   ├── app.js
│   └── styles.css
└── server/
    ├── .env.example
    ├── package.json
    └── server.js
```

## Nota importante

Os dados, posições e traçado apresentados no protótipo são demonstrativos. A aplicação deve mostrar claramente a diferença entre:

- dados AIS recebidos;
- cálculos automáticos;
- decisões da Comissão de Regatas;
- resultados oficiais publicados.
