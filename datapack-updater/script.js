document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const fileNameDisplay = document.getElementById('fileName');
    const goBackButton = document.getElementById('goBack'); // Assuming there's a button with id 'goBack'

    // Disable all buttons except "Go back to main site"
    document.querySelectorAll('button').forEach(button => {
        if (button !== goBackButton) {
            button.disabled = true;
        }
    });

    // Fetch versions (this part will stay the same)
    fetch('https://api.github.com/repos/lexoticX/lexoticx.github.io/contents/datapack-updater/versions')
        .then(response => response.json())
        .then(files => {
            const versions = files.filter(file => file.name.endsWith('.txt')).map(file => file.name.replace('.txt', ''));
            versions.forEach(version => {
                const optionFrom = document.createElement('option');
                optionFrom.value = version;
                optionFrom.textContent = version;
                fromVersionSelect.appendChild(optionFrom);

                const optionTo = document.createElement('option');
                optionTo.value = version;
                optionTo.textContent = version;
                toVersionSelect.appendChild(optionTo);
            });
        })
        .catch(error => console.error('Error fetching versions:', error));

    // Handle file upload
    document.getElementById('zipFile').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.endsWith('.txt')) {
                alert('Only txt files are allowed.');
                fileNameDisplay.textContent = '';
                return;
            }
            fileNameDisplay.textContent = file.name;

            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const updatedContent = content.replace(/\/say/g, '/tell');
                console.log('Updated Content:', updatedContent);
                // Here you can handle updatedContent, e.g., display it or send it to the server
            };
            reader.readAsText(file);
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Disable update button for now
    document.getElementById('update').addEventListener('click', function() {
        alert('Update functionality is disabled temporarily.');
    });
});
