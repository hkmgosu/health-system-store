/**
 * Datos para la importación de datos desde excel
 *
 */

module.exports.imports = {
    filePath   : 'imports/consolidadoV2.xlsx',
    pathIcons  : 'imports/icons',
    excelSheet : {
        employee          : 'consolidado',// TODO: cambiar a pestaña consolidados
        afp               : 'afps',
        legalQuality      : 'calidad_juridica',
        healthCare        : 'isapres',
        unit              : 'unidades',
        unitType          : 'tipo_unidad',
        establishment     : 'establecimientos',
        establishmentType : 'tipo_establecimiento',
        job               : 'cargos',
        requestLabel      : 'request_label',
        plant             : 'planta'
    },
    requestStatesDefault: [
        {
            id         : 1,
            description: 'Abierto',
            finished   : false
        },
        {
            id         : 2,
            description: 'Completado',
            finished   : true
        },
        {
            id         : 3,
            description: 'Rechazado',
            finished   : true
        },
        {
            id         : 4,
            description: 'En espera',
            finished   : false
        },
    ],
    typeCasting: {
        filePath  : 'imports/encasillamiento.xlsx',
        excelSheet: {
            consolidated : 'consolidated'
        },
        excelField: {
            rut                 : 'rut',
            level               : 'grado',
            name                : 'nombre',
            plant               : 'p',
            antiquityGrade      : 'gradoUltimoAscenso',
            antiquityJob        : 'cargoUltimoAscenso',
            antiquityService    : 'servicioAnioTitular',
            antiquityPublicAdmin: 'administracionPublica',
            score               : 'pc',
            priority            : 'pri',
            job                 : 'esc',
            establishment       : 'est',
            year                : 'anio'
        }
    },
    samu:{
        filePath   : 'imports/samu.xlsx',
        excelSheet : {
            region : 'region',
            commune: 'commune',
            callReason: 'callreason',
            subCallReason: 'subcallreason',
            applicantType: 'applicanttype',
            medicine: 'medicine',
            medicineVia: 'medicinevia',
            transferStatus: 'transferstatus',
            ecg: 'ecg',
            attentionClass: 'attentionclass',
            attentionItem: 'attentionitem',
            vehicle: 'vehicle',
            employee: 'employee',
            categoryMedicine: 'categoryMedicine',
            subCategoryMedicine: 'subCategoryMedicine',
            drugCategory: 'drugCategory'
        }
    },
    remStatus: [
        {
            id         : 1,
            description: 'Abierto',
            finished   : false,
            order: 1
        },
        {
            id         : 2,
            description: 'Completado',
            finished   : true,
            order: 6

        },
        {
            id         : 3,
            description: 'En Despacho',
            finished   : false,
            order: 3
        },
        {
            id         : 4,
            description: 'En Regulación',
            finished   : false,
            order: 2
        },
        {
            id         : 5,
            description: 'Rechazado',
            finished   : true,
            order: 8
        },
        {
            id: 6,
            description: 'Regulado',
            finished: true,
            order: 7

        },
        {
            id: 7,
            description: 'En curso',
            finished: false,
            order: 4
        },
        {
            id: 8,
            description: 'Atendida',
            finished: false,
            order: 5
        }
    ],
    resource: {
        filePath   : 'imports/recursos.xlsx',
        excelSheet : {
            employeeResource : 'employeeResource',
            resource: 'resource',
            resourceStatus: 'resourceStatus',
            resourceType: 'resourceType'
        }
    },
    adverseEvent: {
        filePath   : 'imports/adverse-event.xlsx',
        excelSheet : {
            damageType: 'damageType',
            eventType: 'adverseEventType',
            associatedProcess: 'associatedProcess',
            tupleForm: 'tupleForm',
            placeFall: 'placeFall',
            fromFall: 'fromFall',
            activityFall: 'activityFall',
            eventConsequence: 'eventConsequence',
            preventiveMeasure: 'preventiveMeasure',
            riskCategorization: 'riskCategorization',
            previousFall: 'previousFall',
            consciousnessState: 'consciousnessState',
            typeMedication: 'typeMedication',
            sensoryDeficit: 'sensoryDeficit',
            patientMovility: 'patientMovility',
            patientWalk: 'patientWalk',
            adverseEventStatus: 'adverseEventStatus',
            stageError: 'stageError',
            medicationTypeError: 'medicationTypeError',
            gradeUpp: 'gradeUpp',
            localizationUpp: 'localizationUpp',
            dependenceRisk: 'dependenceRisk',
            originUpp: 'originUpp',
            tracingUpp: 'tracingUpp',
            hospitalDevice: 'hospitalDevice'
        }
    },
    holidays: {
        url: 'https://www.feriadosapp.com/api/holidays.json',
        notApply: [16535, 20663, 'bancos', 21065, 21051],
        filePath   : 'imports/holidays.xlsx',
        excelSheet : {
            holidays: 'feriados'
        }
    },
    medicineService: {
        filePath   : 'imports/medicines-service.xlsx',
        excelSheet : {
            medicines: 'medicines'
        }
    },
    workflow: {
        filePath   : 'imports/workflow.xlsx',
        excelSheet : {
            status: 'status'
        }
    }
};