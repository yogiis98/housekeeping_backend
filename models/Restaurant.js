var mongo = require("mongodb");
const bcrypt = require("bcryptjs");
const { to } = require("../services/util.service");
const db = require("../db").getDb();
const { ucwords } = require("../helpers/basicFunc");

// To-Do
// Mobile and social Indexes
//

// ensure if index available before anything
(() => {
    db.db()
        .collection("restaurants")
        .createIndex({ email: 1 }, { unique: true, name: "email" });
})();

const emailSignup = async restaurant => {
    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) return Promise.reject(err);
    [err, restaurant.password] = await to(bcrypt.hash(restaurant.password, salt));
    if (err) return Promise.reject(err);

    let randomImages = [
        "https://i.ibb.co/C6QSFK8/food-img-1.jpg",
        "https://i.ibb.co/DpRyQbV/food-img-2.jpg",
        "https://i.ibb.co/HXxPXHN/food-img-3.jpg",
        "https://media-cdn.tripadvisor.com/media/photo-s/0e/cc/0a/dc/restaurant-chocolat.jpg"
      ];
      let randImage = randomImages[Math.floor(Math.random() * randomImages.length)];

    let newRestaurant = {
        ...restaurant,
        imageUrl:randImage,
        latitude: 28.4900591,
        longitude: 77.3066401,
        attributes: ["north indian", "Fast food"],
        opensAt: "11:00",
        closesAt: "22:00",
        is_verified: true,
        accepting_orders: true,
        onboarding_required: true
    };
    let newMenu = {
        items: []
    };
    try {
        let savedMenu = await db
            .db()
            .collection("menus")
            .insertOne(newMenu);
        savedMenu = savedMenu.ops[0];

        newRestaurant = { ...newRestaurant, menuId: savedMenu._id };

        let savedRestaurant = await db
            .db()
            .collection("restaurants")
            .insertOne(newRestaurant);
        savedRestaurant = savedRestaurant.ops[0];
        return Promise.resolve(savedRestaurant);
    } catch (err) {
        if (err.code === 11000) {
            await db
                .db()
                .collection("menus")
                .deleteOne({ _id: newRestaurant.menuId });
        }
        return Promise.reject(err);
    }
};

const findByEmail = async email => {
    [err, restaurant] = await to(
        db
            .db()
            .collection("restaurants")
            .findOne({ email })
    );
    if (err) return Promise.reject(err);
    return Promise.resolve(restaurant);
};
const findById = async id => {
    [err, restaurant] = await to(
        db
            .db()
            .collection("restaurants")
            .findOne({ _id: new mongo.ObjectID(id) })
    );
    if (err) return Promise.reject(err);
    return Promise.resolve(restaurant);
};

const update = async (filter = {}, updates = {}) => {
    try {
        let savedRestaurant = await db
            .db()
            .collection("restaurants")
            .findOneAndUpdate(filter, { $set: updates }, { returnOriginal: false });
        return Promise.resolve(savedRestaurant.value);
    } catch (err) {
        return Promise.reject(err);
    }
};
const insertMenuItem = async newItem => {
    try {
        let saveditem = await db
            .db()
            .collection("items")
            .insertOne(newItem);
        saveditem = saveditem.ops[0];
        return Promise.resolve(saveditem);
    } catch (err) {
        return Promise.reject(err);
    }
};
const getMenuItems = async restaurantId => {
    try {
        // items = await db.db().collection('items').find({restaurantId}).toArray();
        items = await db
            .db()
            .collection("items")
            .aggregate([
                {
                    $match: {
                        restaurantId: restaurantId
                    }
                },
                {
                    $project: {
                        restaurantId: 0,
                        description: 0,
                        prepration_time: 0,
                        attributes: 0
                    }
                }
            ])
            .toArray();
        return Promise.resolve(items);
    } catch (err) {
        return Promise.reject(err);
    }
};

const getMenuItem = async (itemId, restaurantId) => {
    try {
        let item = await db
            .db()
            .collection("items")
            .findOne({ _id: new mongo.ObjectID(itemId), restaurantId });
        return Promise.resolve(item);
    } catch (err) {
        return Promise.reject(err);
    }
};

const updateMenuItem = async (itemId, restaurantId, updates) => {
    try {
        let savedItem = await db
            .db()
            .collection("items")
            .findOneAndUpdate(
                { _id: new mongo.ObjectID(itemId), restaurantId },
                { $set: updates },
                { returnOriginal: false }
            );
        return Promise.resolve(savedItem.value);
    } catch (err) {
        return Promise.reject(err);
    }
};

const deleteMenuItem = async (itemId, restaurantId) => {
    try {
        let deletedItem = await db
            .db()
            .collection("items")
            .findOneAndDelete({ _id: new mongo.ObjectID(itemId), restaurantId });
        deletedItem = deletedItem.value;
        return Promise.resolve(deletedItem);
    } catch (err) {
        return Promise.reject(err);
    }
};

// Related to orders
const findItemsinMenuByIds = async (restaurantId, itemsArray) => {
    try {
        let items = await db
            .db()
            .collection("items")
            .aggregate([
                {
                    $match: {
                        restaurantId: restaurantId,
                        is_available: true,
                        _id: {
                            $in: itemsArray
                        }
                    }
                },
                {
                    $project: {
                        restaurantId: 0,
                        description: 0,
                        attributes: 0,
                        is_available: 0
                    }
                }
            ])
            .toArray();
        return Promise.resolve(items);
    } catch(err) {
        return Promise.reject(err);
    }
};

