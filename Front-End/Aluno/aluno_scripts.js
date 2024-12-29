const apiUrl = "http://localhost:8080/alunos";

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalAluno");
    const modalTitle = document.getElementById("modalTitle");
    const closeModal = document.querySelector(".close");
    const formAluno = document.getElementById("formAluno");
    const searchInput = document.getElementById("searchInput");
    const addButton = document.getElementById("addButton");
    const overlay = document.getElementById("overlay");

    let editingId = null;
    let searchTimeout = null;

    const removeImageBtn = document.getElementById('removeImageBtn');
    const imagemAluno = document.getElementById('imagem');  // Atualizado para o novo ID
    const previewImagem = document.getElementById('previewImagem');
    
    const customChooseImageBtn = document.getElementById('customChooseImageBtn');

// Quando o botão personalizado for clicado, aciona o input de arquivo
    customChooseImageBtn.addEventListener('click', function() {
    imagemAluno.click();  // Aciona o clique no input de arquivo escondido
    });

// Quando o arquivo de imagem for selecionado
    imagemAluno.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        // Exibir a imagem selecionada
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImagem.src = e.target.result;
            previewImagem.style.display = 'block'; // Exibe a imagem

            // Exibe o botão de remover imagem
            removeImageBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file); // Lê o arquivo e o converte para URL
    }
    });

    // Ao clicar no botão 'Remover Imagem', remove a imagem selecionada
    removeImageBtn.addEventListener('click', function () {
        previewImagem.src = '';
        previewImagem.style.display = 'none'; // Esconde a imagem
    
        // Esconde o botão de remover imagem
        removeImageBtn.style.display = 'none';
    
        // Limpa o input de arquivo
        imagemAluno.value = ''; // Limpa o campo de arquivo
    
        // Define um atributo para indicar que a imagem foi removida
        imagemAluno.dataset.removed = "true"; // Marca a imagem como removida
    });
    

    // Listar alunos ao carregar a página
    listarAlunos();
    addButton.addEventListener("click", () => {
        editingId = null;
        modalTitle.textContent = "Cadastrar Aluno";
        formAluno.reset();
        toggleModal(true);
    
        // Limpa o preview da imagem quando o modal for aberto para criar um novo aluno
        const previewImagem = document.getElementById("previewImagem");
        const btnRemover = document.getElementById("removeImageBtn");
    
        previewImagem.src = ""; // Limpa a imagem do preview
        previewImagem.style.display = "none"; // Oculta a imagem
        btnRemover.style.display = "none"; // Esconde o botão de remover
    
        // Limpa o campo de arquivo de imagem
        const imagemAluno = document.getElementById("imagem");
        imagemAluno.value = ""; // Limpa o valor do input file
    });
    
    closeModal.addEventListener("click", () => {
        toggleModal(false);
    
        formAluno.reset();
        // Limpa a imagem do preview quando o modal é fechado
        const previewImagem = document.getElementById("previewImagem");
        const removeImageBtn = document.getElementById('removeImageBtn');
    
        previewImagem.src = ""; // Limpa a imagem do preview
        previewImagem.style.display = 'none'; // Esconde a imagem
        removeImageBtn.style.display = 'none'; // Esconde o botão de remover
        imagemAluno.value = ''; // Limpa o campo de arquivo
    });
    
    formAluno.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(this); // Envia a imagem e outros dados do formulário
    
        // Verifica se o campo de imagem foi alterado (se não, mantemos a imagem atual)
        if (!imagemAluno.files.length && !imagemAluno.dataset.removed) {
            formData.delete("imagem");
        }
    
        // Adiciona um indicador ao FormData se a imagem foi removida
        if (imagemAluno.dataset.removed === "true") {
            formData.append("imagemRemovida", "true");
        } else {
            formData.delete("imagemRemovida"); // Remove qualquer indicação anterior
        }
    
        try {
            const url = editingId ? `${apiUrl}/editar/${editingId}` : `${apiUrl}/cadastro`;
            const method = editingId ? "PUT" : "POST";
            const response = await fetch(url, { method, body: formData });
    
            if (response.ok) {
                // Exibe a mensagem de sucesso utilizando showAlert
                showAlert(editingId ? "Aluno atualizado com sucesso!" : "Aluno cadastrado com sucesso!", 'success');
                toggleModal(false);
                listarAlunos();
            } else {
                const responseBody = await response.text();
                if (responseBody.includes("Matrícula já cadastrada")) {
                    // Exibe a mensagem de erro específica para matrícula já cadastrada
                    showAlert("Erro: Matrícula já cadastrada.", 'error');
                } else {
                    // Exibe a mensagem de erro genérica
                    showAlert("Erro ao salvar aluno.", 'error');
                }
            }
        } catch (error) {
            console.error("Erro ao salvar aluno:", error);
            // Exibe uma mensagem de erro utilizando showAlert
            showAlert('Erro ao salvar aluno. Tente novamente.', 'error');
        }
    });
    
    async function renderAlunos(alunos) {
        const alunoCards = document.getElementById("alunoCards");
        alunoCards.innerHTML = ""; // Limpa a lista antes de renderizar
    
        alunos.forEach(aluno => {
            const card = document.createElement("div");
            card.classList.add("card");
    
            // Imagem do aluno
            const img = document.createElement("img");
            img.src = aluno.imagem ? `data:image/png;base64,${aluno.imagem}` : "../Images/default-image.png"; // Ajuste o caminho aqui
            img.alt = "Foto do Aluno";
            card.appendChild(img);
    
            // Nome do aluno
            const nome = document.createElement("h3");
            nome.textContent = aluno.nome;
            card.appendChild(nome);
    
            // Matrícula do aluno
            const matricula = document.createElement("p");
            matricula.textContent = `Matrícula: ${aluno.matricula}`;
            card.appendChild(matricula);
    
            // Curso do aluno
            const curso = document.createElement("p");
            curso.textContent = `Curso: ${aluno.curso}`;
            card.appendChild(curso);
    
            // Turno do aluno
            const turno = document.createElement("p");
            turno.textContent = `Turno: ${aluno.turno}`;
            card.appendChild(turno);
    
            // Ações de editar e excluir
            const actions = document.createElement("div");
            actions.classList.add("actions");
    
            // Botão de editar
            const editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.addEventListener("click", () => {
                editingId = aluno.id;
                modalTitle.textContent = "Editar Aluno";
                document.getElementById("nome").value = aluno.nome;
                document.getElementById("matricula").value = aluno.matricula;
                document.getElementById("curso").value = aluno.curso;
                document.getElementById("turno").value = aluno.turno;
    
                // Limpa a imagem do preview antes de carregar a nova
                const previewImagem = document.getElementById("previewImagem");
                const btnRemover = document.getElementById("removeImageBtn");
                const imagemAluno = document.getElementById("imagem");
    
                previewImagem.src = "";
                previewImagem.style.display = "none";
                btnRemover.style.display = "none";
                imagemAluno.value = "";
    
                // Carregar a imagem do aluno, se houver
                if (aluno.imagem) {
                    previewImagem.src = `data:image/png;base64,${aluno.imagem}`;
                    previewImagem.style.display = "block";
                    btnRemover.style.display = "inline-block";
                    btnRemover.textContent = "Remover Imagem";
                }
    
                modal.style.display = "block";
            });
    
            // Botão de excluir
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.addEventListener("click", async () => {
                // Exibe alerta customizado solicitando confirmação
                showAlert('Atenção: Deseja excluir este aluno?', 'warning', async () => {
                    try {
                        if (!aluno.id) {
                            showAlert('ID do aluno não encontrado.', 'error');
                            return;
                        }
    
                        // Verificar se a URL da API está correta
                        const deleteUrl = `${apiUrl}/excluir/${aluno.id}`;
                        console.log("Requisição DELETE para: ", deleteUrl);
    
                        // Faz a requisição DELETE para a API
                        const response = await fetch(deleteUrl, { method: "DELETE" });
    
                        // Verifica se a exclusão foi bem-sucedida
                        if (response.ok) {
                            showAlert('Aluno excluído com sucesso!', 'success');
                            listarAlunos(); // Atualiza a lista de alunos
                        } else {
                            const responseBody = await response.json();
                            showAlert(`Erro ao excluir aluno: ${responseBody.message || 'Erro desconhecido.'}`, 'error');
                        }
                    } catch (error) {
                        // Trata erros no processo de exclusão
                        console.error("Erro ao excluir aluno:", error);
                        showAlert('Erro ao excluir o aluno. Verifique a conexão e tente novamente.', 'error');
                    }
                });
            });
    
            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            card.appendChild(actions);
    
            alunoCards.appendChild(card);
        });
    }
    overlay.addEventListener("click", () => {
        toggleModal(false);
    });
    
    // Evento de input no campo de busca com debounce
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (!query) {
                listarAlunos();
                return;
            }

            buscarAlunos(query);
        });
    });

    async function buscarAlunos(query) {
        try {
            const isMatricula = /^\d+$/.test(query);
            const endpoint = isMatricula
                ? `${apiUrl}/buscar?matricula=${query}`
                : `${apiUrl}/buscar?nome=${query}`;
            const response = await fetch(endpoint);
    
            if (response.ok) {
                const alunos = await response.json();
                renderAlunos(Array.isArray(alunos) ? alunos : [alunos]);
            } else {
                showAlert("Nenhum aluno encontrado.", "warning");
            }
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            showAlert("Ocorreu um erro ao buscar alunos. Verifique a conexão e tente novamente.", "error");
        }
    }
    
    async function listarAlunos() {
        try {
            const response = await fetch(`${apiUrl}/listar`);
            if (response.ok) {
                const alunos = await response.json();
                renderAlunos(alunos);
                // showAlert('Alunos carregados com sucesso!', 'success');
            } else {
                showAlert('Erro ao carregar a lista de alunos. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error("Erro ao listar alunos:", error);
            showAlert('Ocorreu um erro ao tentar carregar os alunos. Verifique a conexão e tente novamente.', 'error');
        }
    }

    function toggleModal(show) {
        modal.style.display = show ? "block" : "none";
        overlay.style.display = show ? "block" : "none";
    }

    function showAlert(message, type, confirmCallback = null) {
        // Cria o container do alerta
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type}`;
        
        // Cria o parágrafo para a mensagem
        const messageParagraph = document.createElement("p");
        messageParagraph.textContent = message;
        alertDiv.appendChild(messageParagraph);
    
        // Cria um container para os botões
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "alert-button-container";
    
        // Se um callback de confirmação for fornecido, adiciona o botão Confirmar
        if (confirmCallback) {
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Confirmar";
            confirmButton.className = "alert-action-button confirm-button";
            buttonContainer.appendChild(confirmButton);
    
            // Adiciona evento de clique para executar a ação de confirmação
            confirmButton.addEventListener("click", () => {
                confirmCallback();
                alertDiv.remove(); // Remove o alerta após confirmação
            });
        }
    
        // Adiciona um botão de fechar ao alerta
        const closeButton = document.createElement("button");
        closeButton.textContent = "Fechar";
        closeButton.className = "alert-action-button close-button";
        buttonContainer.appendChild(closeButton);
    
        closeButton.addEventListener("click", () => alertDiv.remove());
    
        // Adiciona o container de botões ao alerta
        alertDiv.appendChild(buttonContainer);
    
        // Adiciona o alerta ao corpo do documento
        document.body.appendChild(alertDiv);
    
        // Remove o alerta automaticamente após 5 segundos (se não for interativo)
        if (!confirmCallback) {
            setTimeout(() => {
                if (document.body.contains(alertDiv)) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }
    
});
