// scripts/pcph-core.js

class ErroPCPH extends Error {
  constructor(mensagem, contexto, solucao) {
    super(mensagem);
    this.name = "ErroPCPH";
    this.contexto = contexto;
    this.solucao = solucao;
    this.mensagemCompleta = `
❌ ${mensagem}
|--> Contexto: ${contexto}
|--> Solução: ${solucao}
    `;
  }
}

class Propósito {
  constructor(config) {
    // Metadados básicos
    this.metadata = {
      criadoEm: new Date(),
      versao: config.versao || "1.0",
      id: config.id || Math.random().toString(36).substring(2, 9),
      descrição: config.descrição || "Propósito sem descrição"
    };

    // Validação inicial
    if (!config.descrição) {
      throw new ErroPCPH(
        "Descrição ausente",
        "Todo propósito precisa de uma descrição clara",
        "Adicione: descrição: 'Seu propósito aqui...'"
      );
    }

    // Normalização
    this.restrições = this._normalizarRestricoes(config.restrições || []);
    this.ação = config.ação || (() => {});
    this._hooks = {
      antes: [],
      depois: []
    };
  }

  _normalizarRestricoes(restricoes) {
    return restricoes.map((r, i) => {
      if (typeof r === 'string') {
        return {
          nome: `restrição_${i}`,
          verificação: (d) => !!d[r],
          mensagem: `O campo ${r} é obrigatório`
        };
      }
      return {
        nome: r.nome || `restrição_${i}`,
        verificação: r.verificação,
        mensagem: r.mensagem || "Restrição não satisfeita"
      };
    });
  }

  async executar(dados = {}) {
    try {
      // Hooks "antes"
      for (const hook of this._hooks.antes) {
        await hook(dados);
      }

      // Validação
      const falhas = [];
      for (const restrição of this.restrições) {
        try {
          const valido = await restrição.verificação(dados);
          if (!valido) {
            falhas.push({
              restrição: restrição.nome,
              mensagem: restrição.mensagem
            });
          }
        } catch (erro) {
          falhas.push({
            restrição: restrição.nome,
            mensagem: `Erro na verificação: ${erro.message}`
          });
        }
      }

      if (falhas.length > 0) {
        return {
          status: "falha",
          motivo: "restrições_nao_atendidas",
          falhas,
          metadata: this.metadata
        };
      }

      // Execução
      const resultado = await this.ação(dados);

      // Hooks "depois"
      for (const hook of this._hooks.depois) {
        await hook(resultado);
      }

      return {
        status: "sucesso",
        resultado,
        metadata: this.metadata
      };

    } catch (erro) {
      return {
        status: "erro",
        motivo: "falha_na_execucao",
        erro: erro.message,
        stack: erro.stack,
        metadata: this.metadata
      };
    }
  }

  // Métodos utilitários
  antes(hook) {
    this._hooks.antes.push(hook);
    return this;
  }

  depois(hook) {
    this._hooks.depois.push(hook);
    return this;
  }

  analisar() {
    const sugestoes = [];
    
    if (this.restrições.length === 0) {
      sugestoes.push("Adicione pelo menos uma restrição para segurança");
    }

    if (this.ação.toString() === "() => {}") {
      sugestoes.push("Defina uma ação para cumprir o propósito");
    }

    return sugestoes.length > 0 
      ? { status: "aviso", sugestoes }
      : { status: "ok", mensagem: "Propósito bem estruturado" };
  }
}

// Exportação para navegador (global) e Node.js (module)
if (typeof window !== 'undefined') {
  window.pcph = { Propósito, ErroPCPH };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Propósito, ErroPCPH };
}
