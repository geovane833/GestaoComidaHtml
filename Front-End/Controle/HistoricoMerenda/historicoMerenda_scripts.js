document.addEventListener("DOMContentLoaded", () => {
  const calendarGrid = document.querySelector(".calendar-grid");
  const noteModal = document.getElementById("noteModal");
  const closeModal = document.querySelector(".close");
  const selectedDateEl = document.getElementById("selectedDate");
  const selectedComidaEl = document.getElementById("selecteComida");
  const historicoContainer = document.getElementById("historicoContainer");
  const resetBtn = document.getElementById("resetCalendar");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  const currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  function populateYearOptions() {
    for (let year = 2020; year <= 2050; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      if (year === currentYear) {
        option.selected = true;
      }
      yearSelect.appendChild(option);
    }
  }

  function renderCalendar(month, year) {
    calendarGrid.innerHTML = "";
  
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const days = daysInMonth(month, year);
  
    // Função para verificar se existe histórico para o dia
    async function checkForHistorico(day) {
      try {
        const response = await fetch(`http://localhost:8080/historico/data?dia=${day}&mes=${month + 1}&ano=${year}`);
        if (!response.ok) throw new Error("Erro ao buscar histórico.");
        
        const historico = await response.json();
        return historico.length > 0; // Retorna true se houver histórico para o dia
      } catch (error) {
        console.error("Erro:", error.message);
        return false;
      }
    }
  
    // Adicionar dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.classList.add("day", "empty");
      calendarGrid.appendChild(emptyDay);
    }
  
    // Criar os dias do mês
    for (let i = 1; i <= days; i++) {
      const day = document.createElement("div");
      day.classList.add("day");
      day.textContent = i;
      day.setAttribute("data-day", i);
  
      // Verificar se há histórico para o dia
      checkForHistorico(i).then(hasHistorico => {
        if (hasHistorico) {
          // Se houver histórico, adicionar a classe que altera a cor de fundo
          day.style.backgroundColor = 'green';
          day.style.color = 'white'; // Alterar a cor do texto para branco, para contraste
        }
      });
  
      day.addEventListener("click", () => openModal(month, year, i));
      calendarGrid.appendChild(day);
    }
  }
  

  function openModal(month, year, day) {
    // Atualizar o título do modal com a data selecionada
    selectedDateEl.textContent = `Histórico de Merendas - ${day} ${monthSelect.options[month].text} ${year}`;
   
    // Chamar a função para buscar o histórico de merendas
    fetchHistoricoPorData(day, month + 1, year); // Lembre-se de que os meses no JS começam do 0, então somamos 1.

    // Exibir o modal
    noteModal.style.display = "flex";
  }

  async function fetchHistoricoPorData(dia, mes, ano) {
    try {
        // Corrigir a URL da requisição para o servidor backend na porta 8080
        const response = await fetch(`http://localhost:8080/historico/data?dia=${dia}&mes=${mes}&ano=${ano}`);
        if (!response.ok) throw new Error("Erro ao buscar histórico.");

        const historico = await response.json();
        populateHistoricoTable(historico);
    } catch (error) {
        console.error("Erro:", error.message);
    }
  }

  function populateHistoricoTable(historico) {
    historicoContainer.innerHTML = ""; // Limpar a tabela antes de adicionar novos dados

    if (historico.length === 0) {
      historicoContainer.innerHTML = "<tr><td colspan='11'>Nenhum evento encontrado para esta data.</td></tr>";
      return;
    }

    historico.forEach((item) => {
      const row = document.createElement("tr");

      // Imagem do aluno
      const imgCell = document.createElement("td");
      const alunoImage = document.createElement("img");
      alunoImage.src = item.imagem ? `data:image/png;base64,${item.imagem}` : '../../Images/default-image.png';
      alunoImage.alt = 'Imagem do Aluno';
      alunoImage.style.width = '50px';
      alunoImage.style.height = '50px';
      alunoImage.style.borderRadius = '50%';
      imgCell.appendChild(alunoImage);
      row.appendChild(imgCell);

      // Informações do aluno
      const alunoCell = document.createElement("td");
      alunoCell.textContent = item.aluno;
      row.appendChild(alunoCell);

      const matriculaCell = document.createElement("td");
      matriculaCell.textContent = item.matricula;
      row.appendChild(matriculaCell);

      const cursoCell = document.createElement("td");
      cursoCell.textContent = item.curso;
      row.appendChild(cursoCell);

      const turnoCell = document.createElement("td");
      turnoCell.textContent = item.turno;
      row.appendChild(turnoCell);

      const statusCell = document.createElement("td");
      statusCell.textContent = item.status;
      row.appendChild(statusCell);

      const quantidadeCell = document.createElement("td");
      quantidadeCell.textContent = item.quantidade;
      row.appendChild(quantidadeCell);

      const horarioCell = document.createElement("td");
      horarioCell.textContent = item.horario;
      row.appendChild(horarioCell);

      const observacaoCell = document.createElement("td");
      observacaoCell.textContent = item.observacao;
      row.appendChild(observacaoCell);

      // Verificando se a comida existe e tem os dados necessários
      if (item.comida && item.comida.imagem && item.comida.nome) {
        // Imagem da comida
        const comidaCell = document.createElement("td");

        // Estilo para centralizar a célula
        comidaCell.style.textAlign = "center"; // Centralizar conteúdo dentro da célula
        
        const comidaImage = document.createElement("img");
        comidaImage.src = `data:image/png;base64,${item.comida.imagem}`; // Imagem da comida
        comidaImage.alt = 'Imagem da Comida';
        comidaImage.style.width = '50px';
        comidaImage.style.height = '50px';
        comidaImage.style.borderRadius = '50%';
        comidaImage.style.display = "block"; // Para garantir que o estilo de margem funcione
        comidaImage.style.margin = "0 auto"; // Centraliza a imagem
        
        comidaCell.appendChild(comidaImage);
        row.appendChild(comidaCell);
        

        // Nome da comida
        const comidaNameCell = document.createElement("td");
        comidaNameCell.textContent = item.comida.nome;

        // Adiciona as células da comida
        row.appendChild(comidaCell);
        row.appendChild(comidaNameCell);
      } else {
        // Se não houver comida, exibe valores padrões
        const comidaCell = document.createElement("td");
        comidaCell.textContent = '';
        row.appendChild(comidaCell);

        const comidaNameCell = document.createElement("td");
        comidaNameCell.textContent = '';
        row.appendChild(comidaNameCell);
      }

      // Adiciona a linha na tabela
      historicoContainer.appendChild(row);
    });
  }

  function closeModalFunc() {
    noteModal.style.display = "none"; // Fechar o modal
    // Limpar as informações da tabela quando o modal for fechado
    historicoContainer.innerHTML = "";
  }

  function resetCalendar() {
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
    renderCalendar(currentMonth, currentYear);
  }

  resetBtn.addEventListener("click", resetCalendar);
  monthSelect.addEventListener("change", (e) => {
    currentMonth = parseInt(e.target.value);
    renderCalendar(currentMonth, currentYear);
  });
  yearSelect.addEventListener("change", (e) => {
    currentYear = parseInt(e.target.value);
    renderCalendar(currentMonth, currentYear);
  });

  closeModal.addEventListener("click", closeModalFunc);
  window.addEventListener("click", (event) => {
    if (event.target === noteModal) closeModalFunc();
  });

  populateYearOptions();
  resetCalendar();
});
