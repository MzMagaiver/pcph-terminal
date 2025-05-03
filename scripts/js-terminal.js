class JSTerminal {
  constructor() {
    this.outputEl = document.getElementById('js-output');
    this.commandEl = document.getElementById('js-command');
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
PCPH JavaScript Terminal (v1.0)
Digite "help" para comandos disponíveis
`);
  }

  execute() {
    const cmd = this.commandEl.value.trim();
    if (!cmd) return;

    this.history.push(cmd);
    this.print(`> ${cmd}`, 'input');

    try {
      const result = this.evaluate(cmd);
      this.print(result, 'output');
    } catch (e) {
      this.print(`Error: ${e.message}`, 'error');
    }

    this.commandEl.value = '';
  }

  evaluate(cmd) {
    // Avaliação real de JS (cuidado!)
    if (cmd.startsWith('new pcph.Propósito')) {
      try {
        const prop = eval(cmd);
        return JSON.stringify({
          status: 'success',
          purpose: prop.metadata.descrição
        }, null, 2);
      } catch (e) {
        throw new Error('Invalid PCPH syntax');
      }
    }
    if (cmd === 'help') {
      return this.showHelp();
    }
    return `Unrecognized command: ${cmd}`;
  }

  print(text, type = 'output') {
    const div = document.createElement('div');
    div.className = `js-${type}`;
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

new JSTerminal();
