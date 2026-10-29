// estudantes.js
// Liga a tela ao Store: cadastro, listagem, busca, edição e exclusão.
// Toda alteração chama render() para redesenhar a tabela.

(function () {
  'use strict';

  const form = document.getElementById('formEstudante');
  const campoId = document.getElementById('estudanteId');
  const campos = {
    nome: document.getElementById('estudanteNome'),
    email: document.getElementById('estudanteEmail'),
    telefone: document.getElementById('estudanteTelefone'),
    endereco: document.getElementById('estudanteEndereco'),
  };
  const btnSalvar = document.getElementById('btnSalvar');
  const btnCancelar = document.getElementById('btnCancelar');
  const tituloForm = document.getElementById('tituloForm');
  const mensagem = document.getElementById('mensagem');
  const busca = document.getElementById('busca');
  const corpoTabela = document.querySelector('#tabelaEstudantes tbody');
  const vazio = document.getElementById('vazio');
  const contador = document.getElementById('contador');

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
  }

  function limparMensagem() {
    mensagem.textContent = '';
    mensagem.className = 'mensagem';
  }

  function limparErros() {
    Object.values(campos).forEach((c) => c.classList.remove('campo-erro'));
  }

  function limparFormulario() {
    form.reset();
    campoId.value = '';
    btnSalvar.textContent = 'Cadastrar';
    tituloForm.textContent = 'Novo estudante';
    btnCancelar.hidden = true;
    limparErros();
  }

  function celula(texto, dataCy) {
    const td = document.createElement('td');
    td.textContent = texto;
    td.setAttribute('data-cy', dataCy);
    return td;
  }

  function botao(texto, dataCy, classe, aoClicar) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = texto;
    b.className = 'btn ' + classe;
    b.setAttribute('data-cy', dataCy);
    b.addEventListener('click', aoClicar);
    return b;
  }

  function editar(id) {
    const e = Store.buscar(id);
    if (!e) return;
    campoId.value = e.id;
    campos.nome.value = e.nome;
    campos.email.value = e.email;
    campos.telefone.value = Store.formatarTelefone(e.telefone);
    campos.endereco.value = e.endereco;
    btnSalvar.textContent = 'Atualizar';
    tituloForm.textContent = 'Editar estudante ' + e.matricula;
    btnCancelar.hidden = false;
    limparErros();
    limparMensagem();
    campos.nome.focus();
  }

  function excluir(id) {
    const e = Store.buscar(id);
    if (!e) return;
    if (!window.confirm('Deseja excluir o estudante "' + e.nome + '"?')) return;
    Store.excluir(id);
    if (campoId.value === String(id)) limparFormulario();
    mostrarMensagem('Estudante excluído com sucesso!', 'sucesso');
    render();
  }

  function render() {
    const lista = Store.listar(busca.value);
    corpoTabela.innerHTML = '';

    lista.forEach((e) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-cy', 'linha-estudante');
      tr.dataset.id = e.id;
      tr.appendChild(celula(e.matricula, 'col-matricula'));
      tr.appendChild(celula(e.nome, 'col-nome'));
      tr.appendChild(celula(e.email, 'col-email'));
      tr.appendChild(celula(Store.formatarTelefone(e.telefone), 'col-telefone'));
      tr.appendChild(celula(e.endereco || '—', 'col-endereco'));

      const acoes = document.createElement('td');
      acoes.className = 'acoes';
      acoes.appendChild(botao('Editar', 'btn-editar', 'btn-secundario', () => editar(e.id)));
      acoes.appendChild(botao('Excluir', 'btn-excluir', 'btn-perigo', () => excluir(e.id)));
      tr.appendChild(acoes);

      corpoTabela.appendChild(tr);
    });

    vazio.hidden = lista.length > 0;
    vazio.textContent = Store.total() === 0
      ? 'Nenhum estudante cadastrado'
      : 'Nenhum estudante encontrado';
    contador.textContent = Store.total();
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros();
    const dados = {
      nome: campos.nome.value,
      email: campos.email.value,
      telefone: campos.telefone.value,
      endereco: campos.endereco.value,
    };
    try {
      if (campoId.value) {
        Store.atualizar(campoId.value, dados);
        mostrarMensagem('Estudante atualizado com sucesso!', 'sucesso');
      } else {
        Store.criar(dados);
        mostrarMensagem('Estudante cadastrado com sucesso!', 'sucesso');
      }
      limparFormulario();
      render();
    } catch (erro) {
      // Em caso de erro, os dados digitados PERMANECEM no formulário
      mostrarMensagem(erro.message, 'erro');
      if (erro.campo && campos[erro.campo]) {
        campos[erro.campo].classList.add('campo-erro');
        campos[erro.campo].focus();
      }
    }
  });

  btnCancelar.addEventListener('click', () => {
    limparFormulario();
    limparMensagem();
  });

  busca.addEventListener('input', render);

  render();
})();
