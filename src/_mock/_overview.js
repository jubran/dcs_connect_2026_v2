import { _mock } from "./_mock";

// APP
// ----------------------------------------------------------------------

export const _JPP2 = [
  {
    id: 1,
    name: "units",
    shortcut: "/path/to/icon2.png",
    price: 0,
    downloaded: 1500,
    size: 1024,
    ratingNumber: 4.5,
    totalReviews: 120,
  },
  {
    id: 2,
    name: "fts_c",
    shortcut: "/path/to/icon2.png",
    price: 9.99,
    downloaded: 2500,
    size: 2048,
    ratingNumber: 4.0,
    totalReviews: 200,
  },
  {
    id: 3,
    name: "fts_d",
    shortcut: "/path/to/icon2.png",
    price: 9.99,
    downloaded: 2500,
    size: 2048,
    ratingNumber: 4.0,
    totalReviews: 200,
  },
  {
    id: 4,
    name: "tanks_c",
    shortcut: "/path/to/icon2.png",
    price: 9.99,
    downloaded: 2500,
    size: 2048,
    ratingNumber: 4.0,
    totalReviews: 200,
  },
  {
    id: 5,
    name: "tanks_d",
    shortcut: "/path/to/icon2.png",
    price: 9.99,
    downloaded: 2500,
    size: 2048,
    ratingNumber: 4.0,
    totalReviews: 200,
  },
  {
    id: 6,
    name: "fus",
    shortcut: "/path/to/icon2.png",
    price: 9.99,
    downloaded: 2500,
    size: 2048,
    ratingNumber: 4.0,
    totalReviews: 200,
  },
];
// export const _locations = [{name:"UNITS"}, {name:"FTS"},{name:"FUS"},{ name:"TANKS"}];

export const _JPP = [...Array(4)].map((_, index) => {
  const locations = ["UNITS", "FTS", "FUS", "TANKS"][index];

  return {
    id: _mock.id(index),
    name: locations,
  };
});
export const _appRelated = [
  "Chrome",
  "Drive",
  "Dropbox",
  "Evernote",
  "Github",
].map((name, index) => {
  const system = [2, 4].includes(index) ? "Windows" : "Mac";

  const price = [2, 4].includes(index) ? _mock.number.price(index) : 0;

  const shortcut =
    (name === "Chrome" && "/assets/icons/app/ic_chrome.svg") ||
    (name === "Drive" && "/assets/icons/app/ic_drive.svg") ||
    (name === "Dropbox" && "/assets/icons/app/ic_dropbox.svg") ||
    (name === "Evernote" && "/assets/icons/app/ic_evernote.svg") ||
    "/assets/icons/app/ic_github.svg";

  return {
    id: _mock.id(index),
    name,
    price,
    system,
    shortcut,
    ratingNumber: _mock.number.rating(index),
    totalReviews: _mock.number.nativeL(index),
  };
});

export const _appInstalled = [
  "Germany",
  "England",
  "France",
  "Korean",
  "USA",
].map((name, index) => ({
  id: _mock.id(index),
  name,
  android: _mock.number.nativeL(index),
  windows: _mock.number.nativeL(index + 1),
  apple: _mock.number.nativeL(index + 2),
  flag: [
    "flagpack:de",
    "flagpack:gb-nir",
    "flagpack:fr",
    "flagpack:kr",
    "flagpack:us",
  ][index],
}));

