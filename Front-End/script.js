function randomText(){
    var text = ("!@#$%^*()")
    letters = text[Math.floor(Math.random() * text.length)];
    return letters;
}

function rain() {
    let cloud = document.querySelector('.cloud');
    let e = document.createElement('div');
    e.classList.add('drop');
    cloud.appendChild(e);

    let left = Math.floor(Math.random() * 300)
    let size = Math.random() * 1.5;
    let duration = Math.random() * 1;

    e.innerText = randomText();
    e.style.left = left + 'px';
    e.style.fontSize = 0.5 + size + 'em';
    e.style.animationDuration = 1 + duration + 's';

    setTimeout(function(){
        cloud.removeChild(e);
        
        // Redirecionar para o arquivo index.html dentro da pasta Menu
        window.location.href = 'Menu/menu.html';
    }, 5000); // O tempo aqui é igual ao tempo de duração da animação (em segundos)
}

setInterval(function(){
    rain();
}, 20);
