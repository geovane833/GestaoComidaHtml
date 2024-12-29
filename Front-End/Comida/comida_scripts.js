const apiUrl = "http://localhost:8080/comidas";

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalComida");
    const modalTitle = document.getElementById("modalTitle");
    const closeModal = document.querySelector(".close");
    const formComida = document.getElementById("formComida");
    const searchInput = document.getElementById("searchInput");
    const addButton = document.getElementById("addButton");
    const overlay = document.getElementById("overlay");

    let editingId = null;
    let searchTimeout = null;

    const removeImageBtn = document.getElementById('removeImageBtn');
    const imagemComida = document.getElementById('imagem');  // Atualizado para o novo ID
    const previewImagem = document.getElementById('previewImagem');
    
    const customChooseImageBtn = document.getElementById('customChooseImageBtn');

// Quando o botão personalizado for clicado, aciona o input de arquivo
    customChooseImageBtn.addEventListener('click', function() {
    imagemComida.click();  // Aciona o clique no input de arquivo escondido
    });

// Quando o arquivo de imagem for selecionado
    imagemComida.addEventListener('change', function (event) {
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
        previewImagem.src = ''; // Limpa a prévia da imagem
        previewImagem.style.display = 'none'; // Esconde a imagem de prévia
    
        // Esconde o botão de remover imagem
        removeImageBtn.style.display = 'none';
    
        // Limpa o campo de arquivo de imagem
        imagemComida.value = ''; // Limpa o campo de arquivo
    
        // Marca o campo como removido
        imagemComida.dataset.removida = "true"; // Marca como removido para ser enviado no formulário
    });    
    
    // Listar Comida ao carregar a página
    listarComidas();
    addButton.addEventListener("click", () => {
        editingId = null;
        modalTitle.textContent = "Cadastrar Comida";
        formComida.reset();
        toggleModal(true);
    
        // Limpa o preview da imagem quando o modal for aberto para criar um novo aluno
        const previewImagem = document.getElementById("previewImagem");
        const btnRemover = document.getElementById("removeImageBtn");
    
        previewImagem.src = ""; // Limpa a imagem do preview
        previewImagem.style.display = "none"; // Oculta a imagem
        btnRemover.style.display = "none"; // Esconde o botão de remover
    
        // Limpa o campo de arquivo de imagem
        const imagemComida = document.getElementById("imagem");
        imagemComida.value = ""; // Limpa o valor do input file
    });
    
    closeModal.addEventListener("click", () => {
        toggleModal(false);
    
        formComida.reset();
        // Limpa a imagem do preview quando o modal é fechado
        const previewImagem = document.getElementById("previewImagem");
        const removeImageBtn = document.getElementById('removeImageBtn');
    
        previewImagem.src = ""; // Limpa a imagem do preview
        previewImagem.style.display = 'none'; // Esconde a imagem
        removeImageBtn.style.display = 'none'; // Esconde o botão de remover
        imagemComida.value = ''; // Limpa o campo de arquivo
    });
    
// Adicionando o evento de submit no formulário
formComida.addEventListener("submit", async function (e) {
    e.preventDefault(); // Previne o comportamento padrão de submit
    const formData = new FormData(this); // Cria o FormData com os dados do formulário

    // Se a imagem foi removida, definimos a flag imagemRemovida
    if (!imagemComida.files.length && imagemComida.dataset.removida === "true") {
        formData.append("imagemRemovida", "true"); // Adiciona a flag para remover a imagem
    } else {
        formData.delete("imagemRemovida"); // Remove a flag se a imagem não foi removida
    }

    // Se não houver imagem e não foi removida, deletamos o campo imagem
    if (!imagemComida.files.length && imagemComida.dataset.removida !== "true") {
        formData.delete("imagem"); // Deleta o campo de imagem
    }

    try {
        const url = editingId ? `${apiUrl}/editar/${editingId}` : `${apiUrl}/cadastro`;
        const method = editingId ? "PUT" : "POST";
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (response.ok) {
            // Se a resposta for bem-sucedida, exibe uma mensagem de sucesso
            showAlert(editingId ? "Comida atualizada com sucesso!" : "Comida cadastrada com sucesso!", 'success');
            toggleModal(false);
            listarComidas(); // Atualiza a lista de comidas
        } else {
            // Se ocorrer algum erro, exibe a mensagem de erro
            const responseBody = await response.text();
            showAlert("Erro ao salvar comida. Tente novamente.", 'error');
        }
    } catch (error) {
        console.error("Erro ao salvar comida:", error);
        showAlert('Erro ao salvar comida. Tente novamente.', 'error');
    }
});

    // Função renderComida já definida
