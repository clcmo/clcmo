🇧🇷 **Português** | 🇺🇸 [English](CONTRIBUTING.en.md)

# Contribuindo

Obrigado por considerar contribuir com este projeto! 🎉

## Como Contribuir

### Reportando Bugs

Se você encontrou um bug, por favor:

1. Verifique se o bug já não foi reportado nas [Issues](../../../issues)
2. Abra uma nova issue incluindo:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs comportamento atual
   - Screenshots (se aplicável)
   - Informações do ambiente (SO, versão do Node, etc)

### Sugerindo Melhorias

Sugestões de melhorias são sempre bem-vindas! Abra uma issue descrevendo:

- O problema que sua sugestão resolve
- Como você imagina a solução
- Alternativas que você considerou

### Pull Requests

1. **Fork o projeto** e clone localmente
2. **Crie uma branch** para sua feature ou correção:

   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/correcao-bug
   ```

3. **Faça suas alterações** seguindo os padrões do projeto:
   - Mantenha o código limpo e legível
   - Adicione comentários quando necessário
   - Siga as convenções de nomenclatura existentes

4. **Teste suas alterações** completamente

5. **Commit suas mudanças** com mensagens claras:

   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   git commit -m "fix: corrige problema Y"
   git commit -m "docs: atualiza documentação Z"
   ```

6. **Push para seu fork**:

   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request** descrevendo:
   - O que foi alterado
   - Por que foi alterado
   - Como testar as mudanças

### Padrões de Commit

Utilizamos mensagens de commit semânticas:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `test:` adição ou modificação de testes
- `chore:` tarefas de manutenção

Os commits também definem as versões: `fix:` gera uma versão de correção (patch), `feat:` uma versão de funcionalidade (minor), e `feat!:` ou um rodapé `BREAKING CHANGE:` uma versão com quebra de compatibilidade (major). Os demais tipos não geram versão.

### Processo de Review

- Todas as contribuições passam por review
- Mudanças podem ser solicitadas para alinhamento com o projeto
- Seja paciente e respeitoso durante o processo
- Discussões construtivas são encorajadas

## Desenvolvimento Local

```bash
# Clone seu fork
git clone https://github.com/clcmo/nome-do-projeto.git

# Entre no diretório
cd nome-do-projeto

# Instale as dependências
npm install
# ou
yarn install

# Execute o projeto
npm start
# ou
yarn start
```

## Precisa de Ajuda?

- Abra uma issue com a tag `question`
- Entre em contato através das discussões do projeto

## Código de Conduta

Ao contribuir, você concorda em seguir nosso [Código de Conduta](CODE_OF_CONDUCT.md).

---

**Obrigado por contribuir! 🚀**