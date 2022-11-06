const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AdminAuth = require('../middleware/AdminAuth');
const HomeController = require('../controllers/HomeController');


router.post('/user', UserController.create);
router.get('/user/:id', UserController.findUser);
router.delete('/user/:id', AdminAuth,UserController.remove);
router.delete('/deleteFeedkback/:feedbackId', HomeController.deleteFeedkback);
router.put('/user', UserController.edit);
router.post('/login', UserController.login);
router.post('/passrecovery', UserController.recoverPassword);
router.post('/changePass', UserController.changePassword);
router.get('/home/:userId/:offset/:filter', HomeController.index);
router.post('/pub', HomeController.createPub);
router.get('/findPub/:id', HomeController.findPubById);
router.get('/listMsgs/:offset', HomeController.sendMsgList);
router.get('/searchMsgList/:offset/:wildcard', HomeController.searchMsgList);
router.get('/searchForMsg/:offset/:wildcard', HomeController.searchForMsg);
router.get('/searchUser/:wildcard', HomeController.searchUser);
router.get('/searchPost/:offset/:wildcard',HomeController.searchPost);
router.get('/listFeedbacks/:userId/:offset', HomeController.listFeedbacks);
router.get('/listReports/:offset', HomeController.listReports);
router.get('/getReports/:ideaId', HomeController.getReportsByIdeaid);
router.get('/getFeedback/:id', HomeController.getFeedbackById);
router.get('/generalSeach/:search', HomeController.generalSeach);
router.get('/getSearchListUser/:userQuery', UserController.getSearchListUser)
router.post('/sendReport', HomeController.sendReport);
router.post('/sendFeedback', HomeController.sendFeedback);
router.post('/writeMsg', HomeController.writeMsg);
router.post('/donateCredits', HomeController.donateCredits);
router.post('/followUser', UserController.followUser)
router.get('/listDonates/:pubId', HomeController.listDonates);
router.put('/favoritePub', HomeController.favoritePub);
router.put('/likePub', HomeController.likePub);
router.get('/checkLikeFavorite/:pubId/:userId', HomeController.checkLikeFavorite);
router.get('/getFollows/:userId', HomeController.getFollows);
router.get('/verifyFollow/:userId/:followingId', UserController.verifyFollow)

router.get('/getByUsername/:username', UserController.getByUsername);
router.put('/updateUserInfo', UserController.updateUserInfo);
router.put('/updatePass', UserController.updatePass);
router.put('/updatePhotoProfile', UserController.updatePhotoProfile)
router.put('/updateIdeaPhoto', HomeController.updateIdeaPhoto)
router.put('/updateInfo', UserController.updateInfo)
router.put('/updateNotifications', UserController.updateNotifications)
router.put('/disableIdea', HomeController.disableIdea);
router.put('/releaseIdea', HomeController.releaseIdea);

module.exports = router