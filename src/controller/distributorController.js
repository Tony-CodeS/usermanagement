const {Admin, Manufacturer, Distributor, SubDistributor} = require('../model/adminSchema')


exports.addDistributor = async (req, res) => {
    try {
      const manufacturerId = req.params.manufacturerId;
      const { name } = req.body;
  
      const manufacturer = await Manufacturer.findById(manufacturerId);
      if (!manufacturer) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Manufacturer not found',
        });
      }
  
      console.log(manufacturer)
  
      
  
      const newDistributor = new Distributor({
        name: name,
        manufacturerUnder:manufacturer.name,
        manufacturer: manufacturer._id,
      });
  
        console.log(newDistributor)
  
      await newDistributor.save();
  
      manufacturer.distributors.push(newDistributor);
  
      console.log(manufacturer.distributors)
      await manufacturer.save();
  
      res.status(200).send({
        data: newDistributor,
      });
    } catch (err) {
      console.log(`${err.message}`);
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
  
  
  