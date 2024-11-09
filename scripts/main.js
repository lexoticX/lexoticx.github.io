document.addEventListener("DOMContentLoaded", function () {
  const editor = grapesjs.init({
    container: '#editor',          // Editor container div
    fromElement: true,             // Use HTML elements in the editor container
    width: 'auto',                 // Full width of the screen
    height: '100vh',               // Full viewport height
    storageManager: { type: null }, // Disable storage manager to avoid issues

    blockManager: {                // Add custom blocks
      appendTo: '#blocks'          // Ensure this line doesn't have a trailing comma or extra braces
    }
  });

  // Add a simple block to the editor to verify functionality
  editor.BlockManager.add('simple-block', {
    label: 'Simple Block',
    content: `<div style="padding:10px; color:white; background-color:#333;">Simple Block</div>`,
    category: 'Basic'
  });
});
