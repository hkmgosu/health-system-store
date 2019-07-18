/**
 * Profile.js
 *
 * @description :: Modelo
 * @docs        ::
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        description: 'string',
        profiles: {
            type: 'json'
        },
        employeeList: {
            collection: 'employee',
            via: 'profileList'
        },
        employeeListCount: {
            type: 'integer',
            defaultsTo: 0
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};