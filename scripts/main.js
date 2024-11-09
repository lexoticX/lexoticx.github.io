document.addEventListener("DOMContentLoaded", function () {
  const editor = grapesjs.init({
    container: '#editor',
    fromElement: true,
    width: 'auto',
    height: '100vh',
    storageManager: { type: null },
    blockManager: {
      appendTo: '#blocks',
    }
  });
});