const addOrder = async order => {
    try {
        let savedOrder = await db
            .db()
            .collection("orders")
            .insertOne(order);
        savedOrder = savedOrder.ops[0];
        return Promise.resolve(savedOrder);
    } catch (err) {
        return Promise.reject(err);
    }
};
const updateOrderStatus = async (orderId, restaurantId, updates, type = null) => {
    if (type == "ACCEPT") {
        try {
            let savedOrder = await db.db().collection("orders").findOneAndUpdate(
                {
                    _id: new mongo.ObjectID(orderId),
                    restaurantId,
                    status: {
                        $in: ['PENDING']
                    }
                },
                { $set: updates },
                { returnOriginal: false }
            );
            return Promise.resolve(savedOrder.value);
        } catch (err) {
            return Promise.reject(err);
        }
    } else if (type == "REJECT") {
        try {
            let savedOrder = await db.db().collection("orders").findOneAndUpdate(
                {
                    _id: new mongo.ObjectID(orderId),
                    restaurantId,
                    status: {
                        $nin: ['DISPATCHED', 'REJECTED', 'CANCELLED']
                    }
                },
                { $set: updates },
                { returnOriginal: false }
            );
            return Promise.resolve(savedOrder.value);
        } catch (err) {
            return Promise.reject(err);
        }
    } else if (type == "STATUS") {
        try {
            let savedOrder = await db.db().collection("orders").findOneAndUpdate(
                {
                    _id: new mongo.ObjectID(orderId),
                    restaurantId,
                    status: {
                        $nin: ['REJECTED', 'CANCELLED', 'PENDING']
                    }
                },
                { $set: updates },
                { returnOriginal: false }
            );
            return Promise.resolve(savedOrder.value);
        } catch (err) {
            return Promise.reject(err);
        }
    } else if (type == "CANCEL") {
        try {
            let savedOrder = await db.db().collection("orders").findOneAndUpdate(
                {
                    _id: new mongo.ObjectID(orderId),
                    status: {
                        $nin: ['REJECTED', 'CANCELLED']
                    }
                },
                { $set: updates },
                { returnOriginal: false }
            );
            return Promise.resolve(savedOrder.value);
        } catch (err) {
            return Promise.reject(err);
        }
    } else {
        Promise.reject();
    }
};

const getOrders = async (restaurantId, filter = {}) => {
    if (filter.in != null) {
        try {
            let orders = await db
                .db()
                .collection("orders")
                .aggregate([
                    {
                        $match: {
                            restaurantId: restaurantId,
                            status: {
                                $in: filter.in
                            }
                        }
                    },
                    {
                        $project: {
                            restaurantId: 0,
                            description: 0,
                            attributes: 0,
                            is_available: 0
                        }
                    },
                    {
                        $sort:{_id:-1}
                    }
                ])
                .toArray();
            return Promise.resolve(orders);
        } catch(err) {
            return Promise.reject(err);
        }
    }else{
        try {
            let orders = await db
                .db()
                .collection("orders")
                .aggregate([
                    {
                        $match: {
                            restaurantId: restaurantId
                        }
                    },
                    {
                        $project: {
                            restaurantId: 0,
                            description: 0,
                            attributes: 0,
                            is_available: 0
                        }
                    },
                    {
                        $sort:{_id:-1}
                    }
                ])
                .toArray();
            return Promise.resolve(orders);
        } catch(err) {
            return Promise.reject(err);
        }
    }
};

// these functions are mainly for user clients for demo purpose
const findAllRestaurant = async ()=>{
            try {
                let restaurants = await db
                    .db()
                    .collection("restaurants")
                    .aggregate([
                        {
                            $match: {
                                is_verified:true,
                                onboarding_required:false
                            }
                        },
                        {
                            $project: {
                                password: 0,
                                email: 0,
                                onboarding_required: 0,
                                is_verified: 0,
                                menuId:0,
                                fcm_token:0
                            }
                        },
                        {
                            $sort:{accepting_orders:-1,_id:1}
                        },{
                             $limit : 20
                        }
                    ])
                    .toArray();
                return Promise.resolve(restaurants);
            } catch(err) {
                return Promise.reject(err);
            }
}

const GetRestaurantMenu = async (restaurantId)=>{
    try {
        let items = await db
            .db()
            .collection("items")
            .aggregate([
                {
                    $match: {
                        restaurantId
                    }
                },
                {
                    $sort:{is_available:-1,_id:1}
                }
            ])
            .toArray();
        return Promise.resolve(items);
    } catch(err) {
        return Promise.reject(err);
    }
}

const getOrder = async (orderId)=>{
    [err, order] = await to(
        db
            .db()
            .collection("orders")
            .findOne({ _id: new mongo.ObjectID(orderId) })
    );
    if (err) return Promise.reject(err);
    return Promise.resolve(order);
}


module.exports = {
    emailSignup,
    findByEmail,
    findById,
    update,
    insertMenuItem,
    getMenuItems,
    getMenuItem,
    updateMenuItem,
    deleteMenuItem,
    findItemsinMenuByIds,
    addOrder,
    updateOrderStatus,
    getOrders,
    findAllRestaurant,
    GetRestaurantMenu,
    getOrder
};
