document.addEventListener('DOMContentLoaded', function() {
    const versionSelect = document.getElementById('versionSelect');
    const versions = ['version1', 'version2']; // Add your version names here
    versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        versionSelect.appendChild(option);
    });

    document.getElementById('includeCredits').addEventListener('click', function() {
        const creditsContent = "This was updated with the datapack updater. Visit: lexoticX.github.io";
        const blob = new Blob([creditsContent], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "credits.txt");
    });

    document.getElementById('processZip').addEventListener('click', function() {
        const zipFile = document.getElementById('zipFile').files[0];
        const selectedVersion = versionSelect.value;
        if (!zipFile) {
            alert('Please select a zip file.');
            return;
        }
        processZip(zipFile, selectedVersion);
    });
});

function processZip(zipFile, selectedVersion) {
    const jszip = new JSZip();
    jszip.loadAsync(zipFile).then(function(zip) {
        zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name.endsWith('.json') || zipEntry.name.endsWith('.mcfunction')) {
                zipEntry.async("string").then(function(content) {
                    const modifiedContent = modifyText(content, selectedVersion);
                    zip.file(zipEntry.name, modifiedContent);
                });
            } else if (zipEntry.name.endsWith('credits.txt')) {
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

function modifyText(content, version) {
    // Implement your logic to modify content based on the version
    // Example: Replace all occurrences of a variable with the new version's value
    return content.replace(/(\(say_text\))/g, version);
}
