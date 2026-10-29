describe('Cadastro de Estudantes (E2E)', () => {
    beforeEach(() => {
        cy.visit('/')   // recarrega a página: lista vazia a cada teste
    })
    // Preenche o formulário. Campo omitido = não mexe; '' = limpa o campo.
    function preencher({ nome, email, telefone, endereco } = {}) {
        const campos = {
            '#estudanteNome': nome,
            '#estudanteEmail': email,
            '#estudanteTelefone': telefone,
            '#estudanteEndereco': endereco,

        }
        Object.entries(campos).forEach(([seletor, valor]) => {
            if (valor === undefined) return
            cy.get(seletor).clear()
            if (valor !== '') cy.get(seletor).type(valor, { delay: 0 })
        })
    }

    // Preenche e clica em Cadastrar/Atualizar
    function salvar(dados) {
        preencher(dados)
        cy.get('#btnSalvar').click()
    }
})
// Um estudante válido para reaproveitar nos testes
const ana = {
    nome: 'Ana Souza',
    email: 'ana@email.com',
    telefone: '88999990001',
    endereco: 'Rua A, 10, Centro, Quixadá',
};
// ... seus describe(...) entram aqui

describe('RN-01 · Estado inicial', () => {
    it('exibe a lista vazia, a mensagem padrão e o contador zerado', () => {
        cy.get('[data-cy=linha-estudante]').should('not.exist');
        cy.get('#vazio').should('be.visible')
            .and('have.text', 'Nenhum estudante cadastrado');
        cy.get('#contador').should('have.text', '0');
    });
});

describe('RN-02 · Nome obrigatório (mínimo 3 caracteres)', () => {
    it('rejeita nome com 2 caracteres', () => {
        salvar({ ...ana, nome: 'Al' })
        cy.get('#mensagem').should('have.class', 'erro')
            .and('have.text', 'Nome deve ter pelo menos 3 caracteres')
        cy.get('[data-cy=linha-estudante]').should('not.exist')
    });
    it('aceita nome com exatamente 3 caracteres (limite)', () => {
        salvar({ ...ana, nome: 'Ana' })
        cy.get('#mensagem').should('have.class', 'sucesso')
        cy.get('[data-cy=col-nome]').should('have.text', 'Ana')
    });
});

describe('RN-08 · Cadastro com sucesso', () => {
    it('exibe mensagem, adiciona a linha e incrementa o contador', () => {
        salvar(ana)
        cy.get('#mensagem').should('have.class', 'sucesso')
            .and('have.text', 'Estudante cadastrado com sucesso!')
        cy.get('[data-cy=linha-estudante]').should('have.length', 1)
        cy.get('#contador').should('have.text', '1')
    });
});