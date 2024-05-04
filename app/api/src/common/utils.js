module.exports = {
    FormatDate
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

function FormatDate(date) {
    return months[date.getMonth()] + " " + date.getDate();
}