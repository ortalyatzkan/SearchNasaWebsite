var express = require('express');
var router = express.Router();

const db = require('../models'); //contain the models
//delete all the saved images----------------------------------------------------------------
router.delete('/nasaPage/deleteImages', (req,res) => {
    if(req.session.logIn===false)
        throw res.status(404).send()
        db.MarsImages.destroy({
        where: {},
        truncate: true
    })
});
//delete single image------------------------------------------------------------------------
router.delete('/nasaPage/deleteSavedImage', (req,res) => {
    if(req.session.logIn===false) {
        throw res.status(404).send()
    }
    const url = req.body.url.trim();
    const email=req.session.email.trim();
    return db.MarsImages.findOne( {where:{url: url,email:email}})
        .then((contact) => contact.destroy({ force: true }))
        .then(() => res.send({ url}))
        .catch((err) => {
            console.log('***Error deleting contact', JSON.stringify(err))
            res.status(400).send(err)
        })

});

router.post('/nasaPage/getSavedImages', (req, res) => {
    return db.MarsImages.findAll({where: {email: req.session.email}})
        .then((images) => res.send(images))
        .catch((err)=>{
            console.log('There was an error querying contacts', JSON.stringify(err))
            return res.send(err)
        });
});

router.post('/nasaPage/saveImage', (req,res)=>{
    if(req.session.logIn===false)
        throw res.status(404).send()

    db.MarsImages.findOrCreate(
        {where:{url:req.body.imageLink.trim(), email:req.session.email.trim()},
            defaults: {sol:req.body.solDate.trim(),
                earthDate:req.body.earthDate.trim(),
                camera:req.body.nameCamera.trim(),
                imageId:req.body.id.trim()

            }
        })
        .then((created) => {
            if(created[1]) {
                return res.status(200).send('saved');
            }
            else
                return res.status(304).send('exists');
        }).catch((err) => {
        console.log('*** error creating a contact', JSON.stringify(err))
        return res.status(400).send(err)
    });

});

module.exports = router;