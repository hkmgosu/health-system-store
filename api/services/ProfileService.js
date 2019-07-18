'use strict';

module.exports = {
    setEmployeeListCount: (idProfile) => {
        // TODO 
        return;
        if (!idProfile) { return; }
        Profile.findOne(idProfile).populate('employeeList').then(profile => {
            profile.employeeListCount = profile.employeeList.length;
            profile.save(() => { });
        });
    }
};