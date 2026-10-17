// Click a screenshot to see it full size; click anywhere or press Escape to close.
const box = document.getElementById('lightbox');
const img = box.querySelector('img');

document.querySelectorAll('.shot').forEach((button) => {
    button.addEventListener('click', () => {
        img.src = button.dataset.full;
        img.alt = button.querySelector('img').alt;
        box.showModal();
    });
});

box.addEventListener('click', () => box.close());
