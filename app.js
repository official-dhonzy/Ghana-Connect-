// Ghana Connect - Main Application Logic
// ========================================

// Initialize Firebase (YOUR CONFIG)
const firebaseConfig = {
  apiKey: "AIzaSyC2oA_nKUvGTf5dEvTvotJw1zaige",
  authDomain: "ghana-connect-fc3e2.firebaseapp.com",
  projectId: "ghana-connect-fc3e2",
  storageBucket: "ghana-connect-fc3e2.firebasestorage.app",
  messagingSenderId: "835108806293",
  appId: "1:835108806293:web:7f5ee41e10b4272af4c59c",
  measurementId: "G-XRVBJQ52XP"
};

// Initialize Firebase
let db, auth;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
} catch (error) {
    console.log("Firebase initialization note:", error.message);
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// Register new user
async function registerUser(email, password, username) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user profile to Firestore
        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email: email,
            username: username,
            createdAt: new Date(),
            verified: false,
            ratings: 0,
            region: "",
            bio: "",
            profileImage: ""
        });

        // Update profile
        await user.updateProfile({
            displayName: username
        });

        console.log("User registered successfully:", user.email);
        return { success: true, user: user };
    } catch (error) {
        console.error("Registration error:", error.message);
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("User logged in:", userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login error:", error.message);
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await auth.signOut();
        console.log("User logged out");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout error:", error.message);
    }
}

// Check auth state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User logged in:", user.email);
        updateAuthUI(user);
        loadUserData(user.uid);
    } else {
        console.log("User not logged in");
        updateAuthUI(null);
    }
});

function updateAuthUI(user) {
    const authElements = document.querySelectorAll('[data-auth="require-login"]');
    const authButtons = document.querySelectorAll('[data-auth="button"]');

    if (user) {
        authElements.forEach(el => el.style.display = 'block');
        authButtons.forEach(btn => {
            btn.textContent = 'Logout';
            btn.onclick = logoutUser;
        });
        if (document.getElementById('user-name')) {
            document.getElementById('user-name').textContent = user.displayName || user.email;
        }
    } else {
        authElements.forEach(el => el.style.display = 'none');
        authButtons.forEach(btn => {
            btn.textContent = 'Login';
            btn.onclick = () => window.location.href = 'login.html';
        });
    }
}

// ========================================
// POSTS/LISTINGS FUNCTIONS
// ========================================

// Create new post
async function createPost(title, description, category, region, price = null, image = null) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User must be logged in to create a post");
        }

        const postData = {
            title: title,
            description: description,
            category: category,
            region: region,
            price: price || 0,
            image: image || null,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: new Date(),
            views: 0,
            favorites: 0,
            status: "active"
        };

        const docRef = await db.collection("posts").add(postData);
        console.log("Post created with ID:", docRef.id);
        return { success: true, postId: docRef.id };
    } catch (error) {
        console.error("Error creating post:", error.message);
        return { success: false, error: error.message };
    }
}

// Get all posts
async function getPosts(category = null, region = null, limit = 20) {
    try {
        let query = db.collection("posts").where("status", "==", "active");

        if (category) {
            query = query.where("category", "==", category);
        }
        if (region) {
            query = query.where("region", "==", region);
        }

        const snapshot = await query.orderBy("createdAt", "desc").limit(limit).get();
        const posts = [];

        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        return [];
    }
}

// Get single post
async function getPost(postId) {
    try {
        const doc = await db.collection("posts").doc(postId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching post:", error.message);
        return null;
    }
}

// Update post views
async function incrementPostViews(postId) {
    try {
        await db.collection("posts").doc(postId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error("Error updating views:", error.message);
    }
}

// Delete post
async function deletePost(postId) {
    try {
        const user = auth.currentUser;
        const post = await getPost(postId);

        if (post.authorId !== user.uid) {
            throw new Error("You can only delete your own posts");
        }

        await db.collection("posts").doc(postId).delete();
        console.log("Post deleted");
        return { success: true };
    } catch (error) {
        console.error("Error deleting post:", error.message);
        return { success: false, error: error.message };
    }
}

// ========================================
// MESSAGING FUNCTIONS
// ========================================

// Send message
async function sendMessage(recipientId, message) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in");

        const conversationId = [user.uid, recipientId].sort().join("_");

        await db.collection("messages").add({
            conversationId: conversationId,
            senderId: user.uid,
            recipientId: recipientId,
            message: message,
            timestamp: new Date(),
            read: false
        });

        console.log("Message sent");
        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error.message);
        return { success: false, error: error.message };
    }
}

// Get conversation
async function getConversation(recipientId) {
    try {
        const user = auth.currentUser;
        const conversationId = [user.uid, recipientId].sort().join("_");

        const snapshot = await db.collection("messages")
            .where("conversationId", "==", conversationId)
            .orderBy("timestamp", "asc")
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return messages;
    } catch (error) {
        console.error("Error fetching conversation:", error.message);
        return [];
    }
}

