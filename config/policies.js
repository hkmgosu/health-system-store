/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {
    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions (`true` allows public     *
     * access)                                                                  *
     *                                                                          *
     ***************************************************************************/

    '*': ["canUpdate"],
    AppController: {
        showDashboards: ['canView'],
        showPublic: true,
        showLogin: true
    },
    ProfileController: {
        getConfigProfiles: ['canRead'],
        create: 'canCreate',
        update: 'canUpdate',
        delete: 'canDelete',
        getList: 'canRead',
        getDetails: 'canRead',
        getEmployeeList: 'canRead',
        addEmployeeList: 'canUpdate',
        addAllEmployees: 'canUpdate',
        removeAllEmployees: 'canUpdate'
    },
    NotificationController: {
        getMine: ['canRead'],
        getAll: ['canRead'],
        subscribe: ['canRead'],
        toggleReaded: ['canUpdate'],
        getGroup: ['canRead']
    },
    EstablishmentController: {
        get: ['canRead'],
        getAll: ['canRead'],
        getAllPublic: true,
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete'],
        getBedManagementSupervisors: 'canRead',
        setBedManagementModuleAvailable: 'canUpdate',
        addBedManagementSupervisor: 'canUpdate',
        removeBedManagementSupervisor: 'canUpdate',
        mapAddress: 'isAdmin',
        getAdverseEventModuleAvailable: ['canRead'],
        getAdverseEventSupervisors: ['canRead'],
        addAdverseEventSupervisors: ['canUpdate'],
        rmAdverseEventSupervisors: ['canUpdate']
    },
    EstablishmentTypeController: {
        get: ['canRead'],
        getAll: ['canRead'],
        getAllPublic: true,
        icon: ["canRead"],
        iconPublic: true,
        save: ['canCreate', 'canUpdate'],
        uploadIcon: ['canCreate', 'canUpdate'],
        delete: ['canDelete']
    },
    EmployeeController: {
        login: true,
        logout: true,
        get: ['canRead'],
        getList: ['canRead'],
        getListPublic: true,
        getParams: ['canRead'],
        getSharedFiles: ['canRead'],
        getMyTypecasting: ['canRead'],
        getTypecasting: ['canRead'],
        getProfile: ['canRead'],
        getProfileById: ['canRead'],
        validateEmail: ['canRead'],
        setPassword: ['canUpdate'],
        addSupervisedUnit: ['canUpdate'],
        removeSupervisedUnit: ['canUpdate'],
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete'],
        firstUpdate: 'canUpdate',
        setFullname: 'isAdmin',
        getPerUnit: ['canRead'],
        setUnit: ['canUpdate'],
        getSupervisedUnits: ['canRead'],
        uploadProfilePicture: ['canUpdate'],
        uploadMyProfilePicture: ['canUpdate'],
        deleteProfilePicture: ['canUpdate'],
        deleteMyProfilePicture: ['canUpdate'],
        downloadProfilePicture: true,
        updatePersonalData: ['canUpdate'],
        updatePasswordData: ['canUpdate'],
        setSearchText: 'isAdmin',
        getAdverseEventSupervised: ['canRead'],
        syncFromApi: 'canRead',
        mapJob: 'isAdmin',
        addProfile: 'canUpdate',
        removeProfile: 'canUpdate',
        resetSamu: 'isAdmin'
    },
    AfpController: {
        getAll: true
    },
    HealthCareController: {
        getAll: true
    },
    LegalQualityController: {
        getAll: true
    },
    UnitController: {
        get: 'canRead',
        getAutocomplete: ['canRead'],
        getAvailableToRequest: ['canRead'],
        getAll: ['canRead'],
        getRequestUnits: ['canRead'],
        getSupervisors: ['canRead'],
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete'],
        exportOrgChart: ['canCreate', 'canUpdate'],
        addSupervisor: ['canUpdate'],
        rmSupervisor: ['canUpdate'],
        mapEstablishment: 'canUpdate',
        resetHierarchy: 'isAdmin',
        mapSupervisorsCount: 'isAdmin',
        getUnitsEstablishment: ['canRead'],
        getAdverseEventSupervisors: ['canRead'],
        addAdverseEventSupervisors: ['canUpdate'],
        rmAdverseEventSupervisors: ['canUpdate'],
        getMembersUnit: ['canRead'],
        setMember: ['canUpdate'],
        removeMember: ['canUpdate'],
        getUnitsForStorageManagement: ['canRead']
    },
    UnitTypeController: {
        getAll: true
    },
    JobController: {
        get: ['canRead'],
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete'],
        getAll: true
    },
    AreaController: {
        delete: ['canDelete'],
        save: ['canCreate', 'canUpdate'],
        getAll: ['canRead'],
        getAllPublic: true
    },
    ArchiveController: {
        uploadArchive: ['canCreate'],
        attachment: ['canRead'],
        attachmentByOwner: ['canRead'],
        delete: ['canDelete']
    },
    RequestController: {
        getSubscribed: ['canRead'],
        getSupervised: ['canRead'],
        create: ['canCreate'],
        getLabels: ['canRead'],
        getStates: ['canRead'],
        getDetails: ['canRead'],
        addComment: ['canUpdate'],
        getTimeline: ['canRead'],
        getDynamic: ['canRead'],
        unsubscribe: ['canRead'],
        canAutoassign: ['canRead'],
        getPopularTags: ['canRead'],
        setCommentCount: 'isAdmin'
    },
    RemController: {
        get: ['canRead', 'hasActiveWorkshift'],
        getTimeline: ['canRead'],
        save: ['canCreate'],
        getDynamic: ['canRead', 'hasActiveWorkshift'],
        getCallReasons: ['canRead'],
        getSubCallReasons: ['canRead'],
        getApplicantTypes: ['canRead'],
        getRemStatus: ['canRead'],
        getEcg: ['canRead'],
        getSupplies: ['canRead'],
        getVehiclePatientList: ['canRead', 'hasActiveWorkshift'],
        saveRemVehicle: ['canUpdate'],
        saveRemPatient: ['canUpdate'],
        newRem: ['canCreate', 'hasActiveWorkshift'],
        createMultiplePatients: ['canCreate'],
        getRegulatorObservations: ['canRead'],
        saveRegulatorObservations: ['canCreate'],
        addComment: ['canUpdate'],
        subscribe: ['canRead'],
        getRemPatientById: ['canRead'],
        saveRemPatientIntervention: ['canUpdate'],
        saveRemPatientBasicEvolution: ['canUpdate'],
        saveRemPatientVitalSigns: ['canUpdate'],
        saveRemPatientMedicines: ['canUpdate'],
        deleteRemPatientMedicines: ['canDelete'],
        saveRejected: ['canCreate'],
        getHeatMap: ['canRead'],
        getReportByCallReason: ['canRead'],
        getCallReport: 'canRead',
        getTransferReport: 'canRead',
        getBaseReport: 'canRead',
        getTransferWithoutPatientReport: 'canRead',
        getRemEight: 'canRead',
        getEmployeeReport: 'isAdmin',
    },
    RemStatusController: {
        create: 'canCreate',
        getSupervisorList: 'canRead',
        addSupervisor: 'canUpdate',
        removeSupervisor: 'canUpdate',
        updateOrder: 'canUpdate'
    },
    RemAccessController: {
        get: 'canRead',
        getEmployeeAccessList: 'canRead'
    },
    RemPatientController: {
        get: 'canRead',
        getVitalSignsEvolution: 'canRead',
        getMedicineHistory: 'canRead',
        create: 'canCreate',
        getHistoryItemDetails: 'canRead'
    },
    RequestLabelController: {},
    RequestStateController: {},
    RequestStakeholdersController: {
        get: ['canRead'],
        setSubscribed: ['canUpdate'],
        addStakeholder: ['canCreate'],
        rmStakeholder: ['canDelete']
    },
    RecoveryLinkController: {
        create: true,
        validate: true,
        use: true
    },
    TypeCastingController: {},
    InitController: {
        '*': 'isAdmin'
    },
    VehicleController: {
        watch: ['canRead'],
        delete: ['canDelete'],
        save: ['canCreate', 'canUpdate'],
        getAll: ['canRead'],
        get: ['canRead'],
        getAutocomplete: ['canRead'],
        updateStatus: ['canUpdate'],
        getRemLog: ['canRead'],
        getRemHistory: ['canRead'],
        updatePosition: true,
        getRemVehicleRoute: 'canRead',
        setSearchText: 'isAdmin',
        getCurrentCareTeam: 'canRead'
    },
    RemVehicleController: {
        updateStatus: ['canUpdate'],
        finishByRem: ['canUpdate']
    },
    VehicleStatusController: {
        init: 'isAdmin',
        getAll: ['canRead']
    },
    PatientController: {
        get: ['canRead'],
        getAll: ['canRead'],
        save: ['canCreate', 'canUpdate'],
        delete: false,
        getExternalPatient: ['canRead'],
        getList: ['canRead'],
        getClinicalHistory: 'canRead',
        identifyPatient: 'canUpdate'
    },
    RegionController: {
        getAll: ['canRead']
    },
    CommuneController: {
        getAll: ['canRead'],
        getAutocomplete: ['canRead'],
        get: ['canRead']
    },
    TransferStatusController: {
        getAll: ['canRead']
    },
    MedicineController: {
        get: ['canRead'],
        getAll: ['canRead'],
        getByIds: ['canRead'],
        getAllMedicineVia: ['canRead'],
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete'],
        getAllCategoryMedicines: ['canRead'],
        getAllSubCategoryMedicines: ['canRead'],
        getAllDrugCategories: ['canRead'],
        getMedicineService: ['canRead'],
        getMedicineServiceByIds: ['canRead'],
    },
    SupplyController: {
        getAll: ['canRead']
    },
    DiagnosticController: {
        getAll: ['canRead'],
        getSubCategory: ['canRead'],
        getAllSubCategory: ['canRead']
    },
    RemAttentionController: {
        getItems: ['canRead'],
        getClasses: ['canRead'],
        saveClass: ['canCreate', 'canUpdate'],
        saveItem: ['canCreate', 'canUpdate'],
        deleteItem: ['canDelete'],
        deleteClass: ['canDelete'],
        getAllClasses: ['canRead'],
        getAllItems: ['canRead'],
        getRemPatientAttentions: ['canRead']
    },
    RemTransferStatusController: {
        get: ['canRead'],
        getAll: ['canRead'],
        save: ['canCreate', 'canUpdate'],
        delete: ['canDelete']
    },
    UtilitiesController: {
        getDateTime: ['isAuthenticated']
    },
    ViaticController: {
        create: 'canCreate',
        getList: 'canRead',
        getDetails: ['canRead', 'canWorkflowRead'],
        getSent: 'canRead',
        getSupervised: 'canRead',
        initValues: true,
        getValues: true,
        getTimeline: ['canRead', 'canWorkflowRead'],
        addComment: ['canUpdate', 'canWorkflowRead'],
        changeStatus: ['canUpdate'],
        getViaticListPdf: ['canRead'],
        getViaticDetailPdf: ['canRead', 'canWorkflowRead'],
        getViaticsDetailPdfByClosure: ['canRead'],
        validateDates: 'canRead',
        getTypeList: 'canRead',
        initType: 'isAdmin',
        getStatusList: 'canRead'
    },
    ViaticClosureController: {
        getList: 'canRead',
        create: 'canCreate',
        getDetails: 'canRead',
        confirm: 'canUpdate'
    },
    PermissionController: {
        create: 'canCreate',
        getSent: 'canRead',
        getDetails: ['canRead', 'canWorkflowRead'],
        getPermissionTypeList: 'canRead',
        initPermissionType: 'isAdmin',
        getSupervised: 'canRead',
        setStatus: ['canUpdate'],
        addComment: 'canCreate',
        getTimeline: ['canRead', 'canWorkflowRead'],
        getPermissionListPdf: 'canRead',
        getPermissionDetailPdf: ['canRead', 'canWorkflowRead']
    },
    PermissionClosureController: {
        createClosure: ['canCreate', 'canUpdate'],
        getClosures: 'canRead',
        getClosureDetails: 'canRead',
        confirm: 'canUpdate'
    },
    ResourceController: {
        getList: 'canRead',
        getExportList: 'canRead',
        create: 'canCreate',
        update: 'canUpdate',
        delete: 'canDelete',
        getResourceTypeList: 'canRead',
        getResourceStatusList: 'canRead',
        updateLocationInfo: 'canUpdate',
        getEmployeeListByResource: 'canRead',
        getEmployeeResourceList: 'canRead',
        getMyEmployeeResourceList: 'canRead',
        getAssignmentCoincidences: 'canRead'
    },
    BedController: {
        getRoomList: 'canRead',
        getUnitList: 'canRead',
        addRoom: 'canUpdate',
        addBed: 'canUpdate',
        addBedPatient: 'canUpdate'
    },
    DerivationController: {
        get: 'canRead',
        getList: 'canRead',
        create: 'canCreate',
        update: 'canUpdate',
        setUnitDerivationModuleAvailable: 'canUpdate',
        getUnitListAvailable: 'canRead',
        addComment: 'canUpdate',
        getRequiredEquipmentList: 'canRead',
        getTimeline: 'canRead',
        initEquipment: 'isAdmin',
        clean: 'isAdmin',
        unsubscribe: 'canRead',
        getMySupervisedEstablishmentList: 'canRead'
    },
    DerivationStatusController: {
        getList: 'canRead',
        init: 'isAdmin'
    },
    AdverseEventController: {
        getSent: ['canRead'],
        getAllDamageType: ['canRead'],
        getUnitsEvents: ['canRead'],
        getAllEventType: ['canRead'],
        getAllTupleForm: ['canRead'],
        getAllAssociatedProcess: ['canRead'],
        getAllParametricsFallForm: ['canRead'],
        createEvent: ['canCreate'],
        updateEvent: ['canUpdate'],
        getDetails: ['canRead'],
        getStatus: ['canRead'],
        saveStatus: ['canUpdate'],
        getParametricsAutocomplete: ['canRead'],
        getEventsPatient: ['canRead'],
        getValidEstablishment: ['canRead'],
        getSupervised: ['canRead'],
        getAllParametricsMedicationForm: ['canRead'],
        getAllParametricsUppForm: ['canRead'],
        getDuplicatedEvents: ['canRead'],
        markNotDuplicateEvent: ['canUpdate'],
        markDuplicateEvent: ['canUpdate'],
        getEventType: ['canRead'],
        unsubscribe: ['canRead'],
        getUppsPatient: ['canRead'],
        unsubscribe: ['canRead'],
        initMedicine: 'isAdmin',
        getOriginOccurrence: ['canRead']
    },
    ArticleController: {
        getDetails: 'canRead',
        getList: 'canRead',
        getManagedList: 'canRead',
        create: 'canCreate',
        edit: 'canUpdate',
        delete: 'canDelete',
        getTagList: 'canRead'
    },
    ArticleCategoryController: {
        getList: 'canRead',
        getManagedList: 'canRead',
        getDetails: 'canRead',
        getManagerList: 'canRead',
        addManager: 'canUpdate',
        removeManager: 'canUpdate',
        create: 'canCreate',
        edit: 'canUpdate',
        delete: 'canDelete',
        getBreadcrumbs: 'canRead'
    },
    WorkflowController: {
        getStatus: 'canRead',
        getEnabledStatusList: 'canRead',
        addSupervisor: 'canUpdate',
        rmSupervisor: 'canUpdate',
        getUnitReported: 'canRead',
        canCreate: 'canRead',
        initStatus: 'isAdmin'
    },
    WorkshiftController: {
        create: 'canCreate',
        getList: 'canRead',
        getDetails: 'canRead',
        addCareTeam: 'canUpdate',
        removeCareTeam: 'canUpdate',
        addComment: 'canUpdate',
        getTimeline: 'canRead',
        getFullCareTeamList: 'canRead',
        getEstablishmentVehicleList: 'canRead',
        delete: 'canDelete',
        validate: 'canUpdate',
        getCurrentWorkshift: ['canRead', 'hasActiveWorkshift'],
        getEmployeeHistory: 'canRead',
        update: 'canUpdate',
        copy: 'canCreate',
        remoteValidate: 'canRead',
        updateJob: 'canUpdate'
    },
    ParticipantController: {
        add: 'canUpdate',
        remove: 'canUpdate'
    },
    AddressController: {
        getAddressAutocomplete: 'canRead',
        getAddressAutocompleteReverse: 'canRead'
    },
    HolidayController: {
        importsHolidays: 'isAdmin',
        initHoliday: 'isAdmin',
        getHolidays: 'canRead'
    },

    // STORAGE

    "Storage/ProductTypeController": {
        getList: 'canRead',
        get: 'canRead',
        save: 'canCreate',
        delete: 'canDelete',
        downloadProfilePicture: true
    },
    "Storage/AccountPlanController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/PresentationTypeController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/AdministrationWayController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/DosageTypeController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/MovementTypeController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/ActiveComponentController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/DrugTypeController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/CostCenterController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/ProgramController": {
        getAll: ['canRead'],
        get: ['canRead'],
        getBreadcrumbs: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/CategoryController": {
        getAll: ['canRead'],
        get: ['canRead'],
        getBreadcrumbs: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/ProductController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete'],
        getLogs: ['canRead'],
        getParams: ['canRead'],
        getStockParameters: ['canRead'],
        getComments: ['canRead'],
        unsubscribe: ['canRead'],
        createComment: ['canUpdate'],
        saveStockParameter: ['canCreate'],
        removeStockParameter: ['canDelete'],
        uploadProductProfilePicture: ['canUpdate'],
        deleteProductProfilePicture: ['canUpdate'],
        downloadProductProfilePicture: ['canRead'],
        getAllowedProducts: ['canRead'],
        getProductByParams: ['canRead'],
        getPacks: ['canRead'],
        savePack: ['canCreate'],
        removePack: ['canDelete'],
        getLots: ['canRead'],
        getStocks: ['canRead'],
        getPackTypes: ['canRead'],
        validateProductCode: 'canRead',
        getProductActiveComponents: 'canRead',
        saveProductActiveComponent: 'canCreate',
        removeProductActiveComponent: 'canDelete'
    },
    "Storage/ProductRequestController": {
        getAll: ['canRead'],
        get: ['canRead'],
        getComments: ['canRead'],
        getDetailComments: ['canRead'],
        getReportPrint: ['canRead'],
        unsubscribe: ['canRead'],
        unsubscribeDetail: ['canRead'],
        createComment: ['canUpdate'],
        createDetailComment: ['canUpdate'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete'],
        getDetail: ['canRead'],
        addDetail: ['canCreate'],
        updateDetail: ['canUpdate'],
        delDetail: ['canDelete'],
        getShippings: ['canRead'],
        addShipping: ['canUpdate'],
        updateShipping: ['canUpdate'],
        delShipping: ['canUpdate'],
        getOriginUnits: 'canRead'
    },
    "Storage/ProductRequestStatusController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/CompanyController": {
        getAll: ['canRead'],
        get: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/MaintainersController": {
        getModules: ['canRead']
    },
    "Storage/StorageManagerController": {
        getAll: ['canRead'],
        get: ['canRead'],
        save: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete'],
        saveStorageUnit: ['canUpdate'],
        getStorageUnits: ['canRead'],
        addStorageManager: ['canUpdate'],
        rmStorageManager: ['canUpdate'],
        getStorageManagers: 'canRead'
    },
    "Storage/UnitProductsManagerController": {
        getAll: ['canRead'],
        getProductUnits: ['canRead'],
        getAllowedUnits: ['canRead'],
        getStorages: ['canRead'],
        save: ['canCreate'],
        delete: ['canDelete'],
        getProductStoragesStock: ['canRead']
    },
    "Storage/MovementController": {
        get: ['canRead'],
        getDetail: ['canRead'],
        getAll: ['canRead'],
        getExternalUnits: ['canRead'],
        unsubscribe: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        addDetail: ['canUpdate'],
        delDetail: ['canUpdate'],
        saveDetail: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/LocationController": {
        get: ['canRead'],
        getAll: ['canRead'],
        create: ['canCreate'],
        delete: ['canDelete']
    },
    "Storage/UnitProductRequestController": {
        getAll: ['canRead'],
        create: ['canCreate'],
        delete: ['canDelete'],
    },
    "Storage/PlanCenabastController": {
        get: ['canRead'],
        getAll: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete']
    },
    "Storage/StorageReportController": {
        getProductMostRequested: ['canRead'],
        getStockExpiration: ['canRead'],
        getStockLot: ['canRead'],
        getCriticalStock: ['canRead'],
        getInputOutputProduct: ['canRead'],
        getMaxStock: ['canRead'],
        getWeightedPrice: ['canRead'],
        getProducts: ['canRead'],
        getPurchasesFromSuppliers: ['canRead'],
        getBincard: ['canRead'],
        getExpensePerUnit: ['canRead'],
        getCenabast: ['canRead'],
        getConsolidatedProducts: ['canRead']
    },
    "Storage/InventoryController": {
        get: ['canRead'],
        getAll: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        delete: ['canDelete'],
        updateInventoryDetail: ['canUpdate']
    },
    "Storage/ExpressIncomeController": {
        get: ['canRead'],
        getDetail: ['canRead'],
        getAll: ['canRead'],
        unsubscribe: ['canRead'],
        create: ['canCreate'],
        update: ['canUpdate'],
        addDetail: ['canUpdate'],
        delDetail: ['canUpdate'],
        saveDetail: ['canUpdate'],
        delete: ['canDelete']
    }
    /***************************************************************************
     *                                                                          *
     * Here's an example of mapping some policies to run before a controller    *
     * and its actions                                                          *
     *                                                                          *
     ***************************************************************************/
    // RabbitController: {

    // Apply the `false` policy as the default for all of RabbitController's actions
    // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
    // '*': false,

    // For the action `nurture`, apply the 'isRabbitMother' policy
    // (this overrides `false` above)
    // nurture	: 'isRabbitMother',

    // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
    // before letting any users feed our rabbits
    // feed : ['isNiceToAnimals', 'hasRabbitFood']
    // }
};
