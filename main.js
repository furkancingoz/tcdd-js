const { fetchAndFilterJourneys } = require('./src/functions');
const config = require('./config');




function main() {
    setInterval(async () => {
        console.log("### Started checking.");
        await fetchAndFilterJourneys();
        console.log(`### Completed checking. \n### Will restart in ${config.sleepTime} seconds.`);
    }, config.sleepTime * 1000); // setInterval milisaniye cinsinden süre bekler, bu yüzden saniyeyi milisaniyeye çeviriyoruz.
}

main();