export const _locations = {
  // units : ["GT16","GT19","GT20","GT21","GT22","GT23","GT24","GT25","GT26","GT27","GT28","GT29","GT30"]
  name: {
    units: [
      "GT16",
      "GT19",
      "GT20",
      "GT21",
      "GT22",
      "GT23",
      "GT24",
      "GT25",
      "GT26",
      "GT27",
      "GT28",
      "GT29",
      "GT30",
      "BS#1",
      "BS#2",
      "DE-415",
    ],
    dieselTank: ["TANK#6", "TANK#7", "TANK#8", "TANK#9", "TANK#11"],
    crudeTank: [
      "TANK#10",
      "TANK#12",
      "TANK#13",
      "TANK#14",
      "TANK#15",
      "TANK#16",
      "TANK#17",
      "TANK#18",
    ],
    cotp: [],
    fts_c: [
      "SKID#1 SP#1",
      "SKID#1 SP#2",
      "SKID#1 SP#3",
      "SKID#1 SP#4",
      "SKID#1 SP#5",
      "SKID#2 SP#1",
      "SKID#2 SP#2",
      "SKID#2 SP#3",
      "SKID#2 SP#4",
    ],
    fts_1: [
      "SKID#1 SP#1",
      "SKID#1 SP#2",
      "SKID#1 SP#3",
      "SKID#1 SP#4",
      "SKID#1 SP#5",
    ],
    fts_2: ["SKID#2 SP#1", "SKID#2 SP#2", "SKID#2 SP#3", "SKID#2 SP#4"],
    fts_d: ["SP#1", "SP#2", "SP#3", "SP#4", "SP#5", "SP#6"],
    fus: [
      "FUS#1",
      "FUS#2",
      "FUS#3",
      "FUS#4",
      "FUS#5",
      "FUS#6",
      "FUS#7",
      "FUS#8",
      "FUS#9(A)",
      "FUS#9(B)",
      "FUS#10(A)",
      "FUS#10(B)",
    ],
  },
};
export const _rows = [
  {
    id: 1,
    location: "GT21",
    date1: "2025-02-25",
    time1: "08:10",
    action: "GT START AS PER ASIR AND FAIL TO START",
    status1: "In Service",
    name1: "جبران حسن اليحيوي",
    flame: "390",
    fsnl: "10:01",
    synch: "10:10",
    note: "",
  },
  {
    id: 2,
    location: "GT27",
    date1: "2025-02-24",
    time1: "22:22",
    action: "GT START AS PER ASIR",
    status1: "In Service",
    name1: "جبران حسن اليحيوي",
    flame: "388",
    fsnl: "22:11",
    synch: "22:20",
    note: "",
  },
  {
    id: 3,
    location: "GT20",
    date1: "2024-06-02",
    time1: "04:15",
    action: "GT TRIP ON LOSS OF FLAME",
    status1: "Shutdown",
    name1: "جبران حسن اليحيوي",
    note: "#2231234876",
  },
  {
    id: 4,
    location: "GT30",
    date1: "2024-06-02",
    time1: "18:15",
    action:
      "gt trip on loss of flame gt trip on loss of flame gt trip on loss of flame gt trip on loss of flame ",
    status1: "Stand By",
    name1: "جبران حسن اليحيوي",
    note: "",
  },
  {
    id: 5,
    location: "SKID#1 SP#1",
    date1: "2024-01-02",
    time1: "18:15",
    action: "START",
    status1: "In Service",
    name1: "جبران حسن اليحيوي",
    note: "",
  },
];
export const _appAuthors = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  totalFavorites: _mock.number.nativeL(index),
}));

export const _appInvoices = [...Array(5)].map((_, index) => {
  const category = ["Android", "Mac", "Windows", "Android", "Mac"][index];

  const status = ["paid", "out of date", "progress", "paid", "paid"][index];

  return {
    id: _mock.id(index),
    invoiceNumber: `INV-199${index}`,
    price: _mock.number.price(index),
    category,
    status,
  };
});

export const _appFeatured = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.postTitle(index),
  description: _mock.sentence(index),
  coverUrl: _mock.image.cover(index),
}));

// ANALYTIC
// ----------------------------------------------------------------------

export const _analyticTasks = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.taskNames(index),
}));

export const _analyticPosts = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  coverUrl: _mock.image.cover(index),
  description: _mock.sentence(index),
}));

export const _analyticOrderTimeline = [...Array(5)].map((_, index) => {
  const title = [
    "1983, orders, $4220",
    "12 Invoices have been paid",
    "Order #37745 from September",
    "New order placed #XF-2356",
    "New order placed #XF-2346",
  ][index];

  return {
    id: _mock.id(index),
    title,
    type: `order${index + 1}`,
    time: _mock.time(index),
  };
});

export const _analyticTraffic = [
  {
    value: "facebook",
    label: "FaceBook",
    total: _mock.number.nativeL(1),
    icon: "eva:facebook-fill",
  },
  {
    value: "google",
    label: "Google",
    total: _mock.number.nativeL(2),
    icon: "eva:google-fill",
  },
  {
    value: "linkedin",
    label: "Linkedin",
    total: _mock.number.nativeL(3),
    icon: "eva:linkedin-fill",
  },
  {
    value: "twitter",
    label: "Twitter",
    total: _mock.number.nativeL(4),
    icon: "eva:twitter-fill",
  },
];

// ECOMMERCE
// ----------------------------------------------------------------------

export const _ecommerceSalesOverview = [
  "Total Profit",
  "Total Income",
  "Total Expenses",
].map((label, index) => ({
  label,
  totalAmount: _mock.number.price(index) * 100,
  value: _mock.number.percent(index),
}));

export const _ecommerceBestSalesman = [...Array(5)].map((_, index) => {
  const category = [
    "CAP",
    "Branded Shoes",
    "Headphone",
    "Cell Phone",
    "Earings",
  ][index];

  const flag = [
    "flagpack:de",
    "flagpack:gb-nir",
    "flagpack:fr",
    "flagpack:kr",
    "flagpack:us",
  ][index];

  return {
    id: _mock.id(index),
    flag,
    category,
    rank: `Top ${index + 1}`,
    email: _mock.email(index),
    name: _mock.fullName(index),
    totalAmount: _mock.number.price(index),
    avatarUrl: _mock.image.avatar(index + 8),
  };
});