// Get conversations list
async function getConversations() {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const snapshot = await db.collection("messages")
            .where("senderId", "==", user.uid)
            .orderBy("timestamp", "desc")
            .get();

        const conversationMap = new Map();
        snapshot.forEach(doc => {
            const data = doc.data();
            const key = data.recipientId;
            if (!conversationMap.has(key)) {
                conversationMap.set(key, data);
            }
        });

        return Array.from(conversationMap.values());
    } catch (error) {
        console.error("Error fetching conversations:", error.message);
        return [];
    }
}

// ========================================
// USER PROFILE FUNCTIONS
// ========================================

// Load user data
async function loadUserData(userId) {
    try {
        const doc = await db.collection("users").doc(userId).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error("Error loading user data:", error.message);
        return null;
    }
}

// Update user profile
async function updateUserProfile(userId, data) {
    try {
        await db.collection("users").doc(userId).update(data);
        console.log("Profile updated");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error.message);
        return { success: false, error: error.message };
    }
}

// Get user by ID
async function getUser(userId) {
    try {
        const doc = await db.collection("users").doc(userId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching user:", error.message);
        return null;
    }
}

// ========================================
// FAVORITES FUNCTIONS
// ========================================

// Add to favorites
async function addToFavorites(postId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be logged in");

        await db.collection("favorites").add({
            userId: user.uid,
            postId: postId,
            createdAt: new Date()
        });

        console.log("Added to favorites");
        return { success: true };
    } catch (error) {
        console.error("Error adding to favorites:", error.message);
        return { success: false, error: error.message };
    }
}

// Get favorites
async function getFavorites() {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const snapshot = await db.collection("favorites")
            .where("userId", "==", user.uid)
            .get();

        const favorites = [];
        for (const doc of snapshot.docs) {
            const post = await getPost(doc.data().postId);
            if (post) favorites.push(post);
        }

        return favorites;
    } catch (error) {
        console.error("Error fetching favorites:", error.message);
        return [];
    }
}

// ========================================
// NOTIFICATIONS FUNCTIONS
// ========================================

// Send notification
async function sendNotification(userId, title, message, type = "info") {
    try {
        await db.collection("notifications").add({
            userId: userId,
            title: title,
            message: message,
            type: type,
            read: false,
            createdAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending notification:", error.message);
        return { success: false, error: error.message };
    }
}

// Get notifications
async function getNotifications() {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const snapshot = await db.collection("notifications")
            .where("userId", "==", user.uid)
            .where("read", "==", false)
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        return [];
    }
}

// ========================================
// REVIEWS & RATINGS
// ========================================

// Add review
async function addReview(userId, rating, comment) {
    try {
        const reviewer = auth.currentUser;
        if (!reviewer) throw new Error("User must be logged in");

        await db.collection("reviews").add({
            userId: userId,
            reviewerId: reviewer.uid,
            reviewerName: reviewer.displayName || reviewer.email,
            rating: rating,
            comment: comment,
            createdAt: new Date()
        });

        console.log("Review added");
        return { success: true };
    } catch (error) {
        console.error("Error adding review:", error.message);
        return { success: false, error: error.message };
    }
}

// Get reviews
async function getReviews(userId) {
    try {
        const snapshot = await db.collection("reviews")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        return [];
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Search posts
async function searchPosts(query) {
    try {
        const snapshot = await db.collection("posts")
            .where("status", "==", "active")
            .get();

        const results = [];
        snapshot.forEach(doc => {
            const post = doc.data();
            if (post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.description.toLowerCase().includes(query.toLowerCase())) {
                results.push({ id: doc.id, ...post });
            }
        });

        return results;
    } catch (error) {
        console.error("Error searching posts:", error.message);
        return [];
    }
}

// Get posts by category
async function getPostsByCategory(category) {
    return getPosts(category);
}

// Get posts by region
async function getPostsByRegion(region) {
    return getPosts(null, region);
}

// Get user posts
async function getUserPosts(userId) {
    try {
        const snapshot = await db.collection("posts")
            .where("authorId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error.message);
        return [];
    }
}

// Ghana regions
const GHANA_REGIONS = [
    "Greater Accra",
    "Ashanti",
    "Volta",
    "Eastern",
    "Central",
    "Western",
    "Northern",
    "Bono",
    "Oti",
    "Upper East",
    "Upper West",
    "Ahafo"
];

// Categories
const CATEGORIES = [
    { id: "jobs", name: "Jobs", icon: "💼" },
    { id: "housing", name: "Housing", icon: "🏠" },
    { id: "services", name: "Services", icon: "🔧" },
    { id: "farming", name: "Farming", icon: "🌱" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "marketplace", name: "Marketplace", icon: "🛒" }
];

// Export functions for use in HTML pages
window.GhanaConnect = {
    registerUser,
    loginUser,
    logoutUser,
    createPost,
    getPosts,
    getPost,
    deletePost,
    sendMessage,
    getConversation,
    getConversations,
    loadUserData,
    updateUserProfile,
    getUser,
    addToFavorites,
    getFavorites,
    sendNotification,
    getNotifications,
    addReview,
    getReviews,
    searchPosts,
    getPostsByCategory,
    getPostsByRegion,
    getUserPosts,
    GHANA_REGIONS,
    CATEGORIES
};

console.log("Ghana Connect App Initialized");
    
