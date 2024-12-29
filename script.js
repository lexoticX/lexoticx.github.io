document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const loadingSpinner = document.getElementById('loadingSpinner');

    fetch('https://api.github.com/repos/lexoticX/lexoticx.github.io/contents/versions')
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

    document.getElementById('update').addEventListener('click', function() {
        const zipFile = document.getElementById('zipFile').files[0];
        const includeCredits = document.getElementById('includeCredits').checked;
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

        processZip(zipFile, fromVersion, toVersion, includeCredits).then(() => {
            loadingSpinner.style.display = 'none';
        });
    });
});

async function processZip(zipFile, fromVersion, toVersion, includeCredits) {
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(zipFile);

    if (!Object.keys(zip.files).some(name => name.endsWith('pack.mcmeta'))) {
        alert('The zip file must contain a pack.mcmeta file.');
        return;
    }

    let currentVersion = parseInt(fromVersion);
    const endVersion = parseInt(toVersion);

    while (currentVersion < endVersion) {
        const nextVersion = currentVersion + 1;
        await updateVersion(zip, currentVersion, nextVersion, includeCredits);
        currentVersion = nextVersion;
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, zipFile.name);
}

async function updateVersion(zip, fromVersion, toVersion, includeCredits) {
    const folders = Object.keys(zip.files).filter(name => zip.files[name].dir && name.startsWith('data/'));
    const targetFolder = folders.length > 0 ? folders[0] : '';

    await Promise.all(Object.keys(zip.files).map(async (relativePath) => {
        const zipEntry = zip.files[relativePath];
        if (zipEntry.name.endsWith('.json') || zipEntry.name.endsWith('.mcfunction') || zipEntry.name.endsWith('.mcmeta')) {
            const content = await zipEntry.async("string");
            const modifiedContent = modifyText(content, fromVersion, toVersion);
            zip.file(zipEntry.name, modifiedContent);
        } else if (includeCredits && zipEntry.name.endsWith('credits.txt')) {
            const content = await zipEntry.async("string");
            const newContent = `Credits for lexoticX\n${content}`;
            zip.file(zipEntry.name, newContent);
        }
    }));

    if (includeCredits && !zip.files[`${targetFolder}credits.txt`]) {
        zip.file(`${targetFolder ? targetFolder : ''}credits.txt`, 'Credits for lexoticX\n');
    }
}

function modifyText(content, fromVersion, toVersion) {
    const lines = content.split('\n');
    if (lines.length > 2) {
        lines[2] = toVersion.split('\n')[2];
        lines = lines.map(line => {
            const regex = new RegExp(`\\b${fromVersion}\\b`, 'g');
            return line.replace(regex, toVersion);
        });
    }
    return lines.join('\n');
}
