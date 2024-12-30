document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const fileNameDisplay = document.getElementById('fileName');

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

    document.getElementById('zipFile').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    document.getElementById('update').addEventListener('click', function() {
        const zipFile = document.getElementById('zipFile').files[0];
        const includecreditss = document.getElementById('includecredit').checked;
        const fromVersion = fromVersionSelect.value;
        const toVersion = toVersionSelect.value;

        if (!zipFile) {
            alert('Please select a zip file.');
            return;
        }

        if (!zipFile.name.endsWith('.zip')) {
            alert('Only zip files are allowed.');
            return;
        }

        loadingSpinner.style.display = 'block';

        processZip(zipFile, fromVersion, toVersion, includecreditss).then(() => {
            loadingSpinner.style.display = 'none';
        });
    });
});
