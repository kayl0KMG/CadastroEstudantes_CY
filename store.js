// store.js
// Camada de dados do Cadastro de Estudantes. Guarda os estudantes EM MEMÓRIA
// (um array JavaScript). Os dados permanecem enquanto a página estiver aberta,
// mas um reload (F5) apaga tudo — cada cy.visit() começa com a lista vazia.
// Padrão UMD: funciona no navegador (window.Store) e no Node (module.exports).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Store = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Estado em memória ──────────────────────────────────────────
  let estudantes = [];
  let proximaMatricula = 1;

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MAX_ENDERECO = 120;

  const copiar = (obj) => Object.assign({}, obj);
  const texto = (v) => (v === undefined || v === null ? '' : String(v)).trim();
  const soDigitos = (v) => texto(v).replace(/\D/g, '');

  // Erro de validação que informa QUAL campo falhou (para a tela destacá-lo)
  function erroDeCampo(campo, mensagem) {
    const erro = new Error(mensagem);
    erro.campo = campo;
    return erro;
  }

  // ── Regras de validação (RN-02 a RN-06) ───────────────────────
  // Valida na ordem nome → e-mail → telefone → endereço e para no 1º erro.
  function validar(dados, idIgnorado) {
    const nome = texto(dados.nome).replace(/\s+/g, ' ');
    const email = texto(dados.email).toLowerCase();
    const telefone = soDigitos(dados.telefone);
    const endereco = texto(dados.endereco);

    if (nome.length < 3) {
      throw erroDeCampo('nome', 'Nome deve ter pelo menos 3 caracteres');
    }
    if (!REGEX_EMAIL.test(email)) {
      throw erroDeCampo('email', 'E-mail inválido');
    }
    if (estudantes.some((e) => e.email === email && e.id !== idIgnorado)) {
      throw erroDeCampo('email', 'E-mail já cadastrado');
    }
    if (telefone.length < 10 || telefone.length > 11) {
      throw erroDeCampo('telefone', 'Telefone deve ter 10 ou 11 dígitos com DDD');
    }
    if (endereco.length > MAX_ENDERECO) {
      throw erroDeCampo('endereco', 'Endereço deve ter no máximo 120 caracteres');
    }
    return { nome, email, telefone, endereco };
  }

  // ── CRUD ───────────────────────────────────────────────────────
  function criar(dados) {
    const valido = validar(dados, null);
    const estudante = Object.assign(
      { id: proximaMatricula, matricula: formatarMatricula(proximaMatricula) },
      valido
    );
    proximaMatricula++; // RN-07: matrícula nunca é reaproveitada
    estudantes.push(estudante);
    return copiar(estudante);
  }

  // RN-09 (ordem alfabética) e RN-10 (busca por nome, e-mail ou matrícula)
  function listar(filtro) {
    const f = texto(filtro).toLowerCase();
    return estudantes
      .filter((e) => !f
        || e.nome.toLowerCase().includes(f)
        || e.email.includes(f)
        || e.matricula.toLowerCase().includes(f))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      .map(copiar);
  }

  function buscar(id) {
    const e = estudantes.find((x) => x.id === Number(id));
    return e ? copiar(e) : null;
  }

  function atualizar(id, dados) {
    const indice = estudantes.findIndex((e) => e.id === Number(id));
    if (indice === -1) throw new Error('Estudante não encontrado');
    const valido = validar(dados, Number(id));
    const atual = estudantes[indice];
    estudantes[indice] = Object.assign({ id: atual.id, matricula: atual.matricula }, valido);
    return copiar(estudantes[indice]);
  }

  function excluir(id) {
    const antes = estudantes.length;
    estudantes = estudantes.filter((e) => e.id !== Number(id));
    if (estudantes.length === antes) throw new Error('Estudante não encontrado');
  }

  // ── Formatação ─────────────────────────────────────────────────
  function formatarMatricula(n) {
    return 'EST-' + String(n).padStart(4, '0');
  }

  // 11 dígitos → (88) 99999-0000 | 10 dígitos → (88) 3333-0000
  function formatarTelefone(digitos) {
    const d = soDigitos(digitos);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return d;
  }

  function resetar() {
    estudantes = [];
    proximaMatricula = 1;
  }

  return {
    MAX_ENDERECO,
    criar, listar, buscar, atualizar, excluir,
    total: () => estudantes.length,
    formatarTelefone, formatarMatricula,
    resetar,
  };
});
