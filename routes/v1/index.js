const express = require('express');
const router = express.Router();



// standard response senders
const { ReS, ReE, to, TE } = require('../../services/util.service');


const assetCtrl = require('../../controllers/asset');
const taskCtrl = require('../../controllers/task');
const workerCtrl = require('../../controllers/worker');

const assetValidator = require('../../validators/asset')
const taskValidator = require('../../validators/task')
const workerValidator = require('../../validators/worker')



// @route   GET api/v1/
// @desc    Home users route
router.get('/',(req,res,next)=>{ReS(res,{},200,false,"Api v1 default page")});

// @route   POST api/v1/assets
// @desc    add asset to system

router.post('/assets', assetValidator.validateAssetInsert, assetCtrl.addAsset);


// @route   GET api/v1/assets
// @desc    get  assets
router.get('/assets', assetCtrl.getAssets);

// @route   POST api/v1/tasks
// @desc    add task to system
router.post('/asset/:asset_id/tasks', taskValidator.validateTaskInsert, taskCtrl.addTask);


// @route   GET api/v1/assets/:asset_id/tasks
// @desc    get tasks of an asset
router.get('/asset/:asset_id/tasks', taskValidator.validateGetTask, taskCtrl.getTasks);

// @route   POST api/v1/workers
// @desc    add workers
router.post('/workers', workerValidator.validateWorkerInsert, workerCtrl.addWorker);

// eligible workers for a task
// @route   GET api/v1/workers/:task_id
// @desc    get eligible workers for a task
router.get('/workers/:task_id/', workerValidator.validateWorkerforTask, workerCtrl.getWorkersForTask);

// @route   POST api/v1/asset/:asset_id/task/:task_id/worker
// @desc    assign worker for a task
router.post('/asset/:asset_id/task/:task_id/worker', workerValidator.validateAddTaskToWorker, workerCtrl.addWorkerToTask);

// @route   GET api/v1/workers
// @desc    get all workers
router.get('/workers', workerCtrl.getAllWorkers);

// @route   GET api/v1/worker-tasks/:worker_id
// @desc    get all tasks of a worker
router.get('/worker-tasks/:worker_id', workerValidator.validateWorkerTaskDetail, workerCtrl.getWorker);

module.exports = router;
