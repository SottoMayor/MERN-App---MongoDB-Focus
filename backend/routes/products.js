const Router = require('express').Router;

const router = Router();

const getDB = require('../database').getDB;
const mongodb = require('mongodb');
const Decimal128 = mongodb.Decimal128;
const ObjectID = mongodb.ObjectID;

const products = [
  {
    _id: 'fasdlk1j',
    name: 'Stylish Backpack',
    description:
      'A stylish backpack for the modern women or men. It easily fits all your stuff.',
    price: 79.99,
    image: 'http://localhost:3100/images/product-backpack.jpg'
  },
  {
    _id: 'asdgfs1',
    name: 'Lovely Earrings',
    description:
      "How could a man resist these lovely earrings? Right - he couldn't.",
    price: 129.59,
    image: 'http://localhost:3100/images/product-earrings.jpg'
  },
  {
    _id: 'askjll13',
    name: 'Working MacBook',
    description:
      'Yes, you got that right - this MacBook has the old, working keyboard. Time to get it!',
    price: 1799,
    image: 'http://localhost:3100/images/product-macbook.jpg'
  },
  {
    _id: 'sfhjk1lj21',
    name: 'Red Purse',
    description: 'A red purse. What is special about? It is red!',
    price: 159.89,
    image: 'http://localhost:3100/images/product-purse.jpg'
  },
  {
    _id: 'lkljlkk11',
    name: 'A T-Shirt',
    description:
      'Never be naked again! This T-Shirt can soon be yours. If you find that buy button.',
    price: 39.99,
    image: 'http://localhost:3100/images/product-shirt.jpg'
  },
  {
    _id: 'sajlfjal11',
    name: 'Cheap Watch',
    description: 'It actually is not cheap. But a watch!',
    price: 299.99,
    image: 'http://localhost:3100/images/product-watch.jpg'
  }
];

// Get list of products products
router.get('/', (req, res, next) => {
  // Return a list of dummy products
  // Later, this data will be fetched from MongoDB
  /*
  const queryPage = req.query.page;
  const pageSize = 5;
  let resultProducts = [...products];
  if (queryPage) {
    resultProducts = products.slice(
      (queryPage - 1) * pageSize,
      queryPage * pageSize
    );
  }
  */

  const db = getDB().db();
  db.collection('products').find().toArray()
  .then( resultProducts => {

    //converting Decimal 128 to string.
    resultProducts.map( obj => {
      return obj.price = obj.price.toString();
    })

    res.status(200).json(resultProducts);
  })
  .catch(err => {
    console.log(err);
    res.status.json({message: 'Something went wrong with the database!'})
  })

  
});

// Get single product
router.get('/:id', (req, res, next) => {
  const productId = req.params.id;
  
  const db = getDB().db();
  db.collection('products').findOne({_id: ObjectID(productId)})
  .then( productDoc => {
    if(!productDoc){
      throw new Error("This product doesn't exist!")
    }

    //converting 128 Decimal to string
    productDoc.price = productDoc.price.toString();

    res.status(200).json(productDoc); 

  })
  .catch( err => {
    console.log(err);
    res.status(500).json('Something went wrong with the database!');
  })

});

// Add new product
// Requires logged in user
router.post('', (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };

  const db = getDB().db();
  db.collection('products').insertOne(newProduct)
  .then( result => {
    //console.log(result);
    res.status(201).json({ message: 'Product added', productId: ObjectID(result.insertedId) });
  })
  .catch( err => {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong with the database!' });
  })

  
});

// Edit existing product
// Requires logged in user
router.patch('/:id', (req, res, next) => {
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };

  const productId = req.params.id;

  const db = getDB().db()
  db.collection('products').updateOne({_id: ObjectID(productId)}, {$set: updatedProduct})
  .then( productDoc => {
    res.status(200).json({ message: 'Product updated', productId: ObjectID(productId)});
  })
  .catch( err => {
    console.log(err);
    res.status(500).json({message: 'Something went wrong with the database!'});
  })

});

// Delete a product
// Requires logged in user
router.delete('/:id', (req, res, next) => {
  const productId = req.params.id;

  const db = getDB().db();
  db.collection('products').deleteOne({_id: ObjectID(productId)})
  .then( result => {
    res.status(200).json({ message: 'Product deleted', productId: ObjectID(productId) });
  })
  .catch( err => {
    console.log(err);
    res.status(500).json({message: 'Somethig went wrong with the database!'});
  })
});

module.exports = router;
