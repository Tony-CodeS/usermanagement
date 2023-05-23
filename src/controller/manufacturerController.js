const { compare } = require('bcrypt');
const {Admin, Manufacturer, Distributor, SubDistributor, Tabbatar} = require('../model/adminSchema')
const mongoose = require('mongoose');
// const {Manufacturer} = require('../model/manufacturerSchema')


exports.addAdmin = async (req, res)=>{
 const  {email, password}  = req.body
 try{
    const newAdmin = await Admin.create({email, password})
    res.status(200).send({
        date:newAdmin
    })
 }catch(err){
    console.log(`${err.message}`)
 }
}



exports.addManufacturer = async (req, res) => {
  try {
    const { email, organization, Business_Reg, Products, industry, Branches, address, password } = req.body;
    // const adminId = req.params.adminId;
    // const admin = await Admin.findById(adminId);

    // if (!admin) {
    //   return res.status(404).json({ message: 'Admin not found' });
    // }

    const newManufacturer = new Tabbatar ({
      email: email,
      organization:organization,
      Business_Reg: Business_Reg,
      Products: Products,
      industry: industry,
      Branches: Branches,
      address: address,
      password: password,
      // admin: admin._id,
    });

    // console.log(admin._id)

    await newManufacturer.save();
    // admin.manufacturers.push(newManufacturer);
    // await admin.save();

    res.status(200).send({
      data: newManufacturer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error creating manufacturer' });
  }
};




exports.getallManufacturers = async (req, res) =>{

    try{
        const manufacturer = await Tabbatar.find({})
    if (!manufacturer) return ('only admins are allowed to get manaufacturers')
    res.status(200).send({manufacturer})
    } catch(err){
        console.log(err)
    }
}







exports.getManufacturer = async (req, res) => {
  try {

    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) return res.status(404).send({ message: 'Manufacturer not found' });
    res.status(200).send({ manufacturer });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'Error retrieving manufacturer' });
      }
      };




exports.removeManufacturer = async (req, res) => {
  try {
    const manufacturerId = req.params.manufacturerId;

    // Delete the manufacturer
    const deletedManufacturer = await Manufacturer.findByIdAndDelete(manufacturerId);

    if (!deletedManufacturer) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }



    console.log(deletedManufacturer)
    // Find the distributors associated with the manufacturer
    const distributors = await Distributor.find({ manufacturer: manufacturerId });

    distributors.manufacturer.pull(deletedManufacturer._id)

    // Delete the associated subdistributors for each distributor
    // for (const distributor of distributors) {
    //   await SubDistributor.deleteMany({ _id: { $in: distributor.subDistributors } });
    // }

    // Delete the associated distributors
    // await Distributor.deleteMany({ manufacturer: manufacturerId });

    // Remove the manufacturer from the admin's array
    const adminId = req.params.adminId;
    const admin = await Admin.findById(adminId);
    admin.manufacturers.pull(deletedManufacturer._id);
    await admin.save();

    res.status(200).json({
      type: 'Success',
      msg: 'Manufacturer, associated distributors, and subdistributors deleted successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred while deleting the manufacturer',
    });
  }
};




exports.addDistributor = async (req, res) => {
  try {
    const manufacturerId = req.params.manufacturerId;
    const { email, address, password, NinNumber, Branches } = req.body;

    const manufacturer = await Manufacturer.findById(manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }

    const newDistributor = new Distributor({
      email: email,
      address: address,
      password: password,
      NinNumber: NinNumber,
      Branches: Branches,
      manufacturerUnder: manufacturer.name,
      manufacturer: manufacturer._id,
    });

    await newDistributor.save();

    manufacturer.distributors.push(newDistributor._id);
    await manufacturer.save();

    res.status(200).send({
      data: newDistributor,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred while adding the distributor',
    });
  }
};


exports.addOldDistributor = async (req, res) => {
  try {
    const manufacturerId = req.params.manufacturerId;
    const { email } = req.body;
    const mainDistributor = await Tabbatar.findById(manufacturerId);

    if (!mainDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }

    const newDistributor = await Tabbatar.findOne({ email });
    if (!newDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'User not found',
      });
    }

    mainDistributor.isDistributor.push(newDistributor._id);
    newDistributor.isManufacturer.push(mainDistributor._id);

    await mainDistributor.save();
    await newDistributor.save();

    res.status(200).json({
      type: 'Success',
      msg: 'Distributor is now updated',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred',
    });
  }
};


exports.getAllDistributors = async (req, res) =>{
  try{
    const allDistributors = await Distributor.find()
    console.log(allDistributors)
    res.status(200).send({
      distributors:allDistributors
    })
  } catch(err){
    console.log(`${err.message}`)
  }
}



exports.getDistributor = async(req, res)=>{
  try{
    const distributor = await Distributor.findById(req.params.id)
    if(!distributor){
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Distributor not found',
        });
        }
        res.status(200).send({
          distributor: distributor
        })}
        catch(err){
          console.log(`${err.message}`)
          }
}









