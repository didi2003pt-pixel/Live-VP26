# Prompt mestre — aplicação Volta a Portugal à Vela 2026

Usa o texto seguinte num agente de programação profissional para transformar este protótipo num produto de produção.

---

## PAPEL

Age como uma equipa sénior composta por product designer, arquiteto de software, engenheiro frontend, engenheiro backend, especialista GIS/AIS, especialista em segurança e especialista em sistemas de classificação de vela.

## OBJETIVO

Desenvolve uma aplicação web profissional, rápida, responsiva e acessível para acompanhar em direto a **Volta a Portugal à Vela 2026**, composta por **8 etapas**. A prova encontra-se atualmente na **Etapa 5 — In-Port Cascais → Lisboa, 29 de julho de 2026**.

A aplicação deve servir quatro públicos:

1. Público e comunicação social.
2. Tripulações e equipas em terra.
3. Comissão de Regatas e organização.
4. Administradores técnicos.

O produto deve distinguir de forma inequívoca:

- posição na água;
- classificação corrigida estimada;
- classificação provisória validada pela organização;
- resultado oficial.

Nunca apresentar uma estimativa automática como resultado oficial.

## IDENTIDADE VISUAL

Usa o logótipo fornecido em `assets/logo-volta-portugal-2026.jpeg`.

Direção visual:

- Azul-marinho profundo como cor estrutural.
- Vermelho vivo para direto, alertas e ações principais.
- Verde-lima para progresso e estados positivos.
- Amarelo para percurso e destaques.
- Branco e cinzas claros para legibilidade.
- Tipografia moderna, desportiva e institucional.
- Aparência premium, marítima, enérgica e credível.
- Design mobile-first, sem parecer um template genérico.

## EXPERIÊNCIA PÚBLICA

Cria as páginas e módulos seguintes:

### 1. Página principal em direto

- Cabeçalho com identidade da prova.
- Estado da etapa: por iniciar, em direto, suspensa, encurtada, concluída.
- Hora oficial e idade da última atualização.
- Mapa interativo com percurso, marcas, linha de largada, linha de chegada e barcos.
- Cartões dos três primeiros na água.
- Alternância entre “Posição na água” e “Corrigida estimada”.
- Aviso visível quando os dados são demonstração, estimados, atrasados ou não oficiais.

### 2. Mapa

Usa uma biblioteca cartográfica adequada e mapas licenciados corretamente.

O mapa deve mostrar:

- percurso oficial ordenado;
- áreas de passagem de cada marca;
- sentido e lado obrigatório de contorno;
- posição, rumo, velocidade e rasto de cada barco;
- idade da última posição;
- origem do dado AIS;
- barcos sem sinal ou com posição atrasada;
- encurtamentos ativos;
- chegada e cruzamento da linha;
- filtros por classe ORC/ANC, grupo e barco.

Não uses apenas distância em linha reta à chegada. O progresso deve ser calculado por:

1. número de marcas completadas;
2. perna atual;
3. projeção da posição sobre o eixo da perna;
4. distância restante até à próxima marca;
5. regras de passagem e lado de contorno.

### 3. Classificação

Apresenta tabelas separadas por classe e sistema.

Campos mínimos:

- posição;
- nome do barco;
- número de vela;
- classe/grupo;
- última marca validada;
- distância à próxima marca;
- velocidade;
- tempo real decorrido;
- rating usado;
- tempo corrigido estimado;
- estado AIS;
- penalizações;
- estado de prova: racing, finished, DNF, DNS, OCS, RET, DSQ, TLE ou equivalente.

### 4. Oito etapas

- Página de calendário com 8 etapas.
- Estado de cada etapa.
- Percurso, data, documentos, classificações e replay.
- Classificação geral acumulada, quando as regras oficiais forem fornecidas.
- Não inventar nomes, datas ou percursos ausentes: marcar como “por configurar”.

### 5. Página de cada barco

- Nome, número de vela, classe, modelo, bandeira e imagem.
- Rating ANC ou coeficientes ORC aplicáveis.
- MMSI confirmado.
- Posição atual e histórico da etapa.
- Resultados por etapa.
- Estado e qualidade dos dados.

## ETAPA 5 — REGRAS JÁ CONHECIDAS

Configura a Etapa 5 com estes dados:

- Nome: In-Port Cascais → Lisboa.
- Data: 29/07/2026.
- Sinal de advertência: 13:55.
- Percurso: Largada → Desmarque → Chegada.
- Baliza de largada: cónica vermelha.
- Baliza de desmarque: cónica vermelha.
- Chegada: linha entre o mastro com bandeira azul em frente à sede da Federação Portuguesa de Vela, na Doca de Belém, e uma baliza virtual 200 m a sul.
- Possibilidade de encurtamento em balizas de navegação do rio Tejo.
- Canal VHF da Comissão de Regatas: 72.
- Canal VHF do oficial de chegada: 9.
- Penalização por incumprimento do check-in: 5 minutos acrescentados ao tempo real.
- Tempo limite do primeiro barco em cada classe: 3 h 30 min.
- Tempo limite dos restantes: 90 minutos após o primeiro da respetiva classe.

As coordenadas oficiais ainda não estão confirmadas. Cria campos administrativos obrigatórios e impede a publicação da etapa como “oficialmente configurada” enquanto faltarem coordenadas, lados de passagem ou hora real de largada.

## CÁLCULO DE TEMPOS CORRIGIDOS

### ORC

Usa o coeficiente **Time on Time — All Purpose** indicado no certificado válido do barco:

`tempo_corrigido = (tempo_real + penalizacoes_tempo_real) × tot_all_purpose`

