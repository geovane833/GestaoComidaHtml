document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("merendaModal");
    const btnIniciar = document.getElementById("btn_iniciar");
    const btnClose = document.getElementById("closeModal");
    const btnSave = document.getElementById("saveMerenda");
    const alunosList = document.getElementById("alunos");
    const searchInput = document.getElementById("searchInput");

    // Ocultar o container até o preenchimento
    const container = document.querySelector(".container");
    container.style.display = "none";
    let searchTimeout = null;

    // Abrir o modal
    btnIniciar.addEventListener("click", function () {
        modal.style.display = "flex";
    });

    // Fechar o modal
    btnClose.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Preencher o select de comida com as opções do backend
    fetch("http://localhost:8080/comidas/listar")
        .then(response => response.json())
        .then(data => {
            const selectComida = document.getElementById("merendaComida");
            data.forEach(comida => {
                const option = document.createElement("option");
                option.value = comida.id;
                option.textContent = comida.nome;
                selectComida.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar as comidas:", error);
        });

    // Função para preencher o container com as informações do evento
    function preencherContainerComInformacoes(data) {
        
        document.getElementById("merenda-data").textContent = data.data;
        document.getElementById("merenda-turno").textContent = data.turno;
        const horario = new Date(data.horarioInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById("merenda-horario-inicio").textContent = horario;
    
        const comidaId = data.comida.id;

        if (comidaId) {
            fetch(`http://localhost:8080/comidas/${comidaId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Comida não encontrada");
                    }
                    return response.json();
                })
                .then(comida => {
                    const merendaImg = document.getElementById("merenda-img");
                    const merendaNome = document.getElementById("merenda-nome");
                    merendaImg.src = comida.imagem ? `data:image/png;base64,${comida.imagem}` : "/Images/default-comida.png";
                    merendaNome.textContent = comida.nome;
                })
                .catch(error => {
                    console.error("Erro ao carregar a comida:", error);
                    const merendaImg = document.getElementById("merenda-img");
                    const merendaNome = document.getElementById("merenda-nome");
                    merendaImg.src = "/Images/default-comida.png";
                    merendaNome.textContent = "Comida não encontrada";
                });
        } else {
            const merendaImg = document.getElementById("merenda-img");
            const merendaNome = document.getElementById("merenda-nome");
            merendaImg.src = "/Images/default-comida.png";
            merendaNome.textContent = "Comida não especificada";
        }
    }    
    
   // Função para carregar alunos da API e exibir na lista
function carregarAlunos() {
    // Primeiro, obtemos o ID do evento em andamento
    fetch('http://localhost:8080/api/eventos-merenda/ultimo')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Erro ao obter evento em andamento:", data.error);
                return;
            }

            const eventoId = data.id; // Aqui pegamos o ID do evento em andamento
            if (!eventoId) {
                console.error("Nenhum evento em andamento encontrado.");
                return;
            }

            // Agora fazemos a requisição para obter os alunos com base no eventoId
            fetch(`http://localhost:8080/api/controle-merendas/listarAlunos?eventoId=${eventoId}`)
                .then(response => response.json())
                .then(alunos => {
                    alunosList.innerHTML = ""; // Limpar a lista antes de adicionar novos alunos

                    alunos.forEach(aluno => {
                        const li = document.createElement("li");
                        li.dataset.id = aluno.id; // Adicionar o data-id ao <li>

                        const nome = document.createElement("span");
                        nome.textContent = aluno.nome;

                        const matricula = document.createElement("span");
                        matricula.textContent = ` - Matrícula: ${aluno.matricula}`;

                        const curso = document.createElement("span");
                        curso.textContent = ` - Curso: ${aluno.curso}`;

                        const turno = document.createElement("span");
                        turno.textContent = ` - Turno: ${aluno.turno}`;

                        const img = document.createElement("img");
                        img.src = aluno.imagem ? `data:image/png;base64,${aluno.imagem}` : "../../Images/default-image.png";
                        img.alt = aluno.nome;
                        img.style.width = "50px";
                        img.style.height = "50px";
                        img.style.borderRadius = "50%";

                        const buttonsDiv = document.createElement("div");

                        const btnMerendou = document.createElement("button");
                        btnMerendou.classList.add("btn-primary");
                        btnMerendou.textContent = "Merendou";
                        btnMerendou.addEventListener("click", () => {
                            registrarMerenda(aluno.id, "APROVADO", li);  // Passando o 'li' para remover após sucesso
                        });

                        const btnNaoMerendou = document.createElement("button");
                        btnNaoMerendou.classList.add("btn-danger");
                        btnNaoMerendou.textContent = "Não Merendou";
                        btnNaoMerendou.addEventListener("click", () => {
                            registrarMerenda(aluno.id, "PENDENTE", li);  // Passando o 'li' para marcar com 'PENDENTE'
                        });

                        li.appendChild(img);
                        li.appendChild(nome);
                        li.appendChild(matricula);
                        li.appendChild(curso);
                        li.appendChild(turno);
                        li.appendChild(buttonsDiv);

                        buttonsDiv.appendChild(btnMerendou);
                        buttonsDiv.appendChild(btnNaoMerendou);

                        alunosList.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error("Erro ao carregar os alunos:", error);
                });
        })
        .catch(error => {
            console.error("Erro ao obter o evento em andamento:", error);
        });
}

function registrarMerenda(alunoId, status, alunoLi) {
   
    // Normalizar o status para garantir que seja 'APROVADO' ou 'PENDENTE'
    const statusNormalizado = status && status.toUpperCase() === 'APROVADO' ? 'APROVADO' : 'PENDENTE';

    // Obter o ID do evento em andamento
    fetch("http://localhost:8080/api/eventos-merenda/evento-em-andamento-id")
        .then(response => response.json())
        .then(data => {
            if (data && data.id) {
                const eventoId = data.id;
                
                // Definir a quantidade com base no status
                const quantidade = statusNormalizado === 'PENDENTE' ? 0 : 1;  // Se PENDENTE, a quantidade é 0

                // Obter a data atual e formatá-la para não incluir milissegundos
                const now = new Date();
                const horarioRegistro = now.getFullYear() + '-' +
                                        String(now.getMonth() + 1).padStart(2, '0') + '-' +
                                        String(now.getDate()).padStart(2, '0') + 'T' +
                                        String(now.getHours()).padStart(2, '0') + ':' +
                                        String(now.getMinutes()).padStart(2, '0') + ':' +
                                        String(now.getSeconds()).padStart(2, '0');

                // Definir a observação com base no status
                const observacao = statusNormalizado === 'APROVADO' ? 'Aluno recebeu a merenda' : 'Aluno NÃO recebeu a merenda';

                // Registrar a merenda
                fetch('http://localhost:8080/api/controle-merendas/registrar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        alunoId: alunoId,
                        eventoId: eventoId,
                        status: statusNormalizado,
                        quantidade: quantidade,
                        horarioRegistro: horarioRegistro,
                        observacao: observacao,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data && data.status === "success") {
                        mostrarNotificacao(data.message, "success");

                        // Remover o aluno da lista
                        alunosList.removeChild(alunoLi);
                    } else {
                        mostrarNotificacao(data.message || "Erro desconhecido", "error");
                    }
                })
                .catch((error) => {
                    console.error('Erro ao registrar merenda:', error);
                    mostrarNotificacao("Erro ao registrar merenda, tente novamente.", "error");
                });
            } else {
                console.error('Não há evento em andamento.');
                mostrarNotificacao("Não há evento em andamento.", "error");
            }
        })
        .catch((error) => {
            console.error('Erro ao obter o evento atual:', error);
            mostrarNotificacao("Erro ao obter o evento atual, tente novamente.", "error");
        });
}

function renderAlunos(alunos) {
    alunosList.innerHTML = ""; // Limpar a lista

    alunos.forEach(aluno => {
        // Criar o item de lista para cada aluno
        const li = document.createElement("li");

        // Nome do aluno
        const nome = document.createElement("span");
        nome.textContent = aluno.nome;

        // Matrícula do aluno
        const matricula = document.createElement("span");
        matricula.textContent = ` - Matrícula: ${aluno.matricula}`;

        // Curso do aluno
        const curso = document.createElement("span");
        curso.textContent = ` - Curso: ${aluno.curso}`;

        // Turno do aluno
        const turno = document.createElement("span");
        turno.textContent = ` - Turno: ${aluno.turno}`;

        // Imagem do aluno (se houver)
        const img = document.createElement("img");
        img.src = aluno.imagem ? `data:image/png;base64,${aluno.imagem}` : "../../Images/default-image.png";
        img.alt = aluno.nome;
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.borderRadius = "50%"; // Estilo para imagem redonda

        // Botões para marcar se o aluno merendou ou não
        const buttonsDiv = document.createElement("div");
        const btnMerendou = document.createElement("button");
        btnMerendou.classList.add("btn-primary");
        btnMerendou.textContent = "Merendou";
        
        const btnNaoMerendou = document.createElement("button");
        btnNaoMerendou.classList.add("btn-danger");
        btnNaoMerendou.textContent = "Não Merendou";

        // Flag para verificar se o aluno merendou
        let alunoMerendou = false;

        // Adicionar os eventos de click nos botões
        btnMerendou.addEventListener("click", () => {
            alunoMerendou = true;
            registrarMerenda(aluno.id, "APROVADO", li);
        });
        
        btnNaoMerendou.addEventListener("click", () => {
            alunoMerendou = false;
            registrarMerenda(aluno.id, "PENDENTE", li);
        });

        // Adicionar os elementos à lista
        li.appendChild(img);
        li.appendChild(nome);
        li.appendChild(matricula);
        li.appendChild(curso);
        li.appendChild(turno);
        li.appendChild(buttonsDiv);

        buttonsDiv.appendChild(btnMerendou);
        buttonsDiv.appendChild(btnNaoMerendou);

        alunosList.appendChild(li);
    });
}
    // Função para exibir o último evento com horarioFim null
    function verificarUltimoEvento() {
        fetch("http://localhost:8080/api/eventos-merenda/ultimo")
            .then(response => response.json())
            .then(data => {
                if (data && !data.horarioFim) {
                    preencherContainerComInformacoes(data);
                    container.style.display = "block";
                } else {
                    container.style.display = "none";
                }
            })
            .catch(error => {
                console.error("Erro ao buscar o último evento:", error);
            });
    }

    verificarUltimoEvento();

    btnSave.addEventListener("click", function () {
        const data = document.getElementById("merendaData").value;
        const turno = document.getElementById("merendaTurno").value;
        const horarioInicio = document.getElementById("merendaHoraInicio").value;
        const comidaId = document.getElementById("merendaComida").value;
    
        if (!data || !turno || !horarioInicio || !comidaId) {
            alert("Preencha todos os campos!");
            return;
        }
    
        const merendaEvento = {
            data: data,
            turno: turno,
            horarioInicio: `${data}T${horarioInicio}:00`,
            comidaId: parseInt(comidaId), // Aqui passamos o valor de comidaId diretamente
        };
    
        fetch("http://localhost:8080/api/eventos-merenda", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(merendaEvento),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erro ao salvar a merenda.");
                }
                return response.json();
            })
            .then(data => {
                alert("Merenda salva com sucesso!");
    
                // Preencher as informações no container após salvar com sucesso
                preencherContainerComInformacoes(data);
    
                // Carregar os alunos
                carregarAlunos();
    
                // Recarregar a página inteira
                location.reload();
    
                modal.style.display = "none";
            })
            .catch(error => {
                console.error("Erro ao salvar a merenda:", error);
            });
    });
    
    carregarAlunos();

    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (!query) {
                carregarAlunos();
                return;
            }
            buscarAlunos(query);
        }, 300);
    });

    async function buscarAlunos(query) {
        try {
            const isMatricula = /^\d+$/.test(query);
            const endpoint = isMatricula
                ? `http://localhost:8080/alunos/buscar?matricula=${query}`
                : `http://localhost:8080/alunos/buscar?nome=${query}`;
            const response = await fetch(endpoint);

            if (response.ok) {
                const alunos = await response.json();
                renderAlunos(Array.isArray(alunos) ? alunos : [alunos]);
            } else {
                alert("Nenhum aluno encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            alert("Ocorreu um erro ao buscar alunos. Verifique a conexão e tente novamente.");
        }
    }
    
    function mostrarNotificacao(mensagem, tipo) {
        // Exibe a caixa de notificação
        const notificationBox = document.getElementById("notificationBox");
        const notificationMessage = document.getElementById("notificationMessage");
    
        // Define o tipo (sucesso ou erro) da caixa de notificação
        notificationBox.style.display = "block";
        notificationMessage.textContent = mensagem;
        notificationBox.classList.remove("success", "error");
        notificationBox.classList.add(tipo);
    
        // Fecha a notificação após 5 segundos
        setTimeout(() => {
            notificationBox.style.display = "none";
        }, 5000);
    }
    
    document.getElementById("btn_finalizar").addEventListener("click", function () {
    const alunos = document.querySelectorAll(".alunos-list li");  // Seleciona todas as <li> de alunos na lista

    alunos.forEach(aluno => {
        const alunoId = aluno.dataset.id; // Obtém o data-id de cada aluno

        const btnNaoMerendou = aluno.querySelector(".btn-danger"); // Botão "Não Merendou"

        // Verificar se o aluno não merendou
        if (btnNaoMerendou) {
            // Aqui você pode chamar uma função para registrar a merenda do aluno como "PENDENTE"
            registrarMerenda(alunoId, "PENDENTE", aluno);
        }
    });

    // Chama a função para finalizar o evento e atualizar o horarioFim
    finalizarEvento();
});

// Função para fazer a atualização do evento
function finalizarEvento() {
    // Obter o ID do evento em andamento
    fetch("http://localhost:8080/api/eventos-merenda/evento-em-andamento-id")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao buscar evento em andamento.");
            }
            return response.json();
        })
        .then(data => {
            if (data && data.id) {
                const eventoId = data.id;

                // Define a hora atual como horário de fim no formato ISO sem milissegundos
                const horarioFim = new Date().toISOString().split('.')[0];

                // Criar o objeto para o corpo da requisição
                const requestBody = { horario_fim: horarioFim };

                // Atualizar o evento no backend
                fetch(`http://localhost:8080/api/eventos-merenda/${eventoId}/atualizar-horario-fim`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                })
                    .then(response => {
                        if (!response.ok) {
                            // Extrair e exibir o erro retornado pelo backend
                            return response.json().then(error => {
                                console.error("Erro do backend:", error);
                                throw new Error(error.error || "Erro ao atualizar evento.");
                            });
                        }
                        return response.json();
                    })
                    .then(updatedEvento => {
                        
                        // Exibir mensagem ao usuário e recarregar a página
                        alert("Evento finalizado com sucesso!");
                        location.reload();
                    })
                    .catch(error => {
                        console.error("Erro ao atualizar evento:", error);

                        // Exibir mensagem amigável para o usuário
                        alert("Erro ao finalizar o evento. Tente novamente.");
                    });
            } else {
                console.warn("Nenhum evento em andamento encontrado ou ID inválido.");

                // Informar ao usuário que nenhum evento foi encontrado
                alert("Nenhum evento em andamento encontrado.");
            }
        })
        .catch(error => {
            console.error("Erro ao obter evento em andamento:", error);

            // Informar o usuário sobre o erro
            alert("Erro ao buscar evento em andamento. Tente novamente.");
        });
}


});