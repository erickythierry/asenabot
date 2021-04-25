function successfullMessage(msg) {
    return "✅ *bot*:  ```" + msg + "```"
}
function errorMessage(msg) {
    return "🛑 *bot*:  ```" + msg + "```"
}
function infoMessage(msg) {
    return "⏺️ *bot*:  ```" + msg + "```"
}


module.exports = {
    successfullMessage,
    errorMessage,
    infoMessage
}