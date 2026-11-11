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
  // Set to "" to hide the counter.
  weddingDate: "2021-11-29",

  // Shown under the date as you scroll past the opening, and in the moving band
  place: "Kayamkulam, Kerala",

  // Full-width photo behind the names (landscape, about 2400px wide)
  hero: "assets/photos/hero.jpg",

  // The two of you
  people: [
    {
      name: "Nidhil",
      line: "Turning everyday moments into gold. Travel, life, stories.",
      photo: "assets/photos/nidhil.jpg",
      instagram: { handle: "@thenimoverse", url: "https://www.instagram.com/thenimoverse/" },
      // Favourite posts: a picture and the link to the post
      posts: [
        { img: "assets/photos/n-post-1.jpg", url: "https://www.instagram.com/p/CTQExaiB1CK/" },
        { img: "assets/photos/n-post-2.jpg", url: "https://www.instagram.com/p/Bmp8AO3gPrh/" },
        { img: "assets/photos/n-post-3.jpg", url: "https://www.instagram.com/p/CTPBhQtlCod/" }
      ]
    },
    {
      name: "Meenu",
      line: "Saree, travel, vibes.",
      photo: "assets/photos/meenu.jpg",
      instagram: { handle: "@its.simplymeenu", url: "https://www.instagram.com/its.simplymeenu/" },
      posts: [
        { img: "assets/photos/m-post-1.jpg", url: "https://www.instagram.com/p/DfkGMgIGnBW/" },
        { img: "assets/photos/m-post-2.jpg", url: "https://www.instagram.com/p/DapBL_qmi9n/" },
        { img: "assets/photos/m-post-3.jpg", url: "https://www.instagram.com/p/DTu3dMfk_Q0/" }
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
    "assets/photos/still-8.jpg",
    "assets/photos/still-9.jpg",
    "assets/photos/still-10.jpg"
  ],

  // End credits
  fin: "To be continued",
  credits: [
    ["Starring", "Nidhil & Meenu"],
    ["Supporting cast", "Add family and friends here"],
    ["Married at", "Mikas Convention Centre, Kayamkulam, Kerala"],
    ["Wedding films by", "Foxeye Media & Frames For You"]
  ],
  footNote: "Made with love by the two of us."
};
