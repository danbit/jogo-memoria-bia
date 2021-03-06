const showAlert = (msg) => {
    alertify.alert('Jogo da Memória de Bia', msg)
}

const showNotification = (msg, type) => {
    switch (type) {
        case ALERT_TYPE.waning:
            alertify.warning(msg, 2.5);
            break;
        default:
            alertify.success(msg, 2.5);
            break;
    }
}

const ALERT_TYPE = {
    'success': 'success',
    'waning': 'waning'
}