exports.removeDistributor = async (req, res) => {
  const manufacturerId = req.params.manufacturerId;
  const distributorId = req.params.distributorId.trim();

  try {
    const manufacturer = await Manufacturer.findById(manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({
        type: "Not Found",
        msg: "Manufacturer not found",
      });
    }

    const distributorIndex = manufacturer.distributors.findIndex(
      (distributor) => distributor._id === distributorId
    );

    if (distributorIndex === 1) {
      return res.status(404).json({
        type: "Not Found",
        msg: "Distributor not found",
      });
    }

    const removedDistributor = await Distributor.findById(distributorId);
    if (!removedDistributor) {
      return res.status(404).json({
        type: "Not Found",
        msg: "Distributor not found",
      });
    }

    manufacturer.distributors.splice(distributorIndex, 1);
    await manufacturer.save();

    // Delete the distributor document itself
    await Distributor.findByIdAndDelete(distributorId);

    // Find the subdistributors associated with the removed distributor
    const subdistributors = removedDistributor.subDistributors;

    // Delete each subdistributor document
    for (const subdistributor of subdistributors) {
      const subdistributorId = subdistributor._id;
      await SubDistributor.findByIdAndDelete(subdistributorId);
    }

    res.status(200).json({
      type: "Success",
      msg: "Distributor and associated subdistributors removed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "Server Error",
      msg: `${error.message}`,
    });
  }
};

















exports.addSubDistributor = async (req, res) => {
  try {
    const distributorId = req.params.distributorId;
    const { email, address, password, NinNumber, Branches } = req.body;

    const distributor = await Distributor.findById(distributorId);
    if (!distributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Distributor not found',
      });
    }

    console.log(distributor);

    // Find the manufacturer associated with the distributor
    const manufacturer = await Manufacturer.findOne({ distributors: distributorId });
    if (!manufacturer) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }

    console.log(manufacturer);

    // Create a new subdistributor object
    const newSubDistributor = new SubDistributor({
      email:email,
      address:address,
      password:password,
      NinNumber:NinNumber,
      Branches:Branches,
      manufacturer: manufacturer._id,

    });

    // Save the new subdistributor to the database
    await newSubDistributor.save();

    // Push the new subdistributor to the distributor's subDistributors array
    distributor.subDistributors.push(newSubDistributor);

    // Save the changes to the distributor and manufacturer documents
    await Promise.all([distributor.save(), manufacturer.save()]);

    res.status(200).send({
      data: newSubDistributor,
    });
  } catch (err) {
    console.log(`${err.message}`);
  }
};




exports.getAllSubDistributors = async (req, res) =>{
    try{
  const subDistributor = await SubDistributor.find({})
  if (!subDistributor) return ('only admins are allowed to get manaufacturers')
  res.status(200).send({subDistributor})
  } catch(err){
      console.log(err)
  }

}


exports.deleteSubDistributor = async (req, res) =>{
  const distributorId = req.params.distributorId
  const subDistributorId = req.params.subDistributorId
  
  try{
    const distributor = await Distributor.findById(distributorId)
    if (!distributor) return ('You cannot delete subdistributors')
   
    const subdistributorIndex = distributor.subDistributors.findIndex(
      (subdistributor) => subdistributor._id === subDistributorId
    );

    if (subdistributorIndex === 1) {
      return res.status(404).json({
        type: "Not Found",
        msg: "Distributor not found",
      });
    }

   distributor.subDistributors.splice(subdistributorIndex, 1);

   await distributor.save()

    const removeSubDistributor = await SubDistributor.findByIdAndDelete(subDistributorId)
    if (!removeSubDistributor) return ('can not find subdistributors')
    res.status(200).send({message:'sub distributor deleted'})
    } catch(err){
      console.log(err)
    }
}


exports.getNewDistributors = async (req, res) => {
  try {
    const userId = req.params.manufacturerId;
    const mainDistributor = await Tabbatar.findById(userId);

    if (!mainDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }

    const distributorIds = mainDistributor.isDistributor;
    const distributors = await Tabbatar.find({ _id: { $in: distributorIds } });

    res.status(200).json({
      type: 'Success',
      msg: 'List of distributors',
      data: distributors,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred',
    });
  }
};


exports.getNewManufacturer = async (req, res) => {
  try {
    const userId = req.params.userId;
    const mainDistributor = await Tabbatar.findById(userId);

    if (!mainDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Manufacturer not found',
      });
    }

    const manufacturerIds = mainDistributor.isDistributor;
    const manufacturer = await Tabbatar.find({ _id: { $in: manufacturerIds } });

    res.status(200).json({
      type: 'Success',
      msg: 'List of distributors',
      data: manufacturer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred',
    });
  }
};
