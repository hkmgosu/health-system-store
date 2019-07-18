'use strict';

// ParticipantService

module.exports = {
    getList: (query) => new Promise((resolve, reject) => {
        if (_.isEmpty(query)) { return async.setImmediate(() => reject()); }
        Participant.find(Object.assign(query, { deleted: false })).then(participantList => {
            participantList = _.map(participantList, participant => participant.toJSON());
            async.forEach(participantList, (participant, next) => {
                Employee.findOne(participant.member)
                    .populate('job')
                    .populate('unit')
                    .then(employee => {
                        participant.member = employee.toJSON();
                        next();
                    }, next);
            }, err => {
                if (err) { return reject(err); }
                resolve(participantList);
            });
        }, err => reject(err));
    })
};