function successfullMessage(msg) {
    return "β *bot*:  ```" + msg + "```"
}
function errorMessage(msg) {
    return "π *bot*:  ```" + msg + "```"
}
function infoMessage(msg) {
    return "βΊοΈ *bot*:  ```" + msg + "```"
}


module.exports = {
    successfullMessage,
    errorMessage,
    infoMessage
}