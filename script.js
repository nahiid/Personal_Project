const actionButton = document.getElementById('actionButton');
const actionMessage = document.getElementById('actionMessage');

if (actionButton && actionMessage) {
  actionButton.addEventListener('click', () => {
    actionMessage.textContent = 'Nice! Your website skeleton is ready to customize.';
  });
}
