module.exports = {
    FormatDate
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

function FormatDate(localeDateStr) {
    const splits = localeDateStr.split("/");
    const month = parseInt(splits[0]);
    return months[month-1] + " " + splits[1];
}