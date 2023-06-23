const { User } = require('../model/Schema')

exports.getSingleUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(400).send({
      success: false,
      message: 'User does not exist'
    })

    delete user._doc.password

    res.status(200).send({
      success: true,
      data: {
        user: user
      }
    })

  } catch (err) {
    console.error(err.message)
  }
}

exports.addDistributor = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { email } = req.body;
    const mainDistributor = await User.findById(userId);

    if (!mainDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'User not found',
      });
    }

    const newDistributor = await User.findOne({ email });
    if (!newDistributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Organization not found',
      });
    }

    if (mainDistributor.Distributor.includes(newDistributor._id)) {
      return res.status(400).json({
        type: 'Bad Request',
        msg: 'Distributor already exists',
      });
    }

    if (newDistributor.Manufacturer.includes(mainDistributor._id)) {
      return res.status(400).json({
        type: 'Bad Request',
        msg: 'Main distributor already exists in the new distributor\'s list',
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
    console.error(err);
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
        msg: 'User not found',
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({
      type: 'Internal Server Error',
      msg: 'An error occurred',
    });
  }
};


exports.removeDistributor = async (req, res) => {
  try {
    const manufacturerId = req.params.userId;
    const distributorId = req.params.distributorId;

    const manufacturer = await User.findById(manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'USer not found',
      });
    }

    const distributor = await User.findById(distributorId);
    if (!distributor) {
      return res.status(404).json({
        type: 'Not Found',
        msg: 'Distributor not found',
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
      msg: `Distributor removed from the Distributors List and Manufacturer removed from the Manufacturers List`,
    });
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    const existingBranch = user.branches.find((branch) => branch.name === name);
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
    console.error(err);
    res.status(500).json({
      type: 'Error',
      msg: 'Internal Server Error',
    });
  }
};

exports.getallbranches = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) return res.status(400).send({
      message: 'User not found',
      status: false
    })

    res.status(200).send({
      message: 'all branches',
      data: {
        branches: user.branches
      },
      status: true
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      type: 'Error',
      msg: 'Internal Server Error',
    });
  }
}


exports.getallProducts = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) return res.status(400).send({
      message: 'User not found',
      status: false
    })

    res.status(200).send({
      message: 'all branches',
      data: {
        products: user.products
      },
      status: true
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      type: 'Error',
      msg: 'Internal Server Error',
    });
  }
}


exports.getDistributorDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const distributorId = req.params.distributorId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const distributor = user.Distributor.find((d) => d.equals(distributorId));

    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    const distributorDetail = await User.findById(distributorId)
    if (!distributorDetail) return res.status(400).send({
      success: false,
      msg: "No such Distributor"
    })

    delete distributorDetail._doc.password
    delete distributorDetail._doc.Distributor
    delete distributorDetail._doc.Manufacturer

    res.status(200).json({
      success: 'Distributor Details',
      data: distributorDetail
    });


  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getManufacturerDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const manufacturerId = req.params.manufacturerId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const manufacturer = user.Manufacturer.find((d) => d.equals(manufacturerId));

    if (!manufacturer) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    const manufacturerDetail = await User.findById(manufacturerId)
    if (!manufacturerDetail) return res.status(400).send({
      success: false,
      msg: "No such Distributor"
    })

    delete manufacturerDetail._doc.password
    delete manufacturerDetail._doc.Distributor
    delete manufacturerDetail._doc.Manufacturer

    res.status(200).json({
      success: 'Distributor Details',
      data: manufacturerDetail
    });


  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

  // account type flag
  // brand ownwers and distributors
  //
