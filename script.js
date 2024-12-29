document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const versions = ['version1.txt', 'version2.txt']; // Replace with actual version names from your versions folder
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
        zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name.endsWith('.json') || zipEntry.name.endsWith('.mcfunction')) {
                zipEntry.async("string").then(function(content) {
                    const modifiedContent = modifyText(content, fromVersion, toVersion);
                    zip.file(zipEntry.name, modifiedContent);
                });
            } else if (includeCredits && zipEntry.name.endsWith('credits.txt')) {
                zipEntry.async("string").then(function(content) {
                    const newContent = content + "\nThis was updated with the datapack updater. Visit: lexoticX.github.io";
                    zip.file(zipEntry.name, newContent);
                });
            }
        });

        zip.generateAsync({ type: "blob" }).then(function(blob) {
            saveAs(blob, "modified_datapack.zip");
        });
    });
}

function modifyText(content, fromVersion, toVersion) {
    // Implement your logic to modify content based on the from and to versions
    // Example: Replace all occurrences of a variable with the new version's value
    return content.replace(/(\(say_text\))/g, toVersion);
}
