class RadioButtonEffect {
  constructor(radioBtnGroups) {
    this.previousRadioBtn = null;

    radioBtnGroups.forEach((group) => {
      const radioBtn = gsap.utils.selector(group)("input[type='radio']")[0];

      // Efeito ao mudar o estado do botão de rádio
      radioBtn.addEventListener("change", () => {
        const nodes = this.getNodes(radioBtn);
        const textElement = this.getTextElement(radioBtn);

        if (this.previousRadioBtn && this.previousRadioBtn !== radioBtn) {
          this.changeEffect(this.getNodes(this.previousRadioBtn), false);
          this.changeTextColor(this.getTextElement(this.previousRadioBtn), false);
        }

        this.changeEffect(nodes, true);
        this.changeTextColor(textElement, true);

        this.previousRadioBtn = radioBtn;
      });

      // Efeito ao passar o mouse (hover)
      const container = group.closest(".radio-btn-group");
      container.addEventListener("mouseenter", () => {
        const nodes = this.getNodes(radioBtn);
        const textElement = this.getTextElement(radioBtn);
        this.changeEffect(nodes, true);
        this.changeTextColor(textElement, true);
      });

      container.addEventListener("mouseleave", () => {
        const nodes = this.getNodes(radioBtn);
        const textElement = this.getTextElement(radioBtn);
        this.changeEffect(nodes, false);
        this.changeTextColor(textElement, false);
      });
    });
  }

  getNodes(radioBtn) {
    const container = radioBtn.closest(".radio-btn-group");
    return [
      gsap.utils.shuffle(gsap.utils.selector(container)(".blue rect")),
      gsap.utils.shuffle(gsap.utils.selector(container)(".pink rect"))
    ];
  }

  getTextElement(radioBtn) {
    const container = radioBtn.closest(".radio-btn-group");
    return container.querySelector(".radio-btn-text"); // Adicione a classe ao texto associado
  }

  changeEffect(nodes, isChecked) {
    gsap.to(nodes[0], {
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
      xPercent: isChecked ? "100" : "-100",
      stagger: 0.01,
      overwrite: true,
      delay: 0.13
    });

    gsap.to(nodes[1], {
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
      xPercent: isChecked ? "100" : "-100",
      stagger: 0.01,
      overwrite: true
    });
  }

  changeTextColor(textElement, isChecked) {
    if (textElement) {
      gsap.to(textElement, {
        color: isChecked ? "#000000" : "#808080", // Preto quando selecionado, cinza quando não
        duration: 0.3
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const radioBtnGroups = document.querySelectorAll(".radio-btn-group");
  new RadioButtonEffect(radioBtnGroups);
});


document.querySelectorAll('.custom-radio-label').forEach(label => {
  label.addEventListener('click', () => {
    const targetPage = label.getAttribute('data-target');
    if (targetPage) {
      window.location.href = targetPage; // Redireciona para a página especificada
    }
  });
});

// Poem text
const kiplingPoem = `
<p>Esta é uma aplicação desenvolvida por 
<strong style="color: red;">Geovane Formatações</strong>, 
com o objetivo de gerenciar o cadastro de <span style="color: blue;">alunos</span> e o controle de <span style="color: green;">alimentos</span> 
na universidade. A aplicação permite realizar o cadastro e o acompanhamento dos <span style="color: blue;">alunos</span>, 
bem como o controle eficiente da <span style="color: green;">merenda</span>, garantindo que os <span style="color: green;">alimentos</span> 
estejam disponíveis conforme necessário. Com um sistema fácil de usar, você pode cadastrar e monitorar tanto os <span style="color: blue;">alunos</span> 
quanto os itens alimentícios, assegurando que o gerenciamento da <span style="color: green;">merenda</span> seja feito de maneira eficaz e organizada.</p>

`;

// Function to insert poem into divs
function insertPoemIntoDivs() {
	// Get all .text divs
	const textDivs = document.querySelectorAll(".text");

	// Insert poem into all .text divs
	textDivs.forEach((div) => {
		div.innerHTML = kiplingPoem;
	});
}

// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", insertPoemIntoDivs);

const contentDiv = document.querySelector(".content");

function adjustContentSize() {
    if (contentDiv) {
        const viewportWidth = window.innerWidth;
        const baseWidth = 1000;
        const scaleFactor =
            viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.8 : 1;
        contentDiv.style.transform = `scale(${scaleFactor})`;
    }
}

window.addEventListener("load", adjustContentSize);
window.addEventListener("resize", adjustContentSize);

