/**
 * Datos para la importación de datos desde excel
 *
 */

module.exports.minsal = {
    pathToken: '.tmp/minsalToken.json',
    apiActive: process.env.NODE_ENV,
    env: {
        development: {
            username : process.env.DEV_MINSAL_USERNAME,
            password : process.env.DEV_MINSAL_PASSWORD,
            baseUri  : process.env.DEV_MINSAL_URI_BASE,
        },
        production: {
            username : process.env.PROD_MINSAL_USERNAME,
            password : process.env.PROD_MINSAL_PASSWORD,
            baseUri  : process.env.PROD_MINSAL_URI_BASE,
        }
    },
    uriServices: {
        basic: '/v1/personas/datos/basicos/run'
    }
};