/* ------------------------------------------------------------------
   EVERYTHING PUBLIC ON THE SITE IS EDITED HERE.
   Change the text between the quotes, save, push. That's it.

   (The private part: journey, wedding photos, highlights. That lives
   in private/content.json and is locked with tools/lock.mjs.)
------------------------------------------------------------------- */
window.SITE = {
  names: ["Nidhil", "Meenu"],

  // Small line above the names, and the line below them
  preTitle: "A love story, still running",
  tagline: "Two people, one long road, and a great many photographs.",

  // Your wedding date, YYYY-MM-DD. Drives the "Married for" counter.
  // Set to "" to hide the counter.          <-- PLACEHOLDER, CHANGE ME
  weddingDate: "2021-01-01",

  // Full-width photo behind the names (landscape, about 2400px wide)
  hero: "assets/photos/hero.jpg",

  // The two of you
  people: [
    {
      name: "Nidhil",
      line: "A line or two about Nidhil goes here. What he does, what he loves, what Meenu would say about him.",
      photo: "assets/photos/nidhil.jpg",
      instagram: { handle: "@add_nidhil_handle", url: "https://www.instagram.com/" },
      // Favourite posts: a picture and the link to the post
      posts: [
        { img: "assets/photos/n-post-1.jpg", url: "https://www.instagram.com/" },
        { img: "assets/photos/n-post-2.jpg", url: "https://www.instagram.com/" },
        { img: "assets/photos/n-post-3.jpg", url: "https://www.instagram.com/" }
      ]
    },
    {
      name: "Meenu",
      line: "A line or two about Meenu goes here. What she does, what she loves, what Nidhil would say about her.",
      photo: "assets/photos/meenu.jpg",
      instagram: { handle: "@add_meenu_handle", url: "https://www.instagram.com/" },
      posts: [
        { img: "assets/photos/m-post-1.jpg", url: "https://www.instagram.com/" },
        { img: "assets/photos/m-post-2.jpg", url: "https://www.instagram.com/" },
        { img: "assets/photos/m-post-3.jpg", url: "https://www.instagram.com/" }
      ]
    }
  ],

  // The moving film strip. These photos are PUBLIC. Add as many as you like.
  stillsLede: "A few frames anyone can see. The rest is behind the ticket below.",
  stills: [
    "assets/photos/still-1.jpg",
    "assets/photos/still-2.jpg",
    "assets/photos/still-3.jpg",
    "assets/photos/still-4.jpg",
    "assets/photos/still-5.jpg",
    "assets/photos/still-6.jpg",
    "assets/photos/still-7.jpg",
    "assets/photos/still-8.jpg"
  ],

  // End credits
  fin: "To be continued",
  credits: [
    ["Starring", "Nidhil & Meenu"],
    ["Supporting cast", "Add family and friends here"],
    ["Filmed on location in", "Add the places that matter to you"],
    ["Wedding films by", "Foxeye Media & Frames For You"]
  ],
  footNote: "Made with love by the two of us."
};
