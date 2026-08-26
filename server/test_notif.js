const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://harshanmalith:malitH%4006%40@projectcluster.xqkvoti.mongodb.net/curelink?retryWrites=true&w=majority&appName=ProjectCluster').then(async () => {
  const pharmacyService = require('./src/modules/pharmacies/pharmacy.service');
  const Pharmacy = require('./src/modules/pharmacies/pharmacy.model');
  const User = require('./src/modules/users/user.model');
  
  const pharmacy = await Pharmacy.findOne({ verificationStatus: { $ne: 'PENDING' } });
  if(!pharmacy) {
     console.log('No suitable pharmacy found');
     process.exit(0);
  }
  console.log('Testing with pharmacy:', pharmacy.name);
  
  try {
    await Pharmacy.updateOne({ _id: pharmacy._id }, { '$set': { verificationStatus: 'DRAFT' } });
    
    await pharmacyService.submitForVerification(pharmacy.ownerUserId);
    console.log('Submit successful!');
    
    const Notification = require('./src/modules/notifications/notification.model');
    const notifs = await Notification.find({ type: 'PHARMACY_SUBMITTED' }).sort({createdAt: -1}).limit(2);
    console.log('Notifications count:', notifs.length);
    console.log(JSON.stringify(notifs, null, 2));
  } catch(e) {
    console.error('Error during submit:', e);
  }
  process.exit(0);
});
