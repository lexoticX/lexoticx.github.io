document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const fileStatus = document.getElementById('fileStatus');
    
    fetch('https://api.github.com/repos/lexoticX/lexoticx.github.io/contents/versions')
        .then(response => response.json())
        .then(files => {
            const versions = files
                .filter(file => file.name.endsWith('.txt'))
                .map(file => file.name.replace('.txt', ''));
            
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

    document.getElementById('zipFile').addEventListener('change', function() {
        fileStatus.textContent = this.files[0] ? this.files[0].name : 'No file uploaded';
    });

    document.getElementById('update').addEventListener('click', function() {
        const zipFile = document.getElementById('zipFile').files[0];
        const includeCredits = document.getElementById('includeCredits').checked;
        const fromVersion = fromVersionSelect.value;
        const toVersion = toVersionSelect.value;

        if (!zipFile) {
            alert('Please select a zip file.');
            return;
        }
        processZip(zipFile, fromVersion, toVersion, includeCredits);
    });
});

function processZip(zipFile, fromVersion, toVersion, includeCredits) {
    const jszip = new JSZip();
    jszip.loadAsync(zipFile).then(function(zip) {
        let currentVersion = parseInt(fromVersion);
        const endVersion = parseInt(toVersion);

        function updateVersion(zip) {
            if (currentVersion >= endVersion) {
                zip.generateAsync({ type: "blob" }).then(function(blob) {
                    saveAs(blob, "modified_datapack.zip");
                });
                return;
            }

            const nextVersion = currentVersion + 1;
            zip.forEach(function (relativePath, zipEntry) {
                if (zipEntry.name.endsWith('.json') || zipEntry.name.endsWith('.mcfunction')) {
                    zipEntry.async("string").then(function(content) {
                        const modifiedContent = modifyText(content, currentVersion, nextVersion);
                        zip.file(zipEntry.name, modifiedContent);
                    });
                } else if (includeCredits && zipEntry.name.endsWith('credits.txt')) {
                    zipEntry.async("string").then(function(content) {
                        const newContent = content + `\nThis was updated with the datapack updater from version ${fromVersion} to ${toVersion}. Visit: lexoticX.github.io`;
                        zip.file(zipEntry.name, newContent);
                    });
                }
            });

            currentVersion = nextVersion;
            updateVersion(zip);
        }

        updateVersion(zip);
    });
}

function modifyText(content, fromVersion, toVersion) {
    const lines = content.split('\n');
    if (lines.length > 2) {
        lines[2] = lines[2].replace(new RegExp(`\\b${fromVersion}\\b`, 'g'), toVersion);
    }
    return lines.join('\n');
}
