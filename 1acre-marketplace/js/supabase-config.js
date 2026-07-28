// ========================================================
// 1Acre - Supabase Configuration & Fallback State Manager
// ========================================================

const SUPABASE_URL = "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

// Initialize Data Store in LocalStorage if not present
(function initStore() {
  // Version bump: if seed data changed, reset to get new district listings
  const DATA_VERSION = '2.0';
  if (localStorage.getItem('1acre_data_version') !== DATA_VERSION) {
    localStorage.removeItem('1acre_properties');
    localStorage.setItem('1acre_data_version', DATA_VERSION);
  }

  if (!localStorage.getItem('1acre_properties')) {
    localStorage.setItem('1acre_properties', JSON.stringify(window.seedProperties || []));
  }
  if (!localStorage.getItem('1acre_blogs')) {
    localStorage.setItem('1acre_blogs', JSON.stringify(window.seedBlogs || []));
  }
  if (!localStorage.getItem('1acre_favorites')) {
    localStorage.setItem('1acre_favorites', JSON.stringify(['prop-101', 'prop-102']));
  }
  if (!localStorage.getItem('1acre_inquiries')) {
    localStorage.setItem('1acre_inquiries', JSON.stringify([
      {
        id: "inq-1",
        property_id: "prop-101",
        property_title: "12 Acre Prime Agriculture Land near Rohtak MDU Bypass",
        buyer_name: "Amit Sharma",
        buyer_phone: "+91 98765 43210",
        buyer_email: "amit.sharma@example.com",
        message: "Interested in buying 5 acres out of 12. Please share exact registry details and visit availability.",
        status: "new",
        created_at: "2026-07-26"
      }
    ]));
  }
  if (!localStorage.getItem('1acre_visits')) {
    localStorage.setItem('1acre_visits', JSON.stringify([
      {
        id: "vis-1",
        property_id: "prop-102",
        property_title: "Luxury 2-Acre Gated Farm House near Sohna Road, Gurgaon",
        buyer_name: "Vikram Malhotra",
        buyer_phone: "+91 99100 88776",
        preferred_date: "2026-08-02",
        preferred_time: "11:00 AM",
        status: "scheduled"
      }
    ]));
  }
  if (!localStorage.getItem('1acre_current_role')) {
    localStorage.setItem('1acre_current_role', 'buyer'); // 'buyer', 'seller', 'admin'
  }
})();

window.db = {
  getProperties: function() {
    return JSON.parse(localStorage.getItem('1acre_properties') || '[]');
  },
  getPropertyById: function(id) {
    const list = this.getProperties();
    return list.find(p => p.id === id);
  },
  addProperty: function(property) {
    const list = this.getProperties();
    property.id = 'prop-' + Date.now();
    property.created_at = new Date().toISOString().split('T')[0];
    property.status = 'pending'; // Requires admin approval
    property.verification_status = false;
    list.unshift(property);
    localStorage.setItem('1acre_properties', JSON.stringify(list));
    return property;
  },
  updatePropertyStatus: function(id, status, verifyBadge) {
    const list = this.getProperties();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (typeof verifyBadge === 'boolean') {
        list[idx].verification_status = verifyBadge;
      }
      localStorage.setItem('1acre_properties', JSON.stringify(list));
    }
  },
  deleteProperty: function(id) {
    let list = this.getProperties();
    list = list.filter(p => p.id !== id);
    localStorage.setItem('1acre_properties', JSON.stringify(list));
  },
  getFavorites: function() {
    return JSON.parse(localStorage.getItem('1acre_favorites') || '[]');
  },
  toggleFavorite: function(id) {
    let favs = this.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(fId => fId !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem('1acre_favorites', JSON.stringify(favs));
    return favs.includes(id);
  },
  addInquiry: function(inquiry) {
    const inqs = JSON.parse(localStorage.getItem('1acre_inquiries') || '[]');
    inquiry.id = 'inq-' + Date.now();
    inquiry.created_at = new Date().toISOString().split('T')[0];
    inquiry.status = 'new';
    inqs.unshift(inquiry);
    localStorage.setItem('1acre_inquiries', JSON.stringify(inqs));
    return inquiry;
  },
  getInquiries: function() {
    return JSON.parse(localStorage.getItem('1acre_inquiries') || '[]');
  },
  addVisit: function(visit) {
    const visits = JSON.parse(localStorage.getItem('1acre_visits') || '[]');
    visit.id = 'vis-' + Date.now();
    visit.status = 'scheduled';
    visits.unshift(visit);
    localStorage.setItem('1acre_visits', JSON.stringify(visits));
    return visit;
  },
  getVisits: function() {
    return JSON.parse(localStorage.getItem('1acre_visits') || '[]');
  },
  getBlogs: function() {
    return JSON.parse(localStorage.getItem('1acre_blogs') || '[]');
  },
  addBlog: function(blog) {
    const blogs = this.getBlogs();
    blog.id = 'blog-' + Date.now();
    blog.created_at = new Date().toISOString().split('T')[0];
    blogs.unshift(blog);
    localStorage.setItem('1acre_blogs', JSON.stringify(blogs));
    return blog;
  }
};
