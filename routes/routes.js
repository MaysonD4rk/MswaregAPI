const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AdminAuth = require('../middleware/AdminAuth');
const VerifyIdentity = require('../middleware/UserIdentityConfirm')
const HomeController = require('../controllers/HomeController');
const MusclePointsController = require('../controllers/MusclePointsController');

//MSWAREG API
router.post('/user', UserController.create);
router.get('/user/:id', UserController.findUser);
router.delete('/user/:id', AdminAuth,UserController.remove);
router.delete('/deleteFeedback/:feedbackId/:userId', VerifyIdentity,HomeController.deleteFeedkback);
router.put('/user', AdminAuth,UserController.edit);
router.post('/login', UserController.login);
router.post('/passrecovery',UserController.recoverPassword);
router.post('/changePass',UserController.changePassword);
router.get('/home/:userId/:offset/:filter', HomeController.index);
router.get('/listTrendPub', HomeController.listTrendPub)
router.post('/pub', VerifyIdentity,HomeController.createPub);
router.put('/pub', VerifyIdentity, HomeController.editPub);
router.get('/findPub/:id', HomeController.findPubById);
router.get('/listMsgs/:offset',HomeController.sendMsgList);
router.get('/searchMsgList/:offset/:wildcard', HomeController.searchMsgList);
router.get('/searchForMsg/:offset/:wildcard', HomeController.searchForMsg);
router.get('/searchUser/:wildcard', HomeController.searchUser);
router.get('/userHelpInfo/:userId', UserController.userHelpInfo);
router.get('/searchPost/:offset/:wildcard',HomeController.searchPost);
router.get('/listFeedbacks/:userId/:offset', HomeController.listFeedbacks);
router.get('/listReports/:offset', AdminAuth, HomeController.listReports);
router.get('/getReports/:ideaId', AdminAuth,HomeController.getReportsByIdeaid);
router.get('/getFeedback/:id/:userId', VerifyIdentity,HomeController.getFeedbackById);
router.get('/generalSeach/:search', HomeController.generalSeach);
router.get('/getSearchListUser/:offset/:userQuery', UserController.getSearchListUser);
router.get('/getUsersRelations/:offset/:userId/:mode', UserController.getUsersRelations);
router.get('/countPosts/:userId', HomeController.countPosts);
router.get('/profilePageContentList/:userid/:offset', HomeController.profilePageContentList);
router.get('/listWithdrawalRequests/:offset', AdminAuth,HomeController.listWithdrawalRequests);
router.get('/findWithdrawRequestByUserId/:userId', AdminAuth,HomeController.findWithdrawRequestByUserId);
router.get('/listDonates/:pubId', HomeController.listDonates);
router.get('/getOneDonate/:investmentId', HomeController.getOneDonate);
router.post('/sendReport', VerifyIdentity,HomeController.sendReport);
router.post('/sendFeedback', VerifyIdentity,HomeController.sendFeedback);
router.post('/writeMsg', VerifyIdentity,HomeController.writeMsg);
router.post('/donateCredits', VerifyIdentity,HomeController.donateCredits);
router.post('/followUser', VerifyIdentity,UserController.followUser)
router.post('/withdrawRequest', VerifyIdentity,HomeController.withdrawRequest);
router.put('/favoritePub', VerifyIdentity,HomeController.favoritePub);
router.put('/likePub', VerifyIdentity,HomeController.likePub);
router.get('/checkLikeFavorite/:pubId/:userId', HomeController.checkLikeFavorite);
router.get('/getFollows/:userId', HomeController.getFollows);
router.get('/verifyFollow/:userId/:followingId', UserController.verifyFollow)
router.get('/verifyActiveNotifications/:userId', UserController.verifyActiveNotifications);

router.get('/getByUsername/:username', UserController.getByUsername);
router.put('/updateUserInfo', VerifyIdentity, UserController.updateUserInfo);
router.put('/updatePass', VerifyIdentity, UserController.updatePass);
router.put('/updatePhotoProfile', VerifyIdentity,UserController.updatePhotoProfile)
router.put('/updateIdeaPhoto', VerifyIdentity,HomeController.updateIdeaPhoto)
router.put('/updateInfo', VerifyIdentity,UserController.updateInfo)
router.post('/updateInfoToken', VerifyIdentity, UserController.updateInfoCode);
router.put('/updateNotifications', VerifyIdentity, UserController.updateNotifications)
router.put('/disableIdea', AdminAuth, HomeController.disableIdea);
router.put('/releaseIdea', AdminAuth, HomeController.releaseIdea);
router.put('/withdrawstatus', AdminAuth, HomeController.withdrawStatus);
router.put('/changeUsername', VerifyIdentity, UserController.changeUsername);
router.put('/updatePersonalCode', VerifyIdentity, UserController.updatePersonalCode);


//MUSCLEPOINTS API

//TODO: colocar verificação de identidade na porra toda

router.post('/musclePointsToken', VerifyIdentity, MusclePointsController.createToken);
router.post('/validateToken', VerifyIdentity,MusclePointsController.validateToken)
router.get('/getTokens',AdminAuth,MusclePointsController.getTokens );
router.get('/getTokenRelation/:userId',MusclePointsController.getTokenRelation);
router.get('/getTokenByUserId/:userId', MusclePointsController.getTokenByUserId);
router.get('/validateTokenLogin/:userId/:supplierId?', MusclePointsController.validateTokenLogin);
router.get('/getTrainLog/:userId', MusclePointsController.getTrainLog);
router.get('/verifyIfIsExpiringToken', MusclePointsController.verifyIfIsExpiringToken);
router.put('/trainLog', VerifyIdentity, MusclePointsController.updateTrainLog)
router.put('/freezyToken', VerifyIdentity, MusclePointsController.freezyToken);
router.put('/extendTokenTime', VerifyIdentity, MusclePointsController.extendTokenTime);
router.put('/updateTokenPrice', VerifyIdentity, MusclePointsController.updateTokenPrice);
router.put('/payBilling', VerifyIdentity, MusclePointsController.payBilling)
router.delete('/deleteToken/:userId/:tokenId', VerifyIdentity,MusclePointsController.deleteTokenById);

module.exports = router