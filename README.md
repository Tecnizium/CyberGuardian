# CyberGuardian: Network Security Analytics

## Descrição
CyberGuardian é uma ferramenta avançada de análise de segurança de rede, projetada para monitorar, analisar e relatar atividades de rede potencialmente maliciosas. Utilizando dados de sistemas de detecção de intrusão, CyberGuardian oferece insights detalhados sobre ataques, protocolos de rede utilizados, severidade das ameaças, e muito mais.

## Características
- **Detecção de Ataques**: Identifica os tipos mais comuns de ataques na rede.
- **Análise de Protocolos**: Fornece uma visão geral dos protocolos mais utilizados em atividades suspeitas.
- **Avaliação de Severidade**: Classifica ataques com base em sua gravidade.
- **Relatório de Atividades Suspeitas**: Gera relatórios detalhados sobre atividades de rede anormais.
- **Análise Geográfica**: Mapeia a origem dos ataques com base em dados de localização.

## Instalação

Antes de instalar o CyberGuardian, certifique-se de ter Node.js e npm instalados no seu sistema. 

1. Clone o repositório para sua máquina local:
   ```
   git clone [URL do repositório]
   ```
2. Navegue até a pasta do projeto e instale as dependências:
   ```
   cd CyberGuardian
   npm install
   ```

## Uso

Para executar o CyberGuardian, siga estes passos:

1. Coloque seu arquivo de dados `data.xlsx` no diretório raiz do projeto.
2. Execute o script principal:
   ```
   node index.js
   ```
3. Os relatórios gerados serão salvos em arquivos JSON no diretório raiz.

## Contribuições

Contribuições para o CyberGuardian são bem-vindas. Se você tem uma sugestão de melhoria ou encontrou um bug, por favor, abra uma issue ou faça um pull request.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).