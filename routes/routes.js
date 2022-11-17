const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AdminAuth = require('../middleware/AdminAuth');
const VerifyIdentity = require('../middleware/UserIdentityConfirm')
const HomeController = require('../controllers/HomeController');


router.post('/user', UserController.create);
router.get('/user/:id', UserController.findUser);
router.delete('/user/:id', AdminAuth,UserController.remove);
router.delete('/deleteFeedkback/:feedbackId', VerifyIdentity,HomeController.deleteFeedkback);
router.put('/user', VerifyIdentity,UserController.edit);
router.post('/login', UserController.login);
router.post('/passrecovery',UserController.recoverPassword);
router.post('/changePass',UserController.changePassword);
router.get('/home/:userId/:offset/:filter', HomeController.index);
router.post('/pub', VerifyIdentity,HomeController.createPub);
router.get('/findPub/:id', HomeController.findPubById);
router.get('/listMsgs/:offset',HomeController.sendMsgList);
router.get('/searchMsgList/:offset/:wildcard', HomeController.searchMsgList);
router.get('/searchForMsg/:offset/:wildcard', HomeController.searchForMsg);
router.get('/searchUser/:wildcard', HomeController.searchUser);
router.get('/searchPost/:offset/:wildcard',HomeController.searchPost);
router.get('/listFeedbacks/:userId/:offset', HomeController.listFeedbacks);
router.get('/listReports/:offset', HomeController.listReports);
router.get('/getReports/:ideaId', HomeController.getReportsByIdeaid);
router.get('/getFeedback/:id', HomeController.getFeedbackById);
router.get('/generalSeach/:search', HomeController.generalSeach);
router.get('/getSearchListUser/:offset/:userQuery', UserController.getSearchListUser);
router.get('/countPosts/:userId', HomeController.countPosts);
router.get('/profilePageContentList/:userid/:offset', HomeController.profilePageContentList);
router.post('/sendReport', VerifyIdentity,HomeController.sendReport);
router.post('/sendFeedback', VerifyIdentity,HomeController.sendFeedback);
router.post('/writeMsg', VerifyIdentity,HomeController.writeMsg);
router.post('/donateCredits', VerifyIdentity,HomeController.donateCredits);
router.post('/followUser', VerifyIdentity,UserController.followUser)
router.get('/listDonates/:pubId', HomeController.listDonates);
router.put('/favoritePub', VerifyIdentity,HomeController.favoritePub);
router.put('/likePub', VerifyIdentity,HomeController.likePub);
router.get('/checkLikeFavorite/:pubId/:userId', HomeController.checkLikeFavorite);
router.get('/getFollows/:userId', HomeController.getFollows);
router.get('/verifyFollow/:userId/:followingId', UserController.verifyFollow)

router.get('/getByUsername/:username', UserController.getByUsername);
router.put('/updateUserInfo', VerifyIdentity, UserController.updateUserInfo);
router.put('/updatePass', VerifyIdentity, UserController.updatePass);
router.put('/updatePhotoProfile', VerifyIdentity,UserController.updatePhotoProfile)
router.put('/updateIdeaPhoto', VerifyIdentity,HomeController.updateIdeaPhoto)
router.put('/updateInfo', VerifyIdentity,UserController.updateInfo)
router.put('/updateNotifications', VerifyIdentity, UserController.updateNotifications)
router.put('/disableIdea', AdminAuth, HomeController.disableIdea);
router.put('/releaseIdea', AdminAuth, HomeController.releaseIdea);

module.exports = router