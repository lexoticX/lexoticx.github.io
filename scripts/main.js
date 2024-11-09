document.addEventListener("DOMContentLoaded", function () {
  const editor = grapesjs.init({
    container: '#editor',
    fromElement: true,
    width: 'auto',
    height: '100vh',
    storageManager: { type: null }, // Disable storage manager for now
    panels: {
      defaults: [
        { id: 'layers', el: '.gjs-layers-container', resizable: { tc: 0, cl: 0, cr: 0, bc: 0 } },
      ],
    },
    blockManager: {
      appendTo: '#blocks',
    }
  });

  // Example component for a clickable box
  editor.BlockManager.add('clickable-box', {
    label: 'Clickable Box',
    content: `<div class="box" onclick="location.href='subpage.html'">Click Me</div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-square' }
  });
});
