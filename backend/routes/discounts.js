// Importing Modules
const express = require("express");
var jwt = require('jsonwebtoken');
require('dotenv').config();



// Secret Key for Token Generation
const secretKey = process.env.secret_key;


// Importing Custom Modules
const { UsersModel } = require("../models/users");
const { DiscountModel } = require("../models/discount");
const { AdminModel } = require("../models/admin");

// Separating Routes
const discountRoute = express.Router();


// Middlewares
discountRoute.use(express.json());


// For Users
// GET Discount Route
discountRoute.get("/", async (req, res) => {
    let { username, name } = req.headers;
    try {
        let data = await UsersModel.find({ "username": username });
        if (data.length == 1) {
            let disc = await DiscountModel.find({ "name": name })
            if (disc.length != 0) {
                res.send([{ "message": "Discount Applied" }, disc])
            } else {
                res.send([{ "message": "Coupon Not Valid" }]);
            }
        } else {
            res.send([{ "message": "Login First" }])
        }
    } catch (error) {
        res.send([{ "message": "Something Went Wrong" }]);
    }
});


// For Admin
// Add Discount Route
discountRoute.post("/add", async (req, res) => {
    let token = req.headers.authorization;
    let { name, price } = req.body;
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (decoded) {
            let data = await AdminModel.find({ "email": decoded.email });
            if (data.length == 1) {
                if (decoded.mobile == data[0].mobile && decoded.password == data[0].password) {
                    let addDiscount = new DiscountModel({ "name": name, "price": price });
                    await addDiscount.save();
                    res.send([{"message": "Discount Added"},addDiscount]);
                } else {
                    res.send([{ "message": "Not Authorized" }]);
                }
            }
        } else {
            res.send([{ "message": "Not Authorized" }]);
        }
    })
})


module.exports = { discountRoute };