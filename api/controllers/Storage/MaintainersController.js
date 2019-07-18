/**
 * Storage/MaintainersController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getModules(req, res) {
        let getArrayModules = (acum, modules) => {
            for (let k in modules) {
                if (modules[k].config && modules[k].config.menu && modules[k].config.menu.url) {
                    acum.push(modules[k].config);
                }

                if (modules[k].modules) {
                    getArrayModules(acum, modules[k].modules);
                }
            }
            return acum;
        };

        let modules = req.session.employee.profile.profiles.dashboard.modules || {}

        res.send({
            ok: true,
            obj: {
                modules: getArrayModules([], modules),
                employee: _.omit(req.session.employee, ['password', 'profile']) || {}
            }
        });
    }
};