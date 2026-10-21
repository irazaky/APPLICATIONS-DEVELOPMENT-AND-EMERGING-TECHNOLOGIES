const express = require('express');
const controller = require('../controllers/postController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Public
router.get('/posts', controller.listPosts);
router.get('/posts/:id', controller.getPost);

// Protected (authenticate is applied per route because the GETs above are public)
router.get('/me/posts', authenticate, controller.myPosts);
router.post('/posts', authenticate, authorize('author', 'admin'), controller.createPost);
router.put('/posts/:id', authenticate, authorize('author', 'admin'), controller.updatePost);
router.delete('/posts/:id', authenticate, authorize('admin'), controller.deletePost);

module.exports = router;
