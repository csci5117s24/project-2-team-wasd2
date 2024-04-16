
export function OpenModal(elId) {
    var el = document.getElementById(elId);
    el.classList.add('is-active');
}

export function CloseModal(elId) {
    var el = document.getElementById(elId);
    el.classList.remove('is-active');
}