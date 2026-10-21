const { load, save } = require('../utils/storage');

const KEY = 'posts';

// In-memory array, hydrated from storage on startup.
const posts = load(KEY);
let nextId = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;

const persist = () => save(KEY, posts);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function listPosts(req, res) {
  res.status(200).json(posts);
}

function getPost(req, res) {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.status(200).json(post);
}

function createPost(req, res) {
  const { title, content } = req.body || {};

  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const now = new Date().toISOString();
  const post = {
    id: nextId++,
    authorId: req.user.id, // always from the token, never from the body
    title: title.trim(),
    content: content.trim(),
    created_at: now,
    updated_at: now,
  };
  posts.push(post);
  persist();

  res.status(201).json(post);
}

function updatePost(req, res) {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Ownership check: post owner or admin
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only edit your own posts' });
  }

  const { title, content } = req.body || {};
  const hasTitle = title !== undefined;
  const hasContent = content !== undefined;

  if (!hasTitle && !hasContent) {
    return res.status(400).json({ error: 'Provide a title and/or content to update' });
  }
  if ((hasTitle && !isNonEmptyString(title)) || (hasContent && !isNonEmptyString(content))) {
    return res.status(400).json({ error: 'title and content must be non-empty strings' });
  }

  if (hasTitle) post.title = title.trim();
  if (hasContent) post.content = content.trim();
  post.updated_at = new Date().toISOString();
  persist();

  res.status(200).json(post);
}

function deletePost(req, res) {
  const index = posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });

  posts.splice(index, 1);
  persist();

  res.status(200).json({ message: 'Post deleted' });
}

function myPosts(req, res) {
  res.status(200).json(posts.filter((p) => p.authorId === req.user.id));
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, myPosts };