export const _ecommerceLatestProducts = [...Array(5)].map((_, index) => {
  const colors = (index === 0 && [
    "#2EC4B6",
    "#E71D36",
    "#FF9F1C",
    "#011627",
  ]) ||
    (index === 1 && ["#92140C", "#FFCF99"]) ||
    (index === 2 && [
      "#0CECDD",
      "#FFF338",
      "#FF67E7",
      "#C400FF",
      "#52006A",
      "#046582",
    ]) ||
    (index === 3 && ["#845EC2", "#E4007C", "#2A1A5E"]) || ["#090088"];

  return {
    id: _mock.id(index),
    colors,
    name: _mock.productName(index),
    price: _mock.number.price(index),
    coverUrl: _mock.image.product(index),
    priceSale: [1, 3].includes(index) ? _mock.number.price(index) : 0,
  };
});

export const _ecommerceNewProducts = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.productName(index),
  coverUrl: _mock.image.product(index),
}));

// BANKING
// ----------------------------------------------------------------------

export const _bankingContacts = [...Array(12)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _bankingCreditCard = [
  {
    id: _mock.id(2),
    balance: 23432.03,
    cardType: "mastercard",
    cardHolder: _mock.fullName(2),
    cardNumber: "**** **** **** 3640",
    cardValid: "11/22",
  },
  {
    id: _mock.id(3),
    balance: 18000.23,
    cardType: "visa",
    cardHolder: _mock.fullName(3),
    cardNumber: "**** **** **** 8864",
    cardValid: "11/25",
  },
  {
    id: _mock.id(4),
    balance: 2000.89,
    cardType: "mastercard",
    cardHolder: _mock.fullName(4),
    cardNumber: "**** **** **** 7755",
    cardValid: "11/22",
  },
];

export const _bankingRecentTransitions = [
  {
    id: _mock.id(2),
    name: _mock.fullName(2),
    avatarUrl: _mock.image.avatar(2),
    type: "Income",
    message: "Receive money from",
    category: "Annette Black",
    date: _mock.time(2),
    status: "progress",
    amount: _mock.number.price(2),
  },
  {
    id: _mock.id(3),
    name: _mock.fullName(3),
    avatarUrl: _mock.image.avatar(3),
    type: "Expenses",
    message: "Payment for",
    category: "Courtney Henry",
    date: _mock.time(3),
    status: "completed",
    amount: _mock.number.price(3),
  },
  {
    id: _mock.id(4),
    name: _mock.fullName(4),
    avatarUrl: _mock.image.avatar(4),
    type: "Receive",
    message: "Payment for",
    category: "Theresa Webb",
    date: _mock.time(4),
    status: "failed",
    amount: _mock.number.price(4),
  },
  {
    id: _mock.id(5),
    name: null,
    avatarUrl: null,
    type: "Expenses",
    message: "Payment for",
    category: "Beauty & Health",
    date: _mock.time(5),
    status: "completed",
    amount: _mock.number.price(5),
  },
  {
    id: _mock.id(6),
    name: null,
    avatarUrl: null,
    type: "Expenses",
    message: "Payment for",
    category: "Books",
    date: _mock.time(6),
    status: "progress",
    amount: _mock.number.price(6),
  },
];

// BOOKING
// ----------------------------------------------------------------------

export const _bookings = [...Array(5)].map((_, index) => {
  const status = ["Paid", "Paid", "Pending", "Cancelled", "Paid"][index];

  const customer = {
    avatarUrl: _mock.image.avatar(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
  };

  const destination = [...Array(5)].map((__, _index) => ({
    name: _mock.tourName(_index + 1),
    coverUrl: _mock.image.travel(_index + 1),
  }))[index];

  return {
    id: _mock.id(index),
    destination,
    status,
    customer,
    checkIn: _mock.time(index),
    checkOut: _mock.time(index),
  };
});

export const _bookingsOverview = [...Array(3)].map((_, index) => ({
  status: ["Pending", "Canceled", "Sold"][index],
  quantity: _mock.number.nativeL(index),
  value: _mock.number.percent(index),
}));

export const _bookingReview = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  postedAt: _mock.time(index),
  rating: _mock.number.rating(index),
  avatarUrl: _mock.image.avatar(index),
  description: _mock.description(index),
  tags: ["Great Sevice", "Recommended", "Best Price"],
}));

export const _bookingNew = [...Array(5)].map((_, index) => ({
  guests: "3-5",
  id: _mock.id(index),
  bookedAt: _mock.time(index),
  duration: "3 days 2 nights",
  isHot: _mock.boolean(index),
  name: _mock.fullName(index),
  price: _mock.number.price(index),
  avatarUrl: _mock.image.avatar(index),
  coverUrl: _mock.image.travel(index),
}));
