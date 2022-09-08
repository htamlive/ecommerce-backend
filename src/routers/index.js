import { Router } from "express";
import OrderModel from "../models/Orders";
import ProductModel from "../models/Products";
import shortid from "shortid";
import blockchain from "../blockchain";
import configs from "../configs";
import { utils } from "near-api-js";
const router = Router();

router.get("/", (req, res) => {
    res.json({
        message: "Hello World"
    })
})

// create API -> always use try catch

//api get list
// add async to use await property
router.get("/products", async (req, res) => {
    try {
        let products = await ProductModel.find();
        res.json(products); 
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.get("/orders", async (req, res) => {
    try {
        let orders = await OrderModel.find();
        res.json(orders); 
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});


/**
 * {
 *  product: 63171ef66ab4e10a3b8876ca
 *  quantity: 2
 *  accountId: "htamlve.testnet"
 *  customer: {
 *  ///
 * }
 */
//order and put link for customer to pay, this function will put a link for customer and then they will go to that page to pay
router.post("/orders", async (req, res) => {
    try {
        let product = await ProductModel.findById(req.body.product);
        if(!product){
            throw Error("Product not found" + req.body.product);
        }

        let totalAmount = req.body.quantity * product.price;
        let order = new OrderModel({
            ...req.body,
            orderCode: shortid.generate(),
            totalAmount,
            paymentStatus: "PENDING",
        });

        await order.save();

        let networkConfig = configs.getConfig("testnet");


        let signUrl = await blockchain.getSignUrl(
            order.accountId,
            "pay_order",
            {
                order_id: order.id,
                order_amount: blockchain.parseNearAmount(totalAmount)
            },
            order.totalAmount,
            30000000000000,
            networkConfig.paymentContract,
            "",
            "http://localhost:3000/api/payment-noti?orderId=" + order.id,
            "testnet"
        )

        res.json({
            orderId: order.id,
            redirectUrl: signUrl
        });
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});

//API get info order
router.get("/orders/:orderId", async (req, res) => { 
    try {
        //use populate to get comprehensive info
        let order = await OrderModel.findById(req.params.orderId).populate("product");
        if(!order){
            throw Error("not found order id " + req.params.orderId);
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

//check status of payment
// return to our page
router.get("/payment-noti", async (req, res) => {
    try {
        let order = await OrderModel.findById(req.query.orderId);
        if(!order || !req.query.orderId){
            throw Error("not found order id " + req.query.orderId);
        }
        if(order.paymentStatus == "PAID") {
            return res.json(order);
        }

        try {
            let networkConfig = configs.getConfig("testnet");
            let orderDetail = await blockchain.view(networkConfig.paymentContract, "get_order",{
                order_id: order.id

            });
            if(orderDetail.is_completed && blockchain.parseNearAmount(order.totalAmount) == orderDetail.received_amount.toLocaleString("fullwide",{useGrouping:false})){
                order.paymentStatus = "PAID";
 
            } else {
                order.paymentStatus = "FAILED";
            }
            
        } catch (error) {
            order.paymentStatus = "FAILED";
        }
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});

// When call test call, the valiators will call each other to check aggreement before processing
router.get("/test-call", async (req, res) => {
    try{
        let order_id = req.query.orderId;
        let order = await blockchain.call(
            "uit-payment-contract.htamlive.testnet",
            "get_order",
            {
                order_id: order_id
            },
            0,
            30000000000000
        );
        res.json(order);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
})


export default router;