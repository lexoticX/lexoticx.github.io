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
