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
    });
    this.printBanner();
  }

  printBanner() {
    this.print(`
Python 3.9.0 (PCPH Edition)
Digite "ajuda" para comandos disponíveis
`);
  }

  execute() {
    const cmd = this.commandEl.value.trim();
    if (!cmd) return;

    this.history.push(cmd);
    this.print(`>>> ${cmd}`, 'input');

    try {
      const result = this.interpret(cmd);
      this.print(result, 'output');
    } catch (e) {
      this.print(`Erro: ${e.message}`, 'error');
    }

    this.commandEl.value = '';
  }

  interpret(cmd) {
    // Simulação de código Python
    if (cmd.includes('pcph.Propósito')) {
      return this.handleProposito(cmd);
    }
    if (cmd === 'ajuda') {
      return this.showHelp();
    }
    return `Comando não reconhecido: ${cmd}`;
  }

  handleProposito(cmd) {
    // Extrai parâmetros do comando Python simulado
    const match = cmd.match(/pcph\.Propósito\((.+)\)/);
    if (!match) throw new Error('Sintaxe inválida');

    // Simulação da execução
    return `✔ Propósito criado com:\n${match[1]}`;
  }

  print(text, type = 'output') {
    const div = document.createElement('div');
    div.className = `py-${type}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

new PythonTerminal();