function renderComida(comidas) {
    const comidaCards = document.getElementById("comidaCards");
    comidaCards.innerHTML = ""; // Limpa a lista antes de renderizar
    
    comidas.forEach(comida => {  // Corrigido para 'comida' dentro do 'forEach'
        const card = document.createElement("div");
        card.classList.add("card");

        // Imagem do Comida
        const img = document.createElement("img");
        img.src = comida.imagem ? `data:image/png;base64,${comida.imagem}` : "../Images/default-comida.png"; // Ajuste o caminho aqui
        img.alt = "Foto da Comida";
        card.appendChild(img);

        // Nome do Comida
        const nome = document.createElement("h3");
        nome.textContent = comida.nome;
        card.appendChild(nome);

        // Ações de editar e excluir
        const actions = document.createElement("div");
        actions.classList.add("actions");

        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => {
            editingId = comida.id;
            modalTitle.textContent = "Editar Comida";
            document.getElementById("nome").value = comida.nome;

            // Limpa a imagem do preview antes de carregar a nova
            const previewImagem = document.getElementById("previewImagem");
            const btnRemover = document.getElementById("removeImageBtn");
            const imagemAluno = document.getElementById("imagem");

            // Limpa o preview da imagem
            previewImagem.src = "";
            previewImagem.style.display = "none"; // Esconde a imagem
            btnRemover.style.display = "none"; // Esconde o botão de remover
            imagemAluno.value = ""; // Limpa o campo de input de arquivo

            // Carregar a imagem do aluno, se houver
            if (comida.imagem) {
                previewImagem.src = `data:image/png;base64,${comida.imagem}`;
                previewImagem.style.display = "block"; // Exibe a imagem
                btnRemover.style.display = "inline-block"; // Exibe o botão de remover
                btnRemover.textContent = "Remover Imagem"; // Garante o texto no botão
            }

            modal.style.display = "block";
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", async () => {
            // Exibe alerta customizado solicitando confirmação
            showAlert('Atenção: Deseja excluir esta Comida?', 'warning', async () => {
                try {
                    // Faz a requisição DELETE para a API
                    const response = await fetch(`${apiUrl}/excluir/${comida.id}`, { method: "DELETE" });

                    // Verifica se a exclusão foi bem-sucedida
                    if (response.ok) {
                        showAlert('Comida excluída com sucesso!', 'success');
                        listarComidas(); // Atualiza a lista de comidas
                    } else {
                        showAlert('Erro ao excluir Comida.', 'error');
                    }
                } catch (error) {
                    // Trata erros no processo de exclusão
                    console.error("Erro ao excluir Comida:", error);
                    showAlert('Erro ao excluir a Comida. Verifique a conexão e tente novamente.', 'error');
                }
            });
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        card.appendChild(actions);

        comidaCards.appendChild(card);
    });
}

    
    overlay.addEventListener("click", () => {
        toggleModal(false);
    });
    
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (!query) {
                listarComidas();
                return;
            }
    
            buscarComidas(query);
        }, 300); // Aguarda 300ms após a digitação para buscar
    });
    
    // Função para buscar as comidas
    async function buscarComidas(query) {
        try {
            const endpoint = `${apiUrl}/buscar?nome=${query}`;
            const response = await fetch(endpoint);
        
            if (response.ok) {
                const comidas = await response.json();
                renderComida(Array.isArray(comidas) ? comidas : [comidas]); // Correção aqui: usar renderComida ao invés de renderComidas
            } else {
                showAlert("Nenhuma comida encontrada.", "warning");
            }
        } catch (error) {
            console.error("Erro ao buscar comidas:", error);
            showAlert("Ocorreu um erro ao buscar comidas. Verifique a conexão e tente novamente.", "error");
        }
    }

    async function listarComidas() {
        try {
            const response = await fetch(`${apiUrl}/listar`);
            if (response.ok) {
                const comida = await response.json();
                renderComida(comida);
            } else {
                console.error("Erro na resposta:", response.status, response.statusText);
                showAlert('Erro ao carregar a lista de Comidas. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error("Erro ao listar comidas:", error);
            showAlert('Ocorreu um erro ao tentar carregar as comidas. Verifique a conexão e tente novamente.', 'error');
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
    
        // Se um callback de confirmação for fornecido e o tipo não for "sucesso", adiciona o botão Confirmar
        if (confirmCallback && type !== "success") {
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Confirmar";
            confirmButton.className = "alert-confirm-button";
            confirmButton.style.backgroundColor = "#4CAF50"; // Personaliza o botão de confirmação
            confirmButton.style.color = "white"; // Personaliza a cor do texto
            confirmButton.style.padding = "10px 20px"; // Personaliza o padding
            confirmButton.addEventListener("click", () => {
                confirmCallback(); // Executa a função de confirmação
                if (document.body.contains(alertDiv)) {  // Verifica se o alerta ainda está no DOM
                    document.body.removeChild(alertDiv); // Remove o alerta após confirmar
                }
            });
            buttonContainer.appendChild(confirmButton);
        }
    
        // Adiciona o botão Cancelar se não for uma mensagem de sucesso
        if (type !== "success") {
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancelar";
            cancelButton.className = "alert-cancel-button";
            cancelButton.style.backgroundColor = "#f44336"; // Personaliza o botão de cancelar
            cancelButton.style.color = "white"; // Personaliza a cor do texto
            cancelButton.style.padding = "10px 20px"; // Personaliza o padding
            cancelButton.addEventListener("click", () => {
                if (document.body.contains(alertDiv)) {  // Verifica se o alerta ainda está no DOM
                    document.body.removeChild(alertDiv); // Remove o alerta ao cancelar
                }
            });
            buttonContainer.appendChild(cancelButton);
        }
    
        // Adiciona os botões ao alerta
        alertDiv.appendChild(buttonContainer);
    
        // Adiciona o alerta ao corpo do documento
        document.body.appendChild(alertDiv);
    
        // Faz o alerta desaparecer após 3 segundos (para sucesso ou não)
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {  // Verifica se o alerta ainda está no DOM
                document.body.removeChild(alertDiv);
            }
        }, 3000); // 3000ms = 3 segundos
    }
        
});
