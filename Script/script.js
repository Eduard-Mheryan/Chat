const form = document.getElementById('chatForm');
const body = document.body;

form.addEventListener('mouseenter', () => {
    body.classList.add('hovered');
});

form.addEventListener('mouseleave', () => {
    body.classList.remove('hovered');
});
