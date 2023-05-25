const {Admin,User} = require('../model/Schema')


exports.addDistributor = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { email } = req.body;
      const mainDistributor = await User.findById(userId);
  
      if (!mainDistributor) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'user not found',
        });
      }
  
      const newDistributor = await User.findOne({ email });
      if (!newDistributor) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'distributor not found',
        });
      }
  
      mainDistributor.Distributor.push(newDistributor._id);
      newDistributor.Manufacturer.push(mainDistributor._id);
  
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


  exports.getDistributors = async (req, res) => {
    try {
      const userId = req.params.userId;
      const mainDistributor = await User.findById(userId);
  
      if (!mainDistributor) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Manufacturer not found',
        });
      }
  
      const distributorIds = mainDistributor.Distributor;
      const distributors = await User.find({ _id: { $in: distributorIds } }).select("-password -otp");
  
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


  exports.getManufacturer = async (req, res) => {
    try {
      const userId = req.params.userId;
      const mainDistributor = await User.findById(userId);
  
      if (!mainDistributor) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Manufacturer not found',
        });
      }
  
      const manufacturerIds = mainDistributor.Manufacturer;
      const manufacturer = await User.find({ _id: { $in: manufacturerIds } });
  
      res.status(200).json({
        type: 'Success',
        msg: 'List of manufacturer',
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


  exports.removeDistributor = async (req, res) => {
    try {
      const manufacturerId = req.params.manufacturerId;
      const distributorId = req.params.distributorId;
  
      const manufacturer = await User.findById(manufacturerId);
      const distributor = await User.findById(distributorId);
  
      if (!manufacturer || !distributor) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Manufacturer or Distributor not found',
        });
      }
  
      // Remove distributor from the isDistributor array of the manufacturer
      const distributorIndex = manufacturer.Distributor.indexOf(distributorId);
      if (distributorIndex !== -1) {
        manufacturer.Distributor.splice(distributorIndex, 1);
        await manufacturer.save();
      }
  
      // Remove manufacturer from the isManufacturer array of the distributor
      const manufacturerIndex = distributor.Manufacturer.indexOf(manufacturerId);
      if (manufacturerIndex !== -1) {
        distributor.Manufacturer.splice(manufacturerIndex, 1);
        await distributor.save();
      }
  
      res.status(200).json({
        type: 'Success',
        msg: 'Distributor removed from the isDistributor array and Manufacturer removed from the isManufacturer array',
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        type: 'Internal Server Error',
        msg: 'An error occurred',
      });
    }
  };

  exports.addProduct = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { name } = req.body; // Assuming the product name is provided in the request body
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'User not found',
        });
      }
  
      // Check if the product already exists in the user's Products array
      const existingProduct = user.products.find((product) => product.name === name);
      if (existingProduct) {
        return res.status(400).json({
          type: 'Bad Request',
          msg: 'Product already exists in the user product array',
        });
      }
  
      // Create a new product object
      const newProduct = { name };
      user.products.push(newProduct);
      await user.save();
  
      res.status(200).json({
        type: 'Success',
        msg: 'Product added to the user product array',
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        type: 'Error',
        msg: 'Internal Server Error',
      });
    }
  };
  
  exports.removeProduct = async (req, res) => {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId; // Assuming the product ID is provided in the request params
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'User not found',
        });
      }
  
      // Check if the product exists in the user's Products array
      const existingProductIndex = user.products.findIndex((product) => product._id.toString() === productId);
      if (existingProductIndex === -1) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Product not found in the user product array',
        });
      }
  
      // Remove the product from the Products array
      user.products.splice(existingProductIndex, 1);
      await user.save();
  
      res.status(200).json({
        type: 'Success',
        msg: 'Product removed from the user product array',
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        type: 'Error',
        msg: 'Internal Server Error',
      });
    }
  };


  exports.addBranch = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { name } = req.body; // Assuming the product name is provided in the request body
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'User not found',
        });
      }
  
      // Check if the product already exists in the user's Products array
      const existingBranch= user.branches.find((branch) => branch.name === name);
      if (existingBranch) {
        return res.status(400).json({
          type: 'Bad Request',
          msg: 'the branch already exists',
        });
      }
  
      // Create a new product object
      const newBranch = { name };
      user.branches.push(newBranch);
      await user.save();
  
      res.status(200).json({
        type: 'Success',
        msg: 'a new branch has been added to the user branches',
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        type: 'Error',
        msg: 'Internal Server Error',
      });
    }
  };
  

  exports.removeBranch = async (req, res) => {
    try {
      const userId = req.params.userId;
      const branchId = req.params.branchId; // Assuming the product ID is provided in the request params
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'User not found',
        });
      }
  
      // Check if the product exists in the user's Products array
      const existingBranchIndex = user.branches.findIndex((branch) => branch._id.toString() === branchId);
      if (existingBranchIndex === -1) {
        return res.status(404).json({
          type: 'Not Found',
          msg: 'Branch not found in the user branches ',
        });
      }
  
      // Remove the product from the Products array
      user.branches.splice(existingBranchIndex, 1);
      await user.save();
  
      res.status(200).json({
        type: 'Success',
        msg: 'Branch removed from the user branches array',
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        type: 'Error',
        msg: 'Internal Server Error',
      });
    }
  };

  