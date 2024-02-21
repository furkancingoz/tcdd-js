const { postRequest } = require('./api');
const { sendEmail } = require('./mail');
const { loadStations, formatDate } = require('./util');
const config = require('../config');




const stations = loadStations();
const departureStationId = stations[config.departureStationName];
const arrivalStationId = stations[config.arrivalStationName];
const formattedDate = formatDate(config.date);

const journeyUrl = "https://api-yebsp.tcddtasimacilik.gov.tr/sefer/seferSorgula";
const wagonUrl = "https://api-yebsp.tcddtasimacilik.gov.tr/vagon/vagonHaritasindanYerSecimi";

async function fetchAndFilterJourneys() {
    const body = {
        // Bu kısım senin verdiğin koda göre doldurulmuştur
    };

    console.log(`Checking for date: ${formattedDate}`);
    try {
        const response = await postRequest(journeyUrl, body);
        const data = await response.json();

        if (data['responseInfo']['responseCode'] === '000') {
            for (const journey of data['journeyQueryResultList']) {
                const journeyTime = new Date(journey['departureTime']);
                if (config.checkSpecificHour) {
                    const specifiedTime = new Date(`${config.date} ${config.hour}`);
                    if (journeyTime.getHours() === specifiedTime.getHours() &&
                        journeyTime.getMinutes() === specifiedTime.getMinutes()) {
                        await checkJourney(journey);
                    }
                } else {
                    await checkJourney(journey);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching and filtering journeys:', error);
    }
}

async function checkJourney(journey) {
    console.log(`Checking for time: ${journey['departureTime']}`);
    for (const wagon of journey['wagonTypesFreeSeatsPrice']) {
        for (const wagonDetail of wagon['wagonList']) {
            const wagonSequenceNumber = wagonDetail['wagonSequenceNo'];
            console.log(`Checking for wagon: ${wagonSequenceNumber}`);
            await checkSpecificSeats(journey['journeyId'], wagonSequenceNumber, journey['trainName'], journey['departureTime']);
        }
    }
}

async function checkSpecificSeats(journeyId, wagonSequenceNo, trainName, departureTime) {
    const body = {
        "channelCode": "3",
        "language": 0,
        "journeyTitleId": journeyId,
        "wagonSequenceNo": wagonSequenceNo,
        "departureSta": config.departureStationName,
        "arrivalSta": config.arrivalStationName
    };

    try {
        const response = await postRequest(wagonUrl, body);
        const data = await response.json();

        if (data['responseInfo']['responseCode'] === '000') {
            for (const seat of data['wagonMapContentDVO']['seatStatuses']) {
                if (seat['status'] === 0) { // Available
                    if (!seat['seatNo'].endsWith('h')) { // Not Handicapped
                        console.log(`Available seat: ${seat['seatNo']} in Wagon ${wagonSequenceNo}`);
                        await sendEmail(trainName, departureTime, wagonSequenceNo, seat['seatNo']);
                    } else { // Handicapped
                        console.log(`Available handicapped seat: ${seat['seatNo']} in Wagon ${wagonSequenceNo}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking specific seats:', error);
    }
}

module.exports = { fetchAndFilterJourneys };
""