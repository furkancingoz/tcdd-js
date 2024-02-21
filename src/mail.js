// Bu fonksiyon çağrıldığında herhangi bir işlem yapmaz
function sendEmail(trainName, departureDate, wagonNumber, seatNumber) {
    // E-posta gönderme işlevselliği kullanılmıyor
    console.log(`Placeholder for sending email: Seat ${seatNumber} in Wagon ${wagonNumber} of ${trainName} on ${departureDate}.`);
}

module.exports = { sendEmail };
