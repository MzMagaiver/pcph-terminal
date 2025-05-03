class JSTerminal {
  constructor() {
    this.outputEl = document.getElementById('js-output');
    this.commandEl = document.getElementById('js-command');
    this.history = [];
    this.historyIndex = 0;
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
PCPH JavaScript Terminal (v1.0)
Digite "help" para comandos ou "examples" para casos de uso
`);
  }

  execute() {
    const cmd = this.commandEl.value.trim();
    if (!cmd) return;

    this.history.push(cmd);
    this.historyIndex = this.history.length;
    this.print(`> ${cmd}`, 'input');

    try {
      const result = this.evaluate(cmd);
      this.print(result, 'output');
    } catch (e) {
      this.print(`Error: ${e.message}`, 'error');
      if (e.mensagemCompleta) {
        this.print(e.mensagemCompleta, 'error');
      }
    }

    this.commandEl.value = '';
  }

  evaluate(cmd) {
    if (cmd === 'help') return this.showHelp();
    if (cmd === 'examples') return this.showExamples();
    if (cmd === 'clear') {
      this.outputEl.innerHTML = '';
      return '';
    }

    // Avaliação de código PCPH
    if (cmd.includes('new pcph.Propósito')) {
      return this.handleProposito(cmd);
    }

    return `Unrecognized command: ${cmd}`;
  }

  handleProposito(cmd) {
    try {
      const prop = eval(cmd);
      const analise = prop.analisar();

      let output = `✔ Purpose created\n`;
      output += `Description: ${prop.metadata.descrição}\n`;
      output += `ID: ${prop.metadata.id}\n`;
      output += `Restrictions: ${prop.restrições.length}\n`;

      if (analise.status === 'aviso') {
        output += `⚠ Warnings:\n${analise.sugestoes.join('\n')}`;
      }

      // Mostrar como executar
      output += `\nHow to execute:\nawait ${cmd}.executar(dados);`;

      return output;
    } catch (e) {
      throw new ErroPCPH(
        "Purpose creation failed",
        `Command: ${cmd}`,
        "Check the syntax:\nnew pcph.Propósito({ descrição: '...', restrições: [...] })"
      );
    }
  }

  showHelp() {
    return `
PCPH JS Commands:
------------------
1. Create purpose:
   new pcph.Propósito({
       descrição: "Validate form",
       restrições: [
           { nome: "email", verificação: e => e.includes('@') }
       ]
   })

2. Useful commands:
   help       - Show this message
   examples   - Show usage examples
   clear      - Clear terminal
`;
  }

  showExamples() {
    return `
Ready-to-Use Examples:
----------------------
1. Email validation:
   new pcph.Propósito({
       descrição: "Validate email",
       restrições: [
           {
               nome: "valid_email",
               verificação: e => e.includes('@')
           }
       ]
   })

2. User login:
   new pcph.Propósito({
       descrição: "Authenticate user",
       restrições: [
           { nome: "username", verificação: u => u.length >= 3 },
           { nome: "password", verificação: p => p.length >= 6 }
       ],
       ação: dados => {
           console.log('Welcome', dados.username);
           return { status: 'logged_in' };
       }
   })
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
    div.className = `js-${type}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  new JSTerminal();
});
