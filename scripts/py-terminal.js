class PythonTerminal {
  constructor() {
    this.outputEl = document.getElementById('py-output');
    this.commandEl = document.getElementById('py-command');
    this.history = [];
    this.init();
  }

  init() {
    this.commandEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.execute();
      if (e.key === 'ArrowUp') this.prevCommand();
      if (e.key === 'ArrowDown') this.nextCommand();
    });
    this.printBanner();
  }

  printBanner() {
    this.print(`
Python 3.9.0 (PCPH Edition)
Digite "ajuda" para comandos ou "exemplos" para ver casos de uso
`);
  }

  execute() {
    const cmd = this.commandEl.value.trim();
    if (!cmd) return;

    this.history.push(cmd);
    this.historyIndex = this.history.length;
    this.print(`>>> ${cmd}`, 'input');

    try {
      const result = this.interpret(cmd);
      this.print(result, 'output');
    } catch (e) {
      this.print(`Erro: ${e.message}`, 'error');
      if (e.mensagemCompleta) {
        this.print(e.mensagemCompleta, 'error');
      }
    }

    this.commandEl.value = '';
  }

  interpret(cmd) {
    if (cmd === 'ajuda') return this.showHelp();
    if (cmd === 'exemplos') return this.showExamples();
    if (cmd === 'limpar') {
      this.outputEl.innerHTML = '';
      return '';
    }

    // Converter sintaxe Python para JS
    if (cmd.includes('pcph.Propósito')) {
      return this.handleProposito(cmd);
    }

    return `Comando não reconhecido: ${cmd}`;
  }

  handleProposito(cmd) {
    try {
      // Conversão básica Python -> JS
      const jsCode = cmd
        .replace(/pcph\.Propósito\(/g, 'new pcph.Propósito({')
        .replace(/\)\s*$/g, '})')
        .replace(/'/g, '"')
        .replace(/#.*$/gm, '')
        .replace(/,\s*\)/g, ')');

      const prop = eval(jsCode);
      const analise = prop.analisar();

      let output = `✔ Propósito "${prop.metadata.descrição}" criado\n`;
      output += `ID: ${prop.metadata.id}\n`;
      output += `Restrições: ${prop.restrições.length}\n`;

      if (analise.status === 'aviso') {
        output += `⚠ Atenções:\n${analise.sugestoes.join('\n')}`;
      }

      return output;
    } catch (e) {
      throw new ErroPCPH(
        "Erro na criação do propósito",
        `Comando: ${cmd}`,
        "Verifique se usou a sintaxe correta:\npcph.Propósito(descrição=\"...\", restrições=[...])"
      );
    }
  }

  showHelp() {
    return `
Comandos PCPH Python:
----------------------
1. Criar propósito:
   pcph.Propósito(
       descrição="Validar formulário",
       restrições=["email", "idade"]
   )

2. Comandos úteis:
   ajuda       - Mostra esta mensagem
   exemplos    - Mostra exemplos prontos
   limpar      - Limpa o terminal
`;
  }

  showExamples() {
    return `
Exemplos Prontos:
------------------
1. Validação de email:
   pcph.Propósito(
       descrição="Validar email",
       restrições=[{
           "nome": "email_valido",
           "verificação": lambda e: '@' in e
       }]
   )

2. Login de usuário:
   pcph.Propósito(
       descrição="Autenticar usuário",
       restrições=[
           {"nome": "usuario", "verificação": lambda u: len(u) >= 3},
           {"nome": "senha", "verificação": lambda s: len(s) >= 6}
       ],
       ação=lambda d: print(f"Bem-vindo {d['usuario']}!")
   )
`;
  }

  prevCommand() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.commandEl.value = this.history[this.historyIndex];
    }
  }

  nextCommand() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.commandEl.value = this.history[this.historyIndex];
    } else {
      this.historyIndex = this.history.length;
      this.commandEl.value = '';
    }
  }

  print(text, type = 'output') {
    const div = document.createElement('div');
    div.className = `py-${type}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  new PythonTerminal();
});
