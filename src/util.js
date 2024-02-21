const fs = require('fs');

function loadStations() {
    const data = fs.readFileSync('stations.json', { encoding: 'utf-8' });
    return JSON.parse(data);
}

function formatDate(date) {
    if (typeof date !== 'string') {
        throw new TypeError('date must be a string');
    }
    const [year, month, day] = date.split('-');
    const dateObj = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dateObj);
}


module.exports = { loadStations, formatDate };
