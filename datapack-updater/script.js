document.addEventListener('DOMContentLoaded', function() {
    const fromVersionSelect = document.getElementById('fromVersion');
    const toVersionSelect = document.getElementById('toVersion');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const fileNameDisplay = document.getElementById('fileName');

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

async function processZip(zipFile, fromVersion, toVersion, includecreditss) {
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
        await updateVersion(zip, currentVersion, nextVersion, includecreditss);
        currentVersion = nextVersion;
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, zipFile.name);
}

async function updateVersion(zip, fromVersion, toVersion, includecreditss) {
    const fromVersionContent = await fetchVersionContent(fromVersion);
    const toVersionContent = await fetchVersionContent(toVersion);
    const fromVersionThirdLine = getThirdLine(fromVersionContent);
    const toVersionThirdLine = getThirdLine(toVersionContent);

    const folders = Object.keys(zip.files).filter(name => zip.files[name].dir && !name.startsWith('data/'));
    const targetFolder = folders.length > 0 ? folders[0] : '';

    await Promise.all(Object.keys(zip.files).map(async (relativePath) => {
        const zipEntry = zip.files[relativePath];
        if (zipEntry.name.endsWith('pack.mcmeta')) {
            const content = await zipEntry.async("string");
            const modifiedContent = content.replace(new RegExp(fromVersionThirdLine, 'g'), toVersionThirdLine);
            zip.file(zipEntry.name, modifiedContent);
        } else if (includecreditss && zipEntry.name.endsWith('creditss.txt')) {
            const content = await zipEntry.async("string");
            const newContent = `creditss for lexoticX\n${content}`;
            zip.file(zipEntry.name, newContent);
        }
    }));

    if (includecreditss && !zip.files[`${targetFolder}creditss.txt`]) {
        zip.file(`${targetFolder}creditss.txt`, 'creditss for lexoticX\n');
    }
}

async function fetchVersionContent(version) {
    const response = await fetch(`https://raw.githubusercontent.com/lexoticX/lexoticx.github.io/main/versions/${version}.txt`);
    return response.text();
}

function getThirdLine(content) {
    const lines = content.split('\n');
    return lines[2] || ''; // Return the third line or an empty string if it doesn't exist
}