### ANC

Usa o Rating ANC válido:

`tempo_corrigido = (tempo_real + penalizacoes_tempo_real) × rating_anc`

Requisitos:

- guardar o certificado e a sua validade;
- guardar a origem de cada rating;
- impedir mistura direta entre ANC e ORC;
- separar resultados por classe;
- permitir substituição de certificado apenas com auditoria;
- recalcular resultados quando uma penalização ou rating for alterado;
- mostrar arredondamento de acordo com as regras oficiais fornecidas;
- não usar APH ToD quando a instrução exige ToT All Purpose.

## INTEGRAÇÃO AIS / MARINETRAFFIC / KPLER

Cria uma camada de integração desacoplada por fornecedor.

Nunca expor a chave AIS no browser.

Fluxo:

1. Backend recebe posições AIS por API autorizada.
2. Normaliza MMSI, timestamp, latitude, longitude, SOG, COG, heading e fonte.
3. Valida posições impossíveis, duplicadas ou demasiado antigas.
4. Guarda histórico em base de dados.
5. Publica atualizações para o frontend por WebSocket ou Server-Sent Events.
6. O frontend indica idade e qualidade da posição.

Cada barco deve ser associado por MMSI confirmado, não apenas por nome.

Implementa estados:

- recente;
- atrasada;
- sem sinal;
- posição suspeita;
- MMSI por confirmar;
- AIS desligado;
- atualização manual.

## PAINEL DA ORGANIZAÇÃO

Cria autenticação por funções:

- administrador;
- Comissão de Regatas;
- oficial de chegada;
- operador de dados;
- leitura.

Funções administrativas:

- configurar as 8 etapas;
- importar barcos e certificados;
- confirmar MMSI;
- desenhar percurso no mapa;
- definir raio e regras de passagem das marcas;
- definir linha de largada e chegada;
- registar hora oficial de largada;
- ativar encurtamento;
- validar passagens;
- corrigir falsas passagens automáticas;
- marcar DNS, OCS, RET, DNF, DSQ e TLE;
- aplicar penalizações;
- validar chegada;
- congelar e publicar resultados;
- exportar CSV, Excel e PDF;
- manter histórico completo de alterações.

Toda alteração relevante deve guardar:

- utilizador;
- data e hora;
- valor anterior;
- valor novo;
- motivo;
- referência documental.

## MODELO DE DADOS MÍNIMO

Cria entidades para:

- event;
- stage;
- course;
- mark;
- start_line;
- finish_line;
- boat;
- crew/team;
- certificate;
- rating;
- class;
- AIS identity;
- position;
- mark passage;
- start record;
- finish record;
- penalty;
- race status;
- provisional result;
- official result;
- user;
- role;
- audit log;
- document;
- system alert.

## ARQUITETURA TÉCNICA

Constrói uma solução de produção com:

- frontend moderno em TypeScript;
- componentes acessíveis e responsivos;
- backend com API segura;
- PostgreSQL;
- migrações e dados de demonstração;
- autenticação robusta;
- atualização em tempo real;
- testes unitários, integração e end-to-end;
- Docker para ambiente local;
- CI no GitHub;
- monitorização, logs e tratamento de erros;
- cache e limites de pedidos à API AIS;
- política de retenção de posições;
- backups;
- configuração por variáveis de ambiente.

Não fixes versões antigas; usa versões estáveis e suportadas no momento da implementação.

## SEGURANÇA E PRIVACIDADE

- Chaves e segredos apenas no servidor.
- Validação de todos os inputs.
- Rate limiting.
- Proteção contra CSRF, XSS, injeção e abuso de endpoints.
- Sessões seguras.
- Registo de auditoria imutável para resultados.
- Política de privacidade e informação sobre dados de localização.
- Diferenciar dados públicos, operacionais e administrativos.

## ACESSIBILIDADE E DESEMPENHO

- WCAG 2.2 AA como objetivo.
- Navegação por teclado.
- Contraste suficiente.
- Alternativas ao mapa para leitores de ecrã.
- Tabelas acessíveis.
- Respeitar “prefers-reduced-motion”.
- Página principal rápida em redes móveis.
- Imagens otimizadas.
- Carregamento progressivo e estados de erro claros.

## ENTREGÁVEIS

Produz:

1. Repositório completo.
2. README com instalação, arquitetura e operação.
3. `.env.example` sem segredos.
4. Migrações da base de dados.
5. Seed com dados demonstrativos claramente marcados.
6. Interface pública.
7. Painel administrativo.
8. Adaptador AIS em modo mock e estrutura para fornecedor real.
9. Testes.
10. Docker Compose.
11. Pipeline GitHub Actions.
12. Guia de publicação.
13. Lista de riscos e decisões ainda pendentes.

## CRITÉRIOS DE ACEITAÇÃO

- Funciona bem em telemóvel e computador.
- Mostra 8 etapas e destaca a etapa ativa.
- Não mistura ORC e ANC.
- Calcula corretamente as fórmulas indicadas.
- Assinala dados simulados e estimativas.
- Não chama “oficial” a dados não validados.
- Permite configurar coordenadas e passagens sem alterar código.
- Permite associar cada barco por MMSI.
- Mostra idade da última posição.
- Mantém auditoria de alterações.
- Continua funcional em modo demonstração sem API AIS.
- Inclui mensagens de erro úteis e estados vazios.

## REGRA FINAL

Não inventes coordenadas, MMSI, ratings, nomes de etapas, resultados ou decisões da Comissão. Quando um dado oficial estiver em falta, cria o campo, bloqueia a ação que dele depende e mostra uma mensagem clara sobre o que falta.

---
