const bcrypt = require('bcrypt');
const Customer = require('../models/customerSchema.js');
const { createNewToken } = require('../utils/token.js');
const sendOtp = require('../service/sendOtp.js');

const customerRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const customer = new Customer({
            ...req.body,
            password: hashedPass// hashed password
        });

        const existingcustomerByEmail = await Customer.findOne({ email: req.body.email });// existing customer by email

        if (existingcustomerByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await customer.save();
            result.password = undefined;
            
            const token = createNewToken(result._id)

            result = {
                ...result._doc,
                token: token
            };

            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const customerLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let customer = await Customer.findOne({ email: req.body.email });
        if (customer) {
            const validated = await bcrypt.compare(req.body.password, customer.password);
            if (validated) {
                customer.password = undefined;

                const token = createNewToken(customer._id)

                customer = {
                    ...customer._doc,
                    token: token
                };

                res.send(customer);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getCartDetail = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id)
        if (customer) {
            res.send(customer.cartDetails);
        }
        else {
            res.send({ message: "No customer found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const cartUpdate = async (req, res) => {
    try {

        let customer = await Customer.findByIdAndUpdate(req.params.id, req.body,
            { new: true })

        return res.send(customer.cartDetails);

    } catch (err) {
        res.status(500).json(err);
    }
}

const forgotPassword = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'Phone number is required'
        });
    }

    try {
        const user = await Customer.findOne({ phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        const isSent = await sendOtp(phone, otp);

        if(!isSent){
            return res.status(500).json({
                success: false,
                message: 'Error sending OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
        
        }catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            
    }
    };

const resetPassword = async (req, res) => {
    const { phone, otp, password } = req.body;

  if (!phone || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // Otp to integer
    const otpToInteger = parseInt(otp);

    if (user.resetPasswordOTP !== otpToInteger) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
module.exports = {
    customerRegister,
    customerLogIn,
    getCartDetail,
    cartUpdate,
    forgotPassword,
    resetPasword: resetPassword,
};
