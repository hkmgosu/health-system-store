  /**
   * Built-in Log Configuration
   * (sails.config.email)
   *
   * cuentas de envio de correo 
   *
   */

module.exports.email = {
    from: '"Mi SSVQ" <mi.ssvq@redsalud.gov.cl>',
    mailgunConfig: {
        auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
        }
    },
    ssvqOutlookConfig: {
        host: "mail.redsalud.gov.cl", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        auth: {
            user: process.env.OUTLOOK_USER,
            pass: process.env.OUTLOOK_PASS
        },
        tls: {
            ciphers: 'SSLv3'
        }
    },
    maintanceMails: ['nicolas.albornoz@redsalud.gov.cl','jaime.cisternas@redsalud.gov.cl','pedro.hernandezl@redsalud.gov.cl']
};
