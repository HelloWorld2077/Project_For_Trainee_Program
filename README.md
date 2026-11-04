Olá esse é o projeto para o programa de Treinee!

A lógica por trás do aplicativo na verdade é bem simples, nós primeiro precisamos de um banco de dados aonde podemos guardas as informações advindas do dataset,
para podermos melhor gerenciar e manipular os dados.

Também tabelas para registrar quais são os subjects vigiados e a relação entre eles, temos uma tabela para registrar a relação entre usuário com medidas protetivas, ganges, tipos de pessoas.

Em função da hora em que eu terminei esse projeto eu irei incluir uma resumo feito com IA para explicar o programa:

# Sistema de Identificação de Encontros entre Monitorados

## 1. Lógica utilizada

O projeto foi desenvolvido utilizando JavaScript com Node.js e SQLite para armazenamento e consulta dos dados.

O objetivo principal é identificar possíveis encontros entre pessoas monitoradas, considerando suas posições geográficas, e classificá-los de acordo com as informações disponíveis sobre cada indivíduo.

Inicialmente, o sistema obtém os dados de entrada e realiza a separação das informações utilizando o delimitador `;`. Esses dados são organizados e armazenados no banco de dados SQLite, permitindo consultar os indivíduos monitorados e suas respectivas posições.

Para identificar os encontros, o sistema compara as posições dos indivíduos, considerando apenas registros que possuam o mesmo timestamp. Dessa forma, são comparadas posições referentes ao mesmo instante, evitando identificar como encontro situações em que os indivíduos estavam próximos em momentos diferentes.

A distância entre duas posições geográficas é calculada utilizando a fórmula de Haversine, considerando o raio médio da Terra de 6.371.000 metros. Caso a distância calculada seja inferior a 20 metros, o sistema considera que existe um encontro entre os indivíduos.

Após identificar um encontro, o sistema verifica as informações dos envolvidos para determinar sua classificação:

- **Genérico:** utilizado quando não existe uma relação específica entre os indivíduos que justifique outra classificação.
- **Facção:** utilizado quando os dois indivíduos pertencem à mesma facção.
- **Protetiva:** utilizado quando existe uma medida protetiva registrada entre os indivíduos, considerando a relação entre agressor e pessoa protegida.

A verificação das medidas protetivas considera as duas possíveis ordens dos indivíduos na comparação. Assim, a identificação continua funcionando independentemente de qual deles aparece primeiro no processo de comparação.

Também foi implementado um mecanismo para evitar a geração de alertas duplicados. Para isso, o sistema mantém um registro dos encontros já identificados, considerando os identificadores dos dois indivíduos e o timestamp. Dessa maneira, a mesma combinação de pessoas não gera múltiplos alertas para o mesmo instante, mesmo que a ordem dos identificadores seja invertida.

Por fim, os encontros identificados são organizados em objetos JSON contendo o tipo de alerta, os identificadores dos indivíduos envolvidos, o timestamp, as coordenadas geográficas de cada um e a distância calculada em metros.

## 2. Organização do projeto

O projeto foi dividido em arquivos com responsabilidades distintas, facilitando a manutenção e a compreensão do código.

- **index.js:** responsável por iniciar o servidor HTTP e disponibilizar a aplicação.
- **endpoint_gathering.js:** responsável por obter os dados de entrada, processar as informações e realizar as comparações entre as posições dos indivíduos.
- **server_commands.js:** concentra as operações relacionadas ao banco de dados SQLite.
- **equation.js:** contém a implementação da fórmula de Haversine, utilizada para calcular a distância entre duas coordenadas geográficas.
- **general_tools.js:** reúne funções auxiliares utilizadas na classificação dos encontros, verificação das medidas protetivas, controle de duplicidade e organização dos resultados JSON.

Essa separação permite que cada parte do sistema tenha uma responsabilidade específica, evitando concentrar toda a lógica em um único arquivo.

## 3. Como executar o projeto

Para executar o projeto, é necessário ter o Node.js instalado e acessar o diretório em que os arquivos da aplicação estão localizados.

Caso o projeto possua um arquivo `package.json` com suas dependências declaradas, elas podem ser instaladas utilizando:

```bash
npm install
```

Após a instalação, o servidor pode ser iniciado utilizando:

```bash
node index.js
```

O servidor HTTP utiliza a porta 3000. Portanto, após sua inicialização, a aplicação poderá ser acessada localmente por meio de:

```text
http://localhost:3000
```

O processamento dos dados e a disponibilização dos resultados seguem o fluxo implementado na aplicação. Caso exista uma rota específica para consultar os resultados, ela deverá ser utilizada conforme definida no arquivo `index.js`.

## 4. Por que considero esta a melhor abordagem

Considerei essa abordagem adequada porque ela permite dividir um problema relativamente complexo em etapas menores e mais fáceis de compreender e manter.

A utilização do SQLite permite armazenar e consultar os dados sem a necessidade de configurar um servidor de banco de dados independente, enquanto o Node.js oferece os recursos necessários para processar as informações e disponibilizar os resultados.

A implementação da fórmula de Haversine permite calcular distâncias geográficas levando em consideração a curvatura da Terra, sendo mais apropriada para esse tipo de comparação do que utilizar uma simples distância entre coordenadas.

Outro ponto importante é a separação das responsabilidades entre os arquivos. Isso facilita futuras alterações, como modificar a forma de obtenção dos dados, aprimorar as consultas ao banco ou adicionar novas classificações de encontros, sem precisar reescrever toda a aplicação.

Por fim, o controle de encontros duplicados e a verificação das relações entre os indivíduos ajudam a garantir que os alertas gerados sejam consistentes com as regras estabelecidas pelo problema.

Dessa forma, considero que a solução atende aos requisitos propostos utilizando uma estrutura relativamente simples, modular e que permite futuras melhorias sem adicionar complexidade desnecessária ao projeto.
