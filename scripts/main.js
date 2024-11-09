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


  editor.BlockManager.add('clickable-box', {
    label: 'Clickable Box',
    content: `<div class="box" onclick="location.href='subpage.html'">Click Me</div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-square' }
  });
});
